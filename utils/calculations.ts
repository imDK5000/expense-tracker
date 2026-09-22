type EMI = {
  monthly_amount: number
  start_date: string
  tenure_months: number
}

type Expense = {
  amount: number
  date: string
}

export function calculateMonthlyOutgo(emis: EMI[], expenses: Expense[], targetDate = new Date()) {
  const currentYear = targetDate.getFullYear()
  const currentMonth = targetDate.getMonth()

  // 1. Calculate EMI total for the current month
  let totalEMI = 0
  for (const emi of emis) {
    const startDate = new Date(emi.start_date)
    const endDate = new Date(emi.start_date)
    endDate.setMonth(endDate.getMonth() + emi.tenure_months)

    const startAbsoluteMonths = startDate.getFullYear() * 12 + startDate.getMonth()
    const endAbsoluteMonths = endDate.getFullYear() * 12 + endDate.getMonth()
    const currentAbsoluteMonths = currentYear * 12 + currentMonth

    if (currentAbsoluteMonths >= startAbsoluteMonths && currentAbsoluteMonths < endAbsoluteMonths) {
      totalEMI += Number(emi.monthly_amount)
    }
  }

  // 2. Calculate Expense total for the current month
  let totalExpense = 0
  for (const expense of expenses) {
    const expenseDate = new Date(expense.date)
    if (expenseDate.getFullYear() === currentYear && expenseDate.getMonth() === currentMonth) {
      totalExpense += Number(expense.amount)
    }
  }

  return {
    totalEMI,
    totalExpense,
    totalOutgo: totalEMI + totalExpense
  }
}
