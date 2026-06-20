import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from '@/services/patients.service'
import type { PatientFormData } from '@/schemas/patient.schema'

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: getPatients,
  })
}

export function useCreatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: PatientFormData) => createPatient(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}

export function useUpdatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatientFormData }) =>
      updatePatient(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}

export function useDeletePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}
