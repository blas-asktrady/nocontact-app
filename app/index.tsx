import { StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@/hooks/useUser';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AntDesign as AppleIcon } from '@expo/vector-icons';
import GoogleLogo from '@/components/ui/GoogleLogo';

const { height } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, signInWithApple, signInWithGoogle } = useUser();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [user]);
  
  const handleGetStarted = () => {
    router.push('/survey');
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      // Use the signInWithGoogle method from useUser, which now properly handles redirects
      await signInWithGoogle();
      
      // No need to set isAuthenticating to false here as the page will redirect and reload
      // The useUser hook now handles the redirect and session setup
    } catch (error) {
      console.error('Error with Google sign in:', error);
      setIsAuthenticating(false);
    }
    // Don't use finally block as the page will redirect and reload
  };

  // Check if the app is running in a web browser
  const isRunningInBrowser = Platform.OS === 'web';

  return (
    <ThemedView style={styles.container}>
      {/* Background Image with Gradient Overlay */}
      <ThemedView style={styles.backgroundContainer}>
        <ThemedView style={styles.imageContainer}>
          <LinearGradient
            colors={['rgba(88, 86, 214, 0.8)', 'rgba(255, 100, 130, 0.8)']}
            style={styles.gradient}
          />
        </ThemedView>
      </ThemedView>

      {/* Animated Content Card */}
      <Animated.View 
        style={[
          styles.contentCard,
          {
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <ThemedView style={styles.content}>
          {/* Main content area */}
          <ThemedView style={styles.mainContent}>
            <ThemedView style={styles.header}>
              <ThemedText style={styles.title}>Meet your new{'\n'}buddy, NoContact Panda</ThemedText>
              <ThemedView style={styles.buddyCircle}>
                <ThemedText style={styles.buddyEmoji}>🐼</ThemedText>
              </ThemedView>
              <ThemedText style={styles.subtitle}>Feel better every day</ThemedText>
            </ThemedView>

            <ThemedView style={styles.stats}>
              <ThemedText style={styles.ratingText}>⭐️⭐️⭐️⭐️⭐️</ThemedText>
              <ThemedText style={styles.achievementText}>Helped 3M+ people feel happier</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Button area fixed at bottom */}
          <ThemedView style={styles.buttons}>
            <ThemedView 
              style={styles.primaryButton}
              onTouchEnd={handleGetStarted}
            >
              <ThemedText style={styles.primaryButtonText}>Skip Sign In</ThemedText>
            </ThemedView>
            
            {/* Show Apple Sign-in button only on iOS */}
            {!isRunningInBrowser && (
              <ThemedView 
                style={styles.appleButton}
                onTouchEnd={signInWithApple}
              >
                <AppleIcon name="apple1" size={18} color="#FFFFFF" style={styles.appleIcon} />
                <ThemedText style={styles.appleButtonText}>Sign in with Apple</ThemedText>
              </ThemedView>
            )}
            
            {/* Show Google Sign-in button only in browser */}
            {isRunningInBrowser && (
              <ThemedView 
                style={[
                  styles.googleButton,
                  isAuthenticating && styles.disabledButton
                ]}
                onTouchEnd={() => isAuthenticating ? undefined : handleGoogleSignIn()}
              >
                <GoogleLogo size={20} />
                <ThemedText style={styles.googleButtonText}>
                  {isAuthenticating ? 'Signing in...' : 'Sign in with Google'}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // Styles remain the same as in your original file
  container: {
    flex: 1,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  contentCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '50%', // Further reduced height to minimize bottom white space
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 16,
    paddingBottom: 12, // Reduced bottom padding
    backgroundColor: 'transparent',
    justifyContent: 'space-between', // Puts buttons at bottom
  },
  mainContent: {
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000000',
    lineHeight: 34,
  },
  buddyCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  buddyEmoji: {
    fontSize: 28,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#000000',
    opacity: 0.7,
  },
  stats: {
    alignItems: 'center',
    marginTop: 16, // Small space after header
    backgroundColor: 'transparent',
  },
  ratingText: {
    fontSize: 20,
    letterSpacing: 3,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
    textAlign: 'center',
  },
  buttons: {
    gap: 6,
    backgroundColor: 'transparent',
    marginBottom: 8, // Add a small margin to prevent buttons from being too close to bottom edge
  },
  primaryButton: {
    backgroundColor: '#4169E1',
    borderRadius: 30,
    padding: 14,
    alignItems: 'center',
    marginBottom: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    height: 50,
    marginBottom: 6,
  },
  appleIcon: {
    marginRight: 8,
  },
  appleButtonText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    color: '#FFFFFF',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    color: '#3C4043',
  },
  disabledButton: {
    opacity: 0.7,
  },
});