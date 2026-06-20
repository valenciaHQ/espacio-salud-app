import { z } from 'zod'

export const professionalSchema = z.object({
  full_name: z.string().min(1, 'El nombre es obligatorio'),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  specialty: z.string().optional().or(z.literal('')),
  license_num: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

export type ProfessionalFormData = z.infer<typeof professionalSchema>
