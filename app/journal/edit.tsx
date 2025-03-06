import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Keyboard, SafeAreaView, Platform, StatusBar } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { NavigationProp, useNavigation, RouteProp, useRoute } from '@react-navigation/native';

type RootStackParamList = {
  'journal/edit': {
    content?: string;
    id?: string;
    timestamp?: string;
    description?: string;
    type?: string;
  };
  'tabs': {
    screen?: string;
  };
};

type NavigationProps = NavigationProp<RootStackParamList, 'journal/edit'>;
type RouteProps = RouteProp<RootStackParamList, 'journal/edit'>;

export default function EditJournalScreen() {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();
  const [journalEntry, setJournalEntry] = useState(route.params?.content || '');

  // Update journalEntry when route.params changes
  useEffect(() => {
    setJournalEntry(route.params?.content || '');
  }, [route.params]);

  // Add useEffect to reset state when component unmounts
  useEffect(() => {
    return () => {
      // This cleanup function runs when the component unmounts
      setJournalEntry('');
    };
  }, []);

  const handleDone = () => {
    // Save the changes and navigate back
    try {
      // Pass the updated content back to the previous screen
      if (route.params?.id) {
        // If we have an ID, this is an existing entry
        navigation.navigate('journal/new', {
          id: route.params.id,
          content: journalEntry,
          timestamp: route.params.timestamp,
          description: route.params.description,
          type: route.params.type
        });
      } else {
        // For a new entry
        navigation.navigate('journal/new', {
          content: journalEntry
        });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      try {
        navigation.navigate('tabs', { screen: 'journal' });
      } catch (fallbackError) {
        console.error('Fallback navigation failed:', fallbackError);
      }
    }
  };

  const handleCancel = () => {
    // Simplify navigation - always navigate back to journal/new
    try {
      if (route.params?.id) {
        // If we have an ID, pass all the existing parameters back
        navigation.navigate('journal/new', {
          id: route.params.id,
          content: route.params.content || '',
          timestamp: route.params.timestamp || '',
          description: route.params.description || '',
          type: route.params.type || ''
        });
      } else {
        // For a new entry, just navigate back to journal/new
        navigation.navigate('journal/new');
      }
    } catch (error) {
      console.error('Cancel navigation error:', error);
      // Fallback navigation
      navigation.navigate('tabs', { screen: 'journal' });
    }
  };

  // Add keyboard handling
  useEffect(() => {
    // Ensure keyboard appears when component mounts
    const keyboardShowTimeout = setTimeout(() => {
      if (Platform.OS === 'ios') {
        Keyboard.dismiss();
        setTimeout(() => Keyboard.isVisible() || Keyboard.show(), 100);
      }
    }, 300);
    
    return () => {
      clearTimeout(keyboardShowTimeout);
      Keyboard.dismiss();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleCancel}
            activeOpacity={0.7}
            style={styles.cancelButton}
            hitSlop={{top: 15, bottom: 15, left: 15, right: 15}} // Increase touch area
          >
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.title}>Edit Entry</ThemedText>
          <TouchableOpacity onPress={handleDone}>
            <ThemedText style={styles.doneText}>Done</ThemedText>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          multiline
          autoFocus
          textAlignVertical="top"
          value={journalEntry}
          onChangeText={setJournalEntry}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  cancelText: {
    fontSize: 17,
    color: '#007AFF',
  },
  doneText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#000000',
    padding: 12,
  },
  cancelButton: {
    padding: 5, // Increase touch area
  },
});