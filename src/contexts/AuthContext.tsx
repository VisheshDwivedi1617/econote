import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Session } from '@supabase/supabase-js';

type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
} | null;

interface AuthContextType {
  user: User;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (data: { first_name?: string; last_name?: string; avatar_url?: string }) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  isSupabaseReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseReady, setIsSupabaseReady] = useState(isSupabaseConfigured());
  const { toast } = useToast();

  useEffect(() => {
    if (!isSupabaseReady) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          setTimeout(async () => {
            try {
              const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentSession.user.id)
                .single();
                
              if (!error && data) {
                setUser(data);
              } else if (error && error.code !== 'PGRST116') {
                console.error('Error fetching user profile:', error);
              }
            } catch (err) {
              console.error('Error in auth state change handler:', err);
            }
          }, 0);
        } else {
          setUser(null);
        }
      }
    );
    
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (!error && data?.session) {
          setSession(data.session);
          
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
            
          if (!userError) {
            setUser(userData);
          } else if (userError.code !== 'PGRST116') {
            console.error('Error fetching user profile:', userError);
          }
        }
      } catch (err) {
        console.error('Error checking session:', err);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [isSupabaseReady]);
  
  const signUp = async (email: string, password: string) => {
    if (!isSupabaseReady) {
      toast({
        title: 'Supabase not configured',
        description: 'Please set up your Supabase environment variables',
        variant: 'destructive',
      });
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password
      });
      
      if (error) {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }
      
      if (data.user) {
        toast({
          title: 'Success!',
          description: 'Please check your email to confirm your account',
        });
      }
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'An error occurred',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };
  
  const signIn = async (email: string, password: string) => {
    if (!isSupabaseReady) {
      toast({
        title: 'Supabase not configured',
        description: 'Please set up your Supabase environment variables',
        variant: 'destructive',
      });
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }
      
      if (data.user) {
        setTimeout(async () => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (!profileError) {
            setUser(profileData);
          }
        }, 0);
        
        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
      }
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'An error occurred',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };
  
  const signOut = async () => {
    if (!isSupabaseReady) {
      setUser(null);
      setSession(null);
      return;
    }

    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
    } catch (error: any) {
      toast({
        title: 'An error occurred',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const resetPassword = async (email: string) => {
    if (!isSupabaseReady) {
      toast({
        title: 'Supabase not configured',
        description: 'Please set up your Supabase environment variables',
        variant: 'destructive',
      });
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast({
          title: 'Password reset failed',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }
      
      toast({
        title: 'Password reset email sent',
        description: 'Please check your email for a password reset link.',
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'An error occurred',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };
  
  const updateProfile = async (data: { first_name?: string; last_name?: string; avatar_url?: string }) => {
    if (!isSupabaseReady) {
      toast({
        title: 'Supabase not configured',
        description: 'Please set up your Supabase environment variables',
        variant: 'destructive',
      });
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      if (!user) {
        throw new Error('No user logged in');
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
        
      if (error) {
        toast({
          title: 'Profile update failed',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }
      
      setUser({ ...user, ...data });
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'An error occurred',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };
  
  const updatePassword = async (password: string) => {
    if (!isSupabaseReady) {
      toast({
        title: 'Supabase not configured',
        description: 'Please set up your Supabase environment variables',
        variant: 'destructive',
      });
      return { error: { message: 'Supabase not configured' } };
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        toast({
          title: 'Password update failed',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }
      
      toast({
        title: 'Password updated',
        description: 'Your password has been successfully updated.',
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: 'An error occurred',
        description: error.message,
        variant: 'destructive',
      });
      return { error };
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        updatePassword,
        isSupabaseReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
