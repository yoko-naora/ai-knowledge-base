export async function onRequest(context) {
  const rawKeys = Object.keys(context.env || {});

  // Check exact key names — show if there are hidden spaces
  const keyDetails = {};
  for (const k of rawKeys) {
    keyDetails[k] = {
      length: k.length,
      hasLeadingSpace: k.startsWith(" "),
      hasTrailingSpace: k.endsWith(" "),
      hex: [...new TextEncoder().encode(k)].map(b => b.toString(16).padStart(2,'0')).join(''),
    };
  }

  const check = {
    RESEND_API_KEY: !!context.env.RESEND_API_KEY,
    STRIPE_SECRET_KEY: !!context.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: !!context.env.STRIPE_WEBHOOK_SECRET,
    ADMIN_KEY: !!context.env.ADMIN_KEY,
    ACCESS_CODE: !!context.env.ACCESS_CODE,
  };

  // Also try the potentially-spaced versions
  const spacedCheck = {};
  for (const k of rawKeys) {
    if (k.includes("ADMIN") || k.includes("ACCESS")) {
      spacedCheck[k] = !!context.env[k];
    }
  }

  return new Response(JSON.stringify({ keys: rawKeys, keyDetails, check, spacedCheck }, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
