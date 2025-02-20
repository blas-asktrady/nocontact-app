import React, { createContext, useContext, useState, useEffect } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';

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

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        signInWithApple,
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
