import React, { useState, useEffect, useRef } from 'react';
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
  const flatListRef = useRef<FlatList>(null);
  
  // Keep reference to active WebSocket cleanup functions
  const activeWebSocketCleanup = useRef<(() => void) | null>(null);
  
  // Track all message IDs to prevent duplicates
  const messageIdsRef = useRef<Set<string>>(new Set());

  // Initialize message state from local storage/context
  useEffect(() => {
    // Add initial welcome message if no messages exist
    if (messages.length === 0) {
      const welcomeMessageId = `ai-welcome-${Date.now()}`;
      const welcomeMessage: Message = {
        id: welcomeMessageId,
        content: "Hi there! 👋 How are you feeling today?",
        senderType: 'ai',
        senderId: characterId,
        receiverId: 'user123',
        createdAt: new Date().toISOString(),
      };
      
      // Add welcome message to state
      addMessageToState(welcomeMessage);
    }
    
    // Initially load saved messages only if our local state is empty (except for welcome message)
    if (savedMessages && savedMessages.length > 0 && messages.length <= 1) {
      const uniqueMessages = savedMessages.filter(msg => {
        if (!messageIdsRef.current.has(msg.id || '')) {
          messageIdsRef.current.add(msg.id || '');
          return true;
        }
        return false;
      });
      
      setMessages(prevMessages => [...prevMessages, ...uniqueMessages]);
    }
    
    // Cleanup function for component unmount
    return () => {
      if (activeWebSocketCleanup.current) {
        activeWebSocketCleanup.current();
      }
    };
  }, []);
  
  // Add a new message to the local state and update the message ID set
  const addMessageToState = (message: Message) => {
    // Only add the message if it's not a duplicate
    if (!messageIdsRef.current.has(message.id || '')) {
      messageIdsRef.current.add(message.id || '');
      setMessages(prevMessages => [...prevMessages, message]);
      return true;
    }
    return false;
  };
  
  // Update a message in the local state by ID
  const updateMessageInState = (messageId: string, updatedContent: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId ? { ...msg, content: updatedContent } : msg
      )
    );
  };

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
  
  // Helper function to filter out timeout messages or other system messages
  const filterSystemMessages = (content: string): string => {
    // Check for timeout message JSON
    if (content.endsWith('{"type": "timeout"}')) {
      return content.replace('{"type": "timeout"}', '').trim();
    }
    
    // Add more filters for other system messages if needed
    
    return content;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSendingMessage) return;

    // Create user message with guaranteed unique ID
    const userMessageId = `user-msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const userMessage: Message = {
      id: userMessageId,
      content: inputText,
      senderType: 'user',
      senderId: 'user123',
      receiverId: characterId,
      createdAt: new Date().toISOString(),
    };

    // Add user message to display
    addMessageToState(userMessage);
    
    // Save to message history
    await addNewMessage(userMessage, 'user123', 'Chat with Sam', characterId);
    
    // Store the message text and clear input immediately
    const messageToBeSent = inputText;
    setInputText('');
    
    // Allow the user to keep typing for the next message
    // while the current one is being sent
    scrollToBottom();
    
    try {
      // Ensure any previous WebSocket connection is closed
      if (activeWebSocketCleanup.current) {
        activeWebSocketCleanup.current();
        activeWebSocketCleanup.current = null;
      }
      
      // Create a placeholder for the AI response with guaranteed unique ID
      const aiPlaceholderId = `ai-response-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const aiPlaceholder: Message = {
        id: aiPlaceholderId,
        content: '',
        senderType: 'ai',
        senderId: characterId,
        receiverId: 'user123',
        createdAt: new Date().toISOString(),
      };
      
      // Add empty AI message to show waiting
      addMessageToState(aiPlaceholder);
      setIsReceivingMessage(true);
      
      // Send message via WebSocket
      const response = await sendMessage(messageToBeSent, characterId);
      
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
          
          // Clean the response text of any system messages
          const filteredText = filterSystemMessages(responseText);
          
          // Update the AI message with new content
          updateMessageInState(aiPlaceholderId, filteredText);
          scrollToBottom();
        }
        
        // Save the complete AI response to history, with system messages filtered out
        const finalResponseText = filterSystemMessages(responseText);
        const finalAiMessage: Message = {
          id: aiPlaceholderId,
          content: finalResponseText,
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
          // Check if this is a system message
          if (message.includes('"type": "timeout"')) {
            // Don't append this to the message
            return;
          }
          
          responseText += message;
          
          // Update the AI message with new content
          updateMessageInState(aiPlaceholderId, responseText);
          scrollToBottom();
        });
        
        // Store the cleanup function
        activeWebSocketCleanup.current = cleanup;
      } else if (typeof response === 'string') {
        // Handle simple string response, filtering any system messages
        const filteredResponse = filterSystemMessages(response);
        
        updateMessageInState(aiPlaceholderId, filteredResponse);
        
        // Save the AI response to history
        const finalAiMessage: Message = {
          id: aiPlaceholderId,
          content: filteredResponse,
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
        id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        senderType: 'ai',
        senderId: characterId,
        receiverId: 'user123',
        createdAt: new Date().toISOString(),
      };
      
      addMessageToState(errorMessage);
    } finally {
      // Always reset the receiving state, regardless of outcome
      setIsReceivingMessage(false);
      scrollToBottom();
    }
  };

  const handleQuickAction = (actionText: string) => {
    setInputText(actionText);
    // Use setTimeout to give time for the state to update
    setTimeout(() => {
      handleSendMessage();
    }, 0);
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
            source={require('@/assets/images/face.png')} 
            style={styles.avatar}
            defaultSource={require('@/assets/images/face.png')}
          />
        )}
        <View style={[
          styles.messageBubble,
          isUserMessage && styles.userMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isUserMessage && styles.userMessageText
          ]}>
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
          keyExtractor={(item) => item.id || `${item.createdAt}-${Math.random()}`}
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
            placeholderTextColor="#999999"
            value={inputText}
            onChangeText={setInputText}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
            // Only disable input when sending the message, not when receiving
            editable={!isSendingMessage}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!inputText.trim() || isSendingMessage) && styles.disabledButton
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isSendingMessage}
          >
            {isSendingMessage ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather 
                name="send" 
                size={24} 
                color={inputText.trim() ? "#fff" : "#A3A3A3"}
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
    backgroundColor: '#FFFFFF', // Changed from purple to white to match journal
  },
  chatContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF', // Changed to white to match journal
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
    backgroundColor: '#ECEEF8', // Changed to light blue/gray from journal
    padding: 16,
    borderRadius: 20,
    maxWidth: '80%',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessageBubble: {
    backgroundColor: '#4B69FF', // Changed to match journal button color
    marginRight: 12,
    borderWidth: 0,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#666', // Changed to match journal text color
  },
  userMessageText: {
    color: '#FFFFFF', // White text for user messages
  },
  bottomSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF8', // Changed to light blue/gray from journal
    backgroundColor: '#FFFFFF', // Changed to white to match journal
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
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Lighter gray as shown in screenshot
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    color: '#000000',
  },
  sendButton: {
    width: 48,
    height: 48,
    backgroundColor: '#6a77e3', // Light gray for send button background
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(170, 175, 186, 0.5)', // Semi-transparent white for disabled state
  },
});

export default ChatScreen;