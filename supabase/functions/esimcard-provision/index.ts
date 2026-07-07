// ---------------------------------------------------------------------------
// CLIENT-INVOKED eSIMCard PROVISIONING — mirrors the esim-access create-order
// path but for supplier='esimcard'. Verifies the caller's JWT, checks the
// order belongs to them, then provisions server-side (login → purchase →
// persist → email) via the shared module. Credentials never reach the client.
// ---------------------------------------------------------------------------

import { provisionESIMCardOrder } from '../_shared/esimcard-provision.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, sentry-trace, baggage',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function verifyUser(supabaseUrl: string, serviceKey: string, token: string): Promise<{ id: string; email: string } | null> {
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
      console.error(`[esimcard-provision/verifyUser] auth check failed — status=${res.status}`);
      return null;
    }
    const user = await res.json().catch(() => null);
    if (!user?.id) return null;
    return { id: user.id, email: user.email };
  } catch (e: any) {
    console.error(`[esimcard-provision/verifyUser] exception: ${e.message}`);
    return null;
  }
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ success: false, error: 'Unauthorized' }, 401);
    const user = await verifyUser(supabaseUrl, serviceKey, authHeader.replace('Bearer ', ''));
    if (!user) return json({ success: false, error: 'Invalid token' }, 401);

    const email = Deno.env.get('ESIMCARD_EMAIL');
    const password = Deno.env.get('ESIMCARD_PASSWORD');
    if (!email || !password) {
      console.error('[esimcard-provision] missing credentials — ESIMCARD_EMAIL or ESIMCARD_PASSWORD not set');
      return json({ success: false, error: 'eSIMCard credentials not configured' }, 500);
    }

    const body = await req.json();
    const { orderId, packageTypeId, customerEmail, planName, dataAmount, referenceId } = body ?? {};
    if (!orderId || !packageTypeId) {
      return json({ success: false, error: 'orderId and packageTypeId are required' }, 400);
    }

    // Ownership + state check — the order must exist, belong to the caller, and
    // not already be provisioned (prevents duplicate purchases with real money).
    const restHeaders = { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}`, 'Accept': 'application/json' };
    const orderRes = await fetch(
      `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&user_id=eq.${user.id}&select=id,esim_status,esim_order_id&limit=1`,
      { headers: restHeaders },
    );
    const orderRows = await orderRes.json().catch(() => []);
    const order = Array.isArray(orderRows) && orderRows.length > 0 ? orderRows[0] : null;
    if (!order) {
      console.error(`[esimcard-provision] order not found or not owned — order=${orderId} userId=${user.id}`);
      return json({ success: false, error: 'Order not found' }, 404);
    }
    if (order.esim_status === 'provisioned' || order.esim_order_id) {
      console.log(`[esimcard-provision] order=${orderId} already provisioned — skipping duplicate purchase`);
      return json({ success: true, alreadyProvisioned: true, esimTranNo: order.esim_order_id ?? null });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';
    const origin = req.headers.get('origin') ?? 'https://palopconnect.com';

    console.log(`[esimcard-provision] provisioning order=${orderId} packageTypeId=${packageTypeId} userId=${user.id}`);
    const result = await provisionESIMCardOrder(
      {
        orderId,
        userId: user.id,
        packageCode: packageTypeId,
        customerEmail: customerEmail ?? user.email ?? null,
        planName: planName ?? null,
        dataAmount: dataAmount ?? null,
        referenceId: referenceId ?? `order-${orderId}`,
      },
      { supabaseUrl, serviceKey, creds: { email, password }, resendApiKey, origin, writtenBy: 'esimcard-provision-edge' },
    );

    if (!result.success) {
      console.error(`[esimcard-provision] order=${orderId} failed — ${result.error}`);
    }
    return json(result, result.success ? 200 : 400);
  } catch (error: any) {
    console.error(`[esimcard-provision] unhandled exception — ${error?.message}`);
    return json({ success: false, error: error?.message ?? 'Internal error' }, 500);
  }
});
