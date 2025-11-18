
import React, { createContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType } from './types';
import { fetchUserRole, signUp, signIn, signOut } from './utils';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Initializing auth state...');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id || 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          console.log('Fetching user role for authenticated user:', session.user.id);
          // Fetch role without blocking the UI
          setTimeout(async () => {
            const role = await fetchUserRole(session.user.id);
            console.log('User role fetched:', role);
            setUserRole(role);
          }, 0);
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out, clearing role');
          setUserRole(null);
        }
        
        // Always set loading to false after handling auth state change
        setLoading(false);
      }
    );

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          setLoading(false);
          return;
        }

        console.log('Initial session retrieved:', session?.user?.id || 'No session');
        
        if (session) {
          setSession(session);
          setUser(session.user);
          
          // Fetch user role
          const role = await fetchUserRole(session.user.id);
          console.log('Initial user role:', role);
          setUserRole(role);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setLoading(false);
      }
    };

    // Get initial session
    getInitialSession();

    return () => {
      console.log('AuthProvider: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    console.log('AuthProvider: Signing out...');
    setLoading(true);
    
    const result = await signOut();
    
    if (!result.error) {
      setSession(null);
      setUser(null);
      setUserRole(null);
    }
    
    setLoading(false);
    return result;
  };

  const handleSignIn = async (email: string, password: string) => {
    console.log('AuthProvider: Signing in user:', email);
    setLoading(true);
    
    const result = await signIn(email, password);
    
    if (result.error) {
      console.error('Sign in error:', result.error);
      setLoading(false);
    }
    // Don't set loading to false here - let the auth state change handle it
    
    return result;
  };

  const handleSignUp = async (email: string, password: string, fullName?: string) => {
    console.log('AuthProvider: Signing up user:', email);
    setLoading(true);
    
    const result = await signUp(email, password, fullName);
    
    if (result.error) {
      console.error('Sign up error:', result.error);
    }
    
    setLoading(false);
    return result;
  };

  const value = {
    user,
    session,
    loading,
    userRole,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };

  console.log('AuthProvider: Rendering with state:', { 
    hasUser: !!user, 
    loading, 
    userRole,
    sessionExists: !!session
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
