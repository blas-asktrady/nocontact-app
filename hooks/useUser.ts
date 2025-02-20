import { useState, useEffect } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';

interface User {
  id: string;
  email: string;
  name?: string;
  daysCounter: number;
}

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for existing session
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      // Here you would typically check for stored credentials
      // and validate them with your backend
      const storedUser = await localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        router.push('/');
      }
    } catch (error) {
      console.error('Session check failed:', error);
    }
  };

  const signInWithApple = async () => {
    try {
      setIsLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Here you would typically:
      // 1. Send the credential to your backend
      // 2. Get user data back
      // 3. Store the session token
      
      const userData: User = {
        id: credential.user,
        email: credential.email || '',
        name: credential.fullName?.givenName,
        daysCounter: 0,
      };

      await localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      router.push('/');
    } catch (error) {
      if (error.code === 'ERR_CANCELED') {
        // Handle user cancellation
        console.log('User cancelled Apple authentication');
      } else {
        console.error('Apple authentication failed:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await localStorage.removeItem('user');
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    signInWithApple,
    signOut,
  };
};