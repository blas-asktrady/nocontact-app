import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { NavigationProp, useNavigation } from '@react-navigation/native';

type RootStackParamList = {
  'journal/new': undefined;
  'journal/edit': {
    content?: string;
    id?: string;
  };
  'tabs': {
    screen?: string;
  };
};

type NavigationProps = NavigationProp<RootStackParamList, 'journal/new'>;

export default function NewJournalScreen() {
  const navigation = useNavigation<NavigationProps>();
  const [journalEntry, setJournalEntry] = useState('');

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
    navigateBack();
  };

  const handleCancel = () => {
    navigateBack();
  };

  const handleInputPress = () => {
    console.log('Input pressed');
    navigation.navigate('journal/edit', {
      content: journalEntry
    });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Journal Entry</ThemedText>
        <ThemedText style={styles.subtitle}>
          Write freely about your recovery journey, thoughts, and feelings.
        </ThemedText>
      </View>

      <TouchableOpacity 
        style={styles.inputContainer}
        onPress={handleInputPress}
        activeOpacity={0.7}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Write about your recovery journey, thoughts, and feelings..."
            placeholderTextColor="#8E8E93"
            multiline
            textAlignVertical="top"
            value={journalEntry}
            onChangeText={setJournalEntry}
            editable={false}
            pointerEvents="box-none"
          />
        </View>
      </TouchableOpacity>

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
    paddingHorizontal: 16,
    paddingTop: 16,
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