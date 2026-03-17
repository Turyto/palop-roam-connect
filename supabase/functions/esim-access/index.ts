const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ESIM_ACCESS_BASE_URL = 'https://api.esimaccess.com/v1';

interface ESIMAccessOrder {
  packageId: string;
  customerEmail: string;
  customerName?: string;
  referenceId?: string;
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

async function testConnection(secretKey: string) {
  try {
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/packages?limit=1`, {
      headers: { 'Authorization': `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    return { success: false, error: `HTTP ${res.status}` };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

async function getPackages(secretKey: string) {
  try {
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/packages`, {
      headers: { 'Authorization': `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

async function createOrder(orderData: ESIMAccessOrder, secretKey: string) {
  const payload = {
    package_id: orderData.packageId,
    customer_email: orderData.customerEmail,
    customer_name: orderData.customerName ?? orderData.customerEmail,
    reference_id: orderData.referenceId ?? `order-${Date.now()}`,
  };
  try {
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { rawResponse: text }; }
    if (res.ok) return { success: true, data };
    return { success: false, error: data?.message ?? `HTTP ${res.status}`, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

async function getOrder(orderId: string, secretKey: string) {
  try {
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { success: true, data };
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
    const secretKey = Deno.env.get('ESIM_ACCESS_SECRET_KEY');
    if (!secretKey) {
      return new Response(JSON.stringify({ success: false, error: 'eSIM Access API key not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const { action, ...body } = await req.json();
    console.log(`Action: ${action}, User: ${user.email}`);
    let response;
    switch (action) {
      case 'test-connection': response = await testConnection(secretKey); break;
      case 'get-packages': response = await getPackages(secretKey); break;
      case 'create-order': response = await createOrder(body as ESIMAccessOrder, secretKey); break;
      case 'get-order': response = await getOrder(body.orderId, secretKey); break;
      case 'download-esim': response = await getOrder(body.orderId, secretKey); break;
      default: response = { success: false, error: `Unknown action: ${action}` };
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
