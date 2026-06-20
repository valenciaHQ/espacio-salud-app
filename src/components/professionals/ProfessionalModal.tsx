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
import { professionalSchema, type ProfessionalFormData } from '@/schemas/professional.schema'
import { useCreateProfessional, useUpdateProfessional } from '@/hooks/useProfessionals'
import type { Professional } from '@/types/app'

interface Props {
  open: boolean
  onClose: () => void
  existing?: Professional
}

export function ProfessionalModal({ open, onClose, existing }: Props) {
  const create = useCreateProfessional()
  const update = useUpdateProfessional()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfessionalFormData>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      full_name: '',
      phone: '',
      email: '',
      specialty: '',
      license_num: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (existing) {
      reset({
        full_name: existing.full_name,
        phone: existing.phone ?? '',
        email: existing.email ?? '',
        specialty: existing.specialty ?? '',
        license_num: existing.license_num ?? '',
        notes: existing.notes ?? '',
      })
    } else {
      reset({ full_name: '', phone: '', email: '', specialty: '', license_num: '', notes: '' })
    }
  }, [existing, open, reset])

  const onSubmit = async (data: ProfessionalFormData) => {
    try {
      if (existing) {
        await update.mutateAsync({ id: existing.id, data })
        toast.success('Profesional actualizado')
      } else {
        await create.mutateAsync(data)
        toast.success('Profesional creado')
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
          <DialogTitle>{existing ? 'Editar profesional' : 'Nuevo profesional'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label>Nombre y apellido *</Label>
            <Input {...register('full_name')} placeholder="Ej: Dra. Ana García" />
            {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Teléfono</Label>
              <Input {...register('phone')} placeholder="+54 11 1234-5678" />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input {...register('email')} type="email" placeholder="ana@mail.com" />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Especialidad</Label>
              <Input {...register('specialty')} placeholder="Psicología clínica" />
            </div>
            <div className="space-y-1">
              <Label>Matrícula</Label>
              <Input {...register('license_num')} placeholder="MP 12345" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Notas</Label>
            <Textarea {...register('notes')} placeholder="Observaciones..." />
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
