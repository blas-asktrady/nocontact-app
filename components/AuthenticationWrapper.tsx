import { useUser } from '@/hooks/useUser';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ReactNode } from 'react';

function AuthenticationWrapper({ children }: { children: ReactNode }) {
  const { user, isLoading } = useUser();

  useEffect(() => {
    // Only handle redirects after loading is complete
    if (!isLoading) {
      if (!user) {
        // No user is signed in, redirect to the landing page
        router.replace('/');
      } else if (user.isOnboardingCompleted) {
        // User is signed in and has completed onboarding
        router.replace('/tabs/home');
      } else {
        // User is signed in but hasn't completed onboarding
        router.replace('/survey');
      }
    }
  }, [user, isLoading]);

  if (isLoading) {
    return null;
  }

  return children;
}

export default AuthenticationWrapper;