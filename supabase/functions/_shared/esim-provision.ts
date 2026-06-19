// ---------------------------------------------------------------------------
// SHARED eSIM PROVISIONING — authoritative server-side provisioning logic.
//
// This module is the single source of truth for turning a PAID order into a
// provisioned eSIM (supplier order → ICCID/LPA/QR → persisted rows → email).
// It is invoked from the stripe-webhook (the authoritative provisioner) so the
// outcome no longer depends on the customer's browser staying open.
//
// The logic here mirrors the proven path in functions/esim-access (createOrder
// + fetchESIMDetails + persist + email). It runs with the service role and
// trusts the order row it is given (the caller already verified payment).
// ---------------------------------------------------------------------------

const ESIM_ACCESS_BASE_URL = 'https://api.esimaccess.com/api/v1/open';

export interface ESIMAccessCredentials {
  accessCode: string;
  secretKey: string;
}

export interface ProvisionOrderInput {
  orderId: string;
  userId: string;
  packageCode: string;
  customerEmail: string | null;
  planName: string | null;
  dataAmount: string | null;
  /** Used as the supplier outOrder/transactionId for idempotency. */
  referenceId: string;
}

export interface ProvisionOptions {
  supabaseUrl: string;
  serviceKey: string;
  creds: ESIMAccessCredentials;
  resendApiKey: string;
  origin: string;
}

export interface ProvisionResult {
  success: boolean;
  esimTranNo?: string | null;
  iccid?: string | null;
  activationCode?: string | null;
  qrCodeUrl?: string | null;
  shortUrl?: string | null;
  error?: string;
  errorCode?: string;
}

// ---------------------------------------------------------------------------
// Signed request headers for the eSIM Access API.
// ---------------------------------------------------------------------------
async function buildESIMHeaders(creds: ESIMAccessCredentials): Promise<Record<string, string>> {
  const timestamp = Date.now().toString();
  const requestId = crypto.randomUUID().replace(/-/g, '');

  const signString = creds.accessCode + timestamp + requestId;
  const keyBytes = new TextEncoder().encode(creds.secretKey);

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign'],
  );
  const sigBytes = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(signString));
  const signature = Array.from(new Uint8Array(sigBytes))
    .map((b) => b.toString(16).padStart(2, '0')).join('');

  return {
    'Content-Type': 'application/json',
    'RT-AccessCode': creds.accessCode,
    'RT-Timestamp': timestamp,
    'RT-RequestID': requestId,
    'RT-Signature': signature,
  };
}

