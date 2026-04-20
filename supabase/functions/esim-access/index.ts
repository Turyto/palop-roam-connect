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
    const text = await res.text();
    // Diagnostic logging — token prefix helps identify type (anon key vs user JWT) without leaking secrets
    console.log(`[verifyUser] status=${res.status} tokenPrefix=${token.slice(0, 30)} bodySnippet=${text.slice(0, 200)}`);
    if (!res.ok) {
      console.error(`[verifyUser] auth check failed — status=${res.status} body=${text.slice(0, 300)}`);
      return null;
    }
    let user: any;
    try { user = JSON.parse(text); } catch { return null; }
    if (!user?.id) {
      console.error(`[verifyUser] user object missing id — body=${text.slice(0, 200)}`);
      return null;
    }
    return { id: user.id, email: user.email };
  } catch (e: any) {
    console.error(`[verifyUser] exception: ${e.message}`);
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
    console.log(`[test-connection] supplier status=${res.status} body=${text}`);
    let data: any;
    try { data = JSON.parse(text); } catch { data = { rawResponse: text }; }
    if (data?.success === true) {
      return { success: true, message: 'eSIM Access API authenticated successfully', data };
    }
    console.error(`[test-connection] supplier auth failed — errorCode=${data?.errorCode} errorMsg=${data?.errorMsg}`);
    return {
      success: false,
      error: `Auth failed — errorCode: ${data?.errorCode}, errorMsg: ${data?.errorMsg}`,
      data,
    };
  } catch (e: any) {
    console.error(`[test-connection] exception — message=${e.message} stack=${e.stack}`);
    return { success: false, error: e.message };
  }
}

async function getPackages(creds: ESIMAccessCredentials, locationCode?: string) {
  const requestPayload = {
    locationCode: locationCode ?? '',
    type: 0,
    pageSize: 100,
    pageNum: 1,
  };
  try {
    console.log(`[get-packages] requesting locationCode=${locationCode ?? '(all)'}`);
    const body = JSON.stringify(requestPayload);
    const headers = await buildESIMHeaders(creds);
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/package/list`, {
      method: 'POST',
      headers,
      body,
    });
    const text = await res.text();
    console.log(`[get-packages] supplier status=${res.status} bodyLength=${text.length}`);
    let data: any;
    try { data = JSON.parse(text); } catch { data = { rawResponse: text }; }
    if (data?.success === true) return { success: true, data };
    console.error(`[get-packages] supplier error — status=${res.status} errorCode=${data?.errorCode} errorMsg=${data?.errorMsg} body=${text}`);
    return {
      success: false,
      error: `errorCode: ${data?.errorCode}, errorMsg: ${data?.errorMsg}`,
      data,
    };
  } catch (e: any) {
    console.error(`[get-packages] exception — message=${e.message} stack=${e.stack}`);
    return { success: false, error: e.message };
  }
}

async function createOrder(orderData: ESIMOrderRequest, creds: ESIMAccessCredentials) {
  const outOrder = orderData.referenceId ?? `order-${Date.now()}`;
  const payload = {
    packageInfoList: [
      {
        packageCode: orderData.packageId,
        count: 1,
        price: null,
      }
    ],
    userEmail: orderData.customerEmail,
    outOrder,
    transactionId: outOrder,
  };

  // Log request payload (no secrets — credentials are in signed headers only)
  console.log(`[create-order] sending to supplier — payload=${JSON.stringify({
    packageCode: orderData.packageId,
    userEmail: orderData.customerEmail,
    outOrder: payload.outOrder,
  })}`);

  try {
    const body = JSON.stringify(payload);
    const headers = await buildESIMHeaders(creds);
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/esim/order`, {
      method: 'POST',
      headers,
      body,
    });
    const text = await res.text();

    // Always log supplier response
    console.log(`[create-order] supplier response — status=${res.status} body=${text}`);

    let data: any;
    try { data = JSON.parse(text); } catch { data = { rawResponse: text }; }

    if (data?.success === true) {
      // Log full obj shape to diagnose esimTranNo / esimList location in response
      console.log(`[create-order] success — esimTranNo=${data?.obj?.esimTranNo ?? data?.obj?.orderNo ?? '(not returned yet)'}`);
      console.log(`[create-order] obj keys=${Object.keys(data?.obj ?? {}).join(',')}`);
      console.log(`[create-order] packageInfoList[0] keys=${Object.keys(data?.obj?.packageInfoList?.[0] ?? {}).join(',')}`);
      console.log(`[create-order] esimList[0] keys=${Object.keys(data?.obj?.packageInfoList?.[0]?.esimList?.[0] ?? {}).join(',')}`);
      console.log(`[create-order] raw obj=${JSON.stringify(data?.obj).slice(0, 800)}`);
      return { success: true, data };
    }

    // Non-2xx or supplier-level failure
    console.error(
      `[create-order] supplier rejected order — ` +
      `httpStatus=${res.status} ` +
      `errorCode=${data?.errorCode} ` +
      `errorMsg=${data?.errorMsg} ` +
      `packageCode=${orderData.packageId} ` +
      `outOrder=${payload.outOrder} ` +
      `fullBody=${text}`
    );
    return {
      success: false,
      error: data?.errorMsg ?? `HTTP ${res.status}`,
      errorCode: data?.errorCode,
      data,
    };
  } catch (e: any) {
    console.error(
      `[create-order] exception before/during supplier call — ` +
      `message=${e.message} ` +
      `stack=${e.stack} ` +
      `packageCode=${orderData.packageId} ` +
      `outOrder=${payload.outOrder}`
    );
    return { success: false, error: e.message };
  }
}

