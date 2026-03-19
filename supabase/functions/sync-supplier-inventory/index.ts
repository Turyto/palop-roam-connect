// ---------------------------------------------------------------------------
// sync-supplier-inventory — Edge Function
//
// Fetches all eSIMs from eSIM Access account and upserts them into
// supplier_inventory_items. Writes audit rows to supplier_inventory_syncs.
//
// STATUS MAPPING (canonical — mirrors esim-access/index.ts)
//   activeType 1 → 'available'  unused, sellable
//   activeType 2 → 'active'     in use by a customer
//   activeType 3 → 'expired'    past validity period
//   activeType 4 → 'disabled'   revoked / admin disabled
//   any other  → 'disabled'     safe default
// ---------------------------------------------------------------------------

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ESIM_ACCESS_BASE_URL = 'https://api.esimaccess.com/api/v1/open';
const PAGE_SIZE = 100;

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
  const payload = JSON.stringify({ pageNum, pageSize: PAGE_SIZE });
  const headers = await buildESIMHeaders(accessCode, secretKey);

  const res = await fetch(`${ESIM_ACCESS_BASE_URL}/esim/list`, {
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
    return new Response(null, { headers: corsHeaders });
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
    console.log(`[sync] auth header present=${authHeader.startsWith('Bearer ')}`);
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const user = await verifyUser(supabaseUrl, serviceKey, token);
    console.log(`[sync] user verified=${!!user} id=${user?.id ?? 'null'} email=${user?.email ?? 'null'}`);
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
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

    console.log(`[sync] profile role=${profile?.role ?? 'null'} profileError=${profileError?.message ?? 'none'}`);
    if (profileError || profile?.role !== 'admin') {
      return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------------------------
    // Credentials check
    // -----------------------------------------------------------------------
    if (!accessCode || !secretKey) {
      console.error('[sync] eSIM Access credentials not set in environment');
      return new Response(JSON.stringify({ success: false, error: 'eSIM Access credentials not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supplierName = 'esim_access';
    console.log(`[sync] starting sync — supplier=${supplierName} user=${user.email}`);

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
      return new Response(JSON.stringify({ success: false, error: fetchError }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // -----------------------------------------------------------------------
    // Map items to DB rows
    // -----------------------------------------------------------------------
    const now = new Date().toISOString();
    const upsertRows = allItems.map((item: any) => {
      const status = mapActiveType(item.activeType ?? item.active_type ?? -1);
      const packageCode = item.packageCode ?? item.package_code ?? '';
      const plan = planLookup.get(packageCode) ?? null;

      return {
        supplier_name:         supplierName,
        supplier_item_id:      String(item.esimTranNo ?? item.esim_tran_no ?? item.id ?? crypto.randomUUID()),
        supplier_package_code: packageCode || null,
        package_name:          item.packageName ?? item.package_name ?? null,
        iccid:                 item.iccid ?? null,
        lpa_code:              item.lpaCode ?? item.lpa_code ?? item.smdpAddress ?? null,
        status,
        is_sellable:           status === 'available',
        matched_plan_id:       plan?.plan_id ?? null,
        matched_plan_name:     plan?.plan_name ?? null,
        total_bytes:           item.totalBytes ?? item.total_bytes ?? item.totalFlow ?? null,
        remaining_bytes:       item.dataRemaining ?? item.data_remaining ?? item.remainFlow ?? null,
        usage_bytes:           item.usageBytes ?? item.usage_bytes ?? item.useFlow ?? null,
        activated_at:          item.activeDate ?? item.active_date ?? null,
        expires_at:            item.expiredDate ?? item.expired_date ?? null,
        created_at_supplier:   item.createTime ?? item.create_time ?? null,
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
      `stack=${error?.stack ?? '(none)'}`,
    );
    return new Response(JSON.stringify({ success: false, error: error.message ?? 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
