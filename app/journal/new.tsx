import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
  Text
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { NavigationProp, useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useJournal } from '@/hooks/useJournal';
import Constants from 'expo-constants';

type RootStackParamList = {
  'journal/new': {
    content?: string;
    id?: string;
    timestamp?: number;
    description?: string;
    type?: string;
    isNewEntry?: boolean;
  };
  'journal/edit': {
    content?: string;
    id?: string;
    timestamp?: number;
    description?: string;
    type?: string;
    isNewEntry?: boolean;
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
  isNewEntry?: boolean;
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
  const [isNewEntryFlow, setIsNewEntryFlow] = useState(true);

  useEffect(() => {
    if (params) {
      if (params.isNewEntry !== undefined) {
        setIsNewEntryFlow(params.isNewEntry);
      } else {
        setIsNewEntryFlow(!params.id);
      }
      
      setEntryId(params.id);
      setTimestamp(params.timestamp ? Number(params.timestamp) : undefined);
      setDescription(params.description);
      setType(params.type);
      
      if (params.content !== undefined) {
        setJournalEntry(params.content);
      } else if (isNewEntryFlow && !params.id) {
        setJournalEntry('');
      }
    } else {
      setIsNewEntryFlow(true);
      setJournalEntry('');
      setEntryId(undefined);
      setTimestamp(undefined);
      setDescription(undefined);
      setType(undefined);
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
      updateEntry({
        id: entryId,
        timestamp: timestamp ? Number(timestamp) : Date.now(),
        description: description || journalEntry.slice(0, 100),
        type: type || 'entry',
        content: journalEntry
      }).then(() => {
        navigation.navigate('tabs', { screen: 'journal' });
      }).catch(error => {
        console.error('Error updating journal entry:', error);
        Alert.alert('Error', 'Failed to update journal entry');
      });
    } else {
      console.log('add entry');
      addEntry({
        description: journalEntry.slice(0, 100),
        type: 'entry',
        content: journalEntry
      }).then(() => {
        navigation.navigate('tabs', { screen: 'journal' });
      }).catch(error => {
        console.error('Error adding journal entry:', error);
        Alert.alert('Error', 'Failed to add journal entry');
      });
    }
  };

  const handleCancel = () => {
    if (isNewEntryFlow) {
      navigation.navigate('tabs', { screen: 'journal' });
    } else {
      navigation.navigate('tabs', { screen: 'journal' });
    }
    console.log('Cancel button pressed');
  };

  const handleGoToEdit = () => {
    navigation.navigate('journal/edit', {
      content: journalEntry,
      id: entryId,
      timestamp: timestamp,
      description: description,
      type: type,
      isNewEntry: isNewEntryFlow
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

  const statusBarHeight = Platform.OS === 'ios' ? Constants.statusBarHeight || 44 : 0;

  return (
    <View style={[styles.rootContainer]}>
      <View style={{height: statusBarHeight, backgroundColor: '#FFFFFF'}} />
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {entryId ? 'Edit Journal Entry' : 'New Journal Entry'}
            </Text>
          </View>
          
          {entryId && (
            <View style={styles.iconContainer}>
              <TouchableOpacity 
                onPress={handleGoToEdit}
                style={styles.iconButton}
              >
                <Feather name="edit-2" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleDelete}
                style={styles.iconButton}
              >
                <Feather name="trash-2" size={24} color="black" />
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
            onPress={handleGoToEdit}
            activeOpacity={0.7}
            delayPressIn={0}
          >
            <TextInput
              style={[styles.input]}
              placeholder="Write about your recovery journey, thoughts, and feelings..."
              placeholderTextColor="#757575"
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
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.button, 
              styles.saveButton,
              journalEntry.trim() === '' && styles.disabledButton
            ]} 
            onPress={handleSave}
            disabled={journalEntry.trim() === ''}
          >
            <Text style={[
              styles.saveButtonText,
              journalEntry.trim() === '' && styles.disabledButtonText
            ]}>Save</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
  titleContainer: {
    flex: 1,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 16,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#ECEEF8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0D4E8',
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF0000',
    opacity: 1,
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
  disabledButton: {
    backgroundColor: '#A0A0A0',
    opacity: 0.7,
  },
  disabledButtonText: {
    color: '#E0E0E0',
  },
});