export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      consultorios: {
        Row: {
          id: string
          name: string
          color: string
          position: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          position: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          position?: number
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      professionals: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          email: string | null
          specialty: string | null
          license_num: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          full_name: string
          phone?: string | null
          email?: string | null
          specialty?: string | null
          license_num?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          email?: string | null
          specialty?: string | null
          license_num?: string | null
          notes?: string | null
          is_active?: boolean
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          coverage: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          full_name: string
          phone?: string | null
          coverage?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          coverage?: string | null
          notes?: string | null
          is_active?: boolean
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          type: 'derivacion' | 'alquiler'
          consultorio_id: string
          start_time: string
          end_time: string
          payment_status: 'pending' | 'paid'
          amount: number | null
          notes: string | null
          patient_id: string | null
          professional_id: string | null
          rental_duration: '1h' | '4h' | 'full_day' | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          type: 'derivacion' | 'alquiler'
          consultorio_id: string
          start_time: string
          end_time: string
          payment_status?: 'pending' | 'paid'
          amount?: number | null
          notes?: string | null
          patient_id?: string | null
          professional_id?: string | null
          rental_duration?: '1h' | '4h' | 'full_day' | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          type?: 'derivacion' | 'alquiler'
          consultorio_id?: string
          start_time?: string
          end_time?: string
          payment_status?: 'pending' | 'paid'
          amount?: number | null
          notes?: string | null
          patient_id?: string | null
          professional_id?: string | null
          rental_duration?: '1h' | '4h' | 'full_day' | null
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_consultorio_id_fkey"
            columns: ["consultorio_id"]
            referencedRelation: "consultorios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          }
        ]
      }
      settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      appointment_type: 'derivacion' | 'alquiler'
      rental_duration: '1h' | '4h' | 'full_day'
      payment_status: 'pending' | 'paid'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
