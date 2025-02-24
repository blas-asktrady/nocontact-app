import React, { createContext, useContext, useState, useEffect } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import supabase from '@/libs/supabase';
import * as WebBrowser from 'expo-web-browser';

// Register WebBrowser for handling redirects
WebBrowser.maybeCompleteAuthSession();

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
  signInWithGoogle: () => Promise<void>;
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
          // Check for hash parameters that indicate a redirect
          if (window.location.hash) {
            // We're likely coming back from an OAuth flow
            await handleOAuthCallback();
          } else {
            console.log('No existing session or redirect parameters found');
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth setup error:', error);
        setIsLoading(false);
      }
    };

    setupAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session) {
          // User is signed in
          console.log('Session established in auth change event:', session.user.id);
          await fetchAndSetUserProfile(session.user.id);
          
          // Clear any hash/query parameters and redirect to dashboard
          if (window.location.hash || window.location.search.includes('?code=')) {
            window.history.replaceState(null, '', window.location.pathname);
            router.push('/survey');
          }
        } else if (event === 'SIGNED_OUT') {
          // User is signed out
          setUser(null);
          setIsLoading(false);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle OAuth callback from the redirect
  const handleOAuthCallback = async () => {
    try {
      console.log('Processing OAuth callback...');
      setIsLoading(true);
      
      // First try: process the URL parameters directly
      if (window.location.hash && window.location.hash.includes('access_token=')) {
        // Hash-based OAuth flow (implicit grant)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || '';
        const expiresIn = hashParams.get('expires_in') || '3600';
        
        if (accessToken) {
          console.log('Found access token in URL hash, manually setting session');
          
          // Set the session manually with the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            throw error;
          }
          
          if (data.session) {
            // Session established successfully
            console.log('Manual session set successfully:', data.session.user.id);
            await fetchAndSetUserProfile(data.session.user.id);
            
            // Clear the URL and redirect
            window.history.replaceState(null, '', window.location.pathname);
            router.push('/survey');
            return;
          }
        }
      } else if (window.location.search && window.location.search.includes('?code=')) {
        // Authorization code flow
        console.log('Found authorization code in URL, exchanging for session');
        
        // Let Supabase handle the code exchange automatically
        // Just check if we got a session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Session established via code exchange:', session.user.id);
          await fetchAndSetUserProfile(session.user.id);
          
          // Clear the URL and redirect
          window.history.replaceState(null, '', window.location.pathname);
          router.push('/survey');
          return;
        }
      }
      
      // If we got here, the automatic processing didn't work
      // Try a second approach: force a refresh of the auth state
      console.log('Automatic session processing failed, forcing refresh...');
      
      // Refresh the auth state
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        // Don't throw, just log - we'll try one more approach
        console.warn('Session refresh failed:', error);
      } else if (data.session) {
        console.log('Session established via refresh:', data.session.user.id);
        await fetchAndSetUserProfile(data.session.user.id);
        
        // Clear the URL and redirect
        window.history.replaceState(null, '', window.location.pathname);
        router.push('/survey');
        return;
      }
      
      // Last resort: If we still don't have a session but have OAuth parameters,
      // reload the page which sometimes helps Supabase process the tokens
      if ((window.location.hash && window.location.hash.includes('access_token=')) || 
          (window.location.search && window.location.search.includes('?code='))) {
        console.log('Trying page reload as last resort...');
        window.location.reload();
        // Don't return or set isLoading here as we're reloading the page
      } else {
        // No parameters found, just finish the loading state
        console.log('No OAuth parameters found, finishing auth check');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      setIsLoading(false);
    }
  };

  const fetchAndSetUserProfile = async (userId: string) => {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsLoading(false);
        return;
      }
      
      // Get user profile data
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
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
      setIsLoading(false);
    } catch (error) {
      console.error('Error setting user profile:', error);
      setIsLoading(false);
    }
  };

  const signInWithApple = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Apple sign-in process...');
      
      // Use Supabase Apple OAuth provider with direct browser redirect
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: window.location.origin,
          // Apple-specific options
          scopes: 'name email',
          // Add additional parameters as needed
          queryParams: {
            response_mode: 'form_post', // This helps with session establishment on some platforms
            response_type: 'code'       // Use authorization code flow for better security
          }
        }
      });

      if (error) {
        throw error;
      }
      
      console.log('Redirecting to Apple authentication...');
      // Supabase will handle the redirect in the same window
      
    } catch (error: any) {
      if (error?.code === 'ERR_CANCELED') {
        console.log('User cancelled Apple authentication');
      } else {
        console.error('Apple authentication failed:', error);
      }
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Google sign-in process...');
      
      // Use Supabase Google OAuth provider with direct browser redirect
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'select_account',  // Force account selection every time
            access_type: 'offline'     // Request refresh token
          }
        }
      });

      if (error) {
        throw error;
      }
      
      console.log('Redirecting to Google OAuth...');
      // Supabase will handle the redirect in the same window
      
    } catch (error) {
      console.error('Google authentication failed:', error);
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
        signInWithGoogle,
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