import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Keyboard } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { NavigationProp, useNavigation, RouteProp, useRoute } from '@react-navigation/native';

type RootStackParamList = {
  'journal/edit': {
    content?: string;
    id?: string;
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

  const handleDone = () => {
    // Here you would typically save the changes
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

  const handleCancel = () => {
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

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
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
});