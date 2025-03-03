import { StyleSheet, Platform, Animated, Dimensions, Image, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@/hooks/useUser';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AntDesign } from '@expo/vector-icons';

// Import the LoadingScreen component
import LoadingScreen from '@/components/LoadingScreen'; // Adjust the import path as needed

const { height } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, signInWithEmail, signUpWithEmail } = useUser();
  const slideAnim = useRef(new Animated.Value(height)).current;
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [user]);
  
  // If we're in a loading state, show the loading screen
  if (isLoading) {
    return <LoadingScreen/>;
  }

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6; // Minimum 6 characters
  };

  const handleSignIn = async () => {
    // Reset error message
    setErrorMessage('');

    // Validate inputs
    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const { error } = await signInWithEmail(email, password);
    
    if (error) {
      setErrorMessage(error.message || 'Sign in failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    // Reset error message
    setErrorMessage('');

    // Validate inputs
    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const { error } = await signUpWithEmail(email, password);
    
    if (error) {
      setErrorMessage(error.message || 'Sign up failed. Please try again.');
      setIsLoading(false);
    } else {
      // Show confirmation message if email confirmation is required
      setErrorMessage('Please check your email to confirm your account.');
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setErrorMessage('');
  };
  
  return (
    <ThemedView style={styles.container}>
      {/* Background Image with Gradient Overlay */}
      <ThemedView style={styles.backgroundContainer}>
        <ThemedView style={styles.imageContainer}>
          <Image 
            source={require('@/assets/mascot/panda.png')} 
            style={styles.backgroundImage}
            resizeMode="contain"
          />
          <LinearGradient
            colors={['rgba(98, 95, 255, 0.8)', 'rgba(26, 135, 219, 0.8)']}
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
              <ThemedText style={styles.title}>Meet your new buddy,{'\n'}NoContact Panda</ThemedText>
              <ThemedView style={styles.buddyCircle}>
                <Image 
                  source={require('@/assets/mascot/face.png')} 
                  style={styles.buddyImage}
                  resizeMode="contain"
                />
              </ThemedView>
              <ThemedText style={styles.subtitle}>Feel better every day</ThemedText>
            </ThemedView>

            <ThemedView style={styles.stats}>
              <ThemedText style={styles.ratingText}>⭐️⭐️⭐️⭐️⭐️</ThemedText>
              <ThemedText style={styles.achievementText}>Helped 100+ people overcome breakups</ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Auth Form */}
          <ThemedView style={styles.authForm}>
            {errorMessage ? (
              <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
            ) : null}

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true}
            />
            
            {isSignUp ? (
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
              />
            ) : null}

            {/* Button area fixed at bottom */}
            <ThemedView style={styles.buttons}>
              <ThemedView 
                style={styles.primaryButton}
                onTouchEnd={isSignUp ? handleSignUp : handleSignIn}
              >
                <ThemedText style={styles.primaryButtonText}>
                  {isSignUp ? 'Sign Up with Email' : 'Sign In with Email'}
                </ThemedText>
              </ThemedView>
              
              <ThemedView style={styles.toggleContainer}>
                <ThemedText style={styles.toggleText}>
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </ThemedText>
                <ThemedText style={styles.toggleButton} onPress={toggleAuthMode}>
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '80%',
    height: '40%',
    top: '10%',
    left: '10%',
    opacity: 0.9,
    position: 'absolute',
    zIndex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  contentCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '60%', // Increased to accommodate form fields
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
    paddingBottom: 12,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6a77e3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  buddyImage: {
    width: '75%',
    height: '75%',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#000000',
    opacity: 0.7,
  },
  stats: {
    alignItems: 'center',
    marginTop: 16,
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
  authForm: {
    width: '100%',
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttons: {
    marginTop: 10,
    gap: 6,
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6a77e3',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    height: 50,
    marginBottom: 6,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    color: '#FFFFFF',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  toggleText: {
    fontSize: 14,
    color: '#666666',
  },
  toggleButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6a77e3',
    marginLeft: 5,
  },
});