import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import supabase from '@/libs/supabase';
import { getUserById } from '@/services/userService';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

interface User {
  id: string;
  email: string;
  name?: string;
  isOnboardingCompleted?: boolean;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: any | null }>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and set up auth right away
  useEffect(() => {
    // Run once on component mount
    const setupAuth = async () => {
      try {
        console.log('Setting up auth and checking for session...');
        
        // Check for any existing session first
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Found existing session:', session.user.id);
          await fetchAndSetUserProfile(session.user.id);
        } else {
          console.log('No existing session found');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth setup error:', error);
        setIsLoading(false);
      }
    };

    setupAuth();

    // Listen for auth state changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session) {
          // User is signed in
          console.log('Session established in auth change event:', session.user.id);
          await fetchAndSetUserProfile(session.user.id);
          
          // Make sure loading state is reset
          setIsLoading(false);
          
          // Delay the navigation to ensure components are mounted
          setTimeout(() => {
            router.push('/survey');
          }, 300); // Increased delay for more reliability
        } else if (event === 'SIGNED_OUT') {
          // User is signed out
          setUser(null);
          setIsLoading(false);
        }
      }
    );
    
    return () => {
      // Clean up listeners
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const fetchAndSetUserProfile = async (userId: string) => {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoading(false);
        return;
      }
      
      // Call getUserById from userService to get the latest user data
      const dbUser = await getUserById(session.user.id);
      
      const userData: User = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || dbUser?.name || '',
        isOnboardingCompleted: session.user.user_metadata?.is_onboarding_completed || dbUser?.is_onboarding_completed || false,
      };
      
      setUser(userData);
      setIsLoading(false);
      
      // Don't redirect here - let the _layout component handle redirects
    } catch (error) {
      console.error('Error setting user profile:', error);
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Starting email sign-in process...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Email sign-in error:', error);
        setIsLoading(false);
        return { error };
      }
      
      console.log('Email sign-in successful');
      
      // The auth state change listener should handle setting the user
      return { error: null };
    } catch (error) {
      console.error('Email sign-in failed:', error);
      setIsLoading(false);
      return { error };
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Starting email sign-up process...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: Platform.OS === 'web' 
            ? window.location.origin 
            : Linking.createURL('/', { scheme: 'myapp' })
        }
      });
      
      if (error) {
        console.error('Email sign-up error:', error);
        setIsLoading(false);
        return { error };
      }
      
      console.log('Email sign-up successful');
      
      // If email confirmation is required
      if (data.user && !data.user.confirmed_at) {
        console.log('Email confirmation required');
        setIsLoading(false);
      }
      
      return { error: null };
    } catch (error) {
      console.error('Email sign-up failed:', error);
      setIsLoading(false);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      console.log('Starting password reset process...');
      
      const redirectTo = Platform.OS === 'web' 
        ? window.location.origin + '/reset-password' 
        : Linking.createURL('/reset-password', { scheme: 'myapp' });
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
      });
      
      setIsLoading(false);
      
      if (error) {
        console.error('Password reset error:', error);
        return { error };
      }
      
      console.log('Password reset email sent');
      return { error: null };
    } catch (error) {
      console.error('Password reset failed:', error);
      setIsLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      // Delay navigation to ensure components are mounted
      setTimeout(() => {
        router.push('/');
      }, 100);
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext)
  if (context === undefined) {
      throw new Error('useUser must be used within a UserProvider')
  }
  return context
}