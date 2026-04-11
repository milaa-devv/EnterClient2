import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Eye, Settings, X, ChevronRight } from 'lucide-react'
import { formatRut } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { EmpresaCompleta } from '@/types/empresa'

// ——— Helpers ——————————————————————————————————————

function getEstadoOB(empresa: EmpresaCompleta): string {
  const onb: any = (empresa as any).empresa_onboarding
  return (Array.isArray(onb) ? onb?.[0]?.estado : onb?.estado) || 'pendiente'
}

function getProgress(empresa: EmpresaCompleta): number {
  const estado = getEstadoOB(empresa).toLowerCase()
  if (estado.includes('complet')) return 100
  if (estado.includes('pap'))     return 90
  if (estado.includes('proceso') || estado.includes('config')) return 50
  if (estado.includes('asign'))   return 10
  return 0
}

function getProgressColor(pct: number): string {
  if (pct === 100) return 'bg-success'
  if (pct >= 50)   return 'bg-info'
  if (pct > 0)     return 'bg-warning'
  return 'bg-secondary'
}

function getEstadoLabel(pct: number, estado: string): string {
  if (pct === 100) return 'Completado'
  if (pct === 0)   return 'Pendiente'
  return estado.charAt(0).toUpperCase() + estado.slice(1)
}

function ProductoBadge({ producto }: { producto?: string | null }) {
  if (!producto) return null
  const isAndes = producto === 'ANDESPOS'
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 4,
      fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
      background: isAndes ? '#0dcaf020' : '#0d6efd20',
      color: isAndes ? '#0a7a8f' : '#0a4db5',
      border: `1px solid ${isAndes ? '#0dcaf060' : '#0d6efd60'}`,
    }}>
      {isAndes ? 'AndesPOS' : 'Enternet'}
    </span>
  )
}

// ——— Modal ————————————————————————————————————————

const TIPOS_NOTIF = [
  'Administración de Folios',
  'Rechazos Comerciales',
  'DTE Proveedores próximos a vencer',
  'Vencimiento de Certificado',
  'Errores Técnicos',
  'Administración Certificado Digital',
]

interface ModalResumenProps {
  empresa: EmpresaCompleta
  onClose: () => void
}

