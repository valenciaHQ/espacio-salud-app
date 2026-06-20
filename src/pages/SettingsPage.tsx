import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useConsultorios, useUpdateConsultorio } from '@/hooks/useConsultorios'
import { useSettings, useUpdateOperatingHours, useUpdateBusinessName } from '@/hooks/useSettings'

export function SettingsPage() {
  const { data: settings, isLoading: settingsLoading } = useSettings()
  const { data: consultorios = [] } = useConsultorios()
  const updateHours = useUpdateOperatingHours()
  const updateName = useUpdateBusinessName()
  const updateConsultorio = useUpdateConsultorio()

  const [hoursStart, setHoursStart] = useState('08:00')
  const [hoursEnd, setHoursEnd] = useState('20:00')
  const [businessName, setBusinessName] = useState('Espacio Salud')
  const [consultorioNames, setConsultorioNames] = useState<Record<string, string>>({})
  const [consultorioColors, setConsultorioColors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (settings) {
      setHoursStart(settings.operating_hours.start)
      setHoursEnd(settings.operating_hours.end)
      setBusinessName(settings.business_name)
    }
  }, [settings])

  useEffect(() => {
    const names: Record<string, string> = {}
    const colors: Record<string, string> = {}
    for (const c of consultorios) {
      names[c.id] = c.name
      colors[c.id] = c.color
    }
    setConsultorioNames(names)
    setConsultorioColors(colors)
  }, [consultorios])

  const handleSaveHours = async () => {
    try {
      await updateHours.mutateAsync({ start: hoursStart, end: hoursEnd })
      toast.success('Horarios actualizados')
    } catch {
      toast.error('Error al guardar horarios')
    }
  }

  const handleSaveName = async () => {
    try {
      await updateName.mutateAsync(businessName)
      toast.success('Nombre actualizado')
    } catch {
      toast.error('Error al guardar')
    }
  }

  const handleSaveConsultorio = async (id: string) => {
    try {
      await updateConsultorio.mutateAsync({
        id,
        updates: { name: consultorioNames[id], color: consultorioColors[id] },
      })
      toast.success('Consultorio actualizado')
    } catch {
      toast.error('Error al guardar consultorio')
    }
  }

  if (settingsLoading) return <div className="p-6 text-gray-400">Cargando...</div>

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Configuración</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nombre del negocio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label>Nombre</Label>
            <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>
          <Button size="sm" onClick={handleSaveName} disabled={updateName.isPending}>
            <Save className="h-4 w-4" />
            Guardar
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Horario de funcionamiento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Apertura</Label>
              <Input type="time" value={hoursStart} onChange={(e) => setHoursStart(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Cierre</Label>
              <Input type="time" value={hoursEnd} onChange={(e) => setHoursEnd(e.target.value)} />
            </div>
          </div>
          <Button size="sm" onClick={handleSaveHours} disabled={updateHours.isPending}>
            <Save className="h-4 w-4" />
            Guardar horarios
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consultorios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {consultorios.map((c) => (
            <div key={c.id} className="flex items-end gap-3">
              <div className="flex-1 space-y-1">
                <Label>Nombre</Label>
                <Input
                  value={consultorioNames[c.id] ?? c.name}
                  onChange={(e) =>
                    setConsultorioNames((prev) => ({ ...prev, [c.id]: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Color</Label>
                <input
                  type="color"
                  className="h-9 w-14 rounded-md border border-gray-300 cursor-pointer p-1"
                  value={consultorioColors[c.id] ?? c.color}
                  onChange={(e) =>
                    setConsultorioColors((prev) => ({ ...prev, [c.id]: e.target.value }))
                  }
                />
              </div>
              <Button size="sm" onClick={() => handleSaveConsultorio(c.id)} disabled={updateConsultorio.isPending}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
