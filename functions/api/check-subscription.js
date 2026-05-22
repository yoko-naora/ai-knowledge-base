// Cloudflare Pages Function: check-subscription
// GET /api/check-subscription?email=xxx

import Stripe from "stripe";

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const email = (url.searchParams.get("email") || "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const key = context.env.STRIPE_SECRET_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: "Stripe not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const stripe = new Stripe(key);

  try {
    const customers = await stripe.customers.list({ email, limit: 5 });
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ active: false, plan: null, reason: "no_customer" }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({ customer: customer.id, status: "active", limit: 5 });
      if (subs.data.length > 0) {
        const sub = subs.data[0];
        const amount = sub.items.data.reduce((sum, item) => sum + ((item.price?.unit_amount || 0) * (item.quantity || 1)), 0);
        return new Response(JSON.stringify({ active: true, plan: amount <= 5000 ? "monthly" : "yearly", current_period_end: sub.current_period_end, cancel_at_period_end: sub.cancel_at_period_end }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      const trialing = await stripe.subscriptions.list({ customer: customer.id, status: "trialing", limit: 5 });
      if (trialing.data.length > 0) {
        const sub = trialing.data[0];
        const amount = sub.items.data.reduce((sum, item) => sum + ((item.price?.unit_amount || 0) * (item.quantity || 1)), 0);
        return new Response(JSON.stringify({ active: true, plan: amount <= 5000 ? "monthly" : "yearly", status: "trialing", current_period_end: sub.current_period_end }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ active: false, plan: null, reason: "no_active_subscription" }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Stripe API error", detail: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
