const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ESIM_ACCESS_BASE_URL = 'https://api.esimaccess.com/api/v1/open';

interface ESIMAccessCredentials {
  accessCode: string;
  secretKey: string;
}

interface ESIMOrderRequest {
  packageId: string;
  customerEmail: string;
  customerName?: string;
  referenceId?: string;
  planName?: string;
  dataAmount?: string;
}

// ---------------------------------------------------------------------------
// AUTOMATIC EMAIL DELIVERY — called fire-and-forget after create-order success
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
  const {
    customerEmail, planName, dataAmount, iccid, lpaCode, webUrl, qrImageUrl,
    supabaseUrl, serviceKey, resendApiKey, origin,
  } = opts;

  // Generate a magic link so the customer can view their orders without a password
  let magicLink = `${origin || 'https://palopconnect.com'}/orders`;
  try {
    const mlRes = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'magiclink',
        email: customerEmail,
        options: { redirect_to: `${origin || 'https://palopconnect.com'}/orders` },
      }),
    });
    if (mlRes.ok) {
      const mlData = await mlRes.json();
      magicLink = mlData?.action_link ?? magicLink;
    } else {
      console.warn('[esim-access] magic link generation failed — using fallback orders URL');
    }
  } catch (e: any) {
    console.warn('[esim-access] magic link exception (non-fatal):', e.message);
  }

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
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
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
    console.error(`[esim-access] Resend delivery failed — status=${sendRes.status} error=${err?.message ?? '(unknown)'} to=${customerEmail}`);
  } else {
    console.log(`[esim-access] provisioning email sent — to=${customerEmail} plan=${planName}`);
  }
}

async function buildESIMHeaders(creds: ESIMAccessCredentials): Promise<Record<string, string>> {
  const timestamp = Date.now().toString();
  const requestId = crypto.randomUUID().replace(/-/g, '');

  // Sign: HMAC-SHA256(accessCode + timestamp + requestId, secretKey as UTF-8 bytes)
  const signString = creds.accessCode + timestamp + requestId;
  const keyBytes = new TextEncoder().encode(creds.secretKey);

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sigBytes = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(signString));
  const signature = Array.from(new Uint8Array(sigBytes))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    'Content-Type': 'application/json',
    'RT-AccessCode': creds.accessCode,
    'RT-Timestamp': timestamp,
    'RT-RequestID': requestId,
    'RT-Signature': signature,
  };
}

async function verifyUser(supabaseUrl: string, serviceKey: string, token: string): Promise<{ id: string; email: string } | null> {
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${token}`,
      },
    });
    const text = await res.text();
    // Diagnostic logging — token prefix helps identify type (anon key vs user JWT) without leaking secrets
    console.log(`[verifyUser] status=${res.status} tokenPrefix=${token.slice(0, 30)} bodySnippet=${text.slice(0, 200)}`);
    if (!res.ok) {
      console.error(`[verifyUser] auth check failed — status=${res.status} body=${text.slice(0, 300)}`);
      return null;
    }
    let user: any;
    try { user = JSON.parse(text); } catch { return null; }
    if (!user?.id) {
      console.error(`[verifyUser] user object missing id — body=${text.slice(0, 200)}`);
      return null;
    }
    return { id: user.id, email: user.email };
  } catch (e: any) {
    console.error(`[verifyUser] exception: ${e.message}`);
    return null;
  }
}

async function testConnection(creds: ESIMAccessCredentials) {
  try {
    const body = JSON.stringify({ locationCode: 'PT', type: 0, pageSize: 1, pageNum: 1 });
    const headers = await buildESIMHeaders(creds);
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/package/list`, {
      method: 'POST',
      headers,
      body,
    });
    const text = await res.text();
    console.log(`[test-connection] supplier status=${res.status} body=${text}`);
    let data: any;
    try { data = JSON.parse(text); } catch { data = { rawResponse: text }; }
    if (data?.success === true) {
      return { success: true, message: 'eSIM Access API authenticated successfully', data };
    }
    console.error(`[test-connection] supplier auth failed — errorCode=${data?.errorCode} errorMsg=${data?.errorMsg}`);
    return {
      success: false,
      error: `Auth failed — errorCode: ${data?.errorCode}, errorMsg: ${data?.errorMsg}`,
      data,
    };
  } catch (e: any) {
    console.error(`[test-connection] exception — message=${e.message} stack=${e.stack}`);
    return { success: false, error: e.message };
  }
}

