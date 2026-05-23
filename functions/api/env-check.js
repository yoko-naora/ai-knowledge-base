export async function onRequest(context) {
  const keys = Object.keys(context.env || {});
  const check = {
    RESEND_API_KEY: !!context.env.RESEND_API_KEY,
    STRIPE_SECRET_KEY: !!context.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: !!context.env.STRIPE_WEBHOOK_SECRET,
  };
  return new Response(JSON.stringify({ keys, check }, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
