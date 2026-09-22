"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createEMI } from "@/app/actions/emi"

export function EMIModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const lenderName = formData.get("lender_name") as string

    try {
      await createEMI({
        name: formData.get("name") as string,
        monthly_amount: Number(formData.get("monthly_amount")),
        start_date: formData.get("start_date") as string,
        tenure_months: Number(formData.get("tenure_months")),
        lender_name: lenderName || undefined,
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
      <DialogTrigger render={<Button className="copper-button" />}>
        Add EMI
      </DialogTrigger>
      <DialogContent className="glass-card border-white/10 dark:bg-[#181818]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Add New EMI</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Enter the details for your new EMI below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm font-medium">EMI Name</Label>
            <Input id="name" name="name" required placeholder="e.g. Car Loan" className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lender_name" className="text-sm font-medium">
              Lender / Vendor <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input id="lender_name" name="lender_name" placeholder="e.g. Moneyview, HDFC Bank" className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="monthly_amount" className="text-sm font-medium">Monthly Amount (₹)</Label>
            <Input id="monthly_amount" name="monthly_amount" type="number" step="1" required className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="start_date" className="text-sm font-medium">Start Date</Label>
            <Input id="start_date" name="start_date" type="date" required className="dark:bg-white/5 dark:border-white/10" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tenure_months" className="text-sm font-medium">Tenure (Months)</Label>
            <Input id="tenure_months" name="tenure_months" type="number" required className="dark:bg-white/5 dark:border-white/10" />
          </div>
          {error && <div className="text-sm text-red-400 font-medium bg-red-500/10 px-3 py-2 rounded-lg">{error}</div>}
          <DialogFooter className="mt-2 gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="dark:border-white/10 dark:hover:bg-white/5">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="copper-button">
              {loading ? "Adding..." : "Add EMI"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
