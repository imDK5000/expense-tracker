"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateEMI, deleteEMI } from "@/app/actions/emi"
import { LenderAvatar } from "@/components/lender-avatar"
import { formatINR } from "@/lib/format"
import { Pencil, Trash2 } from "lucide-react"

type EMI = {
  id: string
  name: string
  monthly_amount: number
  start_date: string
  tenure_months: number
  lender_name?: string | null
  lender_logo_domain?: string | null
  notes?: string | null
}

function calculateEMIStats(startDateStr: string, tenureMonths: number) {
  const startDate = new Date(startDateStr)
  const paymentDay = startDate.getDate() // e.g. 5 if start is March 5

  // End date: same day as start, tenure months later
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + tenureMonths)

  const today = new Date()

  // Status based on actual date comparison
  let status = "Active"
  if (today < startDate) status = "Upcoming"
  else if (today >= endDate) status = "Completed"

  // Paid count — only include current month if today >= payment day
  let paid: number
  if (status === "Completed") {
    paid = tenureMonths
  } else if (status === "Upcoming") {
    paid = 0
  } else {
    const startAbs = startDate.getFullYear() * 12 + startDate.getMonth()
    const todayAbs = today.getFullYear() * 12 + today.getMonth()
    const elapsedMonths = todayAbs - startAbs
    const currentMonthPaid = today.getDate() >= paymentDay ? 1 : 0
    paid = Math.min(elapsedMonths + currentMonthPaid, tenureMonths)
  }

  const remaining = Math.max(tenureMonths - paid, 0)
  const progressPct = Math.round((paid / tenureMonths) * 100)

  const startAbs = startDate.getFullYear() * 12 + startDate.getMonth()
  const todayAbs = today.getFullYear() * 12 + today.getMonth()
  const monthsUntilStart = status === "Upcoming" ? startAbs - todayAbs : 0

  const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`

  return { endDate: endDateStr, status, paid, remaining, progressPct, monthsUntilStart }
}


function EditEMIModal({ emi }: { emi: EMI }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
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
        notes: (formData.get("notes") as string) || undefined,
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
            <Input id={`edit-emi-amount-${emi.id}`} name="monthly_amount" type="number" step="any" required defaultValue={emi.monthly_amount} className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-emi-start-${emi.id}`} className="text-sm font-medium">Start Date</Label>
            <Input id={`edit-emi-start-${emi.id}`} name="start_date" type="date" required defaultValue={emi.start_date} className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-emi-tenure-${emi.id}`} className="text-sm font-medium">Tenure (Months)</Label>
            <Input id={`edit-emi-tenure-${emi.id}`} name="tenure_months" type="number" required defaultValue={emi.tenure_months} className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-emi-notes-${emi.id}`} className="text-sm font-medium">
              Notes <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <textarea 
              id={`edit-emi-notes-${emi.id}`} 
              name="notes" 
              defaultValue={emi.notes ?? ""}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-white/5 dark:border-white/10"
            />
          </div>
          {error && <div className="text-sm text-red-400 font-medium bg-red-500/10 px-3 py-2 rounded-lg">{error}</div>}
          <DialogFooter className="mt-2 gap-2 flex-col sm:flex-row">
            {confirmDelete ? (
              <div className="flex items-center gap-2 w-full sm:mr-auto">
                <span className="text-sm text-red-400">Delete this EMI?</span>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleting}
                  className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700"
                  onClick={async () => {
                    setDeleting(true)
                    try {
                      await deleteEMI(emi.id)
                      setOpen(false)
                    } catch {
                      setError("Failed to delete EMI")
                      setDeleting(false)
                      setConfirmDelete(false)
                    }
                  }}
                >
                  {deleting ? "Deleting..." : "Yes, delete"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 px-3 text-xs dark:border-white/10 dark:hover:bg-white/5"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300 sm:mr-auto"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={13} className="mr-1" />
                Delete
              </Button>
            )}
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
        const { endDate, status, paid, remaining, progressPct, monthsUntilStart } =
          calculateEMIStats(emi.start_date, emi.tenure_months)

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

            {/* Remaining EMI progress */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                {status === "Completed" ? (
                  <span className="text-muted-foreground">All {emi.tenure_months} payments done</span>
                ) : status === "Upcoming" ? (
                  <span className="text-muted-foreground">
                    Starts in {monthsUntilStart} month{monthsUntilStart !== 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{remaining}</span>
                    {" "}of {emi.tenure_months} remaining
                  </span>
                )}
                <span className="text-muted-foreground">{progressPct}%</span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    status === "Completed"
                      ? "bg-white/30"
                      : "bg-gradient-to-r from-amber-600 to-amber-400"
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Meta */}
            <div className="flex flex-col gap-1 text-xs text-muted-foreground border-t border-white/6 pt-3">
              <span>{emi.tenure_months} months · starts {emi.start_date}</span>
              <span>Ends {endDate}</span>
              {emi.notes && (
                <p className="italic opacity-80 mt-1 truncate" title={emi.notes}>
                  &ldquo;{emi.notes}&rdquo;
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
