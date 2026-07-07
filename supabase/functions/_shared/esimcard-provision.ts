// ---------------------------------------------------------------------------
// SHARED eSIMCard PROVISIONING — second supplier (portal.esimcard.com).
//
// Mirrors the eSIM Access flow in esim-provision.ts: turn a PAID order into a
// provisioned eSIM (login → purchase → resolve ICCID/LPA/QR → persist → email).
// Reuses persistESIMRecords + sendProvisioningEmail from esim-provision.ts so
// the persisted row shape and customer email are identical across suppliers.
//
// The eSIM Access code path is untouched — this module is only invoked when
// esim_packages.supplier === 'esimcard'.
// ---------------------------------------------------------------------------

import {
  persistESIMRecords,
  sendProvisioningEmail,
  type ProvisionOrderInput,
  type ProvisionResult,
} from './esim-provision.ts';

const ESIMCARD_BASE_URL = 'https://portal.esimcard.com/api/developer/reseller';

export interface ESIMCardCredentials {
  email: string;
  password: string;
}

export interface ESIMCardProvisionOptions {
  supabaseUrl: string;
  serviceKey: string;
  creds: ESIMCardCredentials;
  resendApiKey: string;
  origin: string;
  /** Provenance tag for provisioning_log.written_by */
  writtenBy?: string;
}

