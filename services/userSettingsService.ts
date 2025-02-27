import type { Tables } from '@/database.types'
import supabase from '@/libs/supabase'

type UserSettings = Tables<'user_settings'>

/**
 * Gets user settings by user ID
 */
export async function getUserSettingsByUserId(userId: string): Promise<UserSettings | null> {
  try {
    const { data: userSettings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user settings:', error)
      return null
    }
    
    return userSettings
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return null
  }
}

/**
 * Updates any user settings fields
 */
export async function updateUserSettings(
  userId: string, 
  data: Partial<UserSettings>
): Promise<UserSettings | null> {
  try {
    const { data: updatedSettings } = await supabase
      .from('user_settings')
      .update(data)
      .eq('user_id', userId)
      .select()
      .single()
    
    return updatedSettings
  } catch (error) {
    console.error('Error updating user settings:', error)
    return null
  }
}
