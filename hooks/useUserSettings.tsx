import { useState, useEffect, useCallback } from 'react'
import { getUserSettingsByUserId, updateUserSettings } from '@/services/userSettingsService'
import type { Tables } from '@/database.types'

type UserSettings = Tables<'user_settings'>

interface UseUserSettingsReturn {
  userSettings: UserSettings | null
  isLoading: boolean
  error: Error | null
  updateNoContactDate: (date: Date | null) => Promise<void>
  updateNotificationPreferences: (preferences: any) => Promise<void>
  updateWantsTips: (wantsTips: boolean) => Promise<void>
  updateProfilePictureUrl: (url: string) => Promise<void>
  refetchSettings: () => Promise<void>
}

/**
 * Hook for managing user settings
 * 
 * @param userId - The ID of the user whose settings to manage
 * @returns Object containing user settings, loading state, error state, and functions to update specific settings
 */
export default function useUserSettings(userId: string): UseUserSettingsReturn {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  // Function to fetch user settings
  const fetchUserSettings = useCallback(async () => {
    if (!userId) return
    
    try {
      setIsLoading(true)
      setError(null)
      const settings = await getUserSettingsByUserId(userId)
      setUserSettings(settings)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user settings'))
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Generic function to update settings
  const updateSettingsBase = useCallback(async (data: Partial<UserSettings>) => {
    if (!userId) return
    
    try {
      setIsLoading(true)
      setError(null)
      const updatedSettings = await updateUserSettings(userId, data)
      if (updatedSettings) {
        setUserSettings(updatedSettings)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update user settings'))
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Specific update functions
  const updateNoContactDate = useCallback(async (date: Date | null) => {
    return updateSettingsBase({ no_contact_date: date ? date.toISOString() : null })
  }, [updateSettingsBase])

  const updateNotificationPreferences = useCallback(async (preferences: any) => {
    return updateSettingsBase({ notification_preferences: preferences })
  }, [updateSettingsBase])

  const updateWantsTips = useCallback(async (wantsTips: boolean) => {
    return updateSettingsBase({ wants_tips: wantsTips })
  }, [updateSettingsBase])

  const updateProfilePictureUrl = useCallback(async (url: string) => {
    return updateSettingsBase({ profile_picture_url: url })
  }, [updateSettingsBase])

  // Fetch settings on initial load
  useEffect(() => {
    fetchUserSettings()
  }, [fetchUserSettings])

  return {
    userSettings,
    isLoading,
    error,
    updateNoContactDate,
    updateNotificationPreferences,
    updateWantsTips,
    updateProfilePictureUrl,
    refetchSettings: fetchUserSettings
  }
}
