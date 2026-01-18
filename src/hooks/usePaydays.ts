import { useState, useEffect, useCallback } from 'react'
import { supabase, DbPayday } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function usePaydays() {
  const { user } = useAuth()
  const [payDays, setPayDays] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPaydays = useCallback(async () => {
    if (!user) {
      setPayDays([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('paydays')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })

      if (error) throw error
      setPayDays((data || []).map((p: DbPayday) => p.date))
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchPaydays()
  }, [fetchPaydays])

  const addPayDay = async (date: string): Promise<boolean> => {
    if (!user) return false
    if (payDays.includes(date)) return true // Already exists

    try {
      const { error } = await supabase.from('paydays').insert({
        user_id: user.id,
        date,
      })

      if (error) throw error
      setPayDays((prev) => [...prev, date].sort())
      return true
    } catch (err) {
      setError(err as Error)
      return false
    }
  }

  const removePayDay = async (date: string): Promise<boolean> => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('paydays')
        .delete()
        .eq('user_id', user.id)
        .eq('date', date)

      if (error) throw error
      setPayDays((prev) => prev.filter((d) => d !== date))
      return true
    } catch (err) {
      setError(err as Error)
      return false
    }
  }

  return {
    payDays,
    loading,
    error,
    addPayDay,
    removePayDay,
    refetch: fetchPaydays,
  }
}
