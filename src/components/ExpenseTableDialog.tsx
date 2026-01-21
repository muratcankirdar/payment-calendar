import {
  Expense,
  CURRENCY_SYMBOLS,
  isFullyPaid,
  isPartiallyPaid,
  getPaidAmountForExpense,
} from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Check, X, RefreshCw, Clock } from 'lucide-react'

interface ExpenseTableDialogProps {
  open: boolean
  onClose: () => void
  expenses: Expense[]
  monthKey: string
  monthlyPayments: Record<string, number>
}

export function ExpenseTableDialog({
  open,
  onClose,
  expenses,
  monthKey,
  monthlyPayments,
}: ExpenseTableDialogProps) {
  const getCategoryVariant = (
    category: Expense['category'],
  ): 'destructive' | 'secondary' | 'default' | 'outline' => {
    switch (category) {
      case 'bill':
        return 'destructive'
      case 'rent':
        return 'secondary'
      case 'subscription':
        return 'default'
      default:
        return 'outline'
    }
  }

  const formatDate = (expense: Expense): string => {
    if (expense.isRecurring) {
      const day = expense.date.split('-')[1]
      return `Day ${parseInt(day)} (monthly)`
    }
    return new Date(expense.date).toLocaleDateString()
  }

  const getExpensePaidAmount = (expense: Expense): number => {
    return getPaidAmountForExpense(expense, monthKey, monthlyPayments)
  }

  const sortedExpenses = [...expenses].sort((a, b) => {
    // Sort by paid status first, then by name
    const aPaid = isFullyPaid(a, getExpensePaidAmount(a))
    const bPaid = isFullyPaid(b, getExpensePaidAmount(b))
    if (aPaid !== bPaid) return aPaid ? 1 : -1
    return a.name.localeCompare(b.name)
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">All Expenses</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto flex-1">
          {expenses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExpenses.map((expense) => {
                  const paidAmount = getExpensePaidAmount(expense)
                  const fullyPaid = isFullyPaid(expense, paidAmount)
                  const partialPaid = isPartiallyPaid(expense, paidAmount)
                  return (
                    <TableRow key={expense.id} className={fullyPaid ? 'opacity-50' : ''}>
                      <TableCell className={`font-medium ${fullyPaid ? 'line-through' : ''}`}>
                        {expense.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getCategoryVariant(expense.category)}>
                          {expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(expense)}</TableCell>
                      <TableCell>
                        {expense.isRecurring ? (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <RefreshCw className="h-3 w-3" />
                            Recurring
                          </span>
                        ) : (
                          <span className="text-muted-foreground">One-time</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {CURRENCY_SYMBOLS[expense.currency]}
                        {expense.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        {fullyPaid ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <Check className="h-4 w-4" />
                            Paid
                          </span>
                        ) : partialPaid ? (
                          <span className="inline-flex items-center gap-1 text-yellow-600">
                            <Clock className="h-4 w-4" />
                            {Math.round((paidAmount / expense.amount) * 100)}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-destructive">
                            <X className="h-4 w-4" />
                            Unpaid
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No expenses yet.</div>
          )}
        </div>
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
