import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';

const JournalScreen = () => {
  // Static journals array with timestamp data
  const journals = [
    {
      id: '1',
      timestamp: 1708473600000, // February 20, 2025 in milliseconds
      description: 'This is a test',
      type: 'entry',
    },
  ];

  // Format timestamp to display date
  const formatDisplayDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // Format timestamp to display short date
  const formatShortDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  };

  // Handle navigation to new journal entry
  const handleNewEntry = () => {
    router.push('/journal/new');
  };

  // Render each journal entry
  const renderJournalEntry = ({ item }: { item: typeof journals[0] }) => (
    <View style={styles.entryContainer}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{formatDisplayDate(item.timestamp)}</Text>
      </View>
      <Text style={styles.entryDescription}>{item.description}</Text>
      <Text style={styles.entryTimestamp}>{formatShortDate(item.timestamp)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with title and button */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Journal</Text>
        <TouchableOpacity style={styles.button} onPress={handleNewEntry}>
          <Text style={styles.buttonText}>New Entry</Text>
        </TouchableOpacity>
      </View>

      {/* Journal entries list */}
      <FlatList
        data={journals}
        renderItem={renderJournalEntry}
        keyExtractor={item => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
    marginBottom: 24,
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
  list: {
    flex: 1,
  },
  entryContainer: {
    backgroundColor: '#F8F9FE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  entryHeader: {
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  entryDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  entryTimestamp: {
    fontSize: 14,
    color: '#999',
    textAlign: 'right',
  },
});

export default JournalScreen;