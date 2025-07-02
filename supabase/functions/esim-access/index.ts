
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

// Test different possible base URLs
const POSSIBLE_BASE_URLS = [
  'https://api.esimaccess.com',
  'https://api.esimaccess.com/v1',
  'https://esimaccess.com/api',
  'https://esimaccess.com/api/v1'
];

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

    console.log('=== eSIM Access API Test Debug ===');
    console.log('🎯 Action requested:', action);
    console.log('🎯 Request body:', JSON.stringify(body, null, 2));
    console.log('🎯 Secret key configured:', !!secretKey);
    console.log('🎯 User authenticated:', user.email);

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

async function testConnection(secretKey: string): Promise<ESIMAccessResponse> {
  console.log('🔧 Testing connection to eSIM Access API...');
  
  // Test different authentication methods and base URLs
  const authMethods = [
    { 'Authorization': `Bearer ${secretKey}` },
    { 'X-API-Key': secretKey },
    { 'AccessCode': secretKey },
    { 'Authorization': `Basic ${btoa(secretKey + ':')}` },
    { 'API-Key': secretKey },
    { 'x-api-key': secretKey }
  ];

  for (const baseUrl of POSSIBLE_BASE_URLS) {
    console.log(`🔧 Testing base URL: ${baseUrl}`);
    
    for (const [index, authMethod] of authMethods.entries()) {
      console.log(`🔧 Testing auth method ${index + 1}:`, Object.keys(authMethod)[0]);
      
      try {
        const headers = {
          ...authMethod,
          'Content-Type': 'application/json',
        };

        // Try different possible endpoints
        const endpoints = ['/packages', '/bundles', '/plans', '/inventory'];
        
        for (const endpoint of endpoints) {
          const url = `${baseUrl}${endpoint}`;
          console.log(`🔧 Testing endpoint: ${url}`);
          
          const response = await fetch(url, {
            method: 'GET',
            headers,
          });

          console.log(`📊 ${url} - Status: ${response.status}`);
          
          if (response.ok) {
            const data = await response.text();
            console.log(`✅ SUCCESS! Working URL: ${url}`);
            console.log(`✅ Working auth method:`, Object.keys(authMethod)[0]);
            console.log(`✅ Response preview:`, data.substring(0, 200));
            
            return { 
              success: true, 
              data: { 
                workingUrl: url, 
                authMethod: Object.keys(authMethod)[0],
                response: data.substring(0, 500)
              } 
            };
          }
        }
      } catch (error) {
        console.log(`❌ Error testing ${baseUrl}:`, error.message);
      }
    }
  }

  return { 
    success: false, 
    error: 'Unable to establish connection with any URL/auth combination' 
  };
}

async function getPackages(secretKey: string): Promise<ESIMAccessResponse> {
  try {
    console.log('📦 Getting packages from eSIM Access API...');
    
    // Try the most common patterns first
    const urlsToTry = [
      'https://api.esimaccess.com/packages',
      'https://api.esimaccess.com/v1/packages',
      'https://api.esimaccess.com/bundles',
      'https://api.esimaccess.com/v1/bundles'
    ];

    const authHeaders = [
      { 'Authorization': `Bearer ${secretKey}` },
      { 'X-API-Key': secretKey },
      { 'AccessCode': secretKey }
    ];

    for (const url of urlsToTry) {
      for (const authHeader of authHeaders) {
        console.log(`🔧 Trying: ${url} with ${Object.keys(authHeader)[0]}`);
        
        const headers = {
          ...authHeader,
          'Content-Type': 'application/json',
        };

        const response = await fetch(url, {
          method: 'GET',
          headers,
        });

        console.log(`📊 ${url} - Status: ${response.status}`);

        if (response.ok) {
          const responseText = await response.text();
          console.log('✅ Packages retrieved successfully from:', url);
          console.log('✅ Auth method:', Object.keys(authHeader)[0]);
          
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            data = { rawResponse: responseText };
          }

          return { success: true, data };
        } else {
          const errorText = await response.text();
          console.log(`❌ ${url} failed:`, errorText);
        }
      }
    }

    return { 
      success: false, 
      error: 'Unable to retrieve packages from any endpoint' 
    };
  } catch (error) {
    console.error('❌ Get packages network error:', error);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}

