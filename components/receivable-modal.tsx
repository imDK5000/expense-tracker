"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createReceivable } from "@/app/actions/receivables"

export function ReceivableModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    
    try {
      const rawDate = formData.get("due_date") as string
      await createReceivable({
        name: formData.get("name") as string,
        amount: Number(formData.get("amount")),
        type: formData.get("type") as string || "Loan",
        link: (formData.get("link") as string) || undefined,
        due_date: rawDate ? rawDate : undefined,
        phone_number: (formData.get("phone_number") as string) || undefined,
      })
      setOpen(false)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        Add Receivable
      </DialogTrigger>
      <DialogContent className="glass-card border-white/10 dark:bg-[#181818]">
        <DialogHeader>
          <DialogTitle>Add Receivable</DialogTitle>
          <DialogDescription>
            Track money lent to friends or unpaid bills from customers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name / Client</Label>
            <Input id="name" name="name" required placeholder="e.g. John Doe, Acme Corp" className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" name="amount" type="number" step="0.01" required className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Type</Label>
            <Input id="type" name="type" required placeholder="e.g. Loan, Unpaid Bill" defaultValue="Unpaid Bill" className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="link">Invoice Link (Optional)</Label>
            <Input id="link" name="link" type="url" placeholder="e.g. Canva link" className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone_number">WhatsApp Number (Optional)</Label>
            <Input id="phone_number" name="phone_number" type="tel" placeholder="e.g. 919876543210" className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="due_date">Due Date (Optional)</Label>
            <Input id="due_date" name="due_date" type="date" className="dark:bg-white/5 dark:border-white/10" />
          </div>
          {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="dark:border-white/10 dark:hover:bg-white/5">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="copper-button">
              {loading ? "Adding..." : "Add Receivable"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
