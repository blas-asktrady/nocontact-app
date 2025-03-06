import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  'chat/voice': undefined;
  tabs: {
    screen?: string;
  };
};

const VoiceChatScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isListening, setIsListening] = useState(false);
  const [timer, setTimer] = useState(0);

  const navigateBack = () => {
    try {
      const canGoBack = navigation.canGoBack();
      if (canGoBack) {
        navigation.goBack();
      } else {
        navigation.navigate('tabs', { screen: 'home' });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      try {
        navigation.navigate('tabs', { screen: 'home' });
      } catch (fallbackError) {
        console.error('Fallback navigation failed:', fallbackError);
      }
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimer(0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateBack}>
          <Feather name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{formatTime(timer)}</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <Image 
            source={require('@/assets/images/face.png')}
            style={styles.avatar}
            defaultSource={require('@/assets/images/face.png')}
          />
          {isListening && (
            <View style={styles.listeningContainer}>
              <Text style={styles.listeningText}>Listening</Text>
              <View style={styles.waveform}>
                {/* Add waveform visualization here */}
              </View>
            </View>
          )}
        </View>

        {/* Bottom Controls */}
        <View style={styles.controls}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.hangupButton]}
            onPress={() => navigation.navigate('chat/voice')}
          >
            <Feather name="phone-off" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.controlButton, styles.micButton, isListening && styles.micButtonActive]}
            onPress={toggleListening}
          >
            <Feather name="mic" size={24} color={isListening ? '#FFFFFF' : '#4B69FF'} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6a77e3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    fontSize: 16,
    color: '#000000',
  },
  timerContainer: {
    backgroundColor: '#EAEEF2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  timer: {
    fontSize: 16,
    color: '#000000',
  },
  videoButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 48,
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 50,
    padding: 10,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 0,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  listeningContainer: {
    alignItems: 'center',
  },
  listeningText: {
    fontSize: 18,
    color: '#4B69FF',
    marginBottom: 8,
  },
  waveform: {
    height: 40,
    width: 200,
    backgroundColor: '#EAEEF2',
    borderRadius: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hangupButton: {
    backgroundColor: '#FF4B4B',
  },
  micButton: {
    backgroundColor: '#EEF0FF',
  },
  micButtonActive: {
    backgroundColor: '#4B69FF',
  },
});

export default VoiceChatScreen