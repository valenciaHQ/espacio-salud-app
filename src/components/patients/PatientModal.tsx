import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { patientSchema, type PatientFormData } from '@/schemas/patient.schema'
import { useCreatePatient, useUpdatePatient } from '@/hooks/usePatients'
import type { Patient } from '@/types/app'

interface Props {
  open: boolean
  onClose: () => void
  existing?: Patient
}

export function PatientModal({ open, onClose, existing }: Props) {
  const create = useCreatePatient()
  const update = useUpdatePatient()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: { full_name: '', phone: '', coverage: '', notes: '' },
  })

  useEffect(() => {
    if (existing) {
      reset({
        full_name: existing.full_name,
        phone: existing.phone ?? '',
        coverage: existing.coverage ?? '',
        notes: existing.notes ?? '',
      })
    } else {
      reset({ full_name: '', phone: '', coverage: '', notes: '' })
    }
  }, [existing, open, reset])

  const onSubmit = async (data: PatientFormData) => {
    try {
      if (existing) {
        await update.mutateAsync({ id: existing.id, data })
        toast.success('Paciente actualizado')
      } else {
        await create.mutateAsync(data)
        toast.success('Paciente creado')
      }
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{existing ? 'Editar paciente' : 'Nuevo paciente'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label>Nombre y apellido *</Label>
            <Input {...register('full_name')} placeholder="Ej: Juan Pérez" />
            {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Teléfono</Label>
              <Input {...register('phone')} placeholder="+54 11 1234-5678" />
            </div>
            <div className="space-y-1">
              <Label>Obra social / cobertura</Label>
              <Input {...register('coverage')} placeholder="OSDE, Galeno, particular..." />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Notas</Label>
            <Textarea {...register('notes')} placeholder="Motivo de consulta, observaciones..." />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : existing ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
