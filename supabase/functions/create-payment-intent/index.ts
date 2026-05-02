const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const userId: string = userBody?.id ?? '(unknown)';

    if (!stripeKey) {
      console.error(`[create-payment-intent] STRIPE_SECRET_KEY not set — user=${userId}`);
      return new Response(JSON.stringify({ error: 'Stripe is not configured.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { amount, currency = 'eur', plan_name, plan_id } = await req.json();
    if (!amount || amount <= 0) {
      console.error(`[create-payment-intent] invalid amount=${amount} user=${userId}`);
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[create-payment-intent] creating intent — user=${userId} plan=${plan_id} amount=${amount} currency=${currency}`);

    const amountCents = Math.round(amount * 100);
    const body = new URLSearchParams({
      amount: amountCents.toString(),
      currency: currency.toLowerCase(),
      'automatic_payment_methods[enabled]': 'true',
      'metadata[plan_name]': plan_name ?? '',
      'metadata[plan_id]': plan_id ?? '',
      'metadata[user_id]': userId,
    });
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

    console.log(`[create-payment-intent] intent created — user=${userId} intentId=${data.id} plan=${plan_id}`);
    return new Response(JSON.stringify({ clientSecret: data.client_secret, paymentIntentId: data.id }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error(`[create-payment-intent] unhandled exception — message=${error?.message} stack=${error?.stack}`);
    return new Response(JSON.stringify({ error: error.message ?? 'Failed to create payment intent' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
