import React, { createContext, useContext, useState, useEffect } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import supabase from '@/libs/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
  daysCounter: number;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;  // Add Google sign-in method
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      // Get the current session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (session) {
        // Get user profile data from your database if needed
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching user profile:', profileError);
        }
        
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || '',
          daysCounter: userProfile?.days_counter || 0,
        };
        
        setUser(userData);
        router.push('/');
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }
  };

  const signInWithApple = async () => {
    try {
      setIsLoading(true);
      
      // Use Supabase Apple OAuth provider
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: window.location.origin,
        }
      });

      if (error) {
        throw error;
      }
      
      // Supabase handles the OAuth flow and redirects back to the app
      
    } catch (error: any) {
      if (error?.code === 'ERR_CANCELED') {
        console.log('User cancelled Apple authentication');
      } else {
        console.error('Apple authentication failed:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      // Use Supabase Google OAuth provider
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        }
      });

      if (error) {
        throw error;
      }
      
      // Supabase handles the OAuth flow and redirects back to the app
      // The user session will be available after the redirect
      // No need to manually set the user here, as we'll get it from the session check
      
    } catch (error) {
      console.error('Google authentication failed:', error);
    } finally {
      setIsLoading(false);
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
      router.push('/');
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
        signInWithApple,
        signInWithGoogle,  // Add to the context value
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