const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, sentry-trace, baggage',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Hardcoded fallback package codes — mirror functions/get-esim-package so the
// pending order always carries an esim_package_id even if the DB row is missing.
const FALLBACK_PACKAGES: Record<string, string> = {
  'arrival':   'PRC8B6GK2',
  'essential': 'PV006PZ7G',
  'comfort':   'P29FDU5TL',
  'freedom':   'P6PBYX5G4',
};

// Resolve the eSIM Access package code for a plan (DB row first, then fallback).
async function resolveEsimPackageId(supabaseUrl: string, serviceKey: string, planId: string): Promise<string | null> {
  try {
    const url =
      `${supabaseUrl}/rest/v1/esim_packages` +
      `?plan_id=eq.${encodeURIComponent(planId)}` +
      `&esim_access_package_id=not.is.null` +
      `&order=created_at.desc&limit=1`;
    const res = await fetch(url, {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Accept': 'application/json' },
    });
    const rows = await res.json().catch(() => []);
    if (Array.isArray(rows) && rows.length > 0 && rows[0]?.esim_access_package_id) {
      return rows[0].esim_access_package_id as string;
    }
  } catch (e: any) {
    console.error(`[create-payment-intent] esim_packages lookup failed — ${e?.message}`);
  }
  return FALLBACK_PACKAGES[planId] ?? null;
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

    // --- Auth check — require a valid Supabase session token ---
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[create-payment-intent] missing or malformed auth header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${token}` },
    });
    if (!userRes.ok) {
      console.error(`[create-payment-intent] token verification failed — status=${userRes.status}`);
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const userBody = await userRes.json();
    const userId: string | undefined = userBody?.id;
    if (!userId) {
      console.error('[create-payment-intent] verified token has no user id');
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!stripeKey) {
      console.error(`[create-payment-intent] STRIPE_SECRET_KEY not set — user=${userId}`);
      return new Response(JSON.stringify({ error: 'Stripe is not configured.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const {
      amount,
      currency = 'eur',
      plan_name,
      plan_id,
      data_amount,
      duration_days,
      customer_email,
      referral_code,
    } = await req.json();

    if (!amount || amount <= 0) {
      console.error(`[create-payment-intent] invalid amount=${amount} user=${userId}`);
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    if (!plan_id || !plan_name) {
      console.error(`[create-payment-intent] missing plan details — plan_id=${plan_id} user=${userId}`);
      return new Response(JSON.stringify({ error: 'Missing plan details' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[create-payment-intent] creating intent — user=${userId} plan=${plan_id} amount=${amount} currency=${currency}`);

    // --- 1. Create the Stripe PaymentIntent (not yet confirmed — no charge until the client confirms) ---
    const amountCents = Math.round(amount * 100);
    const body = new URLSearchParams({
      amount: amountCents.toString(),
      currency: String(currency).toLowerCase(),
      'automatic_payment_methods[enabled]': 'true',
      'metadata[plan_name]': plan_name ?? '',
      'metadata[plan_id]': plan_id ?? '',
      'metadata[user_id]': userId,
    });
    // P2: referral attribution must be auditable from the Stripe dashboard.
    if (referral_code) body.append('metadata[referral_code]', referral_code);
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error(`[create-payment-intent] Stripe error — user=${userId} plan=${plan_id} stripeCode=${data.error?.code} msg=${data.error?.message}`);
      return new Response(JSON.stringify({ error: data.error?.message ?? 'Stripe error' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const paymentIntentId: string = data.id;
    console.log(`[create-payment-intent] intent created — user=${userId} intentId=${paymentIntentId} plan=${plan_id}`);

    // --- 2. Create the PENDING ORDER server-side BEFORE returning the client secret ---
    // This is the core fix: the order row is written with the service role using the
    // user_id from the verified token, so it can never be rejected by RLS the way the
    // old client-side INSERT was. The order therefore always exists before the customer
    // is charged. The stripe-webhook later marks it paid and provisions the eSIM.
    const esimPackageId = await resolveEsimPackageId(supabaseUrl, serviceKey, plan_id);
    if (!esimPackageId) {
      console.error(`[create-payment-intent] no eSIM package mapping for plan=${plan_id} — refusing to take payment`);
      return new Response(JSON.stringify({ error: 'This plan is temporarily unavailable.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const restHeaders = {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    };

    const orderPayload: Record<string, unknown> = {
      user_id: userId,
      plan_id,
      plan_name,
      data_amount: data_amount ?? '',
      duration_days: duration_days ?? 0,
      price: amount,
      currency: String(currency).toUpperCase(),
      status: 'pending',
      payment_status: 'pending',
      esim_status: 'pending',
      payment_intent_id: paymentIntentId,
      customer_email: customer_email || userBody?.email || null,
      esim_package_id: esimPackageId,
    };
    if (referral_code) orderPayload.referral_code = referral_code;

    const orderRes = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers: restHeaders,
      body: JSON.stringify(orderPayload),
    });

    if (!orderRes.ok) {
      const errBody = await orderRes.text();
      console.error(`[create-payment-intent] CRITICAL — pending order insert failed for intent=${paymentIntentId} user=${userId} status=${orderRes.status} body=${errBody}`);
      // The PaymentIntent is not yet confirmed, so no money has been taken. Refuse the
      // payment rather than risk another charged-but-no-record case.
      return new Response(JSON.stringify({ error: 'Could not start your order. Please try again.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const orderRows = await orderRes.json().catch(() => []);
    const orderId: string | undefined = Array.isArray(orderRows) ? orderRows[0]?.id : orderRows?.id;
    console.log(`[create-payment-intent] pending order created — orderId=${orderId} intentId=${paymentIntentId} user=${userId}`);

    // --- 2b. Attach order_id to the PI metadata now that it's known (P2, best-effort) ---
    // Lets referral/order attribution be audited entirely from the Stripe dashboard.
    // Non-fatal: the order already exists and the webhook matches by payment_intent_id.
    if (orderId) {
      try {
        const metaRes = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stripeKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ 'metadata[order_id]': orderId }).toString(),
        });
        if (!metaRes.ok) {
          console.error(`[create-payment-intent] PI metadata order_id update failed (non-fatal) — intent=${paymentIntentId} status=${metaRes.status}`);
        }
      } catch (e: any) {
        console.error(`[create-payment-intent] PI metadata order_id update threw (non-fatal) — intent=${paymentIntentId} msg=${e?.message}`);
      }
    }

    // --- 3. Order item (best-effort — non-fatal; matches the catalog row) ---
    if (orderId) {
      const itemRes = await fetch(`${supabaseUrl}/rest/v1/order_items`, {
        method: 'POST',
        headers: { ...restHeaders, 'Prefer': 'return=minimal' },
        body: JSON.stringify({
          order_id: orderId,
          plan_id,
          plan_name,
          data_amount: data_amount ?? '',
          duration_days: duration_days ?? 0,
          unit_price: amount,
          quantity: 1,
          total_price: amount,
        }),
      });
      if (!itemRes.ok) {
        console.error(`[create-payment-intent] order_items insert failed (non-fatal) — order=${orderId} status=${itemRes.status} body=${await itemRes.text()}`);
      }
    }

    return new Response(JSON.stringify({ clientSecret: data.client_secret, paymentIntentId, orderId }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error(`[create-payment-intent] unhandled exception — message=${error?.message} stack=${error?.stack}`);
    return new Response(JSON.stringify({ error: error.message ?? 'Failed to create payment intent' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