const ModalResumen: React.FC<ModalResumenProps> = ({ empresa, onClose }) => {
  const [preIngreso, setPreIngreso] = useState<any>(null)
  const [loadingPI, setLoadingPI]   = useState(true)

  useEffect(() => {
    const rut = empresa.rut
    if (!rut) { setLoadingPI(false); return }
    supabase
      .from('pre_ingresos')
      .select('*')
      .eq('rut', rut)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setPreIngreso(data)
        setLoadingPI(false)
      })
  }, [empresa.rut])

  const dj         = preIngreso?.datos_json as Record<string, any> | null
  const repData    = preIngreso?.representante as Record<string, any> | null
  const usuarios   = (preIngreso?.usuarios_xlsx    ?? []) as Record<string, any>[]
  const contrapartes = (preIngreso?.contrapartes_xlsx ?? []) as Record<string, any>[]
  const notifs     = (preIngreso?.notificaciones_xlsx ?? []) as Record<string, any>[]
  const prodModal  = preIngreso?.producto ?? (empresa as any).producto

  // Datos extras guardados al enviar
  const actividades  = (dj?.actividades_economicas ?? []) as Record<string, any>[]
  const dtes         = (dj?.documentos_tributarios  ?? []) as Record<string, any>[]
  const planInfo     = dj?.informacion_plan as Record<string, any> | null
  const docInfo      = dj?.documentacion   as Record<string, any> | null

  const descargarArchivo = (dataUrl: string | null, nombre: string) => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = nombre
    a.click()
  }

  const Titulo = ({ text }: { text: string }) => (
    <p className="text-muted fw-semibold small text-uppercase mb-2" style={{ letterSpacing: '0.05em' }}>{text}</p>
  )

  const Fila = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="col-md-6 mb-2">
      <p className="text-muted mb-0" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</p>
      <p className="mb-0 fw-medium" style={{ fontSize: 14 }}>{value || '—'}</p>
    </div>
  )

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="card shadow-lg"
        style={{ width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="card-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <Building2 size={18} />
            <span className="fw-semibold">{empresa.nombre ?? 'Sin nombre'}</span>
            <ProductoBadge producto={prodModal} />
          </div>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="card-body px-4">
          {loadingPI ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary" />
              <p className="text-muted small mt-2">Cargando datos de Comercial…</p>
            </div>
          ) : (
            <>
              {/* Empresa */}
              <Titulo text="Datos de la Empresa" />
              <div className="row mb-4">
                <Fila label="Razón Social"    value={dj?.razon_social ?? empresa.nombre} />
                <Fila label="RUT"             value={dj?.rut ? formatRut(dj.rut) : empresa.rut ? formatRut(empresa.rut) : null} />
                <Fila label="Nombre Fantasía" value={dj?.nombre_fantasia} />
                <Fila label="Correo"          value={dj?.email ?? empresa.correo} />
                <Fila label="Teléfono"        value={dj?.telefono ?? empresa.telefono} />
                <Fila label="Domicilio"       value={dj?.direccion ?? empresa.domicilio} />
                <Fila label="Comuna"          value={dj?.comuna} />
              </div>

              <hr className="my-3" />

              {/* Representante */}
              <Titulo text="Representante Legal" />
              {repData?.nombre ? (
                <ul className="mb-4 small">
                  <li>
                    <strong>{repData.nombre} {repData.apellido}</strong>
                    {repData.rut    && <> · RUT: {formatRut(repData.rut)}</>}
                    {repData.correo && <> · {repData.correo}</>}
                    {repData.telefono && <> · {repData.telefono}</>}
                  </li>
                </ul>
              ) : <p className="text-muted small mb-4">Sin representante registrado</p>}

              {/* Usuarios */}
              {usuarios.filter(u => u.RUT || u.Nombre).length > 0 && (
                <>
                  <hr className="my-3" />
                  <Titulo text="Usuarios de Plataforma" />
                  <ul className="mb-4 small">
                    {usuarios.filter(u => u.RUT || u.Nombre).map((u, i) => (
                      <li key={i}>
                        <strong>{u.Nombre} {u.Apellido}</strong>
                        {u.RUT   && <> · RUT: {u.RUT}</>}
                        {u.Email && <> · {u.Email}</>}
                        {u.Rol   && <span className="text-muted"> · {u.Rol}</span>}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Contrapartes */}
              {contrapartes.filter(c => c['Nombre Completo']).length > 0 && (
                <>
                  <hr className="my-3" />
                  <Titulo text="Contrapartes" />
                  <ul className="mb-4 small">
                    {contrapartes.filter(c => c['Nombre Completo']).map((c, i) => (
                      <li key={i}>
                        <strong>{c['Nombre Completo']}</strong>
                        {c.Tipo && <span className="text-muted"> ({c.Tipo})</span>}
                        {c['Correo Electrónico'] && <> · {c['Correo Electrónico']}</>}
                        {c.Cargo && <span className="text-muted"> · {c.Cargo}</span>}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Notificaciones */}
              {notifs.filter(n => n['Correo Electrónico'] && !String(n['Correo Electrónico']).includes('⚠️')).length > 0 && (
                <>
                  <hr className="my-3" />
                  <Titulo text="Notificaciones" />
                  <ul className="mb-4 small">
                    {notifs
                      .filter(n => n['Correo Electrónico'] && !String(n['Correo Electrónico']).includes('⚠️'))
                      .map((n, i) => {
                        const activos = TIPOS_NOTIF.filter(t => n[t] === 'X' || n[t] === 'x')
                        return (
                          <li key={i}>
                            <strong>{n['Correo Electrónico']}</strong>
                            {activos.length > 0 && <span className="text-muted"> · {activos.join(', ')}</span>}
                          </li>
                        )
                      })}
                  </ul>
                </>
              )}

              {/* Documentación */}
              {(docInfo?.logoNombre || docInfo?.carpetaNombre || docInfo?.vbNombre) && (
                <>
                  <hr className="my-3" />
                  <Titulo text="Documentación Empresa" />
                  <div className="d-flex flex-column gap-1 mb-4 small">
                    {docInfo?.logoNombre && (
                      <p className="mb-0">🖼 Logo:{' '}
                        {docInfo?.logoData
                          ? <button className="btn btn-link p-0 small text-success" style={{ fontSize: 13 }} onClick={() => descargarArchivo(docInfo.logoData, docInfo.logoNombre)}>{docInfo.logoNombre}</button>
                          : <span className="text-muted">{docInfo.logoNombre}</span>
                        }
                      </p>
                    )}
                    {docInfo?.carpetaNombre && (
                      <p className="mb-0">📄 Carpeta Tributaria:{' '}
                        {docInfo?.carpetaData
                          ? <button className="btn btn-link p-0 small text-success" style={{ fontSize: 13 }} onClick={() => descargarArchivo(docInfo.carpetaData, docInfo.carpetaNombre)}>{docInfo.carpetaNombre}</button>
                          : <span className="text-muted">{docInfo.carpetaNombre}</span>
                        }
                      </p>
                    )}
                    {docInfo?.vbNombre && (
                      <p className="mb-0">📋 VB / Propuesta Comercial:{' '}
                        {docInfo?.vbData
                          ? <button className="btn btn-link p-0 small text-success" style={{ fontSize: 13 }} onClick={() => descargarArchivo(docInfo.vbData, docInfo.vbNombre)}>{docInfo.vbNombre}</button>
                          : <span className="text-muted">{docInfo.vbNombre}</span>
                        }
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Actividades Económicas */}
              {actividades.length > 0 && (
                <>
                  <hr className="my-3" />
                  <Titulo text="Actividades Económicas" />
                  <ul className="mb-4 small">
                    {actividades.map((a: any, i: number) => (
                      <li key={i}>
                        <strong>{a.cod}</strong> — {a.nombre}
                        {a.posee_iva !== undefined && (
                          <span className="text-muted"> · {a.posee_iva ? 'Afecta IVA' : 'No afecta IVA'}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Documentos Tributarios */}
              {dtes.length > 0 && (
                <>
                  <hr className="my-3" />
                  <Titulo text="Documentos Tributarios" />
                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {dtes.map((d: any, i: number) => (
                      <span key={i} style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: 4,
                        fontSize: 12, background: '#6c757d20', color: '#495057',
                        border: '1px solid #6c757d40',
                      }}>
                        {d.nombre || d.id}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {/* Plan */}
              <hr className="my-3" />
              <Titulo text="Información del Plan" />
              {planInfo ? (() => {
                const productos   = planInfo.productos as Record<string, boolean> | undefined
                const selections  = planInfo.selections as Record<string, any> | undefined
                const notas       = planInfo.notasTecnicas as Record<string, any> | undefined
                const activos     = productos
                  ? Object.entries(productos).filter(([, v]) => v).map(([k]) => k)
                  : prodModal ? [prodModal] : []

                const labelProd = (p: string) => {
                  if (p === 'TAX' || p === 'ENTERFAC') return 'Enternet (Enterfact)'
                  if (p === 'POS' || p === 'ANDESPOS') return 'AndesPOS'
                  if (p === 'POS_BOX')                 return 'AndesPOS EnterBOX'
                  if (p === 'LCE')                     return 'Libros Contables'
                  return p
                }

                return (
                  <div className="d-flex flex-column gap-2 mb-3">
                    {activos.length > 0 ? activos.map(p => {
                      const sel = selections?.[p]
                      return (
                        <div key={p} className="border rounded p-2">
                          <p className="mb-1 fw-semibold small">{labelProd(p)}</p>
                          {sel?.plan_key && (
                            <p className="mb-1 small">
                              <span className="text-muted">Plan:</span> <strong>{sel.plan_nombre ?? sel.plan_key}</strong>
                              {sel.cod_base && <span className="text-muted"> · {sel.cod_base}</span>}
                            </p>
                          )}
                          {sel?.detalle_base && (
                            <p className="mb-1 small"><span className="text-muted">Detalle:</span> {sel.detalle_base}</p>
                          )}
                          {sel?.addons?.length > 0 && (
                            <ul className="mb-0 small">
                              {sel.addons.map((a: any, i: number) => (
                                <li key={i}>
                                  <strong>{a.key}</strong> · {a.cod}
                                  {a.qty && <span className="text-muted"> · Cant: {a.qty}</span>}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )
                    }) : (
                      <div className="border rounded p-2">
                        <ProductoBadge producto={prodModal} />
                      </div>
                    )}

                    {/* Notas técnicas */}
                    {notas && (notas.integracion?.length || notas.impresora || notas.firma || notas.foliacion || notas.observaciones) && (
                      <div className="p-2 rounded border border-warning" style={{ background: 'rgba(255,193,7,0.08)' }}>
                        <p className="mb-1 small fw-semibold">📋 Notas Técnicas (referencial)</p>
                        {notas.integracion?.length > 0 && <p className="mb-1 small"><span className="text-muted">Integración:</span> {notas.integracion.join(', ')}</p>}
                        {notas.impresora   && <p className="mb-1 small"><span className="text-muted">Impresora:</span> {notas.impresora}</p>}
                        {notas.firma       && <p className="mb-1 small"><span className="text-muted">Firma:</span> {notas.firma}</p>}
                        {notas.foliacion   && <p className="mb-1 small"><span className="text-muted">Foliación:</span> {notas.foliacion}</p>}
                        {notas.observaciones && <p className="mb-0 small"><span className="text-muted">Obs:</span> {notas.observaciones}</p>}
                      </div>
                    )}
                  </div>
                )
              })() : (
                prodModal
                  ? <div className="border rounded p-2"><ProductoBadge producto={prodModal} /></div>
                  : <p className="text-muted small mb-0">Sin plan configurado</p>
              )}
            </>
          )}
        </div>

        <div className="card-footer d-flex justify-content-end">
          <button className="btn btn-outline-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}

// ——— Card principal ———————————————————————————————

interface EmpresaOBCardProps {
  empresa: EmpresaCompleta
}

export const EmpresaOBCard: React.FC<EmpresaOBCardProps> = ({ empresa }) => {
  const navigate   = useNavigate()
  const [showModal, setShowModal] = useState(false)

  const estadoRaw  = getEstadoOB(empresa)
  const pct        = getProgress(empresa)
  const barColor   = getProgressColor(pct)
  const label      = getEstadoLabel(pct, estadoRaw)
  const prod       = (empresa as any).producto
  const isCompleto = pct === 100

  return (
    <>
      {showModal && (
        <ModalResumen empresa={empresa} onClose={() => setShowModal(false)} />
      )}

      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 rounded bg-light">
                <Building2 size={24} className="text-muted" />
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                  <span className="fw-semibold">{empresa.nombre ?? 'Sin nombre'}</span>
                  <ProductoBadge producto={prod} />
                </div>
                <p className="text-muted small mb-0">
                  {empresa.rut ? formatRut(empresa.rut) : '—'}
                </p>
              </div>
            </div>

            <div className="d-flex gap-2 align-items-center">
              <button
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                onClick={() => setShowModal(true)}
              >
                <Eye size={14} /> Ver
              </button>

              {isCompleto ? (
                <button
                  className="btn btn-sm btn-warning d-flex align-items-center gap-1"
                  onClick={() => navigate(`/onboarding/paso-produccion?empkey=${empresa.empkey}`)}
                >
                  <ChevronRight size={14} /> Paso a Producción
                </button>
              ) : (
                <button
                  className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                  onClick={() => navigate(`/configuracion-empresa/${empresa.empkey}`)}
                >
                  <Settings size={14} /> Configurar
                </button>
              )}
            </div>
          </div>

          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-muted">Estado</span>
              <div className="d-flex align-items-center gap-2">
                <span className={`badge fw-normal small ${
                  pct === 100 ? 'bg-success bg-opacity-10 text-success' :
                  pct === 0   ? 'bg-secondary bg-opacity-10 text-secondary' :
                                'bg-info bg-opacity-10 text-info'
                }`}>{label}</span>
                <span className="small fw-semibold">{pct}%</span>
              </div>
            </div>
            <div className="progress" style={{ height: 6 }}>
              <div
                className={`progress-bar ${barColor}`}
                role="progressbar"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}