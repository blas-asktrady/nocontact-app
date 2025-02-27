import { Feather } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Platform, Linking } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import useUserSettings from '@/hooks/useUserSettings';
import { useUser } from '@/hooks/useUser';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const { user } = useUser(); // Get current user
  const { 
    userSettings, 
    isLoading, 
    updateNoContactDate, 
    updateNotificationPreferences,
    refetchSettings
  } = useUserSettings(user?.id || '');

  // Initialize notification state from user settings
  useEffect(() => {
    if (userSettings?.notification_preferences) {
      setNotificationsEnabled(!!userSettings.notification_preferences.enabled);
    }
  }, [userSettings]);

  // Handle notification toggle
  const handleNotificationToggle = async (value) => {
    setNotificationsEnabled(value);
    await updateNotificationPreferences({ enabled: value });
    
    // If enabling notifications, check if we need to redirect to settings
    if (value) {
      // For iOS, we need to redirect to app notification settings specifically for this app
      if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:notification&path=NoContactPanda');
      } else if (Platform.OS === 'android') {
        // For Android, open this specific app's notification settings
        Linking.openSettings();
        // Note: On newer Android versions, you can use this more specific approach:
        // IntentLauncher.startActivityAsync(
        //   IntentLauncher.ActivityAction.APP_NOTIFICATION_SETTINGS,
        //   { data: 'package:' + ApplicationId }
        // );
        // This would require importing IntentLauncher from expo-intent-launcher
      }
    }
  };

  // Handle date selection
  const handleDateChange = async (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate && event.type !== 'dismissed') {
      await updateNoContactDate(selectedDate);
      await refetchSettings(); // Refetch settings after update
    }
  };

  // Generate a random date within the last 3 years
  const generateRandomDate = () => {
    const today = new Date();
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(today.getFullYear() - 3);
    
    // Get random timestamp between threeYearsAgo and today
    const randomTimestamp = threeYearsAgo.getTime() + 
      Math.random() * (today.getTime() - threeYearsAgo.getTime());
    
    return new Date(randomTimestamp);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Open external URL
  const openExternalURL = (url) => {
    Linking.openURL(url);
  };

  // Share app functionality
  const shareApp = () => {
    openExternalURL('https://nocontact.ai');
  };

  // Open email support
  const openEmailSupport = () => {
    Linking.openURL('mailto:hello@avocadolabs.dev');
  };

  // Open subscription settings
  const openSubscriptionSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:root=STORE&path=SUBSCRIPTIONS');
    } else if (Platform.OS === 'android') {
      // For Android, we typically open Google Play subscription management
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    }
  };

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
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={shareApp}
        >
          <Text style={styles.shareButtonText}>Share App</Text>
          <Feather name="arrow-up-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <SettingsItem
          emoji="📅"
          title="Change Initial NoContact Day"
          hasArrow
          onPress={() => {
            if (Platform.OS === 'ios') {
              setShowDatePicker(true);
            } else {
              // For non-iOS devices, generate a random date and update
              const randomDate = generateRandomDate();
              updateNoContactDate(randomDate)
                .then(() => refetchSettings()); // Refetch settings after update
            }
          }}
        />
        {showDatePicker && (
          <DateTimePicker
            value={userSettings?.no_contact_date ? new Date(userSettings.no_contact_date) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}
        <SettingsItem
          emoji="🔔"
          title="Notifications"
          hasToggle
          value={notificationsEnabled}
          onValueChange={handleNotificationToggle}
        />
      </View>

      {/* Help Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>HELP</Text>
        <SettingsItem
          emoji="❓"
          title="Support"
          hasArrow
          onPress={openEmailSupport}
        />
        <SettingsItem
          emoji="🔒"
          title="Manage Subscription"
          hasArrow
          onPress={openSubscriptionSettings}
        />
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LEGAL</Text>
        <SettingsItem
          emoji="📄"
          title="Terms of Service"
          hasArrow
          onPress={() => openExternalURL('https://nocontact.ai/terms-of-service')}
        />
        <SettingsItem
          emoji="🛡️"
          title="Privacy Policy"
          hasArrow
          onPress={() => openExternalURL('https://nocontact.ai/privacy-policy')}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 20,
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
  section: {
    marginTop: 24,
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