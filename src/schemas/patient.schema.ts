import { z } from 'zod'

export const patientSchema = z.object({
  full_name: z.string().min(1, 'El nombre es obligatorio'),
  phone: z.string().optional().or(z.literal('')),
  coverage: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export type PatientFormData = z.infer<typeof patientSchema>
