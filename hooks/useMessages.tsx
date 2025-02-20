import React, { createContext, useContext, ReactNode } from 'react'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { getMessagesForChat, addMessageToChat, createChat } from '../services/chatService'

export interface Message {
    id?: string
    content: string
    senderType: sender
    senderId: string
    receiverId: string
    createdAt: string
    tokensUsed?: number
}

interface MessagesContextType {
    messages: Message[]
    loading: boolean
    error: Error | null
    addNewMessage: (
        message: Message,
        userId: string,
        title: string,
        assetType: asset_type,
        assetName: string,
        llm: string,
        isUpdate?: boolean,
    ) => Promise<string>
    chatId: string | null
    setChatId: React.Dispatch<React.SetStateAction<string | null>>
    isChatEmpty: boolean
    clearChat: () => void
    createNewChat: (
        userId: string,
        title: string,
        assetType: asset_type,
        assetName: string,
        llm: string,
        message: Message,
    ) => Promise<string | null>
    addMessageToUI: (messageId: string, message: Message) => void
    updateMessageInUI: (messageId: string, content: string) => void
    addCompleteLLMResponseMessage: (
        message: Message,
        userId: string,
        title: string,
        assetType: asset_type,
        assetName: string,
        llm: string,
    ) => Promise<void>
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined)

export const MessagesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [chatId, setChatId] = useState<string | null>(null)
    const [shouldFetchMessages, setShouldFetchMessages] = useState(false)
    const isInternalUpdate = useRef(false)
    const [messageQueue, setMessageQueue] = useState<Message[]>([])
    const isFirstMessageSent = useRef(false)

    const isChatEmpty = useMemo(() => messages.length === 0 && !chatId && !isFirstMessageSent.current, [messages, chatId])

    useEffect(() => {
        if (chatId) {
            isFirstMessageSent.current = true
        }
    }, [chatId])

    const clearChat = useCallback(() => {
        setMessages([])
        setChatId(null)
        setShouldFetchMessages(false)
        setMessageQueue([])
        isFirstMessageSent.current = false
    }, [])

    const setChatIdAndFetch = useCallback((newChatId: string | null) => {
        setChatId(newChatId)
        setShouldFetchMessages(true)
    }, [])

    useEffect(() => {
        const fetchMessages = async () => {
            if (!chatId || !shouldFetchMessages || isInternalUpdate.current) return

            setLoading(true)
            setError(null)

            try {
                const fetchedMessages = await getMessagesForChat(chatId)
                setMessages(fetchedMessages)
            } catch (err) {
                setError(err instanceof Error ? err : new Error('An error occurred fetching messages'))
            } finally {
                setLoading(false)
                setShouldFetchMessages(false)
            }
        }

        fetchMessages()
    }, [chatId, shouldFetchMessages])

    const createNewChat = useCallback(
        async (userId: string, title: string, assetType: asset_type, assetName: string, llm: string, message: Message) => {
            try {
                const newChatId = await createChat(
                    userId,
                    title,
                    assetType,
                    assetName,
                    llm,
                    message.content,
                    message.senderType,
                    message.senderId,
                    message.receiverId,
                    message.tokensUsed || 0,
                )
                isInternalUpdate.current = true
                setChatId(newChatId)
                isInternalUpdate.current = false
                return newChatId
            } catch (err) {
                console.error('Error creating new chat:', err)
                setError(err instanceof Error ? err : new Error('An error occurred creating a new chat'))
                return null
            }
        },
        [],
    )

    useEffect(() => {
        const processMessageQueue = async () => {
            if (chatId && messageQueue.length > 0) {
                for (const message of messageQueue) {
                    try {
                        await addMessageToChat(
                            chatId,
                            message.content,
                            message.senderType,
                            message.senderId,
                            message.receiverId,
                            message.tokensUsed || 0,
                        )
                    } catch (err) {
                        console.error('Error adding queued message to database:', err)
                    }
                }
                setMessageQueue([])
            }
        }

        processMessageQueue()
    }, [chatId, messageQueue])

    const addNewMessage = useCallback(
        async (message: Message, userId: string, title: string, assetType: asset_type, assetName: string, llm: string): Promise<string> => {
            const messageWithId = { ...message, id: crypto.randomUUID() }

            if (chatId) {
                try {
                    await addMessageToChat(
                        chatId,
                        messageWithId.content,
                        messageWithId.senderType,
                        messageWithId.senderId,
                        messageWithId.receiverId,
                        messageWithId.tokensUsed || 0,
                    )
                    setMessages((prevMessages) => [...prevMessages, messageWithId])
                } catch (err) {
                    console.error('Error adding message to database:', err)
                }
            } else if (!isFirstMessageSent.current) {
                isFirstMessageSent.current = true
                setMessages((prevMessages) => [...prevMessages, messageWithId])
                try {
                    const newChatId = await createNewChat(userId, title, assetType, assetName, llm, messageWithId)
                    setChatId(newChatId)
                } catch (err) {
                    console.error('Error creating new chat:', err)
                    setError(err instanceof Error ? err : new Error('An error occurred creating a new chat'))
                    setMessages((prevMessages) => prevMessages.filter((m) => m !== messageWithId))
                    isFirstMessageSent.current = false
                }
            } else {
                setMessageQueue((prevQueue) => [...prevQueue, messageWithId])
                setMessages((prevMessages) => [...prevMessages, messageWithId])
            }

            return messageWithId.id
        },
        [chatId, createNewChat],
    )

    const addMessageToUI = useCallback((messageId: string, message: Message) => {
        const messageWithId = { ...message, id: messageId }
        setMessages((prevMessages) => [...prevMessages, messageWithId])
    }, [])

    const updateMessageInUI = useCallback((messageId: string, content: string) => {
        setMessages((prevMessages) => prevMessages.map((msg) => (msg.id === messageId ? { ...msg, content } : msg)))
    }, [])

    const addCompleteLLMResponseMessage = useCallback(
        async (message: Message, userId: string, title: string, assetType: asset_type, assetName: string, llm: string) => {
            if (chatId) {
                await addMessageToChat(
                    chatId,
                    message.content,
                    message.senderType,
                    message.senderId,
                    message.receiverId,
                    message.tokensUsed || 0,
                )
            } else if (!isFirstMessageSent.current) {
                const newChatId = await createNewChat(userId, title, assetType, assetName, llm, message)
                setChatId(newChatId)
                isFirstMessageSent.current = true
            } else {
                setMessageQueue((prevQueue) => [...prevQueue, message])
            }
        },
        [chatId, createNewChat],
    )

    const value = {
        messages,
        loading,
        error,
        addNewMessage,
        chatId,
        setChatId: setChatIdAndFetch,
        isChatEmpty,
        clearChat,
        createNewChat,
        messageQueue,
        addMessageToUI,
        updateMessageInUI,
        addCompleteLLMResponseMessage,
    }

    return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>
}

export const useMessages = (): MessagesContextType => {
    const context = useContext(MessagesContext)
    if (context === undefined) {
        throw new Error('useMessages must be used within a MessagesProvider')
    }
    return context
}
