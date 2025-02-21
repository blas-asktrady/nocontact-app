import { User } from '@prisma/client'
import apiClient from '@/libs/api'

export async function updateLoginTime(userId: string) {
    try {
      await apiClient.patch('/user', { userId })
    } catch (error) {
      console.error('Error updating login time:', error)
    }
  }
  
  export async function updateUser(userId: string, data: Partial<User>): Promise<User | null> {
    try {
      const { data: updatedUser } = await apiClient.put('/user', { userId, data })
      return updatedUser
    } catch (error) {
      console.error('Error updating user:', error)
      return null
    }
  }
  
  export async function getUserById(userId: string): Promise<User | null> {
    try {
      const { data: user } = await apiClient.get<User>(`/user`, { params: { userId } })
      return user
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }
  
  export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiClient.post('/auth/reset-password', { email })
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to send reset password email',
      }
    }
  }