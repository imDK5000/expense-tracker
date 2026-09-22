import { formatINR } from "@/lib/format"

type EMI = {
  id: string
  name: string
  monthly_amount: number
  start_date: string
  tenure_months: number
}

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// Show every month
const TICK_INTERVAL = 1

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

  // Build ruler ticks: every TICK_INTERVAL months
  const ticks: { offset: number; label: string; isYearBoundary: boolean }[] = []
  for (let i = 0; i < TOTAL_MONTHS; i += TICK_INTERVAL) {
    const absMonth = (startMonth + i) % 12
    const yearOffset = Math.floor((startMonth + i) / 12)
    const isYearBoundary = absMonth === 0 && i > 0
    ticks.push({
      offset: i,
      label: MONTH_ABBR[absMonth],
      isYearBoundary,
    })
  }

  const visibleEmis = emis.filter((emi) => {
    const emiDate = new Date(emi.start_date)
    const emiStart = (emiDate.getFullYear() - startYear) * 12 + (emiDate.getMonth() - startMonth)
    const emiEnd = emiStart + emi.tenure_months
    return emiEnd > 0 && emiStart < TOTAL_MONTHS
  })

  return (
    <div className="glass-card p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold">EMI Timeline</h2>
        <p className="text-xs text-muted-foreground mt-0.5">24-month projection · {startYear}–{startYear + 2}</p>
      </div>

      <div className="relative" style={{ paddingTop: "2.75rem", paddingBottom: "0.5rem" }}>

        {/* ── Ruler ─────────────────────────────────────────────────── */}
        <div className="absolute top-0 left-0 right-0" style={{ height: "2.25rem" }}>
          {/* Baseline */}
          <div className="absolute bottom-0 left-0 right-0 border-b border-white/10" />

          {ticks.map(({ offset, label, isYearBoundary }) => {
            const leftPct = (offset / TOTAL_MONTHS) * 100
            const year = startYear + Math.floor((startMonth + offset) / 12)

            return (
              <div
                key={offset}
                className="absolute flex flex-col items-center"
                style={{ left: `${leftPct}%`, transform: "translateX(-50%)" }}
              >
                {/* Year label — only when crossing into a new year */}
                {isYearBoundary && (
                  <span
                    className="text-[8px] font-bold mb-0.5 px-1 rounded leading-none"
                    style={{ color: "#ff7640" }}
                  >
                    {year}
                  </span>
                )}
                {/* Month label */}
                <span
                  className={`text-[8px] leading-none ${
                    isYearBoundary ? "font-bold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
                {/* Tick mark */}
                <div
                  className={`mt-0.5 w-px ${isYearBoundary ? "h-2.5 bg-white/30" : "h-1.5 bg-white/15"}`}
                />
              </div>
            )
          })}

          {/* Start year label at far left */}
          <div className="absolute bottom-[calc(1.25rem)] left-0 -translate-x-px">
            <span className="text-[10px] font-bold" style={{ color: "#ff7640" }}>{startYear}</span>
          </div>

          {/* End year label at far right */}
          <div className="absolute bottom-[calc(1.25rem)] right-0 translate-x-px text-right">
            <span className="text-[10px] font-bold text-muted-foreground">{startYear + 2}</span>
          </div>
        </div>

        {/* ── Current Month Marker ────────────────────────────────────── */}
        <div
          className="absolute top-0 bottom-0 z-10"
          style={{
            left: `${currentMarkerLeft}%`,
            borderLeft: "2px solid #ff7640",
            boxShadow: "0 0 10px rgba(255,118,64,0.4)",
          }}
        >
          <div
            className="absolute -top-1 -translate-x-1/2 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap"
            style={{ background: "#ff7640", color: "#0d0d0d" }}
          >
            Now
          </div>
        </div>

        {/* ── EMI Bars ────────────────────────────────────────────────── */}
        <div className="space-y-8">
          {visibleEmis.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6 border border-white/8 border-dashed rounded-lg">
              No active EMIs in this timeline window.
            </div>
          ) : (
            visibleEmis.map((emi) => {
              const emiDate = new Date(emi.start_date)
              const emiStart =
                (emiDate.getFullYear() - startYear) * 12 + (emiDate.getMonth() - startMonth)
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
                    {emi.name}{" "}
                    <span className="text-muted-foreground font-normal">
                      ({formatINR(Number(emi.monthly_amount))}/mo)
                    </span>
                  </div>
                  <div className="w-full h-full bg-white/5 rounded-full relative overflow-hidden">
                    <div
                      className={`absolute h-full transition-all group-hover:brightness-110 ${
                        startsBefore ? "rounded-l-none" : "rounded-l-full"
                      } ${endsAfter ? "rounded-r-none" : "rounded-r-full"}`}
                      style={{
                        left: `${left}%`,
                        width: `${width}%`,
                        background: "linear-gradient(90deg, #ff7640 0%, #ffb347 100%)",
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
