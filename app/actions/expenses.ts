'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { resolveLenderDomain } from '@/lib/lenders'

export type CreateExpenseData = {
  description: string
  amount: number
  category?: string
  date?: string | null
  vendor_name?: string | null
  vendor_logo_domain?: string | null
}

export type UpdateExpenseData = Partial<CreateExpenseData> & { id: string }

export async function createExpense(data: CreateExpenseData) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Resolve vendor domain at creation time
  const vendor_logo_domain = data.vendor_name
    ? resolveLenderDomain(data.vendor_name)
    : null

  const { error } = await supabase.from('expenses').insert({
    ...data,
    user_id: user.id,
    vendor_logo_domain: vendor_logo_domain ?? undefined,
  })

  if (error) {
    console.error('Error creating expense:', error)
    throw new Error('Failed to create expense')
  }

  revalidatePath('/')
}

export async function getExpenses() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching expenses:', error)
    throw new Error('Failed to fetch expenses')
  }

  return expenses
}

export async function updateExpense(data: UpdateExpenseData) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { id, ...updateFields } = data

  // Re-resolve domain if vendor_name is being updated
  const vendor_logo_domain = updateFields.vendor_name !== undefined
    ? (resolveLenderDomain(updateFields.vendor_name ?? '') ?? undefined)
    : undefined

  const { error } = await supabase
    .from('expenses')
    .update({ ...updateFields, ...(vendor_logo_domain !== undefined ? { vendor_logo_domain } : {}) })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating expense:', error)
    throw new Error('Failed to update expense')
  }

  revalidatePath('/')
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting expense:', error)
    throw new Error('Failed to delete expense')
  }

  revalidatePath('/')
}
