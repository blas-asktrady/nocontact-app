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
      setTimestamp(params.timestamp ? Number(params.timestamp) : undefined);
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
        timestamp: timestamp ? Number(timestamp) : Date.now(),
        description: description || journalEntry.slice(0, 100), // First 100 chars as description
        type: type || 'entry',
        content: journalEntry
      }).then(() => {
        // Always navigate to the journal tab after saving
        navigation.navigate('tabs', { screen: 'journal' });
      }).catch(error => {
        console.error('Error updating journal entry:', error);
        Alert.alert('Error', 'Failed to update journal entry');
      });
    } else {
      console.log('add entry');
      // Add new entry
      addEntry({
        description: journalEntry.slice(0, 100), // First 100 chars as description
        type: 'entry',
        content: journalEntry
      }).then(() => {
        // Always navigate to the journal tab after saving
        navigation.navigate('tabs', { screen: 'journal' });
      }).catch(error => {
        console.error('Error adding journal entry:', error);
        Alert.alert('Error', 'Failed to add journal entry');
      });
    }
  };

  const handleCancel = () => {
    navigation.navigate('tabs', { screen: 'journal' });
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
              <Pencil size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleDelete}
              style={styles.iconButton}
            >
              <Trash2 size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ThemedText style={styles.subtitle}>
        Write freely about your recovery journey, thoughts, and feelings.
      </ThemedText>

      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={styles.inputWrapper}
          onPress={handleEdit}
          activeOpacity={0.7}
        >
          <TextInput
            style={styles.input}
            placeholder="Write about your recovery journey, thoughts, and feelings..."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
            value={journalEntry}
            onChangeText={setJournalEntry}
            editable={false}
            pointerEvents="none"
          />
        </TouchableOpacity>
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
    backgroundColor: '#6a77e3',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 16,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F8F9FE',
    borderRadius: 12,
    borderWidth: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  saveButton: {
    backgroundColor: '#4B69FF',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});