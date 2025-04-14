import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

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
  const [loading, setLoading] = useState(true);
  const [isSupabaseReady, setIsSupabaseReady] = useState(isSupabaseConfigured());
  const { toast } = useToast();

  useEffect(() => {
    // Skip Supabase initialization if not configured
    if (!isSupabaseReady) {
      setLoading(false);
      return;
    }

    // Check active sessions and set the user
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (!error && data?.session) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
            
          if (!userError) {
            setUser(userData);
          } else {
            console.error('Error fetching user profile:', userError);
          }
        }
      } catch (err) {
        console.error('Error checking session:', err);
      } finally {
        setLoading(false);
      }
    };
    
    getSession();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (!error) {
              setUser(data);
            }
          } catch (err) {
            console.error('Error fetching user profile after auth change:', err);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
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
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (!profileError) {
          setUser(profileData);
        }
        
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
      return;
    }

    try {
      await supabase.auth.signOut();
      setUser(null);
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
