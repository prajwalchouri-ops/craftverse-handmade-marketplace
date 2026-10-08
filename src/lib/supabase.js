import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add both values to .env.local.')
}

let rememberSession = true

export function setRememberSession(remember) {
  rememberSession = remember
}

const authStorage = {
  getItem(key) {
    return window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key)
  },
  setItem(key, value) {
    const destination = rememberSession ? window.localStorage : window.sessionStorage
    const otherStorage = rememberSession ? window.sessionStorage : window.localStorage
    otherStorage.removeItem(key)
    destination.setItem(key, value)
  },
  removeItem(key) {
    window.localStorage.removeItem(key)
    window.sessionStorage.removeItem(key)
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage
  }
})
