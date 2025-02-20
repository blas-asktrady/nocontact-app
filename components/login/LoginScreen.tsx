import { Image, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useUser } from '@/hooks/useUser';

export default function LoginScreen() {
  const { signInWithApple, isLoading } = useUser();

  const handleGetStarted = () => {
    router.push('/');
  };

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('@/assets/images/sunflower-background.png')}
        style={styles.backgroundImage}
      />
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Welcome to the ultimate{'\n'}sobriety counter 🌻</ThemedText>
          <ThemedText style={styles.subtitle}>
            Your journey to recovery starts here,{'\n'}ready to begin?
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.stats}>
          <ThemedView style={styles.rating}>
            {"⭐️".repeat(5)}
          </ThemedView>
          <ThemedView style={styles.achievement}>
            <ThemedText style={styles.achievementText}>+3,000,000 days sober</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.buttons}>
          <ThemedView 
            style={styles.button}
            onTouchEnd={handleGetStarted}
          >
            <ThemedText style={styles.buttonText}>Get Started</ThemedText>
          </ThemedView>
          
          <ThemedView 
            style={styles.appleButton}
            onTouchEnd={signInWithApple}
          >
            <ThemedText style={styles.appleButtonText}>or Sign in with Apple</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '60%',
    top: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    color: '#666',
  },
  stats: {
    alignItems: 'center',
    marginBottom: 40,
  },
  rating: {
    marginBottom: 16,
  },
  achievement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementText: {
    fontSize: 18,
    color: '#666',
  },
  buttons: {
    gap: 16,
    marginBottom: Platform.select({ ios: 48, android: 24 }),
  },
  button: {
    backgroundColor: '#4169E1',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  appleButton: {
    alignItems: 'center',
  },
  appleButtonText: {
    color: '#666',
    fontSize: 16,
  },
});