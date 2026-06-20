import { supabase } from '@/lib/supabase'
import type { Patient } from '@/types/app'
import type { PatientFormData } from '@/schemas/patient.schema'

export async function getPatients() {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .is('deleted_at', null)
    .order('full_name')
  if (error) throw error
  return data as Patient[]
}

export async function createPatient(form: PatientFormData) {
  const { data, error } = await supabase
    .from('patients')
    .insert({
      full_name: form.full_name,
      phone: form.phone || null,
      coverage: form.coverage || null,
      notes: form.notes || null,
    })
    .select()
    .single()
  if (error) throw error
  return data as Patient
}

export async function updatePatient(id: string, form: PatientFormData) {
  const { data, error } = await supabase
    .from('patients')
    .update({
      full_name: form.full_name,
      phone: form.phone || null,
      coverage: form.coverage || null,
      notes: form.notes || null,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Patient
}

export async function deletePatient(id: string) {
  const { error } = await supabase
    .from('patients')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
