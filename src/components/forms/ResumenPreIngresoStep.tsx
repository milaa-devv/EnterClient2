import React from 'react'
import { useFormContext } from '@/contexts/FormContext'
import { formatRut } from '@/lib/utils'
import { formatActividadCod } from '@/data/siiActividades'
import { CheckCircle, Image, FileText } from 'lucide-react'

// Índices del flujo pre-ingreso:
// 0 Datos Generales | 1 Datos Contacto | 2 Representantes | 3 Usuarios
// 4 Contrapartes | 5 Notificaciones | 6 Documentación | 7 Actividades
// 8 Docs Tributarios | 9 Plan | 10 Resumen

export const ResumenPreIngresoStep: React.FC = () => {
  const { state, setCurrentStep } = useFormContext()
  const data: any = state.data || {}

  const dg    = data.datosGenerales || {}
  const dc    = data.datosContacto || {}
  const act   = data.actividadesEconomicas || []
  const reps  = data.representantesLegales || []
  const dtes  = data.documentosTributarios || []
  const contras = data.contrapartes || []
  const usuarios = data.usuariosPlataforma || []
  const notifs = data.configuracionNotificaciones || []
  const docs  = data.documentacionEmpresa || {}

  const safeRut = (rut?: string) => (rut ? formatRut(rut) : '—')

  const SeccionCard: React.FC<{ titulo: string; step: number; children: React.ReactNode }> = ({ titulo, step, children }) => (
    <div className="card mb-3">
      <div className="card-header d-flex justify-content-between align-items-center py-2">
        <h6 className="mb-0 fw-semibold">{titulo}</h6>
        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setCurrentStep(step)}>
          Editar
        </button>
      </div>
      <div className="card-body small">{children}</div>
    </div>
  )

  return (
    <div>
      <h5 className="fw-semibold mb-2">Resumen de la información</h5>
      <p className="text-muted small mb-4">
        Revisa que todos los datos estén correctos antes de enviar a Onboarding.
        Puedes hacer clic en <strong>"Editar"</strong> en cada bloque para volver al paso.
      </p>

      <div className="row g-3">
        <div className="col-lg-6 d-flex flex-column gap-0">

          {/* Datos Generales */}
          <SeccionCard titulo="Datos Generales" step={0}>
            <p className="mb-1"><span className="text-muted">Razón Social:</span> <strong>{dg.nombre || '—'}</strong></p>
            <p className="mb-1"><span className="text-muted">RUT:</span> <strong>{safeRut(dg.rut)}</strong></p>
            <p className="mb-1"><span className="text-muted">Nombre Fantasía:</span> {dg.nombreFantasia || '—'}</p>
          </SeccionCard>

          {/* Datos de Contacto */}
          <SeccionCard titulo="Datos de Contacto" step={1}>
            <p className="mb-1"><span className="text-muted">Domicilio:</span> {dc.domicilio || '—'}</p>
            <p className="mb-1"><span className="text-muted">Comuna:</span> {dc.comuna || '—'}</p>
            <p className="mb-1"><span className="text-muted">Región:</span> {dc.region || '—'}</p>
            <p className="mb-1"><span className="text-muted">Teléfono:</span> {dc.telefono || '—'}</p>
            <p className="mb-0"><span className="text-muted">Correo:</span> {dc.correo || '—'}</p>
          </SeccionCard>

          {/* Representantes */}
          <SeccionCard titulo="Representantes Legales" step={2}>
            {reps.length === 0 ? (
              <p className="text-muted mb-0">Sin representantes registrados.</p>
            ) : (
              <ul className="mb-0 ps-3">
                {reps.map((r: any, i: number) => (
                  <li key={i}><strong>{r.nombre}</strong> · RUT: {safeRut(r.rut)} · {r.correo || 'Sin correo'}</li>
                ))}
              </ul>
            )}
          </SeccionCard>

          {/* Usuarios */}
          <SeccionCard titulo="Usuarios de Plataforma" step={3}>
            {usuarios.length === 0 ? (
              <p className="text-muted mb-0">No hay usuarios configurados.</p>
            ) : (
              <ul className="mb-0 ps-3">
                {usuarios.map((u: any, i: number) => (
                  <li key={i}><strong>{u.nombre}</strong> · {u.correo || 'Sin correo'} · Rol: {u.rol || '—'}</li>
                ))}
              </ul>
            )}
          </SeccionCard>

          {/* Contrapartes */}
          <SeccionCard titulo="Contrapartes" step={4}>
            {contras.length === 0 ? (
              <p className="text-muted mb-0">Sin contrapartes registradas.</p>
            ) : (
              <ul className="mb-0 ps-3">
                {contras.map((c: any, i: number) => (
                  <li key={i}><strong>{c.nombre}</strong> ({c.tipo}) · {c.correo || 'Sin correo'}</li>
                ))}
              </ul>
            )}
          </SeccionCard>

        </div>

        <div className="col-lg-6 d-flex flex-column gap-0">

          {/* Notificaciones */}
          <SeccionCard titulo="Notificaciones" step={5}>
            {notifs.length === 0 ? (
              <p className="text-muted mb-0">Sin correos de notificación configurados.</p>
            ) : (
              <ul className="mb-0 ps-3">
                {notifs.map((n: any, i: number) => (
                  <li key={i}>{n.correo} — {n.descripcion || n.tipo || '—'}</li>
                ))}
              </ul>
            )}
          </SeccionCard>

          {/* Documentación */}
          <SeccionCard titulo="Documentación Empresa" step={6}>
            <div className="d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2">
                <Image size={14} className="text-muted" />
                <span className="text-muted">Logo:</span>
                {docs.logoNombre
                  ? <span className="text-success d-flex align-items-center gap-1"><CheckCircle size={13} />{docs.logoNombre}</span>
                  : <span className="text-muted">No adjuntado</span>
                }
              </div>
              <div className="d-flex align-items-center gap-2">
                <FileText size={14} className="text-muted" />
                <span className="text-muted">Carpeta tributaria:</span>
                {docs.carpetaNombre
                  ? <span className="text-success d-flex align-items-center gap-1"><CheckCircle size={13} />{docs.carpetaNombre}</span>
                  : <span className="text-danger">No adjuntada</span>
                }
              </div>
              <div className="d-flex align-items-center gap-2">
                <FileText size={14} className="text-muted" />
                <span className="text-muted">VB / Propuesta Comercial:</span>
                {docs.vbNombre
                  ? <span className="text-success d-flex align-items-center gap-1"><CheckCircle size={13} />{docs.vbNombre}</span>
                  : <span className="text-muted">No adjuntado</span>
                }
              </div>
            </div>
          </SeccionCard>

          {/* Actividades Económicas */}
          <SeccionCard titulo="Actividades Económicas" step={7}>
            {act.length === 0 ? (
              <p className="text-muted mb-0">Sin actividades registradas.</p>
            ) : (
              <ul className="mb-0 ps-3">
                {act.map((a: any, i: number) => (
                  <li key={i}>
                    <strong>{typeof a.cod === 'number' ? formatActividadCod(a.cod) : a.cod}</strong> — {a.nombre}{' '}
                    {a.posee_iva ? '(Afecta IVA)' : '(No afecta IVA)'}
                  </li>
                ))}
              </ul>
            )}
          </SeccionCard>

          {/* Documentos Tributarios */}
          <SeccionCard titulo="Documentos Tributarios" step={8}>
            {dtes.length === 0 ? (
              <p className="text-muted mb-0">No hay documentos configurados.</p>
            ) : (
              <ul className="mb-0 ps-3">
                {dtes.filter((d: any) => d.selected).map((d: any) => (
                  <li key={d.id}>{d.nombre}</li>
                ))}
              </ul>
            )}
          </SeccionCard>

          {/* Plan */}
          <SeccionCard titulo="Información del Plan" step={9}>
            {(() => {
              const plan = data.informacionPlan || {}
              const productos = plan.productos as Record<string, boolean> | undefined
              const selections = plan.selections as Record<string, any> | undefined
              const productosActivos = productos
                ? Object.entries(productos).filter(([, v]) => v).map(([k]) => k)
                : []

              const labelProducto = (p: string) => {
                if (p === 'TAX')     return 'Enterfact'
                if (p === 'POS')     return 'AndesPOS'
                if (p === 'POS_BOX') return 'AndesPOS EnterBOX'
                if (p === 'LCE')     return 'Libros Contables'
                return p
              }

              if (productosActivos.length === 0) {
                return <p className="text-muted mb-0">Sin plan configurado.</p>
              }

              return (
                <div className="d-flex flex-column gap-3">
                  {productosActivos.map(prod => {
                    const sel = selections?.[prod]
                    return (
                      <div key={prod} className="border rounded p-2">
                        <p className="mb-1 fw-semibold">{labelProducto(prod)}</p>
                        {sel?.plan_key ? (
                          <>
                            <p className="mb-1 small">
                              <span className="text-muted">Plan:</span>{' '}
                              <strong>{sel.plan_nombre ?? sel.plan_key}</strong>
                              {sel.cod_base && <span className="text-muted"> · {sel.cod_base}</span>}
                            </p>
                            {sel.detalle_base && (
                              <p className="mb-1 small">
                                <span className="text-muted">Detalle:</span> {sel.detalle_base}
                              </p>
                            )}
                            {sel.addons?.length > 0 && (
                              <div className="mt-1">
                                <p className="mb-1 small text-muted fw-semibold">Add-ons:</p>
                                <ul className="mb-0 small">
                                  {sel.addons.map((a: any, i: number) => (
                                    <li key={i}>
                                      <strong>{a.key}</strong> — {a.titulo?.split('—')[1]?.trim() || a.cod}
                                      {a.qty && <span className="text-muted"> · Cant: {a.qty}</span>}
                                      {a.options?.length > 0 && <span className="text-muted"> · {a.options.join(', ')}</span>}
                                      {a.detalle && <span className="text-muted"> · {a.detalle}</span>}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="mb-0 small text-muted">Sin plan seleccionado</p>
                        )}
                      </div>
                    )
                  })}
                  {plan.notasTecnicas && (
                    <div className="mt-2 p-2 rounded border border-warning" style={{ background: 'rgba(255,193,7,0.08)' }}>
                      <p className="mb-1 small fw-semibold">📋 Notas Técnicas (referencial)</p>
                      {plan.notasTecnicas.integracion?.length > 0 && (
                        <p className="mb-1 small"><span className="text-muted">Integración:</span> {plan.notasTecnicas.integracion.join(', ')}</p>
                      )}
                      {plan.notasTecnicas.impresora && (
                        <p className="mb-1 small"><span className="text-muted">Impresora:</span> {plan.notasTecnicas.impresora}</p>
                      )}
                      {plan.notasTecnicas.firma && (
                        <p className="mb-1 small"><span className="text-muted">Firma:</span> {plan.notasTecnicas.firma}</p>
                      )}
                      {plan.notasTecnicas.foliacion && (
                        <p className="mb-1 small"><span className="text-muted">Foliación:</span> {plan.notasTecnicas.foliacion}</p>
                      )}
                      {plan.notasTecnicas.observaciones && (
                        <p className="mb-0 small"><span className="text-muted">Observaciones:</span> {plan.notasTecnicas.observaciones}</p>
                      )}
                    </div>
                  )}
                  {plan.total > 0 && (
                    <p className="mb-0 small text-muted text-end">
                      Total códigos: <strong>{plan.total}</strong>
                    </p>
                  )}
                </div>
              )
            })()}
          </SeccionCard>

        </div>
      </div>
    </div>
  )
}