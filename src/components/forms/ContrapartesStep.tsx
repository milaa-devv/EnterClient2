import React, { useState } from 'react'
import { useFormContext } from '@/contexts/FormContext'
import { Users, Settings, Plus, X, Phone, Mail } from 'lucide-react'
import type { Contraparte } from '@/types/empresa'

export const ContrapartesStep: React.FC = () => {
  const { state, updateData } = useFormContext()
  const [contrapartes, setContrapartes] = useState<Contraparte[]>(
    state.data.contrapartes || []
  )
  const [showForm, setShowForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<Contraparte>>({})

  const tiposContraparte = [
    { 
      id: 'TECNICA', 
      nombre: 'Contraparte Técnica', 
      descripcion: 'Responsable de aspectos técnicos y configuraciones',
      icon: Settings
    },
    { 
      id: 'ADMINISTRATIVA', 
      nombre: 'Contraparte Administrativa', 
      descripcion: 'Responsable de aspectos administrativos y comerciales',
      icon: Users
    }
  ]

  const formatRut = (value: string) => {
    const cleanValue = value.replace(/[^0-9kK]/g, '')
    if (cleanValue.length <= 1) return cleanValue
    
    const body = cleanValue.slice(0, -1)
    const dv = cleanValue.slice(-1)
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    
    return `${formattedBody}-${dv}`
  }

  const handleSaveContraparte = () => {
    if (!formData.rut || !formData.nombre || !formData.tipo) return

    const newContraparte: Contraparte = {
      id: editingIndex !== null ? contrapartes[editingIndex].id : Date.now().toString(),
      rut: formData.rut,
      nombre: formData.nombre,
      correo: formData.correo || '',
      telefono: formData.telefono || '',
      cargo: formData.cargo || '',
      tipo: formData.tipo as 'TECNICA' | 'ADMINISTRATIVA'
    }

    let updatedContrapartes: Contraparte[]
    if (editingIndex !== null) {
      updatedContrapartes = contrapartes.map((cp, index) => 
        index === editingIndex ? newContraparte : cp
      )
    } else {
      updatedContrapartes = [...contrapartes, newContraparte]
    }

    setContrapartes(updatedContrapartes)
    updateData({ contrapartes: updatedContrapartes })
    
    // Reset form
    setFormData({})
    setShowForm(false)
    setEditingIndex(null)
  }

  const handleEditContraparte = (index: number) => {
    setFormData(contrapartes[index])
    setEditingIndex(index)
    setShowForm(true)
  }

  const handleDeleteContraparte = (index: number) => {
    const updatedContrapartes = contrapartes.filter((_, i) => i !== index)
    setContrapartes(updatedContrapartes)
    updateData({ contrapartes: updatedContrapartes })
  }

  const handleCancelForm = () => {
    setFormData({})
    setShowForm(false)
    setEditingIndex(null)
  }

  const getTipoInfo = (tipo: string) => {
    return tiposContraparte.find(t => t.id === tipo)
  }

  const getTipoColor = (tipo: string) => {
    return tipo === 'TECNICA' ? 'info' : 'success'
  }

  const contrapartesTecnicas = contrapartes.filter(cp => cp.tipo === 'TECNICA')
  const contrapartesAdministrativas = contrapartes.filter(cp => cp.tipo === 'ADMINISTRATIVA')

  return (
    <div>
      <div className="mb-4">
        <h4 className="font-primary fw-semibold mb-2">Contrapartes</h4>
        <p className="text-muted">
          Defina las contrapartes técnica y administrativa de la empresa
        </p>
      </div>

      {/* Resumen */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card border-info">
            <div className="card-body text-center p-3">
              <Settings className="text-info mb-2" size={24} />
              <h6 className="card-title">Contrapartes Técnicas</h6>
              <div className="h4 text-info">{contrapartesTecnicas.length}</div>
              <small className="text-muted">Configuradas</small>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-success">
            <div className="card-body text-center p-3">
              <Users className="text-success mb-2" size={24} />
              <h6 className="card-title">Contrapartes Administrativas</h6>
              <div className="h4 text-success">{contrapartesAdministrativas.length}</div>
              <small className="text-muted">Configuradas</small>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de contrapartes */}
      <div className="mb-4">
        {contrapartes.length === 0 ? (
          <div className="text-center py-4 border rounded bg-light">
            <Users size={48} className="text-muted mb-2" />
            <p className="text-muted mb-0">No hay contrapartes configuradas</p>
          </div>
        ) : (
          <div className="row g-3">
            {contrapartes.map((contraparte, index) => {
              const tipoInfo = getTipoInfo(contraparte.tipo)
              const IconComponent = tipoInfo?.icon || Users
              
              return (
                <div key={contraparte.id} className="col-lg-6">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <IconComponent size={20} className={`text-${getTipoColor(contraparte.tipo)}`} />
                          <div>
                            <h6 className="mb-0">{contraparte.nombre}</h6>
                            <small className="text-muted">{contraparte.rut}</small>
                          </div>
                        </div>
                        <div className="d-flex gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditContraparte(index)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteContraparte(index)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <span className={`badge bg-${getTipoColor(contraparte.tipo)}`}>
                          {tipoInfo?.nombre}
                        </span>
                      </div>
                      
                      <div className="small text-muted">
                        {contraparte.cargo && (
                          <div className="mb-1">
                            <strong>Cargo:</strong> {contraparte.cargo}
                          </div>
                        )}
                        {contraparte.correo && (
                          <div className="mb-1">
                            <Mail size={12} className="me-1" />
                            {contraparte.correo}
                          </div>
                        )}
                        {contraparte.telefono && (
                          <div>
                            <Phone size={12} className="me-1" />
                            {contraparte.telefono}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
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
          Agregar Contraparte
        </button>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              {editingIndex !== null ? 'Editar' : 'Agregar'} Contraparte
            </h6>
          </div>
          <div className="card-body">
            {/* Selección de tipo */}
            <div className="mb-4">
              <label className="form-label required">Tipo de Contraparte</label>
              <div className="row g-2">
                {tiposContraparte.map((tipo) => {
                  const IconComponent = tipo.icon
                  
                  return (
                    <div key={tipo.id} className="col-md-6">
                      <div 
                        className={`card cursor-pointer ${
                          formData.tipo === tipo.id 
                            ? `border-${getTipoColor(tipo.id)} bg-${getTipoColor(tipo.id)} bg-opacity-10` 
                            : 'border-light'
                        }`}
                        onClick={() => setFormData({
                          ...formData,
                          tipo: tipo.id as 'TECNICA' | 'ADMINISTRATIVA'
                        })}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body p-3 text-center">
                          <IconComponent size={24} className={`text-${getTipoColor(tipo.id)} mb-2`} />
                          <h6 className="mb-1">{tipo.nombre}</h6>
                          <p className="small text-muted mb-0">
                            {tipo.descripcion}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

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
                <label className="form-label">Cargo</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Gerente TI"
                  value={formData.cargo || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    cargo: e.target.value
                  })}
                />
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

              <div className="col-12">
                <label className="form-label">Correo Electrónico</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="contraparte@empresa.cl"
                    value={formData.correo || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      correo: e.target.value
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveContraparte}
                disabled={!formData.rut || !formData.nombre || !formData.tipo}
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
        <h6 className="alert-heading">Información sobre Contrapartes</h6>
        <ul className="mb-0 small">
          <li><strong>Contraparte Técnica:</strong> Se encarga de aspectos técnicos, configuraciones del sistema y soporte</li>
          <li><strong>Contraparte Administrativa:</strong> Maneja aspectos comerciales, facturación y relación con clientes</li>
          <li>Pueden existir múltiples contrapartes del mismo tipo</li>
          <li>Las contrapartes recibirán notificaciones según su área de responsabilidad</li>
        </ul>
      </div>
    </div>
  )
}
