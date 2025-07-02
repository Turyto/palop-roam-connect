
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
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, ...body } = await req.json();
    const secretKey = Deno.env.get('ESIM_ACCESS_SECRET_KEY');

    if (!secretKey) {
      console.error('eSIM Access secret key not configured');
      return new Response(
        JSON.stringify({ error: 'API configuration missing' }),
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
        response = { success: false, error: 'Invalid action' };
    }

    console.log(`eSIM Access API ${action} response:`, response);

    return new Response(
      JSON.stringify(response),
      { 
        status: response.success ? 200 : 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('eSIM Access function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getPackages(headers: Record<string, string>): Promise<ESIMAccessResponse> {
  try {
    const response = await fetch(`${ESIM_ACCESS_BASE_URL}/packages`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Get packages error:', errorData);
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Get packages fetch error:', error);
    return { success: false, error: 'Failed to fetch packages' };
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

    console.log('Creating eSIM order with payload:', payload);

    const response = await fetch(`${ESIM_ACCESS_BASE_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Create order error:', errorData);
      return { success: false, error: `API error: ${response.status} - ${errorData}` };
    }

    const data = await response.json();
    console.log('eSIM order created successfully:', data);
    
    // Get the order details immediately to fetch the QR code and activation data
    if (data.id || data.orderId) {
      const orderDetails = await getOrder(data.id || data.orderId, headers);
      if (orderDetails.success) {
        // Merge the creation response with the detailed order information
        return { 
          success: true, 
          data: {
            ...data,
            ...orderDetails.data,
            qrCodeUrl: orderDetails.data?.qrCodeUrl || orderDetails.data?.downloadUrl,
            activationCode: orderDetails.data?.activationCode,
            iccid: orderDetails.data?.iccid
          }
        };
      }
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Create order fetch error:', error);
    return { success: false, error: 'Failed to create order' };
  }
}

async function getOrder(orderId: string, headers: Record<string, string>): Promise<ESIMAccessResponse> {
  try {
    console.log('Fetching order details for:', orderId);
    
    const response = await fetch(`${ESIM_ACCESS_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Get order error:', errorData);
      return { success: false, error: `API error: ${response.status} - ${errorData}` };
    }

    const data = await response.json();
    console.log('Order details retrieved:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Get order fetch error:', error);
    return { success: false, error: 'Failed to get order' };
  }
}

async function downloadESIM(orderId: string, headers: Record<string, string>): Promise<ESIMAccessResponse> {
  try {
    const response = await fetch(`${ESIM_ACCESS_BASE_URL}/orders/${orderId}/download`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Download eSIM error:', errorData);
      return { success: false, error: `API error: ${response.status} - ${errorData}` };
    }

    const data = await response.json();
    console.log('eSIM download data:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Download eSIM fetch error:', error);
    return { success: false, error: 'Failed to download eSIM' };
  }
}
