// ---------------------------------------------------------------------------
// sync-supplier-inventory — Edge Function
//
// Fetches all eSIMs from eSIM Access account and upserts them into
// supplier_inventory_items. Writes audit rows to supplier_inventory_syncs.
//
// STATUS MAPPING (canonical — mirrors esim-access/index.ts)
//   activeType 1 → 'available'       UNUSED — ready to sell
//   activeType 2 → 'active'          GOT_RESOURCE — assigned / in use
//   activeType 3 → 'expired_used'    USED_EXPIRED — activated then expired (normal lifecycle)
//   activeType 4 → 'expired_unused'  UNUSED_EXPIRED — never activated, now expired (lost stock)
//   any other  → 'disabled'          revoked / admin disabled / unknown
// ---------------------------------------------------------------------------

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const ESIM_ACCESS_BASE_URL = 'https://api.esimaccess.com/api/v1/open';
const PAGE_SIZE = 100;

const ACTIVE_TYPE_STATUS: Record<number, string> = {
  1: 'available',
  2: 'active',
  3: 'expired_used',
  4: 'expired_unused',
};

function mapActiveType(activeType: number): string {
  return ACTIVE_TYPE_STATUS[activeType] ?? 'disabled';
}

// ---------------------------------------------------------------------------
// Auth — same raw-HTTP pattern used in esim-access/index.ts
// Returns { id, email } on success, null on failure.
// ---------------------------------------------------------------------------
async function verifyUser(
  supabaseUrl: string,
  serviceKey: string,
  token: string,
): Promise<{ id: string; email: string } | null> {
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      console.error(`[sync] auth check failed — status=${res.status}`);
      return null;
    }
    const user = await res.json();
    return user?.id ? { id: user.id, email: user.email } : null;
  } catch (e: any) {
    console.error(`[sync] auth fetch threw — ${e.message}`);
    return null;
  }
}

// ---------------------------------------------------------------------------
// HMAC signing — identical to esim-access/index.ts
// ---------------------------------------------------------------------------
async function buildESIMHeaders(
  accessCode: string,
  secretKey: string,
): Promise<Record<string, string>> {
  const timestamp = Date.now().toString();
  const requestId = crypto.randomUUID().replace(/-/g, '');
  const signString = accessCode + timestamp + requestId;
  const keyBytes = new TextEncoder().encode(secretKey);
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign'],
  );
  const sigBytes = await crypto.subtle.sign(
    'HMAC', cryptoKey, new TextEncoder().encode(signString),
  );
  const signature = Array.from(new Uint8Array(sigBytes))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  return {
    'Content-Type': 'application/json',
    'RT-AccessCode': accessCode,
    'RT-Timestamp': timestamp,
    'RT-RequestID': requestId,
    'RT-Signature': signature,
  };
}

// ---------------------------------------------------------------------------
// Fetch one page from /esim/list
// ---------------------------------------------------------------------------
async function fetchESIMPage(
  accessCode: string,
  secretKey: string,
  pageNum: number,
): Promise<{ items: any[]; hasMore: boolean; total: number; error?: string }> {
  console.log(`[sync] fetching supplier page=${pageNum} pageSize=${PAGE_SIZE}`);
  // /esim/list was removed in API v1.1 (Jun 2023). Replacement: /esim/query
  // Pagination is nested under "pager" object, not top-level fields.
  const payload = JSON.stringify({ pager: { pageNum, pageSize: PAGE_SIZE } });
  const headers = await buildESIMHeaders(accessCode, secretKey);

  const res = await fetch(`${ESIM_ACCESS_BASE_URL}/esim/query`, {
    method: 'POST',
    headers,
    body: payload,
  });
  const text = await res.text();
  console.log(`[sync] supplier page=${pageNum} httpStatus=${res.status} bodyLength=${text.length} body=${text.slice(0, 400)}`);

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { rawResponse: text };
  }

  if (data?.success !== true) {
    const msg = `Supplier rejected page ${pageNum}: errorCode=${data?.errorCode} errorMsg=${data?.errorMsg}`;
    console.error(`[sync] ${msg}`);
    return { items: [], hasMore: false, total: 0, error: msg };
  }

  // eSIM Access returns items in obj.esimList or directly as obj (array)
  const rawItems: any[] = data?.obj?.esimList ?? (Array.isArray(data?.obj) ? data.obj : []);
  const total: number = data?.obj?.total ?? rawItems.length;
  const hasMore = rawItems.length >= PAGE_SIZE;

  // Log first item shape so we know the real field names
  if (pageNum === 1 && rawItems.length > 0) {
    console.log(`[sync] first item shape keys=${Object.keys(rawItems[0]).join(',')}`);
    console.log(`[sync] first item sample=${JSON.stringify(rawItems[0]).slice(0, 300)}`);
  }
  console.log(`[sync] page=${pageNum} items=${rawItems.length} total=${total} hasMore=${hasMore}`);
  return { items: rawItems, hasMore, total };
}

