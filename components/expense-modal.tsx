"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createExpense } from "@/app/actions/expenses"

export function ExpenseModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    
    try {
      const rawDate = formData.get("date") as string
      await createExpense({
        description: formData.get("description") as string,
        amount: Number(formData.get("amount")),
        category: (formData.get("category") as string) || undefined,
        vendor_name: (formData.get("vendor_name") as string) || undefined,
        date: rawDate ? rawDate : undefined,
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
        Add Expense
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Enter the details for your new expense below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" required placeholder="e.g. Groceries" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" step="0.01" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Input id="category" name="category" placeholder="e.g. Food" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="vendor_name">Vendor / Payee (Optional)</Label>
            <Input id="vendor_name" name="vendor_name" placeholder="e.g. Amazon, Swiggy" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Date (Optional)</Label>
            <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
