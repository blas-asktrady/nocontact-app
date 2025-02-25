import type { Tables } from '@/database.types'
import supabase from '@/libs/supabase'

type Journal = Tables<'journals'>

export async function createJournalEntry(userId: string, content: string) {
    console.log('createJournalEntry', userId, content)
    const { data, error } = await supabase
        .from('journals')
        .insert({ 
            user_id: userId, 
            content,
            journal_type: 'text' // Assuming 'text' is a valid journal_type value
        })
        .select()
        .single()

    if (error) {
        throw error
    }

    return data
}

export async function getJournalEntries(userId: string) {
    console.log('getJournalEntries', userId)
    const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        throw error
    }

    return data 
}

export async function deleteJournalEntry(id: string) {
    const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', id)

    if (error) {
        throw error
    }
}

export async function updateJournalEntry(id: string, content: string) {
    const { error } = await supabase
        .from('journals')
        .update({ content })
        .eq('id', id)

    if (error) {
        throw error
    }
}