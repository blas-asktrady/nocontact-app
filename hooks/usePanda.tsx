import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { sendChatMessage, sendChatMessageAlternative } from '@/services/pandaService';

export interface PandaContextType {
    indicators: string[];
    updateIndicators: (newIndicators: string[]) => void;
    isSendingMessage: boolean;
    setIsSendingMessage: React.Dispatch<React.SetStateAction<boolean>>;
    sendMessage: (
        message: string,
        userId: string,
    ) => Promise<string | ReadableStream<Uint8Array> | ((onMessage: (message: string) => void) => void)>;
}

const PandaContext = createContext<PandaContextType | undefined>(undefined);

export const PandaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [indicators, setIndicators] = useState<string[]>([]);
    const [isSendingMessage, setIsSendingMessage] = useState(false);

    const updateIndicators = useCallback((newIndicators: string[]) => {
        setIndicators(newIndicators);
    }, []);

    const sendMessage = useCallback(async (message: string, characterId: string) => {
        setIsSendingMessage(true);
        try {
            // Depending on your React Native environment, choose the appropriate method:
            
            // Option 1: Use ReadableStream (if supported in your environment)
            const response = await sendChatMessage(message, characterId);
            return response;
            
            // Option 2: Use callback-based approach
            // const messageHandler = await sendChatMessageAlternative(message, characterId);
            // return messageHandler;
        } finally {
            setIsSendingMessage(false);
        }
    }, []);

    return (
        <PandaContext.Provider value={{ indicators, updateIndicators, isSendingMessage, setIsSendingMessage, sendMessage }}>
            {children}
        </PandaContext.Provider>
    );
};

export const usePanda = () => {
    const context = useContext(PandaContext);
    if (context === undefined) {
        throw new Error('usePanda must be used within a PandaProvider');
    }
    return context;
};