import type { Tables } from '@/database.types'
import supabase from '@/libs/supabase'

type Survey = Tables<'surveys'>

  export async function updateLoginTime(userId: string) {
    try {
      await supabase.from('users').update({ last_login: new Date() }).eq('id', userId)
    } catch (error) {
      console.error('Error updating login time:', error)
    }
  }