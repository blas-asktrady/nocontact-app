import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { 
  createJournalEntry, 
  getJournalEntries, 
  updateJournalEntry as updateJournalInDB, 
  deleteJournalEntry as deleteJournalFromDB 
} from '@/services/journalService';

export type JournalEntry = {
  id: string;
  timestamp: number;
  description: string;
  type: string;
  content?: string;
};

type JournalContextType = {
  journals: JournalEntry[];
  addEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => Promise<JournalEntry>;
  updateEntry: (entry: JournalEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntryById: (id: string) => JournalEntry | undefined;
  isLoading: boolean;
};

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  // Fetch journal entries when user changes
  useEffect(() => {
    const fetchJournals = async () => {
      if (!user) {
        setJournals([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const journalData = await getJournalEntries(user.id);
        
        // Transform the data to match our JournalEntry type
        const transformedJournals = journalData.map(journal => ({
          id: journal.id,
          timestamp: new Date(journal.created_at).getTime(),
          description: journal.content?.substring(0, 50) || 'No description',
          type: 'entry',
          content: journal.content || '',
        }));
        
        setJournals(transformedJournals);
      } catch (error) {
        console.error('Error fetching journal entries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJournals();
  }, [user]);

  const addEntry = useCallback(async (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => {
    if (!user) {
      throw new Error('User must be logged in to add journal entries');
    }

    try {
      const newJournalData = await createJournalEntry(user.id, entry.content || '');
      
      const newEntry: JournalEntry = {
        id: newJournalData.id,
        timestamp: new Date(newJournalData.created_at).getTime(),
        description: entry.description,
        type: entry.type,
        content: entry.content,
      };

      setJournals(prevJournals => [...prevJournals, newEntry]);
      return newEntry;
    } catch (error) {
      console.error('Error adding journal entry:', error);
      throw error;
    }
  }, [user]);

  const updateEntry = useCallback(async (updatedEntry: JournalEntry) => {
    if (!user) {
      throw new Error('User must be logged in to update journal entries');
    }

    try {
      await updateJournalInDB(updatedEntry.id, updatedEntry.content || '');
      
      // Make sure we're using the timestamp from the updatedEntry
      // If it doesn't exist, use the current timestamp
      const entryWithValidTimestamp = {
        ...updatedEntry,
        timestamp: updatedEntry.timestamp || Date.now()
      };
      
      // Update the journals state with the complete updated entry
      setJournals(prevJournals =>
        prevJournals.map(journal =>
          journal.id === updatedEntry.id ? entryWithValidTimestamp : journal
        )
      );
      
      console.log('Journals updated:', journals);
    } catch (error) {
      console.error('Error updating journal entry:', error);
      throw error;
    }
  }, [user]);

  const deleteEntry = useCallback(async (id: string) => {
    if (!user) {
      throw new Error('User must be logged in to delete journal entries');
    }

    try {
      await deleteJournalFromDB(id);
      
      setJournals(prevJournals => 
        prevJournals.filter(journal => journal.id !== id)
      );
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      throw error;
    }
  }, [user]);

  const getEntryById = useCallback((id: string) => {
    return journals.find(journal => journal.id === id);
  }, [journals]);

  const value = {
    journals,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntryById,
    isLoading,
  };

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};