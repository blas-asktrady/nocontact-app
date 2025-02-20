import { StyleSheet, Platform, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@/hooks/useUser';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

const { height } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, signInWithApple } = useUser();
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleGetStarted = () => {
    router.push('/survey');
  };

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
          <ThemedView style={styles.header}>
            <ThemedText style={styles.title}>Welcome to the ultimate{'\n'}no contact counter 🙅</ThemedText>
            <ThemedText style={styles.subtitle}>
              Your journey to recovery starts here,{'\n'}ready to begin?
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.stats}>
            <ThemedView style={styles.rating}>
              <ThemedText style={styles.ratingText}>⭐️⭐️⭐️⭐️⭐️</ThemedText>
            </ThemedView>
            <ThemedView style={styles.achievementContainer}>
              <ThemedText style={styles.achievementText}>+3,000,000 days of no contact</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.buttons}>
            <ThemedView 
              style={styles.primaryButton}
              onTouchEnd={handleGetStarted}
            >
              <ThemedText style={styles.primaryButtonText}>Get Started</ThemedText>
            </ThemedView>
            
            <ThemedView 
              style={styles.secondaryButton}
              onTouchEnd={signInWithApple}
            >
              <ThemedText style={styles.secondaryButtonText}>or Sign in with Apple</ThemedText>
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
    height: '60%',
    paddingTop: 20,
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
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: 'transparent',
  },
  header: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#000000',
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    color: '#000000',
    opacity: 0.7,
    lineHeight: 28,
  },
  stats: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  rating: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  ratingText: {
    fontSize: 24,
    letterSpacing: 4,
  },
  achievementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  achievementText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '500',
  },
  buttons: {
    gap: 16,
    marginBottom: Platform.select({ ios: 48, android: 24 }),
    backgroundColor: 'transparent',
  },
  primaryButton: {
    backgroundColor: '#4169E1',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#666666',
    fontSize: 16,
  },
});