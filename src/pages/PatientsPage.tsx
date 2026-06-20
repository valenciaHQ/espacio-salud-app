import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PatientModal } from '@/components/patients/PatientModal'
import { usePatients, useDeletePatient } from '@/hooks/usePatients'
import type { Patient } from '@/types/app'

export function PatientsPage() {
  const { data: patients = [], isLoading } = usePatients()
  const deletePatient = useDeletePatient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Patient | undefined>()

  const handleDelete = async (patient: Patient) => {
    if (!confirm(`¿Eliminar a ${patient.full_name}?`)) return
    try {
      await deletePatient.mutateAsync(patient.id)
      toast.success('Paciente eliminado')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pacientes</h1>
          <p className="text-sm text-gray-500 mt-1">Pacientes registrados para turnos por derivación</p>
        </div>
        <Button onClick={() => { setEditing(undefined); setModalOpen(true) }}>
          <Plus className="h-4 w-4" />
          Nuevo paciente
        </Button>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Cargando...</p>
      ) : patients.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No hay pacientes registrados.</p>
          <p className="text-sm mt-1">Creá el primero haciendo click en "Nuevo paciente".</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Teléfono</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Obra social</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Notas</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.full_name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{p.coverage ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <span className="truncate block">{p.notes ?? '—'}</span>
                  </td>
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

      <PatientModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(undefined) }}
        existing={editing}
      />
    </div>
  )
}
