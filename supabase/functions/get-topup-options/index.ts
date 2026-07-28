// Returns the real, supplier-verified top-up options for one of the caller's
// completed orders. Options come from topup_options (DB, admin-priced) matched
// by the parent package's coverage region — never from the client.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, sentry-trace, baggage',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // --- Auth ---
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return json(401, { error: 'Unauthorized' });
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${authHeader.replace('Bearer ', '')}` },
    });
    if (!userRes.ok) return json(401, { error: 'Invalid session' });
    const userId: string | undefined = (await userRes.json())?.id;
    if (!userId) return json(401, { error: 'Invalid session' });

    const { parent_order_id } = await req.json().catch(() => ({}));
    if (!parent_order_id || typeof parent_order_id !== 'string') {
      return json(400, { error: 'parent_order_id required' });
    }

    const rest = (path: string) =>
      fetch(`${supabaseUrl}/rest/v1/${path}`, {
        headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Accept': 'application/json' },
      }).then((r) => r.json().catch(() => []));

    // --- Parent order: must belong to caller, be paid and completed ---
    const orders = await rest(`orders?id=eq.${encodeURIComponent(parent_order_id)}&select=id,user_id,plan_id,plan_name,status,payment_status,esim_package_id&limit=1`);
    const order = Array.isArray(orders) ? orders[0] : null;
    if (!order || order.user_id !== userId) return json(404, { error: 'Order not found' });
    if (order.payment_status !== 'succeeded' || order.status !== 'completed') {
      return json(200, { supported: false, reason: 'order_not_completed', options: [] });
    }

    // --- Package: anchor to the ACTUAL purchased package code on the order
    // (orders.esim_package_id), never to the latest catalog row for the plan —
    // catalog remaps after purchase must not change what this eSIM can receive.
    // Only eSIM Access packages support top-up (esimcard codes won't match).
    if (!order.esim_package_id) {
      return json(200, { supported: false, reason: 'supplier_not_supported', options: [] });
    }
    const pkgs = await rest(`esim_packages?esim_access_package_id=eq.${encodeURIComponent(order.esim_package_id)}&supplier=neq.esimcard&select=supplier,location_code&limit=1`);
    const pkg = Array.isArray(pkgs) ? pkgs[0] : null;
    if (!pkg) {
      return json(200, { supported: false, reason: 'supplier_not_supported', options: [] });
    }
    if (!pkg.location_code) {
      return json(200, { supported: false, reason: 'no_region_mapping', options: [] });
    }

    // --- The eSIM must actually exist (top-up is applied by ICCID) ---
    const acts = await rest(`esim_activations?order_id=eq.${encodeURIComponent(parent_order_id)}&select=iccid&limit=1`);
    const iccid = Array.isArray(acts) ? acts[0]?.iccid : null;
    if (!iccid) return json(200, { supported: false, reason: 'esim_not_provisioned', options: [] });

    const options = await rest(`topup_options?is_active=eq.true&location_code=eq.${encodeURIComponent(pkg.location_code)}&select=id,type,name,data_amount,validity_days,price,currency,sort_order&order=sort_order.asc`);
    return json(200, {
      supported: Array.isArray(options) && options.length > 0,
      reason: Array.isArray(options) && options.length > 0 ? null : 'no_options_for_region',
      options: Array.isArray(options) ? options : [],
    });
  } catch (e: any) {
    console.error(`[get-topup-options] unhandled — ${e?.message}`);
    return json(500, { error: 'Internal error' });
  }
});
