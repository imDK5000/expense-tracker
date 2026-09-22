'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type CreateEMIData = {
  name: string
  principal_amount?: number
  monthly_amount: number
  start_date: string // YYYY-MM-DD format
  tenure_months: number
  interest_rate?: number
  notes?: string
}

export type UpdateEMIData = Partial<CreateEMIData> & { id: string }

export async function createEMI(data: CreateEMIData) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase.from('emis').insert({
    ...data,
    user_id: user.id
  })

  if (error) {
    console.error('Error creating EMI:', error)
    throw new Error('Failed to create EMI')
  }

  revalidatePath('/')
}

export async function getEMIs() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: emis, error } = await supabase
    .from('emis')
    .select('*')

  if (error) {
    console.error('Error fetching EMIs:', error)
    throw new Error('Failed to fetch EMIs')
  }

  return emis
}

export async function updateEMI(data: UpdateEMIData) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { id, ...updateFields } = data

  const { error } = await supabase
    .from('emis')
    .update(updateFields)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error updating EMI:', error)
    throw new Error('Failed to update EMI')
  }

  revalidatePath('/')
}

export async function deleteEMI(id: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('emis')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting EMI:', error)
    throw new Error('Failed to delete EMI')
  }

  revalidatePath('/')
}
