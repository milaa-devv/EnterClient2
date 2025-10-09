import React, { useState, useEffect } from 'react'
import { X, History, User, Clock, FileText, Eye } from 'lucide-react'

interface HistorialCambiosModalProps {
  empkey: number
  isOpen: boolean
  onClose: () => void
}

interface CambioHistorial {
  id: number
  tabla: string
  registro_id: string
  accion: 'INSERT' | 'UPDATE' | 'DELETE'
  cambios: any
  usuario: string
  fecha: string
  descripcion: string
}

export const HistorialCambiosModal: React.FC<HistorialCambiosModalProps> = ({ 
  empkey, 
  isOpen, 
  onClose 
}) => {
  const [historial, setHistorial] = useState<CambioHistorial[]>([])
  const [loading, setLoading] = useState(false)
  const [filtroTabla, setFiltroTabla] = useState<string>('')
  const [selectedCambio, setSelectedCambio] = useState<CambioHistorial | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadHistorial()
    }
  }, [isOpen, empkey])

  const loadHistorial = async () => {
    setLoading(true)
    try {
      // Simular carga de historial
      const mockHistorial: CambioHistorial[] = [
        {
          id: 1,
          tabla: 'empresa',
          registro_id: empkey.toString(),
          accion: 'UPDATE',
          cambios: {
            telefono: { anterior: '+56912345678', nuevo: '+56987654321' },
            correo: { anterior: 'anterior@empresa.cl', nuevo: 'nuevo@empresa.cl' }
          },
          usuario: 'juan.perez@comercial.cl',
          fecha: '2025-09-21T10:30:00Z',
          descripcion: 'Actualización de datos de contacto'
        },
        {
          id: 2,
          tabla: 'representante_legal',
          registro_id: '12345678-9',
          accion: 'INSERT',
          cambios: {
            nombre: 'María González Silva',
            correo: 'maria.gonzalez@empresa.cl',
            telefono: '+56912345678'
          },
          usuario: 'ana.rodriguez@comercial.cl',
          fecha: '2025-09-20T15:45:00Z',
          descripcion: 'Nuevo representante legal agregado'
        },
        {
          id: 3,
          tabla: 'empresa_dte',
          registro_id: empkey.toString(),
          accion: 'UPDATE',
          cambios: {
            dte_habilitados: { anterior: ['33', '39'], nuevo: ['33', '34', '39'] }
          },
          usuario: 'carlos.lopez@onboarding.cl',
          fecha: '2025-09-19T09:15:00Z',
          descripcion: 'Habilitación de Factura Exenta (34)'
        }
      ]
      
      setHistorial(mockHistorial)
    } catch (error) {
      console.error('Error cargando historial:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAccionColor = (accion: string) => {
    switch (accion) {
      case 'INSERT': return 'success'
      case 'UPDATE': return 'primary'
      case 'DELETE': return 'danger'
      default: return 'secondary'
    }
  }

  const getAccionIcon = (accion: string) => {
    switch (accion) {
      case 'INSERT': return '+'
      case 'UPDATE': return '✓'
      case 'DELETE': return '×'
      default: return '?'
    }
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const historialFiltrado = filtroTabla 
    ? historial.filter(h => h.tabla === filtroTabla)
    : historial

  const tablas = [...new Set(historial.map(h => h.tabla))]

  if (!isOpen) return null

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <History size={20} />
              Historial de Cambios - Empkey {empkey}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            />
          </div>
          
          <div className="modal-body">
            {/* Filtros */}
            <div className="row mb-4">
              <div className="col-md-4">
                <label className="form-label">Filtrar por tabla:</label>
                <select
                  className="form-select"
                  value={filtroTabla}
                  onChange={(e) => setFiltroTabla(e.target.value)}
                >
                  <option value="">Todas las tablas</option>
                  {tablas.map(tabla => (
                    <option key={tabla} value={tabla}>
                      {tabla.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-8 d-flex align-items-end">
                <div className="text-muted">
                  {historialFiltrado.length} cambio(s) encontrado(s)
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando historial...</span>
                </div>
              </div>
            ) : (
              /* Lista de Cambios */
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tabla</th>
                      <th>Acción</th>
                      <th>Usuario</th>
                      <th>Descripción</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialFiltrado.map((cambio) => (
                      <tr key={cambio.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Clock size={14} className="text-muted" />
                            <span className="font-monospace small">
                              {formatFecha(cambio.fecha)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark">
                            {cambio.tabla}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${getAccionColor(cambio.accion)}`}>
                            {getAccionIcon(cambio.accion)} {cambio.accion}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <User size={14} className="text-muted" />
                            <span className="small">{cambio.usuario}</span>
                          </div>
                        </td>
                        <td>
                          <span className="small">{cambio.descripcion}</span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setSelectedCambio(cambio)}
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {historialFiltrado.length === 0 && !loading && (
                  <div className="text-center py-4">
                    <FileText size={48} className="text-muted mb-2" />
                    <p className="text-muted">No se encontraron cambios en el historial</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Cerrar
            </button>
            <button type="button" className="btn btn-primary">
              Exportar Historial
            </button>
          </div>
        </div>
      </div>

      {/* Modal de detalle de cambio */}
      {selectedCambio && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title">Detalle del Cambio</h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedCambio(null)}
                />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-6">
                    <strong>ID:</strong> {selectedCambio.id}
                  </div>
                  <div className="col-6">
                    <strong>Tabla:</strong> {selectedCambio.tabla}
                  </div>
                  <div className="col-6">
                    <strong>Acción:</strong> 
                    <span className={`badge bg-${getAccionColor(selectedCambio.accion)} ms-1`}>
                      {selectedCambio.accion}
                    </span>
                  </div>
                  <div className="col-6">
                    <strong>Usuario:</strong> {selectedCambio.usuario}
                  </div>
                  <div className="col-12">
                    <strong>Fecha:</strong> {formatFecha(selectedCambio.fecha)}
                  </div>
                  <div className="col-12">
                    <strong>Cambios:</strong>
                    <pre className="bg-light p-2 rounded mt-1 small">
                      {JSON.stringify(selectedCambio.cambios, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedCambio(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
