import { useState, useEffect, useCallback } from 'react'
import { supabase, DbExpense } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Expense, Currency } from '@/types'

// Convert database expense to app expense
function dbToExpense(db: DbExpense): Expense {
  return {
    id: db.id,
    name: db.name,
    amount: Number(db.amount),
    paidAmount: Number(db.paid_amount),
    currency: db.currency as Currency,
    date: db.date,
    isRecurring: db.is_recurring,
    endDate: db.end_date,
    category: db.category as Expense['category'],
  }
}

export function useExpenses() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setExpenses([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setExpenses((data || []).map(dbToExpense))
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const addExpense = async (expense: Omit<Expense, 'id'>): Promise<Expense | null> => {
    if (!user) return null

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          name: expense.name,
          amount: expense.amount,
          paid_amount: expense.paidAmount,
          currency: expense.currency,
          date: expense.date,
          is_recurring: expense.isRecurring,
          end_date: expense.endDate || null,
          category: expense.category,
        })
        .select()
        .single()

      if (error) throw error
      const newExpense = dbToExpense(data)
      setExpenses((prev) => [newExpense, ...prev])
      return newExpense
    } catch (err) {
      setError(err as Error)
      return null
    }
  }

  const updateExpense = async (id: string, expense: Omit<Expense, 'id'>): Promise<boolean> => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          name: expense.name,
          amount: expense.amount,
          paid_amount: expense.paidAmount,
          currency: expense.currency,
          date: expense.date,
          is_recurring: expense.isRecurring,
          end_date: expense.endDate || null,
          category: expense.category,
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      setExpenses((prev) => prev.map((e) => (e.id === id ? { ...expense, id } : e)))
      return true
    } catch (err) {
      setError(err as Error)
      return false
    }
  }

  const deleteExpense = async (id: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id).eq('user_id', user.id)

      if (error) throw error
      setExpenses((prev) => prev.filter((e) => e.id !== id))
      return true
    } catch (err) {
      setError(err as Error)
      return false
    }
  }

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refetch: fetchExpenses,
  }
}
