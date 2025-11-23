import React from 'react'
import { useFormContext } from '@/contexts/FormContext'
import { formatRut } from '@/lib/utils'

export const ResumenStep: React.FC = () => {
  const { state, setCurrentStep } = useFormContext()
  const data: any = state.data || {}

  const dg = data.datosGenerales || {}
  const dc = data.datosContacto || {}
  const act = data.actividadesEconomicas || []
  const reps = data.representantesLegales || []
  const dtes = data.documentosTributarios || []
  const contras = data.contrapartes || []
  const usuarios = data.usuariosPlataforma || []
  const notifs = data.configuracionNotificaciones || []
  const plan = data.informacionPlan || {}

  const goToStep = (index: number) => setCurrentStep(index)

  const safeRut = (rut?: string) => (rut ? formatRut(rut) : '—')

  return (
    <div className="resumen-step">
      <h5 className="mb-3">Resumen de la información ingresada</h5>
      <p className="text-muted small mb-4">
        Revisa que todos los datos estén correctos antes de enviar la empresa a Onboarding.
        Puedes hacer clic en <strong>“Editar”</strong> en cada bloque para volver al paso
        correspondiente.
      </p>

      <div className="row g-3">
        {/* Columna izquierda */}
        <div className="col-lg-6 d-flex flex-column gap-3">
          {/* Datos Generales */}
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Datos Generales</h6>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => goToStep(0)}
              >
                Editar
              </button>
            </div>
            <div className="card-body small">
              <p className="mb-1">
                <span className="text-muted">Razón Social:</span>{' '}
                <strong>{dg.nombre || '—'}</strong>
              </p>
              <p className="mb-1">
                <span className="text-muted">RUT:</span>{' '}
                <strong>{safeRut(dg.rut)}</strong>
              </p>
              <p className="mb-1">
                <span className="text-muted">Categoría tributaria:</span>{' '}
                {dg.categoria_tributaria?.length
                  ? dg.categoria_tributaria.join(', ')
                  : '—'}
              </p>
              <p className="mb-0">
                <span className="text-muted">Fecha inicio actividades:</span>{' '}
                {dg.fecha_inicio || '—'}
              </p>
            </div>
          </div>

          {/* Datos de Contacto */}
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Datos de Contacto</h6>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => goToStep(1)}
              >
                Editar
              </button>
            </div>
            <div className="card-body small">
              <p className="mb-1">
                <span className="text-muted">Domicilio:</span>{' '}
                {dc.domicilio || '—'}
              </p>
              <p className="mb-1">
                <span className="text-muted">Teléfono:</span>{' '}
                {dc.telefono || '—'}
              </p>
              <p className="mb-0">
                <span className="text-muted">Correo:</span>{' '}
                {dc.correo || '—'}
              </p>
            </div>
          </div>

          {/* Actividades Económicas */}
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Actividades Económicas</h6>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => goToStep(2)}
              >
                Editar
              </button>
            </div>
            <div className="card-body small">
              {act.length === 0 ? (
                <p className="text-muted mb-0">Sin actividades registradas.</p>
              ) : (
                <ul className="mb-0">
                  {act.map((a: any, idx: number) => (
                    <li key={idx}>
                      <strong>{a.cod}</strong> — {a.nombre}{' '}
                      {a.posee_iva ? '(Afecta IVA)' : '(No afecta IVA)'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Representantes Legales */}
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Representantes Legales</h6>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => goToStep(3)}
              >
                Editar
              </button>
            </div>
            <div className="card-body small">
              {reps.length === 0 ? (
                <p className="text-muted mb-0">Sin representantes registrados.</p>
              ) : (
                <ul className="mb-0">
                  {reps.map((r: any, idx: number) => (
                    <li key={idx}>
                      <strong>{r.nombre}</strong> · RUT: {safeRut(r.rut)} ·{' '}
                      {r.correo || 'Sin correo'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="col-lg-6 d-flex flex-column gap-3">
          {/* Documentos Tributarios */}
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Documentos Tributarios</h6>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => goToStep(4)}
              >
                Editar
              </button>
            </div>
            <div className="card-body small">
              {dtes.length === 0 ? (
                <p className="text-muted mb-0">No hay documentos configurados.</p>
              ) : (
                <ul className="mb-0">
                  {dtes
                    .filter((d: any) => d.selected)
                    .map((d: any) => (
                      <li key={d.id}>{d.nombre}</li>
                    ))}
                </ul>
              )}
            </div>
          </div>

          {/* Contrapartes */}
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Contrapartes</h6>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => goToStep(5)}
              >
                Editar
              </button>
            </div>
            <div className="card-body small">
              {contras.length === 0 ? (
                <p className="text-muted mb-0">Sin contrapartes registradas.</p>
              ) : (
                <ul className="mb-0">
                  {contras.map((c: any, idx: number) => (
                    <li key={idx}>
                      <strong>{c.nombre}</strong> ({c.tipo}) ·{' '}
                      {c.correo || 'Sin correo'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Usuarios de Plataforma */}
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Usuarios de Plataforma</h6>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => goToStep(6)}
              >
                Editar
              </button>
            </div>
            <div className="card-body small">
              {usuarios.length === 0 ? (
                <p className="text-muted mb-0">No hay usuarios configurados.</p>
              ) : (
                <ul className="mb-0">
                  {usuarios.map((u: any, idx: number) => (
                    <li key={idx}>
                      <strong>{u.nombre}</strong> · {u.correo || 'Sin correo'} · Rol:{' '}
                      {u.rol || '—'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Notificaciones & Plan */}
          <div className="card h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Notificaciones &amp; Plan</h6>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => goToStep(7)}
                >
                  Editar Notificaciones
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => goToStep(8)}
                >
                  Editar Plan
                </button>
              </div>
            </div>
            <div className="card-body small">
              <h6 className="text-muted text-uppercase small mb-2">
                Notificaciones
              </h6>
              {notifs.length === 0 ? (
                <p className="text-muted mb-2">Sin correos de notificación configurados.</p>
              ) : (
                <ul>
                  {notifs.map((n: any, idx: number) => (
                    <li key={idx}>
                      {n.correo} — {n.descripcion || 'Sin descripción'}
                    </li>
                  ))}
                </ul>
              )}

              <h6 className="text-muted text-uppercase small mt-3 mb-2">
                Información del Plan
              </h6>
              <p className="mb-1">
                <span className="text-muted">Producto:</span>{' '}
                {plan.producto || '—'}
              </p>
              <p className="mb-1">
                <span className="text-muted">Código de plan:</span>{' '}
                {plan.codigo_plan || '—'}
              </p>
              <p className="mb-0">
                <span className="text-muted">Nombre / Precio:</span>{' '}
                {plan.plan_nombre || '—'}{' '}
                {plan.precio ? ` · ${plan.precio}` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
