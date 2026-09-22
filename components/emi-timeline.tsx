import { formatINR } from "@/lib/format"

type EMI = {
  id: string
  name: string
  monthly_amount: number
  start_date: string
  tenure_months: number
}

export function EmiTimeline({ emis }: { emis: EMI[] }) {
  if (!emis || emis.length === 0) return null

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const TOTAL_MONTHS = 24
  const startYear = currentYear
  const startMonth = 0 // Jan

  const currentMonthOffset = (currentYear - startYear) * 12 + currentMonth
  const currentMarkerLeft = Math.max(0, Math.min(100, (currentMonthOffset / TOTAL_MONTHS) * 100))

  const visibleEmis = emis.filter((emi) => {
    const emiDate = new Date(emi.start_date)
    const emiStart = (emiDate.getFullYear() - startYear) * 12 + (emiDate.getMonth() - startMonth)
    const emiEnd = emiStart + emi.tenure_months
    return emiEnd > 0 && emiStart < TOTAL_MONTHS
  })

  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h2 className="text-base font-semibold">EMI Timeline</h2>
        <p className="text-xs text-muted-foreground mt-0.5">24-month projection starting Jan {startYear}</p>
      </div>

      <div className="relative mt-8 pt-6 pb-2">
        {/* Grid lines */}
        <div className="absolute top-0 bottom-0 left-0 border-l border-white/8" />
        <div className="absolute top-0 bottom-0 left-1/2 border-l border-white/8 border-dashed" />
        <div className="absolute top-0 bottom-0 right-0 border-r border-white/8" />

        {/* Year labels */}
        <div className="absolute -top-5 left-0 text-[11px] font-semibold text-muted-foreground">{startYear}</div>
        <div className="absolute -top-5 left-1/2 text-[11px] font-semibold text-muted-foreground">{startYear + 1}</div>
        <div className="absolute -top-5 right-0 text-[11px] font-semibold text-muted-foreground">{startYear + 2}</div>

        {/* Current Month Marker */}
        <div
          className="absolute top-0 bottom-0 z-10"
          style={{ left: `${currentMarkerLeft}%`, borderLeft: '2px solid #ff7640', boxShadow: '0 0 10px rgba(255,118,64,0.4)' }}
        >
          <div
            className="absolute -top-7 -translate-x-1/2 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ background: '#ff7640', color: '#0d0d0d' }}
          >
            Now
          </div>
        </div>

        <div className="space-y-8">
          {visibleEmis.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6 border border-white/8 border-dashed rounded-lg">
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

              const startsBefore = emiStart < 0
              const endsAfter = emiEnd > TOTAL_MONTHS

              return (
                <div key={emi.id} className="relative h-6 group">
                  <div className="text-xs font-medium absolute -top-5 left-0 w-full truncate">
                    {emi.name}{' '}
                    <span className="text-muted-foreground font-normal">
                      ({formatINR(Number(emi.monthly_amount))}/mo)
                    </span>
                  </div>
                  <div className="w-full h-full bg-white/5 rounded-full relative overflow-hidden">
                    <div
                      className={`absolute h-full transition-all group-hover:brightness-110 ${
                        startsBefore ? 'rounded-l-none' : 'rounded-l-full'
                      } ${endsAfter ? 'rounded-r-none' : 'rounded-r-full'}`}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        background: 'linear-gradient(90deg, #ff7640 0%, #ffb347 100%)',
                        opacity: 0.85,
                      }}
                    />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
