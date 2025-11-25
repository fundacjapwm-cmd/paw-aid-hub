import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  role: 'ADMIN' | 'ORG' | 'USER';
  display_name: string | null;
  avatar_url: string | null;
  must_change_password: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  isAdmin: boolean;
  isOrg: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let refreshInterval: NodeJS.Timeout | null = null;
    
    const fetchProfile = async (userId: string) => {
      try {
        const [{ data: profileData }, { data: roleData }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', userId).single(),
          supabase.from('user_roles').select('role').eq('user_id', userId).single()
        ]);
        
        if (mounted && profileData) {
          setProfile({
            ...profileData,
            role: roleData?.role || 'USER'
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    const checkAndRefreshSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) return;
      
      const expiresAt = currentSession.expires_at;
      if (!expiresAt) return;
      
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;
      const REFRESH_THRESHOLD = 5 * 60; // 5 minutes before expiry
      
      if (timeUntilExpiry < REFRESH_THRESHOLD && timeUntilExpiry > 0) {
        console.log('Session expiring soon, refreshing...');
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Failed to refresh session:', error);
        } else if (data.session && mounted) {
          setSession(data.session);
          setUser(data.session.user);
          console.log('Session refreshed successfully');
        }
      }
    };

    // Check for existing session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(() => {
          if (mounted) setLoading(false);
        });
        
        // Start periodic session check (every 60 seconds)
        refreshInterval = setInterval(checkAndRefreshSession, 60 * 1000);
      } else {
        setLoading(false);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
          
          // Start/restart periodic session check
          if (refreshInterval) clearInterval(refreshInterval);
          refreshInterval = setInterval(checkAndRefreshSession, 60 * 1000);
        } else {
          setProfile(null);
          if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
          }
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/auth?confirmed=true`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: displayName ? { display_name: displayName } : undefined
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    // Fetch profile to check must_change_password
    if (data.user) {
      const [profileResult, roleResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single(),
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single()
      ]);
      
      if (profileResult.data) {
        setProfile({
          ...profileResult.data,
          role: roleResult.data?.role || 'USER'
        });
      }
    }
    
    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      // Even if signOut fails (e.g., session_not_found), clear local state
      console.warn('SignOut error (clearing local state anyway):', error);
    }
    // Always clear local state regardless of server response
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    
    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }
    
    return { error };
  };

  const isAdmin = profile?.role === 'ADMIN';
  const isOrg = profile?.role === 'ORG';
  const isUser = profile?.role === 'USER';

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      isAdmin,
      isOrg,
      isUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}