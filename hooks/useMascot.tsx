import { useState, useEffect, useCallback } from 'react'
import { getMascotById, increaseXp, updateEmotionalLevel } from '@/services/mascotService'
import type { Tables } from '@/database.types'

type Mascot = Tables<'mascots'>

interface UseMascotReturn {
  mascot: Mascot | null
  loading: boolean
  error: Error | null
  refreshMascot: () => Promise<void>
  addXp: (amount: number) => Promise<void>
  setEmotionalLevel: (level: number) => Promise<void>
}

export default function useMascot(mascotId: string): UseMascotReturn {
  const [mascot, setMascot] = useState<Mascot | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMascot = useCallback(async () => {
    if (!mascotId) return
    
    try {
      setLoading(true)
      setError(null)
      const data = await getMascotById(mascotId)
      setMascot(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch mascot'))
      console.error('Error fetching mascot:', err)
    } finally {
      setLoading(false)
    }
  }, [mascotId])

  const refreshMascot = useCallback(async () => {
    await fetchMascot()
  }, [fetchMascot])

  const addXp = useCallback(async (amount: number) => {
    if (!mascotId) return
    
    try {
      setLoading(true)
      await increaseXp(mascotId, amount)
      
      // Update local state to reflect the change
      if (mascot) {
        setMascot({
          ...mascot,
          xp: (mascot.xp || 0) + amount,
          updated_at: new Date().toISOString()
        })
      }
      
      // Refresh to get the latest data
      await fetchMascot()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to increase XP'))
      console.error('Error increasing XP:', err)
    } finally {
      setLoading(false)
    }
  }, [mascotId, mascot, fetchMascot])

  const setEmotionalLevel = useCallback(async (level: number) => {
    if (!mascotId) return
    
    try {
      setLoading(true)
      await updateEmotionalLevel(mascotId, level)
      
      // Update local state to reflect the change
      if (mascot) {
        setMascot({
          ...mascot,
          emotional_level: Math.max(0, Math.min(7, level)),
          updated_at: new Date().toISOString()
        })
      }
      
      // Refresh to get the latest data
      await fetchMascot()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update emotional level'))
      console.error('Error updating emotional level:', err)
    } finally {
      setLoading(false)
    }
  }, [mascotId, mascot, fetchMascot])

  // Initial fetch
  useEffect(() => {
    fetchMascot()
  }, [fetchMascot])

  return {
    mascot,
    loading,
    error,
    refreshMascot,
    addXp,
    setEmotionalLevel
  }
}
