import apiClient from "@/libs/api"

export async function getMessagesForChat(chatId: string, limit: number = 20, offset: number = 0) {
    const { data } = await apiClient.get(`/chat/messages/${chatId}`, { params: { limit, offset } })
    return data
}

export async function getChats(userId: string) {
    const { data } = await apiClient.get('/chat/by-asset', { params: { userId} })
    return data
}
