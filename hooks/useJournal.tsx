import React, { createContext, useContext, useState, useCallback } from 'react';

export type JournalEntry = {
  id: string;
  timestamp: number;
  description: string;
  type: string;
  content?: string;
};

type JournalContextType = {
  journals: JournalEntry[];
  addEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => JournalEntry;
  updateEntry: (entry: JournalEntry) => void;
  deleteEntry: (id: string) => void;
  getEntryById: (id: string) => JournalEntry | undefined;
};

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [journals, setJournals] = useState<JournalEntry[]>([
    {
      id: '1',
      timestamp: 1708473600000,
      description: 'This is a test',
      type: 'entry',
      content: 'This is the full content of the journal entry...'
    },
  ]);

  const addEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'timestamp'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    setJournals(prevJournals => [...prevJournals, newEntry]);
    return newEntry;
  }, []);

  const updateEntry = useCallback((updatedEntry: JournalEntry) => {
    setJournals(prevJournals =>
      prevJournals.map(journal =>
        journal.id === updatedEntry.id ? updatedEntry : journal
      )
    );
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setJournals(prevJournals => 
      prevJournals.filter(journal => journal.id !== id)
    );
  }, []);

  const getEntryById = useCallback((id: string) => {
    return journals.find(journal => journal.id === id);
  }, [journals]);

  const value = {
    journals,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntryById,
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