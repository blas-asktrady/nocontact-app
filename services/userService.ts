import type { Tables } from '@/database.types'
import supabase from '@/libs/supabase'

type User = Tables<'users'>
type UserSettings = Tables<'user_settings'>

  export async function updateLoginTime(userId: string) {
    try {
      await supabase.from('users').update({ last_login: new Date() }).eq('id', userId)
    } catch (error) {
      console.error('Error updating login time:', error)
    }
  }
  
  export async function updateUser(userId: string, data: Partial<User>): Promise<User | null> {
    try {
      const { data: updatedUser } = await supabase.from('users').update(data).eq('id', userId).select().single()
      return updatedUser
    } catch (error) {
      console.error('Error updating user:', error)
      return null
    }
  }
  
  export async function getUserById(userId: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  export async function getUserSettingsByUserId(userId: string): Promise<UserSettings | null> {
    try {
      const { data: userSettings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user settings:', error);
        return null;
      }
      return userSettings;
    }
    catch (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
  }
  
  export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await supabase.auth.resetPasswordForEmail(email)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send reset password email',
      }
    }
  }