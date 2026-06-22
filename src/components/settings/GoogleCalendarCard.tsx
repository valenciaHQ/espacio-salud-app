import { useState } from 'react'
import { toast } from 'sonner'
import { Calendar, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useGoogleCalendar } from '@/context/GoogleCalendarContext'
import { listCalendars, listCalendarEvents, type GCalCalendar, type GCalEvent } from '@/lib/googleCalendar'
import { useConsultorios } from '@/hooks/useConsultorios'
import { supabase } from '@/lib/supabase'

const HAS_CLIENT_ID = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

function formatEventTime(e: GCalEvent): string {
  if (!e.start.dateTime) return 'Evento de día completo'
  const start = new Date(e.start.dateTime)
  const end = new Date(e.end.dateTime!)
  return `${format(start, "d MMM, HH:mm", { locale: es })} → ${format(end, "HH:mm")}`
}

export function GoogleCalendarCard() {
  const { token, isConnected, connect, disconnect } = useGoogleCalendar()
  const { data: consultorios = [] } = useConsultorios()

  const [calendars, setCalendars] = useState<GCalCalendar[]>([])
  const [calendarId, setCalendarId] = useState('')
  const [dateFrom, setDateFrom] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [dateTo, setDateTo] = useState(format(new Date(Date.now() + 30 * 86400_000), 'yyyy-MM-dd'))
  const [consultorioId, setConsultorioId] = useState('')
  const [events, setEvents] = useState<GCalEvent[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [calendarsLoaded, setCalendarsLoaded] = useState(false)

  const handleLoadCalendars = async () => {
    if (!token) return
    setLoading(true)
    try {
      const cals = await listCalendars(token)
      setCalendars(cals)
      setCalendarsLoaded(true)
      if (cals.length > 0) setCalendarId(cals[0].id)
    } catch (err) {
      toast.error('Error al cargar calendarios: ' + (err instanceof Error ? err.message : 'desconocido'))
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = async () => {
    if (!token || !calendarId) return
    setLoading(true)
    try {
      const raw = await listCalendarEvents(
        token,
        calendarId,
        new Date(dateFrom).toISOString(),
        new Date(`${dateTo}T23:59:59`).toISOString(),
      )
      const timed = raw.filter((e) => !!e.start.dateTime)
      setEvents(timed)
      setSelected(new Set(timed.map((e) => e.id)))
    } catch (err) {
      toast.error('Error al cargar eventos: ' + (err instanceof Error ? err.message : 'desconocido'))
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!consultorioId) { toast.error('Seleccioná un consultorio destino'); return }
    const toImport = events.filter((e) => selected.has(e.id))
    if (toImport.length === 0) { toast.error('Seleccioná al menos un evento'); return }
    setImporting(true)
    try {
      const rows = toImport.map((e) => ({
        type: 'alquiler' as const,
        consultorio_id: consultorioId,
        start_time: e.start.dateTime!,
        end_time: e.end.dateTime!,
        payment_status: 'pending' as const,
        notes: [e.summary, e.description].filter(Boolean).join('\n') || null,
        rental_duration: null,
        professional_id: null,
        patient_id: null,
      }))
      const { error } = await supabase.from('appointments').insert(rows)
      if (error) throw error
      toast.success(`${toImport.length} turnos importados exitosamente`)
      setEvents([])
      setSelected(new Set())
    } catch (err) {
      toast.error('Error al importar: ' + (err instanceof Error ? err.message : 'desconocido'))
    } finally {
      setImporting(false)
    }
  }

  const toggleEvent = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allSelected = events.length > 0 && selected.size === events.length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Importar desde Google Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-500">
          Importá eventos de Google Calendar como turnos de alquiler en la agenda.
        </p>

        {!HAS_CLIENT_ID ? (
          <p className="text-sm text-amber-600 bg-amber-50 rounded-md px-3 py-2">
            Configurá <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> en Vercel para habilitar la importación.
          </p>
        ) : !isConnected ? (
          <Button onClick={connect}>
            Conectar Google Calendar
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              Conectado (expira en ~1 hora)
            </div>

            {!calendarsLoaded ? (
              <Button size="sm" onClick={handleLoadCalendars} disabled={loading}>
                {loading ? 'Cargando...' : 'Cargar mis calendarios'}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Calendario</Label>
                  <Select value={calendarId} onValueChange={setCalendarId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccioná un calendario" />
                    </SelectTrigger>
                    <SelectContent>
                      {calendars.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.summary}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Desde</Label>
                    <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Hasta</Label>
                    <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                  </div>
                </div>

                <Button size="sm" onClick={handlePreview} disabled={loading || !calendarId}>
                  {loading ? 'Cargando eventos...' : 'Ver eventos'}
                </Button>

                {events.length > 0 && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label>Consultorio destino</Label>
                      <Select value={consultorioId} onValueChange={setConsultorioId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccioná un consultorio" />
                        </SelectTrigger>
                        <SelectContent>
                          {consultorios.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-xs text-gray-500">
                          {events.length} eventos — {selected.size} seleccionados
                        </Label>
                        <button
                          type="button"
                          className="text-xs text-blue-500 hover:underline"
                          onClick={() =>
                            setSelected(allSelected ? new Set() : new Set(events.map((e) => e.id)))
                          }
                        >
                          {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                        </button>
                      </div>
                      <div className="max-h-56 overflow-y-auto rounded-md border border-gray-200 divide-y text-sm">
                        {events.map((e) => (
                          <label
                            key={e.id}
                            className="flex items-start gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={selected.has(e.id)}
                              onChange={() => toggleEvent(e.id)}
                              className="mt-0.5 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{e.summary}</p>
                              <p className="text-xs text-gray-500">{formatEventTime(e)}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={handleImport}
                      disabled={importing || selected.size === 0 || !consultorioId}
                    >
                      {importing ? 'Importando...' : `Importar ${selected.size} turno${selected.size !== 1 ? 's' : ''}`}
                    </Button>
                  </div>
                )}

                {events.length === 0 && calendarsLoaded && (
                  null
                )}

                <Button size="sm" variant="ghost" className="text-gray-400" onClick={disconnect}>
                  <LogOut className="h-4 w-4" />
                  Desconectar
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
