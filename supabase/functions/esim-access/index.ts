
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

const ESIM_ACCESS_BASE_URL = 'https://api.esimaccess.com/v1';

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { authorization: req.headers.get('authorization')! },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, ...body } = await req.json();
    const secretKey = Deno.env.get('ESIM_ACCESS_SECRET_KEY');

    console.log('=== eSIM Access Edge Function Debug ===');
    console.log('Action requested:', action);
    console.log('Request body:', JSON.stringify(body, null, 2));
    console.log('Secret key configured:', !!secretKey);
    console.log('User authenticated:', !!user);

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

    const headers = {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    };

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

    console.log('=== eSIM Access Response ===');
    console.log('Success:', response.success);
    console.log('Response data:', response.success ? JSON.stringify(response.data, null, 2) : 'N/A');
    console.log('Error:', response.error || 'None');

    return new Response(
      JSON.stringify(response),
      { 
        status: response.success ? 200 : 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ eSIM Access function critical error:', error);
    console.error('Error stack:', error.stack);
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
    console.log('📦 Fetching packages from eSIM Access API...');
    
    const response = await fetch(`${ESIM_ACCESS_BASE_URL}/packages`, {
      method: 'GET',
      headers,
    });

    console.log('📦 eSIM Access packages API response status:', response.status);

    const responseText = await response.text();
    console.log('📦 Raw packages response:', responseText);

    if (!response.ok) {
      console.error('❌ Get packages error - HTTP', response.status, ':', responseText);
      return { 
        success: false, 
        error: `API error: HTTP ${response.status} - ${responseText}` 
      };
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON parse error for packages:', parseError);
      return { 
        success: false, 
        error: `Invalid JSON response: ${responseText}` 
      };
    }

    console.log('✅ Packages retrieved successfully:', JSON.stringify(data, null, 2));
    return { success: true, data };
  } catch (error) {
    console.error('❌ Get packages fetch error:', error);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}

async function createOrder(orderData: ESIMAccessOrder, headers: Record<string, string>): Promise<ESIMAccessResponse> {
  try {
    const payload = {
      packageId: orderData.packageId,
      customer: {
        email: orderData.customerEmail,
        name: orderData.customerName || orderData.customerEmail,
      },
      referenceId: orderData.referenceId,
    };

    console.log('🔄 Creating eSIM order with payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${ESIM_ACCESS_BASE_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    console.log('🔄 eSIM Access create order API response status:', response.status);

    const responseText = await response.text();
    console.log('🔄 Raw create order response:', responseText);

    if (!response.ok) {
      console.error('❌ Create order error - HTTP', response.status, ':', responseText);
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

    console.log('✅ eSIM order created successfully:', JSON.stringify(data, null, 2));
    
    // Get the order details immediately to fetch the QR code and activation data
    if (data.id || data.orderId) {
      console.log('🔍 Fetching detailed order information for ID:', data.id || data.orderId);
      const orderDetails = await getOrder(data.id || data.orderId, headers);
      if (orderDetails.success) {
        console.log('✅ Order details retrieved:', JSON.stringify(orderDetails.data, null, 2));
        // Merge the creation response with the detailed order information
        const mergedData = {
          ...data,
          ...orderDetails.data,
          qrCodeUrl: orderDetails.data?.qrCodeUrl || orderDetails.data?.downloadUrl,
          activationCode: orderDetails.data?.activationCode,
          iccid: orderDetails.data?.iccid
        };
        console.log('🔀 Merged order data:', JSON.stringify(mergedData, null, 2));
        return { 
          success: true, 
          data: mergedData
        };
      } else {
        console.warn('⚠️ Failed to get order details, returning creation response only');
      }
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Create order fetch error:', error);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}

async function getOrder(orderId: string, headers: Record<string, string>): Promise<ESIMAccessResponse> {
  try {
    console.log('🔍 Fetching order details for ID:', orderId);
    
    const response = await fetch(`${ESIM_ACCESS_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers,
    });

    console.log('🔍 eSIM Access get order API response status:', response.status);

    const responseText = await response.text();
    console.log('🔍 Raw get order response:', responseText);

    if (!response.ok) {
      console.error('❌ Get order error - HTTP', response.status, ':', responseText);
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

    console.log('✅ Order details retrieved successfully:', JSON.stringify(data, null, 2));
    return { success: true, data };
  } catch (error) {
    console.error('❌ Get order fetch error:', error);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}

async function downloadESIM(orderId: string, headers: Record<string, string>): Promise<ESIMAccessResponse> {
  try {
    console.log('⬇️ Downloading eSIM for order ID:', orderId);
    
    const response = await fetch(`${ESIM_ACCESS_BASE_URL}/orders/${orderId}/download`, {
      method: 'GET',
      headers,
    });

    console.log('⬇️ eSIM Access download API response status:', response.status);

    const responseText = await response.text();
    console.log('⬇️ Raw download response:', responseText);

    if (!response.ok) {
      console.error('❌ Download eSIM error - HTTP', response.status, ':', responseText);
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

    console.log('✅ eSIM download data retrieved:', JSON.stringify(data, null, 2));
    return { success: true, data };
  } catch (error) {
    console.error('❌ Download eSIM fetch error:', error);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}
