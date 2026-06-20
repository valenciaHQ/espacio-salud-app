import { supabase } from '@/lib/supabase'
import type { Consultorio } from '@/types/app'

export async function getConsultorios() {
  const { data, error } = await supabase
    .from('consultorios')
    .select('*')
    .eq('is_active', true)
    .order('position')
  if (error) throw error
  return data as Consultorio[]
}

export async function updateConsultorio(id: string, updates: Partial<Pick<Consultorio, 'name' | 'color'>>) {
  const { data, error } = await supabase
    .from('consultorios')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Consultorio
}
