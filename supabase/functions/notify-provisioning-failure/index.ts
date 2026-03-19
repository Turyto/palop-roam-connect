const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = 'turyto@gmail.com';
const FROM_EMAIL = 'BuéChama Alerts <onboarding@resend.dev>';

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (!resendKey) {
      console.error('RESEND_API_KEY not configured — alert not sent');
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const {
      order_id,
      customer_email,
      plan_id,
      plan_name,
      payment_intent_id,
      esim_package_id,
      error_message,
    } = await req.json();

    const subject = `[Alert] eSIM provisioning FAILED — ${plan_name ?? plan_id}`;

    const html = `
      <div style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:24px;color:#111;">
        <h2 style="color:#dc2626;margin-bottom:8px;">eSIM Provisioning Failure</h2>
        <p style="color:#555;margin-bottom:24px;">
          A paid order completed Stripe payment but eSIM provisioning with the supplier failed.
          Manual intervention may be required.
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px 4px;color:#6b7280;width:160px;">Order ID</td>
            <td style="padding:8px 4px;font-family:monospace;word-break:break-all;">${order_id ?? '—'}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px 4px;color:#6b7280;">Customer Email</td>
            <td style="padding:8px 4px;">${customer_email ?? '—'}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px 4px;color:#6b7280;">Plan</td>
            <td style="padding:8px 4px;">${plan_name ?? '—'} <span style="color:#9ca3af;">(${plan_id ?? '—'})</span></td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px 4px;color:#6b7280;">Payment Intent</td>
            <td style="padding:8px 4px;font-family:monospace;word-break:break-all;">${payment_intent_id ?? '—'}</td>
          </tr>
          <tr style="border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px 4px;color:#6b7280;">Package ID</td>
            <td style="padding:8px 4px;font-family:monospace;">${esim_package_id ?? '—'}</td>
          </tr>
          <tr>
            <td style="padding:8px 4px;color:#6b7280;vertical-align:top;">Error</td>
            <td style="padding:8px 4px;color:#dc2626;word-break:break-all;">${error_message ?? '—'}</td>
          </tr>
        </table>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />
        <p style="font-size:12px;color:#9ca3af;">
          BuéChama · PALOP Connect · Admin Alert<br/>
          Query failed orders: <code>SELECT * FROM esim_activations WHERE provisioning_status = 'failed'</code>
        </p>
      </div>
    `;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        subject,
        html,
      }),
    });

    const resendBody = await resendRes.json();

    if (!resendRes.ok) {
      console.error('Resend error:', resendBody);
      return new Response(JSON.stringify({ error: 'Email delivery failed', details: resendBody }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Provisioning failure alert sent. Resend ID:', resendBody?.id);
    return new Response(JSON.stringify({ success: true, resend_id: resendBody?.id }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('notify-provisioning-failure error:', err);
    return new Response(JSON.stringify({ error: err.message ?? 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
