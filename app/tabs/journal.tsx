import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { router } from 'expo-router';
import { useJournal } from '@/hooks/useJournal';
import { getUserById } from '@/services/userService';

const JournalScreen = () => {
  const { journals, isLoading } = useJournal();
  const [refreshKey, setRefreshKey] = useState(0);

  // Add a useEffect to monitor journals changes
  React.useEffect(() => {
    console.log('Journals updated:', journals);
  }, [journals]);

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

  // Handle entry press
  const handleEntryPress = (entry: typeof journals[0]) => {
    router.push({
      pathname: '/journal/new',
      params: {
        id: entry.id,
        timestamp: entry.timestamp,
        description: entry.description,
        type: entry.type,
        content: entry.content
      }
    });
  };

  // Render each journal entry
  const renderJournalEntry = React.useCallback(({ item }: { item: typeof journals[0] }) => {
    // Create a preview of the content (first 150 characters)
    const contentPreview = item.content && item.content.length > 150 
      ? `${item.content.substring(0, 40)}...` 
      : item.content;
      
    return (
      <TouchableOpacity 
        style={styles.entryContainer}
        onPress={() => handleEntryPress(item)}
      >
        <View style={styles.entryHeader}>
          <Text style={styles.entryDate}>{formatDisplayDate(item.timestamp)}</Text>
        </View>
        <Text style={styles.entryDescription} numberOfLines={3} ellipsizeMode="tail">
          {contentPreview}
        </Text>
        <Text style={styles.entryTimestamp}>{formatShortDate(item.timestamp)}</Text>
      </TouchableOpacity>
    );
  }, []);

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
        extraData={journals}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6a77e3',
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
    color: '#fff',
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