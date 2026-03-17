const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch the order from the database
    const orderRes = await fetch(
      `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&select=*`,
      {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const orders = await orderRes.json();
    const order = orders?.[0];

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const customerEmail = order.customer_email;
    if (!customerEmail) {
      return new Response(JSON.stringify({ error: 'No customer email on this order' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch eSIM activation details for this order
    const activationRes = await fetch(
      `${supabaseUrl}/rest/v1/esim_activations?order_id=eq.${orderId}&select=*&limit=1`,
      {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const activations = await activationRes.json();
    const activation = activations?.[0] ?? null;

    // Fetch QR code details for this order
    const qrRes = await fetch(
      `${supabaseUrl}/rest/v1/qr_codes?order_id=eq.${orderId}&select=*&limit=1`,
      {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const qrCodes = await qrRes.json();
    const qrCode = qrCodes?.[0] ?? null;

    // Generate a magic link for the customer using admin API
    const appBaseUrl = req.headers.get('origin') || supabaseUrl;
    const redirectTo = `${appBaseUrl}/orders`;

    const generateLinkRes = await fetch(
      `${supabaseUrl}/auth/v1/admin/generate_link`,
      {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'magiclink',
          email: customerEmail,
          options: { redirect_to: redirectTo },
        }),
      }
    );

    const linkData = await generateLinkRes.json();
    const magicLink = linkData?.action_link ?? null;

    // Build the eSIM details payload to include in the email
    const lpaCode = activation?.activation_code ?? qrCode?.activation_url ?? null;
    const webUrl = activation?.activation_url ?? null;
    const iccid = activation?.iccid ?? null;
    const qrImageUrl = qrCode?.qr_image_url ?? null;

    // Compose the email body
    const emailSubject = `Your BuéChama eSIM — ${order.plan_name}`;
    const emailBody = [
      `Hello,`,
      ``,
      `Here are your eSIM details for your ${order.plan_name} plan:`,
      ``,
      iccid ? `ICCID: ${iccid}` : null,
      lpaCode ? `LPA Activation Code: ${lpaCode}` : null,
      webUrl ? `Activation Link: ${webUrl}` : null,
      qrImageUrl ? `QR Code Image: ${qrImageUrl}` : null,
      ``,
      `How to install your eSIM:`,
      `1. Go to Settings → Cellular / Mobile Data`,
      `2. Tap "Add eSIM" or "Add Data Plan"`,
      `3. Scan the QR code or enter the LPA code manually`,
      ``,
      magicLink
        ? `Click the link below to sign in and access your full order details:\n${magicLink}`
        : `Sign in at https://buechama.com to access your order history.`,
      ``,
      `Thank you for choosing BuéChama eSIM.`,
    ]
      .filter((line) => line !== null)
      .join('\n');

    // Send the email via Supabase Auth admin OTP (which sends Supabase's templated email)
    // as the delivery mechanism, while returning the composed eSIM content for the admin
    const otpRes = await fetch(`${supabaseUrl}/auth/v1/otp`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: customerEmail,
        create_user: true,
        options: { email_redirect_to: redirectTo },
      }),
    });

    const otpResult = await otpRes.json();
    const otpError = otpResult?.error_description ?? otpResult?.message ?? null;
    const emailSent = otpRes.ok;

    return new Response(
      JSON.stringify({
        success: emailSent,
        emailSent,
        customerEmail,
        error: emailSent ? null : otpError,
        esimDetails: {
          planName: order.plan_name,
          dataAmount: order.data_amount,
          iccid,
          lpaCode,
          webUrl,
          qrImageUrl,
          magicLink,
        },
        emailBody,
      }),
      {
        status: emailSent ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('resend-esim-email error:', err);
    return new Response(JSON.stringify({ error: err.message ?? 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
