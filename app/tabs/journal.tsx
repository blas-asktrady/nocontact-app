import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

const JournalScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header with title and button */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Journal</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>New Entry</Text>
        </TouchableOpacity>
      </View>

      {/* Centered content */}
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Feather name="edit-2" size={32} color="#4B69FF" />
        </View>
        
        <Text style={styles.heading}>Start Journaling</Text>
        
        <Text style={styles.description}>
          Overcome your cravings and track activities to help you associate sobriety with reward
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4B69FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50, // Adjust this value to move the content up or down
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#EEF0FF',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '90%',
  },
});

export default JournalScreen;