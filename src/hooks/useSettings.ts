import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSettings, updateOperatingHours, updateBusinessName } from '@/services/settings.service'

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
    staleTime: Infinity,
  })
}

export function useUpdateOperatingHours() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ start, end }: { start: string; end: string }) =>
      updateOperatingHours(start, end),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  })
}

export function useUpdateBusinessName() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => updateBusinessName(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  })
}
