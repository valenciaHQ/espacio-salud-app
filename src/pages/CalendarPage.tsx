import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AgendaCalendar } from '@/components/calendar/AgendaCalendar'
import { AppointmentModal } from '@/components/appointments/AppointmentModal'
import { Button } from '@/components/ui/button'
import { useConsultorios } from '@/hooks/useConsultorios'
import { useAppointments, useCalendarRange } from '@/hooks/useAppointments'
import { useSettings } from '@/hooks/useSettings'
import type { AppointmentWithRelations } from '@/types/app'

export function CalendarPage() {
  const { range, setRange } = useCalendarRange()
  const { data: consultorios = [] } = useConsultorios()
  const { data: appointments = [], isFetching } = useAppointments(range)
  const { data: settings } = useSettings()

  const [modalOpen, setModalOpen] = useState(false)
  const [defaultStart, setDefaultStart] = useState<Date | undefined>()
  const [defaultConsultorioId, setDefaultConsultorioId] = useState<string | undefined>()
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithRelations | undefined>()

  const handleSelectSlot = (start: Date, consultorioId: string) => {
    setDefaultStart(start)
    setDefaultConsultorioId(consultorioId || undefined)
    setSelectedAppointment(undefined)
    setModalOpen(true)
  }

  const handleEventClick = (appointment: AppointmentWithRelations) => {
    setSelectedAppointment(appointment)
    setDefaultStart(undefined)
    setDefaultConsultorioId(undefined)
    setModalOpen(true)
  }

  const handleNewClick = () => {
    setDefaultStart(new Date())
    setDefaultConsultorioId(undefined)
    setSelectedAppointment(undefined)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setSelectedAppointment(undefined)
    setDefaultStart(undefined)
    setDefaultConsultorioId(undefined)
  }

  const slotMin = settings?.operating_hours.start ?? '08:00'
  const slotMax = settings?.operating_hours.end ?? '20:00'

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2 sm:px-6 sm:py-3">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold text-gray-900 sm:text-lg">Agenda</h1>
          {isFetching && (
            <span className="text-xs text-gray-400">Actualizando...</span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              Derivación
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              Alquiler
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              Pagado
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
              Pendiente
            </span>
          </div>
          <Button size="sm" onClick={handleNewClick}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo turno</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <AgendaCalendar
          consultorios={consultorios}
          appointments={appointments}
          slotMinTime={slotMin}
          slotMaxTime={slotMax}
          onSelectSlot={handleSelectSlot}
          onEventClick={handleEventClick}
          onDatesChange={(start, end) => setRange({ start, end })}
        />
      </div>

      <AppointmentModal
        open={modalOpen}
        onClose={handleClose}
        defaultStart={defaultStart}
        defaultConsultorioId={defaultConsultorioId}
        existing={selectedAppointment}
      />
    </div>
  )
}
