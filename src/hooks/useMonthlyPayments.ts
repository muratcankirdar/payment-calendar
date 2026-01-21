import { useState, useEffect, useCallback } from 'react'
import { supabase, DbMonthlyPayment } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

// MonthlyPayments type for quick lookup (format: "expenseId-YYYY-MM" -> amount)
export type MonthlyPayments = Record<string, number>

export function useMonthlyPayments() {
  const { user } = useAuth()
  const [monthlyPayments, setMonthlyPayments] = useState<MonthlyPayments>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMonthlyPayments = useCallback(async () => {
    if (!user) {
      setMonthlyPayments({})
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('monthly_payments')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      // Convert to lookup object
      const payments: MonthlyPayments = {}
      ;(data || []).forEach((payment: DbMonthlyPayment) => {
        payments[`${payment.expense_id}-${payment.month_key}`] = Number(payment.amount)
      })
      setMonthlyPayments(payments)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchMonthlyPayments()
  }, [fetchMonthlyPayments])

  const setMonthlyPayment = async (
    expenseId: string,
    monthKey: string,
    amount: number,
  ): Promise<boolean> => {
    if (!user) return false

    try {
      // Use upsert to handle both insert and update
      const { error } = await supabase.from('monthly_payments').upsert(
        {
          user_id: user.id,
          expense_id: expenseId,
          month_key: monthKey,
          amount,
        },
        {
          onConflict: 'expense_id,month_key',
        },
      )

      if (error) throw error

      setMonthlyPayments((prev) => ({
        ...prev,
        [`${expenseId}-${monthKey}`]: amount,
      }))
      return true
    } catch (err) {
      setError(err as Error)
      return false
    }
  }

  const getMonthlyPayment = (expenseId: string, monthKey: string): number => {
    return monthlyPayments[`${expenseId}-${monthKey}`] ?? 0
  }

  return {
    monthlyPayments,
    loading,
    error,
    setMonthlyPayment,
    getMonthlyPayment,
    refetch: fetchMonthlyPayments,
  }
}
