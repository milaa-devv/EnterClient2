import React, { useState } from 'react'
import { useFormContext } from '@/contexts/FormContext'
import { Plus, X, Bell, Mail, MessageSquare } from 'lucide-react'
import type { ConfiguracionNotificacion } from '@/types/empresa'

export const ConfiguracionNotificacionesStep: React.FC = () => {
  const { state, updateData } = useFormContext()
  const [notificaciones, setNotificaciones] = useState<ConfiguracionNotificacion[]>(
    state.data.configuracionNotificaciones || []
  )
  const [showForm, setShowForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<ConfiguracionNotificacion>>({})

  const tiposNotificacion = [
    { 
      id: 'documento_emitido', 
      nombre: 'Documento Emitido', 
      descripcion: 'Se envía cuando se emite un documento tributario',
      predeterminada: 'Notificación automática al emitir DTE'
    },
    { 
      id: 'documento_recibido', 
      nombre: 'Documento Recibido', 
      descripcion: 'Se envía cuando se recibe un documento de proveedor',
      predeterminada: 'Notificación de recepción de DTE de proveedores'
    },
    { 
      id: 'error_sistema', 
      nombre: 'Error del Sistema', 
      descripcion: 'Alertas sobre errores o fallas del sistema',
      predeterminada: 'Alerta crítica: Error en el sistema de facturación'
    },
    { 
      id: 'vencimiento_certificado', 
      nombre: 'Vencimiento Certificado', 
      descripción: 'Aviso antes del vencimiento del certificado digital',
      predeterminada: 'Su certificado digital vence en 30 días'
    },
    { 
      id: 'respaldo_completado', 
      nombre: 'Respaldo Completado', 
      descripcion: 'Confirmación de respaldos automáticos',
      predeterminada: 'Respaldo de documentos completado exitosamente'
    },
    { 
      id: 'actualizacion_sistema', 
      nombre: 'Actualización Sistema', 
      descripcion: 'Avisos sobre actualizaciones del sistema',
      predeterminada: 'Nueva versión del sistema disponible'
    }
  ]

  const handleSaveNotificacion = () => {
    if (!formData.correo || !formData.tipo) return

    const tipoInfo = tiposNotificacion.find(t => t.id === formData.tipo)
    
    const newNotificacion: ConfiguracionNotificacion = {
      id: editingIndex !== null ? notificaciones[editingIndex].id : Date.now().toString(),
      correo: formData.correo,
      tipo: formData.tipo,
      descripcion: formData.descripcion || tipoInfo?.predeterminada || '',
      activo: formData.activo !== false
    }

    let updatedNotificaciones: ConfiguracionNotificacion[]
    if (editingIndex !== null) {
      updatedNotificaciones = notificaciones.map((notif, index) => 
        index === editingIndex ? newNotificacion : notif
      )
    } else {
      updatedNotificaciones = [...notificaciones, newNotificacion]
    }

    setNotificaciones(updatedNotificaciones)
    updateData({ configuracionNotificaciones: updatedNotificaciones })
    
    // Reset form
    setFormData({})
    setShowForm(false)
    setEditingIndex(null)
  }

  const handleEditNotificacion = (index: number) => {
    setFormData(notificaciones[index])
    setEditingIndex(index)
    setShowForm(true)
  }

  const handleDeleteNotificacion = (index: number) => {
    const updatedNotificaciones = notificaciones.filter((_, i) => i !== index)
    setNotificaciones(updatedNotificaciones)
    updateData({ configuracionNotificaciones: updatedNotificaciones })
  }

  const handleCancelForm = () => {
    setFormData({})
    setShowForm(false)
    setEditingIndex(null)
  }

  const getTipoInfo = (tipoId: string) => {
    return tiposNotificacion.find(tipo => tipo.id === tipoId)
  }

  const getTipoColor = (tipoId: string) => {
    switch (tipoId) {
      case 'error_sistema': return 'danger'
      case 'vencimiento_certificado': return 'warning'
      case 'documento_emitido': return 'success'
      case 'documento_recibido': return 'info'
      case 'respaldo_completado': return 'primary'
      case 'actualizacion_sistema': return 'secondary'
      default: return 'primary'
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="font-primary fw-semibold mb-2">Configuración de Notificaciones</h4>
        <p className="text-muted">
          Configure cómo y cuándo recibir notificaciones del sistema
        </p>
      </div>

      {/* Lista de notificaciones */}
      <div className="mb-4">
        {notificaciones.length === 0 ? (
          <div className="text-center py-4 border rounded bg-light">
            <Bell size={48} className="text-muted mb-2" />
            <p className="text-muted mb-0">No hay notificaciones configuradas</p>
          </div>
        ) : (
          <div className="row g-3">
            {notificaciones.map((notificacion, index) => {
              const tipoInfo = getTipoInfo(notificacion.tipo)
              
              return (
                <div key={notificacion.id} className="col-12">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-start gap-3">
                          <Bell size={20} className={`text-${getTipoColor(notificacion.tipo)} mt-1`} />
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <h6 className="mb-0">{tipoInfo?.nombre || notificacion.tipo}</h6>
                              <span className={`badge bg-${getTipoColor(notificacion.tipo)}`}>
                                {tipoInfo?.nombre || 'Personalizada'}
                              </span>
                              {!notificacion.activo && (
                                <span className="badge bg-secondary">Inactiva</span>
                              )}
                            </div>
                            <div className="small text-muted mb-2">
                              <Mail size={12} className="me-1" />
                              {notificacion.correo}
                            </div>
                            <div className="small text-muted">
                              {notificacion.descripcion}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditNotificacion(index)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteNotificacion(index)}
                          >
                            <X size={14} />
                          </button>
                        </div>
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
          Agregar Notificación
        </button>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              {editingIndex !== null ? 'Editar' : 'Agregar'} Notificación
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label required">Correo Electrónico</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="notificaciones@empresa.cl"
                    value={formData.correo || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      correo: e.target.value
                    })}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label required">Tipo de Notificación</label>
                <select
                  className="form-select"
                  value={formData.tipo || ''}
                  onChange={(e) => {
                    const tipoInfo = tiposNotificacion.find(t => t.id === e.target.value)
                    setFormData({
                      ...formData,
                      tipo: e.target.value,
                      descripcion: tipoInfo?.predeterminada || ''
                    })
                  }}
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  {tiposNotificacion.map((tipo) => (
                    <option key={tipo.id} value={tipo.id}>
                      {tipo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label">Descripción</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <MessageSquare size={18} />
                  </span>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Descripción personalizada para esta notificación..."
                    value={formData.descripcion || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      descripcion: e.target.value
                    })}
                  />
                </div>
                <div className="form-text">
                  Esta descripción se usará en el asunto del correo electrónico
                </div>
              </div>

              <div className="col-12">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="notificacion_activa"
                    checked={formData.activo !== false}
                    onChange={(e) => setFormData({
                      ...formData,
                      activo: e.target.checked
                    })}
                  />
                  <label className="form-check-label" htmlFor="notificacion_activa">
                    Notificación Activa
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveNotificacion}
                disabled={!formData.correo || !formData.tipo}
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

      {/* Plantillas predefinidas */}
      <div className="card mt-4">
        <div className="card-header">
          <h6 className="mb-0">Plantillas Predefinidas</h6>
        </div>
        <div className="card-body">
          <p className="small text-muted mb-3">
            Puede usar estas plantillas rápidas para configurar notificaciones comunes
          </p>
          <div className="row g-2">
            {tiposNotificacion.slice(0, 3).map((tipo) => (
              <div key={tipo.id} className="col-md-4">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm w-100"
                  onClick={() => {
                    setFormData({
                      tipo: tipo.id,
                      descripcion: tipo.predeterminada
                    })
                    setShowForm(true)
                  }}
                  disabled={showForm}
                >
                  {tipo.nombre}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Información importante */}
      <div className="alert alert-info mt-4">
        <h6 className="alert-heading">Información sobre Notificaciones</h6>
        <ul className="mb-0 small">
          <li>Las notificaciones se envían automáticamente según los eventos configurados</li>
          <li>Puede configurar múltiples correos para el mismo tipo de notificación</li>
          <li>Las notificaciones inactivas no se enviarán pero se mantendrán configuradas</li>
          <li>Recomendamos configurar al menos notificaciones de errores y vencimientos</li>
        </ul>
      </div>
    </div>
  )
}
