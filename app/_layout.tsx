// app/_layout.tsx
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { JournalProvider } from '@/hooks/useJournal';
import { ChatsProvider } from '@/hooks/useChats';
import { UserProvider } from '@/hooks/useUser';
import { MessagesProvider } from '@/hooks/useMessages';
import { PandaProvider } from '@/hooks/usePanda';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <UserProvider>
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
                <Stack.Screen 
                  name="onboarding" 
                  options={{
                    headerShown: false,
                  }}
                />
                
                {/* Authenticated tab navigation */}
                <Stack.Screen 
                  name="(tabs)"
                  options={{
                    headerShown: false,
                  }}
                />
                
                {/* Modal screens */}
                <Stack.Screen 
                  name="(modals)/not-found" 
                  options={{ 
                    title: 'Oops!',
                    headerShown: true,
                    presentation: 'modal',
                    headerTitleStyle: {
                      fontFamily: 'SpaceMono',
                    },
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
