import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConsultorios, updateConsultorio } from '@/services/consultorios.service'

export function useConsultorios() {
  return useQuery({
    queryKey: ['consultorios'],
    queryFn: getConsultorios,
    staleTime: Infinity,
  })
}

export function useUpdateConsultorio() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { name?: string; color?: string } }) =>
      updateConsultorio(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['consultorios'] }),
  })
}
