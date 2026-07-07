
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language';
import { useESIMAccess } from '@/hooks/useESIMAccess';
import type { CreateOrderData } from './types';

interface OrderInsertWithESIM {
  user_id: string;
  plan_id: string;
  plan_name: string;
  data_amount: string;
  duration_days: number;
  price: number;
  currency: string;
  status: string;
  payment_status: string;
  customer_email?: string;
  payment_intent_id?: string;
  esim_package_id?: string;
  esim_status?: string;
  esim_order_id?: string;
  esim_delivered_at?: string;
  referral_code?: string | null;
}

// Extract the relevant eSIM fields from the nested eSIM Access API response.
// Edge fn returns: { success, data: <raw_api_response> }
// Raw API response: { success, obj: { esimTranNo, packageInfoList: [{ esimList: [{ iccid, activationCode, qrCodeUrl, shortUrl, downloadUrl }] }] } }
// Edge function now returns extracted fields at top level (esimTranNo, iccid, activationCode,
// qrCodeUrl, shortUrl) alongside the raw data. We prefer those; fall back to deep-path parsing
// for backward compatibility with older function versions.
function parseESIMResponse(esimResponse: any) {
  if (esimResponse?.esimTranNo || esimResponse?.iccid) {
    return {
      esimTranNo: esimResponse.esimTranNo as string | undefined,
      iccid: esimResponse.iccid as string | undefined,
      activationCode: esimResponse.activationCode as string | undefined,
      qrCodeUrl: esimResponse.qrCodeUrl as string | undefined,
      shortUrl: esimResponse.shortUrl as string | undefined,
    };
  }
  const obj = esimResponse?.obj ?? esimResponse?.data?.obj;
  const esimTranNo: string | undefined = obj?.esimTranNo ?? obj?.packageInfoList?.[0]?.esimTranNo;
  const esimEntry = obj?.packageInfoList?.[0]?.esimList?.[0];
  return {
    esimTranNo,
    iccid: esimEntry?.iccid as string | undefined,
    activationCode: (esimEntry?.activationCode ?? esimEntry?.ac) as string | undefined,
    qrCodeUrl: esimEntry?.qrCodeUrl as string | undefined,
    shortUrl: (esimEntry?.shortUrl || esimEntry?.downloadUrl || esimEntry?.url) as string | undefined,
  };
}