// ---------------------------------------------------------------------------
// Login → short-lived Bearer token. Credentials never leave the server.
// ---------------------------------------------------------------------------
async function login(creds: ESIMCardCredentials): Promise<string | null> {
  try {
    const res = await fetch(`${ESIMCARD_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email: creds.email, password: creds.password }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.access_token) {
      console.error(`[esimcard/login] failed — status=${res.status} hasToken=${!!data?.access_token}`);
      return null;
    }
    return data.access_token as string;
  } catch (e: any) {
    console.error(`[esimcard/login] exception — ${e.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Field extraction — the reseller API returns the eSIM profile under data.sim
// (purchase) or data.sim / data (details). Field names vary across responses,
// so scan the common variants defensively.
// ---------------------------------------------------------------------------
function extractSimFields(sim: any): {
  simId: string | null;
  iccid: string | null;
  activationCode: string | null;
  qrCodeUrl: string | null;
  shortUrl: string | null;
} {
  if (!sim || typeof sim !== 'object') {
    return { simId: null, iccid: null, activationCode: null, qrCodeUrl: null, shortUrl: null };
  }
  // Log field names only (never values — GDPR: no PII/credentials in logs)
  console.log(`[esimcard/extract] sim keys=${Object.keys(sim).join(',')}`);

  const iccid: string | null = sim.iccid ?? null;
  const simId: string | null = sim.id ?? null;

  // LPA activation code: either provided directly, or derivable from
  // smdp address + matching id (LPA:1$<smdp>$<matching_id>).
  let activationCode: string | null =
    sim.lpa ?? sim.lpa_code ?? sim.activation_code ?? sim.qr_code_text ?? null;
  const smdp = sim.smdp_address ?? sim.smdp ?? sim.smdp_server ?? null;
  const matchingId = sim.matching_id ?? sim.matchingId ?? sim.activationCode ?? null;
  if (!activationCode && smdp && matchingId) {
    activationCode = `LPA:1$${smdp}$${matchingId}`;
  }
  if (activationCode && !activationCode.startsWith('LPA:')) {
    // Some responses return the bare carddata string
    if (activationCode.includes('$')) activationCode = `LPA:${activationCode.replace(/^LPA:/, '')}`;
  }

  const qrCodeUrl: string | null =
    sim.qr_code_url ?? sim.qrcode_url ?? sim.qr_code ?? sim.qrcode ?? sim.qr ?? null;
  const shortUrl: string | null =
    sim.universal_link ?? sim.apple_installation_url ?? sim.direct_apple_installation_url ?? sim.share_link ?? null;

  return { simId, iccid, activationCode, qrCodeUrl, shortUrl };
}

// ---------------------------------------------------------------------------
// Poll until the profile is ready. Purchase can be "delayed" — supplier says
// wait ~2 minutes then check MY ESIMS.
//
// Correlation is DETERMINISTIC only: we look up by the sim id from the
// purchase response, or match the /my-esims list by the ICCID from the
// purchase response. We NEVER pick "the newest" list entry — under concurrent
// purchases that could bind another customer's SIM to this order.
// ---------------------------------------------------------------------------
async function fetchESIMCardDetails(
  token: string,
  simId: string | null,
  iccid: string | null,
  maxAttempts = 5,
): Promise<ReturnType<typeof extractSimFields> | null> {
  if (!simId && !iccid) {
    console.log('[esimcard/fetch-details] no simId or iccid to correlate — skipping poll (manual resolution required)');
    return null;
  }
  const delays = [0, 5000, 10000, 20000, 30000];
  const authHeaders = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (delays[attempt] > 0) await new Promise((r) => setTimeout(r, delays[attempt]));
    console.log(`[esimcard/fetch-details] attempt ${attempt + 1}/${maxAttempts} — simId=${simId ?? 'null'} iccid=${iccid ?? 'null'}`);

    try {
      let sim: any = null;
      if (simId) {
        const res = await fetch(`${ESIMCARD_BASE_URL}/my-esims/${simId}`, { headers: authHeaders });
        const data = await res.json().catch(() => null);
        sim = data?.data?.sim ?? data?.data ?? null;
      } else if (iccid) {
        // Correlate strictly by ICCID from the purchase response
        const res = await fetch(`${ESIMCARD_BASE_URL}/my-esims?page=1`, { headers: authHeaders });
        const data = await res.json().catch(() => null);
        const list: any[] = Array.isArray(data?.data) ? data.data : [];
        const match = list.find((s: any) => s?.iccid === iccid) ?? null;
        if (match?.id) {
          const dRes = await fetch(`${ESIMCARD_BASE_URL}/my-esims/${match.id}`, { headers: authHeaders });
          const dData = await dRes.json().catch(() => null);
          sim = dData?.data?.sim ?? dData?.data ?? match;
        } else {
          sim = match;
        }
      }
      if (sim) {
        const fields = extractSimFields(sim);
        // Guard against supplier returning a different profile than requested
        if (iccid && fields.iccid && fields.iccid !== iccid) {
          console.error(`[esimcard/fetch-details] ICCID mismatch — expected=${iccid} got=${fields.iccid}; discarding`);
        } else if (fields.iccid && (fields.activationCode || fields.qrCodeUrl || fields.shortUrl)) {
          console.log(`[esimcard/fetch-details] resolved — iccid=${fields.iccid} hasLPA=${!!fields.activationCode} hasQR=${!!fields.qrCodeUrl}`);
          return fields;
        } else {
          if (!simId && fields.simId) simId = fields.simId;
          console.log(`[esimcard/fetch-details] profile not ready yet — iccid=${fields.iccid ?? 'null'}`);
        }
      }
    } catch (e: any) {
      console.error(`[esimcard/fetch-details] attempt=${attempt + 1} exception — ${e.message}`);
    }
  }
  console.log(`[esimcard/fetch-details] all ${maxAttempts} attempts exhausted`);
  return null;
}

// ---------------------------------------------------------------------------
// PUBLIC ENTRYPOINT — provision a paid order via eSIMCard end to end.
//   input.packageCode carries the eSIMCard package UUID (supplier_package_id).
// ---------------------------------------------------------------------------
export async function provisionESIMCardOrder(
  input: ProvisionOrderInput,
  opts: ESIMCardProvisionOptions,
): Promise<ProvisionResult> {
  const { supabaseUrl, serviceKey, creds, resendApiKey, origin, writtenBy } = opts;

  const token = await login(creds);
  if (!token) {
    return { success: false, error: 'eSIMCard authentication failed' };
  }

  // --- Purchase (draws from reseller balance) ---
  let purchaseData: any;
  try {
    const res = await fetch(`${ESIMCARD_BASE_URL}/package/purchase`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ package_type_id: input.packageCode }),
    });
    const text = await res.text();
    // Response contains ICCID only (no PII) — safe to log
    console.log(`[esimcard/purchase] status=${res.status} body=${text.slice(0, 800)}`);
    try { purchaseData = JSON.parse(text); } catch { purchaseData = null; }
    if (!res.ok || purchaseData?.status !== true) {
      const msg = purchaseData?.message ?? purchaseData?.error ?? `HTTP ${res.status}`;
      console.error(`[esimcard/purchase] rejected — packageTypeId=${input.packageCode} error=${msg}`);
      return { success: false, error: `eSIMCard purchase failed: ${msg}` };
    }
  } catch (e: any) {
    console.error(`[esimcard/purchase] exception — ${e.message}`);
    return { success: false, error: e.message };
  }

  // --- Resolve eSIM credentials ---
  const simApplied = purchaseData?.data?.sim_applied === true;
  const purchasedSim = purchaseData?.data?.sim ?? null;
  let fields = simApplied && purchasedSim ? extractSimFields(purchasedSim) : null;
  const needsPoll = !fields || !fields.iccid || !(fields.activationCode || fields.qrCodeUrl || fields.shortUrl);
  if (needsPoll) {
    fields = await fetchESIMCardDetails(
      token,
      fields?.simId ?? purchasedSim?.id ?? null,
      fields?.iccid ?? purchasedSim?.iccid ?? null,
    )
      ?? fields
      ?? { simId: purchasedSim?.id ?? null, iccid: purchasedSim?.iccid ?? null, activationCode: null, qrCodeUrl: null, shortUrl: null };
  }

  // Minimum viable activation payload: an ICCID plus at least one way to
  // install (LPA code, QR image, or universal link). Anything less must NOT
  // be treated as a successful provision — but the reseller balance HAS been
  // charged, so mark the order to block a duplicate purchase on retry.
  const complete = !!fields?.iccid && !!(fields?.activationCode || fields?.qrCodeUrl || fields?.shortUrl);
  if (!complete) {
    const pendingMarker = fields?.simId ?? `esimcard-pending-${input.orderId}`;
    console.error(`[esimcard] purchase charged but activation data unresolved — order=${input.orderId} simId=${fields?.simId ?? 'null'}`);
    try {
      await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(input.orderId)}`, {
        method: 'PATCH',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ esim_order_id: pendingMarker, esim_status: 'processing' }),
      });
    } catch (e: any) {
      console.error(`[esimcard] failed to mark pending order (double-purchase guard): ${e?.message}`);
    }
    return {
      success: false,
      esimTranNo: fields?.simId ?? null,
      iccid: fields?.iccid ?? null,
      error: 'eSIM purchased but activation data not ready — support will follow up',
    };
  }

  const result: ProvisionResult = {
    success: true,
    esimTranNo: fields?.simId ?? null,
    iccid: fields?.iccid ?? null,
    activationCode: fields?.activationCode ?? null,
    qrCodeUrl: fields?.qrCodeUrl ?? null,
    shortUrl: fields?.shortUrl ?? null,
  };
  console.log(`[esimcard] purchase complete — simId=${result.esimTranNo} iccid=${result.iccid} hasLPA=${!!result.activationCode} hasQR=${!!result.qrCodeUrl}`);

  // --- Persist (identical shape to eSIM Access path; idempotent) ---
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
      writtenBy: writtenBy ?? 'esimcard-provision',
    });
  } catch (e: any) {
    console.error(`[esimcard] persist failed (non-fatal): ${e?.message}`);
  }

  // --- Email (best-effort) ---
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
      console.error(`[esimcard] email failed (non-fatal): ${e?.message}`);
    }
  } else if (!resendApiKey) {
    console.warn('[esimcard] RESEND_API_KEY not set — email skipped');
  }

  return result;
}
