import { addMinutes, addHours, parseISO, format, startOfDay, endOfDay } from 'date-fns'
import { supabase } from '@/lib/supabase'
import type { AppointmentWithRelations } from '@/types/app'
import type { DerivacionFormData, AlquilerFormData } from '@/schemas/appointment.schema'

function computeEndTime(startIso: string, duration: '1h' | '4h' | 'full_day', dayEnd: string): string {
  const start = parseISO(startIso)
  if (duration === '1h') return addHours(start, 1).toISOString()
  if (duration === '4h') return addHours(start, 4).toISOString()
  // full_day: end at operating hours end
  const [h, m] = dayEnd.split(':').map(Number)
  const end = new Date(start)
  end.setHours(h, m, 0, 0)
  return end.toISOString()
}

export async function getAppointmentsInRange(start: Date, end: Date) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      consultorio:consultorios(*),
      professional:professionals(*),
      patient:patients(*)
    `)
    .is('deleted_at', null)
    .gte('start_time', start.toISOString())
    .lte('end_time', end.toISOString())
  if (error) throw error
  return data as AppointmentWithRelations[]
}

export async function createDerivacion(form: DerivacionFormData) {
  const startDate = parseISO(form.start_time)
  const endDate = addMinutes(startDate, 45)
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      type: 'derivacion',
      consultorio_id: form.consultorio_id,
      professional_id: form.professional_id,
      patient_id: form.patient_id,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      payment_status: form.payment_status,
      notes: form.notes || null,
      rental_duration: null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createAlquiler(form: AlquilerFormData, dayEnd: string) {
  const endTime = computeEndTime(form.start_time, form.rental_duration, dayEnd)
  const { data, error } = await supabase
    .from('appointments')
    .insert({
      type: 'alquiler',
      consultorio_id: form.consultorio_id,
      professional_id: form.professional_id,
      patient_id: null,
      start_time: parseISO(form.start_time).toISOString(),
      end_time: endTime,
      payment_status: form.payment_status,
      notes: form.notes || null,
      rental_duration: form.rental_duration,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAppointmentPayment(id: string, payment_status: 'pending' | 'paid') {
  const { data, error } = await supabase
    .from('appointments')
    .update({ payment_status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateDerivacion(id: string, form: DerivacionFormData) {
  const startDate = parseISO(form.start_time)
  const endDate = addMinutes(startDate, 45)
  const { data, error } = await supabase
    .from('appointments')
    .update({
      consultorio_id: form.consultorio_id,
      professional_id: form.professional_id,
      patient_id: form.patient_id,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      payment_status: form.payment_status,
      notes: form.notes || null,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAlquiler(id: string, form: AlquilerFormData, dayEnd: string) {
  const endTime = computeEndTime(form.start_time, form.rental_duration, dayEnd)
  const { data, error } = await supabase
    .from('appointments')
    .update({
      consultorio_id: form.consultorio_id,
      professional_id: form.professional_id,
      start_time: parseISO(form.start_time).toISOString(),
      end_time: endTime,
      payment_status: form.payment_status,
      notes: form.notes || null,
      rental_duration: form.rental_duration,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAppointment(id: string) {
  const { error } = await supabase
    .from('appointments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export { format, startOfDay, endOfDay }
