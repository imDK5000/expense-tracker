"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateEMI } from "@/app/actions/emi"
import { LenderAvatar } from "@/components/lender-avatar"
import { formatINR } from "@/lib/format"
import { Pencil } from "lucide-react"

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
  return { endDate: endDate.toISOString().split("T")[0], status }
}

function EditEMIModal({ emi }: { emi: EMI }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const formData = new FormData(e.currentTarget)
    try {
      await updateEMI({
        id: emi.id,
        name: formData.get("name") as string,
        monthly_amount: Number(formData.get("monthly_amount")),
        start_date: formData.get("start_date") as string,
        tenure_months: Number(formData.get("tenure_months")),
        lender_name: (formData.get("lender_name") as string) || undefined,
      })
      setOpen(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors shrink-0"
            aria-label="Edit EMI"
          >
            <Pencil size={13} />
          </button>
        }
      />
      <DialogContent className="glass-card border-white/10 dark:bg-[#181818]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit EMI</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Update the details for this EMI.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor={`edit-emi-name-${emi.id}`} className="text-sm font-medium">EMI Name</Label>
            <Input id={`edit-emi-name-${emi.id}`} name="name" required defaultValue={emi.name} className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-emi-lender-${emi.id}`} className="text-sm font-medium">
              Lender / Vendor <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input id={`edit-emi-lender-${emi.id}`} name="lender_name" defaultValue={emi.lender_name ?? ""} placeholder="e.g. Moneyview, HDFC Bank" className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-emi-amount-${emi.id}`} className="text-sm font-medium">Monthly Amount (₹)</Label>
            <Input id={`edit-emi-amount-${emi.id}`} name="monthly_amount" type="number" step="1" required defaultValue={emi.monthly_amount} className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-emi-start-${emi.id}`} className="text-sm font-medium">Start Date</Label>
            <Input id={`edit-emi-start-${emi.id}`} name="start_date" type="date" required defaultValue={emi.start_date} className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-emi-tenure-${emi.id}`} className="text-sm font-medium">Tenure (Months)</Label>
            <Input id={`edit-emi-tenure-${emi.id}`} name="tenure_months" type="number" required defaultValue={emi.tenure_months} className="dark:bg-white/5 dark:border-white/10" />
          </div>
          {error && <div className="text-sm text-red-400 font-medium bg-red-500/10 px-3 py-2 rounded-lg">{error}</div>}
          <DialogFooter className="mt-2 gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="dark:border-white/10 dark:hover:bg-white/5">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="copper-button">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
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
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
                  status === "Active"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : status === "Upcoming"
                    ? "bg-blue-500/15 text-blue-400"
                    : "bg-white/10 text-muted-foreground"
                }`}>
                  {status}
                </span>
                <EditEMIModal emi={emi} />
              </div>
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
