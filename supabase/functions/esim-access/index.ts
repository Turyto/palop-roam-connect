const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ESIM_ACCESS_BASE_URL = 'https://api.esimaccess.com/api/v1/open';

interface ESIMAccessCredentials {
  accessCode: string;
  secretKey: string;
}

interface ESIMOrderRequest {
  packageId: string;
  customerEmail: string;
  customerName?: string;
  referenceId?: string;
}

async function buildESIMHeaders(creds: ESIMAccessCredentials): Promise<Record<string, string>> {
  const timestamp = Date.now().toString();
  const requestId = crypto.randomUUID().replace(/-/g, '');

  // Sign: HMAC-SHA256(accessCode + timestamp + requestId, secretKey as UTF-8 bytes)
  const signString = creds.accessCode + timestamp + requestId;
  const keyBytes = new TextEncoder().encode(creds.secretKey);

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
    'RT-AccessCode': creds.accessCode,
    'RT-Timestamp': timestamp,
    'RT-RequestID': requestId,
    'RT-Signature': signature,
  };
}

async function verifyUser(supabaseUrl: string, serviceKey: string, token: string): Promise<{ id: string; email: string } | null> {
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    const user = await res.json();
    return user?.id ? { id: user.id, email: user.email } : null;
  } catch {
    return null;
  }
}

async function testConnection(creds: ESIMAccessCredentials) {
  try {
    const body = JSON.stringify({ locationCode: 'PT', type: 0, pageSize: 1, pageNum: 1 });
    const headers = await buildESIMHeaders(creds);
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/package/list`, {
      method: 'POST',
      headers,
      body,
    });
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { rawResponse: text }; }
    if (data?.success === true) {
      return { success: true, message: 'eSIM Access API authenticated successfully', data };
    }
    return {
      success: false,
      error: `Auth failed — errorCode: ${data?.errorCode}, errorMsg: ${data?.errorMsg}`,
      data,
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

async function getPackages(creds: ESIMAccessCredentials, locationCode?: string) {
  try {
    const body = JSON.stringify({
      locationCode: locationCode ?? '',
      type: 0,
      pageSize: 100,
      pageNum: 1,
    });
    const headers = await buildESIMHeaders(creds);
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/package/list`, {
      method: 'POST',
      headers,
      body,
    });
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { rawResponse: text }; }
    if (data?.success === true) return { success: true, data };
    return {
      success: false,
      error: `errorCode: ${data?.errorCode}, errorMsg: ${data?.errorMsg}`,
      data,
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

async function createOrder(orderData: ESIMOrderRequest, creds: ESIMAccessCredentials) {
  const payload = {
    packageInfoList: [
      {
        packageCode: orderData.packageId,
        count: 1,
        price: null,
      }
    ],
    userEmail: orderData.customerEmail,
    outOrder: orderData.referenceId ?? `order-${Date.now()}`,
  };
  try {
    const body = JSON.stringify(payload);
    const headers = await buildESIMHeaders(creds);
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/esim/order`, {
      method: 'POST',
      headers,
      body,
    });
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { rawResponse: text }; }
    if (data?.success === true) return { success: true, data };
    return {
      success: false,
      error: data?.errorMsg ?? `HTTP ${res.status}`,
      errorCode: data?.errorCode,
      data,
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

async function getOrder(esimTranNo: string, creds: ESIMAccessCredentials) {
  try {
    const body = JSON.stringify({ esimTranNo });
    const headers = await buildESIMHeaders(creds);
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/esim/query`, {
      method: 'POST',
      headers,
      body,
    });
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { rawResponse: text }; }
    if (data?.success === true) return { success: true, data };
    return {
      success: false,
      error: data?.errorMsg ?? `HTTP ${res.status}`,
      errorCode: data?.errorCode,
      data,
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const user = await verifyUser(supabaseUrl, serviceKey, token);
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const accessCode = Deno.env.get('ESIM_ACCESS_ACCESS_CODE');
    const secretKey = Deno.env.get('ESIM_ACCESS_SECRET_KEY');
    if (!accessCode || !secretKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'eSIM Access credentials not configured',
        missing: {
          ESIM_ACCESS_ACCESS_CODE: !accessCode,
          ESIM_ACCESS_SECRET_KEY: !secretKey,
        }
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const creds: ESIMAccessCredentials = { accessCode, secretKey };
    const { action, ...body } = await req.json();
    console.log(`Action: ${action}, User: ${user.email}`);

    let response: any;
    switch (action) {
      case 'test-connection':
        response = await testConnection(creds);
        break;
      case 'get-packages':
        response = await getPackages(creds, body.locationCode);
        break;
      case 'create-order':
        response = await createOrder(body as ESIMOrderRequest, creds);
        break;
      case 'get-order':
        response = await getOrder(body.orderId ?? body.esimTranNo, creds);
        break;
      case 'download-esim':
        response = await getOrder(body.orderId ?? body.esimTranNo, creds);
        break;
      default:
        response = { success: false, error: `Unknown action: ${action}` };
    }

    return new Response(JSON.stringify(response), {
      status: response.success ? 200 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('eSIM Access error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message ?? 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
