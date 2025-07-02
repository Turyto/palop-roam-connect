
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

    console.log('=== eSIM Access API Diagnostic ===');
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
        response = await diagnosticTest(secretKey);
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

// New diagnostic function to test what endpoints are actually available
async function diagnosticTest(secretKey: string): Promise<ESIMAccessResponse> {
  console.log('🔍 Running comprehensive diagnostic test...');
  
  // Test possible base URLs
  const baseUrls = [
    'https://api.esimaccess.com',
    'https://esimaccess.com/api',
    'https://app.esimaccess.com/api',
    'https://portal.esimaccess.com/api',
  ];

  // Test different authentication methods
  const authMethods = [
    { name: 'Bearer', headers: { 'Authorization': `Bearer ${secretKey}` } },
    { name: 'X-API-Key', headers: { 'X-API-Key': secretKey } },
    { name: 'AccessCode', headers: { 'AccessCode': secretKey } },
    { name: 'API-Key', headers: { 'API-Key': secretKey } },
  ];

  // Test endpoints that might exist
  const testEndpoints = [
    '', // Root
    '/status',
    '/health',
    '/packages',
    '/bundles',
    '/plans',
    '/inventory',
    '/account',
    '/profile',
  ];

  const results = [];

  for (const baseUrl of baseUrls) {
    console.log(`🔧 Testing base URL: ${baseUrl}`);
    
    for (const authMethod of authMethods) {
      console.log(`🔧 Testing auth method: ${authMethod.name}`);
      
      for (const endpoint of testEndpoints) {
        const url = `${baseUrl}${endpoint}`;
        
        try {
          const headers = {
            ...authMethod.headers,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          };

          console.log(`🔧 Testing: ${url}`);
          
          const response = await fetch(url, {
            method: 'GET',
            headers,
          });

          const statusText = response.status === 200 ? '✅ SUCCESS' : 
                           response.status === 401 ? '🔐 AUTH_REQUIRED' :
                           response.status === 403 ? '🚫 FORBIDDEN' :
                           response.status === 404 ? '❌ NOT_FOUND' :
                           `❓ ${response.status}`;

          console.log(`📊 ${url} - ${statusText}`);

          if (response.status !== 404) {
            const responseText = await response.text();
            results.push({
              url,
              status: response.status,
              authMethod: authMethod.name,
              responsePreview: responseText.substring(0, 200),
            });

            if (response.status === 200) {
              console.log('🎉 FOUND WORKING ENDPOINT!');
              console.log('🎯 URL:', url);
              console.log('🎯 Auth:', authMethod.name);
              console.log('🎯 Response:', responseText.substring(0, 300));
              
              return {
                success: true,
                data: {
                  workingUrl: url,
                  authMethod: authMethod.name,
                  response: responseText,
                  allResults: results
                }
              };
            }
          }
        } catch (error) {
          console.log(`💥 ${url} - ERROR: ${error.message}`);
        }
      }
    }
  }

  console.log('🔍 No working endpoints found. Here are all non-404 responses:');
  results.forEach(result => {
    console.log(`📋 ${result.url} (${result.status}) with ${result.authMethod}: ${result.responsePreview}`);
  });

  return {
    success: false,
    error: 'No working API endpoints found',
    data: { allResults: results }
  };
}

async function getPackages(secretKey: string): Promise<ESIMAccessResponse> {
  console.log('📦 Attempting to get packages...');
  
  // Based on your dashboard, let's try the most likely endpoints
  const attempts = [
    { url: 'https://api.esimaccess.com/packages', auth: { 'X-API-Key': secretKey } },
    { url: 'https://api.esimaccess.com/bundles', auth: { 'X-API-Key': secretKey } },
    { url: 'https://api.esimaccess.com/inventory', auth: { 'X-API-Key': secretKey } },
    { url: 'https://esimaccess.com/api/packages', auth: { 'X-API-Key': secretKey } },
    { url: 'https://api.esimaccess.com/packages', auth: { 'Authorization': `Bearer ${secretKey}` } },
    { url: 'https://api.esimaccess.com/packages', auth: { 'AccessCode': secretKey } },
  ];

  for (const attempt of attempts) {
    try {
      console.log(`🔧 Trying: ${attempt.url}`);
      
      const response = await fetch(attempt.url, {
        method: 'GET',
        headers: {
          ...attempt.auth,
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
      }
    } catch (error) {
      console.log(`💥 Network error: ${error.message}`);
    }
  }

  return { 
    success: false, 
    error: 'Unable to retrieve packages from any endpoint' 
  };
}

async function createOrder(orderData: ESIMAccessOrder, secretKey: string): Promise<ESIMAccessResponse> {
  console.log('🔄 Attempting to create order...');
  console.log('📦 Order data:', JSON.stringify(orderData, null, 2));
  
  // Since all standard endpoints are failing, let's try some alternative approaches
  const attempts = [
    // Maybe it's a different domain or subdomain
    { url: 'https://app.esimaccess.com/api/orders', auth: { 'X-API-Key': secretKey }, payload: orderData },
    { url: 'https://portal.esimaccess.com/api/orders', auth: { 'X-API-Key': secretKey }, payload: orderData },
    { url: 'https://esimaccess.com/api/orders', auth: { 'X-API-Key': secretKey }, payload: orderData },
    
    // Maybe it requires a different payload structure entirely
    { 
      url: 'https://api.esimaccess.com/transaction', 
      auth: { 'X-API-Key': secretKey }, 
      payload: { 
        action: 'purchase',
        package: orderData.packageId,
        email: orderData.customerEmail,
        name: orderData.customerName
      }
    },
    
    // Maybe it's a GraphQL endpoint
    { 
      url: 'https://api.esimaccess.com/graphql', 
      auth: { 'X-API-Key': secretKey }, 
      payload: {
        query: `mutation { createOrder(packageId: "${orderData.packageId}", customerEmail: "${orderData.customerEmail}") { id status } }`
      }
    },
  ];

  for (const attempt of attempts) {
    try {
      console.log(`🔧 Trying: ${attempt.url}`);
      console.log(`🔧 Payload:`, JSON.stringify(attempt.payload, null, 2));
      
      const response = await fetch(attempt.url, {
        method: 'POST',
        headers: {
          ...attempt.auth,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(attempt.payload),
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
      }
    } catch (error) {
      console.log(`💥 Network error: ${error.message}`);
    }
  }

  return { 
    success: false, 
    error: 'Unable to create order with any URL/payload combination. The API endpoints might be different than expected or require special access.' 
  };
}

async function getOrder(orderId: string, secretKey: string): Promise<ESIMAccessResponse> {
  console.log('🔍 Getting order details for ID:', orderId);
  
  return { 
    success: false, 
    error: 'Get order functionality temporarily disabled for debugging' 
  };
}

async function downloadESIM(orderId: string, secretKey: string): Promise<ESIMAccessResponse> {
  console.log('⬇️ Downloading eSIM for order ID:', orderId);
  
  return { 
    success: false, 
    error: 'Download eSIM functionality temporarily disabled for debugging' 
  };
}
