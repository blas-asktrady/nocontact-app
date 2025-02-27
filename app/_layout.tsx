// app/_layout.tsx
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { JournalProvider } from '@/hooks/useJournal';
import { ChatsProvider } from '@/hooks/useChats';
import { UserProvider } from '@/hooks/useUser';
import { MessagesProvider } from '@/hooks/useMessages';
import { PandaProvider } from '@/hooks/usePanda';
import { router } from 'expo-router';
import { View, Text } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a separate component for authentication logic
function AuthenticationCheck() {
  const { user, isLoading } = require('@/hooks/useUser').useUser();
  
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

  return null; // This component doesn't render anything
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  // Track whether we've completed initial layout
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      setIsReady(true);
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <UserProvider>
      {isReady && <AuthenticationCheck />}
      <ChatsProvider>
        <MessagesProvider>
          <JournalProvider>
            <PandaProvider>
              <ThemeProvider value={DefaultTheme}>
                <Stack screenOptions={{
                  headerShown: false,
                }}>
                  {/* Non-authenticated stack screens */}
                  <Stack.Screen 
                    name="index" 
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen 
                    name="survey" 
                    options={{
                      headerShown: false,
                    }}
                  />
                </Stack>
                <StatusBar style="dark" />
              </ThemeProvider>
            </PandaProvider>
          </JournalProvider>
        </MessagesProvider>
      </ChatsProvider>
    </UserProvider>
  );
}