export const useCreateOrderWithESIM = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const c = t.checkout;
  const queryClient = useQueryClient();
  const { createOrderAsync: createESIMOrder } = useESIMAccess();

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      if (!user) throw new Error('No active session. Please try again.');

      const customerEmail = orderData.customerEmail || user.email || '';
      const paymentIntentId = orderData.payment_intent_id;

      // --- IDEMPOTENCY CHECK ---
      if (paymentIntentId) {
        const { data: existingOrders } = await supabase
          .from('orders')
          .select('id, esim_order_id, esim_status')
          .eq('payment_intent_id', paymentIntentId)
          .limit(1);

        if (existingOrders && existingOrders.length > 0) {
          const existing = existingOrders[0];
          return {
            order: existing,
            esimError: null,
            esimSuccess: !!existing.esim_order_id,
          };
        }
      }

      // --- FETCH eSIM PACKAGE MAPPING ---
      const { data: packageResponse } = await supabase.functions.invoke('get-esim-package', {
        body: { plan_id: orderData.plan_id }
      });

      const packageData = packageResponse?.data;
      let esimOrderData: any = null;
      let esimError: string | null = null;
      let parsedESIM: ReturnType<typeof parseESIMResponse> | null = null;

      // Supplier routing: eSIMCard rows carry supplier='esimcard' + supplier_package_id.
      const isESIMCard = packageData?.supplier === 'esimcard' && !!packageData?.supplier_package_id;

      // Guard: package row found but not provisionable by any known supplier path
      if (packageData && !packageData.esim_access_package_id && !isESIMCard) {
        esimError = `Plan '${orderData.plan_id}' has no provisionable package configured (supplier: ${packageData.supplier ?? 'unknown'})`;
        console.error('[useCreateOrderWithESIM] package found but no usable package id:', packageData);
      }

      // --- CREATE LOCAL ORDER (BEFORE provisioning) ---
      // The order row is created first so the esim-access edge function receives
      // a real order_id and can persist the resolved ICCID/QR server-side before
      // returning. This eliminates the silent data-loss window where a client
      // drop after provisioning would lose the credentials forever.
      const hasPackageMapping = !!packageData?.esim_access_package_id || isESIMCard;
      const supplierPackageId = isESIMCard
        ? (packageData!.supplier_package_id as string)
        : (packageData?.esim_access_package_id ?? null);

      if (!packageData) {
        // 7.3 — Missing package mapping: not a transient API failure but a configuration gap.
        // Set a clear error so the order is marked failed and the admin alert fires below.
        esimError = `No eSIM package mapping found for plan '${orderData.plan_name}' (plan_id: ${orderData.plan_id}). Add an eSIM Access Package Code in the admin catalog editor.`;
        console.error('[useCreateOrderWithESIM] missing esim_packages row for plan_id:', orderData.plan_id);
      }

      const order: OrderInsertWithESIM = {
        user_id: user.id,
        plan_id: orderData.plan_id,
        plan_name: orderData.plan_name,
        data_amount: orderData.data_amount,
        duration_days: orderData.duration_days,
        price: orderData.price,
        currency: orderData.currency || 'EUR',
        status: paymentIntentId ? 'completed' : 'pending',
        payment_status: paymentIntentId ? 'succeeded' : 'pending',
        customer_email: customerEmail || null,
        payment_intent_id: paymentIntentId,
        ...(orderData.referral_code && { referral_code: orderData.referral_code }),
        // Provisional eSIM status — finalised after the supplier call below.
        ...(hasPackageMapping
          ? {
              esim_package_id: supplierPackageId,
              // eSIMCard: insert as 'pending' — the esimcard-provision edge fn
              // performs the atomic pending→provisioning claim itself.
              esim_status: isESIMCard ? 'pending' : 'provisioning',
            }
          : {
              esim_package_id: supplierPackageId ?? null,
              esim_status: 'failed',
            }),
      };

      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw new Error(`Database error: ${orderError.message}`);
      }

      // --- ORDER ITEM ---
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: orderResult.id,
          plan_id: orderData.plan_id,
          plan_name: orderData.plan_name,
          data_amount: orderData.data_amount,
          duration_days: orderData.duration_days,
          unit_price: orderData.price,
          quantity: 1,
          total_price: orderData.price,
        });

      if (itemError) {
        console.error('Error creating order item:', itemError);
        throw new Error(`Order item creation failed: ${itemError.message}`);
      }

      // --- PROVISION eSIM WITH SUPPLIER ---
      // orderId + userId are passed so the edge function persists the resolved
      // ICCID/QR server-side BEFORE returning to the client.
      if (hasPackageMapping && isESIMCard) {
        // eSIMCard supplier — the edge function does everything server-side
        // (login → purchase → persist activation/QR/order rows → email).
        try {
          const { data: cardResponse, error: cardInvokeError } = await supabase.functions.invoke('esimcard-provision', {
            body: {
              orderId: orderResult.id,
              customerEmail,
              planName: orderData.plan_name,
              dataAmount: orderData.data_amount,
              referenceId: paymentIntentId ?? `order-${Date.now()}`,
            },
          });
          if (cardInvokeError || !cardResponse?.success) {
            esimError = cardInvokeError?.message || cardResponse?.error || 'eSIMCard provisioning failed';
            console.error('[useCreateOrderWithESIM] esimcard-provision failed:', esimError);
          } else {
            esimOrderData = cardResponse;
            parsedESIM = {
              esimTranNo: cardResponse.esimTranNo ?? undefined,
              iccid: cardResponse.iccid ?? undefined,
              activationCode: cardResponse.activationCode ?? undefined,
              qrCodeUrl: cardResponse.qrCodeUrl ?? undefined,
              shortUrl: cardResponse.shortUrl ?? undefined,
            };
          }
        } catch (error: any) {
          esimError = error.message || 'eSIM provisioning failed';
          console.error('eSIMCard order creation error:', error);
        }
      } else if (hasPackageMapping) {
        try {
          const esimResponse = await createESIMOrder({
            packageId: packageData!.esim_access_package_id,
            customerEmail,
            customerName: user.user_metadata?.full_name || customerEmail,
            referenceId: paymentIntentId ?? `order-${Date.now()}`,
            planName: orderData.plan_name,
            dataAmount: orderData.data_amount,
            orderId: orderResult.id,
            userId: user.id,
          });

          if (esimResponse.success && esimResponse.data) {
            esimOrderData = esimResponse.data;
            parsedESIM = parseESIMResponse(esimResponse);
          } else {
            esimError = esimResponse.error || 'Failed to create eSIM order';
            console.error('eSIM order creation failed:', esimResponse);
          }
        } catch (error: any) {
          esimError = error.message || 'eSIM provisioning failed';
          console.error('eSIM order creation error:', error);
        }
      }

      // --- FINALISE ORDER eSIM STATUS ---
      // The edge function may have already patched this server-side; we set it
      // again from the client as a fallback so the outcome is always recorded.
      if (parsedESIM?.esimTranNo) {
        await supabase
          .from('orders')
          .update({
            esim_status: 'provisioned',
            esim_order_id: parsedESIM.esimTranNo,
            esim_package_id: supplierPackageId,
            esim_delivered_at: new Date().toISOString(),
          })
          .eq('id', orderResult.id);
      } else if (esimError) {
        await supabase
          .from('orders')
          .update({ esim_status: 'failed' })
          .eq('id', orderResult.id);
      }

      // --- eSIM ACTIVATION RECORD (fallback, existence-checked) ---
      // The edge function persists this server-side as the authoritative write.
      // The client only inserts if no row exists yet (e.g. older edge deployment
      // or a server-side persist failure), preventing duplicate rows.
      if (parsedESIM && packageData) {
        const { data: existingActivation } = await supabase
          .from('esim_activations')
          .select('id')
          .eq('order_id', orderResult.id)
          .limit(1);

        if (!existingActivation || existingActivation.length === 0) {
          const { error: activationError } = await supabase
            .from('esim_activations')
            .insert({
              order_id: orderResult.id,
              user_id: user.id,
              status: 'pending',
              provisioning_status: 'completed',
              activation_url: parsedESIM.shortUrl,
              iccid: parsedESIM.iccid,
              activation_code: parsedESIM.activationCode,
              qr_code_data: parsedESIM.activationCode,
              provisioning_log: {
                esim_order_id: parsedESIM.esimTranNo,
                created_at: new Date().toISOString(),
                package_code: supplierPackageId,
                iccid: parsedESIM.iccid,
                qr_code_url: parsedESIM.qrCodeUrl,
                short_url: parsedESIM.shortUrl,
                lpa_code: parsedESIM.activationCode,
              },
            });

          if (activationError) {
            console.error('Error creating eSIM activation:', activationError);
          }
        }

        // --- QR CODE RECORD (fallback, existence-checked) ---
        const { data: existingQr } = await supabase
          .from('qr_codes')
          .select('id')
          .eq('order_id', orderResult.id)
          .limit(1);

        if (!existingQr || existingQr.length === 0) {
          const { error: qrError } = await supabase
            .from('qr_codes')
            .insert({
              order_id: orderResult.id,
              user_id: user.id,
              esim_id: null,
              qr_image_url: parsedESIM.qrCodeUrl || null,
              activation_url: parsedESIM.activationCode || parsedESIM.shortUrl || null,
              status: 'active',
            });

          if (qrError) {
            console.error('Error creating QR code record:', qrError);
          }
        }

        // --- SEND CUSTOMER EMAIL (observable, non-blocking) ---
        // Call resend-esim-email explicitly so failures are logged and visible,
        // replacing the silent fire-and-forget inside esim-access.
        supabase.functions.invoke('resend-esim-email', {
          body: { orderId: orderResult.id },
        }).then(({ data, error }) => {
          if (error || !data?.success) {
            console.error('[useCreateOrderWithESIM] Customer email failed:', error?.message ?? data?.error ?? 'unknown');
          }
        }).catch((e: any) => {
          console.error('[useCreateOrderWithESIM] Customer email invoke error:', e?.message);
        });

      } else if (esimError) {
        // Record the failure for debugging / retry — covers BOTH:
        //   • missing package mapping (packageData === null) — 7.3 fix
        //   • package found but API call failed (packageData !== null)
        const { error: activationError } = await supabase
          .from('esim_activations')
          .insert({
            order_id: orderResult.id,
            user_id: user.id,
            status: 'pending',
            provisioning_status: 'failed',
            provisioning_log: {
              error: esimError,
              error_type: !packageData ? 'missing_package_mapping' : 'api_call_failed',
              failed_at: new Date().toISOString(),
              package_code: supplierPackageId ?? null,
              payment_intent_id: paymentIntentId,
            },
          });

        if (activationError) {
          console.error('Error creating failed eSIM activation record:', activationError);
        }

        // Fire-and-forget admin alert — failure here must not surface to the customer
        supabase.functions.invoke('notify-provisioning-failure', {
          body: {
            order_id: orderResult.id,
            customer_email: customerEmail,
            plan_id: orderData.plan_id,
            plan_name: orderData.plan_name,
            payment_intent_id: paymentIntentId,
            esim_package_id: supplierPackageId ?? null,
            error_message: esimError,
            error_type: !packageData ? 'missing_package_mapping' : 'api_call_failed',
          },
        }).catch((alertErr: any) => {
          console.error('Failed to send provisioning failure alert:', alertErr);
        });
      }

      return {
        order: orderResult,
        esimError,
        esimSuccess: !!parsedESIM?.esimTranNo,
      };
    },

    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['customer-qr-codes'] });

      if (result.esimSuccess) {
        toast({
          title: c.toastOrderSuccess,
          description: c.toastOrderSuccessDesc,
        });
      } else if (result.esimError) {
        toast({
          title: c.toastOrderPending,
          description: c.toastOrderPendingDesc,
          variant: 'destructive',
        });
      } else {
        toast({
          title: c.toastOrderCreated,
          description: c.toastOrderCreatedDesc,
        });
      }
    },

    onError: (error: any) => {
      console.error('Order creation error:', error);
      toast({
        title: c.toastOrderFailed,
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    createOrder: createOrderMutation.mutate,
    createOrderAsync: createOrderMutation.mutateAsync,
    isCreatingOrder: createOrderMutation.isPending,
  };
};
