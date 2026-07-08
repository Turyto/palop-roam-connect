// ---------------------------------------------------------------------------
// GET-PARTNER-DASHBOARD
// Sole data route for the partner area. Partners never query tables directly:
//   1. Authenticate the caller's JWT (401 if missing/invalid).
//   2. Require profiles.role = 'partner' (403 otherwise).
//   3. Resolve the caller's active partner referral code (404 if none).
//   4. With the service role key, fetch their partner_commissions and
//      consignment_orders, compute summary totals server-side, and return
//      one JSON payload.
// Logging: no customer emails, no full order IDs, no amounts — only
// invocation, resolved partner_code, row counts, and errors.
// ---------------------------------------------------------------------------

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, sentry-trace, baggage',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const sum = (rows: Array<Record<string, unknown>>, field: string, pred: (r: Record<string, unknown>) => boolean): number =>
  Math.round(
    rows.reduce((acc, r) => (pred(r) ? acc + (Number(r[field]) || 0) : acc), 0) * 100,
  ) / 100;

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[get-partner-dashboard] invoked');

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      console.error('[get-partner-dashboard] server misconfigured');
      return json({ error: 'Server misconfigured' }, 500);
    }

    // --- 1. Caller identity. Signature is validated by verify_jwt; we parse
    // the claims for the subject (auth.uid) only.
    let callerSub: string | null = null;
    try {
      const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
      const claims = JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      callerSub = typeof claims?.sub === 'string' ? claims.sub : null;
    } catch (_) { /* parse only */ }
    if (!callerSub) {
      return json({ error: 'Not authenticated' }, 401);
    }

    const restHeaders = {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`,
      'Accept': 'application/json',
    };
    const rest = async (path: string): Promise<unknown> => {
      const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, { headers: restHeaders });
      if (!res.ok) {
        throw new Error(`REST query failed (${res.status})`);
      }
      return res.json();
    };

    // --- 2. Role gate: partners only.
    const profiles = await rest(`profiles?id=eq.${encodeURIComponent(callerSub)}&select=role&limit=1`) as Array<{ role?: string }>;
    if (profiles?.[0]?.role !== 'partner') {
      console.warn('[get-partner-dashboard] rejected — caller is not a partner');
      return json({ error: 'Partner access only' }, 403);
    }

    // --- 3. Active partner referral code.
    const codes = await rest(
      `referral_codes?user_id=eq.${encodeURIComponent(callerSub)}&type=eq.partner&is_active=eq.true&select=id,code,label&limit=1`,
    ) as Array<{ id: string; code: string; label: string | null }>;
    const partnerCode = codes?.[0];
    if (!partnerCode) {
      console.warn('[get-partner-dashboard] no active partner code for caller');
      return json({ error: 'No active partner code found' }, 404);
    }
    console.log(`[get-partner-dashboard] partner_code=${partnerCode.code}`);

    // --- 4/5. Fetch commissions + consignment orders (service role).
    // customer_email is deliberately excluded from the commissions select.
    const [commissions, consignmentOrders] = await Promise.all([
      rest(
        `partner_commissions?partner_code=eq.${encodeURIComponent(partnerCode.code)}` +
        `&select=id,order_id,customer_name,amount,currency,rate,status,commission_date,paid_at` +
        `&order=commission_date.desc,created_at.desc`,
      ) as Promise<Array<Record<string, unknown>>>,
      rest(
        `consignment_orders?partner_id=eq.${encodeURIComponent(callerSub)}` +
        `&select=id,batch_id,plan_name,quantity,unit_price,total_value,status,paid_at,notes,created_at` +
        `&order=created_at.desc`,
      ) as Promise<Array<Record<string, unknown>>>,
    ]);

    // --- 6. Summary totals (server-side).
    const summary = {
      commission_total_earned: sum(commissions, 'amount', (r) => r.status === 'owed' || r.status === 'paid'),
      commission_total_paid: sum(commissions, 'amount', (r) => r.status === 'paid'),
      commission_total_pending: sum(commissions, 'amount', (r) => r.status === 'owed'),
      consignment_total_pending: sum(consignmentOrders, 'total_value', (r) => r.status === 'pending'),
      consignment_total_paid: sum(consignmentOrders, 'total_value', (r) => r.status === 'paid'),
    };
    const totalSalesCount = commissions.filter((r) => r.status !== 'cancelled').length;

    console.log(`[get-partner-dashboard] rows commissions=${commissions.length} consignment=${consignmentOrders.length}`);

    return json({
      partner: {
        code: partnerCode.code,
        label: partnerCode.label ?? partnerCode.code,
        total_sales_count: totalSalesCount,
      },
      summary,
      commissions,
      consignment_orders: consignmentOrders,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    console.error('[get-partner-dashboard] error:', msg);
    return json({ error: msg }, 500);
  }
});