// ---------------------------------------------------------------------------
// Poll /esim/query after order creation to retrieve ICCID/LPA/QR (async provisioning).
// ---------------------------------------------------------------------------
async function fetchESIMDetails(
  orderNo: string,
  packageCode: string,
  creds: ESIMAccessCredentials,
  maxAttempts = 4,
) {
  const delays = [0, 5000, 10000, 20000];

  function extractESIMList(obj: any): any[] | null {
    const flatList: any[] = obj?.esimList ?? [];
    const nestedList: any[] = obj?.packageInfoList?.[0]?.esimList ?? [];
    const directList: any[] = Array.isArray(obj) ? obj : [];
    const esimList = flatList.length > 0 ? flatList
      : nestedList.length > 0 ? nestedList
      : directList;
    return esimList.length > 0 ? esimList : null;
  }

  function buildResult(entry: any) {
    const activationCode = entry?.activationCode ?? entry?.ac ?? null;
    return {
      iccid: entry?.iccid ?? null,
      activationCode,
      qrCodeUrl: entry?.qrCodeUrl ?? null,
      shortUrl: entry?.shortUrl ?? entry?.downloadUrl ?? entry?.url ?? null,
    };
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (delays[attempt] > 0) {
      await new Promise((r) => setTimeout(r, delays[attempt]));
    }
    console.log(`[provision/fetch-details] attempt ${attempt + 1}/${maxAttempts} — orderNo=${orderNo} packageCode=${packageCode}`);

    // Strategy 1: direct lookup by esimTranNo
    try {
      const body1 = JSON.stringify({ esimTranNo: orderNo });
      const headers1 = await buildESIMHeaders(creds);
      const res1 = await fetch(`${ESIM_ACCESS_BASE_URL}/esim/query`, { method: 'POST', headers: headers1, body: body1 });
      const text1 = await res1.text();
      let data1: any;
      try { data1 = JSON.parse(text1); } catch { /* ignore */ }
      if (data1?.success === true) {
        const list1 = extractESIMList(data1?.obj);
        if (list1) {
          const entry = list1.find((e: any) => e.iccid) ?? list1[0];
          const result = buildResult(entry);
          if (result.iccid || result.activationCode) {
            console.log(`[provision/fetch-details] S1 found — iccid=${result.iccid} hasLPA=${!!result.activationCode}`);
            return result;
          }
        }
      }
    } catch (e: any) {
      console.error(`[provision/fetch-details] S1 attempt=${attempt + 1} exception — ${e.message}`);
    }

    // Strategy 2: list by packageCode, match/newest
    try {
      const body2 = JSON.stringify({ pager: { pageNum: 1, pageSize: 20 }, packageCode });
      const headers2 = await buildESIMHeaders(creds);
      const res2 = await fetch(`${ESIM_ACCESS_BASE_URL}/esim/query`, { method: 'POST', headers: headers2, body: body2 });
      const text2 = await res2.text();
      let data2: any;
      try { data2 = JSON.parse(text2); } catch { continue; }
      if (data2?.success !== true) {
        console.log(`[provision/fetch-details] S2 attempt=${attempt + 1} success=false errorCode=${data2?.errorCode} errorMsg=${data2?.errorMsg}`);
        continue;
      }
      const list2 = extractESIMList(data2?.obj);
      if (!list2 || list2.length === 0) continue;
      const matched = list2.find((e: any) =>
        e.orderNo === orderNo || e.outOrder === orderNo || e.esimTranNo === orderNo,
      ) ?? list2[0];
      const result2 = buildResult(matched);
      if (result2.iccid || result2.activationCode) {
        console.log(`[provision/fetch-details] S2 found — iccid=${result2.iccid} hasLPA=${!!result2.activationCode} hasQR=${!!result2.qrCodeUrl}`);
        return result2;
      }
    } catch (e: any) {
      console.error(`[provision/fetch-details] S2 attempt=${attempt + 1} exception — ${e.message}`);
    }
  }

  console.log(`[provision/fetch-details] all ${maxAttempts} attempts exhausted — credentials not available yet`);
  return null;
}

