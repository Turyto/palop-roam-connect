const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, sentry-trace, baggage',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Hardcoded fallback for the four Europa checkout plans.
// These mirror what should be in esim_packages but guarantee provisioning works
// even if the DB rows are missing. Update here when package codes change.
const FALLBACK_PACKAGES: Record<string, string> = {
  'arrival':   'PRC8B6GK2',
  'essential': 'PV0Q6PZ7G',
  'comfort':   'P29FDU5TL',
  'freedom':   'P6PBYX5G4',
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const { plan_id } = await req.json();

    if (!plan_id) {
      return new Response(JSON.stringify({ data: null, error: 'plan_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Supplier-aware lookup: return rows provisionable by EITHER supplier —
    //   • eSIM Access rows (esim_access_package_id set) — original behavior
    //   • eSIMCard rows (supplier='esimcard' with supplier_package_id set)
    // Rows with neither ID remain excluded (cannot be provisioned).
    // Order by created_at desc so the most recently added package wins if there are duplicates.
    const url =
      `${supabaseUrl}/rest/v1/esim_packages` +
      `?plan_id=eq.${encodeURIComponent(plan_id)}` +
      `&or=(esim_access_package_id.not.is.null,and(supplier.eq.esimcard,supplier_package_id.not.is.null))` +
      `&order=created_at.desc` +
      `&limit=1`;

    const res = await fetch(url, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Accept': 'application/json',
      },
    });

    const rows = await res.json();
    console.log(`[get-esim-package] plan_id=${plan_id} rows=${JSON.stringify(rows)}`);
    let data = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    if (!data) {
      const fallbackCode = FALLBACK_PACKAGES[plan_id];
      if (fallbackCode) {
        console.warn(`[get-esim-package] no DB row for plan_id=${plan_id} — using hardcoded fallback code=${fallbackCode}`);
        data = { plan_id, esim_access_package_id: fallbackCode, plan_name: null };
      } else {
        console.warn(`[get-esim-package] no esim_access package found for plan_id=${plan_id}`);
      }
    }

    return new Response(JSON.stringify({ data, error: null }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('[get-esim-package] error:', error);
    return new Response(JSON.stringify({ data: null, error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
