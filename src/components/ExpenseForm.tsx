import { useState, useEffect } from 'react'
import { Expense, Currency, CURRENCY_SYMBOLS, getMonthKey } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  FileText,
  Coins,
  Tag,
  RefreshCw,
  CalendarIcon,
  Save,
  Trash2,
  Home,
  Zap,
  Tv,
  MoreHorizontal,
  CheckCircle2,
  CircleDollarSign
} from 'lucide-react'

interface ExpenseFormProps {
  expense?: Expense
  selectedDate?: Date
  currentDate: Date
  monthlyPayments: Record<string, number>
  onSave: (expense: Omit<Expense, 'id'> & { id?: string }) => void
  onSaveMonthlyPayment: (expenseId: string, monthKey: string, amount: number) => void
  onCancel: () => void
  onDelete?: () => void
}

export function ExpenseForm({ expense, selectedDate, currentDate, monthlyPayments, onSave, onSaveMonthlyPayment, onCancel, onDelete }: ExpenseFormProps) {
  const monthKey = getMonthKey(currentDate)

  // Get the initial paid amount - for recurring expenses, use monthly payment
  const getInitialPaidAmount = (): string => {
    if (expense?.isRecurring && expense?.id) {
      const monthlyPaid = monthlyPayments[`${expense.id}-${monthKey}`]
      return monthlyPaid?.toString() || '0'
    }
    return expense?.paidAmount?.toString() || '0'
  }

  const [name, setName] = useState(expense?.name || '')
  const [amount, setAmount] = useState(expense?.amount?.toString() || '')
  const [paidAmount, setPaidAmount] = useState(getInitialPaidAmount())
  const [currency, setCurrency] = useState<Currency>(expense?.currency || 'TRY')
  const [isRecurring, setIsRecurring] = useState(expense?.isRecurring || false)
  const [recurringDay, setRecurringDay] = useState(() => {
    if (expense?.isRecurring) {
      return expense.date.split('-')[1]
    }
    return selectedDate ? String(selectedDate.getDate()) : '1'
  })
  const [date, setDate] = useState(() => {
    if (expense && !expense.isRecurring) {
      return expense.date
    }
    if (selectedDate) {
      return selectedDate.toISOString().split('T')[0]
    }
    return new Date().toISOString().split('T')[0]
  })
  const [category, setCategory] = useState<Expense['category']>(expense?.category || 'bill')
  const [hasEndDate, setHasEndDate] = useState(!!expense?.endDate)
  const [endDate, setEndDate] = useState(expense?.endDate || '')

  useEffect(() => {
    if (selectedDate && !expense) {
      setDate(selectedDate.toISOString().split('T')[0])
      setRecurringDay(String(selectedDate.getDate()))
    }
  }, [selectedDate, expense])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const paidAmountNum = parseFloat(paidAmount) || 0

    // For recurring expenses, save the payment to monthly payments
    if (isRecurring && expense?.id) {
      onSaveMonthlyPayment(expense.id, monthKey, paidAmountNum)
    }

    onSave({
      id: expense?.id,
      name,
      amount: parseFloat(amount) || 0,
      // For recurring expenses, don't store paidAmount on the expense itself
      paidAmount: isRecurring ? 0 : paidAmountNum,
      currency,
      date: isRecurring ? `recurring-${recurringDay.padStart(2, '0')}` : date,
      isRecurring,
      endDate: isRecurring && hasEndDate ? endDate : null,
      category,
    })
  }

  const handleMarkFullyPaid = () => {
    setPaidAmount(amount)
  }

  const handleMarkUnpaid = () => {
    setPaidAmount('0')
  }

  const currentAmount = parseFloat(amount) || 0
  const currentPaidAmount = parseFloat(paidAmount) || 0
  const remainingAmount = Math.max(0, currentAmount - currentPaidAmount)
  const paymentProgress = currentAmount > 0 ? (currentPaidAmount / currentAmount) * 100 : 0
  const fullyPaid = currentPaidAmount >= currentAmount && currentAmount > 0
  const partiallyPaid = currentPaidAmount > 0 && currentPaidAmount < currentAmount

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {expense ? 'Edit Expense' : 'Add Expense'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Rent, Netflix, Electric Bill"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-muted-foreground" />
                Total Amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {CURRENCY_SYMBOLS[currency]}
                </span>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-muted-foreground" />
                Currency
              </Label>
              <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRY">₺ Turkish Lira</SelectItem>
                  <SelectItem value="USD">$ US Dollar</SelectItem>
                  <SelectItem value="EUR">€ Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Category
            </Label>
            <Select value={category} onValueChange={(value) => setCategory(value as Expense['category'])}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bill">
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Bill
                  </span>
                </SelectItem>
                <SelectItem value="rent">
                  <span className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Rent
                  </span>
                </SelectItem>
                <SelectItem value="subscription">
                  <span className="flex items-center gap-2">
                    <Tv className="h-4 w-4" />
                    Subscription
                  </span>
                </SelectItem>
                <SelectItem value="other">
                  <span className="flex items-center gap-2">
                    <MoreHorizontal className="h-4 w-4" />
                    Other
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecurring"
              checked={isRecurring}
              onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
            />
            <Label htmlFor="isRecurring" className="text-sm font-normal cursor-pointer flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              Recurring monthly expense
            </Label>
          </div>

          {isRecurring ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recurringDay" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  Day of Month
                </Label>
                <Select value={recurringDay} onValueChange={setRecurringDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={String(day)}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasEndDate"
                  checked={hasEndDate}
                  onCheckedChange={(checked) => setHasEndDate(checked as boolean)}
                />
                <Label htmlFor="hasEndDate" className="text-sm font-normal cursor-pointer">
                  Set end date
                </Label>
              </div>

              {hasEndDate && (
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    End Month
                  </Label>
                  <Input
                    id="endDate"
                    type="month"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required={hasEndDate}
                  />
                  <p className="text-xs text-muted-foreground">
                    Expense will appear until this month (inclusive)
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          )}

          {/* Payment Section */}
          <Card className={`${fullyPaid ? 'border-green-500 bg-green-500/5' : partiallyPaid ? 'border-yellow-500 bg-yellow-500/5' : ''}`}>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <CircleDollarSign className="h-5 w-5" />
                  Payment Status
                </Label>
                {fullyPaid && (
                  <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Fully Paid
                  </span>
                )}
                {partiallyPaid && (
                  <span className="text-yellow-600 text-sm font-medium">
                    Partially Paid
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(paymentProgress)}%</span>
                </div>
                <Progress value={paymentProgress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="paidAmount" className="text-sm text-muted-foreground">
                    Paid Amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      {CURRENCY_SYMBOLS[currency]}
                    </span>
                    <Input
                      id="paidAmount"
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      max={amount}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm text-muted-foreground">Remaining</Label>
                  <div className={`h-9 flex items-center px-3 rounded-md border bg-muted/50 font-semibold ${remainingAmount > 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {CURRENCY_SYMBOLS[currency]}{remainingAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={fullyPaid ? "outline" : "default"}
                  size="sm"
                  className="flex-1"
                  onClick={handleMarkFullyPaid}
                  disabled={!amount || parseFloat(amount) <= 0}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Mark Fully Paid
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleMarkUnpaid}
                  disabled={currentPaidAmount === 0}
                >
                  Reset Payment
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {expense ? 'Update' : 'Add Expense'}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
          </div>

          {expense && onDelete && (
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Expense
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
