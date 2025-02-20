import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react'
import { sendChatMessage } from '@/services/renderService'

export interface RenderContextType {
    indicators: string[]
    updateIndicators: (newIndicators: string[]) => void
    isSendingMessage: boolean
    setIsSendingMessage: React.Dispatch<React.SetStateAction<boolean>>
    sendMessage: (
        message: string,
        userId: string,
    ) => Promise<string | ReadableStream<Uint8Array>>
}

const RenderContext = createContext<RenderContextType | undefined>(undefined)

export const RenderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [indicators, setIndicators] = useState<string[]>([])
    const [isSendingMessage, setIsSendingMessage] = useState(false)

    const updateIndicators = useCallback((newIndicators: string[]) => {
        setIndicators(newIndicators)
    }, [])

    const sendMessage = useCallback(async (message: string, characterId: string) => {
        setIsSendingMessage(true)
        try {
            const response = await sendChatMessage(message, characterId)
            return response
        } finally {
            setIsSendingMessage(false)
        }
    }, [])

    return (
        <RenderContext.Provider value={{ indicators, updateIndicators, isSendingMessage, setIsSendingMessage, sendMessage }}>
            {children}
        </RenderContext.Provider>
    )
}

export const useRender = () => {
    const context = useContext(RenderContext)
    if (context === undefined) {
        throw new Error('useRender must be used within a RenderProvider')
    }
    return context
}
