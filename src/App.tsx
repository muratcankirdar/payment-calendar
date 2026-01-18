import { useState } from 'react'
import { toast } from 'sonner'
import { Calendar } from '@/components/Calendar'
import { ExpenseForm } from '@/components/ExpenseForm'
import { ExpenseTableDialog } from '@/components/ExpenseTableDialog'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Auth } from '@/components/Auth'
import { useAuth } from '@/contexts/AuthContext'
import { useExpenses } from '@/hooks/useExpenses'
import { useMonthlyPayments } from '@/hooks/useMonthlyPayments'
import { usePaydays } from '@/hooks/usePaydays'
import { Expense, CURRENCY_SYMBOLS, Currency, isPartiallyPaid, getMonthKey, getPaidAmountForExpense } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Wallet,
  CalendarDays,
  Table2,
  TrendingDown,
  CheckCircle2,
  Clock,
  LogOut,
  Loader2,
} from 'lucide-react'

function AppContent() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showForm, setShowForm] = useState(false)
  const [showTableView, setShowTableView] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()
  const [showPayDayInput, setShowPayDayInput] = useState(false)
  const [payDayDate, setPayDayDate] = useState('')

  const { user, signOut } = useAuth()
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses()
  const { monthlyPayments, setMonthlyPayment } = useMonthlyPayments()
  const { payDays, addPayDay, removePayDay } = usePaydays()

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setEditingExpense(undefined)
    setShowForm(true)
  }

  const handleExpenseClick = (expense: Expense) => {
    setEditingExpense(expense)
    setSelectedDate(undefined)
    setShowForm(true)
  }

  const handleSaveExpense = async (expenseData: Omit<Expense, 'id'> & { id?: string }) => {
    if (expenseData.id) {
      const success = await updateExpense(expenseData.id, expenseData)
      if (success) {
        toast.success('Expense updated successfully')
      } else {
        toast.error('Failed to update expense')
      }
    } else {
      const newExpense = await addExpense(expenseData)
      if (newExpense) {
        toast.success('Expense added successfully')
      } else {
        toast.error('Failed to add expense')
      }
    }
    setShowForm(false)
    setEditingExpense(undefined)
    setSelectedDate(undefined)
  }

  const handleDeleteExpense = async () => {
    if (editingExpense) {
      const success = await deleteExpense(editingExpense.id)
      if (success) {
        toast.success('Expense deleted')
      } else {
        toast.error('Failed to delete expense')
      }
      setShowForm(false)
      setEditingExpense(undefined)
    }
  }

  const handleSaveMonthlyPayment = async (expenseId: string, monthKey: string, amount: number) => {
    await setMonthlyPayment(expenseId, monthKey, amount)
  }

  const handleAddPayDay = async () => {
    if (payDayDate) {
      const success = await addPayDay(payDayDate)
      if (success) {
        toast.success('Pay day added')
      } else {
        toast.error('Failed to add pay day')
      }
    }
    setPayDayDate('')
    setShowPayDayInput(false)
  }

  const handleRemovePayDay = async (date: string) => {
    const success = await removePayDay(date)
    if (success) {
      toast.success('Pay day removed')
    } else {
      toast.error('Failed to remove pay day')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
  }

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const monthKey = getMonthKey(currentDate)

  // Filter expenses for current month (respect endDate for recurring)
  const activeExpenses = expenses.filter(expense => {
    if (expense.isRecurring && expense.endDate) {
      return monthKey <= expense.endDate
    }
    return true
  })

  // Group expenses by currency for summary (using month-specific payments)
  const expensesByCurrency = activeExpenses.reduce((acc, expense) => {
    if (!acc[expense.currency]) {
      acc[expense.currency] = { total: 0, paid: 0, unpaid: 0, partial: 0 }
    }
    const paidAmount = getPaidAmountForExpense(expense, monthKey, monthlyPayments)
    acc[expense.currency].total += expense.amount
    acc[expense.currency].paid += paidAmount
    acc[expense.currency].unpaid += (expense.amount - paidAmount)
    if (isPartiallyPaid(expense, paidAmount)) {
      acc[expense.currency].partial += 1
    }
    return acc
  }, {} as Record<Currency, { total: number; paid: number; unpaid: number; partial: number }>)

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-4 lg:px-8">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Payment Calendar</h1>
              <p className="text-muted-foreground text-sm">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowTableView(true)}>
              <Table2 className="h-4 w-4 mr-2" />
              Table View
            </Button>
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Prev
                  </Button>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    {monthYear}
                  </h2>
                  <Button variant="outline" size="sm" onClick={handleNextMonth}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Calendar
              currentDate={currentDate}
              expenses={expenses}
              payDays={payDays}
              monthlyPayments={monthlyPayments}
              onDayClick={handleDayClick}
              onExpenseClick={handleExpenseClick}
            />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(expensesByCurrency).length > 0 ? (
                  Object.entries(expensesByCurrency).map(([currency, totals]) => (
                    <div key={currency} className="space-y-2 pb-3 border-b border-border last:border-0 last:pb-0">
                      <div className="text-sm font-medium text-muted-foreground">{currency}</div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" />
                          Total
                        </span>
                        <span className="font-semibold">
                          {CURRENCY_SYMBOLS[currency as Currency]}{totals.total.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Paid
                        </span>
                        <span className="font-semibold">
                          {CURRENCY_SYMBOLS[currency as Currency]}{totals.paid.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Remaining</span>
                        <span className="font-semibold">
                          {CURRENCY_SYMBOLS[currency as Currency]}{totals.unpaid.toFixed(2)}
                        </span>
                      </div>
                      {totals.partial > 0 && (
                        <div className="flex justify-between items-center text-yellow-600 dark:text-yellow-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Partial payments
                          </span>
                          <span className="font-semibold">{totals.partial}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No expenses yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Pay Days
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPayDayInput(!showPayDayInput)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </CardHeader>
              <CardContent>
                {showPayDayInput && (
                  <div className="flex gap-2 mb-3">
                    <Input
                      type="date"
                      value={payDayDate}
                      onChange={(e) => setPayDayDate(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleAddPayDay}>
                      Add
                    </Button>
                  </div>
                )}
                <div className="space-y-1">
                  {payDays.sort().map(date => (
                    <div key={date} className="flex items-center justify-between text-sm p-2 bg-green-500/10 rounded">
                      <span>{new Date(date).toLocaleDateString()}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleRemovePayDay(date)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {payDays.length === 0 && (
                    <p className="text-muted-foreground text-sm">No pay days added yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full"
              onClick={() => {
                setSelectedDate(undefined)
                setEditingExpense(undefined)
                setShowForm(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>
      </div>

      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          selectedDate={selectedDate}
          currentDate={currentDate}
          monthlyPayments={monthlyPayments}
          onSave={handleSaveExpense}
          onSaveMonthlyPayment={handleSaveMonthlyPayment}
          onCancel={() => {
            setShowForm(false)
            setEditingExpense(undefined)
            setSelectedDate(undefined)
          }}
          onDelete={editingExpense ? handleDeleteExpense : undefined}
        />
      )}

      <ExpenseTableDialog
        open={showTableView}
        onClose={() => setShowTableView(false)}
        expenses={expenses}
        monthKey={monthKey}
        monthlyPayments={monthlyPayments}
      />
    </div>
  )
}

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return <AppContent />
}

export default App