async function getPackages(creds: ESIMAccessCredentials, locationCode?: string) {
  const requestPayload = {
    locationCode: locationCode ?? '',
    type: 0,
    pageSize: 100,
    pageNum: 1,
  };
  try {
    console.log(`[get-packages] requesting locationCode=${locationCode ?? '(all)'}`);
    const body = JSON.stringify(requestPayload);
    const headers = await buildESIMHeaders(creds);
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/package/list`, {
      method: 'POST',
      headers,
      body,
    });
    const text = await res.text();
    console.log(`[get-packages] supplier status=${res.status} bodyLength=${text.length}`);
    let data: any;
    try { data = JSON.parse(text); } catch { data = { rawResponse: text }; }
    if (data?.success === true) return { success: true, data };
    console.error(`[get-packages] supplier error — status=${res.status} errorCode=${data?.errorCode} errorMsg=${data?.errorMsg} body=${text}`);
    return {
      success: false,
      error: `errorCode: ${data?.errorCode}, errorMsg: ${data?.errorMsg}`,
      data,
    };
  } catch (e: any) {
    console.error(`[get-packages] exception — message=${e.message} stack=${e.stack}`);
    return { success: false, error: e.message };
  }
}

// ---------------------------------------------------------------------------
// fetchESIMDetails — query /esim/query after order creation to retrieve
// ICCID, LPA activation code, and QR code URL.
//
// The eSIM Access /esim/order endpoint provisions asynchronously: it returns
// only orderNo + transactionId. We need to poll /esim/query to get credentials.
//
// Two strategies per attempt:
//
//   Strategy 1: { esimTranNo: orderNo }
//     The orderNo from /esim/order is an ORDER number, not the eSIM's own
//     esimTranNo. This query returns success=false in practice — kept for
//     logging in case the API behaviour changes.
//
//   Strategy 2: { pager: { pageNum: 1, pageSize: 20 }, packageCode }
//     List the most recent eSIMs for the given package code. The one we just
//     purchased will be near the top. Try to match by orderNo/outOrder field;
//     fall back to esimList[0] (newest). This is the reliable path.
// ---------------------------------------------------------------------------
async function fetchESIMDetails(
  orderNo: string,
  packageCode: string,
  creds: ESIMAccessCredentials,
  maxAttempts = 4,
) {
  // Progressive backoff: attempt 1 is immediate, then 5 s, 10 s, 20 s.
  // Total worst-case wait: ~35 s — well within Supabase's 60 s edge function timeout.
  // Rationale: eSIM Access typically provisions in 3–8 s; the longer tail handles
  // slower batches without hammering the API.
  const delays = [0, 5000, 10000, 20000]; // ms before each attempt

  // Helper: extract the first usable eSIM entry from a /esim/query response obj
  function extractESIMEntry(obj: any, label: string): any | null {
    const flatList: any[] = obj?.esimList ?? [];
    const nestedList: any[] = obj?.packageInfoList?.[0]?.esimList ?? [];
    const directList: any[] = Array.isArray(obj) ? obj : [];
    const esimList = flatList.length > 0 ? flatList
      : nestedList.length > 0 ? nestedList
      : directList;
    console.log(`[fetch-esim-details] ${label} obj keys=${Object.keys(obj ?? {}).join(',')} flatList=${flatList.length} nestedList=${nestedList.length} directList=${directList.length} total=${esimList.length}`);
    if (esimList.length > 0) {
      esimList.forEach((e: any, i: number) => {
        console.log(`[fetch-esim-details] ${label} esimList[${i}] keys=${Object.keys(e).join(',')} iccid=${e.iccid} activeType=${e.activeType} orderNo=${e.orderNo ?? e.outOrder ?? 'n/a'} esimTranNo=${e.esimTranNo ?? 'n/a'}`);
      });
    }
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
      await new Promise(r => setTimeout(r, delays[attempt]));
    }
    console.log(`[fetch-esim-details] attempt ${attempt + 1}/${maxAttempts} — orderNo=${orderNo} packageCode=${packageCode}`);

    // --- Strategy 1: direct lookup by esimTranNo (likely returns success=false) ---
    try {
      const body1 = JSON.stringify({ esimTranNo: orderNo });
      const headers1 = await buildESIMHeaders(creds);
      const res1 = await fetch(`${ESIM_ACCESS_BASE_URL}/esim/query`, {
        method: 'POST', headers: headers1, body: body1,
      });
      const text1 = await res1.text();
      console.log(`[fetch-esim-details] S1 attempt=${attempt + 1} status=${res1.status} body=${text1.slice(0, 500)}`);
      let data1: any;
      try { data1 = JSON.parse(text1); } catch { /* ignore */ }
      if (data1?.success === true) {
        const list1 = extractESIMEntry(data1?.obj, `S1-a${attempt + 1}`);
        if (list1) {
          const entry = list1.find((e: any) => e.iccid) ?? list1[0];
          const result = buildResult(entry);
          if (result.iccid || result.activationCode) {
            console.log(`[fetch-esim-details] S1 found credentials — iccid=${result.iccid} hasLPA=${!!result.activationCode}`);
            return result;
          }
        }
      }
    } catch (e: any) {
      console.error(`[fetch-esim-details] S1 attempt=${attempt + 1} exception — ${e.message}`);
    }

    // --- Strategy 2: list eSIMs by packageCode, match/newest ---
    try {
      const body2 = JSON.stringify({ pager: { pageNum: 1, pageSize: 20 }, packageCode });
      const headers2 = await buildESIMHeaders(creds);
      const res2 = await fetch(`${ESIM_ACCESS_BASE_URL}/esim/query`, {
        method: 'POST', headers: headers2, body: body2,
      });
      const text2 = await res2.text();
      console.log(`[fetch-esim-details] S2 attempt=${attempt + 1} status=${res2.status} body=${text2.slice(0, 1000)}`);
      let data2: any;
      try { data2 = JSON.parse(text2); } catch { continue; }

      if (data2?.success !== true) {
        console.log(`[fetch-esim-details] S2 attempt=${attempt + 1} supplier returned success=false — errorCode=${data2?.errorCode} errorMsg=${data2?.errorMsg}`);
        continue;
      }

      const list2 = extractESIMEntry(data2?.obj, `S2-a${attempt + 1}`);
      if (!list2 || list2.length === 0) {
        console.log(`[fetch-esim-details] S2 attempt=${attempt + 1} — empty list, will retry`);
        continue;
      }

      // Try to match by orderNo / outOrder field first
      const matched = list2.find((e: any) =>
        e.orderNo === orderNo ||
        e.outOrder === orderNo ||
        e.esimTranNo === orderNo
      ) ?? list2[0]; // fallback to newest

      console.log(`[fetch-esim-details] S2 selected entry iccid=${matched?.iccid} esimTranNo=${matched?.esimTranNo} orderNo=${matched?.orderNo ?? matched?.outOrder ?? 'n/a'}`);

      const result2 = buildResult(matched);
      if (result2.iccid || result2.activationCode) {
        console.log(`[fetch-esim-details] S2 found credentials — iccid=${result2.iccid} hasLPA=${!!result2.activationCode} hasQR=${!!result2.qrCodeUrl}`);
        return result2;
      }

      console.log(`[fetch-esim-details] S2 attempt=${attempt + 1} — entry found but no iccid/LPA yet, will retry`);
    } catch (e: any) {
      console.error(`[fetch-esim-details] S2 attempt=${attempt + 1} exception — ${e.message}`);
    }
  }

  console.log(`[fetch-esim-details] all ${maxAttempts} attempts exhausted — eSIM credentials not available yet`);
  return null;
}

async function createOrder(orderData: ESIMOrderRequest, creds: ESIMAccessCredentials) {
  const outOrder = orderData.referenceId ?? `order-${Date.now()}`;
  const payload = {
    packageInfoList: [
      {
        packageCode: orderData.packageId,
        count: 1,
        price: null,
      }
    ],
    userEmail: orderData.customerEmail,
    outOrder,
    transactionId: outOrder,
  };

  // Log request payload (no secrets — credentials are in signed headers only)
  console.log(`[create-order] sending to supplier — payload=${JSON.stringify({
    packageCode: orderData.packageId,
    userEmail: orderData.customerEmail,
    outOrder: payload.outOrder,
  })}`);

  try {
    const body = JSON.stringify(payload);
    const headers = await buildESIMHeaders(creds);
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/esim/order`, {
      method: 'POST',
      headers,
      body,
    });
    const text = await res.text();

    // Always log supplier response
    console.log(`[create-order] supplier response — status=${res.status} body=${text}`);

    let data: any;
    try { data = JSON.parse(text); } catch { data = { rawResponse: text }; }

    if (data?.success === true) {
      // eSIM Access returns only orderNo + transactionId in the create response.
      // Actual eSIM credentials (ICCID, LPA, QR) are provisioned asynchronously
      // and must be fetched via /esim/query.
      const orderNo: string | null = data?.obj?.orderNo ?? null;
      const transactionId: string | null = data?.obj?.transactionId ?? null;

      console.log(`[create-order] order placed — orderNo=${orderNo} transactionId=${transactionId}`);
      console.log(`[create-order] obj keys=${Object.keys(data?.obj ?? {}).join(',')}`);

      // Query for eSIM credentials (retries with backoff until provisioned)
      let esimDetails: { iccid: string | null; activationCode: string | null; qrCodeUrl: string | null; shortUrl: string | null } | null = null;
      if (orderNo) {
        esimDetails = await fetchESIMDetails(orderNo, orderData.packageId, creds);
      }

      console.log(`[create-order] esim details — iccid=${esimDetails?.iccid ?? 'null'} hasLPA=${!!(esimDetails?.activationCode)} hasQR=${!!(esimDetails?.qrCodeUrl)}`);

      return {
        success: true,
        data,
        esimTranNo: orderNo,
        iccid: esimDetails?.iccid ?? null,
        activationCode: esimDetails?.activationCode ?? null,
        qrCodeUrl: esimDetails?.qrCodeUrl ?? null,
        shortUrl: esimDetails?.shortUrl ?? null,
      };
    }

    // Non-2xx or supplier-level failure
    console.error(
      `[create-order] supplier rejected order — ` +
      `httpStatus=${res.status} ` +
      `errorCode=${data?.errorCode} ` +
      `errorMsg=${data?.errorMsg} ` +
      `packageCode=${orderData.packageId} ` +
      `outOrder=${payload.outOrder} ` +
      `fullBody=${text}`
    );
    return {
      success: false,
      error: data?.errorMsg ?? `HTTP ${res.status}`,
      errorCode: data?.errorCode,
      data,
    };
  } catch (e: any) {
    console.error(
      `[create-order] exception before/during supplier call — ` +
      `message=${e.message} ` +
      `stack=${e.stack} ` +
      `packageCode=${orderData.packageId} ` +
      `outOrder=${payload.outOrder}`
    );
    return { success: false, error: e.message };
  }
}

