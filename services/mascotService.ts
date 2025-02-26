import type { Tables } from '@/database.types'
import supabase from '@/libs/supabase'

type Mascot = Tables<'mascots'>

export async function getMascotById(id: string) {
    const { data, error } = await supabase
        .from('mascots')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        throw error
    }

    return data
}

export async function increaseXp(id: string, xpAmount: number) {
    // First get current XP to calculate the new value
    const { data: mascot, error: fetchError } = await supabase
        .from('mascots')
        .select('xp')
        .eq('id', id)
        .single()

    if (fetchError) {
        throw fetchError
    }

    const newXp = (mascot?.xp || 0) + xpAmount

    // Update the mascot with new XP
    const { error } = await supabase
        .from('mascots')
        .update({ 
            xp: newXp,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        throw error
    }
}

export async function updateEmotionalLevel(id: string, emotionalLevel: number) {
    // Ensure emotional level is within valid range (0-7)
    const validEmotionalLevel = Math.max(0, Math.min(7, emotionalLevel))

    const { error } = await supabase
        .from('mascots')
        .update({ 
            emotional_level: validEmotionalLevel,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        throw error
    }
}
