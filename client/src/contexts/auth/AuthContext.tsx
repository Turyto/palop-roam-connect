
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
  const [roleError, setRoleError] = useState(false);
  const [loading, setLoading] = useState(true);

  const resolveRole = async (userId: string) => {
    const role = await fetchUserRole(userId);
    if (role === null) {
      // Role lookup failed — do not default to 'customer'.
      // Leave userRole as null and surface the error so Auth.tsx can show a safe message.
      setRoleError(true);
      setUserRole(null);
    } else {
      setRoleError(false);
      setUserRole(role);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          setTimeout(async () => {
            await resolveRole(session.user.id);
          }, 0);
        } else if (event === 'SIGNED_OUT' || !session) {
          setUserRole(null);
          setRoleError(false);
        }

        setLoading(false);
      }
    );

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting initial session:', error);
          setLoading(false);
          return;
        }

        if (session) {
          setSession(session);
          setUser(session.user);
          await resolveRole(session.user.id);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    const result = await signOut();
    if (!result.error) {
      setSession(null);
      setUser(null);
      setUserRole(null);
      setRoleError(false);
    }
    setLoading(false);
    return result;
  };

  const handleSignIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await signIn(email, password);
    if (result.error) {
      console.error('Sign in error:', result.error);
      setLoading(false);
    }
    return result;
  };

  const handleSignUp = async (email: string, password: string, fullName?: string) => {
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
    roleError,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
