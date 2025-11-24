import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Building2,
  BarChart2,
  ArrowRight
} from 'lucide-react'
import { useEmpresaSearch } from '@/hooks/useEmpresaSearch'
import { useAuth } from '@/hooks/useAuth'
import type { EmpresaCompleta } from '@/types/empresa'
import { formatRut } from '@/lib/utils'
import { BackButton } from '@/components/BackButton'


function getEstadoOnb(e: EmpresaCompleta): string {
  const fromOnb = (e.empresa_onboarding?.estado || '').toString()
  if (fromOnb) return fromOnb
  return (e.estado || 'pendiente').toString()
}

function getProgress(e: EmpresaCompleta): number {
  const estado = getEstadoOnb(e).toUpperCase()

  if (estado.includes('COMPLETA') || estado === 'SAC') return 100
  if (estado.includes('PAP')) return 80
  if (
    estado.includes('ONBOARDING') ||
    estado.includes('PROCESO') ||
    estado.includes('CONFIG')
  )
    return 50
  if (estado.includes('PENDIENTE')) return 0

  return 0
}

function isPendientePAP(e: EmpresaCompleta): boolean {
  const estado = getEstadoOnb(e).toUpperCase()
  return estado.includes('PAP') && !estado.includes('SAC') && !estado.includes('COMPLETA')
}

function isEnSACoCompletada(e: EmpresaCompleta): boolean {
  const estado = getEstadoOnb(e).toUpperCase()
  return estado === 'SAC' || estado.includes('COMPLETA')
}

