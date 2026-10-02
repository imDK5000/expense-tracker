"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateReceivable, deleteReceivable } from "@/app/actions/receivables"
import { formatINR } from "@/lib/format"
import { Pencil, ExternalLink, CheckCircle2, Clock, MessageCircle, Trash2 } from "lucide-react"

type Receivable = {
  id: string
  name: string
  amount: number
  type: string
  link?: string | null
  due_date?: string | null
  status: string
  phone_number?: string | null
  notes?: string | null
}

function EditReceivableModal({ receivable }: { receivable: Receivable }) {
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
    const rawDate = formData.get("due_date") as string
    try {
      await updateReceivable({
        id: receivable.id,
        name: formData.get("name") as string,
        amount: Number(formData.get("amount")),
        type: formData.get("type") as string,
        link: (formData.get("link") as string) || undefined,
        due_date: rawDate ? rawDate : undefined,
        status: formData.get("status") as string,
        phone_number: (formData.get("phone_number") as string) || undefined,
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
            aria-label="Edit receivable"
          >
            <Pencil size={13} />
          </button>
        }
      />
      <DialogContent className="glass-card border-white/10 dark:bg-[#181818]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Edit Receivable</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Update the details or mark as paid.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor={`edit-rec-name-${receivable.id}`} className="text-sm font-medium">Name / Client</Label>
            <Input id={`edit-rec-name-${receivable.id}`} name="name" required defaultValue={receivable.name} className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-rec-amount-${receivable.id}`} className="text-sm font-medium">Amount (₹)</Label>
            <Input id={`edit-rec-amount-${receivable.id}`} name="amount" type="number" step="any" required defaultValue={receivable.amount} className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-rec-type-${receivable.id}`} className="text-sm font-medium">Type</Label>
            <Input id={`edit-rec-type-${receivable.id}`} name="type" required defaultValue={receivable.type} className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-rec-link-${receivable.id}`} className="text-sm font-medium">Invoice Link (Optional)</Label>
            <Input id={`edit-rec-link-${receivable.id}`} name="link" type="url" defaultValue={receivable.link ?? ""} className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-rec-phone-${receivable.id}`} className="text-sm font-medium">WhatsApp Number (Optional)</Label>
            <Input id={`edit-rec-phone-${receivable.id}`} name="phone_number" type="tel" defaultValue={receivable.phone_number ?? ""} className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-rec-due-${receivable.id}`} className="text-sm font-medium">Due Date (Optional)</Label>
            <Input id={`edit-rec-due-${receivable.id}`} name="due_date" type="date" defaultValue={receivable.due_date ?? ""} className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-rec-status-${receivable.id}`} className="text-sm font-medium">Status</Label>
            <select
              id={`edit-rec-status-${receivable.id}`}
              name="status"
              defaultValue={receivable.status}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/5 dark:border-white/10"
            >
              <option value="Pending" className="dark:bg-[#181818]">Pending</option>
              <option value="Paid" className="dark:bg-[#181818]">Paid</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`edit-rec-notes-${receivable.id}`} className="text-sm font-medium">
              Notes <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <textarea 
              id={`edit-rec-notes-${receivable.id}`} 
              name="notes" 
              defaultValue={receivable.notes ?? ""}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:bg-white/5 dark:border-white/10"
            />
          </div>
          {error && <div className="text-sm text-red-400 font-medium bg-red-500/10 px-3 py-2 rounded-lg">{error}</div>}
          <DialogFooter className="mt-2 gap-2 flex-col sm:flex-row">
            {confirmDelete ? (
              <div className="flex items-center gap-2 w-full sm:mr-auto">
                <span className="text-sm text-red-400">Delete this receivable?</span>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleting}
                  className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700"
                  onClick={async () => {
                    setDeleting(true)
                    try {
                      await deleteReceivable(receivable.id)
                      setOpen(false)
                    } catch {
                      setError("Failed to delete receivable")
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

export function ReceivableList({ receivables }: { receivables: Receivable[] }) {
  if (!receivables || receivables.length === 0) {
    return (
      <div className="text-center p-10 text-muted-foreground border border-white/8 rounded-xl bg-white/[0.02]">
        No receivables found.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {receivables.map((receivable) => (
        <div key={receivable.id} className={`glass-card p-5 flex flex-col gap-3 transition-opacity ${receivable.status === 'Paid' ? 'opacity-50 hover:opacity-100' : ''}`}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="min-w-0">
                <p className="font-semibold text-sm leading-tight truncate">{receivable.name}</p>
                <p className="text-xs text-muted-foreground truncate">{receivable.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
                receivable.status === 'Paid'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-amber-500/15 text-amber-400'
              }`}>
                {receivable.status === 'Paid' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                {receivable.status}
              </span>
              <EditReceivableModal receivable={receivable} />
            </div>
          </div>

          {/* Amount */}
          <p className="text-2xl font-bold copper-text">{formatINR(receivable.amount)}</p>

          {/* Footer Metadata */}
          <div className="flex flex-col gap-2 border-t border-white/6 pt-3 mt-auto">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p>
                {receivable.due_date ? (
                  <>Due: {new Date(receivable.due_date).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}</>
                ) : (
                  <span className="opacity-50">No due date</span>
                )}
              </p>
              <div className="flex items-center gap-2">
                {receivable.phone_number && (
                  <a 
                    href={`https://wa.me/${receivable.phone_number.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors bg-green-400/10 px-2 py-1 rounded-md"
                  >
                    <MessageCircle size={12} />
                    <span>WhatsApp</span>
                  </a>
                )}
                {receivable.link && (
                  <a 
                    href={receivable.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors bg-blue-400/10 px-2 py-1 rounded-md"
                  >
                    <ExternalLink size={12} />
                    <span>Link</span>
                  </a>
                )}
              </div>
            </div>
            {receivable.notes && (
              <p className="text-xs italic text-muted-foreground opacity-80 truncate" title={receivable.notes}>
                "{receivable.notes}"
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
