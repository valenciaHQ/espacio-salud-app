import { useState } from 'react'
import { toast } from 'sonner'
import { Download, Upload, LogOut, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGoogleSheets } from '@/context/GoogleSheetsContext'
import {
  initSheets,
  exportProfessionals,
  exportPatients,
  exportAppointments,
  importProfessionalsFromSheet,
  importPatientsFromSheet,
  type AppointmentSyncData,
} from '@/lib/googleSheets'
import { useProfessionals } from '@/hooks/useProfessionals'
import { usePatients } from '@/hooks/usePatients'
import { supabase } from '@/lib/supabase'

const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1Mcg7IK2nJqvFT1iL7dQUcWMQHVdLrENdJPKr9IOyvJ4'
const HAS_CLIENT_ID = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

export function GoogleSheetsCard() {
  const { token, isConnected, connect, disconnect } = useGoogleSheets()
  const { data: professionals = [], refetch: refetchProfessionals } = useProfessionals()
  const { data: patients = [], refetch: refetchPatients } = usePatients()
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)

  const handleExport = async () => {
    if (!token) return
    setExporting(true)
    try {
      await initSheets(token)

      const { data: appts } = await supabase
        .from('appointments')
        .select('*, consultorio:consultorios(*), professional:professionals(*), patient:patients(*)')
        .is('deleted_at', null)
        .order('start_time')

      const appointmentRows: AppointmentSyncData[] = (appts ?? []).map((a) => ({
        id: a.id as string,
        type: a.type as 'derivacion' | 'alquiler',
        start_time: a.start_time as string,
        end_time: a.end_time as string,
        consultorio_name: (a.consultorio as { name: string } | null)?.name ?? '',
        professional_name: (a.professional as { full_name: string } | null)?.full_name ?? '',
        patient_name: (a.patient as { full_name: string } | null)?.full_name ?? '',
        payment_status: a.payment_status as 'pending' | 'paid',
        rental_duration: a.rental_duration as string | null,
        notes: a.notes as string | null,
      }))

      await Promise.all([
        exportProfessionals(token, professionals),
        exportPatients(token, patients),
        exportAppointments(token, appointmentRows),
      ])

      toast.success(`Exportado: ${professionals.length} profesionales, ${patients.length} pacientes, ${appointmentRows.length} turnos`)
    } catch (err) {
      toast.error('Error al exportar: ' + (err instanceof Error ? err.message : 'desconocido'))
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async () => {
    if (!token) return
    setImporting(true)
    try {
      const [sheetProfs, sheetPats] = await Promise.all([
        importProfessionalsFromSheet(token),
        importPatientsFromSheet(token),
      ])

      for (const p of sheetProfs) {
        await supabase.from('professionals').upsert(
          { id: p.id, full_name: p.full_name, phone: p.phone || null, email: p.email || null, specialty: p.specialty || null, license_num: p.license_num || null, notes: p.notes || null },
          { onConflict: 'id' },
        )
      }

      for (const p of sheetPats) {
        await supabase.from('patients').upsert(
          { id: p.id, full_name: p.full_name, phone: p.phone || null, coverage: p.coverage || null, notes: p.notes || null },
          { onConflict: 'id' },
        )
      }

      await Promise.all([refetchProfessionals(), refetchPatients()])
      toast.success(`Importados: ${sheetProfs.length} profesionales, ${sheetPats.length} pacientes`)
    } catch (err) {
      toast.error('Error al importar: ' + (err instanceof Error ? err.message : 'desconocido'))
    } finally {
      setImporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Google Sheets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-500">
          Sincronizá con tu planilla. Se crean las pestañas{' '}
          <strong>App-Turnos</strong>, <strong>App-Profesionales</strong> y{' '}
          <strong>App-Pacientes</strong> en tu spreadsheet existente.
        </p>

        {!HAS_CLIENT_ID ? (
          <p className="text-sm text-amber-600 bg-amber-50 rounded-md px-3 py-2">
            Configurá <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> en Vercel para habilitar la sincronización.
          </p>
        ) : !isConnected ? (
          <Button onClick={connect}>
            Conectar con Google
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              Conectado (expira en ~1 hora)
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleExport} disabled={exporting}>
                <Download className="h-4 w-4" />
                {exporting ? 'Exportando...' : 'Exportar todo a Sheets'}
              </Button>
              <Button size="sm" variant="outline" onClick={handleImport} disabled={importing}>
                <Upload className="h-4 w-4" />
                {importing ? 'Importando...' : 'Importar desde Sheets'}
              </Button>
              <Button size="sm" variant="ghost" className="text-gray-400" onClick={disconnect}>
                <LogOut className="h-4 w-4" />
                Desconectar
              </Button>
            </div>
          </div>
        )}

        <a
          href={SPREADSHEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-500 hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Ver planilla en Google Drive
        </a>
      </CardContent>
    </Card>
  )
}
