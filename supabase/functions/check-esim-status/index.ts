
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ESIM_ACCESS_BASE_URL = 'https://api.esimaccess.com/v1';

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const secretKey = Deno.env.get('ESIM_ACCESS_SECRET_KEY');
    if (!secretKey) {
      console.error('eSIM Access secret key not configured');
      return new Response(
        JSON.stringify({ error: 'API configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get pending eSIM orders
    const { data: pendingOrders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id, esim_order_id, esim_status, user_id')
      .not('esim_order_id', 'is', null)
      .in('esim_status', ['pending', 'processing']);

    if (ordersError) {
      console.error('Error fetching pending orders:', ordersError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch orders' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Checking status for ${pendingOrders?.length || 0} pending eSIM orders`);

    const headers = {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    };

    let updatedCount = 0;

    for (const order of pendingOrders || []) {
      try {
        // Check eSIM order status
        const response = await fetch(`${ESIM_ACCESS_BASE_URL}/orders/${order.esim_order_id}`, {
          method: 'GET',
          headers,
        });

        if (response.ok) {
          const esimOrder = await response.json();
          console.log(`eSIM order ${order.esim_order_id} status:`, esimOrder.status);

          // Update order status if changed
          if (esimOrder.status !== order.esim_status) {
            const { error: updateError } = await supabaseAdmin
              .from('orders')
              .update({
                esim_status: esimOrder.status,
                ...(esimOrder.status === 'completed' && {
                  status: 'completed',
                  completed_at: new Date().toISOString(),
                  esim_delivered_at: new Date().toISOString()
                })
              })
              .eq('id', order.id);

            if (updateError) {
              console.error('Error updating order status:', updateError);
            } else {
              updatedCount++;
              console.log(`Updated order ${order.id} status to ${esimOrder.status}`);
            }

            // If completed, try to get download URL
            if (esimOrder.status === 'completed') {
              try {
                const downloadResponse = await fetch(`${ESIM_ACCESS_BASE_URL}/orders/${order.esim_order_id}/download`, {
                  method: 'GET',
                  headers,
                });

                if (downloadResponse.ok) {
                  const downloadData = await downloadResponse.json();
                  
                  // Update eSIM activation with download data
                  const { error: activationError } = await supabaseAdmin
                    .from('esim_activations')
                    .update({
                      status: 'delivered',
                      provisioning_status: 'completed',
                      download_url: downloadData.downloadUrl,
                      qr_code_data: downloadData.qrCode,
                      delivered_at: new Date().toISOString()
                    })
                    .eq('order_id', order.id);

                  if (activationError) {
                    console.error('Error updating eSIM activation:', activationError);
                  }

                  // Create/update QR code record
                  const { error: qrError } = await supabaseAdmin
                    .from('qr_codes')
                    .upsert({
                      order_id: order.id,
                      user_id: order.user_id,
                      activation_url: downloadData.downloadUrl || downloadData.activationUrl,
                      qr_image_url: downloadData.qrCode,
                      status: 'active'
                    }, {
                      onConflict: 'order_id'
                    });

                  if (qrError) {
                    console.error('Error creating QR code:', qrError);
                  }
                }
              } catch (downloadError) {
                console.error('Error getting download data:', downloadError);
              }
            }
          }
        } else {
          console.error(`Failed to check status for order ${order.esim_order_id}:`, response.status);
        }
      } catch (error) {
        console.error(`Error processing order ${order.id}:`, error);
      }
    }

    console.log(`Status check completed. Updated ${updatedCount} orders.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        checkedOrders: pendingOrders?.length || 0,
        updatedOrders: updatedCount 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('eSIM status check error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
