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

  const openEdit = (p: Professional) => { setEditing(p); setModalOpen(true) }
  const openNew = () => { setEditing(undefined); setModalOpen(true) }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Profesionales</h1>
          <p className="text-sm text-gray-500 mt-0.5">Psicólogos que alquilan o reciben derivaciones</p>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo profesional</span>
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
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {professionals.map((p) => (
              <div key={p.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{p.full_name}</p>
                    {(p.specialty || p.license_num) && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {[p.specialty, p.license_num].filter(Boolean).join(' · ')}
                      </p>
                    )}
                    {(p.phone || p.email) && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        {[p.phone, p.email].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
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
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-hidden rounded-lg border border-gray-200 bg-white">
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
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
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
        </>
      )}

      <ProfessionalModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(undefined) }}
        existing={editing}
      />
    </div>
  )
}
