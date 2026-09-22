/**
 * Format a number as Indian Rupees using Indian digit grouping.
 * e.g. 120000 → ₹1,20,000
 */
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function formatINR(amount: number): string {
  return inrFormatter.format(amount)
}
