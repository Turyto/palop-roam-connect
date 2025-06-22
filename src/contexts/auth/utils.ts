
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

    console.log('User role fetched:', data?.role || 'customer');
    return data?.role || 'customer';
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'customer';
  }
};

export const signUp = async (email: string, password: string, fullName?: string) => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: fullName
      }
    }
  });
  
  return { error };
};

export const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { error };
};

export const signOut = async () => {
  console.log('Signing out user...');
  const { error } = await supabase.auth.signOut();
  
  if (!error) {
    console.log('User signed out successfully');
  }
  
  return { error };
};
