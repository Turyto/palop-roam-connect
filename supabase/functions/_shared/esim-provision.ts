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

import { sendProvisioningEmail } from './esim-email.ts';
export { sendProvisioningEmail };

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
export async function persistESIMRecords(opts: {
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
  /** Provenance tag written into provisioning_log. Defaults to the webhook path tag. */
  writtenBy?: string;
}): Promise<void> {
  const { supabaseUrl, serviceKey, orderId, userId, esimTranNo, iccid, activationCode, qrCodeUrl, shortUrl, packageCode, writtenBy } = opts;
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
          written_by: writtenBy ?? 'stripe-webhook-provision',
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
