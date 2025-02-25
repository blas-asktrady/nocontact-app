import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useMessages } from '@/hooks/useMessages';

type RootStackParamList = {
  Voice: undefined;
  'chat/voice': undefined;
  'chat/new': undefined;
  'chat/history': undefined;
  tabs: {
    screen?: string;
  };
};

interface HeaderProps {
  onVoiceChat: () => void;
  onNewChat?: () => void;
  onChatHistory?: () => void;
}

export const Header = ({ onVoiceChat, onNewChat, onChatHistory }: HeaderProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { clearChat } = useMessages();

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

  const handleNewChat = () => {
    clearChat();
    if (onNewChat) {
      onNewChat();
    } else {
      try {
        navigation.navigate('chat/new');
      } catch (error) {
        console.error('Navigation to new chat failed:', error);
      }
    }
  };

  const handleChatHistory = () => {
    if (onChatHistory) {
      onChatHistory();
    } else {
      try {
        navigation.navigate('chat/history');
      } catch (error) {
        console.error('Navigation to chat history failed:', error);
      }
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
        <Feather name="chevron-left" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      <View style={styles.iconsContainer}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={handleNewChat}
        >
          <Feather name="message-circle" size={20} color="#000000" />
        </TouchableOpacity>
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#6a77e3',
  },
  backButton: {
    padding: 4,
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  iconButton: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});