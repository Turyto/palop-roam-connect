// ---------------------------------------------------------------------------
// sync-supplier-inventory — Edge Function
//
// Fetches all eSIMs from eSIM Access account and upserts them into
// supplier_inventory_items. Writes audit rows to supplier_inventory_syncs.
//
// Phase 1: eSIM Access only, manually triggered from admin UI.
// Future: add additional suppliers by extending the switch below.
//
// STATUS MAPPING (canonical definition — mirrors esim-access/index.ts)
// eSIM Access activeType → internal status:
//   1 → 'available'  unused, not yet assigned; is_sellable = true
//   2 → 'active'     in use by a customer;      is_sellable = false
//   3 → 'expired'    past validity period;       is_sellable = false
//   4 → 'disabled'   revoked/administratively disabled; is_sellable = false
//   * → 'disabled'   unknown value; safe default
// ---------------------------------------------------------------------------

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ESIM_ACCESS_BASE_URL = 'https://api.esimaccess.com/api/v1/open';
const PAGE_SIZE = 100;

// ---------------------------------------------------------------------------
// Status mapping — single source of truth for activeType normalisation
// ---------------------------------------------------------------------------
const ACTIVE_TYPE_STATUS: Record<number, string> = {
  1: 'available',
  2: 'active',
  3: 'expired',
  4: 'disabled',
};

function mapActiveType(activeType: number): string {
  return ACTIVE_TYPE_STATUS[activeType] ?? 'disabled';
}

// ---------------------------------------------------------------------------
// HMAC signing — identical to esim-access/index.ts
// ---------------------------------------------------------------------------
async function buildESIMHeaders(accessCode: string, secretKey: string): Promise<Record<string, string>> {
  const timestamp = Date.now().toString();
  const requestId = crypto.randomUUID().replace(/-/g, '');
  const signString = accessCode + timestamp + requestId;
  const keyBytes = new TextEncoder().encode(secretKey);
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
  const payload = JSON.stringify({ pageNum, pageSize: PAGE_SIZE });
  const headers = await buildESIMHeaders(accessCode, secretKey);

  console.log(`[sync] fetching page=${pageNum}`);
  const res = await fetch(`${ESIM_ACCESS_BASE_URL}/esim/list`, {
    method: 'POST',
    headers,
    body: payload,
  });
  const text = await res.text();
  console.log(`[sync] page=${pageNum} status=${res.status} bodyLength=${text.length}`);

  let data: any;
  try { data = JSON.parse(text); } catch { data = { rawResponse: text }; }

  if (data?.success !== true) {
    const msg = `page ${pageNum}: errorCode=${data?.errorCode} errorMsg=${data?.errorMsg}`;
    console.error(`[sync] supplier error — ${msg} body=${text}`);
    return { items: [], hasMore: false, total: 0, error: msg };
  }

  const rawItems: any[] = data?.obj?.esimList ?? (Array.isArray(data?.obj) ? data.obj : []);
  const total: number = data?.obj?.total ?? rawItems.length;
  const hasMore = rawItems.length === PAGE_SIZE;

  console.log(`[sync] page=${pageNum} items=${rawItems.length} total=${total} hasMore=${hasMore}`);
  return { items: rawItems, hasMore, total };
}

