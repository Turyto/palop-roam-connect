import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
const ESIM_ACCESS_BASE_URL = 'https://api.esimaccess.com/api/v1/open';
// ---------------------------------------------------------------------------
// HMAC signing — same pattern as sync-supplier-inventory
// ---------------------------------------------------------------------------
async function buildESIMHeaders(accessCode, secretKey) {
  const timestamp = Date.now().toString();
  const requestId = crypto.randomUUID().replace(/-/g, '');
  const signString = accessCode + timestamp + requestId;
  const keyBytes = new TextEncoder().encode(secretKey);
  const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, {
    name: 'HMAC',
    hash: 'SHA-256'
  }, false, [
    'sign'
  ]);
  const sigBytes = await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(signString));
  const signature = Array.from(new Uint8Array(sigBytes)).map((b)=>b.toString(16).padStart(2, '0')).join('');
  return {
    'Content-Type': 'application/json',
    'RT-AccessCode': accessCode,
    'RT-Timestamp': timestamp,
    'RT-RequestID': requestId,
    'RT-Signature': signature
  };
}
// ---------------------------------------------------------------------------
// Verify JWT and return user — same pattern as sync-supplier-inventory
// ---------------------------------------------------------------------------
async function verifyUser(supabaseUrl, serviceKey, token) {
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) return null;
    const user = await res.json();
    return user?.id ? {
      id: user.id,
      email: user.email
    } : null;
  } catch  {
    return null;
  }
}
// ---------------------------------------------------------------------------
// Fetch all packages from eSIM Access /package/list (paginated)
// Returns a Map<packageCode, { price, currency, name }>
// ---------------------------------------------------------------------------
async function fetchAllPackages(accessCode, secretKey) {
  const map = new Map();
  let pageNum = 1;
  const pageSize = 100;
  while(true){
    const body = JSON.stringify({
      locationCode: '',
      pageNum,
      pageSize
    });
    const headers = await buildESIMHeaders(accessCode, secretKey);
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/package/list`, {
      method: 'POST',
      headers,
      body
    });
    const text = await res.text();
    console.log(`[fetch-rates] /package/list page=${pageNum} status=${res.status} len=${text.length}`);
    let data;
    try {
      data = JSON.parse(text);
    } catch  {
      break;
    }
    if (data?.success !== true) {
      console.error(`[fetch-rates] package/list failed — errorCode=${data?.errorCode} errorMsg=${data?.errorMsg}`);
      break;
    }
    // Handle both array response and nested packageList
    const rawList = Array.isArray(data?.obj) ? data.obj : Array.isArray(data?.obj?.packageList) ? data.obj.packageList : Array.isArray(data?.obj?.list) ? data.obj.list : [];
    if (pageNum === 1 && rawList.length > 0) {
      console.log(`[fetch-rates] first package keys=${Object.keys(rawList[0]).join(',')}`);
      console.log(`[fetch-rates] first package sample=${JSON.stringify(rawList[0]).slice(0, 300)}`);
    }
    for (const pkg of rawList){
      const code = pkg.packageCode ?? pkg.code ?? pkg.id ?? '';
      if (!code) continue;
      // eSIM Access returns prices in 10,000ths of USD (e.g. 16400 = $1.64).
      // Divide by 10,000 to get the actual USD wholesale cost.
      const rawPrice = typeof pkg.price === 'number' ? pkg.price : typeof pkg.retailPrice === 'number' ? pkg.retailPrice : parseFloat(pkg.price ?? pkg.retailPrice ?? '0') || 0;
      const price = rawPrice / 10000;
      const currency = pkg.currencyCode ?? pkg.currency ?? 'USD';
      const name = pkg.name ?? pkg.packageName ?? code;
      map.set(code, {
        price,
        currency,
        name
      });
    }
    console.log(`[fetch-rates] page=${pageNum} parsed=${rawList.length} total_so_far=${map.size}`);
    if (rawList.length < pageSize) break;
    pageNum++;
    if (pageNum > 10) break; // safety cap — we won't have >1000 packages
  }
  return map;
}
// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const accessCode = Deno.env.get('ESIM_ACCESS_ACCESS_CODE') ?? '';
    const secretKey = Deno.env.get('ESIM_ACCESS_SECRET_KEY') ?? '';
    const db = createClient(supabaseUrl, serviceKey, {
      auth: {
        persistSession: false
      }
    });
    // Auth check
    const authHeader = req.headers.get('authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'missing_auth_header'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const user = await verifyUser(supabaseUrl, serviceKey, token);
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: 'user_verification_failed'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Admin check
    const { data: profile, error: profileError } = await db.from('profiles').select('role').eq('id', user.id).single();
    if (profileError || profile?.role !== 'admin') {
      return new Response(JSON.stringify({
        success: false,
        error: 'admin_required'
      }), {
        status: 403,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Credentials check
    if (!accessCode || !secretKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'esim_access_credentials_not_configured'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Load active plan IDs first (two queries — plan_id is TEXT, no FK defined)
    const { data: activePlans, error: plansError } = await db.from('plans').select('id, name').eq('status', 'active');
    if (plansError) {
      console.error(`[fetch-rates] plans query failed — ${plansError.message}`);
      return new Response(JSON.stringify({
        success: false,
        error: plansError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const activePlanIds = new Set((activePlans ?? []).map((p)=>p.id));
    console.log(`[fetch-rates] active plans: ${activePlanIds.size}`);
    // Load all esim_packages rows
    const { data: allPackages, error: pkgError } = await db.from('esim_packages').select('plan_id, plan_name, esim_access_package_id');
    if (pkgError) {
      console.error(`[fetch-rates] esim_packages query failed — ${pkgError.message}`);
      return new Response(JSON.stringify({
        success: false,
        error: pkgError.message
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Keep only rows whose plan is active
    const packages = (allPackages ?? []).filter((row)=>activePlanIds.has(row.plan_id));
    console.log(`[fetch-rates] found ${packages.length} active plan–package mappings`);
    // Fetch all live packages from supplier
    const liveMap = await fetchAllPackages(accessCode, secretKey);
    console.log(`[fetch-rates] supplier returned ${liveMap.size} packages total`);
    // Build comparison result
    const rates = (packages ?? []).map((row)=>{
      const code = row.esim_access_package_id ?? '';
      const live = code ? liveMap.get(code) : undefined;
      return {
        plan_id: row.plan_id,
        plan_name: row.plan_name ?? row.plans?.name ?? '',
        package_code: code || null,
        live_price: live?.price ?? null,
        live_currency: live?.currency ?? null,
        live_name: live?.name ?? null,
        live_price_found: !!live
      };
    });
    console.log(`[fetch-rates] returning ${rates.length} comparison rows`);
    return new Response(JSON.stringify({
      success: true,
      rates,
      fetched_at: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (e) {
    console.error(`[fetch-rates] uncaught exception — ${e.message} ${e.stack}`);
    return new Response(JSON.stringify({
      success: false,
      error: e.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
