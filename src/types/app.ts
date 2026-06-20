import type { Database } from './database'

export type Consultorio = Database['public']['Tables']['consultorios']['Row']
export type Professional = Database['public']['Tables']['professionals']['Row']
export type Patient = Database['public']['Tables']['patients']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert']
export type AppointmentUpdate = Database['public']['Tables']['appointments']['Update']

export type AppointmentWithRelations = Appointment & {
  consultorio: Consultorio
  professional: Professional | null
  patient: Patient | null
}

export type OperatingHours = {
  start: string
  end: string
}

export type AppSettings = {
  operating_hours: OperatingHours
  business_name: string
}
