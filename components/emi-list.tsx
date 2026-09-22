import { formatINR } from "@/lib/format"
import { getFaviconUrl, getLenderInitials } from "@/lib/lenders"

type EMI = {
  id: string
  name: string
  monthly_amount: number
  start_date: string
  tenure_months: number
  lender_name?: string | null
  lender_logo_domain?: string | null
}

function calculateEndDateAndStatus(startDateStr: string, tenureMonths: number) {
  const startDate = new Date(startDateStr)
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + tenureMonths)
  const now = new Date()

  let status = "Active"
  if (now < startDate) status = "Upcoming"
  else if (now > endDate) status = "Completed"

  return { endDate: endDate.toISOString().split('T')[0], status }
}

function LenderAvatar({ lender_name, lender_logo_domain }: { lender_name?: string | null; lender_logo_domain?: string | null }) {
  if (lender_logo_domain) {
    return (
      <img
        src={getFaviconUrl(lender_logo_domain)}
        alt={lender_name ?? "Lender"}
        width={32}
        height={32}
        className="rounded-lg object-contain bg-white/10 p-0.5 shrink-0"
        onError={(e) => {
          // fallback to initials if favicon fails
          const target = e.currentTarget
          target.style.display = 'none'
          const sibling = target.nextElementSibling as HTMLElement | null
          if (sibling) sibling.style.display = 'flex'
        }}
      />
    )
  }
  if (lender_name) {
    const initials = getLenderInitials(lender_name)
    return (
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: 'rgba(255, 118, 64, 0.18)', color: '#ff7640' }}
      >
        {initials}
      </div>
    )
  }
  return null
}

export function EMIList({ emis }: { emis: EMI[] }) {
  if (!emis || emis.length === 0) {
    return (
      <div className="text-center p-10 text-muted-foreground border border-white/8 rounded-xl bg-white/[0.02]">
        No EMIs found. Add one to get started.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {emis.map((emi) => {
        const { endDate, status } = calculateEndDateAndStatus(emi.start_date, emi.tenure_months)

        return (
          <div key={emi.id} className="glass-card p-5 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <LenderAvatar lender_name={emi.lender_name} lender_logo_domain={emi.lender_logo_domain} />
                <div className="min-w-0">
                  <p className="font-semibold text-sm leading-tight truncate">{emi.name}</p>
                  {emi.lender_name && (
                    <p className="text-xs text-muted-foreground truncate">{emi.lender_name}</p>
                  )}
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 uppercase tracking-wide ${
                status === 'Active'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : status === 'Upcoming'
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'bg-white/10 text-muted-foreground'
              }`}>
                {status}
              </span>
            </div>

            {/* Amount */}
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold copper-text">{formatINR(emi.monthly_amount)}</span>
              <span className="text-xs text-muted-foreground">/mo</span>
            </div>

            {/* Meta */}
            <div className="flex flex-col gap-1 text-xs text-muted-foreground border-t border-white/6 pt-3">
              <span>{emi.tenure_months} months · starts {emi.start_date}</span>
              <span>Ends {endDate}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