async function createOrder(orderData: ESIMAccessOrder, secretKey: string): Promise<ESIMAccessResponse> {
  try {
    console.log('🔄 Creating eSIM order - trying different formats...');
    
    // Different payload formats to try
    const payloadFormats = [
      // Format 1: Simple format
      {
        type: "transaction",
        item: orderData.packageId,
        quantity: 1,
        assign: true
      },
      // Format 2: Customer object format
      {
        packageId: orderData.packageId,
        customer: {
          email: orderData.customerEmail,
          name: orderData.customerName
        },
        referenceId: orderData.referenceId
      },
      // Format 3: Flat format
      {
        packageId: orderData.packageId,
        customerEmail: orderData.customerEmail,
        customerName: orderData.customerName,
        referenceId: orderData.referenceId
      }
    ];

    const urlsToTry = [
      'https://api.esimaccess.com/orders',
      'https://api.esimaccess.com/v1/orders',
      'https://api.esimaccess.com/order',
      'https://api.esimaccess.com/v1/order',
      'https://api.esimaccess.com/purchase',
      'https://api.esimaccess.com/v1/purchase'
    ];

    const authHeaders = [
      { 'Authorization': `Bearer ${secretKey}` },
      { 'X-API-Key': secretKey },
      { 'AccessCode': secretKey }
    ];

    for (const url of urlsToTry) {
      for (const authHeader of authHeaders) {
        for (const [index, payload] of payloadFormats.entries()) {
          console.log(`🔧 Trying: ${url} with auth ${Object.keys(authHeader)[0]} and payload format ${index + 1}`);
          console.log('🔧 Payload:', JSON.stringify(payload, null, 2));
          
          const headers = {
            ...authHeader,
            'Content-Type': 'application/json',
          };

          const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
          });

          console.log(`📊 ${url} - Status: ${response.status}`);

          if (response.ok) {
            const responseText = await response.text();
            console.log('✅ Order created successfully!');
            console.log('✅ Working URL:', url);
            console.log('✅ Working auth:', Object.keys(authHeader)[0]);
            console.log('✅ Working payload format:', index + 1);
            
            let data;
            try {
              data = JSON.parse(responseText);
            } catch (parseError) {
              data = { rawResponse: responseText };
            }

            return { success: true, data };
          } else {
            const errorText = await response.text();
            console.log(`❌ ${url} failed:`, errorText.substring(0, 200));
          }
        }
      }
    }

    return { 
      success: false, 
      error: 'Unable to create order with any URL/payload combination' 
    };
  } catch (error) {
    console.error('❌ Create order network error:', error);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}

async function getOrder(orderId: string, secretKey: string): Promise<ESIMAccessResponse> {
  try {
    console.log('🔍 Getting order details for ID:', orderId);
    
    const urlsToTry = [
      `https://api.esimaccess.com/orders/${orderId}`,
      `https://api.esimaccess.com/v1/orders/${orderId}`,
      `https://api.esimaccess.com/order/${orderId}`,
      `https://api.esimaccess.com/v1/order/${orderId}`
    ];

    const authHeaders = [
      { 'Authorization': `Bearer ${secretKey}` },
      { 'X-API-Key': secretKey },
      { 'AccessCode': secretKey }
    ];

    for (const url of urlsToTry) {
      for (const authHeader of authHeaders) {
        const headers = {
          ...authHeader,
          'Content-Type': 'application/json',
        };
        
        const response = await fetch(url, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          const responseText = await response.text();
          console.log('✅ Order details retrieved from:', url);
          
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            data = { rawResponse: responseText };
          }

          return { success: true, data };
        }
      }
    }

    return { 
      success: false, 
      error: 'Unable to retrieve order from any endpoint' 
    };
  } catch (error) {
    console.error('❌ Get order network error:', error);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}

async function downloadESIM(orderId: string, secretKey: string): Promise<ESIMAccessResponse> {
  try {
    console.log('⬇️ Downloading eSIM for order ID:', orderId);
    
    const urlsToTry = [
      `https://api.esimaccess.com/orders/${orderId}/download`,
      `https://api.esimaccess.com/v1/orders/${orderId}/download`,
      `https://api.esimaccess.com/order/${orderId}/download`,
      `https://api.esimaccess.com/v1/order/${orderId}/download`
    ];

    const authHeaders = [
      { 'Authorization': `Bearer ${secretKey}` },
      { 'X-API-Key': secretKey },
      { 'AccessCode': secretKey }
    ];

    for (const url of urlsToTry) {
      for (const authHeader of authHeaders) {
        const headers = {
          ...authHeader,
          'Content-Type': 'application/json',
        };
        
        const response = await fetch(url, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          const responseText = await response.text();
          console.log('✅ eSIM download data retrieved from:', url);
          
          let data;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            data = { rawResponse: responseText };
          }

          return { success: true, data };
        }
      }
    }

    return { 
      success: false, 
      error: 'Unable to download eSIM from any endpoint' 
    };
  } catch (error) {
    console.error('❌ Download eSIM network error:', error);
    return { 
      success: false, 
      error: `Network error: ${error.message}` 
    };
  }
}
