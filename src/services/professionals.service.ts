import { supabase } from '@/lib/supabase'
import type { Professional } from '@/types/app'
import type { ProfessionalFormData } from '@/schemas/professional.schema'

export async function getProfessionals() {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .is('deleted_at', null)
    .order('full_name')
  if (error) throw error
  return data as Professional[]
}

export async function createProfessional(form: ProfessionalFormData) {
  const { data, error } = await supabase
    .from('professionals')
    .insert({
      full_name: form.full_name,
      phone: form.phone || null,
      email: form.email || null,
      specialty: form.specialty || null,
      license_num: form.license_num || null,
      notes: form.notes || null,
    })
    .select()
    .single()
  if (error) throw error
  return data as Professional
}

export async function updateProfessional(id: string, form: ProfessionalFormData) {
  const { data, error } = await supabase
    .from('professionals')
    .update({
      full_name: form.full_name,
      phone: form.phone || null,
      email: form.email || null,
      specialty: form.specialty || null,
      license_num: form.license_num || null,
      notes: form.notes || null,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Professional
}

export async function deleteProfessional(id: string) {
  const { error } = await supabase
    .from('professionals')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
