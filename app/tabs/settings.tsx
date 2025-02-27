import { Feather } from '@expo/vector-icons';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);

  const SettingsItem = ({ emoji, title, hasToggle, hasArrow, onPress, value, onValueChange }) => (
    <TouchableOpacity 
      style={styles.settingsItem}
      onPress={onPress}
      disabled={hasToggle}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.iconContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <Text style={styles.settingsItemTitle}>{title}</Text>
      </View>
      {hasToggle && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#D1D1D6', true: '#4B69FF' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#D1D1D6"
          thumbTintColor="#FFFFFF"
          style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
        />
      )}
      {hasArrow && (
        <Text style={styles.arrowEmoji}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Share Card */}
      <View style={styles.shareCard}>
        <View style={styles.shareContent}>
          <Text style={styles.shareTitle}>Share NoContact Panda with a friend</Text>
          <Text style={styles.shareDescription}>
            Know someone who could benefit from NoContact Panda? Tap to share the app.
          </Text>
        </View>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share App</Text>
          <Feather name="arrow-up-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <SettingsItem
          emoji="📅"
          title="Change No Contact Day"
          hasArrow
          onPress={() => {}}
        />
        <SettingsItem
          emoji="🔔"
          title="Notifications"
          hasToggle
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
        <SettingsItem
          emoji="🔄"
          title="Clear Chat History"
          hasArrow
          onPress={() => {}}
        />
      </View>

      {/* Help Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>HELP</Text>
        <SettingsItem
          emoji="💬"
          title="Share Product Feedback"
          hasArrow
          onPress={() => {}}
        />
        <SettingsItem
          emoji="❓"
          title="Support"
          hasArrow
          onPress={() => {}}
        />
        <SettingsItem
          emoji="🔒"
          title="Manage Subscription"
          hasArrow
          onPress={() => {}}
        />
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LEGAL</Text>
        <SettingsItem
          emoji="📄"
          title="Terms of Service"
          hasArrow
          onPress={() => {}}
        />
        <SettingsItem
          emoji="🛡️"
          title="Privacy Policy"
          hasArrow
          onPress={() => {}}
        />
      </View>

      {/* Delete Account */}
      <TouchableOpacity style={styles.deleteAccount}>
        <Text style={styles.deleteAccountText}>Delete Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  shareCard: {
    backgroundColor: '#4a57c3',
    margin: 16,
    borderRadius: 20,
    padding: 20,
  },
  shareContent: {
    marginBottom: 20,
  },
  shareTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  shareDescription: {
    color: '#FFFFFF',
    opacity: 0.8,
    fontSize: 16,
    lineHeight: 22,
  },
  shareButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#000000',
    marginLeft: 16,
    marginBottom: 8,
    letterSpacing: 1,
    fontWeight: '600',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF8',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECEEF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emoji: {
    fontSize: 20,
  },
  arrowEmoji: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  settingsItemTitle: {
    fontSize: 17,
    color: '#000000',
  },
  deleteAccount: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
    backgroundColor: '#FF3B30',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 20,
  },
  deleteAccountText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;