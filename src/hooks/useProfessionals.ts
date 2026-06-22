import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProfessionals,
  createProfessional,
  updateProfessional,
  deleteProfessional,
} from '@/services/professionals.service'
import type { ProfessionalFormData } from '@/schemas/professional.schema'
import { useGoogleSheets } from '@/context/GoogleSheetsContext'
import { syncProfessional } from '@/lib/googleSheets'
import type { Professional } from '@/types/app'

export function useProfessionals() {
  return useQuery({
    queryKey: ['professionals'],
    queryFn: getProfessionals,
  })
}

export function useCreateProfessional() {
  const qc = useQueryClient()
  const { token } = useGoogleSheets()
  return useMutation({
    mutationFn: (data: ProfessionalFormData) => createProfessional(data),
    onSuccess: (prof) => {
      qc.invalidateQueries({ queryKey: ['professionals'] })
      if (token) syncProfessional(token, prof, 'upsert').catch(console.warn)
    },
  })
}

export function useUpdateProfessional() {
  const qc = useQueryClient()
  const { token } = useGoogleSheets()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProfessionalFormData }) =>
      updateProfessional(id, data),
    onSuccess: (prof) => {
      qc.invalidateQueries({ queryKey: ['professionals'] })
      if (token) syncProfessional(token, prof, 'upsert').catch(console.warn)
    },
  })
}

export function useDeleteProfessional() {
  const qc = useQueryClient()
  const { token } = useGoogleSheets()
  return useMutation({
    mutationFn: (id: string) => deleteProfessional(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['professionals'] })
      if (token) syncProfessional(token, { id } as Professional, 'delete').catch(console.warn)
    },
  })
}
