import apiClient from "@/libs/api"

export async function createChat(
    userId: string,
    title: string,
    llm: string,
    messageContent: string,
    messageSenderType: string,
    messageSenderId: string,
    messageReceiverId: string,
    tokensUsed: number,
): Promise<string> {
    const { data } = await apiClient.post('/chat/create', {
        userId,
        title,
        llm,
        messageContent,
        messageSenderType,
        messageSenderId,
        messageReceiverId,
        tokensUsed,
    })
    return data.chatId
}

export async function archiveChat(chatId: string) {
    await apiClient.put(`/chat/archive/${chatId}`)
}

export async function addMessageToChat(
    chatId: string,
    content: string,
    senderType: string,
    senderId: string,
    receiverId: string,
    tokensUsed: number,
) {
    const { data } = await apiClient.post('/chat/message', {
        chatId,
        content,
        senderType,
        senderId,
        receiverId,
        tokensUsed,
    })
    return data
}

export async function getMessagesForChat(chatId: string, limit: number = 20, offset: number = 0) {
    const { data } = await apiClient.get(`/chat/messages/${chatId}`, { params: { limit, offset } })
    return data
}

export async function getChats(userId: string) {
    const { data } = await apiClient.get('/chat', { params: { userId} })
    return data
}
