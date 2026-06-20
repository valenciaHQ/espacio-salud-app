import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ProfessionalModal } from '@/components/professionals/ProfessionalModal'
import { useProfessionals, useDeleteProfessional } from '@/hooks/useProfessionals'
import type { Professional } from '@/types/app'

export function ProfessionalsPage() {
  const { data: professionals = [], isLoading } = useProfessionals()
  const deleteProfessional = useDeleteProfessional()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Professional | undefined>()

  const handleDelete = async (prof: Professional) => {
    if (!confirm(`¿Eliminar a ${prof.full_name}?`)) return
    try {
      await deleteProfessional.mutateAsync(prof.id)
      toast.success('Profesional eliminado')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Profesionales</h1>
          <p className="text-sm text-gray-500 mt-1">Psicólogos que alquilan o reciben derivaciones</p>
        </div>
        <Button onClick={() => { setEditing(undefined); setModalOpen(true) }}>
          <Plus className="h-4 w-4" />
          Nuevo profesional
        </Button>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : professionals.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No hay profesionales registrados.</p>
          <p className="text-sm mt-1">Creá el primero haciendo click en "Nuevo profesional".</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Especialidad</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Matrícula</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Teléfono</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {professionals.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.full_name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.specialty ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.license_num ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.email ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditing(p); setModalOpen(true) }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(p)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProfessionalModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(undefined) }}
        existing={editing}
      />
    </div>
  )
}
