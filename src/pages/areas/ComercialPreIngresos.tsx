import React, { useState } from 'react'
import { Building2, Eye, ArrowRight, ArrowLeft, Clock, Calendar, User, Phone, Mail, FileSpreadsheet, X, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import { usePreIngresos } from '@/hooks/usePreIngresos'
import type { PreIngreso } from '@/hooks/usePreIngresos'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

// ——— Helpers ——————————————————————————————————————

function limpiarFilas(rows: Record<string, string>[]): Record<string, string>[] {
  return rows.filter(row => {
    const valores = Object.values(row)
    const esNota = valores.some(v =>
      typeof v === 'string' && (
        v.includes('⚠️') || v.includes('📋') ||
        v.includes('Roles válidos') || v.includes('Tipos válidos') ||
        v.includes('Use "X"')
      )
    )
    const estaVacia = valores.every(v => !v || v === '')
    return !esNota && !estaVacia
  })
}

function limpiarColumnas(rows: Record<string, string>[]): { headers: string[], filas: Record<string, string>[] } {
  if (!rows.length) return { headers: [], filas: [] }
  const todasLasClaves = Object.keys(rows[0])
  const headers = todasLasClaves.filter(k => !k.startsWith('__'))
  const filas = rows.map(row => {
    const nuevo: Record<string, string> = {}
    headers.forEach(h => { nuevo[h] = row[h] ?? '' })
    return nuevo
  })
  return { headers, filas }
}

const ProductoBadge: React.FC<{ producto: string | null }> = ({ producto }) => {
  if (!producto) return null
  const isAndes = producto === 'ANDESPOS'
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 4,
      fontSize: 12, fontWeight: 500,
      background: isAndes ? '#0dcaf020' : '#0d6efd20',
      color: isAndes ? '#0a7a8f' : '#0a4db5',
      border: `1px solid ${isAndes ? '#0dcaf060' : '#0d6efd60'}`,
    }}>
      {isAndes ? 'AndesPOS' : 'Enternet'}
    </span>
  )
}

const EstadoBadge: React.FC<{ estado: string | null }> = ({ estado }) => (
  <span className="badge bg-warning bg-opacity-10 text-warning fw-normal">
    {estado ?? 'Pendiente'}
  </span>
)

