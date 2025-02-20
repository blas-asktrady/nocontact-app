import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { getChats } from '../services/chatService';
import { useUser } from './useUser';

interface Chat {
    id: string;
    title: string;
    // Add other chat properties as needed
}

interface ChatsContextType {
    chats: Chat[];
    loading: boolean;
    error: Error | null;
    addChat: (chatId: string, chatTitle: string) => void;
    refreshChats: () => Promise<void>;
}

const ChatsContext = createContext<ChatsContextType | undefined>(undefined);

export const ChatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useUser();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Function to fetch chats
    const fetchChats = async (userId: string) => {
        setLoading(true);
        setError(null);

        try {
            const fetchedChats = await getChats(userId);
            setChats(fetchedChats);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('An error occurred fetching chats');
            setError(error);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Initial load of chats when user is available
    useEffect(() => {
        if (user?.id) {
            fetchChats(user.id);
        }
    }, [user?.id]); // Only re-run when user ID changes

    // Function to refresh chats
    const refreshChats = async () => {
        if (user?.id) {
            await fetchChats(user.id);
        }
    };

    const addChat = useCallback((chatId: string, chatTitle: string) => {
        setChats((prevChats) => {
            // Check if the chat with the given ID already exists
            if (prevChats.some((chat) => chat.id === chatId)) {
                return prevChats;
            }
            // If it doesn't exist, add the new chat to the beginning of the array
            return [{ id: chatId, title: chatTitle }, ...prevChats];
        });
    }, []);

    return (
        <ChatsContext.Provider value={{ 
            chats, 
            loading, 
            error, 
            addChat,
            refreshChats 
        }}>
            {children}
        </ChatsContext.Provider>
    );
};

export const useChats = (): ChatsContextType => {
    const context = useContext(ChatsContext);
    if (context === undefined) {
        throw new Error('useChats must be used within a ChatsProvider');
    }
    return context;
};