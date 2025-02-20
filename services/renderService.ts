export async function sendChatMessage(
    message: string,
    characterId: string,
): Promise<ReadableStream<Uint8Array> | string> {
    try {
        const formData = new FormData()
        formData.append('message', message)
        formData.append('characterId', characterId)

        const response = await fetch('/api/trady/chat', {
            method: 'POST',
            body: formData,
        })

        const contentType = response.headers.get('Content-Type')

        if (contentType?.includes('application/json')) {
            // Handle error responses
            const jsonResponse = await response.json()
            throw new Error(jsonResponse.error || 'Unknown error occurred')
        }

        if (!response.body) {
            throw new Error('Response body is null')
        }

        return response.body
    } catch (error) {
        console.error('Error sending chat message:', error)
        throw error
    }
}
