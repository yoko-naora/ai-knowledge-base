// Cloudflare Pages Function: admin-customers
// GET /api/admin-customers?key=xxx
// POST /api/admin-customers?key=xxx&action=cancel&email=xxx
//
// SECURITY: ADMIN_KEY must be set in Cloudflare Pages env vars.
// No default value — missing env var → function refuses to run.
//
// TEST:
//   curl -s "https://kb.snsaladdin.com/api/admin-customers?key=WRONG" → 401
//   curl -s "https://kb.snsaladdin.com/api/admin-customers?key=CORRECT" → 200 with customers
//   预期: phone numbers masked, correct key needed

import Stripe from "stripe";

// In-memory rate limiting (resets on cold start)
const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const rateStore = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateStore.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    rateStore.set(ip, { windowStart: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > MAX_REQUESTS;
}

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "https://kb.snsaladdin.com",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function maskPhone(phone) {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.length <= 4) return "****";
  const prefix = cleaned.startsWith("+") ? cleaned.slice(0, 3) : "";
  const last4 = cleaned.slice(-4);
  return `${prefix}****${last4}`;
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const key = url.searchParams.get("key") || "";
  const adminKey = context.env.ADMIN_KEY;

  // SECURITY: No default key — must be set in Cloudflare env vars
  if (!adminKey) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500, headers: corsHeaders() });
  }

  if (key !== adminKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders() });
  }

  // Rate limit
  const clientIp = context.request.headers.get("cf-connecting-ip") || "unknown";
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), { status: 429, headers: corsHeaders() });
  }

  const stripeKey = context.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: "Stripe not configured" }), { status: 500, headers: corsHeaders() });
  }

  const stripe = new Stripe(stripeKey);

  try {
    const customers = [];
    let hasMore = true;
    let startingAfter;

    while (hasMore) {
      const list = await stripe.customers.list({ limit: 100, starting_after: startingAfter });
      for (const cus of list.data) {
        const subs = await stripe.subscriptions.list({ customer: cus.id, limit: 5, status: "all", expand: ["data.items.data.price"] });
        const activeSub = subs.data.find(s => s.status === "active" || s.status === "trialing");
        const allEnded = subs.data.length > 0 && subs.data.every(s => s.status === "canceled" || s.status === "incomplete_expired" || s.status === "unpaid");

        let productName = null, plan = null, status = "none", planAmount = 0, actualPaid = 0, subtotal = 0, tax = 0, purchasedAt = null, currentPeriodEnd = null;

        if (activeSub) {
          status = activeSub.status === "trialing" ? "trialing" : "active";
          planAmount = activeSub.items.data.reduce((sum, item) => sum + ((item.price?.unit_amount || 0) * (item.quantity || 1)), 0);
          plan = planAmount <= 5000 ? "monthly" : "yearly";
          purchasedAt = new Date(activeSub.created * 1000).toISOString();
          currentPeriodEnd = activeSub.current_period_end;
          const productId = activeSub.items.data[0]?.price?.product;
          if (typeof productId === "string" && productId) {
            try { const prod = await stripe.products.retrieve(productId); productName = prod.name; } catch { productName = productId; }
          }
        } else if (allEnded) {
          status = "ended";
          const lastSub = subs.data[0];
          planAmount = lastSub.items.data.reduce((sum, item) => sum + ((item.price?.unit_amount || 0) * (item.quantity || 1)), 0);
          plan = planAmount <= 5000 ? "monthly" : "yearly";
          purchasedAt = new Date(lastSub.created * 1000).toISOString();
          const productId = lastSub.items.data[0]?.price?.product;
          if (typeof productId === "string" && productId) {
            try { const prod = await stripe.products.retrieve(productId); productName = prod.name; } catch { productName = productId; }
          }
        }

        let latestPayment = null;
        try {
          const paymentIntents = await stripe.paymentIntents.list({ customer: cus.id, limit: 10 });
          let bestPI = null, bestPIAmount = -1;
          for (const pi of paymentIntents.data) {
            const amt = pi.amount_received || pi.amount || 0;
            if (amt > bestPIAmount && pi.status === "succeeded") { bestPIAmount = amt; bestPI = pi; }
          }
          if (bestPI) {
            latestPayment = new Date(bestPI.created * 1000).toISOString();
            actualPaid = bestPI.amount_received || bestPI.amount || 0;
          }

          const invoices = await stripe.invoices.list({ customer: cus.id, limit: 10 });
          for (const inv of invoices.data) {
            if (inv.subtotal > 0 && subtotal === 0) subtotal = inv.subtotal;
            if (inv.tax > 0 && tax === 0) tax = inv.tax;
            if (!bestPI) {
              const amt = inv.amount_paid || inv.total || inv.amount_due || 0;
              if (amt > actualPaid) { actualPaid = amt; if (!latestPayment) latestPayment = new Date(inv.created * 1000).toISOString(); }
            }
          }
          if (actualPaid === 0 && subtotal > 0) { actualPaid = subtotal + tax; }
        } catch { /* skip */ }

        // PII: mask phone number
        const rawPhone = cus.phone || "";

        customers.push({
          name: cus.name || "", email: cus.email || "", phone: maskPhone(rawPhone),
          product: productName || "",
          plan, status,
          plan_amount: planAmount > 0 ? planAmount : 0,
          actual_paid: actualPaid,
          subtotal: subtotal,
          tax: tax,
          purchased_at: purchasedAt,
          current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
          latest_payment: latestPayment,
        });
      }
      hasMore = list.has_more;
      startingAfter = list.data.length > 0 ? list.data[list.data.length - 1].id : undefined;
    }

    customers.sort((a, b) => {
      if ((a.status === "active" || a.status === "trialing") && !(b.status === "active" || b.status === "trialing")) return -1;
      if (!(a.status === "active" || a.status === "trialing") && (b.status === "active" || b.status === "trialing")) return 1;
      return (b.purchased_at || "").localeCompare(a.purchased_at || "");
    });

    return new Response(JSON.stringify({ customers, total: customers.length }), { status: 200, headers: corsHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: corsHeaders() });
  }
}

