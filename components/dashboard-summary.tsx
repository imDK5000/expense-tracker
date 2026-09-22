import { formatINR } from "@/lib/format"
import { calculateMonthlyOutgo } from "@/utils/calculations"

export function DashboardSummary({ emis, expenses }: { emis: any[], expenses: any[] }) {
  const { totalEMI, totalExpense, totalOutgo } = calculateMonthlyOutgo(emis, expenses)

  const cards = [
    {
      label: "Monthly EMIs",
      value: formatINR(totalEMI),
      sub: "active this month",
      color: "copper-text",
    },
    {
      label: "Monthly Expenses",
      value: formatINR(totalExpense),
      sub: "logged this month",
      color: "text-rose-400",
    },
    {
      label: "Total Outgo",
      value: formatINR(totalOutgo),
      sub: "EMIs + expenses",
      color: "text-rose-500",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="glass-card p-5 flex flex-col gap-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{card.label}</p>
          <p className={`text-3xl font-bold mt-1 ${card.color}`}>{card.value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}
