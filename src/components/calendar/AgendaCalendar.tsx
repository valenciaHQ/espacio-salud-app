import FullCalendar from '@fullcalendar/react'
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DateSelectArg, EventClickArg, DatesSetArg, EventContentArg } from '@fullcalendar/core'
import { AppointmentEvent } from './AppointmentEvent'
import type { Consultorio } from '@/types/app'
import type { AppointmentWithRelations } from '@/types/app'

interface Props {
  consultorios: Consultorio[]
  appointments: AppointmentWithRelations[]
  slotMinTime: string
  slotMaxTime: string
  onSelectSlot: (start: Date, consultorioId: string) => void
  onEventClick: (appointment: AppointmentWithRelations) => void
  onDatesChange: (start: Date, end: Date) => void
}

export function AgendaCalendar({
  consultorios,
  appointments,
  slotMinTime,
  slotMaxTime,
  onSelectSlot,
  onEventClick,
  onDatesChange,
}: Props) {
  const resources = consultorios.map((c) => ({
    id: c.id,
    title: c.name,
    eventColor: c.color,
  }))

  const events = appointments.map((a) => ({
    id: a.id,
    resourceId: a.consultorio_id,
    start: a.start_time,
    end: a.end_time,
    backgroundColor: a.type === 'derivacion' ? '#3b82f6' : '#f59e0b',
    borderColor: 'transparent',
    extendedProps: { appointment: a },
  }))

  const handleSelect = (arg: DateSelectArg) => {
    const consultorioId = arg.resource?.id ?? ''
    onSelectSlot(arg.start, consultorioId)
  }

  const handleEventClick = (arg: EventClickArg) => {
    const appointment = arg.event.extendedProps.appointment as AppointmentWithRelations
    onEventClick(appointment)
  }

  const handleDatesSet = (arg: DatesSetArg) => {
    onDatesChange(arg.start, arg.end)
  }

  const renderEvent = (info: EventContentArg) => <AppointmentEvent eventInfo={info} />

  return (
    <div className="h-full p-4">
      <FullCalendar
        plugins={[resourceTimeGridPlugin, interactionPlugin]}
        initialView="resourceTimeGridDay"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'resourceTimeGridDay,resourceTimeGridWeek',
        }}
        buttonText={{
          today: 'Hoy',
          day: 'Día',
          week: 'Semana',
        }}
        resources={resources}
        events={events}
        slotMinTime={slotMinTime}
        slotMaxTime={slotMaxTime}
        slotDuration="00:30:00"
        selectable
        selectMirror
        select={handleSelect}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        eventContent={renderEvent}
        height="100%"
        allDaySlot={false}
        locale="es"
        firstDay={1}
        nowIndicator
        resourceOrder="position"
      />
    </div>
  )
}
