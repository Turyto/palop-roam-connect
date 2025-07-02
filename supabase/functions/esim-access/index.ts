
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

    console.log('=== eSIM Access API Call ===');
    console.log('🎯 Action requested:', action);
    console.log('🎯 User authenticated:', user.email);
    console.log('🎯 Secret key configured:', !!secretKey);

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

    let response: ESIMAccessResponse;

    switch (action) {
      case 'test-connection':
        response = await testConnection(secretKey);
        break;
      
      case 'get-packages':
        response = await getPackages(secretKey);
        break;
      
      case 'create-order':
        response = await createOrder(body as ESIMAccessOrder, secretKey);
        break;
      
      case 'get-order':
        response = await getOrder(body.orderId, secretKey);
        break;
      
      case 'download-esim':
        response = await downloadESIM(body.orderId, secretKey);
        break;
      
      default:
        console.error('❌ Invalid action requested:', action);
        response = { success: false, error: 'Invalid action' };
    }

    console.log('=== eSIM Access Final Response ===');
    console.log('✅ Success:', response.success);
    if (response.success) {
      console.log('📦 Response data keys:', Object.keys(response.data || {}));
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
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Internal server error: ${error.message}`
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function testConnection(secretKey: string): Promise<ESIMAccessResponse> {
  console.log('🔍 Testing eSIM Access API connection...');
  
  const testEndpoints = [
    '/account',
    '/plans',
  ];

  for (const endpoint of testEndpoints) {
    try {
      const url = `https://api.esimaccess.com/v1${endpoint}`;
      console.log(`🔧 Testing: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log(`📊 Status: ${response.status}`);

      if (response.ok) {
        const responseText = await response.text();
        console.log('✅ API connection successful!');
        console.log('📦 Response preview:', responseText.substring(0, 200));
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          data = { rawResponse: responseText };
        }

        return { 
          success: true, 
          data: { 
            endpoint: url, 
            status: response.status,
            response: data 
          } 
        };
      } else {
        const errorText = await response.text();
        console.log(`❌ Failed (${response.status}): ${errorText.substring(0, 200)}`);
        
        if (response.status === 401) {
          return { 
            success: false, 
            error: 'Authentication failed - please check your API key' 
          };
        }
      }
    } catch (error) {
      console.log(`💥 Network error: ${error.message}`);
    }
  }

  return { 
    success: false, 
    error: 'Unable to connect to eSIM Access API - please check your API key and network connectivity' 
  };
}

async function getPackages(secretKey: string): Promise<ESIMAccessResponse> {
  console.log('📦 Getting available eSIM packages...');
  
  try {
    const url = 'https://api.esimaccess.com/v1/plans';
    console.log(`🔧 Calling: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log(`📊 Status: ${response.status}`);

    if (response.ok) {
      const responseText = await response.text();
      console.log('✅ Packages retrieved successfully!');
      console.log('📦 Response preview:', responseText.substring(0, 500));
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        data = { rawResponse: responseText };
      }

      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Failed: ${errorText.substring(0, 200)}`);
      
      return { 
        success: false, 
        error: `Failed to retrieve packages: ${response.status} - ${errorText}` 
      };
    }
  } catch (error) {
    console.log(`💥 Network error: ${error.message}`);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}

async function createOrder(orderData: ESIMAccessOrder, secretKey: string): Promise<ESIMAccessResponse> {
  console.log('🔄 Creating eSIM order...');
  console.log('📦 Order data:', JSON.stringify(orderData, null, 2));
  
  try {
    const url = 'https://api.esimaccess.com/v1/orders';
    console.log(`🔧 Calling: ${url}`);
    
    // Convert our order data to match eSIM Access API format
    const payload = {
      planId: orderData.packageId,
      customerEmail: orderData.customerEmail,
      ...(orderData.customerName && { customerName: orderData.customerName }),
      ...(orderData.referenceId && { referenceId: orderData.referenceId })
    };
    
    console.log('🔧 Payload:', JSON.stringify(payload, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log(`📊 Status: ${response.status}`);

    if (response.ok) {
      const responseText = await response.text();
      console.log('✅ Order created successfully!');
      console.log('📦 Response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        data = { rawResponse: responseText };
      }

      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Failed: ${errorText.substring(0, 200)}`);
      
      return { 
        success: false, 
        error: `Failed to create order: ${response.status} - ${errorText}` 
      };
    }
  } catch (error) {
    console.log(`💥 Network error: ${error.message}`);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}

async function getOrder(orderId: string, secretKey: string): Promise<ESIMAccessResponse> {
  console.log('🔍 Getting order details for ID:', orderId);
  
  try {
    const url = `https://api.esimaccess.com/v1/orders/${orderId}`;
    console.log(`🔧 Calling: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log(`📊 Status: ${response.status}`);

    if (response.ok) {
      const responseText = await response.text();
      console.log('✅ Order details retrieved successfully!');
      console.log('📦 Response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        data = { rawResponse: responseText };
      }

      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Failed: ${errorText.substring(0, 200)}`);
      
      return { 
        success: false, 
        error: `Failed to get order: ${response.status} - ${errorText}` 
      };
    }
  } catch (error) {
    console.log(`💥 Network error: ${error.message}`);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}

async function downloadESIM(orderId: string, secretKey: string): Promise<ESIMAccessResponse> {
  console.log('⬇️ Downloading eSIM for order ID:', orderId);
  
  // For now, we'll use the get order endpoint as the download might be part of the order response
  // This can be updated once we know the exact download endpoint
  return await getOrder(orderId, secretKey);
}
