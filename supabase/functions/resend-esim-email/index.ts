const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function verifyAdminUser(supabaseUrl: string, serviceKey: string, authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');
  try {
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${token}` },
    });
    if (!userRes.ok) return false;
    const user = await userRes.json();
    const userId = user?.id;
    if (!userId) return false;

    const profileRes = await fetch(
      `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=role&limit=1`,
      {
        headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` },
      }
    );
    if (!profileRes.ok) return false;
    const profiles = await profileRes.json();
    return profiles?.[0]?.role === 'admin';
  } catch {
    return false;
  }
}

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

    // Verify the calling user is an authenticated admin
    const authHeader = req.headers.get('authorization');
    const isAdmin = await verifyAdminUser(supabaseUrl, serviceRoleKey, authHeader);
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden: admin access required' }), {
        status: 403,
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
      `${supabaseUrl}/rest/v1/esim_activations?order_id=eq.${orderId}&select=activation_code,activation_url,iccid,qr_code_data&limit=1`,
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
      `${supabaseUrl}/rest/v1/qr_codes?order_id=eq.${orderId}&select=qr_image_url,activation_url&limit=1`,
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

    const lpaCode = activation?.activation_code ?? qrCode?.activation_url ?? null;
    const webUrl = activation?.activation_url ?? null;
    const iccid = activation?.iccid ?? null;
    const qrImageUrl = qrCode?.qr_image_url ?? null;

    // Determine redirect URL for the magic link — send customer to orders page
    const origin = req.headers.get('origin') ?? '';
    const redirectTo = origin ? `${origin}/orders` : `${supabaseUrl.replace('.supabase.co', '')}/orders`;

    // Scope note: this function sends a Supabase magic-link (OTP) email to the customer.
    // The email body is the Supabase auth template containing only the sign-in link.
    // When the customer clicks the link they are signed in and land on /orders where
    // full eSIM details (QR code, LPA activation code, activation URL) are displayed
    // via the customer_email RLS policy. The eSIM details are also returned in the
    // JSON response so the admin UI can display them immediately without a page reload.
    // A fully custom transactional email (eSIM details embedded in HTML email body)
    // is out of scope; it would require integrating a transactional email service (e.g. Resend).
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
    const emailSent = otpRes.ok;
    const otpError = emailSent ? null : (otpResult?.error_description ?? otpResult?.message ?? 'OTP send failed');

    return new Response(
      JSON.stringify({
        success: emailSent,
        emailSent,
        customerEmail,
        error: otpError,
        esimDetails: {
          planName: order.plan_name,
          dataAmount: order.data_amount,
          iccid,
          lpaCode,
          webUrl,
          qrImageUrl,
        },
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
