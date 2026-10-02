"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateExpense, deleteExpense } from "@/app/actions/expenses"
import { formatINR } from "@/lib/format"
import { Pencil, Trash2 } from "lucide-react"
import { LenderAvatar } from "@/components/lender-avatar"

type Expense = {
  id: string
  description: string
  amount: number
  category?: string
  date?: string | null
  vendor_name?: string | null
  vendor_logo_domain?: string | null
  notes?: string | null
}

function EditExpenseModal({ expense }: { expense: Expense }) {
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
    const rawDate = formData.get("date") as string
    try {
      await updateExpense({
        id: expense.id,
        description: formData.get("description") as string,
        amount: Number(formData.get("amount")),
        category: (formData.get("category") as string) || undefined,
        vendor_name: (formData.get("vendor_name") as string) || undefined,
        date: rawDate ? rawDate : undefined,
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
            aria-label="Edit expense"
          >
            <Pencil size={13} />
          </button>
        }
      />
      <DialogContent className="glass-card border-white/10 dark:bg-[#181818]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Expense</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Update the details for this expense.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor={`edit-exp-desc-${expense.id}`} className="text-sm font-medium">Description</Label>
            <Input id={`edit-exp-desc-${expense.id}`} name="description" required defaultValue={expense.description} className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-exp-amount-${expense.id}`} className="text-sm font-medium">Amount (₹)</Label>
            <Input id={`edit-exp-amount-${expense.id}`} name="amount" type="number" step="any" required defaultValue={expense.amount} className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-exp-cat-${expense.id}`} className="text-sm font-medium">
              Category <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input id={`edit-exp-cat-${expense.id}`} name="category" defaultValue={expense.category ?? ""} placeholder="e.g. Food" className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-exp-vendor-${expense.id}`} className="text-sm font-medium">
              Vendor / Payee <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input id={`edit-exp-vendor-${expense.id}`} name="vendor_name" defaultValue={expense.vendor_name ?? ""} placeholder="e.g. Amazon, Swiggy" className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-exp-date-${expense.id}`} className="text-sm font-medium">
              Date <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input id={`edit-exp-date-${expense.id}`} name="date" type="date" defaultValue={expense.date ?? ""} className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-exp-notes-${expense.id}`} className="text-sm font-medium">
              Notes <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <textarea 
              id={`edit-exp-notes-${expense.id}`} 
              name="notes" 
              defaultValue={expense.notes ?? ""}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-white/5 dark:border-white/10"
            />
          </div>
          {error && <div className="text-sm text-red-400 font-medium bg-red-500/10 px-3 py-2 rounded-lg">{error}</div>}
          <DialogFooter className="mt-2 gap-2 flex-col sm:flex-row">
            {confirmDelete ? (
              <div className="flex items-center gap-2 w-full sm:mr-auto">
                <span className="text-sm text-red-400">Delete this expense?</span>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleting}
                  className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700"
                  onClick={async () => {
                    setDeleting(true)
                    try {
                      await deleteExpense(expense.id)
                      setOpen(false)
                    } catch {
                      setError("Failed to delete expense")
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

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="text-center p-10 text-muted-foreground border border-white/8 rounded-xl bg-white/[0.02]">
        No expenses found. Add one to get started.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {expenses.map((expense) => (
        <div key={expense.id} className="glass-card p-5 flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <LenderAvatar lender_name={expense.vendor_name} lender_logo_domain={expense.vendor_logo_domain} />
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-tight truncate">{expense.description}</p>
                {expense.vendor_name && (
                  <p className="text-xs text-muted-foreground truncate">{expense.vendor_name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {expense.category && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide bg-white/8 text-muted-foreground">
                  {expense.category}
                </span>
              )}
              <EditExpenseModal expense={expense} />
            </div>
          </div>

          {/* Amount */}
          <p className="text-2xl font-bold text-rose-400">{formatINR(expense.amount)}</p>

          {/* Date and Notes */}
          <div className="flex flex-col gap-1 text-xs text-muted-foreground border-t border-white/6 pt-3 mt-auto">
            {expense.date && (
              <p>
                {new Date(expense.date).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
            {expense.notes && (
              <p className="italic opacity-80 mt-1 truncate" title={expense.notes}>
                "{expense.notes}"
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
