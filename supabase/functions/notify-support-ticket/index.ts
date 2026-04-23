const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPPORT_EMAIL = 'suporte@palopconnect.com';
const FROM_EMAIL = 'BuéChama Suporte <esims@palopconnect.com>';

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';
    if (!resendApiKey) {
      console.warn('[notify-support-ticket] RESEND_API_KEY not set — notification skipped');
      return new Response(JSON.stringify({ success: false, error: 'RESEND_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { ticket_id, name, email, category, subject, message, order_id, device } = body;

    const categoryLabel = subject || category || '(sem categoria)';
    const messageHtml = (message ?? '').replace(/\n/g, '<br>');

    const ROW = (label: string, value: string, extra = '') =>
      `<tr style="border-top:1px solid #e5e7eb;${extra}">
        <td style="padding:10px 16px;color:#6b7280;font-size:13px;width:130px;vertical-align:top">${label}</td>
        <td style="padding:10px 16px;font-size:13px;color:#111827">${value}</td>
      </tr>`;

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

        <tr><td style="background:#1d4ed8;padding:24px 40px;">
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">&#128233; Novo pedido de suporte</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">BuéChama · PALOP Roam Connect</p>
        </td></tr>

        <tr><td style="padding:24px 40px 0;">
          <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
            <tr style="background:#f9fafb;">
              <td colspan="2" style="padding:10px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6b7280">Detalhes do contacto</td>
            </tr>
            ${ROW('Nome', `<strong>${name ?? '(sem nome)'}</strong>`)}
            ${ROW('Email', `<a href="mailto:${email}" style="color:#1d4ed8">${email ?? '(sem email)'}</a>`)}
            ${ROW('Categoria', `<span style="background:#eff6ff;color:#1d4ed8;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600">${categoryLabel}</span>`)}
            ${order_id ? ROW('Encomenda', `<code>${order_id}</code>`) : ''}
            ${device ? ROW('Dispositivo', device) : ''}
            ${ticket_id ? ROW('ID do ticket', `<code style="color:#6b7280">${ticket_id}</code>`, 'background:#f9fafb;') : ''}
          </table>
        </td></tr>

        <tr><td style="padding:24px 40px 32px;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#6b7280">Mensagem</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;font-size:14px;color:#374151;line-height:1.7">
            ${messageHtml}
          </div>
          <div style="margin-top:20px;text-align:center;">
            <a href="mailto:${email}?subject=Re:%20${encodeURIComponent(categoryLabel)}"
               style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
              Responder a ${name ?? 'cliente'} &rarr;
            </a>
          </div>
        </td></tr>

        <tr><td style="background:#f9fafb;padding:16px 40px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:11px;color:#9ca3af;">Gerado automaticamente pelo BuéChama · PALOP Roam Connect</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const textBody = [
      'Novo pedido de suporte — BuéChama',
      '',
      `Nome: ${name ?? '(sem nome)'}`,
      `Email: ${email ?? '(sem email)'}`,
      `Categoria: ${categoryLabel}`,
      order_id ? `Encomenda: ${order_id}` : null,
      device ? `Dispositivo: ${device}` : null,
      ticket_id ? `ID do ticket: ${ticket_id}` : null,
      '',
      'Mensagem:',
      '----------',
      message ?? '',
    ].filter(Boolean).join('\n');

    const sendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [SUPPORT_EMAIL],
        reply_to: email ? [email] : undefined,
        subject: `[Suporte] ${categoryLabel} — ${name ?? email ?? 'cliente'}`,
        html,
        text: textBody,
      }),
    });

    if (!sendRes.ok) {
      const err = await sendRes.json().catch(() => ({}));
      console.error(`[notify-support-ticket] Resend error — status=${sendRes.status} msg=${err?.message}`);
      return new Response(JSON.stringify({ success: false, error: err?.message ?? `Resend ${sendRes.status}` }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[notify-support-ticket] sent — category=${category} from=${email}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('[notify-support-ticket] exception:', err?.message);
    return new Response(JSON.stringify({ success: false, error: err?.message ?? 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
