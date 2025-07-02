
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ESIMAccessOrder {
  packageId: string;
  customerEmail: string;
  customerName?: string;
  referenceId?: string;
}

interface ESIMAccessResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Correct base URL without /v1
const ESIM_ACCESS_BASE_URL = 'https://api.esimaccess.com';

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract JWT from Authorization header for user verification
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No valid authorization header provided');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - No valid token provided' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for internal operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify the JWT token manually
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error('❌ JWT verification failed:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ User authenticated successfully:', user.email);

    const { action, ...body } = await req.json();
    const secretKey = Deno.env.get('ESIM_ACCESS_SECRET_KEY');

    console.log('=== eSIM Access Edge Function Debug ===');
    console.log('🎯 Action requested:', action);
    console.log('🎯 Request body:', JSON.stringify(body, null, 2));
    console.log('🎯 Secret key configured:', !!secretKey);
    console.log('🎯 User authenticated:', user.email);
    console.log('🎯 Base URL:', ESIM_ACCESS_BASE_URL);

    if (!secretKey) {
      console.error('❌ eSIM Access secret key not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'eSIM Access API key is not configured. Please check your ESIM_ACCESS_SECRET_KEY environment variable.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Test different authentication header formats
    const headers = {
      'Authorization': `Bearer ${secretKey}`,
      'X-API-Key': secretKey,
      'AccessCode': secretKey,
      'Content-Type': 'application/json',
    };

    console.log('🎯 Headers being sent:', JSON.stringify(headers, null, 2));

    let response: ESIMAccessResponse;

    switch (action) {
      case 'get-packages':
        response = await getPackages(headers);
        break;
      
      case 'create-order':
        response = await createOrder(body as ESIMAccessOrder, headers);
        break;
      
      case 'get-order':
        response = await getOrder(body.orderId, headers);
        break;
      
      case 'download-esim':
        response = await downloadESIM(body.orderId, headers);
        break;
      
      default:
        console.error('❌ Invalid action requested:', action);
        response = { success: false, error: 'Invalid action' };
    }

    console.log('=== eSIM Access Final Response ===');
    console.log('✅ Success:', response.success);
    if (response.success) {
      console.log('📦 Response data keys:', Object.keys(response.data || {}));
      console.log('📦 Full response data:', JSON.stringify(response.data, null, 2));
    } else {
      console.log('❌ Error:', response.error);
    }

    return new Response(
      JSON.stringify(response),
      { 
        status: response.success ? 200 : 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ eSIM Access function critical error:', error);
    console.error('❌ Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Internal server error: ${error.message}`,
        details: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getPackages(headers: Record<string, string>): Promise<ESIMAccessResponse> {
  try {
    console.log('📦 Testing eSIM Access API with packages endpoint...');
    const url = `${ESIM_ACCESS_BASE_URL}/packages`;
    console.log('📦 Full URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    console.log('📦 API response status:', response.status);
    console.log('📦 API response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📦 Raw API response:', responseText);

    if (!response.ok) {
      console.error('❌ Get packages failed - HTTP', response.status);
      return { 
        success: false, 
        error: `API error: HTTP ${response.status} - ${responseText}` 
      };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return { 
        success: false, 
        error: `Invalid JSON response: ${responseText}` 
      };
    }

    console.log('✅ Packages retrieved successfully');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Get packages network error:', error);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}

async function createOrder(orderData: ESIMAccessOrder, headers: Record<string, string>): Promise<ESIMAccessResponse> {
  try {
    // Correct payload format for eSIM Access API
    const payload = {
      type: "transaction", // Required: "transaction" for actual purchase
      item: orderData.packageId, // Bundle name (case sensitive)
      quantity: 1, // Required: Number of bundles
      assign: true, // Required: Assign to eSIM immediately
    };

    console.log('🔄 Creating eSIM order with correct payload format');
    const url = `${ESIM_ACCESS_BASE_URL}/orders`;
    console.log('🔄 Full URL:', url);
    console.log('🔄 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    console.log('🔄 Create order response status:', response.status);
    console.log('🔄 Create order response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('🔄 Raw create order response:', responseText);

    if (!response.ok) {
      console.error('❌ Create order failed - HTTP', response.status);
      return { 
        success: false, 
        error: `API error: HTTP ${response.status} - ${responseText}` 
      };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON parse error for create order:', parseError);
      return { 
        success: false, 
        error: `Invalid JSON response: ${responseText}` 
      };
    }

    console.log('✅ eSIM order created successfully');
    console.log('🎯 Available fields in response:', Object.keys(data));
    
    // Log all available fields for debugging
    Object.keys(data).forEach(key => {
      console.log(`🔍 ${key}:`, data[key]);
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Create order network error:', error);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}

async function getOrder(orderId: string, headers: Record<string, string>): Promise<ESIMAccessResponse> {
  try {
    console.log('🔍 Getting order details for ID:', orderId);
    const url = `${ESIM_ACCESS_BASE_URL}/orders/${orderId}`;
    console.log('🔍 Full URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    console.log('🔍 Get order response status:', response.status);
    console.log('🔍 Get order response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('🔍 Raw get order response:', responseText);

    if (!response.ok) {
      console.error('❌ Get order failed - HTTP', response.status);
      return { 
        success: false, 
        error: `API error: HTTP ${response.status} - ${responseText}` 
      };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON parse error for get order:', parseError);
      return { 
        success: false, 
        error: `Invalid JSON response: ${responseText}` 
      };
    }

    console.log('✅ Order details retrieved successfully');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Get order network error:', error);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}

async function downloadESIM(orderId: string, headers: Record<string, string>): Promise<ESIMAccessResponse> {
  try {
    console.log('⬇️ Downloading eSIM for order ID:', orderId);
    const url = `${ESIM_ACCESS_BASE_URL}/orders/${orderId}/download`;
    console.log('⬇️ Full URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    console.log('⬇️ Download response status:', response.status);
    console.log('⬇️ Download response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('⬇️ Raw download response:', responseText);

    if (!response.ok) {
      console.error('❌ Download eSIM failed - HTTP', response.status);
      return { 
        success: false, 
        error: `API error: HTTP ${response.status} - ${responseText}` 
      };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON parse error for download:', parseError);
      return { 
        success: false, 
        error: `Invalid JSON response: ${responseText}` 
      };
    }

    console.log('✅ eSIM download data retrieved');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Download eSIM network error:', error);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}
