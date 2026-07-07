// ---------------------------------------------------------------------------
// PROVISIONING FAILURE NOTIFICATIONS
//   1. Persist the failure reason on the order (orders.esim_failure_reason)
//      so the admin dashboard can show WHY — covers both the webhook path and
//      the client-invoked path with a single writer (service role).
//   2. Send the internal admin alert email.
//   3. Send the customer a bilingual "small delay" email (no technical
//      details, no failure reasons — just reassurance + support contacts).
// Every step is independent: one failing must not block the others.
// ---------------------------------------------------------------------------

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, sentry-trace, baggage',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const ADMIN_EMAIL = Deno.env.get('NOTIFY_ADMIN_EMAIL') ?? 'turyto@gmail.com';
const ALERT_FROM = 'PALOP Connect Alertas <alertas@palopconnect.com>';
const CUSTOMER_FROM = 'BuéChama by PALOP Connect <esims@palopconnect.com>';

function esc(v: unknown): string {
  return String(v ?? '—').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildAdminHtml(p: Record<string, any>): string {
  return `
    <div style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:24px;color:#111;">
      <h2 style="color:#dc2626;margin-bottom:8px;">eSIM Provisioning Failure</h2>
      <p style="color:#555;margin-bottom:24px;">
        A paid order completed Stripe payment but eSIM provisioning with the supplier failed.
        Manual intervention may be required.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:8px 4px;color:#6b7280;width:160px;">Order ID</td>
          <td style="padding:8px 4px;font-family:monospace;word-break:break-all;">${esc(p.order_id)}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:8px 4px;color:#6b7280;">Customer Email</td>
          <td style="padding:8px 4px;">${esc(p.customer_email)}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:8px 4px;color:#6b7280;">Plan</td>
          <td style="padding:8px 4px;">${esc(p.plan_name)} <span style="color:#9ca3af;">(${esc(p.plan_id)})</span></td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:8px 4px;color:#6b7280;">Payment Intent</td>
          <td style="padding:8px 4px;font-family:monospace;word-break:break-all;">${esc(p.payment_intent_id)}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:8px 4px;color:#6b7280;">Package ID</td>
          <td style="padding:8px 4px;font-family:monospace;">${esc(p.esim_package_id)}</td>
        </tr>
        <tr>
          <td style="padding:8px 4px;color:#6b7280;vertical-align:top;">Error</td>
          <td style="padding:8px 4px;color:#dc2626;word-break:break-all;">${esc(p.error_message)}</td>
        </tr>
      </table>
      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />
      <p style="font-size:12px;color:#9ca3af;">
        BuéChama · PALOP Connect · Admin Alert<br/>
        Admin dashboard: <a href="https://palopconnect.com/admin/dashboard">palopconnect.com/admin/dashboard</a>
      </p>
    </div>
  `;
}

function buildCustomerDelayHtml(planName: string | null): string {
  const plan = planName ? ` (${planName})` : '';
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#14532d,#16a34a);padding:32px 40px;">
          <p style="margin:0 0 6px;color:#bbf7d0;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">PALOP Connect</p>
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;line-height:1.3;">O seu eSIM está a caminho — pequeno atraso</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:13px;">Your eSIM is on its way — small delay</p>
        </td></tr>
        <tr><td style="padding:28px 40px;">
          <p style="margin:0 0 14px;font-size:14px;color:#3f3f46;line-height:1.6;">
            Olá! O seu pagamento foi confirmado com sucesso${plan}, mas a activação do seu eSIM
            está a demorar um pouco mais do que o habitual. A nossa equipa já foi notificada e
            está a tratar do assunto — receberá o seu eSIM por email muito em breve.
          </p>
          <p style="margin:0 0 20px;font-size:14px;color:#3f3f46;line-height:1.6;">
            <strong>Não é necessário fazer nada</strong> — não precisa de comprar novamente
            nem de contactar o banco. O seu pedido está seguro.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px;" />
          <p style="margin:0 0 14px;font-size:13px;color:#71717a;line-height:1.6;">
            Hello! Your payment was confirmed successfully${plan}, but your eSIM activation is
            taking a little longer than usual. Our team has been notified and is on it — you
            will receive your eSIM by email very soon.
          </p>
          <p style="margin:0 0 20px;font-size:13px;color:#71717a;line-height:1.6;">
            <strong>No action needed</strong> — please don't purchase again or contact your bank.
            Your order is safe.
          </p>
          <div style="background:#f4f4f5;border-radius:10px;padding:16px 20px;">
            <p style="margin:0 0 6px;font-size:12px;color:#16a34a;font-weight:800;text-transform:uppercase;letter-spacing:.06em;">Precisa de ajuda? · Need help?</p>
            <p style="margin:0;font-size:13px;color:#3f3f46;line-height:1.7;">
              WhatsApp: <a href="https://wa.me/351911186695" style="color:#16a34a;">+351 911 186 695</a> (8h–20h)<br/>
              Email: <a href="mailto:suporte@palopconnect.com" style="color:#16a34a;">suporte@palopconnect.com</a>
            </p>
          </div>
        </td></tr>
        <tr><td style="padding:0 40px 28px;">
          <p style="margin:0;font-size:11px;color:#a1a1aa;">PALOP Connect · palopconnect.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendEmail(resendKey: string, payload: Record<string, unknown>): Promise<{ ok: boolean; id?: string; error?: unknown }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => null);
  return res.ok ? { ok: true, id: body?.id } : { ok: false, error: body };
}

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

    const body = await req.json();
    const order_id = typeof body?.order_id === 'string' ? body.order_id : null;
    const error_message = body?.error_message ? String(body.error_message).slice(0, 500) : null;

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Parse caller JWT claims (signature already validated by verify_jwt).
    let callerRole: string | null = null;
    let callerSub: string | null = null;
    try {
      const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
      const claims = JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      callerRole = claims?.role ?? null;
      callerSub = claims?.sub ?? null;
    } catch (_) { /* parse only */ }

    // --- ANOMALY PATH: service-role callers (stripe-webhook) may raise an
    // admin-only alert with no order row (e.g. webhook received payment for an
    // unknown order). Admin alert only — never emails customers, never writes.
    if (!order_id) {
      if (callerRole !== 'service_role') {
        return new Response(JSON.stringify({ error: 'order_id required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const anomalyResult = await sendEmail(resendKey, {
        from: ALERT_FROM,
        to: [ADMIN_EMAIL],
        subject: `[Alert] eSIM webhook anomaly — ${esc(body?.error_type ?? 'unknown')}`,
        html: buildAdminHtml({
          order_id: null,
          customer_email: typeof body?.customer_email === 'string' ? body.customer_email.slice(0, 200) : null,
          plan_id: null,
          plan_name: null,
          payment_intent_id: typeof body?.payment_intent_id === 'string' ? body.payment_intent_id.slice(0, 100) : null,
          esim_package_id: null,
          error_message,
        }),
      });
      return new Response(JSON.stringify({ success: anomalyResult.ok, resend_id: anomalyResult.id ?? null }), {
        status: anomalyResult.ok ? 200 : 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- AUTHORIZATION: never trust the caller's payload. Load the order with
    // the service role and only act when it is genuinely a paid order whose
    // provisioning failed. All emails/plan data come from the DB row, so a
    // malicious caller cannot trigger emails to arbitrary addresses or poison
    // alerts for healthy orders.
    const restHeaders = {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    };
    const orderRes = await fetch(
      `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(order_id)}&select=id,user_id,customer_email,plan_id,plan_name,payment_intent_id,esim_package_id,payment_status,esim_status,status,esim_failure_reason,failure_notified_at,customer_notified_at&limit=1`,
      { headers: restHeaders },
    );
    const orderRows = await orderRes.json().catch(() => []);
    const order = Array.isArray(orderRows) ? orderRows[0] : null;
    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- CALLER ENTITLEMENT: only the service role (webhook), the order's
    // owner, or an admin may trigger notifications for this order.
    let entitled = callerRole === 'service_role';
    if (!entitled && callerSub) {
      if (callerSub === order.user_id) {
        entitled = true;
      } else {
        const profRes = await fetch(
          `${supabaseUrl}/rest/v1/profiles?id=eq.${encodeURIComponent(callerSub)}&select=role&limit=1`,
          { headers: restHeaders },
        );
        const prof = (await profRes.json().catch(() => []))?.[0];
        entitled = prof?.role === 'admin';
      }
    }
    if (!entitled) {
      console.warn(`[notify-failure] rejected — caller not entitled to order=${order_id}`);
      return new Response(JSON.stringify({ error: 'Not authorized for this order' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- IDEMPOTENCY (per channel): admin alert gated on failure_notified_at,
    // customer email gated on customer_notified_at. A failed admin send never
    // blocks a retry of the admin alert, and vice versa.
    const adminAlreadyNotified = !!order.failure_notified_at;
    const customerAlreadyNotified = !!order.customer_notified_at;
    if (adminAlreadyNotified && customerAlreadyNotified) {
      return new Response(JSON.stringify({ success: true, already_notified: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const eligible =
      order.payment_status === 'succeeded' &&
      order.esim_status === 'failed' &&
      order.status !== 'completed' &&
      order.status !== 'cancelled';
    if (!eligible) {
      console.warn(`[notify-failure] rejected — order=${order_id} not in failed-after-payment state`);
      return new Response(JSON.stringify({ error: 'Order not eligible for failure notification' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = {
      order_id: order.id,
      customer_email: order.customer_email ?? null,
      plan_id: order.plan_id ?? null,
      plan_name: order.plan_name ?? null,
      payment_intent_id: order.payment_intent_id ?? null,
      esim_package_id: order.esim_package_id ?? null,
      error_message: error_message ?? order.esim_failure_reason ?? null,
    };
    const { customer_email, plan_id, plan_name } = payload;

    // --- 1. Persist failure reason (only if not already set — webhook wrote first) ---
    let reasonPersisted = false;
    if (error_message && !order.esim_failure_reason) {
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(order_id)}&esim_failure_reason=is.null`, {
          method: 'PATCH',
          headers: { ...restHeaders, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ esim_failure_reason: error_message }),
        });
        reasonPersisted = res.ok;
        if (!res.ok) console.error(`[notify-failure] reason persist failed — status=${res.status} order=${order_id}`);
      } catch (e: any) {
        console.error(`[notify-failure] reason persist exception — order=${order_id} ${e?.message}`);
      }
    }

    // Helper to stamp a per-channel notified-at timestamp (guarded, best-effort)
    const stamp = async (column: string) => {
      try {
        await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(order_id)}&${column}=is.null`, {
          method: 'PATCH',
          headers: { ...restHeaders, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ [column]: new Date().toISOString() }),
        });
      } catch (e: any) {
        console.error(`[notify-failure] ${column} persist exception — order=${order_id} ${e?.message}`);
      }
    };

    // --- 2. Admin alert (skipped only if a previous admin alert succeeded) ---
    let adminResult: { ok: boolean; id?: string; error?: unknown } = { ok: true };
    if (!adminAlreadyNotified) {
      adminResult = await sendEmail(resendKey, {
        from: ALERT_FROM,
        to: [ADMIN_EMAIL],
        subject: `[Alert] eSIM provisioning FAILED — ${plan_name ?? plan_id}`,
        html: buildAdminHtml(payload),
      });
      if (adminResult.ok) {
        console.log(`[notify-failure] admin alert sent — resendId=${adminResult.id} order=${order_id}`);
        await stamp('failure_notified_at');
      } else {
        console.error('[notify-failure] admin alert send failed:', JSON.stringify(adminResult.error));
      }
    }

    // --- 3. Customer "small delay" email (bilingual, no technical details) ---
    let customerResult: { ok: boolean; id?: string; error?: unknown } | null = null;
    if (customer_email && !customerAlreadyNotified) {
      customerResult = await sendEmail(resendKey, {
        from: CUSTOMER_FROM,
        to: [customer_email],
        subject: 'O seu eSIM está a caminho — pequeno atraso · Your eSIM is on its way',
        html: buildCustomerDelayHtml(plan_name ?? null),
      });
      // GDPR: log order id only, never the customer email
      if (customerResult.ok) {
        console.log(`[notify-failure] customer delay email sent — resendId=${customerResult.id} order=${order_id}`);
        await stamp('customer_notified_at');
      } else {
        console.error(`[notify-failure] customer delay email failed — order=${order_id}`, JSON.stringify(customerResult.error));
      }
    }

    return new Response(JSON.stringify({
      success: adminResult.ok,
      resend_id: adminResult.id ?? null,
      admin_already_notified: adminAlreadyNotified,
      customer_already_notified: customerAlreadyNotified,
      reason_persisted: reasonPersisted,
      customer_email_sent: customerResult?.ok ?? false,
    }), {
      status: adminResult.ok ? 200 : 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('notify-provisioning-failure error:', err);
    return new Response(JSON.stringify({ error: err.message ?? 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
