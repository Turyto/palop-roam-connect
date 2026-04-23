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

/** Generate a Supabase magic link URL without sending an email. */
async function generateMagicLink(
  supabaseUrl: string,
  serviceKey: string,
  email: string,
  redirectTo: string
): Promise<string | null> {
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'magiclink',
        email,
        options: { redirect_to: redirectTo },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.action_link ?? null;
  } catch {
    return null;
  }
}

/** Send a rich HTML email via Resend containing the magic link + eSIM details. */
async function sendESIMEmail(opts: {
  resendApiKey: string;
  to: string;
  planName: string;
  dataAmount: string;
  magicLink: string;
  iccid: string | null;
  lpaCode: string | null;
  webUrl: string | null;
  qrImageUrl: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const { resendApiKey, to, planName, dataAmount, magicLink, iccid, lpaCode, webUrl, qrImageUrl } = opts;

  const lpaSection = lpaCode
    ? `<div style="background:#f4f4f5;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 6px;font-size:12px;color:#71717a;font-weight:600;text-transform:uppercase;letter-spacing:.05em">LPA Activation Code</p>
        <code style="font-size:13px;color:#18181b;word-break:break-all;line-height:1.6">${lpaCode}</code>
      </div>`
    : '';

  const iccidSection = iccid
    ? `<p style="margin:4px 0;font-size:14px;color:#52525b"><strong>ICCID:</strong> <code>${iccid}</code></p>`
    : '';

  const qrSection = qrImageUrl
    ? `<div style="text-align:center;margin:20px 0;">
        <img src="${qrImageUrl}" alt="eSIM QR Code" width="180" height="180" style="border:3px solid #16a34a;border-radius:8px;padding:6px;" />
        <p style="font-size:12px;color:#71717a;margin:8px 0 0">Scan this QR code on your device to install the eSIM</p>
      </div>`
    : '';

  const webUrlSection = webUrl
    ? `<div style="text-align:center;margin:16px 0;">
        <a href="${webUrl}" style="color:#2563eb;font-size:13px;">Or tap here to activate on your device</a>
      </div>`
    : '';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#16a34a,#1d4ed8);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Your eSIM is Ready! 🌍</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">BuéChama · PALOP Roam Connect</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 20px;font-size:15px;color:#374151;">
            Your <strong>${planName || 'eSIM'}</strong>${dataAmount ? ` (${dataAmount})` : ''} is provisioned and ready to install.
            Here are your activation details:
          </p>

          ${qrSection}
          ${lpaSection}
          ${iccidSection}
          ${webUrlSection}

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">

          <h2 style="margin:0 0 12px;font-size:16px;color:#18181b;">How to install</h2>
          <ol style="margin:0;padding:0 0 0 20px;font-size:14px;color:#52525b;line-height:2;">
            <li>Go to <strong>Settings → Cellular / Mobile Data</strong> on your device</li>
            <li>Tap <strong>"Add eSIM"</strong> or <strong>"Add Data Plan"</strong></li>
            <li>Scan the QR code above, or enter the LPA code manually</li>
          </ol>

          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">

          <!-- Magic link CTA -->
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;text-align:center;">
            <p style="margin:0 0 12px;font-size:14px;color:#1e40af;">
              <strong>Access your order history anytime</strong><br>
              Click below to sign in instantly and view all your eSIMs — no password needed.
            </p>
            <a href="${magicLink}"
               style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
              View My Orders →
            </a>
            <p style="margin:12px 0 0;font-size:11px;color:#6b7280;">This link expires in 1 hour. Request a new one from the orders page.</p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">BuéChama · PALOP Roam Connect · support@buechama.com</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const textBody = [
    `Your eSIM is ready — BuéChama`,
    `Plan: ${planName || 'eSIM'}${dataAmount ? ` (${dataAmount})` : ''}`,
    iccid ? `ICCID: ${iccid}` : '',
    lpaCode ? `LPA Activation Code: ${lpaCode}` : '',
    webUrl ? `Activation URL: ${webUrl}` : '',
    ``,
    `How to install:`,
    `1. Go to Settings → Cellular / Mobile Data`,
    `2. Tap "Add eSIM" or "Add Data Plan"`,
    `3. Scan the QR code or enter the LPA code manually`,
    ``,
    `View your orders: ${magicLink}`,
    `(Link expires in 1 hour)`,
  ].filter(Boolean).join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'BuéChama <esims@palopconnect.com>',
      to: [to],
      subject: `Your eSIM is ready — ${planName || 'BuéChama'}`,
      html,
      text: textBody,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: err?.message ?? `Resend error ${res.status}` };
  }
  return { ok: true };
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

    // Build the redirect URL for the magic link
    const origin = req.headers.get('origin') ?? '';
    const redirectTo = origin ? `${origin}/orders` : `${supabaseUrl}/orders`;

    const esimDetails = { planName, dataAmount, iccid, lpaCode, webUrl, qrImageUrl };

    // --- Primary path: Resend transactional email with magic link + eSIM details ---
    if (resendApiKey) {
      // Generate magic link URL without sending an email
      const magicLink = await generateMagicLink(supabaseUrl, serviceRoleKey, customerEmail, redirectTo);

      if (!magicLink) {
        return new Response(
          JSON.stringify({ error: 'Failed to generate magic link. Please try again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const emailResult = await sendESIMEmail({
        resendApiKey,
        to: customerEmail,
        planName,
        dataAmount,
        magicLink,
        iccid,
        lpaCode,
        webUrl,
        qrImageUrl,
      });

      if (!emailResult.ok) {
        return new Response(
          JSON.stringify({ success: false, error: emailResult.error }),
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
