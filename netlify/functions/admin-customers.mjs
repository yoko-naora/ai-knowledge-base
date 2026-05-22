// Netlify Function: admin-customers
// GET /api/admin-customers?key=xxx
// Returns all Stripe customers with subscription status

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const ADMIN_KEY = process.env.ADMIN_KEY || "admin2026";

export default async function handler(event) {
  if (event.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  const url = new URL(event.url);
  const key = url.searchParams.get("key") || "";
  if (key !== ADMIN_KEY) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  if (!STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify({ error: "Stripe not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);

  try {
    const customers = [];
    let hasMore = true;
    let startingAfter = undefined;

    // Fetch all customers with pagination
    while (hasMore) {
      const list = await stripe.customers.list({ limit: 100, starting_after: startingAfter });
      for (const cus of list.data) {
        // Get subscriptions for each customer
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

        // Get payment history for this customer
        let latestPayment = null;
        try {
          const invoices = await stripe.invoices.list({ customer: cus.id, limit: 1, status: "paid" });
          if (invoices.data.length > 0) {
            latestPayment = new Date(invoices.data[0].created * 1000).toISOString();
          }
        } catch { /* skip payment history */ }

        customers.push({
          name: cus.name || "",
          email: cus.email || "",
          phone: cus.phone || "",
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

    // Sort: active first, then by purchase date descending
    customers.sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (b.status === "active" && a.status !== "active") return 1;
      return (b.purchased_at || "").localeCompare(a.purchased_at || "");
    });

    return new Response(JSON.stringify({ customers, total: customers.length }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Stripe API error:", err);
    return new Response(JSON.stringify({ error: "Stripe API error", detail: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
