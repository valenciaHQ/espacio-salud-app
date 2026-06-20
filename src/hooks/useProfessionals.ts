import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProfessionals,
  createProfessional,
  updateProfessional,
  deleteProfessional,
} from '@/services/professionals.service'
import type { ProfessionalFormData } from '@/schemas/professional.schema'

export function useProfessionals() {
  return useQuery({
    queryKey: ['professionals'],
    queryFn: getProfessionals,
  })
}

export function useCreateProfessional() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProfessionalFormData) => createProfessional(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['professionals'] }),
  })
}

export function useUpdateProfessional() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProfessionalFormData }) =>
      updateProfessional(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['professionals'] }),
  })
}

export function useDeleteProfessional() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProfessional(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['professionals'] }),
  })
}
