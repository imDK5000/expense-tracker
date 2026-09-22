'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type CreateExpenseData = {
  description: string
  amount: number
  category?: string
  date: string // YYYY-MM-DD format
}

export type UpdateExpenseData = Partial<CreateExpenseData> & { id: string }

export async function createExpense(data: CreateExpenseData) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase.from('expenses').insert({
    ...data,
    user_id: user.id
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

  const { error } = await supabase
    .from('expenses')
    .update(updateFields)
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
