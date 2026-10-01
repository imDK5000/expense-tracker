"use client"

import { formatINR } from "@/lib/format"
import { calculateMonthlyOutgo } from "@/utils/calculations"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function DashboardSummary({ emis, expenses, receivables }: { emis: any[], expenses: any[], receivables?: any[] }) {
  const { totalEMI, totalExpense, totalOutgo } = calculateMonthlyOutgo(emis, expenses)

  const pendingReceivables = (receivables || []).filter(r => r.status === 'Pending')
  const potentialIncome = pendingReceivables.reduce((sum, r) => sum + Number(r.amount), 0)

  // Recalculate filtered arrays for the current month so we can show them in the popups
  const targetDate = new Date()
  const currentYear = targetDate.getFullYear()
  const currentMonth = targetDate.getMonth()
  const currentAbsoluteMonths = currentYear * 12 + currentMonth

  const activeEMIs = emis.filter(emi => {
    const startDate = new Date(emi.start_date)
    const endDate = new Date(emi.start_date)
    endDate.setMonth(endDate.getMonth() + emi.tenure_months)
    const startAbsoluteMonths = startDate.getFullYear() * 12 + startDate.getMonth()
    const endAbsoluteMonths = endDate.getFullYear() * 12 + endDate.getMonth()
    return currentAbsoluteMonths >= startAbsoluteMonths && currentAbsoluteMonths < endAbsoluteMonths
  })

  const activeExpenses = expenses.filter(expense => {
    if (!expense.date) return true
    const expenseDate = new Date(expense.date)
    return expenseDate.getFullYear() === currentYear && expenseDate.getMonth() === currentMonth
  })

  const cards = [
    {
      id: "emis",
      label: "Monthly EMIs",
      value: formatINR(totalEMI),
      sub: "active this month",
      color: "copper-text",
      items: activeEMIs.map(e => ({ name: e.name, amount: e.monthly_amount }))
    },
    {
      id: "expenses",
      label: "Monthly Expenses",
      value: formatINR(totalExpense),
      sub: "logged this month",
      color: "text-rose-400",
      items: activeExpenses.map(e => ({ name: e.description, amount: e.amount }))
    },
    {
      id: "outgo",
      label: "Total Outgo",
      value: formatINR(totalOutgo),
      sub: "EMIs + expenses",
      color: "text-rose-500",
      items: [
        ...activeEMIs.map(e => ({ name: `[EMI] ${e.name}`, amount: e.monthly_amount })),
        ...activeExpenses.map(e => ({ name: `[Expense] ${e.description}`, amount: e.amount }))
      ]
    },
    {
      id: "income",
      label: "Potential Income",
      value: formatINR(potentialIncome),
      sub: "pending money owed",
      color: "text-emerald-400",
      items: pendingReceivables.map(r => ({ name: r.name, amount: r.amount }))
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Dialog key={card.id}>
          <DialogTrigger
            render={
              <button type="button" className="glass-card p-5 flex flex-col gap-1 cursor-pointer hover:bg-white/[0.04] transition-colors relative group text-left w-full h-full appearance-none">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{card.label}</p>
                <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/10 p-1.5 rounded-full">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="m9 18 6-6-6-6"/></svg>
                  </div>
                </div>
              </button>
            }
          />
          <DialogContent className="glass-card border-white/10 dark:bg-[#181818] max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">{card.label} Breakdown</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-3">
              {card.items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No items this month.</p>
              ) : (
                card.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className={`text-sm font-bold ${card.color}`}>{formatINR(Number(item.amount))}</span>
                  </div>
                ))
              )}
            </div>
            <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-center">
              <span className="text-sm font-semibold text-muted-foreground">Total</span>
              <span className={`text-xl font-bold ${card.color}`}>{card.value}</span>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}
