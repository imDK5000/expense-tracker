import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type EMI = {
  id: string
  name: string
  monthly_amount: number
  start_date: string
  tenure_months: number
}

export function EmiTimeline({ emis }: { emis: EMI[] }) {
  if (!emis || emis.length === 0) {
    return null
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  // 24-month window: Jan of current year to Dec of next year
  const TOTAL_MONTHS = 24
  const startYear = currentYear
  const startMonth = 0 // Jan

  const currentMonthOffset = (currentYear - startYear) * 12 + currentMonth
  const currentMarkerLeft = Math.max(0, Math.min(100, (currentMonthOffset / TOTAL_MONTHS) * 100))

  // Filter EMIs that have some overlap with our 24-month window
  const visibleEmis = emis.filter((emi) => {
    const emiDate = new Date(emi.start_date)
    const emiStart = (emiDate.getFullYear() - startYear) * 12 + (emiDate.getMonth() - startMonth)
    const emiEnd = emiStart + emi.tenure_months
    return emiEnd > 0 && emiStart < TOTAL_MONTHS
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>EMI Timeline</CardTitle>
        <CardDescription>24-month projection starting Jan {startYear}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mt-8 pt-6 pb-2">
          {/* Grid lines for years */}
          <div className="absolute top-0 bottom-0 left-0 border-l border-border" />
          <div className="absolute top-0 bottom-0 left-1/2 border-l border-border border-dashed" />
          <div className="absolute top-0 bottom-0 right-0 border-r border-border" />

          {/* Year labels */}
          <div className="absolute -top-6 left-0 text-xs font-semibold text-muted-foreground">{startYear}</div>
          <div className="absolute -top-6 left-1/2 text-xs font-semibold text-muted-foreground">{startYear + 1}</div>
          <div className="absolute -top-6 right-0 text-xs font-semibold text-muted-foreground">{startYear + 2}</div>

          {/* Current Month Marker */}
          <div 
            className="absolute top-0 bottom-0 border-l-2 border-destructive z-10 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            style={{ left: `${currentMarkerLeft}%` }}
          >
            <div className="absolute -top-8 -translate-x-1/2 bg-destructive text-destructive-foreground text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
              Current
            </div>
          </div>

          <div className="space-y-8">
            {visibleEmis.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-lg">
                No active EMIs in this timeline window.
              </div>
            ) : (
              visibleEmis.map((emi) => {
                const emiDate = new Date(emi.start_date)
                const emiStart = (emiDate.getFullYear() - startYear) * 12 + (emiDate.getMonth() - startMonth)
                const emiEnd = emiStart + emi.tenure_months
                
                const visualStart = Math.max(0, emiStart)
                const visualEnd = Math.min(TOTAL_MONTHS, emiEnd)
                
                const left = (visualStart / TOTAL_MONTHS) * 100
                const width = ((visualEnd - visualStart) / TOTAL_MONTHS) * 100

                // Check if EMI extends beyond the visual boundaries to add gradients or flat ends
                const startsBefore = emiStart < 0
                const endsAfter = emiEnd > TOTAL_MONTHS

                return (
                  <div key={emi.id} className="relative h-6 group">
                    <div className="text-xs font-medium absolute -top-5 left-0 w-full truncate">
                      {emi.name} <span className="text-muted-foreground font-normal">(${Number(emi.monthly_amount).toFixed(0)}/mo)</span>
                    </div>
                    <div className="w-full h-full bg-secondary rounded-full relative overflow-hidden">
                      <div 
                        className={`absolute h-full bg-primary transition-all group-hover:brightness-110 ${startsBefore ? 'rounded-l-none' : 'rounded-l-full'} ${endsAfter ? 'rounded-r-none' : 'rounded-r-full'}`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