// ---------------------------------------------------------------------------
// Plan matching: look up esim_packages to get matched_plan_id / matched_plan_name
// ---------------------------------------------------------------------------
async function buildPlanLookup(db: any): Promise<Map<string, { plan_id: string; plan_name: string }>> {
  const { data, error } = await db
    .from('esim_packages')
    .select('esim_access_package_id, plan_id, plan_name')
    .eq('is_active', true);

  if (error) {
    console.error(`[sync] failed to load esim_packages for plan matching — ${error.message}`);
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
  console.log(`[sync] plan lookup built — ${map.size} package codes mapped`);
  return map;
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const accessCode  = Deno.env.get('ESIM_ACCESS_ACCESS_CODE') ?? '';
  const secretKey   = Deno.env.get('ESIM_ACCESS_SECRET_KEY') ?? '';

  // DB client with service role — bypasses RLS for server-side writes
  const db = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  try {
    // Auth — verify JWT is a valid Supabase session
    const authHeader = req.headers.get('authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await db.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Admin check
    const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!accessCode || !secretKey) {
      return new Response(JSON.stringify({ success: false, error: 'eSIM Access credentials not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supplierName = 'esim_access';
    console.log(`[sync] started by user=${user.email} supplier=${supplierName}`);

    // Create sync run record
    const { data: syncRun, error: syncInsertError } = await db
      .from('supplier_inventory_syncs')
      .insert({ supplier_name: supplierName, status: 'running' })
      .select()
      .single();

    if (syncInsertError) {
      console.error(`[sync] failed to create sync run — ${syncInsertError.message}`);
      return new Response(JSON.stringify({ success: false, error: 'Failed to create sync run' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const syncId = syncRun.id;
    console.log(`[sync] sync_id=${syncId}`);

    // Build plan lookup map
    const planLookup = await buildPlanLookup(db);

    // Paginate through all eSIMs
    const allItems: any[] = [];
    let pageNum = 1;
    let hasMore = true;
    let fetchError: string | undefined;

    while (hasMore) {
      const result = await fetchESIMPage(accessCode, secretKey, pageNum);
      if (result.error) {
        fetchError = result.error;
        break;
      }
      allItems.push(...result.items);
      hasMore = result.hasMore;
      pageNum++;
      // Safety cap: stop after 20 pages (2000 items) to avoid timeout
      if (pageNum > 20) {
        console.warn('[sync] safety cap reached at 20 pages — stopping pagination');
        break;
      }
    }

    if (fetchError && allItems.length === 0) {
      // Complete failure — nothing fetched
      await db.from('supplier_inventory_syncs').update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: fetchError,
        items_fetched: 0,
      }).eq('id', syncId);

      return new Response(JSON.stringify({ success: false, error: fetchError }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Map and upsert all items
    const now = new Date().toISOString();
    const upsertRows = allItems.map((item: any) => {
      const status = mapActiveType(item.activeType);
      const plan = planLookup.get(item.packageCode ?? '') ?? null;

      return {
        supplier_name:         supplierName,
        supplier_item_id:      String(item.esimTranNo ?? item.id ?? ''),
        supplier_package_code: item.packageCode ?? null,
        package_name:          item.packageName ?? null,
        iccid:                 item.iccid ?? null,
        lpa_code:              item.lpaCode ?? item.smdpAddress ?? null,
        status,
        is_sellable:           status === 'available',
        matched_plan_id:       plan?.plan_id ?? null,
        matched_plan_name:     plan?.plan_name ?? null,
        total_bytes:           item.totalBytes ?? item.totalFlow ?? null,
        remaining_bytes:       item.dataRemaining ?? item.remainFlow ?? null,
        usage_bytes:           item.usageBytes ?? item.useFlow ?? null,
        activated_at:          item.activeDate ?? null,
        expires_at:            item.expiredDate ?? null,
        created_at_supplier:   item.createTime ?? null,
        raw_payload:           item,
        sync_id:               syncId,
        last_synced_at:        now,
        updated_at:            now,
      };
    });

    let upsertError: string | undefined;
    if (upsertRows.length > 0) {
      // Upsert in batches of 200 to stay within request size limits
      const BATCH = 200;
      for (let i = 0; i < upsertRows.length; i += BATCH) {
        const batch = upsertRows.slice(i, i + BATCH);
        const { error } = await db
          .from('supplier_inventory_items')
          .upsert(batch, { onConflict: 'supplier_name,supplier_item_id' });
        if (error) {
          console.error(`[sync] upsert batch error — ${error.message}`);
          upsertError = error.message;
          break;
        }
        console.log(`[sync] upserted batch ${i / BATCH + 1} (${batch.length} rows)`);
      }
    }

    const finalStatus = upsertError ? 'failed' : 'completed';
    await db.from('supplier_inventory_syncs').update({
      status: finalStatus,
      completed_at: now,
      items_fetched: upsertRows.length,
      error_message: upsertError ?? fetchError ?? null,
    }).eq('id', syncId);

    console.log(`[sync] done — status=${finalStatus} items=${upsertRows.length}`);

    return new Response(JSON.stringify({
      success: finalStatus === 'completed',
      syncId,
      itemsFetched: upsertRows.length,
      status: finalStatus,
      error: upsertError ?? fetchError ?? null,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(
      `[sync] unhandled exception — ` +
      `message=${error?.message ?? '(none)'} ` +
      `stack=${error?.stack ?? '(none)'}`
    );
    return new Response(JSON.stringify({ success: false, error: error.message ?? 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
