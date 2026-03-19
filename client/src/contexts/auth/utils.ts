
import { supabase } from '@/integrations/supabase/client';

export const fetchUserRole = async (userId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return 'customer';
    }

    return data?.role || 'customer';
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'customer';
  }
};

export const signUp = async (email: string, password: string, fullName?: string) => {
  try {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });
    return { data, error };
  } catch (error) {
    console.error('Auth utils: Sign up error:', error);
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  } catch (error) {
    console.error('Auth utils: Sign in error:', error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Auth utils: Sign out error:', error);
    return { error };
  }
};
