// Cloudflare Pages Function: pageview tracker
// POST /api/pageview  — record a pageview
// GET  /api/pageview  — get stats

let store = { total: 0, pages: {}, timeline: [] };

export async function onRequest(context) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Cache-Control": "no-store",
  };

  if (context.request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (context.request.method === "POST") {
    try {
      const body = await context.request.json().catch(() => ({}));
      const page = (body.page || "").replace(/[?#].*$/, "") || "/";
      const ref = body.ref || "direct";

      store.total++;
      store.pages[page] = (store.pages[page] || 0) + 1;
      store.timeline.push({ page, ref, time: Date.now() });
      if (store.timeline.length > 500) store.timeline = store.timeline.slice(-300);

      return new Response(JSON.stringify({ ok: true, total: store.total }), { status: 200, headers });
    } catch {
      return new Response(JSON.stringify({ error: "bad request" }), { status: 400, headers });
    }
  }

  // GET — return stats
  const topPages = Object.entries(store.pages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([p, n]) => ({ page: p, views: n }));

  const recent = store.timeline.slice(-20).reverse();

  return new Response(JSON.stringify({
    total: store.total,
    pages: topPages,
    recent,
    updated: Date.now(),
  }), { status: 200, headers });
}
