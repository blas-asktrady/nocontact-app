import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Image, FlatList, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Message, useMessages } from '@/hooks/useMessages';
import { Header } from './components/Header';
import { usePanda } from '@/hooks/usePanda'; 

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

const ChatScreen = ({ characterId = '1' }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  // Keep useMessages for message storage/history if needed
  const { messages: savedMessages, addNewMessage } = useMessages(); 
  // Use the new chat hook for WebSocket communication
  const { sendMessage, isSendingMessage } = usePanda();
  
  // Local state for current conversation messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isReceivingMessage, setIsReceivingMessage] = useState(false);
  const flatListRef = React.useRef<FlatList>(null);

  // Load saved messages on component mount
  useEffect(() => {
    if (savedMessages && savedMessages.length > 0) {
      setMessages(savedMessages);
    }
  }, [savedMessages]);

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
    if (!inputText.trim() || isSendingMessage) return;

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(), // Ensure we have an ID for the message
      content: inputText,
      senderType: 'user',
      senderId: 'user123',
      receiverId: characterId,
      createdAt: new Date().toISOString(),
    };

    // Add user message to display
    setMessages(prev => [...prev, userMessage]);
    
    // Save to message history
    await addNewMessage(userMessage, 'user123', 'Chat with Sam', characterId);
    
    // Clear input
    setInputText('');
    scrollToBottom();
    
    try {
      // Create a placeholder for the AI response
      const aiPlaceholderId = `ai-response-${Date.now()}`;
      const aiPlaceholder: Message = {
        id: aiPlaceholderId,
        content: '',
        senderType: 'ai',
        senderId: characterId,
        receiverId: 'user123',
        createdAt: new Date().toISOString(),
      };
      
      // Add empty AI message to show waiting
      setMessages(prev => [...prev, aiPlaceholder]);
      setIsReceivingMessage(true);
      
      // Send message via WebSocket
      const response = await sendMessage(inputText, characterId);
      
      // Handle streaming response
      if (response instanceof ReadableStream) {
        const reader = response.getReader();
        const decoder = new TextDecoder();
        
        let responseText = '';
        
        // Read stream chunks and update AI message
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          responseText += chunk;
          
          // Update the AI message with new content
          setMessages(prev => 
            prev.map(msg => msg.id === aiPlaceholderId ? { ...msg, content: responseText } : msg)
          );
          scrollToBottom();
        }
        
        // Save the complete AI response to history
        const finalAiMessage: Message = {
          id: aiPlaceholderId,
          content: responseText,
          senderType: 'ai',
          senderId: characterId,
          receiverId: 'user123',
          createdAt: new Date().toISOString(),
        };
        
        await addNewMessage(finalAiMessage, characterId, 'Chat with Sam', 'user123');
      } 
      // For environments not supporting ReadableStream, use callback approach
      else if (typeof response === 'function') {
        let responseText = '';
        
        // Use the callback to receive messages
        const cleanup = response((message: string) => {
          responseText += message;
          
          // Update the AI message with new content
          setMessages(prev => 
            prev.map(msg => msg.id === aiPlaceholderId ? { ...msg, content: responseText } : msg)
          );
          scrollToBottom();
        });
        
        // Return cleanup function for component unmount
        return () => {
          if (typeof cleanup === 'function') {
            cleanup();
          }
        };
      } else if (typeof response === 'string') {
        // Handle simple string response
        setMessages(prev => 
          prev.map(msg => msg.id === aiPlaceholderId ? { ...msg, content: response } : msg)
        );
        
        // Save the AI response to history
        const finalAiMessage: Message = {
          id: aiPlaceholderId,
          content: response,
          senderType: 'ai',
          senderId: characterId,
          receiverId: 'user123',
          createdAt: new Date().toISOString(),
        };
        
        await addNewMessage(finalAiMessage, characterId, 'Chat with Sam', 'user123');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        senderType: 'ai',
        senderId: characterId,
        receiverId: 'user123',
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsReceivingMessage(false);
      scrollToBottom();
    }
  };

  const handleQuickAction = (actionText: string) => {
    setInputText(actionText);
    handleSendMessage();
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
      <Header onVoiceChat={handleVoiceChat} />
      
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
            editable={!isSendingMessage && !isReceivingMessage}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!inputText.trim() || isSendingMessage || isReceivingMessage) && styles.disabledButton
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isSendingMessage || isReceivingMessage}
          >
            {isSendingMessage ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather 
                name="send" 
                size={24} 
                color={inputText.trim() && !isReceivingMessage ? "#FFFFFF" : "#A3A3A3"} 
              />
            )}
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
    color: '#000000', // Default color for AI messages
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
  sendButton: {
    width: 48,
    height: 48,
    backgroundColor: '#4B69FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#EEF0FF',
  },
});

export default ChatScreen;