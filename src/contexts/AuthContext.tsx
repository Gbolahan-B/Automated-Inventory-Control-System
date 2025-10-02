import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, User, AuthState } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';
import { createErrorResponse, AppError, ERROR_TYPES } from '../utils/errorHandling';
import { ToastManager } from '../utils/toastHelpers';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { name?: string; avatar_url?: string }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  changeEmail: (newEmail: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Initial session check:', { session: !!session, error });
      setSession(session);
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          avatar_url: session.user.user_metadata?.avatar_url,
          created_at: session.user.created_at
        };
        console.log('Setting user from initial session:', userData);
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    }).catch(err => {
      console.error('Error getting initial session:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', { event, session: !!session });
      setSession(session);
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          avatar_url: session.user.user_metadata?.avatar_url,
          created_at: session.user.created_at
        };
        console.log('Setting user from auth change:', userData);
        setUser(userData);
      } else {
        console.log('Clearing user from auth change');
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Sign in response:', { data: !!data, error });

      if (error) {
        const errorDetails = createErrorResponse(error, 'signIn');
        console.log('Sign-in error classified:', errorDetails);
        return { 
          success: false, 
          error: errorDetails.userMessage,
          code: errorDetails.code 
        };
      }

      if (data?.session) {
        console.log('Sign in successful, session created');
        // Manually set the user state to ensure it's set immediately
        if (data.session.user) {
          const userData = {
            id: data.session.user.id,
            email: data.session.user.email!,
            name: data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0],
            avatar_url: data.session.user.user_metadata?.avatar_url,
            created_at: data.session.user.created_at
          };
          console.log('Manually setting user after sign in:', userData);
          setUser(userData);
          setSession(data.session);
        }
        ToastManager.success('Successfully signed in!');
        return { success: true };
      } else {
        console.log('Sign in completed but no session created');
        const errorDetails = createErrorResponse('Authentication failed - no session created', 'signIn');
        return { 
          success: false, 
          error: errorDetails.userMessage,
          code: errorDetails.code 
        };
      }
    } catch (error) {
      console.log('Unexpected sign-in error:', error);
      const errorDetails = createErrorResponse(error, 'signIn');
      return { 
        success: false, 
        error: errorDetails.userMessage,
        code: errorDetails.code 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      // Create user via server endpoint to automatically confirm email
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e78ed76b/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorDetails = createErrorResponse(errorData.error || 'Failed to create account', 'signUp');
        
        console.log('Sign-up error classified:', errorDetails);
        
        // Return additional info for email exists error to trigger UI change
        const result = { 
          success: false, 
          error: errorDetails.userMessage,
          code: errorDetails.code,
          action: errorDetails.action
        };
        
        return result;
      }

      ToastManager.success('Account created successfully! You can now sign in.');
      return { success: true };
    } catch (error) {
      const errorDetails = createErrorResponse(error, 'signUp');
      return { 
        success: false, 
        error: errorDetails.userMessage,
        code: errorDetails.code,
        action: errorDetails.action
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Error signing out: ' + error.message);
      } else {
        toast.success('Successfully signed out!');
      }
    } catch (error) {
      toast.error('An error occurred during sign out');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { name?: string; avatar_url?: string }) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) {
        return { success: false, error: error.message };
      }

      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred updating profile';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred changing password';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const changeEmail = async (newEmail: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) {
        return { success: false, error: error.message };
      }

      toast.success('Email change initiated! Please check your new email for confirmation.');
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred changing email';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    session,
    signIn,
    signUp,
    signOut,
    updateProfile,
    changePassword,
    changeEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};