// ---------------------------------------------------------------------------
// SHARED eSIM ACCESS TOP-UP — applies a TOPUP_* package to an existing eSIM.
//
// Endpoint verified against the live API (2026-07-28):
//   POST /esim/topup  { iccid | esimTranNo, packageCode, transactionId }
// transactionId is the supplier-side idempotency key — we always pass the
// Stripe PaymentIntent id so a retried webhook can never buy twice.
// ---------------------------------------------------------------------------

const ESIM_ACCESS_BASE_URL = 'https://api.esimaccess.com/api/v1/open';

export interface ESIMAccessCredentials {
  accessCode: string;
  secretKey: string;
}

async function buildESIMHeaders(creds: ESIMAccessCredentials): Promise<Record<string, string>> {
  const timestamp = Date.now().toString();
  const requestId = crypto.randomUUID().replace(/-/g, '');
  const signString = creds.accessCode + timestamp + requestId;
  const cryptoKey = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(creds.secretKey),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sigBytes = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(signString));
  const signature = Array.from(new Uint8Array(sigBytes)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return {
    'Content-Type': 'application/json',
    'RT-AccessCode': creds.accessCode,
    'RT-Timestamp': timestamp,
    'RT-RequestID': requestId,
    'RT-Signature': signature,
  };
}

export interface TopUpResult {
  success: boolean;
  /** Supplier reference for the applied top-up, when returned. */
  supplierOrderNo?: string | null;
  error?: string;
  errorCode?: string;
}

export async function topUpESIM(
  input: { iccid: string; packageCode: string; transactionId: string },
  creds: ESIMAccessCredentials,
): Promise<TopUpResult> {
  try {
    const headers = await buildESIMHeaders(creds);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    let res: Response;
    try {
      res = await fetch(`${ESIM_ACCESS_BASE_URL}/esim/topup`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          iccid: input.iccid,
          packageCode: input.packageCode,
          transactionId: input.transactionId,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.success) {
      return {
        success: false,
        errorCode: body?.errorCode ?? String(res.status),
        error: body?.errorMsg ?? `Supplier top-up HTTP ${res.status}`,
      };
    }
    const obj = body?.obj ?? {};
    return {
      success: true,
      supplierOrderNo: obj?.orderNo ?? obj?.esimTranNo ?? obj?.transactionId ?? null,
    };
  } catch (e: any) {
    return { success: false, error: e?.message ?? 'Supplier top-up request failed' };
  }
}
