import { Expense, CURRENCY_SYMBOLS, isFullyPaid, isPartiallyPaid, getMonthKey, getPaidAmountForExpense } from '@/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CalendarProps {
  currentDate: Date
  expenses: Expense[]
  payDays: string[]
  monthlyPayments: Record<string, number>
  onDayClick: (date: Date) => void
  onExpenseClick: (expense: Expense) => void
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function Calendar({ currentDate, expenses, payDays, monthlyPayments, onDayClick, onExpenseClick }: CalendarProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthKey = getMonthKey(currentDate)

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDay = firstDay.getDay()

  const days: (number | null)[] = []

  for (let i = 0; i < startingDay; i++) {
    days.push(null)
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const getExpensesForDay = (day: number): Expense[] => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return expenses.filter(expense => {
      if (expense.isRecurring) {
        const recurringDay = parseInt(expense.date.split('-')[1])
        if (recurringDay !== day) return false

        // Check if expense has ended
        if (expense.endDate) {
          // endDate is in YYYY-MM format, compare with current month
          if (monthKey > expense.endDate) return false
        }
        return true
      }
      return expense.date === dateStr
    })
  }

  const isPayDay = (day: number): boolean => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return payDays.includes(dateStr)
  }

  const isToday = (day: number): boolean => {
    const today = new Date()
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
  }

  const getExpenseStyle = (expense: Expense): string => {
    const baseStyle = expense.category === 'bill' ? 'bg-destructive/10 border-destructive/20 text-destructive' :
      expense.category === 'rent' ? 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400' :
      expense.category === 'subscription' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400' :
      'bg-muted border-border text-muted-foreground'

    const paidAmount = getPaidAmountForExpense(expense, monthKey, monthlyPayments)
    if (isFullyPaid(expense, paidAmount)) {
      return `${baseStyle} opacity-50 line-through`
    }
    if (isPartiallyPaid(expense, paidAmount)) {
      return `${baseStyle} border-l-4 border-l-yellow-500`
    }
    return baseStyle
  }

  return (
    <Card>
      <div className="grid grid-cols-7 border-b border-border">
        {DAYS.map(day => (
          <div key={day} className="p-3 text-center font-semibold text-muted-foreground text-sm">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayExpenses = day ? getExpensesForDay(day) : []
          const dayIsPayDay = day ? isPayDay(day) : false
          const dayIsToday = day ? isToday(day) : false

          return (
            <div
              key={index}
              className={`group min-h-[120px] border-b border-r border-border p-2 transition-colors ${
                day ? 'cursor-pointer hover:bg-accent' : 'bg-muted/50'
              } ${dayIsToday ? 'bg-primary/10' : ''}`}
              onClick={() => day && onDayClick(new Date(year, month, day))}
            >
              {day && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${dayIsToday ? 'text-primary' : 'text-foreground'}`}>
                      {day}
                    </span>
                    {dayIsPayDay && (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs px-1.5 py-0">
                        Pay
                      </Badge>
                    )}
                  </div>
                  {dayExpenses.length === 0 ? (
                    <div className="flex items-center justify-center h-[80px] opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm text-muted-foreground">+ Add Expense</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {dayExpenses.map(expense => {
                        const paidAmount = getPaidAmountForExpense(expense, monthKey, monthlyPayments)
                        return (
                          <div
                            key={expense.id}
                            className={`text-xs p-1.5 rounded border cursor-pointer transition-all hover:scale-[1.02] ${getExpenseStyle(expense)}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              onExpenseClick(expense)
                            }}
                          >
                            <div className="truncate font-medium">{expense.name}</div>
                            <div className="flex items-center justify-between">
                              <span>{CURRENCY_SYMBOLS[expense.currency]}{expense.amount}</span>
                              {isPartiallyPaid(expense, paidAmount) && (
                                <span className="text-yellow-600 dark:text-yellow-400 text-[10px]">
                                  {Math.round((paidAmount / expense.amount) * 100)}%
                                </span>
                              )}
                              {isFullyPaid(expense, paidAmount) && (
                                <span className="text-green-600 dark:text-green-400 text-[10px]">Paid</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
