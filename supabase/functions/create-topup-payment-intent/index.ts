// Creates a Stripe PaymentIntent for a top-up on one of the caller's completed
// orders. Price ALWAYS comes from topup_options in the DB — never the client.
// A pending topup_orders row is committed before the client secret is returned,
// so the stripe-webhook can always find and fulfil it.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, sentry-trace, baggage',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

    // --- Auth ---
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return json(401, { error: 'Unauthorized' });
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${authHeader.replace('Bearer ', '')}` },
    });
    if (!userRes.ok) return json(401, { error: 'Invalid session' });
    const userBody = await userRes.json();
    const userId: string | undefined = userBody?.id;
    if (!userId) return json(401, { error: 'Invalid session' });
    if (!stripeKey) return json(500, { error: 'Stripe is not configured.' });

    const { parent_order_id, topup_option_id } = await req.json().catch(() => ({}));
    if (!parent_order_id || !topup_option_id) {
      return json(400, { error: 'parent_order_id and topup_option_id required' });
    }

    const restGet = (path: string) =>
      fetch(`${supabaseUrl}/rest/v1/${path}`, {
        headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Accept': 'application/json' },
      }).then((r) => r.json().catch(() => []));

    // --- Parent order: caller's own, paid, completed ---
    const orders = await restGet(`orders?id=eq.${encodeURIComponent(parent_order_id)}&select=id,user_id,plan_id,plan_name,status,payment_status,customer_email,esim_package_id&limit=1`);
    const order = Array.isArray(orders) ? orders[0] : null;
    if (!order || order.user_id !== userId) return json(404, { error: 'Order not found' });
    if (order.payment_status !== 'succeeded' || order.status !== 'completed') {
      return json(400, { error: 'This order cannot be topped up.' });
    }

    // --- Package region: anchored to the ACTUAL purchased package code on the
    // order (orders.esim_package_id), never the latest catalog row for the plan.
    if (!order.esim_package_id) {
      return json(400, { error: 'Top-ups are not available for this plan.' });
    }
    const pkgs = await restGet(`esim_packages?esim_access_package_id=eq.${encodeURIComponent(order.esim_package_id)}&supplier=neq.esimcard&select=supplier,location_code&limit=1`);
    const pkg = Array.isArray(pkgs) ? pkgs[0] : null;
    if (!pkg || !pkg.location_code) {
      return json(400, { error: 'Top-ups are not available for this plan.' });
    }

    // --- The eSIM to top up (by ICCID) must exist ---
    const acts = await restGet(`esim_activations?order_id=eq.${encodeURIComponent(parent_order_id)}&select=iccid&limit=1`);
    const iccid: string | null = Array.isArray(acts) ? (acts[0]?.iccid ?? null) : null;
    if (!iccid) return json(400, { error: 'Your eSIM is not ready for top-ups yet.' });

    // --- Option: active, matches the parent package region; price from DB ---
    const opts = await restGet(`topup_options?id=eq.${encodeURIComponent(topup_option_id)}&is_active=eq.true&select=id,type,name,data_amount,validity_days,price,currency,location_code,supplier_package_code&limit=1`);
    const option = Array.isArray(opts) ? opts[0] : null;
    if (!option || !option.supplier_package_code) return json(400, { error: 'Top-up option not available.' });
    if (option.location_code !== pkg.location_code) {
      return json(400, { error: 'This top-up does not match your plan region.' });
    }

    const amount = Number(option.price);
    if (!Number.isFinite(amount) || amount <= 0) return json(400, { error: 'Top-up option misconfigured.' });
    const currency = String(option.currency ?? 'EUR');

    // --- 1. Create the PaymentIntent (unconfirmed — no money moves yet) ---
    const piBody = new URLSearchParams({
      amount: Math.round(amount * 100).toString(),
      currency: currency.toLowerCase(),
      'automatic_payment_methods[enabled]': 'true',
      'metadata[kind]': 'topup',
      'metadata[user_id]': userId,
      'metadata[parent_order_id]': order.id,
      'metadata[topup_option_id]': option.id,
      'metadata[plan_name]': `${order.plan_name ?? ''} — top-up ${option.name}`.slice(0, 200),
    });
    const piRes = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: piBody.toString(),
    });
    const pi = await piRes.json();
    if (!piRes.ok) {
      console.error(`[create-topup-payment-intent] Stripe error — user=${userId} msg=${pi.error?.message}`);
      return json(400, { error: pi.error?.message ?? 'Stripe error' });
    }

    // --- 2. Commit the pending topup_orders row BEFORE returning the secret ---
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/topup_orders`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json', 'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        parent_order_id: order.id,
        user_id: userId,
        topup_type: option.type,
        data_amount: option.data_amount,
        validity_days: option.validity_days,
        price: amount,
        currency: currency.toUpperCase(),
        status: 'pending',
        payment_status: 'pending',
        payment_intent_id: pi.id,
        topup_option_id: option.id,
        supplier_package_code: option.supplier_package_code,
        iccid,
      }),
    });
    if (!insertRes.ok) {
      const errBody = await insertRes.text();
      console.error(`[create-topup-payment-intent] CRITICAL — topup order insert failed intent=${pi.id} user=${userId} status=${insertRes.status} body=${errBody}`);
      // PI unconfirmed → no charge. Refuse rather than risk charged-but-no-record.
      return json(500, { error: 'Could not start your top-up. Please try again.' });
    }
    const rows = await insertRes.json().catch(() => []);
    const topUpOrderId: string | undefined = Array.isArray(rows) ? rows[0]?.id : rows?.id;

    // --- 3. Attach topup_order_id to PI metadata (best-effort) ---
    if (topUpOrderId) {
      try {
        await fetch(`https://api.stripe.com/v1/payment_intents/${pi.id}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ 'metadata[topup_order_id]': topUpOrderId }).toString(),
        });
      } catch (e: any) {
        console.error(`[create-topup-payment-intent] PI metadata update failed (non-fatal) — ${e?.message}`);
      }
    }

    console.log(`[create-topup-payment-intent] intent=${pi.id} topupOrder=${topUpOrderId} user=${userId} amount=${amount} ${currency}`);
    return json(200, { clientSecret: pi.client_secret, paymentIntentId: pi.id, topUpOrderId, amount, currency });
  } catch (e: any) {
    console.error(`[create-topup-payment-intent] unhandled — ${e?.message}`);
    return json(500, { error: 'Internal error' });
  }
});
