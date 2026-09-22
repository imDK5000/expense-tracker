import { formatINR } from "@/lib/format"

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
      <div className="text-center p-10 text-muted-foreground border border-white/8 rounded-xl bg-white/[0.02]">
        No expenses found. Add one to get started.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {expenses.map((expense) => (
        <div key={expense.id} className="glass-card p-5 flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold text-sm leading-tight truncate">{expense.description}</p>
            {expense.category && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 uppercase tracking-wide bg-white/8 text-muted-foreground">
                {expense.category}
              </span>
            )}
          </div>

          {/* Amount */}
          <p className="text-2xl font-bold text-rose-400">{formatINR(expense.amount)}</p>

          {/* Date */}
          <p className="text-xs text-muted-foreground border-t border-white/6 pt-3">
            {new Date(expense.date).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      ))}
    </div>
  )
}
