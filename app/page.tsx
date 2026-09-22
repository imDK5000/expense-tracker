import { getEMIs } from "@/app/actions/emi"
import { getExpenses } from "@/app/actions/expenses"
import { EMIList } from "@/components/emi-list"
import { EMIModal } from "@/components/emi-modal"
import { ExpenseList } from "@/components/expense-list"
import { ExpenseModal } from "@/components/expense-modal"
import { DashboardSummary } from "@/components/dashboard-summary"
import { EmiTimeline } from "@/components/emi-timeline"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  const [emis, expenses] = await Promise.all([
    getEMIs(),
    getExpenses()
  ])

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-10 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/8 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="copper-text">Expense</span>{" "}
            <span className="text-foreground">Tracker</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your EMIs and expenses</p>
        </div>
      </div>

      {/* Summary */}
      <DashboardSummary emis={emis as any[]} expenses={expenses as any[]} />

      {/* Timeline */}
      <section>
        <EmiTimeline emis={emis as any[]} />
      </section>

      {/* EMIs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Your EMIs</h2>
          <EMIModal />
        </div>
        <EMIList emis={emis as any[]} />
      </section>

      {/* Expenses */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Your Expenses</h2>
          <ExpenseModal />
        </div>
        <ExpenseList expenses={expenses as any[]} />
      </section>
    </main>
  )
}
