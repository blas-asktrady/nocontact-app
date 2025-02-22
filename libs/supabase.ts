// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';

// Get config from environment
const SUPABASE_URL = Constants.expoConfig?.extra?.supabaseUrl || 'https://tvkuqqpsizhdmtmuyhww.supabase.co';
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2a3VxcXBzaXpoZG10bXV5aHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMTU4NzgsImV4cCI6MjA1NTY5MTg3OH0.d294cxXtPmXSIGb3zLwkJzh3dG8tvAT-Q1iqsl-v41k';

// Custom storage adapter that safely handles AsyncStorage
const customStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      // Check if we're in a React Native environment
      if (typeof window === 'undefined') {
        return null;
      }
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn('Error accessing AsyncStorage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      // Check if we're in a React Native environment
      if (typeof window === 'undefined') {
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn('Error storing in AsyncStorage:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      // Check if we're in a React Native environment
      if (typeof window === 'undefined') {
        return;
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('Error removing from AsyncStorage:', error);
    }
  }
};

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: customStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;