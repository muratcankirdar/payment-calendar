import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface DbExpense {
  id: string
  user_id: string
  name: string
  amount: number
  paid_amount: number
  currency: string
  date: string
  is_recurring: boolean
  category: string
  created_at: string
  updated_at: string
}

export interface DbMonthlyPayment {
  id: string
  user_id: string
  expense_id: string
  month_key: string
  amount: number
  created_at: string
  updated_at: string
}

export interface DbPayday {
  id: string
  user_id: string
  date: string
  created_at: string
}