// ---------------------------------------------------------------------------
// Place the supplier order and resolve its credentials.
// ---------------------------------------------------------------------------
async function createSupplierOrder(input: ProvisionOrderInput, creds: ESIMAccessCredentials): Promise<ProvisionResult> {
  const outOrder = input.referenceId;
  const payload = {
    packageInfoList: [{ packageCode: input.packageCode, count: 1, price: null }],
    userEmail: input.customerEmail ?? '',
    outOrder,
    transactionId: outOrder,
  };
  console.log(`[provision/create-order] supplier call — packageCode=${input.packageCode} outOrder=${outOrder}`);

  try {
    const headers = await buildESIMHeaders(creds);
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/esim/order`, {
      method: 'POST', headers, body: JSON.stringify(payload),
    });
    const text = await res.text();
    console.log(`[provision/create-order] supplier response — status=${res.status} body=${text}`);
    let data: any;
    try { data = JSON.parse(text); } catch { data = { rawResponse: text }; }

    if (data?.success === true) {
      const orderNo: string | null = data?.obj?.orderNo ?? null;
      let esimDetails: Awaited<ReturnType<typeof fetchESIMDetails>> = null;
      if (orderNo) esimDetails = await fetchESIMDetails(orderNo, input.packageCode, creds);
      return {
        success: true,
        esimTranNo: orderNo,
        iccid: esimDetails?.iccid ?? null,
        activationCode: esimDetails?.activationCode ?? null,
        qrCodeUrl: esimDetails?.qrCodeUrl ?? null,
        shortUrl: esimDetails?.shortUrl ?? null,
      };
    }

    console.error(`[provision/create-order] supplier rejected — status=${res.status} errorCode=${data?.errorCode} errorMsg=${data?.errorMsg} packageCode=${input.packageCode} outOrder=${outOrder}`);
    return { success: false, error: data?.errorMsg ?? `HTTP ${res.status}`, errorCode: data?.errorCode };
  } catch (e: any) {
    console.error(`[provision/create-order] exception — message=${e.message} packageCode=${input.packageCode} outOrder=${outOrder}`);
    return { success: false, error: e.message };
  }
}

// ---------------------------------------------------------------------------
// Persist resolved credentials (service role). Existence-checked + idempotent.
// ---------------------------------------------------------------------------
async function persistESIMRecords(opts: {
  supabaseUrl: string;
  serviceKey: string;
  orderId: string;
  userId: string;
  esimTranNo: string | null;
  iccid: string | null;
  activationCode: string | null;
  qrCodeUrl: string | null;
  shortUrl: string | null;
  packageCode: string;
}): Promise<void> {
  const { supabaseUrl, serviceKey, orderId, userId, esimTranNo, iccid, activationCode, qrCodeUrl, shortUrl, packageCode } = opts;
  const restHeaders = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
  };

  // esim_activations — insert only if none exists for this order
  const actCheck = await fetch(`${supabaseUrl}/rest/v1/esim_activations?order_id=eq.${orderId}&select=id&limit=1`, { headers: restHeaders });
  const actExisting = await actCheck.json().catch(() => []);
  if (!Array.isArray(actExisting) || actExisting.length === 0) {
    const res = await fetch(`${supabaseUrl}/rest/v1/esim_activations`, {
      method: 'POST', headers: restHeaders,
      body: JSON.stringify({
        order_id: orderId,
        user_id: userId,
        status: 'pending',
        provisioning_status: 'completed',
        activation_url: shortUrl,
        iccid,
        activation_code: activationCode,
        qr_code_data: activationCode,
        provisioning_log: {
          esim_order_id: esimTranNo,
          created_at: new Date().toISOString(),
          package_code: packageCode,
          iccid,
          qr_code_url: qrCodeUrl,
          short_url: shortUrl,
          lpa_code: activationCode,
          written_by: 'stripe-webhook-provision',
        },
      }),
    });
    if (!res.ok) console.error(`[provision/persist] esim_activations insert failed — status=${res.status} body=${await res.text()}`);
  }

  // qr_codes — insert only if none exists for this order
  const qrCheck = await fetch(`${supabaseUrl}/rest/v1/qr_codes?order_id=eq.${orderId}&select=id&limit=1`, { headers: restHeaders });
  const qrExisting = await qrCheck.json().catch(() => []);
  if (!Array.isArray(qrExisting) || qrExisting.length === 0) {
    const res = await fetch(`${supabaseUrl}/rest/v1/qr_codes`, {
      method: 'POST', headers: restHeaders,
      body: JSON.stringify({
        order_id: orderId,
        user_id: userId,
        esim_id: null,
        qr_image_url: qrCodeUrl ?? null,
        activation_url: activationCode ?? shortUrl ?? null,
        status: 'active',
      }),
    });
    if (!res.ok) console.error(`[provision/persist] qr_codes insert failed — status=${res.status} body=${await res.text()}`);
  }

  // orders — mark provisioned AND completed (P1: order status must reach 'completed').
  // Idempotent: re-running with the same values does not regress an already-completed order.
  const res = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${orderId}`, {
    method: 'PATCH', headers: restHeaders,
    body: JSON.stringify({
      esim_status: 'provisioned',
      status: 'completed',
      completed_at: new Date().toISOString(),
      esim_order_id: esimTranNo,
      esim_package_id: packageCode,
      esim_delivered_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) console.error(`[provision/persist] orders patch failed — status=${res.status} body=${await res.text()}`);
}

// ---------------------------------------------------------------------------
// Customer delivery email (magic link + activation details).
// ---------------------------------------------------------------------------
async function sendProvisioningEmail(opts: {
  customerEmail: string;
  planName: string;
  dataAmount: string;
  iccid: string | null;
  lpaCode: string | null;
  webUrl: string | null;
  qrImageUrl: string | null;
  supabaseUrl: string;
  serviceKey: string;
  resendApiKey: string;
  origin: string;
}): Promise<void> {
  const { customerEmail, planName, dataAmount, iccid, lpaCode, webUrl, qrImageUrl, supabaseUrl, serviceKey, resendApiKey, origin } = opts;

  let magicLink = `${origin || 'https://palopconnect.com'}/orders`;
  try {
    const mlRes = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'magiclink', email: customerEmail, options: { redirect_to: `${origin || 'https://palopconnect.com'}/orders` } }),
    });
    if (mlRes.ok) {
      const mlData = await mlRes.json();
      magicLink = mlData?.action_link ?? magicLink;
    }
  } catch (e: any) {
    console.warn('[provision/email] magic link exception (non-fatal):', e.message);
  }

  const lpaSection = lpaCode
    ? `<div style="background:#f4f4f5;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0 0 6px;font-size:12px;color:#71717a;font-weight:600;text-transform:uppercase;letter-spacing:.05em">LPA Activation Code</p>
        <code style="font-size:13px;color:#18181b;word-break:break-all;line-height:1.6">${lpaCode}</code>
      </div>` : '';
  const iccidSection = iccid
    ? `<p style="margin:4px 0;font-size:14px;color:#52525b"><strong>ICCID:</strong> <code>${iccid}</code></p>` : '';
  const qrSection = qrImageUrl
    ? `<div style="text-align:center;margin:20px 0;">
        <img src="${qrImageUrl}" alt="eSIM QR Code" width="180" height="180" style="border:3px solid #16a34a;border-radius:8px;padding:6px;" />
        <p style="font-size:12px;color:#71717a;margin:8px 0 0">Scan this QR code on your device to install the eSIM</p>
      </div>` : '';
  const webUrlSection = webUrl
    ? `<div style="text-align:center;margin:16px 0;">
        <a href="${webUrl}" style="color:#2563eb;font-size:13px;">Or tap here to activate on your device</a>
      </div>` : '';

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#16a34a,#1d4ed8);padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">O teu eSIM está pronto! 🌍</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">BuéChama · PALOP Roam Connect</p>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p style="margin:0 0 20px;font-size:15px;color:#374151;">
            O teu <strong>${planName || 'eSIM'}</strong>${dataAmount ? ` (${dataAmount})` : ''} foi aprovisionado e está pronto para instalar.
            Aqui estão os teus dados de ativação:
          </p>
          ${qrSection}
          ${lpaSection}
          ${iccidSection}
          ${webUrlSection}
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
          <h2 style="margin:0 0 12px;font-size:16px;color:#18181b;">Como instalar</h2>
          <ol style="margin:0;padding:0 0 0 20px;font-size:14px;color:#52525b;line-height:2;">
            <li>Vai a <strong>Definições → Dados Móveis / Celular</strong></li>
            <li>Toca em <strong>"Adicionar eSIM"</strong> ou <strong>"Adicionar Plano de Dados"</strong></li>
            <li>Digitaliza o código QR acima, ou introduz o código LPA manualmente</li>
          </ol>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
          <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;text-align:center;">
            <p style="margin:0 0 12px;font-size:14px;color:#1e40af;">
              <strong>Acede ao histórico das tuas encomendas</strong><br>
              Clica abaixo para entrar instantaneamente — sem palavra-passe.
            </p>
            <a href="${magicLink}" style="display:inline-block;background:#1d4ed8;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">
              Ver as minhas encomendas →
            </a>
            <p style="margin:12px 0 0;font-size:11px;color:#6b7280;">Este link expira em 1 hora.</p>
          </div>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">BuéChama · PALOP Roam Connect · <a href="mailto:suporte@palopconnect.com" style="color:#9ca3af;">suporte@palopconnect.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const textBody = [
    `O teu eSIM está pronto — BuéChama`,
    `Plano: ${planName || 'eSIM'}${dataAmount ? ` (${dataAmount})` : ''}`,
    iccid ? `ICCID: ${iccid}` : '',
    lpaCode ? `Código LPA: ${lpaCode}` : '',
    webUrl ? `URL de ativação: ${webUrl}` : '',
    ``,
    `Ver encomendas: ${magicLink}`,
    `(Link expira em 1 hora)`,
  ].filter(Boolean).join('\n');

  const sendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'BuéChama <esims@palopconnect.com>',
      to: [customerEmail],
      subject: `O teu eSIM está pronto — ${planName || 'BuéChama'}`,
      html,
      text: textBody,
    }),
  });
  if (!sendRes.ok) {
    const err = await sendRes.json().catch(() => ({}));
    console.error(`[provision/email] Resend failed — status=${sendRes.status} error=${err?.message ?? '(unknown)'} to=${customerEmail}`);
  } else {
    console.log(`[provision/email] sent — to=${customerEmail} plan=${planName}`);
  }
}

