'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Program = {
  id: string
  user_id: string
  name: string
  start_date: string
  end_date: string | null
  is_active: boolean
  created_at: string
}

export async function getPrograms(): Promise<Program[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

export async function getActiveProgram(): Promise<Program | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('programs')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  return data ?? null
}

export async function createProgram(name: string, startDate?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Désactiver l'éventuel programme actif
  await supabase
    .from('programs')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('is_active', true)

  const { error } = await supabase
    .from('programs')
    .insert({
      user_id: user.id,
      name: name.trim(),
      start_date: startDate ?? new Date().toISOString().split('T')[0],
      is_active: true,
    })

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/history')
  return { success: true }
}

export async function setActiveProgram(programId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  // Désactiver tous
  await supabase
    .from('programs')
    .update({ is_active: false })
    .eq('user_id', user.id)

  // Activer le sélectionné
  const { error } = await supabase
    .from('programs')
    .update({ is_active: true, end_date: null })
    .eq('id', programId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/history')
  return { success: true }
}

export async function endProgram(programId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .from('programs')
    .update({
      is_active: false,
      end_date: new Date().toISOString().split('T')[0],
    })
    .eq('id', programId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/history')
  return { success: true }
}

export async function deleteProgram(programId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non authentifié' }

  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', programId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/history')
  return { success: true }
}
