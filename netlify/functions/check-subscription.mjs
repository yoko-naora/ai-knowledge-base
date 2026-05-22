// Netlify Function: check-subscription
// GET /api/check-subscription?email=xxx
// Queries Stripe for active subscriptions by customer email
// Returns { active: true/false, plan: "monthly"/"yearly"/null }

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

export default async function handler(event) {
  if (event.httpMethod !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  const email = (event.queryStringParameters?.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  if (!STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY not configured");
    return new Response(JSON.stringify({ error: "Stripe not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);

  try {
    // Search customers by email
    const customers = await stripe.customers.list({ email, limit: 5 });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ active: false, plan: null, reason: "no_customer" }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // Check each customer for active subscriptions
    for (const customer of customers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: "active",
        limit: 5,
      });

      if (subscriptions.data.length > 0) {
        const sub = subscriptions.data[0];
        const amount = sub.items.data.reduce(
          (sum, item) => sum + ((item.price?.unit_amount || 0) * (item.quantity || 1)),
          0
        );
        const plan = amount <= 5000 ? "monthly" : "yearly";
        const currentPeriodEnd = sub.current_period_end;

        return new Response(JSON.stringify({ active: true, plan, current_period_end: currentPeriodEnd, cancel_at_period_end: sub.cancel_at_period_end }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      // Also check trialing subscriptions
      const trialing = await stripe.subscriptions.list({
        customer: customer.id,
        status: "trialing",
        limit: 5,
      });

      if (trialing.data.length > 0) {
        const sub = trialing.data[0];
        const amount = sub.items.data.reduce(
          (sum, item) => sum + ((item.price?.unit_amount || 0) * (item.quantity || 1)),
          0
        );
        const plan = amount <= 5000 ? "monthly" : "yearly";

        return new Response(JSON.stringify({ active: true, plan, status: "trialing", current_period_end: sub.current_period_end }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
    }

    return new Response(JSON.stringify({ active: false, plan: null, reason: "no_active_subscription" }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Stripe API error:", err);
    return new Response(JSON.stringify({ error: "Stripe API error", detail: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
