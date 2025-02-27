import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);

  const SettingsItem = ({ icon, title, hasToggle, hasArrow, onPress, value, onValueChange }) => (
    <TouchableOpacity 
      style={styles.settingsItem}
      onPress={onPress}
      disabled={hasToggle}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.iconContainer}>
          <Feather name={icon} size={22} color="#4B69FF" />
        </View>
        <Text style={styles.settingsItemTitle}>{title}</Text>
      </View>
      {hasToggle && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#D1D1D6', true: '#4B69FF' }}
          thumbColor="#FFFFFF"
        />
      )}
      {hasArrow && (
        <Feather name="chevron-right" size={24} color="#CCCCCC" />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
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
          icon="bell"
          title="Notifications"
          hasToggle
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
        <SettingsItem
          icon="refresh-ccw"
          title="Clear Chat History"
          hasArrow
        />
      </View>

      {/* Help Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>HELP</Text>
        <SettingsItem
          icon="message-square"
          title="Share Product Feedback"
          hasArrow
        />
        <SettingsItem
          icon="help-circle"
          title="Support"
          hasArrow
        />
        <SettingsItem
          icon="lock"
          title="Manage Subscription"
          hasArrow
        />
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LEGAL</Text>
        <SettingsItem
          icon="file-text"
          title="Terms of Service"
          hasArrow
        />
        <SettingsItem
          icon="shield"
          title="Privacy Policy"
          hasArrow
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
    backgroundColor: '#6a77e3',
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#FFFFFF',
    marginLeft: 16,
    marginBottom: 8,
    letterSpacing: 1,
    fontWeight: '600',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6a77e3',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
    backgroundColor: '#EEF0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingsItemTitle: {
    fontSize: 17,
    color: '#FFFFFF',
  },
  deleteAccount: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#FF3B30',
    marginHorizontal: 16,
    borderRadius: 10,
    paddingHorizontal: 20,
  },
  deleteAccountText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;