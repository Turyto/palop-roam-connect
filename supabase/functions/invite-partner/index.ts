// invite-partner — Edge Function
//
// Lets an admin onboard a partner entirely from the dashboard:
//   1. Creates the partner's auth account (pre-confirmed, temp password) —
//      or reuses an existing account with that email.
//   2. Promotes the profile to role 'partner'.
//   3. Creates the referral code (type 'partner') or re-points an existing
//      partner code at the account.
//
// Admin-only (caller JWT verified, profiles.role must be 'admin').
// The temp password is returned ONCE in the response for the admin to pass
// on securely; it is never stored or emailed.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, sentry-trace, baggage',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const CODE_RE = /^[A-Z0-9]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateTempPassword = (): string => {
  // 16 chars from an unambiguous alphabet (no 0/O/1/l/I).
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      console.error('[invite-partner] server misconfigured');
      return json({ error: 'Server misconfigured' }, 500);
    }

    // --- 1. Admin gate --------------------------------------------------
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Missing authorization header' }, 401);

    const callerRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { 'apikey': serviceKey, 'Authorization': authHeader },
    });
    if (!callerRes.ok) return json({ error: 'Unauthorized' }, 401);
    const caller = await callerRes.json();

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: callerProfile } = await admin
      .from('profiles').select('role').eq('id', caller.id).single();
    if (callerProfile?.role !== 'admin') {
      return json({ error: 'Forbidden — admin only' }, 403);
    }

    // --- 2. Validate input ----------------------------------------------
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? '').trim().toLowerCase();
    const code = String(body?.code ?? '').trim().toUpperCase();
    const partnerName = String(body?.partner_name ?? '').trim().slice(0, 80);

    if (!EMAIL_RE.test(email)) return json({ error: 'A valid partner email is required.' }, 400);
    if (!CODE_RE.test(code)) return json({ error: 'Code must be 3–20 letters/numbers.' }, 400);
    if (!partnerName) return json({ error: 'Partner name is required.' }, 400);

    // If the code already exists it must be a partner code (we re-point it);
    // never hijack a customer code.
    const { data: existingCode, error: codeErr } = await admin
      .from('referral_codes')
      .select('id, type, user_id')
      .eq('code', code)
      .maybeSingle();
    if (codeErr) {
      console.error('[invite-partner] code lookup failed', codeErr);
      return json({ error: 'Could not check the referral code.' }, 500);
    }
    if (existingCode && existingCode.type !== 'partner') {
      return json({ error: `Code ${code} already exists as a customer code.` }, 400);
    }

    // --- 3. Create (or reuse) the auth account ---------------------------
    let userId: string | null = null;
    let tempPassword: string | null = null;
    let existingUser = false;

    const password = generateTempPassword();
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: partnerName },
    });

    if (created?.user?.id) {
      userId = created.user.id;
      tempPassword = password;
    } else {
      const err = createErr as { code?: string; status?: number; message?: string } | null;
      const msg = (err?.message ?? '').toLowerCase();
      const isDuplicate =
        err?.code === 'email_exists' ||
        err?.status === 422 ||
        msg.includes('already') || msg.includes('registered') || msg.includes('exists');
      if (!isDuplicate) {
        console.error('[invite-partner] createUser failed', createErr);
        return json({ error: 'Could not create the partner account.' }, 500);
      }
      // Account already exists — find it via the profiles table (kept in
      // sync by handle_new_user) and reuse it.
      existingUser = true;
      const { data: prof } = await admin
        .from('profiles').select('id, role').eq('email', email).maybeSingle();
      if (!prof?.id) {
        console.error('[invite-partner] existing auth user has no profile', email);
        return json({ error: 'An account with this email exists but has no profile. Contact support.' }, 409);
      }
      if (prof.role === 'admin') {
        return json({ error: 'This email belongs to an admin account.' }, 400);
      }
      userId = prof.id;
    }

    // If any later step fails for an account WE just created, delete it so a
    // retry starts clean (otherwise the temp password would be lost forever).
    const rollbackAndFail = async (step: string, detail: unknown): Promise<Response> => {
      console.error(`[invite-partner] ${step} failed`, detail);
      if (!existingUser && userId) {
        const { error: delErr } = await admin.auth.admin.deleteUser(userId);
        if (delErr) {
          console.error('[invite-partner] rollback deleteUser failed', delErr);
          return json({ error: `${step} failed and cleanup also failed — contact support before retrying.` }, 500);
        }
      }
      return json({ error: `${step} failed. Nothing was saved — retry the invite.` }, 500);
    };

    // --- 4. Promote profile to partner -----------------------------------
    const { error: roleErr } = await admin
      .from('profiles').update({ role: 'partner' }).eq('id', userId);
    if (roleErr) {
      return await rollbackAndFail('Promoting the account to partner', roleErr);
    }

    // --- 5. Create or re-point the referral code -------------------------
    if (existingCode) {
      const { error } = await admin
        .from('referral_codes')
        .update({ user_id: userId, label: partnerName, is_active: true })
        .eq('id', existingCode.id);
      if (error) {
        return await rollbackAndFail('Linking the referral code', error);
      }
    } else {
      const { error } = await admin.from('referral_codes').insert({
        user_id: userId,
        code,
        label: partnerName,
        type: 'partner',
        is_active: true,
        uses_count: 0,
      });
      if (error) {
        return await rollbackAndFail('Creating the referral code', error);
      }
    }

    console.log(`[invite-partner] ${existingUser ? 'linked existing' : 'created'} partner ${userId} code ${code}`);
    return json({
      ok: true,
      code,
      email,
      existing_user: existingUser,
      temp_password: tempPassword, // null when the account already existed
    });
  } catch (e) {
    console.error('[invite-partner] unexpected error', e);
    return json({ error: 'Unexpected error' }, 500);
  }
});
