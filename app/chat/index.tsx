import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Image, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useMessages, Message } from '@/hooks/useMessages';

type RootStackParamList = {
  Voice: undefined;
  'chat/voice': undefined;
  tabs: {
    screen?: string;
  };
};

interface ActionButtonProps {
  icon: string;
  label: string;
  color: string;
  onPress?: () => void;
}

const ChatScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { messages, addNewMessage } = useMessages();
  const [inputText, setInputText] = useState('');
  const flatListRef = React.useRef<FlatList>(null);

  const scrollToBottom = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

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

  const ActionButton = ({ icon, label, color, onPress }: ActionButtonProps) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        <Text style={styles.actionEmoji}>{icon}</Text>
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const handleVoiceChat = () => {
    navigation.navigate('chat/voice');
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      content: inputText,
      senderType: 'user',
      senderId: 'user123',
      receiverId: 'ai123',
      createdAt: new Date().toISOString(),
    };

    await addNewMessage(newMessage, 'user123', 'Chat with Sam', 'default-llm');
    setInputText('');
    scrollToBottom();
  };

  const handleQuickAction = (actionText: string) => {
    setInputText(actionText);
    
    const newMessage: Message = {
      content: actionText,
      senderType: 'user',
      senderId: 'user123',
      receiverId: 'ai123',
      createdAt: new Date().toISOString(),
    };

    addNewMessage(newMessage, 'user123', 'Chat with Sam', 'default-llm');
    setInputText('');
    scrollToBottom();
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUserMessage = item.senderType === 'user';
    
    return (
      <View style={[
        styles.messageRow,
        isUserMessage && styles.userMessageRow
      ]}>
        {!isUserMessage && (
          <Image 
            source={require('@/assets/images/react-logo.png')} 
            style={styles.avatar}
            defaultSource={require('@/assets/images/react-logo.png')}
          />
        )}
        <View style={[
          styles.messageBubble,
          isUserMessage && styles.userMessageBubble
        ]}>
          <Text style={styles.messageText}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateBack}>
          <Feather name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.voiceChatButton}
          onPress={handleVoiceChat}
        >
          <Feather name="phone" size={20} color="#FFF" style={styles.phoneIcon} />
          <Text style={styles.voiceChatText}>Start Voice Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Container */}
      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id || item.createdAt}
          contentContainerStyle={styles.chatContentContainer}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          showsVerticalScrollIndicator={false}
          indicatorStyle="black"
          automaticallyAdjustKeyboardInsets={true}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 10,
          }}
        />
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <ActionButton 
            icon="🆘" 
            label="Help with cravings" 
            color="#FFE5E5" 
            onPress={() => handleQuickAction("I need help with cravings right now.")}
          />
          <ActionButton 
            icon="😤" 
            label="Need to vent" 
            color="#FFF4E5" 
            onPress={() => handleQuickAction("I need to vent about something.")}
          />
          <ActionButton 
            icon="🎉" 
            label="Celebrate" 
            color="#E5F6FF" 
            onPress={() => handleQuickAction("I want to celebrate a milestone!")}
          />
        </View>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#A3A3A3"
            value={inputText}
            onChangeText={setInputText}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity 
            style={styles.micButton}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Feather name="send" size={24} color={inputText.trim() ? "#4B69FF" : "#A3A3A3"} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  voiceChatButton: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  phoneIcon: {
    marginRight: 8,
  },
  voiceChatText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  chatContentContainer: {
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  userMessageRow: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  messageBubble: {
    backgroundColor: '#F0F0F0',
    padding: 16,
    borderRadius: 20,
    maxWidth: '80%',
  },
  userMessageBubble: {
    backgroundColor: '#4B69FF',
    marginRight: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  bottomSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionEmoji: {
    fontSize: 20,
  },
  actionLabel: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
  },
  micButton: {
    width: 48,
    height: 48,
    backgroundColor: '#EEF0FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;