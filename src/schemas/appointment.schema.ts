import { z } from 'zod'

export const derivacionSchema = z.object({
  consultorio_id: z.string().uuid('Seleccioná un consultorio'),
  professional_id: z.string().uuid('Seleccioná un profesional'),
  patient_id: z.string().uuid('Seleccioná un paciente'),
  start_time: z.string().min(1, 'La fecha/hora es obligatoria'),
  payment_status: z.enum(['pending', 'paid']),
  notes: z.string().optional().or(z.literal('')),
})

export const alquilerSchema = z.object({
  consultorio_id: z.string().uuid('Seleccioná un consultorio'),
  professional_id: z.string().uuid('Seleccioná un profesional'),
  start_time: z.string().min(1, 'La fecha/hora es obligatoria'),
  rental_duration: z.enum(['1h', '4h', 'full_day']),
  payment_status: z.enum(['pending', 'paid']),
  notes: z.string().optional().or(z.literal('')),
})

export type DerivacionFormData = z.infer<typeof derivacionSchema>
export type AlquilerFormData = z.infer<typeof alquilerSchema>
