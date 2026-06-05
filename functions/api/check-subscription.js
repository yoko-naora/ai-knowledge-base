// Cloudflare Pages Function: check-subscription
// GET /api/check-subscription?email=xxx          → Stripe email verification
// GET /api/check-subscription?code=xxx           → Access code verification (server-side)
//
// SECURITY: ACCESS_CODE must be set in Cloudflare Pages env vars.
// No admin bypass — all verification is server-side.
//
// TEST:
//   curl -s "https://kb.snsaladdin.com/api/check-subscription?email=yokonaora@gmail.com"
//   预期: active=true/false based on Stripe (no bypass)
//   curl -s "https://kb.snsaladdin.com/api/check-subscription?code=WRONG"
//   预期: {"active":false,"reason":"invalid_code"}

import Stripe from "stripe";

// Rate limiting
const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
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
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const email = (url.searchParams.get("email") || "").trim().toLowerCase();
  const code = (url.searchParams.get("code") || "").trim();

  // Rate limit
  const clientIp = context.request.headers.get("cf-connecting-ip") || "unknown";
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), { status: 429, headers: corsHeaders() });
  }

  // ── Access code verification (server-side) ──
  if (code) {
    const accessCode = context.env.ACCESS_CODE;
    if (!accessCode) {
      return new Response(JSON.stringify({ active: false, reason: "server_config" }), { status: 200, headers: corsHeaders() });
    }
    if (code === accessCode) {
      return new Response(JSON.stringify({ active: true, plan: "code" }), { status: 200, headers: corsHeaders() });
    }
    return new Response(JSON.stringify({ active: false, reason: "invalid_code" }), { status: 200, headers: corsHeaders() });
  }

  // ── Email verification via Stripe ──
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400, headers: corsHeaders() });
  }

  const key = context.env.STRIPE_SECRET_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: "Stripe not configured" }), { status: 500, headers: corsHeaders() });
  }

  const stripe = new Stripe(key);

  try {
    const customers = await stripe.customers.list({ email, limit: 5 });
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ active: false, plan: null, reason: "no_customer" }), { status: 200, headers: corsHeaders() });
    }

    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({ customer: customer.id, status: "active", limit: 5 });
      if (subs.data.length > 0) {
        const sub = subs.data[0];
        const amount = sub.items.data.reduce((sum, item) => sum + ((item.price?.unit_amount || 0) * (item.quantity || 1)), 0);
        return new Response(JSON.stringify({ active: true, plan: amount <= 5000 ? "monthly" : "yearly", current_period_end: sub.current_period_end, cancel_at_period_end: sub.cancel_at_period_end }), { status: 200, headers: corsHeaders() });
      }

      const trialing = await stripe.subscriptions.list({ customer: customer.id, status: "trialing", limit: 5 });
      if (trialing.data.length > 0) {
        const sub = trialing.data[0];
        const amount = sub.items.data.reduce((sum, item) => sum + ((item.price?.unit_amount || 0) * (item.quantity || 1)), 0);
        return new Response(JSON.stringify({ active: true, plan: amount <= 5000 ? "monthly" : "yearly", status: "trialing", current_period_end: sub.current_period_end }), { status: 200, headers: corsHeaders() });
      }
    }

    return new Response(JSON.stringify({ active: false, plan: null, reason: "no_active_subscription" }), { status: 200, headers: corsHeaders() });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: corsHeaders() });
  }
}
