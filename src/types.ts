export type Currency = 'TRY' | 'USD' | 'EUR'

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
}

export interface Expense {
  id: string
  name: string
  amount: number
  paidAmount: number // Track how much has been paid (for partial payments)
  currency: Currency
  date: string // ISO date string for one-time, or day of month (1-31) stored as "recurring-DD"
  isRecurring: boolean
  endDate?: string | null // Optional end date for recurring expenses (ISO date string, e.g., "2025-12")
  category: 'bill' | 'rent' | 'subscription' | 'other'
}

// Helper to generate month key from a Date (format: YYYY-MM)
export const getMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

// Helper to check if expense is fully paid
// For recurring expenses, use getPaidAmountForMonth to get the correct paidAmount
export const isFullyPaid = (expense: Expense, paidAmount?: number): boolean => {
  const effectivePaidAmount = paidAmount ?? expense.paidAmount ?? 0
  return effectivePaidAmount >= expense.amount
}

// Helper to check if expense is partially paid
// For recurring expenses, use getPaidAmountForMonth to get the correct paidAmount
export const isPartiallyPaid = (expense: Expense, paidAmount?: number): boolean => {
  const effectivePaidAmount = paidAmount ?? expense.paidAmount ?? 0
  return effectivePaidAmount > 0 && effectivePaidAmount < expense.amount
}

// Helper to get remaining amount
// For recurring expenses, use getPaidAmountForMonth to get the correct paidAmount
export const getRemainingAmount = (expense: Expense, paidAmount?: number): number => {
  const effectivePaidAmount = paidAmount ?? expense.paidAmount ?? 0
  return Math.max(0, expense.amount - effectivePaidAmount)
}

// Get paid amount for an expense, considering monthly payments for recurring expenses
export const getPaidAmountForExpense = (
  expense: Expense,
  monthKey: string,
  monthlyPayments: Record<string, number>,
): number => {
  if (expense.isRecurring) {
    return monthlyPayments[`${expense.id}-${monthKey}`] ?? 0
  }
  return expense.paidAmount ?? 0
}

export interface PayDay {
  date: string // ISO date string
}
