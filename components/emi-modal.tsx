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
    
    try {
      await createEMI({
        name: formData.get("name") as string,
        monthly_amount: Number(formData.get("monthly_amount")),
        start_date: formData.get("start_date") as string,
        tenure_months: Number(formData.get("tenure_months")),
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
        Add EMI
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New EMI</DialogTitle>
          <DialogDescription>
            Enter the details for your new EMI below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">EMI Name</Label>
            <Input id="name" name="name" required placeholder="e.g. Car Loan" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="monthly_amount">Monthly Amount</Label>
            <Input id="monthly_amount" name="monthly_amount" type="number" step="0.01" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input id="start_date" name="start_date" type="date" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tenure_months">Tenure (Months)</Label>
            <Input id="tenure_months" name="tenure_months" type="number" required />
          </div>
          {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add EMI"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
