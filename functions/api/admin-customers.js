// Cloudflare Pages Function: admin-customers
// GET /api/admin-customers?key=xxx
//
// TEST:
//   curl -s "https://kb.snsaladdin.com/api/admin-customers?key=admin2026" | python3 -c "
//   import sys,json; d=json.load(sys.stdin)
//   assert 'customers' in d, 'missing customers'
//   assert d['total'] > 0, 'no customers'
//   active = [c for c in d['customers'] if c['status']=='active']
//   assert len(active) > 0, 'no active customers'
//   c = active[0]
//   assert c['actual_paid'] > 0, f'actual_paid is zero: {c}'
//   assert c['subtotal'] > 0, f'subtotal is zero: {c}'
//   print(f'OK: {len(d[\"customers\"])} customers, active={c[\"email\"]} actual_paid={c[\"actual_paid\"]} subtotal={c[\"subtotal\"]} tax={c[\"tax\"]}')"
//   预期: OK 输出，actual_paid > 0, subtotal > 0

import Stripe from "stripe";

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const key = url.searchParams.get("key") || "";
  const adminKey = context.env.ADMIN_KEY || "admin2026";

  if (key !== adminKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }

  const stripeKey = context.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: "Stripe not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
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
          // Primary: check Payment Intents (works for both test & live Payment Links)
          const paymentIntents = await stripe.paymentIntents.list({ customer: cus.id, limit: 10 });
          let bestPI = null;
          let bestPIAmount = -1;
          for (const pi of paymentIntents.data) {
            const amt = pi.amount_received || pi.amount || 0;
            if (amt > bestPIAmount && pi.status === "succeeded") {
              bestPIAmount = amt;
              bestPI = pi;
            }
          }
          if (bestPI) {
            latestPayment = new Date(bestPI.created * 1000).toISOString();
            actualPaid = bestPI.amount_received || bestPI.amount || 0;
          }

          // Fallback: check invoices for subtotal/tax and amount if PI not found
          const invoices = await stripe.invoices.list({ customer: cus.id, limit: 10 });
          for (const inv of invoices.data) {
            if (inv.subtotal > 0 && subtotal === 0) subtotal = inv.subtotal;
            if (inv.tax > 0 && tax === 0) tax = inv.tax;
            // Use invoice amounts only if no PI found
            if (!bestPI) {
              const amt = inv.amount_paid || inv.total || inv.amount_due || 0;
              if (amt > actualPaid) {
                actualPaid = amt;
                if (!latestPayment) latestPayment = new Date(inv.created * 1000).toISOString();
              }
            }
          }

          // Last resort: use subtotal + tax as expected amount
          if (actualPaid === 0 && subtotal > 0) {
            actualPaid = subtotal + tax;
          }
        } catch { /* skip */ }

        customers.push({
          name: cus.name || "", email: cus.email || "", phone: cus.phone || "",
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

    return new Response(JSON.stringify({ customers, total: customers.length }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Stripe API error", detail: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
