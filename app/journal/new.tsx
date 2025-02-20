import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import { Pencil, Trash2 } from 'lucide-react';
import { useJournal } from '@/hooks/useJournal';

type RootStackParamList = {
  'journal/new': undefined;
  'journal/edit': {
    content?: string;
    id?: string;
    timestamp?: number;
    description?: string;
    type?: string;
  };
  'tabs': {
    screen?: string;
  };
};

type NavigationProps = NavigationProp<RootStackParamList, 'journal/new'>;

type RouteParams = {
  id?: string;
  timestamp?: number;
  description?: string;
  type?: string;
  content?: string;
};

export default function NewJournalScreen() {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute();
  const params = route.params as RouteParams;
  const { addEntry, updateEntry, deleteEntry } = useJournal();

  const [journalEntry, setJournalEntry] = useState('');
  const [entryId, setEntryId] = useState<string | undefined>();
  const [timestamp, setTimestamp] = useState<number | undefined>();
  const [description, setDescription] = useState<string | undefined>();
  const [type, setType] = useState<string | undefined>();

  useEffect(() => {
    if (params) {
      setEntryId(params.id);
      setTimestamp(params.timestamp);
      setDescription(params.description);
      setType(params.type);
      if (params.content) {
        setJournalEntry(params.content);
      }
    }
  }, [params]);

  const navigateBack = () => {
    try {
      const canGoBack = navigation.canGoBack();
      if (canGoBack) {
        navigation.goBack();
      } else {
        navigation.navigate('tabs', { screen: 'journal' });
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

  const handleSave = () => {
    console.log('new journal save clicked');
    if (journalEntry.trim() === '') {
      Alert.alert('Error', 'Please enter some content for your journal entry');
      return;
    }

    if (entryId) {
      console.log('update entry');
      // Update existing entry
      updateEntry({
        id: entryId,
        timestamp: timestamp || Date.now(),
        description: description || journalEntry.slice(0, 100), // First 100 chars as description
        type: type || 'entry',
        content: journalEntry
      });
    } else {
      console.log('add entry');
      // Add new entry
      addEntry({
        description: journalEntry.slice(0, 100), // First 100 chars as description
        type: 'entry',
        content: journalEntry
      });
    }
    navigateBack();
  };

  const handleCancel = () => {
    navigateBack();
  };

  const handleEdit = () => {
    navigation.navigate('journal/edit', {
      content: journalEntry,
      id: entryId,
      timestamp: timestamp,
      description: description,
      type: type
    });
  };

  const handleDelete = () => {
    if (!entryId) return;

    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteEntry(entryId);
            navigateBack();
          }
        }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>
            {entryId ? 'Edit Journal Entry' : 'New Journal Entry'}
          </ThemedText>
        </View>
        
        {entryId && (
          <View style={styles.iconContainer}>
            <TouchableOpacity 
              onPress={handleEdit}
              style={styles.iconButton}
            >
              <Pencil size={24} color="#6366F1" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDelete}
              style={styles.iconButton}
            >
              <Trash2 size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ThemedText style={styles.subtitle}>
        Write freely about your recovery journey, thoughts, and feelings.
      </ThemedText>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Write about your recovery journey, thoughts, and feelings..."
            placeholderTextColor="#8E8E93"
            multiline
            textAlignVertical="top"
            value={journalEntry}
            onChangeText={setJournalEntry}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={handleCancel}
        >
          <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.saveButton]} 
          onPress={handleSave}
        >
          <ThemedText style={styles.saveButtonText}>Save</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

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
    paddingTop: 16,
  },
  titleContainer: {
    flex: 1,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 4,
  },
  title: {
    fontSize: 34,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000000',
  },
  subtitle: {
    fontSize: 17,
    color: '#8E8E93',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#000000',
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  saveButton: {
    backgroundColor: '#6366F1',
  },
  cancelButtonText: {
    fontSize: 17,
    color: '#8E8E93',
  },
  saveButtonText: {
    fontSize: 17,
    color: '#FFFFFF',
  },
});