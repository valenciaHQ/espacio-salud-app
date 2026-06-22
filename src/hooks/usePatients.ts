import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from '@/services/patients.service'
import type { PatientFormData } from '@/schemas/patient.schema'
import { useGoogleSheets } from '@/context/GoogleSheetsContext'
import { syncPatient } from '@/lib/googleSheets'
import type { Patient } from '@/types/app'

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: getPatients,
  })
}

export function useCreatePatient() {
  const qc = useQueryClient()
  const { token } = useGoogleSheets()
  return useMutation({
    mutationFn: (data: PatientFormData) => createPatient(data),
    onSuccess: (patient) => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      if (token) syncPatient(token, patient, 'upsert').catch(console.warn)
    },
  })
}

export function useUpdatePatient() {
  const qc = useQueryClient()
  const { token } = useGoogleSheets()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatientFormData }) =>
      updatePatient(id, data),
    onSuccess: (patient) => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      if (token) syncPatient(token, patient, 'upsert').catch(console.warn)
    },
  })
}

export function useDeletePatient() {
  const qc = useQueryClient()
  const { token } = useGoogleSheets()
  return useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['patients'] })
      if (token) syncPatient(token, { id } as Patient, 'delete').catch(console.warn)
    },
  })
}
