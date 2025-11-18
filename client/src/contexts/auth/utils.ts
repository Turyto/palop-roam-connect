
import { supabase } from '@/integrations/supabase/client';

export const fetchUserRole = async (userId: string): Promise<string> => {
  try {
    console.log('Fetching user role for:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return 'customer';
    }

    const role = data?.role || 'customer';
    console.log('User role fetched:', role);
    return role;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'customer';
  }
};

export const signUp = async (email: string, password: string, fullName?: string) => {
  try {
    console.log('Auth utils: Starting sign up for:', email);
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    
    console.log('Auth utils: Sign up result:', { success: !error, userId: data.user?.id });
    return { data, error };
  } catch (error) {
    console.error('Auth utils: Sign up error:', error);
    return { data: null, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    console.log('Auth utils: Starting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('Auth utils: Sign in result:', { success: !error, userId: data.user?.id });
    return { data, error };
  } catch (error) {
    console.error('Auth utils: Sign in error:', error);
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    console.log('Auth utils: Signing out user...');
    const { error } = await supabase.auth.signOut();
    
    if (!error) {
      console.log('Auth utils: User signed out successfully');
    }
    
    return { error };
  } catch (error) {
    console.error('Auth utils: Sign out error:', error);
    return { error };
  }
};