// ---------------------------------------------------------------------------
// STATUS MAPPING — eSIM Access activeType → internal status
// ---------------------------------------------------------------------------
// This is the single authoritative mapping. It is used by:
//   - listESIMs() below (returned in each item for the sync function to consume)
//   - sync-supplier-inventory edge function (applies the same constant)
//
// eSIM Access activeType values (from API docs):
//   1 = Available  — unused, not yet assigned to a customer; sellable
//   2 = Active     — assigned and currently in use by a customer
//   3 = Expired    — past validity period; no longer usable
//   4 = Disabled   — administratively revoked or disabled
//   * = Unknown    — any unrecognized value; treated as 'disabled' for safety
// ---------------------------------------------------------------------------
const ESIM_ACCESS_ACTIVE_TYPE_MAP: Record<number, string> = {
  1: 'available',
  2: 'active',
  3: 'expired',
  4: 'disabled',
};

function mapActiveType(activeType: number): string {
  return ESIM_ACCESS_ACTIVE_TYPE_MAP[activeType] ?? 'disabled';
}

async function listESIMs(
  creds: ESIMAccessCredentials,
  pageNum: number = 1,
  pageSize: number = 100,
  packageCode?: string,
) {
  // /esim/list was removed in API v1.1 (Jun 2023). Replacement: /esim/query
  // Pagination goes inside a "pager" nested object.
  const requestPayload: Record<string, any> = { pager: { pageNum, pageSize } };
  if (packageCode) requestPayload.packageCode = packageCode;

  console.log(`[list-esims] page=${pageNum} pageSize=${pageSize} packageCode=${packageCode ?? '(all)'}`);
  try {
    const body = JSON.stringify(requestPayload);
    const headers = await buildESIMHeaders(creds);
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/esim/query`, {
      method: 'POST',
      headers,
      body,
    });
    const text = await res.text();
    console.log(`[list-esims] supplier status=${res.status} bodyLength=${text.length}`);
    let data: any;
    try { data = JSON.parse(text); } catch { data = { rawResponse: text }; }

    if (data?.success !== true) {
      console.error(
        `[list-esims] supplier error — status=${res.status} ` +
        `errorCode=${data?.errorCode} errorMsg=${data?.errorMsg} body=${text}`
      );
      return {
        success: false,
        error: data?.errorMsg ?? `HTTP ${res.status}`,
        errorCode: data?.errorCode,
        data,
      };
    }

    // Normalize each item: map activeType → status string
    const rawItems: any[] = data?.obj?.esimList ?? data?.obj ?? [];
    const items = rawItems.map((item: any) => ({
      ...item,
      _normalizedStatus: mapActiveType(item.activeType),
      _isSellable: item.activeType === 1,
    }));

    console.log(
      `[list-esims] success — page=${pageNum} itemCount=${items.length} ` +
      `totalCount=${data?.obj?.total ?? 'unknown'}`
    );
    return {
      success: true,
      items,
      total: data?.obj?.total ?? items.length,
      hasMore: items.length === pageSize,
      data,
    };
  } catch (e: any) {
    console.error(`[list-esims] exception — message=${e.message} stack=${e.stack}`);
    return { success: false, error: e.message };
  }
}

async function getOrder(esimTranNo: string, creds: ESIMAccessCredentials) {
  console.log(`[get-order] querying supplier — esimTranNo=${esimTranNo}`);
  try {
    const body = JSON.stringify({ esimTranNo });
    const headers = await buildESIMHeaders(creds);
    const res = await fetch(`${ESIM_ACCESS_BASE_URL}/esim/query`, {
      method: 'POST',
      headers,
      body,
    });
    const text = await res.text();
    console.log(`[get-order] supplier response — status=${res.status} body=${text}`);
    let data: any;
    try { data = JSON.parse(text); } catch { data = { rawResponse: text }; }
    if (data?.success === true) return { success: true, data };
    console.error(
      `[get-order] supplier error — ` +
      `httpStatus=${res.status} ` +
      `errorCode=${data?.errorCode} ` +
      `errorMsg=${data?.errorMsg} ` +
      `esimTranNo=${esimTranNo} ` +
      `fullBody=${text}`
    );
    return {
      success: false,
      error: data?.errorMsg ?? `HTTP ${res.status}`,
      errorCode: data?.errorCode,
      data,
    };
  } catch (e: any) {
    console.error(`[get-order] exception — message=${e.message} stack=${e.stack} esimTranNo=${esimTranNo}`);
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
      console.error('[esim-access] missing credentials — ESIM_ACCESS_ACCESS_CODE or ESIM_ACCESS_SECRET_KEY not set');
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
    console.log(`[esim-access] action=${action} user=${user.email} userId=${user.id}`);

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
      case 'list-esims':
        response = await listESIMs(
          creds,
          body.pageNum ?? 1,
          body.pageSize ?? 100,
          body.packageCode,
        );
        break;
      default:
        console.error(`[esim-access] unknown action="${action}" from user=${user.email}`);
        response = { success: false, error: `Unknown action: ${action}` };
    }

    // Log any top-level failure before returning
    if (!response.success) {
      console.error(
        `[esim-access] action=${action} failed — ` +
        `error=${response.error} ` +
        `errorCode=${response.errorCode ?? 'n/a'} ` +
        `user=${user.email}`
      );
    }

    return new Response(JSON.stringify(response), {
      status: response.success ? 200 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error(
      `[esim-access] unhandled exception — ` +
      `message=${error?.message ?? '(no message)'} ` +
      `stack=${error?.stack ?? '(no stack)'}`
    );
    return new Response(JSON.stringify({ success: false, error: error.message ?? 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