// POST /api/admin-customers?key=xxx&action=cancel&email=xxx
export async function onRequestPost(context) {
  const url = new URL(context.request.url);
  const key = url.searchParams.get("key") || "";
  const action = url.searchParams.get("action") || "";
  const email = url.searchParams.get("email") || "";
  const adminKey = context.env.ADMIN_KEY;

  if (!adminKey) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500, headers: corsHeaders() });
  }

  if (key !== adminKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders() });
  }

  const stripeKey = context.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: "Stripe not configured" }), { status: 500, headers: corsHeaders() });
  }

  const stripe = new Stripe(stripeKey);

  try {
    if (action === "cancel" && email) {
      const customers = await stripe.customers.list({ email, limit: 5 });
      if (customers.data.length === 0) {
        return new Response(JSON.stringify({ error: "Customer not found", email }), { status: 404, headers: corsHeaders() });
      }

      const cus = customers.data[0];
      let subs = await stripe.subscriptions.list({ customer: cus.id, limit: 5, status: "active" });
      if (subs.data.length === 0) {
        subs = await stripe.subscriptions.list({ customer: cus.id, limit: 5, status: "trialing" });
      }

      if (subs.data.length === 0) {
        return new Response(JSON.stringify({ error: "No active subscription found", email, customer_id: cus.id }), { status: 404, headers: corsHeaders() });
      }

      const sub = subs.data[0];
      const canceled = await stripe.subscriptions.cancel(sub.id);

      return new Response(JSON.stringify({
        ok: true, action: "canceled", email, customer_id: cus.id, subscription_id: sub.id,
        status: canceled.status,
        canceled_at: canceled.canceled_at ? new Date(canceled.canceled_at * 1000).toISOString() : null,
      }), { status: 200, headers: corsHeaders() });
    }

    return new Response(JSON.stringify({ error: "Unknown action", action }), { status: 400, headers: corsHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: corsHeaders() });
  }
}
