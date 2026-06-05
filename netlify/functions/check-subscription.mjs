// Netlify Function: check-subscription
// GET /api/check-subscription?email=xxx          → Stripe email verification
// GET /api/check-subscription?code=xxx           → Access code verification (server-side)
// GET /api/check-subscription?email=xxx&code=xxx → Either method
// Returns { active: true/false, plan: "monthly"/"yearly"/null }
//
// SECURITY: ACCESS_CODE must be set in Netlify env vars.
// All verification happens server-side — no client-side hash comparison.

import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const ACCESS_CODE = process.env.ACCESS_CODE;

// Rate limiting — simple in-memory store
const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS = 30; // higher limit for legit email verification
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

setInterval(() => {
  const cutoff = Date.now() - RATE_WINDOW_MS;
  for (const [ip, entry] of rateStore) {
    if (entry.windowStart < cutoff) rateStore.delete(ip);
  }
}, 300_000);

export default async function handler(event) {
  if (event.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: corsHeaders(),
    });
  }

  // Rate limit
  const clientIp = event.headers.get("x-forwarded-for") || event.headers.get("client-ip") || "unknown";
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: corsHeaders(),
    });
  }

  const url = new URL(event.url);
  const email = (url.searchParams.get("email") || "").trim().toLowerCase();
  const code = (url.searchParams.get("code") || "").trim();

  // ── Access code verification (server-side) ──
  if (code) {
    if (!ACCESS_CODE) {
      console.error("ACCESS_CODE env var not configured");
      return new Response(JSON.stringify({ active: false, reason: "server_config" }), {
        status: 200,
        headers: corsHeaders(),
      });
    }
    if (code === ACCESS_CODE) {
      return new Response(JSON.stringify({ active: true, plan: "code" }), {
        status: 200,
        headers: corsHeaders(),
      });
    }
    return new Response(JSON.stringify({ active: false, reason: "invalid_code" }), {
      status: 200,
      headers: corsHeaders(),
    });
  }

  // ── Email verification via Stripe ──
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email" }), {
      status: 400,
      headers: corsHeaders(),
    });
  }

  if (!STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY not configured");
    return new Response(JSON.stringify({ error: "Stripe not configured" }), {
      status: 500,
      headers: corsHeaders(),
    });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);

  try {
    const customers = await stripe.customers.list({ email, limit: 5 });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ active: false, reason: "no_customer" }), {
        status: 200,
        headers: corsHeaders(),
      });
    }

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
        return new Response(JSON.stringify({
          active: true,
          plan,
          current_period_end: sub.current_period_end,
          cancel_at_period_end: sub.cancel_at_period_end,
        }), {
          status: 200,
          headers: corsHeaders(),
        });
      }

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
        return new Response(JSON.stringify({
          active: true,
          plan,
          status: "trialing",
          current_period_end: sub.current_period_end,
        }), {
          status: 200,
          headers: corsHeaders(),
        });
      }
    }

    return new Response(JSON.stringify({ active: false, reason: "no_active_subscription" }), {
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

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "https://kb.snsaladdin.com",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
