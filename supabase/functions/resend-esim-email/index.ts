import { sendProvisioningEmail } from '../_shared/esim-email.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, sentry-trace, baggage',
};

/** Returns the caller's user ID from their JWT, or null if unauthenticated. */
async function getCallerUserId(supabaseUrl: string, serviceKey: string, authHeader: string | null): Promise<string | null> {
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  try {
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${token}` },
    });
    if (!userRes.ok) return null;
    const user = await userRes.json();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

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
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the caller is authenticated
    const authHeader = req.headers.get('authorization');
    const callerUserId = await getCallerUserId(supabaseUrl, serviceRoleKey, authHeader);
    if (!callerUserId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
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

    // Fetch the order
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

    // Allow access if: caller owns the order OR caller is admin
    const isOwner = order.user_id === callerUserId;
    if (!isOwner) {
      const isAdmin = await verifyAdminUser(supabaseUrl, serviceRoleKey, authHeader);
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const customerEmail = order.customer_email;
    if (!customerEmail) {
      return new Response(JSON.stringify({ error: 'No customer email on this order' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch eSIM activation details
    const activationRes = await fetch(
      `${supabaseUrl}/rest/v1/esim_activations?order_id=eq.${orderId}&select=activation_code,activation_url,iccid&limit=1`,
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

    // Fetch QR code details
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
    const planName = order.plan_name ?? '';
    const dataAmount = order.data_amount ?? '';

    // Build the redirect URL for the magic link.
    // Prefer an explicit SITE_URL secret (set to https://palopconnect.com in Supabase secrets),
    // then fall back to the request origin only if it looks like the production domain,
    // otherwise default to the known production URL.
    const siteUrlSecret = Deno.env.get('SITE_URL') ?? '';
    const requestOrigin = req.headers.get('origin') ?? '';
    const isProdOrigin = requestOrigin.includes('palopconnect.com');
    const baseUrl = siteUrlSecret || (isProdOrigin ? requestOrigin : 'https://palopconnect.com');
    // Redirect to /auth so the existing Auth page handles the session and sends
    // customers to /orders — more reliable than redirecting to /orders directly
    // since Supabase sometimes strips the /orders suffix from redirect_to.
    const redirectTo = `${baseUrl}/auth`;

    const esimDetails = { planName, dataAmount, iccid, lpaCode, webUrl, qrImageUrl };

    // --- Primary path: Resend transactional email with magic link + eSIM details ---
    if (resendApiKey) {
      try {
        await sendProvisioningEmail({
          customerEmail,
          planName,
          dataAmount,
          iccid,
          lpaCode,
          webUrl,
          qrImageUrl,
          supabaseUrl,
          serviceKey: serviceRoleKey,
          resendApiKey,
          origin: baseUrl,
          redirectTo,
        });
      } catch (e: any) {
        return new Response(
          JSON.stringify({ success: false, error: e?.message ?? 'Email send failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, emailSent: true, customerEmail, esimDetails }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- Fallback: OTP magic link only (no RESEND_API_KEY configured) ---
    console.warn('RESEND_API_KEY not set — falling back to Supabase OTP email (no eSIM details in body)');
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

    const emailSent = otpRes.ok;
    const otpResult = await otpRes.json().catch(() => ({}));
    const otpError = emailSent ? null : (otpResult?.error_description ?? otpResult?.message ?? 'OTP send failed');

    return new Response(
      JSON.stringify({ success: emailSent, emailSent, customerEmail, error: otpError, esimDetails }),
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
