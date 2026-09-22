import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type EMI = {
  id: string
  name: string
  monthly_amount: number
  start_date: string
  tenure_months: number
}

function calculateEndDateAndStatus(startDateStr: string, tenureMonths: number) {
  const startDate = new Date(startDateStr)
  
  // Calculate end date
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + tenureMonths)
  
  const now = new Date()
  
  let status = "Active"
  if (now < startDate) {
    status = "Upcoming"
  } else if (now > endDate) {
    status = "Completed"
  }
  
  return {
    endDate: endDate.toISOString().split('T')[0], // format to YYYY-MM-DD
    status
  }
}

export function EMIList({ emis }: { emis: EMI[] }) {
  if (!emis || emis.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground border rounded-xl bg-muted/20">
        No EMIs found. Add one to get started.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {emis.map((emi) => {
        const { endDate, status } = calculateEndDateAndStatus(emi.start_date, emi.tenure_months)
        
        return (
          <Card key={emi.id}>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="truncate">{emi.name}</CardTitle>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  status === 'Active' ? 'bg-green-100 text-green-800' :
                  status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {status}
                </span>
              </div>
              <CardDescription>
                {emi.tenure_months} months starting {emi.start_date}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <div className="text-3xl font-bold">${emi.monthly_amount.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                <div className="text-sm text-muted-foreground mt-2 font-medium">
                  Ends on {endDate}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
