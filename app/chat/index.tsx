import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Image, FlatList, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Message, useMessages } from '@/hooks/useMessages';
import { Header } from './components/Header';
import { usePanda } from '@/hooks/usePanda'; 
import greetingsData from './greetings.json';

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
  const { messages: savedMessages, addNewMessage, clearChat } = useMessages(); 
  // Use the new chat hook for WebSocket communication
  const { sendMessage, isSendingMessage } = usePanda();
  
  // Local state for current conversation messages
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isReceivingMessage, setIsReceivingMessage] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  // Keep reference to active WebSocket cleanup functions
  const activeWebSocketCleanup = useRef<(() => void) | null>(null);
  
  // Track all message IDs to prevent duplicates
  const messageIdsRef = useRef<Set<string>>(new Set());

  // Simulate typing animation for the welcome message
  const simulateTyping = (fullMessage: string) => {
    setIsTyping(true);
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullMessage.length) {
        setTypingMessage(fullMessage.substring(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        
        // After typing is complete, add the message to the state
        const welcomeMessageId = `ai-welcome-${Date.now()}`;
        const welcomeMessage: Message = {
          id: welcomeMessageId,
          content: fullMessage,
          senderType: 'ai',
          senderId: characterId,
          receiverId: 'user123',
          createdAt: new Date().toISOString(),
        };
        
        addMessageToState(welcomeMessage);
      }
    }, 25); // Increased typing speed - 25ms delay instead of 50ms
  };

  // Initialize message state from local storage/context
  useEffect(() => {
    // Add initial welcome message if no messages exist
    if (messages.length === 0) {
      // Get a random greeting from the greetings.json file
      const greetings = greetingsData.greetings;
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      
      // Start typing animation with the random greeting
      simulateTyping(randomGreeting);
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
      
      // Clear messages when unmounting the component
      setMessages([]);
      messageIdsRef.current.clear();
      clearChat(); // Call the clearChat function from useMessages
    };
  }, [clearChat]);
  
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
  
  // Replace your existing filterSystemMessages function with this improved version
  const filterSystemMessages = (content: string): string => {
    // Check for any JSON-formatted system messages, including timeout
    const jsonPattern = /\{"type":\s*"[^"]+"\}/g;
    let filteredContent = content.replace(jsonPattern, '');
    
    // Process line breaks and normalize whitespace
    filteredContent = filteredContent.replace(/\\n/g, '\n');
    
    return filteredContent.trim();
  };

  // Add this new function to detect duplicated content in a message
  const removeDuplicatedContent = (text: string): string => {
    // Split by sentences to check for duplicates
    const sentences = text.split(/(?<=[.!?])\s+/);
    const uniqueSentences: string[] = [];
    
    for (const sentence of sentences) {
      // Skip very short sentences as they might be legitimate repetitions
      if (sentence.trim().length < 5) {
        uniqueSentences.push(sentence);
        continue;
      }
      
      // Check if this sentence is already included in what we've processed
      const isDuplicate = uniqueSentences.some(existing => 
        existing.includes(sentence) || sentence.includes(existing)
      );
      
      if (!isDuplicate) {
        uniqueSentences.push(sentence);
      }
    }
    
    return uniqueSentences.join(' ').trim();
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
        
        let completeResponseText = '';
        let currentCleanText = '';
        let displayedText = '';
        let isAnimating = false;
        
        const animateTyping = (textToAnimate: string) => {
          if (isAnimating || textToAnimate === displayedText) return;
          
          isAnimating = true;
          const newContent = textToAnimate.substring(displayedText.length);
          let charIndex = 0;
          
          const typingInterval = setInterval(() => {
            if (charIndex < newContent.length) {
              displayedText += newContent[charIndex];
              updateMessageInState(aiPlaceholderId, displayedText);
              scrollToBottom();
              charIndex++;
            } else {
              clearInterval(typingInterval);
              isAnimating = false;
            }
          }, 15); // Fast but still visible typing speed
        };
        
        // Read stream chunks and update AI message
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          completeResponseText += chunk;
          
          // Filter and deduplicate the complete text we've received so far
          const filteredText = filterSystemMessages(completeResponseText);
          const cleanText = removeDuplicatedContent(filteredText);
          
          // Only start a new animation if we have new clean content
          if (cleanText !== currentCleanText) {
            currentCleanText = cleanText;
            // Start typing animation for the new content
            animateTyping(cleanText);
          }
        }
        
        // Final cleanup and deduplication for the complete message
        const finalFilteredText = filterSystemMessages(completeResponseText);
        const finalText = removeDuplicatedContent(finalFilteredText);
        
        // Wait for any animation in progress to finish
        while (isAnimating) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // Update with the final deduplicated message
        updateMessageInState(aiPlaceholderId, finalText);
        
        // Save the complete AI response to history
        const finalAiMessage: Message = {
          id: aiPlaceholderId,
          content: finalText,
          senderType: 'ai',
          senderId: characterId,
          receiverId: 'user123',
          createdAt: new Date().toISOString(),
        };
        
        await addNewMessage(finalAiMessage, characterId, 'Chat with Sam', 'user123');
      } 
      // For environments not supporting ReadableStream, use callback approach
      else if (typeof response === 'function') {
        let completeResponseText = '';
        let currentCleanText = '';
        let displayedText = '';
        let isAnimating = false;
        
        const animateTyping = (textToAnimate: string) => {
          if (isAnimating || textToAnimate === displayedText) return;
          
          isAnimating = true;
          const newContent = textToAnimate.substring(displayedText.length);
          let charIndex = 0;
          
          const typingInterval = setInterval(() => {
            if (charIndex < newContent.length) {
              displayedText += newContent[charIndex];
              updateMessageInState(aiPlaceholderId, displayedText);
              scrollToBottom();
              charIndex++;
            } else {
              clearInterval(typingInterval);
              isAnimating = false;
            }
          }, 15); // Fast but still visible typing speed
        };
        
        // Use the callback to receive messages
        const cleanup = response((message: string) => {
          // Check if this is a system message
          if (message.includes('"type": "timeout"')) {
            // Don't append this to the message
            return;
          }
          
          completeResponseText += message;
          
          // Filter and deduplicate the complete text we've received so far
          const filteredText = filterSystemMessages(completeResponseText);
          const cleanText = removeDuplicatedContent(filteredText);
          
          // Only start a new animation if we have new clean content
          if (cleanText !== currentCleanText) {
            currentCleanText = cleanText;
            // Start typing animation for the new content
            animateTyping(cleanText);
          }
        });
        
        // Store the cleanup function
        activeWebSocketCleanup.current = cleanup;
      } else if (typeof response === 'string') {
        // Handle simple string response, filtering any system messages
        const filteredResponse = filterSystemMessages(response);
        
        // Animate the response instead of updating immediately
        let displayedText = '';
        let index = 0;
        
        const typingInterval = setInterval(() => {
          if (index < filteredResponse.length) {
            displayedText += filteredResponse[index];
            updateMessageInState(aiPlaceholderId, displayedText);
            scrollToBottom();
            index++;
          } else {
            clearInterval(typingInterval);
          }
        }, 15);
        
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
          <View style={styles.avatarContainer}>
            <Image 
              source={require('@/assets/images/face.png')} 
              style={styles.avatar}
              defaultSource={require('@/assets/images/face.png')}
              resizeMode="contain"
            />
          </View>
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
          ListHeaderComponent={isTyping ? (
            <View style={styles.messageRow}>
              <View style={styles.avatarContainer}>
                <Image 
                  source={require('@/assets/images/face.png')} 
                  style={styles.avatar}
                  defaultSource={require('@/assets/images/face.png')}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.messageBubble}>
                <Text style={styles.messageText}>{typingMessage}</Text>
              </View>
            </View>
          ) : null}
        />
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <ActionButton 
            icon="🆘" 
            label="NoContact Help" 
            color="#FFE5E5" 
            onPress={() => handleQuickAction("I need help with no contacting my ex right now.")}
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
    backgroundColor: '#FFFFFF',
  },
  chatContainer: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
    backgroundColor: '#FFFFFF',
  },
  chatContentContainer: {
    flexGrow: 1,
    paddingBottom: 0,
    marginBottom: 0,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  userMessageRow: {
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6a77e3',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  avatar: {
    width: 24,
    height: 24,
    backgroundColor: '#6a77e3',
  },
  messageBubble: {
    backgroundColor: '#ECEEF8',
    padding: 16,
    paddingTop: 10,
    paddingBottom: 10,
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
    backgroundColor: '#4B69FF',
    marginRight: 12,
    borderWidth: 0,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#666',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  bottomSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF8',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F0F2F5',
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
    backgroundColor: '#6a77e3',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(170, 175, 186, 0.5)',
  },
});

export default ChatScreen;