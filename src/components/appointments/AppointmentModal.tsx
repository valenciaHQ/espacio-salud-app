import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DerivacionForm } from './DerivacionForm'
import { AlquilerForm } from './AlquilerForm'
import {
  useCreateDerivacion, useCreateAlquiler,
  useUpdateDerivacion, useUpdateAlquiler, useDeleteAppointment,
} from '@/hooks/useAppointments'
import { useSettings } from '@/hooks/useSettings'
import type { AppointmentWithRelations } from '@/types/app'
import type { DerivacionFormData } from '@/schemas/appointment.schema'
import type { AlquilerFormData } from '@/schemas/appointment.schema'

interface Props {
  open: boolean
  onClose: () => void
  defaultStart?: Date
  defaultConsultorioId?: string
  existing?: AppointmentWithRelations
}

export function AppointmentModal({ open, onClose, defaultStart, defaultConsultorioId, existing }: Props) {
  const [tab, setTab] = useState<'derivacion' | 'alquiler'>(
    existing?.type ?? 'derivacion'
  )
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { data: settings } = useSettings()
  const dayEnd = settings?.operating_hours.end ?? '20:00'

  const createDerivacion = useCreateDerivacion()
  const createAlquiler = useCreateAlquiler()
  const updateDerivacion = useUpdateDerivacion()
  const updateAlquiler = useUpdateAlquiler()
  const deleteAppointment = useDeleteAppointment()

  const handleDerivacion = async (data: DerivacionFormData) => {
    try {
      if (existing) {
        await updateDerivacion.mutateAsync({ id: existing.id, data })
        toast.success('Turno actualizado')
      } else {
        await createDerivacion.mutateAsync(data)
        toast.success('Turno creado')
      }
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar'
      toast.error(msg)
    }
  }

  const handleAlquiler = async (data: AlquilerFormData) => {
    try {
      if (existing) {
        await updateAlquiler.mutateAsync({ id: existing.id, data, dayEnd })
        toast.success('Alquiler actualizado')
      } else {
        await createAlquiler.mutateAsync({ data, dayEnd })
        toast.success('Alquiler creado')
      }
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar'
      toast.error(msg)
    }
  }

  const handleDelete = async () => {
    if (!existing) return
    try {
      await deleteAppointment.mutateAsync(existing.id)
      toast.success('Turno eliminado')
      onClose()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const isDerivacionLoading = createDerivacion.isPending || updateDerivacion.isPending
  const isAlquilerLoading = createAlquiler.isPending || updateAlquiler.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {existing ? 'Editar turno' : 'Nuevo turno'}
            {existing && (
              <Badge variant={existing.payment_status === 'paid' ? 'success' : 'warning'}>
                {existing.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {!existing ? (
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="w-full">
              <TabsTrigger value="derivacion" className="flex-1">Derivación (45 min)</TabsTrigger>
              <TabsTrigger value="alquiler" className="flex-1">Alquiler</TabsTrigger>
            </TabsList>
            <TabsContent value="derivacion">
              <DerivacionForm
                defaultStart={defaultStart}
                defaultConsultorioId={defaultConsultorioId}
                onSubmit={handleDerivacion}
                onCancel={onClose}
                isLoading={isDerivacionLoading}
              />
            </TabsContent>
            <TabsContent value="alquiler">
              <AlquilerForm
                defaultStart={defaultStart}
                defaultConsultorioId={defaultConsultorioId}
                onSubmit={handleAlquiler}
                onCancel={onClose}
                isLoading={isAlquilerLoading}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <>
            {existing.type === 'derivacion' ? (
              <DerivacionForm
                existing={existing}
                onSubmit={handleDerivacion}
                onCancel={onClose}
                isLoading={isDerivacionLoading}
              />
            ) : (
              <AlquilerForm
                existing={existing}
                onSubmit={handleAlquiler}
                onCancel={onClose}
                isLoading={isAlquilerLoading}
              />
            )}

            <div className="border-t pt-3">
              {!confirmDelete ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmDelete(true)}
                >
                  Eliminar turno
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">¿Confirmar eliminación?</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={deleteAppointment.isPending}
                  >
                    Sí, eliminar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
