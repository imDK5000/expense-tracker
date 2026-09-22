import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Expense = {
  id: string
  description: string
  amount: number
  category?: string
  date: string
}

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground border rounded-xl bg-muted/20">
        No expenses found. Add one to get started.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {expenses.map((expense) => {
        return (
          <Card key={expense.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="truncate">{expense.description}</CardTitle>
                {expense.category && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-secondary text-secondary-foreground">
                    {expense.category}
                  </span>
                )}
              </div>
              <CardDescription>
                {new Date(expense.date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">
                ${expense.amount.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
