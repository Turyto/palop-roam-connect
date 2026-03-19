const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ESIM_ACCESS_BASE_URL = 'https://api.esimaccess.com/api/v1/open';

async function buildESIMHeaders(accessCode: string, secretKey: string): Promise<Record<string, string>> {
  const timestamp = Date.now().toString();
  const requestId = crypto.randomUUID().replace(/-/g, '');

  // Sign: HMAC-SHA256(accessCode + timestamp + requestId, secretKey as UTF-8 bytes)
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

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const accessCode = Deno.env.get('ESIM_ACCESS_ACCESS_CODE');
    const secretKey = Deno.env.get('ESIM_ACCESS_SECRET_KEY');

    if (!accessCode || !secretKey) {
      return new Response(JSON.stringify({ error: 'eSIM Access credentials not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { order_id, esim_order_id } = await req.json();
    if (!esim_order_id) {
      return new Response(JSON.stringify({ error: 'esim_order_id required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const headers = await buildESIMHeaders(accessCode, secretKey);
    const statusRes = await fetch(`${ESIM_ACCESS_BASE_URL}/esim/query`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ esimTranNo: esim_order_id }),
    });
    const statusData = await statusRes.json();

    if (!statusData?.success) {
      return new Response(JSON.stringify({
        error: statusData?.errorMsg ?? 'eSIM API query failed',
        errorCode: statusData?.errorCode,
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const esimInfo = statusData.obj;
    if (order_id && serviceKey && esimInfo) {
      await fetch(`${supabaseUrl}/rest/v1/esim_activations?order_id=eq.${encodeURIComponent(order_id)}`, {
        method: 'PATCH',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          status: esimInfo.esimStatus ?? 'unknown',
          provisioning_status: esimInfo.esimStatus === 'GOT_RESOURCE' ? 'completed' : 'pending',
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
