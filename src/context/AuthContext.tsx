import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, UserProfile, Session } from '@/lib/supabase';
import type { SignUpUserData, SupabaseError } from '@/types';
import { IS_SUPABASE_CONFIGURED } from '@/lib/config';

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: SupabaseError | null }>;
  signUp: (email: string, password: string, userData: SignUpUserData) => Promise<{ error: SupabaseError | null; user: UserProfile | null }>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => Promise<{ error: SupabaseError | null }>;
  fetchUserProfile: (userId: string) => Promise<UserProfile | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSupabaseConfigured = IS_SUPABASE_CONFIGURED;

  const buildFallbackUser = (sessionUser: { id: string; email?: string; user_metadata?: Record<string, string> }): UserProfile => ({
    id: sessionUser.id,
    email: sessionUser.email || '',
    first_name: sessionUser.user_metadata?.first_name || 'User',
    middle_name: sessionUser.user_metadata?.middle_name || '',
    last_name: sessionUser.user_metadata?.last_name || '',
    phone: sessionUser.user_metadata?.phone || '',
    role: 'citizen',
    is_verified: false,
    account_status: 'active',
  });

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', {
          code: (error as any).code,
          message: error.message,
          details: (error as any).details,
          hint: (error as any).hint,
          userId,
        });
        return null;
      }

      if (!data) {
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (session?.user?.id) {
      const profile = await fetchUserProfile(session.user.id);
      setUser(profile);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      if (!isSupabaseConfigured) {
        if (!isMounted) return;
        setSession(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const timeoutPromise = new Promise<{ data: { session: Session | null } }>((resolve) => {
          setTimeout(() => resolve({ data: { session: null } }), 8000);
        });

        const sessionPromise = supabase.auth.getSession();
        const { data: { session: currentSession } } = await Promise.race([sessionPromise, timeoutPromise]);

        if (!isMounted) return;

        setSession(currentSession);
        if (currentSession?.user) {
          const profile = await fetchUserProfile(currentSession.user.id);
          if (!isMounted) return;
          setUser(profile ?? buildFallbackUser(currentSession.user));
        } else {
          setUser(null);
        }
      } catch (error) {
        if (!isMounted) return;
        setSession(null);
        setUser(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession: Session | null) => {
      setSession(newSession);
      if (newSession?.user) {
        const profile = await fetchUserProfile(newSession.user.id);
        setUser(profile ?? buildFallbackUser(newSession.user));
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isSupabaseConfigured]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, userData: SignUpUserData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData },
    });
    return { error, user: data?.user };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const updateUser = async (data: Partial<UserProfile>) => {
    const { error } = await supabase.auth.updateUser({ data });
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signUp, signOut, updateUser, fetchUserProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};