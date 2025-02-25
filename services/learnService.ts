import type { Tables } from '@/database.types'
import supabase from '@/libs/supabase'

type ContentLibrary = Tables<'content_library'>

export async function getLearnings(userId: string) {
    const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .eq('user_id', userId)

    return data
}