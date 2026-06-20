import type { EventContentArg } from '@fullcalendar/core'
import type { AppointmentWithRelations } from '@/types/app'

interface Props {
  eventInfo: EventContentArg
}

export function AppointmentEvent({ eventInfo }: Props) {
  const appointment = eventInfo.event.extendedProps.appointment as AppointmentWithRelations
  const isPaid = appointment.payment_status === 'paid'

  return (
    <div className="flex flex-col h-full overflow-hidden px-1 py-0.5">
      <div className="flex items-center gap-1 min-w-0">
        <span
          className="inline-block h-2 w-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: isPaid ? '#22c55e' : '#f97316' }}
        />
        <span className="text-xs font-semibold truncate text-white">
          {appointment.type === 'derivacion'
            ? appointment.patient?.full_name ?? 'Paciente'
            : appointment.professional?.full_name ?? 'Profesional'}
        </span>
      </div>
      {appointment.type === 'derivacion' && appointment.professional && (
        <span className="text-xs text-white/80 truncate">
          {appointment.professional.full_name}
        </span>
      )}
      {appointment.type === 'alquiler' && (
        <span className="text-xs text-white/80">
          {appointment.rental_duration === '1h' && '1h'}
          {appointment.rental_duration === '4h' && 'Módulo'}
          {appointment.rental_duration === 'full_day' && 'Día completo'}
        </span>
      )}
    </div>
  )
}
