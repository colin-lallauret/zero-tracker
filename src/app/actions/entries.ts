'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { type EntryInsert } from '@/lib/types'

export async function getEntries(limit = 30) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(limit)

  if (error) return []
  return data
}

export async function getTodayEntry() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  return data
}

export async function upsertEntry(entry: Partial<EntryInsert> & { date: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Auto-assign active program if no program_id provided
  let program_id = entry.program_id ?? null
  if (!program_id) {
    const { data: activeProgram } = await supabase
      .from('programs')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
    program_id = activeProgram?.id ?? null
  }

  const { error } = await supabase
    .from('entries')
    .upsert(
      { ...entry, program_id, user_id: user.id },
      { onConflict: 'user_id,date' }
    )

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/history')
  return { success: true }
}

export async function deleteEntry(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/history')
  return { success: true }
}

export async function uploadPhoto(formData: FormData): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const file = formData.get('file') as File
  if (!file) return null

  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${user.id}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from('progress-photos')
    .upload(filename, file, { upsert: true })

  if (error) return null

  const { data: urlData } = supabase.storage
    .from('progress-photos')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}
