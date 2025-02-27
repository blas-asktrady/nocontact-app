import type { Tables } from '@/database.types'
import supabase from '@/libs/supabase'

type User = Tables<'users'>
type Survey = Tables<'surveys'>
type UserSettings = Tables<'user_settings'>

export async function updateUsername(userId: string, username: string) {
  try {
    const userData: Partial<User> = { username }
    await supabase.from('users').update(userData).eq('id', userId)
  } catch (error) {
    console.error('Error updating username:', error)
  }
}

export async function updateDepressionDuration(userId: string, depressionDuration: string) {
  try {
    const surveyData: Partial<Survey> = { depression_duration: depressionDuration }
    const { data, error } = await supabase.from('surveys').update(surveyData).eq('user_id', userId)
    console.log('updateDepressionDuration', data, error)
  } catch (error) {
    console.error('Error updating relationship type:', error)
  }
}

export async function updateLastEpisodeDate(userId: string, lastEpisodeDate: string) {
  try {
    const surveyData: Partial<Survey> = { last_depression_episode: lastEpisodeDate }
    await supabase.from('surveys').update(surveyData).eq('user_id', userId)
  } catch (error) {
    console.error('Error updating breakup date:', error)
  }
}

export async function updatePrimaryGoal(userId: string, primaryGoal: string) {
  try {
    const surveyData: Partial<Survey> = { healing_goal: primaryGoal }
    await supabase.from('surveys').update(surveyData).eq('user_id', userId)
  } catch (error) {
    console.error('Error updating healing goal:', error)
  }
}

export async function updateWantTips(userId: string, wantTips: boolean) {
  try {
    const settingsData: Partial<UserSettings> = { wants_tips: wantTips }
    await supabase.from('user_settings').update(settingsData).eq('user_id', userId)
  } catch (error) {
    console.error('Error updating wants tips:', error)
  }
}

export async function updateIsSurveyCompleted(userId: string, isSurveyCompleted: boolean) {
  try {
    const userData: Partial<User> = { is_onboarding_completed: isSurveyCompleted }
    await supabase.from('users').update(userData).eq('id', userId)
  } catch (error) {
    console.error('Error updating onboarding status:', error)
  }
}