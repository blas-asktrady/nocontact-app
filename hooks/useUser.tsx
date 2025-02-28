import React, { createContext, useContext, useState, useEffect } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import supabase from '@/libs/supabase';
import * as WebBrowser from 'expo-web-browser';
import { getUserById } from '@/services/userService';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';

// Log the redirect URI to see what it is
const redirectUri = makeRedirectUri();
console.log("Redirect URI:", redirectUri);

// Register WebBrowser for handling redirects
WebBrowser.maybeCompleteAuthSession();

interface User {
  id: string;
  email: string;
  name?: string;
  isOnboardingCompleted?: boolean;
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
    // Register WebBrowser handler early to catch returning OAuth requests
    WebBrowser.maybeCompleteAuthSession();
    
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

  const signInWithApple = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Apple sign-in process...');
      
      // Different approach for web vs native
      if (Platform.OS === 'web') {
        // Web environment - use origin for the redirect
        const redirectUrl = typeof window !== 'undefined' ? window.location.origin : '';
        console.log('Web redirect URL for Apple auth:', redirectUrl);
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo: redirectUrl,
            scopes: 'name email',
          }
        });
        
        if (error) throw error;
        
        // For web, Supabase handles the redirect automatically
        console.log('Redirecting to Apple authentication (web)...');
      } else {
        // For development in Expo Go
        console.log('Opening Apple auth in Expo environment');
        
        // Make sure WebBrowser is ready to handle the return redirect
        WebBrowser.maybeCompleteAuthSession();
        
        // Set up the redirect URL with a proper scheme
        // Use a URL that will work with Expo Go and standalone builds
        const redirectUrl = Linking.createURL('/', {
          scheme: 'myapp' // Replace with your app's scheme from app.json
        });
        console.log('Using redirect URL:', redirectUrl);
        
        // Get the OAuth URL from Supabase
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo: redirectUrl,
            scopes: 'name email',
          }
        });
        
        if (error) throw error;
        
        if (data?.url) {
          console.log('Opening OAuth URL in browser:', data.url);
          
          try {
            // Open URL in browser - this will trigger the OAuth flow
            const result = await WebBrowser.openAuthSessionAsync(
              data.url,
              redirectUrl
            );
            
            console.log('Auth session result:', result);
            
            // Check if the authentication was canceled
            if (result.type === 'cancel') {
              console.log('User canceled the authentication flow');
              setIsLoading(false);
              return;
            }
            
            // If we have a success URL but the auth state change listener hasn't fired yet,
            // we can manually check for a session after a short delay
            if (result.type === 'success') {
              console.log('Authentication successful, checking session...');
              
              // Give Supabase a moment to process the authentication
              setTimeout(async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                  console.log('Session found after redirect');
                  await fetchAndSetUserProfile(session.user.id);
                } else {
                  console.log('No session found after successful redirect');
                  setIsLoading(false);
                }
              }, 1000);
            }
          } catch (browserError: any) {
            console.error('Browser authentication error:', browserError);
            
            // If WebBrowser fails, try opening in system browser as fallback
            if (Platform.OS !== 'web') {
              console.log('Attempting fallback to system browser');
              await Linking.openURL(data.url);
              
              // Since we can't easily track the result with system browser,
              // we'll need to rely on the auth state change listener
              // and just reset loading state after a timeout
              setTimeout(() => {
                setIsLoading(false);
              }, 5000);
            } else {
              setIsLoading(false);
            }
          }
        }
      }
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
      
      // Different approach for web vs native
      if (Platform.OS === 'web') {
        // Web environment - use origin for the redirect
        const redirectUrl = typeof window !== 'undefined' ? window.location.origin : '';
        console.log('Web redirect URL for Google auth:', redirectUrl);
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              prompt: 'select_account',
              access_type: 'offline'
            }
          }
        });
        
        if (error) throw error;
        
        // For web, Supabase handles the redirect automatically
        console.log('Redirecting to Google authentication (web)...');
      } else {
        // For development in Expo Go
        console.log('Opening Google auth in Expo environment');
        
        // Make sure WebBrowser is ready to handle the return redirect
        WebBrowser.maybeCompleteAuthSession();
        
        // Set up the redirect URL with a proper scheme
        // Use a URL that will work with Expo Go and standalone builds
        const redirectUrl = Linking.createURL('/', {
          scheme: 'myapp' // Replace with your app's scheme from app.json
        });
        console.log('Using redirect URL:', redirectUrl);
        
        // Get the OAuth URL from Supabase
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              prompt: 'select_account'
            }
          }
        });
        
        if (error) throw error;
        
        if (data?.url) {
          console.log('Opening OAuth URL in browser:', data.url);
          
          try {
            // Open URL in browser - this will trigger the OAuth flow
            const result = await WebBrowser.openAuthSessionAsync(
              data.url,
              redirectUrl
            );
            
            console.log('Auth session result:', result);
            
            // Check if the authentication was canceled
            if (result.type === 'cancel') {
              console.log('User canceled the authentication flow');
              setIsLoading(false);
              return;
            }
            
            // If we have a success URL but the auth state change listener hasn't fired yet,
            // we can manually check for a session after a short delay
            if (result.type === 'success') {
              console.log('Authentication successful, checking session...');
              
              // Extract the access token from the URL
              const url = new URL(result.url);
              const fragment = url.hash.substring(1);
              const params = new URLSearchParams(fragment);
              const accessToken = params.get('access_token');
              const refreshToken = params.get('refresh_token') || '';
              
              if (accessToken) {
                console.log('Access token found, setting session manually');
                try {
                  // Set the session using the token
                  const { data, error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                  });
                  
                  if (error) {
                    console.error('Error setting session:', error);
                    setIsLoading(false);
                    return;
                  }
                  
                  if (data.session) {
                    console.log('Session set successfully:', data.session.user.id);
                    
                    // Fetch user profile
                    try {
                      await fetchAndSetUserProfile(data.session.user.id);
                      console.log('User profile fetched and set');
                      
                      // Force reset loading state
                      setIsLoading(false);
                      
                      // Force navigation after a delay
                      console.log('Navigating to survey page...');
                      setTimeout(() => {
                        router.push('/survey');
                      }, 500);
                    } catch (profileError) {
                      console.error('Error fetching user profile:', profileError);
                      setIsLoading(false);
                    }
                  } else {
                    console.log('No session after setSession');
                    setIsLoading(false);
                  }
                } catch (sessionError) {
                  console.error('Error setting session:', sessionError);
                  setIsLoading(false);
                }
              } else {
                console.log('No access token found in URL, checking for session directly');
                // Give Supabase a moment to process the authentication
                setTimeout(async () => {
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                      console.log('Session found after redirect');
                      await fetchAndSetUserProfile(session.user.id);
                      
                      // Force reset loading state
                      setIsLoading(false);
                      
                      // Force navigation after a delay
                      console.log('Navigating to survey page...');
                      setTimeout(() => {
                        router.push('/survey');
                      }, 500);
                    } else {
                      console.log('No session found after successful redirect');
                      setIsLoading(false);
                    }
                  } catch (sessionCheckError) {
                    console.error('Error checking session:', sessionCheckError);
                    setIsLoading(false);
                  }
                }, 1000);
              }
            } else {
              console.log('Authentication result not successful:', result.type);
              setIsLoading(false);
            }
          } catch (browserError: any) {
            console.error('Browser authentication error:', browserError);
            setIsLoading(false);
            
            // If WebBrowser fails, try opening in system browser as fallback
            if (Platform.OS !== 'web') {
              console.log('Attempting fallback to system browser');
              try {
                await Linking.openURL(data.url);
                
                // Since we can't easily track the result with system browser,
                // we'll need to rely on the auth state change listener
                // and just reset loading state after a timeout
                setTimeout(() => {
                  setIsLoading(false);
                }, 5000);
              } catch (linkingError) {
                console.error('Error opening URL with Linking:', linkingError);
                setIsLoading(false);
              }
            }
          }
        } else {
          console.log('No URL returned from signInWithOAuth');
          setIsLoading(false);
        }
      }
    } catch (error: any) {
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