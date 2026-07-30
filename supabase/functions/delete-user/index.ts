// delete-user — Edge Function
//
// Deletes a user from Supabase Auth and cleans up all related data.
// Requires the calling user to be an admin (verified via JWT).
// Guards:
//   - Cannot delete your own account
//   - Cannot delete other admin accounts
//
// CASCADE ORDER:
//   esim_activations → qr_codes → order_items → orders → referral_rewards
//   → referral_codes → support_tickets → profiles → auth.users

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const authHeader = req.headers.get('Authorization') ?? '';

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the calling user via their JWT
    const callerRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'apikey': serviceKey, 'Authorization': authHeader },
    });
    if (!callerRes.ok) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const caller = await callerRes.json();
    const callerId: string = caller.id;

    // Verify caller is admin
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', callerId)
      .single();

    if (callerProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden — admin only' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Guard: cannot delete yourself
    if (user_id === callerId) {
      return new Response(JSON.stringify({ error: 'You cannot delete your own account.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Guard: cannot delete other admins
    const { data: targetProfile } = await adminClient
      .from('profiles')
      .select('role, email')
      .eq('id', user_id)
      .single();

    if (targetProfile?.role === 'admin' || targetProfile?.role === 'partner') {
      return new Response(JSON.stringify({ error: `${targetProfile.role === 'admin' ? 'Admin' : 'Partner'} accounts cannot be deleted via this tool. Demote to customer first.` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Cascade cleanup — order matters (FK constraints)
    const orderIds: string[] = [];
    const { data: orders } = await adminClient
      .from('orders')
      .select('id')
      .eq('user_id', user_id);
    if (orders) orderIds.push(...orders.map((o: any) => o.id));

    if (orderIds.length > 0) {
      await adminClient.from('esim_activations').delete().in('order_id', orderIds);
      await adminClient.from('qr_codes').delete().in('order_id', orderIds);
      await adminClient.from('order_items').delete().in('order_id', orderIds);
    }

    await adminClient.from('orders').delete().eq('user_id', user_id);
    await adminClient.from('referral_rewards').delete().eq('user_id', user_id);
    await adminClient.from('referral_codes').delete().eq('user_id', user_id);
    await adminClient.from('support_tickets').delete().eq('user_id', user_id);
    await adminClient.from('profiles').delete().eq('id', user_id);

    // Finally delete from Supabase Auth
    const { error: authError } = await adminClient.auth.admin.deleteUser(user_id);
    if (authError) {
      console.error('[delete-user] auth deletion failed:', authError.message);
      // Profile is already gone — log the auth failure but don't surface it as fatal
      return new Response(JSON.stringify({
        success: true,
        warning: 'Profile and data deleted but auth record removal failed. User cannot log in.',
      }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[delete-user] deleted user_id=${user_id} by admin=${callerId}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[delete-user] error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
