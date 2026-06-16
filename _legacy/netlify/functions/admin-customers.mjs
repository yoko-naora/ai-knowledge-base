// Netlify Function: admin-customers
// GET /api/admin-customers?key=xxx
// Returns all Stripe customers with subscription status
//
// SECURITY: ADMIN_KEY must be set in Netlify env vars.
// No default value — missing env var → function refuses to run.

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const ADMIN_KEY = process.env.ADMIN_KEY;

// Rate limiting — simple in-memory store (resets on cold start)
const RATE_WINDOW_MS = 60_000; // 1 minute
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
  if (entry.count > MAX_REQUESTS) return true;
  return false;
}

// Clean up old entries every 5 min
setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  for (const [ip, entry] of rateStore) {
    if (entry.windowStart < cutoff) rateStore.delete(ip);
  }
}, 300_000);

export default async function handler(event) {
  // ── Method check ──
  if (event.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders(),
    });
  }

  // ── Rate limit ──
  const clientIp = event.headers.get("x-forwarded-for") || event.headers.get("client-ip") || "unknown";
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: corsHeaders(),
    });
  }

  // ── Auth: require ADMIN_KEY env var (no default!) ──
  if (!ADMIN_KEY) {
    console.error("ADMIN_KEY env var not configured");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: corsHeaders(),
    });
  }

  const url = new URL(event.url);
  const key = url.searchParams.get("key") || "";
  if (key !== ADMIN_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders(),
    });
  }

  if (!STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify({ error: "Stripe not configured" }), {
      status: 500,
      headers: corsHeaders(),
    });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);

  try {
    const customers = [];
    let hasMore = true;
    let startingAfter = undefined;

    while (hasMore) {
      const list = await stripe.customers.list({ limit: 100, starting_after: startingAfter });
      for (const cus of list.data) {
        const subs = await stripe.subscriptions.list({ customer: cus.id, limit: 5, status: "all" });

        const activeSub = subs.data.find(s => s.status === "active" || s.status === "trialing");
        const allEnded = subs.data.length > 0 && subs.data.every(s => s.status === "canceled" || s.status === "incomplete_expired" || s.status === "unpaid");

        let plan = null;
        let status = "none";
        let amount = 0;
        let purchasedAt = null;
        let currentPeriodEnd = null;

        if (activeSub) {
          status = activeSub.status === "trialing" ? "trialing" : "active";
          amount = activeSub.items.data.reduce((sum, item) => sum + ((item.price?.unit_amount || 0) * (item.quantity || 1)), 0);
          plan = amount <= 5000 ? "monthly" : "yearly";
          purchasedAt = new Date(activeSub.created * 1000).toISOString();
          currentPeriodEnd = activeSub.current_period_end;
        } else if (allEnded) {
          status = "ended";
          const lastSub = subs.data[0];
          amount = lastSub.items.data.reduce((sum, item) => sum + ((item.price?.unit_amount || 0) * (item.quantity || 1)), 0);
          plan = amount <= 5000 ? "monthly" : "yearly";
          purchasedAt = new Date(lastSub.created * 1000).toISOString();
        }

        let latestPayment = null;
        try {
          const invoices = await stripe.invoices.list({ customer: cus.id, limit: 1, status: "paid" });
          if (invoices.data.length > 0) {
            latestPayment = new Date(invoices.data[0].created * 1000).toISOString();
          }
        } catch { /* skip */ }

        // PII redaction: mask phone number (show only last 4 digits)
        const rawPhone = cus.phone || "";
        const maskedPhone = rawPhone ? maskPhone(rawPhone) : "";

        customers.push({
          name: cus.name || "",
          email: cus.email || "",
          phone: maskedPhone,
          plan,
          status,
          amount: amount > 0 ? `¥${amount.toLocaleString()}` : "",
          purchased_at: purchasedAt,
          current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
          latest_payment: latestPayment,
        });
      }
      hasMore = list.has_more;
      startingAfter = list.data.length > 0 ? list.data[list.data.length - 1].id : undefined;
    }

    customers.sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (b.status === "active" && a.status !== "active") return 1;
      return (b.purchased_at || "").localeCompare(a.purchased_at || "");
    });

    return new Response(JSON.stringify({ customers, total: customers.length }), {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (err) {
    console.error("Stripe API error:", err.message);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
}

// ── Helpers ──

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "https://kb.snsaladdin.com",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function maskPhone(phone) {
  // Keep country code prefix and last 4 digits
  const cleaned = phone.replace(/[\s\-()]/g, "");
  if (cleaned.length <= 4) return "****";
  const prefix = cleaned.startsWith("+") ? cleaned.slice(0, 3) : "";
  const last4 = cleaned.slice(-4);
  return `${prefix}****${last4}`;
}
