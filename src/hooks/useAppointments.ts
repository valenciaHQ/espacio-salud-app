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

export function useAppointments(range: { start: Date; end: Date }) {
  return useQuery({
    queryKey: ['appointments', range.start.toISOString(), range.end.toISOString()],
    queryFn: () => getAppointmentsInRange(range.start, range.end),
    enabled: !!range.start && !!range.end,
  })
}

export function useCreateDerivacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: DerivacionFormData) => createDerivacion(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useCreateAlquiler() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ data, dayEnd }: { data: AlquilerFormData; dayEnd: string }) =>
      createAlquiler(data, dayEnd),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useUpdateDerivacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DerivacionFormData }) =>
      updateDerivacion(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useUpdateAlquiler() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data, dayEnd }: { id: string; data: AlquilerFormData; dayEnd: string }) =>
      updateAlquiler(id, data, dayEnd),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useUpdatePayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'pending' | 'paid' }) =>
      updateAppointmentPayment(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useDeleteAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
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
