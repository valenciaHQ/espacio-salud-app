import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAppointmentsInRange,
  createDerivacion,
  createAlquiler,
  updateDerivacion,
  updateAlquiler,
  updateAppointmentPayment,
  deleteAppointment,
} from '@/services/appointments.service'
import type { DerivacionFormData, AlquilerFormData } from '@/schemas/appointment.schema'
import { useGoogleSheets } from '@/context/GoogleSheetsContext'
import { syncAppointment, type AppointmentSyncData } from '@/lib/googleSheets'
import type { Professional, Patient, Consultorio, Appointment } from '@/types/app'

export function useAppointments(range: { start: Date; end: Date }) {
  return useQuery({
    queryKey: ['appointments', range.start.toISOString(), range.end.toISOString()],
    queryFn: () => getAppointmentsInRange(range.start, range.end),
    enabled: !!range.start && !!range.end,
  })
}

function buildSyncData(appt: Appointment, qc: ReturnType<typeof useQueryClient>): AppointmentSyncData {
  const profs = qc.getQueryData<Professional[]>(['professionals']) ?? []
  const pats = qc.getQueryData<Patient[]>(['patients']) ?? []
  const cons = qc.getQueryData<Consultorio[]>(['consultorios']) ?? []
  return {
    id: appt.id,
    type: appt.type,
    start_time: appt.start_time,
    end_time: appt.end_time,
    consultorio_name: cons.find((c) => c.id === appt.consultorio_id)?.name ?? '',
    professional_name: profs.find((p) => p.id === appt.professional_id)?.full_name ?? '',
    patient_name: pats.find((p) => p.id === appt.patient_id)?.full_name ?? '',
    payment_status: appt.payment_status,
    rental_duration: appt.rental_duration,
    notes: appt.notes,
  }
}

export function useCreateDerivacion() {
  const qc = useQueryClient()
  const { token } = useGoogleSheets()
  return useMutation({
    mutationFn: (data: DerivacionFormData) => createDerivacion(data),
    onSuccess: (appt) => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      if (token) syncAppointment(token, buildSyncData(appt, qc), 'upsert').catch(console.warn)
    },
  })
}

export function useCreateAlquiler() {
  const qc = useQueryClient()
  const { token } = useGoogleSheets()
  return useMutation({
    mutationFn: ({ data, dayEnd }: { data: AlquilerFormData; dayEnd: string }) =>
      createAlquiler(data, dayEnd),
    onSuccess: (appt) => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      if (token) syncAppointment(token, buildSyncData(appt, qc), 'upsert').catch(console.warn)
    },
  })
}

export function useUpdateDerivacion() {
  const qc = useQueryClient()
  const { token } = useGoogleSheets()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DerivacionFormData }) =>
      updateDerivacion(id, data),
    onSuccess: (appt) => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      if (token) syncAppointment(token, buildSyncData(appt, qc), 'upsert').catch(console.warn)
    },
  })
}

export function useUpdateAlquiler() {
  const qc = useQueryClient()
  const { token } = useGoogleSheets()
  return useMutation({
    mutationFn: ({ id, data, dayEnd }: { id: string; data: AlquilerFormData; dayEnd: string }) =>
      updateAlquiler(id, data, dayEnd),
    onSuccess: (appt) => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      if (token) syncAppointment(token, buildSyncData(appt, qc), 'upsert').catch(console.warn)
    },
  })
}

export function useUpdatePayment() {
  const qc = useQueryClient()
  const { token } = useGoogleSheets()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'pending' | 'paid' }) =>
      updateAppointmentPayment(id, status),
    onSuccess: (appt) => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      if (token) syncAppointment(token, buildSyncData(appt, qc), 'upsert').catch(console.warn)
    },
  })
}

export function useDeleteAppointment() {
  const qc = useQueryClient()
  const { token } = useGoogleSheets()
  return useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
      if (token) {
        const stub: AppointmentSyncData = {
          id,
          type: 'derivacion',
          start_time: '',
          end_time: '',
          consultorio_name: '',
          professional_name: '',
          patient_name: '',
          payment_status: 'pending',
        }
        syncAppointment(token, stub, 'delete').catch(console.warn)
      }
    },
  })
}

export function useCalendarRange() {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const [range, setRange] = useState({ start: startOfWeek, end: endOfWeek })
  return { range, setRange }
}