const OnboardingDashboard: React.FC = () => {
  const { empresas, loading } = useEmpresaSearch()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const isAdminOb = profile?.perfil?.nombre === 'ADMIN_OB'

  const [filtroAsignadas, setFiltroAsignadas] = useState<
    'todas' | 'pendientes' | 'proceso' | 'completadas'
  >('todas')

  // Para OB/ADMIN_OB, el hook ya trae las empresas visibles según perfil
  const asignadas = empresas

  const stats = useMemo(() => {
    const pend = asignadas.filter((e) => getProgress(e) === 0).length
    const proc = asignadas.filter((e) => {
      const p = getProgress(e)
      return p > 0 && p < 100
    }).length
    const comp = asignadas.filter((e) => getProgress(e) === 100).length

    const sinAsignar = isAdminOb
      ? empresas.filter(
        (e) => !e.empresa_onboarding || !e.empresa_onboarding.encargado_name
      ).length
      : 0

    return {
      pendientes: pend,
      enProceso: proc,
      completadas: comp,
      sinAsignar,
    }
  }, [asignadas, empresas, isAdminOb])

  const asignadasFiltradas = useMemo(() => {
    return asignadas.filter((e) => {
      const p = getProgress(e)
      if (filtroAsignadas === 'pendientes') return p === 0
      if (filtroAsignadas === 'proceso') return p > 0 && p < 100
      if (filtroAsignadas === 'completadas') return p === 100
      return true
    })
  }, [asignadas, filtroAsignadas])

  const pendientesPAP = asignadas.filter(isPendientePAP)
  const papEnviados = asignadas.filter(isEnSACoCompletada)

  const scrollToMisEmpresas = (filtro: typeof filtroAsignadas) => {
    setFiltroAsignadas(filtro)
    const el = document.getElementById('onb-mis-empresas')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const renderProgressBar = (p: number) => (
    <div className="progress" style={{ height: 6 }}>
      <div
        className={`progress-bar ${p === 100 ? 'bg-success' : p === 0 ? 'bg-secondary' : 'bg-info'
          }`}
        role="progressbar"
        style={{ width: `${p}%` }}
        aria-valuenow={p}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <BackButton fallback="/onboarding/dashboard" />
              <div>
                <h1 className="font-primary fw-bold mb-1">Dashboard Onboarding</h1>
                <p className="text-muted mb-0">
                  Gestión del proceso de incorporación de empresas
                </p>
              </div>
            </div>
            {/* ...acciones si las tienes... */}
          </div>
        </div>
      </div>


      {/* Estadísticas */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small mb-1">Solicitudes Pendientes</p>
                <h3 className="fw-bold mb-0">{stats.pendientes}</h3>
                <button
                  className="btn btn-link p-0 small"
                  type="button"
                  onClick={() => scrollToMisEmpresas('pendientes')}
                >
                  Requieren asignación
                </button>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 rounded-circle">
                <AlertTriangle className="text-warning" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small mb-1">En Proceso</p>
                <h3 className="fw-bold mb-0">{stats.enProceso}</h3>
                <span className="text-info small">Siendo configuradas</span>
              </div>
              <div className="p-3 bg-info bg-opacity-10 rounded-circle">
                <Clock className="text-info" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small mb-1">Completadas</p>
                <h3 className="fw-bold mb-0">{stats.completadas}</h3>
                <span className="text-success small">Este mes</span>
              </div>
              <div className="p-3 bg-success bg-opacity-10 rounded-circle">
                <CheckCircle className="text-success" size={24} />
              </div>
            </div>
          </div>
        </div>

        {isAdminOb && (
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted small mb-1">Sin Asignar</p>
                  <h3 className="fw-bold mb-0">{stats.sinAsignar}</h3>
                  <span className="text-danger small">Requieren atención</span>
                </div>
                <div className="p-3 bg-danger bg-opacity-10 rounded-circle">
                  <Building2 className="text-danger" size={24} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* Columna izquierda: Mis Empresas Asignadas + PAP */}
        <div className="col-lg-8">
          {/* Mis Empresas Asignadas */}
          <div id="onb-mis-empresas" className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0 font-primary fw-semibold">
                Mis Empresas Asignadas
              </h5>
              <div className="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  className={`btn btn-outline-secondary ${filtroAsignadas === 'todas' ? 'active' : ''
                    }`}
                  onClick={() => setFiltroAsignadas('todas')}
                >
                  Todas
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-secondary ${filtroAsignadas === 'pendientes' ? 'active' : ''
                    }`}
                  onClick={() => setFiltroAsignadas('pendientes')}
                >
                  Pendientes
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-secondary ${filtroAsignadas === 'proceso' ? 'active' : ''
                    }`}
                  onClick={() => setFiltroAsignadas('proceso')}
                >
                  En Proceso
                </button>
                <button
                  type="button"
                  className={`btn btn-outline-secondary ${filtroAsignadas === 'completadas' ? 'active' : ''
                    }`}
                  onClick={() => setFiltroAsignadas('completadas')}
                >
                  Completadas
                </button>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary mb-2" />
                  <p className="text-muted small mb-0">Cargando empresas…</p>
                </div>
              ) : asignadasFiltradas.length === 0 ? (
                <div className="text-center py-4">
                  <Building2 size={40} className="text-muted mb-2" />
                  <p className="text-muted mb-0">
                    No hay empresas asignadas en este momento.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>RUT</th>
                        <th>Razón Social</th>
                        <th>Producto</th>
                        <th style={{ width: 180 }}>Progreso</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {asignadasFiltradas.map((e) => {
                        const p = getProgress(e)
                        const estado = getEstadoOnb(e)
                        return (
                          <tr key={e.empkey}>
                            <td>{e.rut ? formatRut(e.rut) : '—'}</td>
                            <td>{e.nombre || e.nombre_fantasia || 'Sin nombre'}</td>
                            <td>
                              {/* TODO: ajustar cuando tengas el producto real */}
                              {e.estado === 'COMPLETADA' ? 'ENTERFACT' : '—'}
                            </td>
                            <td>
                              <div className="d-flex flex-column">
                                <div className="d-flex justify-content-between mb-1">
                                  <small className="text-muted">{estado}</small>
                                  <small className="fw-semibold">{p}%</small>
                                </div>
                                {renderProgressBar(p)}
                              </div>
                            </td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                type="button"
                                onClick={() =>
                                  navigate(`/configuracion-empresa/${e.empkey}`)
                                }
                              >
                                <BarChart2 size={14} />
                                Configurar
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Empresas PAP (debajo de Mis Empresas Asignadas) */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0 font-primary fw-semibold">
                Empresas pendientes / enviadas a PAP
              </h5>
            </div>
            <div className="card-body row">
              <div className="col-md-6 mb-3 mb-md-0">
                <h6 className="small text-muted text-uppercase mb-2">
                  Pendientes de PAP
                </h6>
                {pendientesPAP.length === 0 ? (
                  <p className="text-muted small mb-0">
                    No hay empresas pendientes de PAP.
                  </p>
                ) : (
                  <ul className="small mb-0">
                    {pendientesPAP.map((e) => (
                      <li key={e.empkey}>
                        {e.nombre || 'Sin nombre'} –{' '}
                        {e.rut ? formatRut(e.rut) : 'Sin RUT'}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="col-md-6">
                <h6 className="small text-muted text-uppercase mb-2">
                  Enviadas a SAC / Completadas
                </h6>
                {papEnviados.length === 0 ? (
                  <p className="text-muted small mb-0">
                    Aún no se han enviado empresas a SAC.
                  </p>
                ) : (
                  <ul className="small mb-0">
                    {papEnviados.map((e) => (
                      <li key={e.empkey}>
                        {e.nombre || 'Sin nombre'} –{' '}
                        {e.rut ? formatRut(e.rut) : 'Sin RUT'}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha: Mis Acciones + PAP pendientes */}
        <div className="col-lg-4">
          {/* Mis Acciones */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0 font-primary fw-semibold">Mis Acciones</h5>
            </div>
            <div className="card-body d-flex flex-column gap-3">
              <button
                className="btn btn-primary d-flex align-items-center justify-content-between"
                type="button"
                onClick={() => scrollToMisEmpresas('pendientes')}
              >
                <span>
                  Configurar Empresa
                  <br />
                  <small className="text-light text-opacity-75">
                    Ver empresas nuevas para configurar
                  </small>
                </span>
                <ArrowRight size={18} />
              </button>

              <button
                className="btn btn-outline-success d-flex align-items-center justify-content-between"
                type="button"
                onClick={() => scrollToMisEmpresas('proceso')}
              >
                <span>
                  Completar Configuración
                  <br />
                  <small className="text-muted">
                    Ver empresas con avance en proceso
                  </small>
                </span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Empresas pendientes a PAP para enviar a SAC */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0 font-primary fw-semibold">
                Empresas pendientes a PAP
              </h5>
            </div>
            <div className="card-body small">
              {pendientesPAP.length === 0 ? (
                <p className="text-muted mb-0">
                  No tienes empresas pendientes de PAP en este momento.
                </p>
              ) : (
                <ul className="mb-3">
                  {pendientesPAP.map((e) => (
                    <li key={e.empkey}>
                      {e.nombre || 'Sin nombre'} –{' '}
                      {e.rut ? formatRut(e.rut) : 'Sin RUT'}
                    </li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                onClick={() => navigate('/onboarding/paso-produccion')}
              >
                Ir a Paso a Producción
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingDashboard
