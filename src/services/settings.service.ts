import { supabase } from '@/lib/supabase'
import type { AppSettings } from '@/types/app'

export async function getSettings(): Promise<AppSettings> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
  if (error) throw error

  const map: Record<string, unknown> = {}
  for (const row of data) {
    map[row.key] = row.value
  }

  return {
    operating_hours: (map['operating_hours'] as AppSettings['operating_hours']) ?? { start: '08:00', end: '20:00' },
    business_name: (map['business_name'] as string) ?? 'Espacio Salud',
  }
}

export async function updateOperatingHours(start: string, end: string) {
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'operating_hours', value: { start, end } })
  if (error) throw error
}

export async function updateBusinessName(name: string) {
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'business_name', value: name })
  if (error) throw error
}
