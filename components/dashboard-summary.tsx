import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateMonthlyOutgo } from "@/utils/calculations"

export function DashboardSummary({ emis, expenses }: { emis: any[], expenses: any[] }) {
  const { totalEMI, totalExpense, totalOutgo } = calculateMonthlyOutgo(emis, expenses)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly EMIs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-500">${totalEMI.toFixed(2)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">${totalExpense.toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Outgo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">${totalOutgo.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  )
}
