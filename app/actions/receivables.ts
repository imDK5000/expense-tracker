'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type CreateReceivableData = {
  name: string
  amount: number
  type: string
  link?: string | null
  due_date?: string | null
  status?: string
  notes?: string | null
  phone_number?: string | null
}

export type UpdateReceivableData = Partial<CreateReceivableData> & { id: string }

export async function createReceivable(data: CreateReceivableData) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase.from('receivables').insert({
    ...data,
    user_id: user.id
  })

  if (error) {
    console.error('Error creating receivable:', error)
    throw new Error('Failed to create receivable')
  }

  revalidatePath('/')
}

export async function getReceivables() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: receivables, error } = await supabase
    .from('receivables')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    if (error.code === '42P01') {
      console.warn('Receivables table does not exist yet. Please run the SQL migration.')
      return []
    }
    console.error('Error fetching receivables:', error)
    throw new Error('Failed to fetch receivables')
  }

  return receivables
}

export async function updateReceivable(data: UpdateReceivableData) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { id, ...updateFields } = data

  const { error } = await supabase
    .from('receivables')
    .update(updateFields)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating receivable:', error)
    throw new Error('Failed to update receivable')
  }

  revalidatePath('/')
}

export async function deleteReceivable(id: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('receivables')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting receivable:', error)
    throw new Error('Failed to delete receivable')
  }

  revalidatePath('/')
}