// ---------------------------------------------------------------------------
// PUBLIC ENTRYPOINT — provision a paid order end to end.
//   1. Place supplier order + resolve credentials
//   2. Persist activation/qr/order rows (service role)
//   3. Send the customer delivery email (best-effort)
// Returns the supplier outcome. The caller decides how to record failures.
// ---------------------------------------------------------------------------
export async function provisionOrder(input: ProvisionOrderInput, opts: ProvisionOptions): Promise<ProvisionResult> {
  const { supabaseUrl, serviceKey, creds, resendApiKey, origin } = opts;

  const result = await createSupplierOrder(input, creds);
  if (!result.success) return result;

  // Persist credentials authoritatively (idempotent).
  try {
    await persistESIMRecords({
      supabaseUrl,
      serviceKey,
      orderId: input.orderId,
      userId: input.userId,
      esimTranNo: result.esimTranNo ?? null,
      iccid: result.iccid ?? null,
      activationCode: result.activationCode ?? null,
      qrCodeUrl: result.qrCodeUrl ?? null,
      shortUrl: result.shortUrl ?? null,
      packageCode: input.packageCode,
    });
  } catch (e: any) {
    console.error(`[provision] persist failed (non-fatal): ${e?.message}`);
  }

  // Deliver the email (best-effort — never fails the provisioning result).
  if (input.customerEmail && resendApiKey) {
    try {
      await sendProvisioningEmail({
        customerEmail: input.customerEmail,
        planName: input.planName ?? '',
        dataAmount: input.dataAmount ?? '',
        iccid: result.iccid ?? null,
        lpaCode: result.activationCode ?? null,
        webUrl: result.shortUrl ?? null,
        qrImageUrl: result.qrCodeUrl ?? null,
        supabaseUrl,
        serviceKey,
        resendApiKey,
        origin,
      });
    } catch (e: any) {
      console.error(`[provision] email failed (non-fatal): ${e?.message}`);
    }
  } else if (!resendApiKey) {
    console.warn('[provision] RESEND_API_KEY not set — email skipped');
  }

  return result;
}
