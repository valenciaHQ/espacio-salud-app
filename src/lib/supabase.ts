import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://omqsluchjgoxkqbqfstt.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcXNsdWNoamdveGtxYnFmc3R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5OTM5NDgsImV4cCI6MjA5NTU2OTk0OH0.A9jF9qVL7KafGWLI3t0ZO81qdKaShXaALX27xRT18K0'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
