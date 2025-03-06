import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView, 
  Image, 
  FlatList, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
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
  const { messages: savedMessages, addNewMessage, clearChat } = useMessages(); 
  const { sendMessage, isSendingMessage } = usePanda();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isReceivingMessage, setIsReceivingMessage] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  
  const activeWebSocketCleanup = useRef<(() => void) | null>(null);
  const messageIdsRef = useRef<Set<string>>(new Set());

  // Add keyboard listeners
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Scroll to bottom when keyboard appears
        setTimeout(() => scrollToBottom(), 100);
      }
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    // Cleanup listeners
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

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
    }, 25);
  };

  useEffect(() => {
    if (messages.length === 0) {
      const greetings = greetingsData.greetings;
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      
      simulateTyping(randomGreeting);
    }
    
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
    
    return () => {
      if (activeWebSocketCleanup.current) {
        activeWebSocketCleanup.current();
      }
      
      setMessages([]);
      messageIdsRef.current.clear();
      clearChat();
    };
  }, [clearChat]);
  
  const addMessageToState = (message: Message) => {
    if (!messageIdsRef.current.has(message.id || '')) {
      messageIdsRef.current.add(message.id || '');
      setMessages(prevMessages => [...prevMessages, message]);
      return true;
    }
    return false;
  };
  
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
  
  const filterSystemMessages = (content: string): string => {
    const jsonPattern = /\{"type":\s*"[^"]+"\}/g;
    let filteredContent = content.replace(jsonPattern, '');
    
    filteredContent = filteredContent.replace(/\\n/g, '\n');
    
    return filteredContent.trim();
  };

  const removeDuplicatedContent = (text: string): string => {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const uniqueSentences: string[] = [];
    
    for (const sentence of sentences) {
      if (sentence.trim().length < 5) {
        uniqueSentences.push(sentence);
        continue;
      }
      
      const isDuplicate = uniqueSentences.some(existing => 
        existing.includes(sentence) || sentence.includes(existing)
      );
      
      if (!isDuplicate) {
        uniqueSentences.push(sentence);
      }
    }
    
    return uniqueSentences.join(' ').trim();
  };

  // Handle submit from keyboard
  const handleSubmitEditing = () => {
    if (inputText.trim()) {
      const textToSend = inputText;
      setInputText(''); // Clear input immediately
      setTimeout(() => {
        handleSendMessage(textToSend);
      }, 0);
    }
  };

  const handleSendMessage = async (messageToSend?: string) => {
    const textToSend = messageToSend || inputText;
    if (!textToSend.trim() || isSendingMessage) return;

    // Clear input immediately at the beginning of the function
    setInputText('');

    const userMessageId = `user-msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const userMessage: Message = {
      id: userMessageId,
      content: textToSend,
      senderType: 'user',
      senderId: 'user123',
      receiverId: characterId,
      createdAt: new Date().toISOString(),
    };

    addMessageToState(userMessage);
    await addNewMessage(userMessage, 'user123', 'Chat with Sam', characterId);
    
    scrollToBottom();
    
    try {
      if (activeWebSocketCleanup.current) {
        activeWebSocketCleanup.current();
        activeWebSocketCleanup.current = null;
      }
      
      const aiPlaceholderId = `ai-response-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const aiPlaceholder: Message = {
        id: aiPlaceholderId,
        content: '',
        senderType: 'ai',
        senderId: characterId,
        receiverId: 'user123',
        createdAt: new Date().toISOString(),
      };
      
      addMessageToState(aiPlaceholder);
      setIsReceivingMessage(true);
      
      const response = await sendMessage(textToSend, characterId);
      
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
          }, 15);
        };
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          completeResponseText += chunk;
          
          const filteredText = filterSystemMessages(completeResponseText);
          const cleanText = removeDuplicatedContent(filteredText);
          
          if (cleanText !== currentCleanText) {
            currentCleanText = cleanText;
            animateTyping(cleanText);
          }
        }
        
        const finalFilteredText = filterSystemMessages(completeResponseText);
        const finalText = removeDuplicatedContent(finalFilteredText);
        
        while (isAnimating) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        updateMessageInState(aiPlaceholderId, finalText);
        
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
          }, 15);
        };
        
        const cleanup = response((message: string) => {
          if (message.includes('"type": "timeout"')) {
            return;
          }
          
          completeResponseText += message;
          
          const filteredText = filterSystemMessages(completeResponseText);
          const cleanText = removeDuplicatedContent(filteredText);
          
          if (cleanText !== currentCleanText) {
            currentCleanText = cleanText;
            animateTyping(cleanText);
          }
        });
        
        activeWebSocketCleanup.current = cleanup;
      } else if (typeof response === 'string') {
        const filteredResponse = filterSystemMessages(response);
        
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
      setIsReceivingMessage(false);
      scrollToBottom();
    }
  };

  const handleQuickAction = (actionText: string) => {
    handleSendMessage(actionText);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.innerContainer}>
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
              {/* Quick Actions - hide when keyboard is visible */}
              {!keyboardVisible && (
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
              )}

              {/* Input Bar */}
              <View style={styles.inputContainer}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="Type a message..."
                  placeholderTextColor="#999999"
                  value={inputText}
                  onChangeText={setInputText}
                  returnKeyType="send"
                  onSubmitEditing={handleSubmitEditing}
                  editable={!isSendingMessage}
                  blurOnSubmit={false}
                />
                <TouchableOpacity 
                  style={[
                    styles.sendButton,
                    (!inputText.trim() || isSendingMessage) && styles.disabledButton
                  ]}
                  onPress={() => handleSendMessage()}
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
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF8',
    backgroundColor: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    paddingVertical: 10,
    marginRight: 12,
    fontSize: 16,
    color: '#000000',
    maxHeight: 100,
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