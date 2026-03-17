const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const secretKey = Deno.env.get('ESIM_ACCESS_SECRET_KEY');
    if (!secretKey) {
      return new Response(JSON.stringify({ error: 'API configuration missing' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const { order_id, esim_order_id } = await req.json();
    if (!esim_order_id) {
      return new Response(JSON.stringify({ error: 'esim_order_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const statusRes = await fetch(`https://api.esimaccess.com/v1/orders/${esim_order_id}`, {
      headers: { 'Authorization': `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
    });
    if (!statusRes.ok) {
      return new Response(JSON.stringify({ error: `eSIM API returned ${statusRes.status}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const statusData = await statusRes.json();
    if (order_id && serviceKey) {
      await fetch(`${supabaseUrl}/rest/v1/esim_activations?order_id=eq.${encodeURIComponent(order_id)}`, {
        method: 'PATCH',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          status: statusData.status ?? 'unknown',
          provisioning_status: statusData.status === 'active' ? 'completed' : 'pending',
          updated_at: new Date().toISOString(),
        }),
      });
    }
    return new Response(JSON.stringify({ success: true, data: statusData }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Check eSIM status error:', error);
    return new Response(JSON.stringify({ error: error.message ?? 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
