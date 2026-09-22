'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { resolveLenderDomain } from '@/lib/lenders'

export type CreateEMIData = {
  name: string
  principal_amount?: number
  monthly_amount: number
  start_date: string // YYYY-MM-DD format
  tenure_months: number
  interest_rate?: number
  notes?: string
  lender_name?: string
}

export type UpdateEMIData = Partial<CreateEMIData> & { id: string }

export async function createEMI(data: CreateEMIData) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Resolve lender domain at creation time so we don't re-resolve on every render
  const lender_logo_domain = data.lender_name
    ? resolveLenderDomain(data.lender_name)
    : null

  const { error } = await supabase.from('emis').insert({
    ...data,
    user_id: user.id,
    lender_logo_domain: lender_logo_domain ?? undefined,
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

  // Re-resolve domain if lender_name is being updated
  const lender_logo_domain = updateFields.lender_name !== undefined
    ? (resolveLenderDomain(updateFields.lender_name ?? '') ?? undefined)
    : undefined

  const { error } = await supabase
    .from('emis')
    .update({ ...updateFields, ...(lender_logo_domain !== undefined ? { lender_logo_domain } : {}) })
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
