import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { alquilerSchema, type AlquilerFormData } from '@/schemas/appointment.schema'
import { useConsultorios } from '@/hooks/useConsultorios'
import { useProfessionals } from '@/hooks/useProfessionals'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { AppointmentWithRelations } from '@/types/app'

interface Props {
  defaultStart?: Date
  defaultConsultorioId?: string
  existing?: AppointmentWithRelations
  onSubmit: (data: AlquilerFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

function toLocalDateTimeInput(date: Date): string {
  return format(date, "yyyy-MM-dd'T'HH:mm")
}


export function AlquilerForm({ defaultStart, defaultConsultorioId, existing, onSubmit, onCancel, isLoading }: Props) {
  const { data: consultorios = [] } = useConsultorios()
  const { data: professionals = [] } = useProfessionals()

  const defaultValues: Partial<AlquilerFormData> = existing
    ? {
        consultorio_id: existing.consultorio_id,
        professional_id: existing.professional_id ?? undefined,
        start_time: toLocalDateTimeInput(new Date(existing.start_time)),
        rental_duration: existing.rental_duration ?? '1h',
        payment_status: existing.payment_status,
        notes: existing.notes ?? '',
      }
    : {
        consultorio_id: defaultConsultorioId ?? '',
        start_time: defaultStart ? toLocalDateTimeInput(defaultStart) : '',
        rental_duration: '1h',
        payment_status: 'pending',
        notes: '',
      }

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AlquilerFormData>({
    resolver: zodResolver(alquilerSchema),
    defaultValues: defaultValues as AlquilerFormData,
  })

  const selectedConsultorioId = watch('consultorio_id')
  const selectedProfessionalId = watch('professional_id')
  const selectedDuration = watch('rental_duration')
  const selectedPayment = watch('payment_status')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Consultorio</Label>
          <Select value={selectedConsultorioId} onValueChange={(v) => setValue('consultorio_id', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccioná un consultorio" />
            </SelectTrigger>
            <SelectContent>
              {consultorios.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.consultorio_id && <p className="text-xs text-red-500">{errors.consultorio_id.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Fecha y hora de inicio</Label>
          <Input type="datetime-local" {...register('start_time')} />
          {errors.start_time && <p className="text-xs text-red-500">{errors.start_time.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <Label>Psicólogo/a</Label>
        <Select value={selectedProfessionalId} onValueChange={(v) => setValue('professional_id', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccioná un profesional" />
          </SelectTrigger>
          <SelectContent>
            {professionals.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.professional_id && <p className="text-xs text-red-500">{errors.professional_id.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>Duración del alquiler</Label>
        <Select value={selectedDuration} onValueChange={(v) => setValue('rental_duration', v as AlquilerFormData['rental_duration'])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">1 hora</SelectItem>
            <SelectItem value="4h">Módulo (4 horas)</SelectItem>
            <SelectItem value="full_day">Día completo</SelectItem>
          </SelectContent>
        </Select>
        {errors.rental_duration && <p className="text-xs text-red-500">{errors.rental_duration.message}</p>}
        {selectedDuration && (
          <p className="text-xs text-gray-400">
            {selectedDuration === '1h' && 'El alquiler dura 1 hora desde el horario seleccionado.'}
            {selectedDuration === '4h' && 'El alquiler dura 4 horas (módulo) desde el horario seleccionado.'}
            {selectedDuration === 'full_day' && 'El alquiler ocupa el consultorio hasta el cierre del espacio.'}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Estado de pago</Label>
        <Select value={selectedPayment} onValueChange={(v) => setValue('payment_status', v as 'pending' | 'paid')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="paid">Pagado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Notas (opcional)</Label>
        <Textarea placeholder="Observaciones del alquiler..." {...register('notes')} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : existing ? 'Guardar cambios' : 'Crear alquiler'}
        </Button>
      </div>
    </form>
  )
}
