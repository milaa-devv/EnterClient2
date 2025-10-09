import React, { useState } from 'react'
import { useFormContext } from '@/contexts/FormContext'
import { Plus, X, User, Phone, Mail, Calendar } from 'lucide-react'
import type { RepresentanteLegal } from '@/types/empresa'

export const RepresentantesLegalesStep: React.FC = () => {
  const { state, updateData } = useFormContext()
  const [representantes, setRepresentantes] = useState<RepresentanteLegal[]>(
    state.data.representantesLegales || []
  )
  const [showForm, setShowForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<RepresentanteLegal>>({})

  const formatRut = (value: string) => {
    const cleanValue = value.replace(/[^0-9kK]/g, '')
    if (cleanValue.length <= 1) return cleanValue
    
    const body = cleanValue.slice(0, -1)
    const dv = cleanValue.slice(-1)
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    
    return `${formattedBody}-${dv}`
  }

  const handleSaveRepresentante = () => {
    if (!formData.rut || !formData.nombre) return

    const newRepresentante: RepresentanteLegal = {
      id: editingIndex !== null ? representantes[editingIndex].id : Date.now().toString(),
      rut: formData.rut,
      nombre: formData.nombre,
      correo: formData.correo || '',
      telefono: formData.telefono || '',
      fecha_incorporacion: formData.fecha_incorporacion || new Date().toISOString().split('T')[0]
    }

    let updatedRepresentantes: RepresentanteLegal[]
    if (editingIndex !== null) {
      updatedRepresentantes = representantes.map((rep, index) => 
        index === editingIndex ? newRepresentante : rep
      )
    } else {
      updatedRepresentantes = [...representantes, newRepresentante]
    }

    setRepresentantes(updatedRepresentantes)
    updateData({ representantesLegales: updatedRepresentantes })
    
    // Reset form
    setFormData({})
    setShowForm(false)
    setEditingIndex(null)
  }

  const handleEditRepresentante = (index: number) => {
    setFormData(representantes[index])
    setEditingIndex(index)
    setShowForm(true)
  }

  const handleDeleteRepresentante = (index: number) => {
    const updatedRepresentantes = representantes.filter((_, i) => i !== index)
    setRepresentantes(updatedRepresentantes)
    updateData({ representantesLegales: updatedRepresentantes })
  }

  const handleCancelForm = () => {
    setFormData({})
    setShowForm(false)
    setEditingIndex(null)
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="font-primary fw-semibold mb-2">Representantes Legales</h4>
        <p className="text-muted">
          Agregue los representantes legales de la empresa
        </p>
      </div>

      {/* Lista de representantes */}
      <div className="mb-4">
        {representantes.length === 0 ? (
          <div className="text-center py-4 border rounded bg-light">
            <User size={48} className="text-muted mb-2" />
            <p className="text-muted mb-0">No hay representantes legales agregados</p>
          </div>
        ) : (
          <div className="row g-3">
            {representantes.map((representante, index) => (
              <div key={representante.id} className="col-lg-6">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title mb-1">{representante.nombre}</h6>
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEditRepresentante(index)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteRepresentante(index)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="small text-muted">
                      <div className="mb-1">
                        <strong>RUT:</strong> {representante.rut}
                      </div>
                      {representante.correo && (
                        <div className="mb-1">
                          <Mail size={14} className="me-1" />
                          {representante.correo}
                        </div>
                      )}
                      {representante.telefono && (
                        <div className="mb-1">
                          <Phone size={14} className="me-1" />
                          {representante.telefono}
                        </div>
                      )}
                      {representante.fecha_incorporacion && (
                        <div>
                          <Calendar size={14} className="me-1" />
                          Desde: {new Date(representante.fecha_incorporacion).toLocaleDateString('es-CL')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón agregar */}
      {!showForm && (
        <button
          type="button"
          className="btn btn-outline-primary d-flex align-items-center gap-2 mb-4"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          Agregar Representante Legal
        </button>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              {editingIndex !== null ? 'Editar' : 'Agregar'} Representante Legal
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label required">RUT</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="12.345.678-9"
                  value={formData.rut || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    rut: formatRut(e.target.value)
                  })}
                  maxLength={12}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label required">Nombre Completo</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Juan Pérez González"
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    nombre: e.target.value
                  })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Correo Electrónico</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="representante@empresa.cl"
                    value={formData.correo || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      correo: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Phone size={18} />
                  </span>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+56 9 1234 5678"
                    value={formData.telefono || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      telefono: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label">Fecha de Incorporación</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Calendar size={18} />
                  </span>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.fecha_incorporacion || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      fecha_incorporacion: e.target.value
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveRepresentante}
                disabled={!formData.rut || !formData.nombre}
              >
                {editingIndex !== null ? 'Actualizar' : 'Agregar'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelForm}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información importante */}
      <div className="alert alert-info mt-4">
        <h6 className="alert-heading">Información Importante</h6>
        <ul className="mb-0 small">
          <li>Debe agregar al menos un representante legal</li>
          <li>Los representantes legales pueden firmar documentos tributarios</li>
          <li>Verifique que los datos coincidan con los registrados en el SII</li>
          <li>Los representantes recibirán notificaciones oficiales</li>
        </ul>
      </div>
    </div>
  )
}