// ---------------------------------------------------------------------------
// STATUS MAPPING — eSIM Access activeType → internal status
// ---------------------------------------------------------------------------
// This is the single authoritative mapping. It is used by:
//   - listESIMs() below (returned in each item for the sync function to consume)
//   - sync-supplier-inventory edge function (applies the same constant)
//
// eSIM Access activeType values (from API docs):
//   1 = Available  — unused, not yet assigned to a customer; sellable
//   2 = Active     — assigned and currently in use by a customer
//   3 = Expired    — past validity period; no longer usable
//   4 = Disabled   — administratively revoked or disabled
//   * = Unknown    — any unrecognized value; treated as 'disabled' for safety
// ---------------------------------------------------------------------------
const ESIM_ACCESS_ACTIVE_TYPE_MAP: Record<number, string> = {
  1: 'available',
  2: 'active',
  3: 'expired',
  4: 'disabled',
};

function mapActiveType(activeType: number): string {
  return ESIM_ACCESS_ACTIVE_TYPE_MAP[activeType] ?? 'disabled';
}

async function listESIMs(
  creds: ESIMAccessCredentials,
  pageNum: number = 1,
  pageSize: number = 100,
  packageCode?: string,
) {
  // /esim/list was removed in API v1.1 (Jun 2023). Replacement: /esim/query
  // Pagination goes inside a "pager" nested object.
  const requestPayload: Record<string, any> = { pager: { pageNum, pageSize } };
  if (packageCode) requestPayload.packageCode = packageCode;

  console.log(`[list-esims] page=${pageNum} pageSize=${pageSize} packageCode=${packageCode ?? '(all)'}`);
  try {
    const body = JSON.stringify(requestPayload);
    const headers = await buildESIMHeaders(creds);
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/esim/query`, {
      method: 'POST',
      headers,
      body,
    });
    const text = await res.text();
    console.log(`[list-esims] supplier status=${res.status} bodyLength=${text.length}`);
    let data: any;
    try { data = JSON.parse(text); } catch { data = { rawResponse: text }; }

    if (data?.success !== true) {
      console.error(
        `[list-esims] supplier error — status=${res.status} ` +
        `errorCode=${data?.errorCode} errorMsg=${data?.errorMsg} body=${text}`
      );
      return {
        success: false,
        error: data?.errorMsg ?? `HTTP ${res.status}`,
        errorCode: data?.errorCode,
        data,
      };
    }

    // Normalize each item: map activeType → status string
    const rawItems: any[] = data?.obj?.esimList ?? data?.obj ?? [];
    const items = rawItems.map((item: any) => ({
      ...item,
      _normalizedStatus: mapActiveType(item.activeType),
      _isSellable: item.activeType === 1,
    }));

    console.log(
      `[list-esims] success — page=${pageNum} itemCount=${items.length} ` +
      `totalCount=${data?.obj?.total ?? 'unknown'}`
    );
    return {
      success: true,
      items,
      total: data?.obj?.total ?? items.length,
      hasMore: items.length === pageSize,
      data,
    };
  } catch (e: any) {
    console.error(`[list-esims] exception — message=${e.message} stack=${e.stack}`);
    return { success: false, error: e.message };
  }
}

async function getOrder(esimTranNo: string, creds: ESIMAccessCredentials) {
  console.log(`[get-order] querying supplier — esimTranNo=${esimTranNo}`);
  try {
    const body = JSON.stringify({ esimTranNo });
    const headers = await buildESIMHeaders(creds);
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/esim/query`, {
      method: 'POST',
      headers,
      body,
    });
    const text = await res.text();
    console.log(`[get-order] supplier response — status=${res.status} body=${text}`);
    let data: any;
    try { data = JSON.parse(text); } catch { data = { rawResponse: text }; }
    if (data?.success === true) return { success: true, data };
    console.error(
      `[get-order] supplier error — ` +
      `httpStatus=${res.status} ` +
      `errorCode=${data?.errorCode} ` +
      `errorMsg=${data?.errorMsg} ` +
      `esimTranNo=${esimTranNo} ` +
      `fullBody=${text}`
    );
    return {
      success: false,
      error: data?.errorMsg ?? `HTTP ${res.status}`,
      errorCode: data?.errorCode,
      data,
    };
  } catch (e: any) {
    console.error(`[get-order] exception — message=${e.message} stack=${e.stack} esimTranNo=${esimTranNo}`);
    return { success: false, error: e.message };
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const user = await verifyUser(supabaseUrl, serviceKey, token);
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const accessCode = Deno.env.get('ESIM_ACCESS_ACCESS_CODE');
    const secretKey = Deno.env.get('ESIM_ACCESS_SECRET_KEY');
    if (!accessCode || !secretKey) {
      console.error('[esim-access] missing credentials — ESIM_ACCESS_ACCESS_CODE or ESIM_ACCESS_SECRET_KEY not set');
      return new Response(JSON.stringify({
        success: false,
        error: 'eSIM Access credentials not configured',
        missing: {
          ESIM_ACCESS_ACCESS_CODE: !accessCode,
          ESIM_ACCESS_SECRET_KEY: !secretKey,
        }
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';
    const origin = req.headers.get('origin') ?? 'https://palopconnect.com';

    const creds: ESIMAccessCredentials = { accessCode, secretKey };
    const { action, ...body } = await req.json();
    console.log(`[esim-access] action=${action} user=${user.email} userId=${user.id}`);

    let response: any;
    switch (action) {
      case 'test-connection':
        response = await testConnection(creds);
        break;
      case 'get-packages':
        response = await getPackages(creds, body.locationCode);
        break;
      case 'create-order': {
        response = await createOrder(body as ESIMOrderRequest, creds);

        // Fire-and-forget provisioning email — does not block or affect the response
        if (response.success && body.customerEmail && resendApiKey) {
          const obj = response.data?.obj;
          const esimEntry = obj?.packageInfoList?.[0]?.esimList?.[0];
          const iccid = esimEntry?.iccid ?? null;
          const lpaCode = esimEntry?.ac ?? esimEntry?.activationCode ?? null;
          const qrImageUrl = esimEntry?.qrCodeUrl ?? null;
          const webUrl = esimEntry?.shortUrl ?? esimEntry?.downloadUrl ?? esimEntry?.url ?? null;

          sendProvisioningEmail({
            customerEmail: body.customerEmail,
            planName: body.planName ?? '',
            dataAmount: body.dataAmount ?? '',
            iccid,
            lpaCode,
            webUrl,
            qrImageUrl,
            supabaseUrl,
            serviceKey,
            resendApiKey,
            origin,
          }).catch((e: any) =>
            console.error('[esim-access] sendProvisioningEmail failed (non-fatal):', e?.message)
          );
        } else if (response.success && !resendApiKey) {
          console.warn('[esim-access] RESEND_API_KEY not set — provisioning email skipped');
        }
        break;
      }
      case 'get-order':
        response = await getOrder(body.orderId ?? body.esimTranNo, creds);
        break;
      case 'download-esim':
        response = await getOrder(body.orderId ?? body.esimTranNo, creds);
        break;
      case 'list-esims':
        response = await listESIMs(
          creds,
          body.pageNum ?? 1,
          body.pageSize ?? 100,
          body.packageCode,
        );
        break;
      default:
        console.error(`[esim-access] unknown action="${action}" from user=${user.email}`);
        response = { success: false, error: `Unknown action: ${action}` };
    }

    // Log any top-level failure before returning
    if (!response.success) {
      console.error(
        `[esim-access] action=${action} failed — ` +
        `error=${response.error} ` +
        `errorCode=${response.errorCode ?? 'n/a'} ` +
        `user=${user.email}`
      );
    }

    return new Response(JSON.stringify(response), {
      status: response.success ? 200 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error(
      `[esim-access] unhandled exception — ` +
      `message=${error?.message ?? '(no message)'} ` +
      `stack=${error?.stack ?? '(no stack)'}`
    );
    return new Response(JSON.stringify({ success: false, error: error.message ?? 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
