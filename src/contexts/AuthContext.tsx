import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Computed property for authentication status
  const isAuthenticated = !!(user && session);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setSession(null);
            setUser(null);
          }
        } else {
          if (mounted) {
            setSession(session);
            setUser(session?.user ?? null);
          }
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }

      // Handle auth events with appropriate notifications
      if (event === 'SIGNED_IN' && session?.user) {
        toast.success(`Welcome back, ${session.user.email}!`, {
          description: 'You have successfully signed in to GymPulse',
        });
      } else if (event === 'SIGNED_OUT') {
        toast.success('Successfully signed out', {
          description: 'You have been logged out of GymPulse',
        });
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      } else if (event === 'USER_UPDATED') {
        console.log('User updated');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Account created successfully!', {
          description: 'Please check your email to verify your account.',
        });
      } else {
        toast.success('Account created successfully!', {
          description: 'You can now sign in to your account.',
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred during sign up';
      toast.error('Sign up failed', {
        description: message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Success toast will be handled by the auth state change listener
      console.log('Sign in successful:', data.user?.email);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred during sign in';
      toast.error('Sign in failed', {
        description: message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      // Clear expiry alert sessionStorage flag for this user
      if (user && user.id) {
        sessionStorage.removeItem(`expiryAlertShown_${user.id}`);
      }
      // Success toast will be handled by the auth state change listener
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred during sign out';
      toast.error('Sign out failed', {
        description: message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      toast.success('Password reset email sent!', {
        description: 'Please check your inbox and follow the instructions.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      toast.error('Password reset failed', {
        description: message,
      });
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}