// ---------------------------------------------------------------------------
// eSIM Card (portal.esimcard.com) — login, page through /my-esims, fetch
// per-SIM details to get package/usage/expiry info.
// ---------------------------------------------------------------------------
const ESIMCARD_BASE_URL = 'https://portal.esimcard.com/api/developer/reseller';
const ESIMCARD_DETAIL_CAP = 200; // safety cap on per-SIM detail fetches

async function esimcardLogin(email: string, password: string): Promise<string | null> {
  try {
    const res = await fetch(`${ESIMCARD_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.access_token) {
      console.error(`[sync/esimcard] login failed — status=${res.status}`);
      return null;
    }
    return data.access_token as string;
  } catch (e: any) {
    console.error(`[sync/esimcard] login exception — ${e.message}`);
    return null;
  }
}

function gbToBytes(qty: unknown, unit: unknown): number | null {
  const n = typeof qty === 'number' ? qty : parseFloat(String(qty ?? ''));
  if (!isFinite(n) || n < 0) return null;
  const u = String(unit ?? 'GB').toUpperCase();
  if (u === 'GB') return Math.round(n * 1073741824);
  if (u === 'MB') return Math.round(n * 1048576);
  if (u === 'KB') return Math.round(n * 1024);
  return Math.round(n);
}

// Fetch all SIMs (list) then details per SIM. Throws on total failure so the
// caller can record a failed sync run; per-SIM detail failures degrade to
// list-level info only.
async function fetchAllESIMCardSims(token: string): Promise<any[]> {
  const authHeaders = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
  const sims: any[] = [];
  let page = 1;
  let lastPage = 1;
  do {
    const res = await fetch(`${ESIMCARD_BASE_URL}/my-esims?page=${page}`, { headers: authHeaders });
    const data = await res.json().catch(() => null);
    if (!res.ok || data?.status !== true) {
      throw new Error(`eSIM Card my-esims page ${page} failed (HTTP ${res.status})`);
    }
    const list: any[] = Array.isArray(data?.data) ? data.data : [];
    sims.push(...list);
    lastPage = data?.meta?.lastPage ?? 1;
    console.log(`[sync/esimcard] list page=${page}/${lastPage} items=${list.length}`);
    page++;
  } while (page <= lastPage && page <= 50);

  // Enrich with details (packages, usage, expiry)
  const detailed: any[] = [];
  for (const sim of sims.slice(0, ESIMCARD_DETAIL_CAP)) {
    let detail: any = null;
    try {
      const res = await fetch(`${ESIMCARD_BASE_URL}/my-esims/${sim.id}`, { headers: authHeaders });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.status === true) detail = data.data;
    } catch (e: any) {
      console.error(`[sync/esimcard] detail fetch failed for sim=${sim.id} — ${e.message}`);
    }
    detailed.push({ sim, detail });
  }
  // Anything beyond the cap keeps list-level info only
  for (const sim of sims.slice(ESIMCARD_DETAIL_CAP)) detailed.push({ sim, detail: null });
  return detailed;
}

// Derive normalized status from the detail package buckets. When detail is
// unavailable (fetch failed or beyond the detail cap), fall back to
// list-level signals rather than destructively marking the SIM disabled.
function esimcardStatus(detail: any, sim?: any): string {
  if (!detail) {
    if (sim?.installed_at) return 'active';
    return 'available';
  }
  const inUse = Array.isArray(detail.in_use_packages) ? detail.in_use_packages : [];
  const assigned = Array.isArray(detail.assigned_packages) ? detail.assigned_packages : [];
  const completed = Array.isArray(detail.completed_packages) ? detail.completed_packages : [];
  const revoked = Array.isArray(detail.revoked_packages) ? detail.revoked_packages : [];
  if (inUse.length > 0) return 'active';
  if (assigned.length > 0) return 'available'; // purchased, not yet activated
  if (completed.length > 0) return 'expired_used';
  if (revoked.length > 0) return 'disabled';
  return 'disabled';
}

// Pick the most relevant package for display: in-use > assigned > completed > revoked
function esimcardPrimaryPackage(detail: any): any | null {
  if (!detail) return null;
  for (const key of ['in_use_packages', 'assigned_packages', 'completed_packages', 'revoked_packages']) {
    const arr = detail[key];
    if (Array.isArray(arr) && arr.length > 0) return arr[0];
  }
  return null;
}

// ---------------------------------------------------------------------------
// eSIM Card plan matching — esim_packages rows with supplier='esimcard',
// keyed by supplier_package_id (the eSIM Card package_type_id).
// ---------------------------------------------------------------------------
async function buildESIMCardPlanLookup(
  db: any,
): Promise<Map<string, { plan_id: string; plan_name: string }>> {
  const { data, error } = await db
    .from('esim_packages')
    .select('supplier_package_id, plan_id, plan_name')
    .eq('supplier', 'esimcard');
  if (error) {
    console.error(`[sync/esimcard] esim_packages query failed — ${error.message}`);
    return new Map();
  }
  const map = new Map<string, { plan_id: string; plan_name: string }>();
  for (const row of data ?? []) {
    if (!row.supplier_package_id) continue;
    const key = String(row.supplier_package_id).trim();
    const existing = map.get(key);
    // Prefer UUID-keyed plan rows over storefront-slug rows for a stable id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(row.plan_id ?? '');
    if (!existing || isUuid) {
      map.set(key, { plan_id: row.plan_id, plan_name: row.plan_name });
    }
  }
  console.log(`[sync/esimcard] plan lookup ready — ${map.size} package ids mapped`);
  return map;
}

// ---------------------------------------------------------------------------
// Full eSIM Card sync phase — creates its own sync run, isolated from the
// eSIM Access phase. Returns a per-supplier result summary.
// ---------------------------------------------------------------------------
async function runESIMCardSync(db: any): Promise<{
  supplier: string; status: string; itemsFetched: number; error: string | null;
}> {
  const supplierName = 'esimcard';
  const email = Deno.env.get('ESIMCARD_EMAIL') ?? '';
  const password = Deno.env.get('ESIMCARD_PASSWORD') ?? '';
  if (!email || !password) {
    console.warn('[sync/esimcard] credentials not configured — skipping');
    return { supplier: supplierName, status: 'skipped', itemsFetched: 0, error: 'eSIM Card credentials not configured' };
  }

  const { data: syncRun, error: syncInsertError } = await db
    .from('supplier_inventory_syncs')
    .insert({ supplier_name: supplierName, status: 'running' })
    .select()
    .single();
  if (syncInsertError) {
    console.error(`[sync/esimcard] sync run insert failed — ${syncInsertError.message}`);
    return { supplier: supplierName, status: 'failed', itemsFetched: 0, error: syncInsertError.message };
  }
  const syncId = syncRun.id;

  const fail = async (msg: string) => {
    await db.from('supplier_inventory_syncs').update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      error_message: msg,
      items_fetched: 0,
    }).eq('id', syncId);
    return { supplier: supplierName, status: 'failed', itemsFetched: 0, error: msg };
  };

  try {
    const token = await esimcardLogin(email, password);
    if (!token) return await fail('eSIM Card authentication failed');

    const [detailedSims, planLookup] = await Promise.all([
      fetchAllESIMCardSims(token),
      buildESIMCardPlanLookup(db),
    ]);
    console.log(`[sync/esimcard] fetched ${detailedSims.length} SIMs`);

    const now = new Date().toISOString();
    const rows = detailedSims.map(({ sim, detail }: any) => {
      const pkg = esimcardPrimaryPackage(detail);
      const status = esimcardStatus(detail, sim);
      const packageTypeId: string | null = pkg?.package_type_id != null ? String(pkg.package_type_id) : null;
      const plan = packageTypeId ? planLookup.get(packageTypeId) ?? null : null;

      const totalBytes = pkg && !pkg.unlimited
        ? gbToBytes(pkg.initial_data_quantity, pkg.initial_data_unit) : null;
      const remainingBytes = pkg && !pkg.unlimited
        ? gbToBytes(pkg.rem_data_quantity, pkg.rem_data_unit) : null;
      const usageBytes = totalBytes !== null && remainingBytes !== null
        ? Math.max(0, totalBytes - remainingBytes) : null;

      return {
        supplier_name:         supplierName,
        supplier_item_id:      String(sim.id),
        order_no:              null,
        supplier_package_code: packageTypeId,
        package_name:          pkg?.package ?? sim.last_bundle ?? null,
        iccid:                 sim.iccid ?? null,
        lpa_code:              sim.qr_code_text ?? null,
        esim_status:           sim.status ?? null,
        smdp_status:           null,
        status,
        is_sellable:           status === 'available',
        matched_plan_id:       plan?.plan_id ?? null,
        matched_plan_name:     plan?.plan_name ?? null,
        total_bytes:           totalBytes,
        remaining_bytes:       remainingBytes,
        usage_bytes:           usageBytes,
        activated_at:          pkg?.date_activated ?? sim.installed_at ?? null,
        expires_at:            pkg?.date_expiry ?? null,
        created_at_supplier:   sim.created_at ?? null,
        raw_payload:           { sim, detail },
        sync_id:               syncId,
        last_synced_at:        now,
        updated_at:            now,
      };
    });

    let upsertError: string | undefined;
    const BATCH = 200;
    for (let i = 0; i < rows.length; i += BATCH) {
      const { error } = await db
        .from('supplier_inventory_items')
        .upsert(rows.slice(i, i + BATCH), { onConflict: 'supplier_name,supplier_item_id' });
      if (error) {
        console.error(`[sync/esimcard] upsert failed — ${error.message}`);
        upsertError = error.message;
        break;
      }
    }

    const finalStatus = upsertError ? 'failed' : 'completed';
    await db.from('supplier_inventory_syncs').update({
      status: finalStatus,
      completed_at: new Date().toISOString(),
      items_fetched: rows.length,
      error_message: upsertError ?? null,
    }).eq('id', syncId);
    console.log(`[sync/esimcard] finished — status=${finalStatus} items=${rows.length}`);
    return { supplier: supplierName, status: finalStatus, itemsFetched: rows.length, error: upsertError ?? null };
  } catch (e: any) {
    console.error(`[sync/esimcard] exception — ${e.message}`);
    return await fail(e.message ?? 'eSIM Card sync failed');
  }
}

// ---------------------------------------------------------------------------
// Plan matching via esim_packages table
// ---------------------------------------------------------------------------
async function buildPlanLookup(
  db: any,
): Promise<Map<string, { plan_id: string; plan_name: string }>> {
  console.log('[sync] loading esim_packages for plan matching');
  const { data, error } = await db
    .from('esim_packages')
    .select('esim_access_package_id, plan_id, plan_name');

  if (error) {
    console.error(`[sync] esim_packages query failed — ${error.message} code=${error.code}`);
    return new Map();
  }

  const map = new Map<string, { plan_id: string; plan_name: string }>();
  for (const row of data ?? []) {
    if (row.esim_access_package_id) {
      map.set(row.esim_access_package_id, {
        plan_id: row.plan_id,
        plan_name: row.plan_name,
      });
    }
  }
  console.log(`[sync] plan lookup ready — ${map.size} package codes mapped`);
  return map;
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request): Promise<Response> => {
  console.log(`[sync] request received method=${req.method}`);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Read env vars inside try so any error is caught
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const accessCode  = Deno.env.get('ESIM_ACCESS_ACCESS_CODE') ?? '';
    const secretKey   = Deno.env.get('ESIM_ACCESS_SECRET_KEY') ?? '';

    console.log(`[sync] env check — supabaseUrl=${supabaseUrl ? 'set' : 'MISSING'} serviceKey=${serviceKey ? 'set' : 'MISSING'} accessCode=${accessCode ? 'set' : 'MISSING'} secretKey=${secretKey ? 'set' : 'MISSING'}`);

    // DB client using service role — bypasses RLS for server-side writes
    const db = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // -----------------------------------------------------------------------
    // Auth — raw HTTP to /auth/v1/user (same pattern as esim-access)
    // -----------------------------------------------------------------------
    const authHeader = req.headers.get('authorization') ?? '';
    const headerOk = authHeader.startsWith('Bearer ');
    console.log(`[sync] auth header present=${headerOk}`);
    if (!headerOk) {
      console.error('[sync] BRANCH: missing_auth_header — returning 401');
      return new Response(JSON.stringify({ success: false, error: 'missing_auth_header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const user = await verifyUser(supabaseUrl, serviceKey, token);
    console.log(`[sync] user verified=${!!user} id=${user?.id ?? 'null'}`);
    if (!user) {
      console.error('[sync] BRANCH: user_verification_failed — returning 401');
      return new Response(JSON.stringify({ success: false, error: 'user_verification_failed' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------------------------
    // Admin check — query profiles table via service role (bypasses RLS)
    // -----------------------------------------------------------------------
    console.log(`[sync] checking admin role for user.id=${user.id}`);
    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    console.log(`[sync] profile role=${profile?.role ?? 'null'} profileError=${profileError?.message ?? 'none'} code=${profileError?.code ?? 'none'}`);
    if (profileError) {
      console.error(`[sync] BRANCH: profile_not_found — code=${profileError.code} — returning 403`);
      return new Response(JSON.stringify({ success: false, error: 'profile_not_found', detail: profileError.message }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (profile?.role !== 'admin') {
      console.error(`[sync] BRANCH: admin_required — role=${profile?.role} — returning 403`);
      return new Response(JSON.stringify({ success: false, error: 'admin_required', role: profile?.role }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------------------------
    // Credentials check
    // -----------------------------------------------------------------------
    if (!accessCode || !secretKey) {
      console.error('[sync] eSIM Access credentials not set — still attempting eSIM Card sync');
      const esimcardResult = await runESIMCardSync(db);
      const anyOk = esimcardResult.status === 'completed';
      return new Response(JSON.stringify({
        success: anyOk,
        itemsFetched: esimcardResult.itemsFetched,
        error: 'eSIM Access credentials not configured',
        suppliers: [
          { supplier: 'esim_access', status: 'failed', itemsFetched: 0, error: 'eSIM Access credentials not configured' },
          esimcardResult,
        ],
      }), {
        status: anyOk ? 200 : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supplierName = 'esim_access';
    console.log(`[sync] starting sync — supplier=${supplierName} user=${user.id}`);

    // -----------------------------------------------------------------------
    // Create sync run record
    // -----------------------------------------------------------------------
    console.log('[sync] creating sync run record');
    const { data: syncRun, error: syncInsertError } = await db
      .from('supplier_inventory_syncs')
      .insert({ supplier_name: supplierName, status: 'running' })
      .select()
      .single();

    if (syncInsertError) {
      console.error(`[sync] sync run insert failed — ${syncInsertError.message} code=${syncInsertError.code}`);
      return new Response(JSON.stringify({ success: false, error: `Failed to create sync run: ${syncInsertError.message}` }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const syncId = syncRun.id;
    console.log(`[sync] sync run created — sync_id=${syncId}`);

    // -----------------------------------------------------------------------
    // Build plan lookup
    // -----------------------------------------------------------------------
    const planLookup = await buildPlanLookup(db);

    // -----------------------------------------------------------------------
    // Paginate through all eSIMs from supplier
    // -----------------------------------------------------------------------
    const allItems: any[] = [];
    let pageNum = 1;
    let hasMore = true;
    let fetchError: string | undefined;

    while (hasMore) {
      const result = await fetchESIMPage(accessCode, secretKey, pageNum);
      if (result.error) {
        fetchError = result.error;
        // Partial fetches are still saved — only bail if first page fails
        if (allItems.length === 0) break;
        console.warn(`[sync] fetch error on page=${pageNum} but have ${allItems.length} items — continuing to upsert`);
        break;
      }
      allItems.push(...result.items);
      hasMore = result.hasMore;
      pageNum++;
      if (pageNum > 20) {
        console.warn('[sync] safety cap reached at 20 pages — stopping');
        break;
      }
    }

    console.log(`[sync] total items fetched across all pages=${allItems.length}`);

    if (fetchError && allItems.length === 0) {
      await db.from('supplier_inventory_syncs').update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: fetchError,
        items_fetched: 0,
      }).eq('id', syncId);
      // eSIM Access failed entirely — still try eSIM Card so one supplier
      // being down doesn't hide the other's stock.
      const esimcardResult = await runESIMCardSync(db);
      const anyOk = esimcardResult.status === 'completed';
      return new Response(JSON.stringify({
        success: anyOk,
        itemsFetched: esimcardResult.itemsFetched,
        error: fetchError,
        suppliers: [
          { supplier: 'esim_access', status: 'failed', itemsFetched: 0, error: fetchError },
          esimcardResult,
        ],
      }), {
        status: anyOk ? 200 : 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------------------------
    // Map items to DB rows
    // Field names confirmed from live /esim/query response (2026-03-19):
    //   ac, iccid, orderNo, activeType, esimTranNo, esimStatus, smdpStatus,
    //   orderUsage, expiredTime, activateTime, totalVolume,
    //   packageList[0].{ packageCode, packageName, createTime, volume }
    // -----------------------------------------------------------------------
    const now = new Date().toISOString();
    const upsertRows = allItems.map((item: any) => {
      const status = mapActiveType(item.activeType ?? item.active_type ?? -1);

      // Package info is nested inside packageList array in /esim/query response
      const pkg0 = Array.isArray(item.packageList) ? item.packageList[0] : null;
      const packageCode = pkg0?.packageCode ?? item.packageCode ?? item.package_code ?? '';
      const plan = planLookup.get(packageCode) ?? null;

      // Data bytes — totalVolume in bytes, orderUsage in bytes
      const totalVolume: number | null = item.totalVolume ?? pkg0?.volume ?? null;
      const usageBytes: number | null  = item.orderUsage ?? null;
      const remainingBytes: number | null =
        totalVolume !== null && usageBytes !== null
          ? Math.max(0, totalVolume - usageBytes)
          : totalVolume; // if no usage data yet, all remaining

      return {
        supplier_name:         supplierName,
        supplier_item_id:      String(item.esimTranNo ?? item.esim_tran_no ?? item.id ?? crypto.randomUUID()),
        order_no:              item.orderNo ?? null,
        supplier_package_code: packageCode || null,
        package_name:          pkg0?.packageName ?? item.packageName ?? item.package_name ?? null,
        iccid:                 item.iccid ?? null,
        // LPA/AC string is in the "ac" field in /esim/query response
        lpa_code:              item.ac ?? item.lpaCode ?? item.lpa_code ?? null,
        esim_status:           item.esimStatus ?? item.esim_status ?? null,
        smdp_status:           item.smdpStatus ?? item.smdp_status ?? null,
        status,
        is_sellable:           status === 'available',
        matched_plan_id:       plan?.plan_id ?? null,
        matched_plan_name:     plan?.plan_name ?? null,
        total_bytes:           totalVolume,
        remaining_bytes:       remainingBytes,
        usage_bytes:           usageBytes,
        activated_at:          item.activateTime ?? item.installationTime ?? null,
        expires_at:            item.expiredTime ?? item.expiredDate ?? null,
        created_at_supplier:   pkg0?.createTime ?? item.createTime ?? item.create_time ?? null,
        raw_payload:           item,
        sync_id:               syncId,
        last_synced_at:        now,
        updated_at:            now,
      };
    });

    console.log(`[sync] mapped ${upsertRows.length} rows for upsert`);

    // -----------------------------------------------------------------------
    // Upsert in batches
    // -----------------------------------------------------------------------
    let upsertError: string | undefined;
    const BATCH = 200;

    for (let i = 0; i < upsertRows.length; i += BATCH) {
      const batch = upsertRows.slice(i, i + BATCH);
      const batchNum = Math.floor(i / BATCH) + 1;
      console.log(`[sync] upserting batch ${batchNum} (rows ${i + 1}–${i + batch.length})`);

      const { error } = await db
        .from('supplier_inventory_items')
        .upsert(batch, { onConflict: 'supplier_name,supplier_item_id' });

      if (error) {
        console.error(`[sync] upsert batch ${batchNum} failed — ${error.message} code=${error.code}`);
        upsertError = error.message;
        break;
      }
      console.log(`[sync] upsert batch ${batchNum} done`);
    }

    // -----------------------------------------------------------------------
    // Finalise sync run record
    // -----------------------------------------------------------------------
    const finalStatus = upsertError ? 'failed' : 'completed';
    await db.from('supplier_inventory_syncs').update({
      status: finalStatus,
      completed_at: now,
      items_fetched: upsertRows.length,
      error_message: upsertError ?? fetchError ?? null,
    }).eq('id', syncId);

    console.log(`[sync] finished — status=${finalStatus} totalItems=${upsertRows.length} sync_id=${syncId}`);

    // -----------------------------------------------------------------------
    // Second supplier: eSIM Card — isolated; its failure never breaks the
    // eSIM Access result above.
    // -----------------------------------------------------------------------
    const esimcardResult = await runESIMCardSync(db);

    return new Response(JSON.stringify({
      success: finalStatus === 'completed' || esimcardResult.status === 'completed',
      syncId,
      itemsFetched: upsertRows.length + esimcardResult.itemsFetched,
      status: finalStatus,
      error: upsertError ?? fetchError ?? esimcardResult.error ?? null,
      suppliers: [
        { supplier: 'esim_access', status: finalStatus, itemsFetched: upsertRows.length, error: upsertError ?? fetchError ?? null },
        esimcardResult,
      ],
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(
      `[sync] unhandled exception — ` +
      `message=${error?.message ?? '(none)'} ` +
      `stack=${error?.stack ?? '(none)'}`,
    );
    return new Response(JSON.stringify({ success: false, error: error.message ?? 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
