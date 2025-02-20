import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);

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
          <Text style={styles.shareTitle}>Share Sunflower with a friend</Text>
          <Text style={styles.shareDescription}>
            Know someone who could benefit from Sunflower? Tap to share the app.
          </Text>
        </View>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share App</Text>
          <Feather name="arrow-up-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Quit Dates Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>QUIT DATES</Text>
        <SettingsItem
          icon="clock"
          title="Edit Alcohol Quit Date"
          hasArrow
        />
        <SettingsItem
          icon="plus"
          title="Add Quit Date"
          hasArrow
        />
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
          icon="moon"
          title="Dark Mode"
          hasToggle
          value={darkModeEnabled}
          onValueChange={setDarkModeEnabled}
        />
        <SettingsItem
          icon="eye"
          title="Customize Sober Tracker"
          hasArrow
        />
        <SettingsItem
          icon="refresh-ccw"
          title="Clear Chat History"
          hasArrow
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  shareCard: {
    backgroundColor: '#4B69FF',
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
    color: '#666666',
    marginLeft: 16,
    marginBottom: 8,
    letterSpacing: 1,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
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
    color: '#000000',
  },
});

export default SettingsScreen;