function formatFecha(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// ——— Tabla xlsx limpia ————————————————————————————
const TablaXlsx: React.FC<{ rows: Record<string, string>[]; titulo: string }> = ({ rows, titulo }) => {
  const filasLimpias = limpiarFilas(rows)
  const { headers, filas } = limpiarColumnas(filasLimpias)
  if (!filas.length) return null

  const esNotificaciones = headers.some(h =>
    h.includes('Folios') || h.includes('Rechazos') || h.includes('DTE') ||
    h.includes('Certificado') || h.includes('Errores')
  )

  return (
    <div className="mb-4">
      <div className="d-flex align-items-center gap-2 mb-2">
        <FileSpreadsheet size={15} className="text-success" />
        <span className="fw-semibold small">{titulo}</span>
        <span className="badge bg-success bg-opacity-10 text-success fw-normal">
          {filas.length} registro{filas.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="table-responsive rounded border" style={{ fontSize: '12px' }}>
        <table className="table table-sm table-hover mb-0">
          <thead style={{ backgroundColor: 'var(--bs-gray-100)' }}>
            <tr>
              {headers.map(h => (
                <th key={h} className="px-3 py-2 fw-semibold text-muted text-nowrap"
                  style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((row, i) => (
              <tr key={i}>
                {headers.map(h => {
                  const val = row[h] ?? ''
                  const esColumnaBooleana = esNotificaciones && h !== 'Correo Electrónico'
                  if (esColumnaBooleana) {
                    const activo = val.toString().toUpperCase() === 'X'
                    return (
                      <td key={h} className="px-3 py-2 text-center">
                        {activo
                          ? <CheckCircle size={15} className="text-success" />
                          : <XCircle size={15} className="text-muted opacity-25" />
                        }
                      </td>
                    )
                  }
                  return (
                    <td key={h} className="px-3 py-2">
                      {val || <span className="text-muted">—</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ——— Fila de campo ————————————————————————————————
const Campo: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <div className="col-md-6">
    <p className="text-muted mb-0" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</p>
    <p className="mb-0 fw-medium" style={{ fontSize: '14px' }}>{value || '—'}</p>
  </div>
)

// ——— Modal Detalle ————————————————————————————————
const ModalDetalle: React.FC<{ preIngreso: PreIngreso; onClose: () => void; onContinuar: () => void }> = ({
  preIngreso, onClose, onContinuar
}) => {
  const datos = preIngreso.datos_json as Record<string, string> | null
  const tieneArchivos = preIngreso.usuarios_xlsx || preIngreso.contrapartes_xlsx || preIngreso.notificaciones_xlsx

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="card shadow-lg"
        style={{ width: '100%', maxWidth: 780, maxHeight: '92vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="card-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Building2 size={18} />
            <span className="fw-semibold">{preIngreso.nombre_empresa ?? 'Sin nombre'}</span>
            <ProductoBadge producto={preIngreso.producto} />
            <EstadoBadge estado={preIngreso.estado} />
          </div>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="card-body px-4">
          {/* Empresa */}
          <p className="text-muted fw-semibold small text-uppercase mb-3 mt-1" style={{ letterSpacing: '0.05em' }}>
            Datos de la empresa
          </p>
          <div className="row g-3 mb-4">
            <Campo label="Razón Social" value={datos?.razon_social ?? preIngreso.nombre_empresa} />
            <Campo label="RUT" value={preIngreso.rut} />
            <Campo label="Nombre de Fantasía" value={datos?.nombre_fantasia} />
            <Campo label="Correo" value={datos?.email} />
            <Campo label="Dirección" value={datos?.direccion} />
            <Campo label="Comuna" value={datos?.comuna} />
            <Campo label="Teléfono" value={datos?.telefono} />
          </div>

          <hr className="my-3" />

          {/* Representante Legal */}
          <p className="text-muted fw-semibold small text-uppercase mb-3" style={{ letterSpacing: '0.05em' }}>
            Representante Legal
          </p>
          {preIngreso.representante ? (
            <div className="row g-3 mb-4">
              <Campo label="Nombre" value={`${preIngreso.representante.nombre ?? ''} ${preIngreso.representante.apellido ?? ''}`.trim()} />
              <Campo label="RUT" value={preIngreso.representante.rut} />
              <Campo label="Correo" value={preIngreso.representante.correo} />
              <Campo label="Teléfono" value={preIngreso.representante.telefono} />
            </div>
          ) : (
            <p className="text-muted small mb-4">Sin datos de representante</p>
          )}

          <hr className="my-3" />

          {/* Contacto Principal */}
          <p className="text-muted fw-semibold small text-uppercase mb-3" style={{ letterSpacing: '0.05em' }}>
            Contacto Principal
          </p>
          {preIngreso.contacto_principal ? (
            <div className="row g-3 mb-4">
              <Campo label="Nombre" value={`${preIngreso.contacto_principal.nombre ?? ''} ${preIngreso.contacto_principal.apellido ?? ''}`.trim()} />
              <Campo label="Teléfono" value={preIngreso.contacto_principal.telefono} />
              <Campo label="Email" value={preIngreso.contacto_principal.email} />
            </div>
          ) : (
            <p className="text-muted small mb-4">Sin datos de contacto</p>
          )}

          {/* Archivos */}
          {tieneArchivos && (
            <>
              <hr className="my-3" />
              <p className="text-muted fw-semibold small text-uppercase mb-3" style={{ letterSpacing: '0.05em' }}>
                Archivos recibidos
              </p>
              {preIngreso.usuarios_xlsx && preIngreso.usuarios_xlsx.length > 0 && (
                <TablaXlsx rows={preIngreso.usuarios_xlsx as Record<string, string>[]} titulo="Usuarios" />
              )}
              {preIngreso.contrapartes_xlsx && preIngreso.contrapartes_xlsx.length > 0 && (
                <TablaXlsx rows={preIngreso.contrapartes_xlsx as Record<string, string>[]} titulo="Contrapartes" />
              )}
              {preIngreso.notificaciones_xlsx && preIngreso.notificaciones_xlsx.length > 0 && (
                <TablaXlsx rows={preIngreso.notificaciones_xlsx as Record<string, string>[]} titulo="Notificaciones" />
              )}
            </>
          )}

          {/* Metadata */}
          <div className="d-flex gap-4 text-muted mt-3" style={{ fontSize: '12px' }}>
            <span className="d-flex align-items-center gap-1">
              <Calendar size={13} />Recibido: {formatFecha(preIngreso.created_at)}
            </span>
            <span className="d-flex align-items-center gap-1">
              <Clock size={13} />Origen: {preIngreso.origen ?? 'HubSpot'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer d-flex justify-content-end gap-2">
          <button className="btn btn-outline-secondary" onClick={onClose}>Cerrar</button>
          <button className="btn btn-primary d-flex align-items-center gap-2" onClick={onContinuar}>
            Continuar formulario <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ——— Modal Confirmar Eliminación ————————————————————
const ModalConfirmarEliminar: React.FC<{
  preIngreso: PreIngreso
  onConfirmar: () => void
  onCancelar: () => void
  eliminando: boolean
}> = ({ preIngreso, onConfirmar, onCancelar, eliminando }) => (
  <div
    className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
    style={{ zIndex: 1060, backgroundColor: 'rgba(0,0,0,0.5)' }}
    onClick={onCancelar}
  >
    <div
      className="card shadow-lg"
      style={{ width: '100%', maxWidth: 420 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="card-body p-4 text-center">
        <div className="mb-3">
          <div className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-10 mb-3">
            <Trash2 size={24} className="text-danger" />
          </div>
          <h5 className="fw-semibold mb-1">¿Eliminar pre-ingreso?</h5>
          <p className="text-muted small mb-0">
            Se eliminará el pre-ingreso de <strong>{preIngreso.nombre_empresa ?? 'esta empresa'}</strong>. Esta acción no se puede deshacer.
          </p>
        </div>
        <div className="d-flex gap-2 justify-content-center mt-4">
          <button className="btn btn-outline-secondary px-4" onClick={onCancelar} disabled={eliminando}>
            Cancelar
          </button>
          <button className="btn btn-danger px-4 d-flex align-items-center gap-2" onClick={onConfirmar} disabled={eliminando}>
            {eliminando ? (
              <><span className="spinner-border spinner-border-sm" />Eliminando...</>
            ) : (
              <><Trash2 size={14} />Eliminar</>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
)

// ——— Card pre-ingreso ——————————————————————————————
const PreIngresoCard: React.FC<{
  preIngreso: PreIngreso
  onVerDetalle: (p: PreIngreso) => void
  onContinuar: (p: PreIngreso) => void
  onEliminar: (p: PreIngreso) => void
}> = ({ preIngreso, onVerDetalle, onContinuar, onEliminar }) => (
  <div className="card mb-3">
    <div className="card-body">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="fw-semibold">{preIngreso.nombre_empresa ?? 'Sin nombre'}</span>
          <ProductoBadge producto={preIngreso.producto} />
          <EstadoBadge estado={preIngreso.estado} />
        </div>
      </div>

      <div className="d-flex gap-4 text-muted small mb-3 flex-wrap">
        <span className="d-flex align-items-center gap-1">
          <Building2 size={13} />{preIngreso.rut ?? '—'}
        </span>
        {preIngreso.contacto_principal && (
          <>
            <span className="d-flex align-items-center gap-1">
              <User size={13} />
              {preIngreso.contacto_principal.nombre} {preIngreso.contacto_principal.apellido}
            </span>
            {preIngreso.contacto_principal.email && (
              <span className="d-flex align-items-center gap-1">
                <Mail size={13} />{preIngreso.contacto_principal.email}
              </span>
            )}
            {preIngreso.contacto_principal.telefono && (
              <span className="d-flex align-items-center gap-1">
                <Phone size={13} />{preIngreso.contacto_principal.telefono}
              </span>
            )}
          </>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-center">
        <span className="text-muted small d-flex align-items-center gap-1">
          <Calendar size={13} />{formatFecha(preIngreso.created_at)}
        </span>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
            onClick={() => onEliminar(preIngreso)}
            title="Eliminar pre-ingreso"
          >
            <Trash2 size={14} />
          </button>
          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={() => onVerDetalle(preIngreso)}
          >
            <Eye size={14} /> Ver detalle
          </button>
          <button
            className="btn btn-sm btn-primary d-flex align-items-center gap-1"
            onClick={() => onContinuar(preIngreso)}
          >
            Continuar formulario <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  </div>
)

// ——— Página principal ——————————————————————————————
const ComercialPreIngresos: React.FC = () => {
  const { preIngresos, stats, loading, error, refetch } = usePreIngresos()
  const [detalle, setDetalle] = useState<PreIngreso | null>(null)
  const [aEliminar, setAEliminar] = useState<PreIngreso | null>(null)
  const [eliminando, setEliminando] = useState(false)
  const navigate = useNavigate()

  const pendientes = preIngresos.filter((p) => p.estado === 'Pendiente')
  const procesados = preIngresos.filter((p) => p.estado !== 'Pendiente')

  const handleContinuar = (p: PreIngreso) => {
    setDetalle(null)
    navigate(`/comercial/pre-ingreso/${p.id}`)
  }

  const handleConfirmarEliminar = async () => {
    if (!aEliminar) return
    setEliminando(true)
    try {
      await supabase.from('pre_ingresos').delete().eq('id', aEliminar.id)
      setAEliminar(null)
      refetch()
    } catch (err) {
      console.error('Error eliminando pre-ingreso:', err)
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="container-fluid">
      {detalle && (
        <ModalDetalle
          preIngreso={detalle}
          onClose={() => setDetalle(null)}
          onContinuar={() => handleContinuar(detalle)}
        />
      )}

      {aEliminar && (
        <ModalConfirmarEliminar
          preIngreso={aEliminar}
          onConfirmar={handleConfirmarEliminar}
          onCancelar={() => setAEliminar(null)}
          eliminando={eliminando}
        />
      )}

      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <button
                className="btn btn-link p-0 text-muted d-flex align-items-center gap-1 mb-2"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={16} /><small>Volver</small>
              </button>
              <h1 className="font-primary fw-bold mb-1">Pre-Ingresos</h1>
              <p className="text-muted mb-0">Solicitudes recibidas desde HubSpot</p>
            </div>
            <button className="btn btn-outline-secondary btn-sm" onClick={refetch}>
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Contadores */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 bg-light">
            <div className="card-body">
              <p className="text-muted small mb-1">Pre-ingresos este mes</p>
              <h3 className="fw-bold mb-0">{stats.totalMes}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 bg-warning bg-opacity-10">
            <div className="card-body">
              <p className="text-muted small mb-1">Pendientes de atender</p>
              <h3 className="fw-bold mb-0 text-warning">{stats.pendientes}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 bg-success bg-opacity-10">
            <div className="card-body">
              <p className="text-muted small mb-1">Procesados</p>
              <h3 className="fw-bold mb-0 text-success">{procesados.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : pendientes.length === 0 ? (
        <div className="text-center py-5">
          <Building2 size={48} className="text-muted mb-3" />
          <p className="text-muted">No hay pre-ingresos pendientes</p>
        </div>
      ) : (
        <>
          <h6 className="text-muted small text-uppercase fw-semibold mb-3">
            Pendientes ({pendientes.length})
          </h6>
          {pendientes.map((p) => (
            <PreIngresoCard key={p.id} preIngreso={p} onVerDetalle={setDetalle} onContinuar={handleContinuar} onEliminar={setAEliminar} />
          ))}
          {procesados.length > 0 && (
            <>
              <h6 className="text-muted small text-uppercase fw-semibold mb-3 mt-4">
                Procesados ({procesados.length})
              </h6>
              {procesados.map((p) => (
                <PreIngresoCard key={p.id} preIngreso={p} onVerDetalle={setDetalle} onContinuar={handleContinuar} onEliminar={setAEliminar} />
              ))}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default ComercialPreIngresos