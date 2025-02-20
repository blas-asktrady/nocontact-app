import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

const ChatScreen = () => {
  const ActionButton = ({ icon, label, color }) => (
    <TouchableOpacity style={styles.actionButton}>
      <View style={[styles.actionIcon, { backgroundColor: color }]}>
        <Text style={styles.actionEmoji}>{icon}</Text>
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Feather name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.voiceChatButton}>
          <Feather name="phone" size={20} color="#FFF" style={styles.phoneIcon} />
          <Text style={styles.voiceChatText}>Start Voice Chat</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Container */}
      <View style={styles.chatContainer}>
        {/* Message */}
        <View style={styles.messageRow}>
          <Image 
            source={require('@/assets/images/react-logo.png')} 
            style={styles.avatar}
            defaultSource={require('@/assets/images/react-logo.png')}
          />
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>
              Hello, I'm Sam! I'm going to be your AI sponsor. I'm here to help keep you sober. 
              You can talk to me when you're struggling with cravings or want someone to talk to! 
              Just curious, what brought you to this app?
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <ActionButton icon="🆘" label="Help with cravings" color="#FFE5E5" />
          <ActionButton icon="😤" label="Need to vent" color="#FFF4E5" />
          <ActionButton icon="🎉" label="Celebrate" color="#E5F6FF" />
        </View>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#A3A3A3"
          />
          <TouchableOpacity style={styles.micButton}>
            <Feather name="mic" size={24} color="#4B69FF" />
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
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
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
  messageText: {
    fontSize: 16,
    lineHeight: 22,
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