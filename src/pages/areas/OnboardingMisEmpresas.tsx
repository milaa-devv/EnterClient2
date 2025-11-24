import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useEmpresaSearch } from '@/hooks/useEmpresaSearch'
import { useAuth } from '@/hooks/useAuth'
import { formatRut } from '@/lib/utils'
import { Building2 } from 'lucide-react'
import { BackButton } from '@/components/BackButton'



const getOnboardingProgress = (estado?: string | null): number => {
  if (!estado) return 0
  switch (estado) {
    case 'pendiente':
      return 0
    case 'en_proceso':
      return 50
    case 'completado':
      return 100
    case 'cancelado':
      return 0
    default:
      return 0
  }
}

const OnboardingMisEmpresas: React.FC = () => {
  const { empresas, loading, error, reload } = useEmpresaSearch()
  const { profile } = useAuth()
  const rutEjecutivo = profile?.rut

  const empresasAsignadas = useMemo(
    () =>
      empresas.filter(
        (e) => e.empresa_onboarding?.encargado_name === rutEjecutivo
      ),
    [empresas, rutEjecutivo]
  )

  return (
    <div className="container-fluid">
      {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <BackButton fallback="/onboarding/dashboard" />
          <div>
            <h1 className="font-primary fw-bold mb-1">Mis Empresas</h1>
            <p className="text-muted mb-0">
              Empresas asignadas a tu usuario para configurar en Onboarding.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={reload}
        >
          Actualizar listado
        </button>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando empresas asignadas…</p>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {!loading && !error && empresasAsignadas.length === 0 && (
        <div className="text-center py-5">
          <Building2 size={64} className="text-muted mb-3" />
          <h4 className="text-muted mb-2">No tienes empresas asignadas</h4>
          <p className="text-muted mb-0">
            Cuando te asignen empresas, aparecerán en este listado.
          </p>
        </div>
      )}

      {!loading && !error && empresasAsignadas.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0 font-primary fw-semibold">
              Empresas asignadas
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead>
                  <tr>
                    <th>RUT</th>
                    <th>Razón Social</th>
                    <th>Producto</th>
                    <th style={{ minWidth: 200 }}>Progreso Onboarding</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empresasAsignadas.map((empresa) => {
                    const progress = getOnboardingProgress(
                      empresa.empresa_onboarding?.estado ?? null
                    )

                    // Por ahora tomamos el primer producto asociado (si existe)
                    const productoTipo =
                      (empresa as any).empresa_producto?.[0]?.producto?.tipo ??
                      '—'

                    return (
                      <tr key={empresa.empkey}>
                        <td>
                          {empresa.rut ? formatRut(empresa.rut) : 'Sin RUT'}
                        </td>
                        <td>{empresa.nombre || 'Sin razón social'}</td>
                        <td>{productoTipo}</td>
                        <td>
                          <div className="d-flex flex-column">
                            <div className="d-flex justify-content-between small mb-1">
                              <span>{progress}%</span>
                              <span className="text-muted text-capitalize">
                                {empresa.empresa_onboarding?.estado ??
                                  'sin estado'}
                              </span>
                            </div>
                            <div className="progress" style={{ height: 6 }}>
                              <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${progress}%` }}
                                aria-valuenow={progress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="text-end">
                          <Link
                            to={`/configuracion-empresa/${empresa.empkey}`}
                            className="btn btn-sm btn-primary"
                          >
                            Configurar empresa
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OnboardingMisEmpresas
