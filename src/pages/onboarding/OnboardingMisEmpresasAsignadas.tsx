import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BarChart2, RefreshCcw } from 'lucide-react'

import { BackButton } from '@/components/BackButton'
import { useEmpresaSearch } from '@/hooks/useEmpresaSearch'
import type { EmpresaCompleta } from '@/types/empresa'
import { formatRut } from '@/lib/utils'

type Filtro = 'todas' | 'pendientes' | 'proceso' | 'completadas'

function getEstadoOnb(e: EmpresaCompleta): string {
  const onb: any = (e as any).empresa_onboarding
  const estado = Array.isArray(onb) ? onb?.[0]?.estado : onb?.estado
  return (estado || (e as any).estado || 'pendiente').toString()
}

function getProgress(e: EmpresaCompleta): number {
  const estado = getEstadoOnb(e).toUpperCase()

  if (estado.includes('COMPLETA') || estado === 'SAC') return 100
  if (estado.includes('PAP')) return 80
  if (estado.includes('ONBOARDING') || estado.includes('PROCESO') || estado.includes('CONFIG')) return 50
  if (estado.includes('PENDIENTE')) return 0
  return 0
}

const LOCAL_PAGE_SIZE = 12

const OnboardingMisEmpresasAsignadas: React.FC = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const {
    empresas,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    reload,
    setPageSize,
    setCurrentPage,
  } = useEmpresaSearch()

  useEffect(() => {
    setPageSize(500)
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initialFiltro = (params.get('f') as Filtro) || 'todas'
  const [filtro, setFiltro] = useState<Filtro>(initialFiltro)

  useEffect(() => {
    const f = (params.get('f') as Filtro) || 'todas'
    setFiltro(f)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()])

  const filtradas = useMemo(() => {
    return empresas.filter((e) => {
      const p = getProgress(e)
      if (filtro === 'pendientes') return p === 0
      if (filtro === 'proceso') return p > 0 && p < 100
      if (filtro === 'completadas') return p === 100
      return true
    })
  }, [empresas, filtro])

  // Paginación local
  const [page, setPage] = useState(1)
  useEffect(() => {
    setPage(1)
  }, [searchQuery, filtro, filtradas.length])

  const total = filtradas.length
  const totalPages = Math.max(1, Math.ceil(total / LOCAL_PAGE_SIZE))
  const pageItems = filtradas.slice(
    (page - 1) * LOCAL_PAGE_SIZE,
    (page - 1) * LOCAL_PAGE_SIZE + LOCAL_PAGE_SIZE
  )

  const renderProgressBar = (p: number) => (
    <div className="progress" style={{ height: 6 }}>
      <div
        className={`progress-bar ${p === 100 ? 'bg-success' : p === 0 ? 'bg-secondary' : 'bg-info'}`}
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <BackButton fallback="/onboarding/mis-empresas" />
          <div>
            <h1 className="font-primary fw-bold mb-1">Mis Empresas asignadas</h1>
            <p className="text-muted mb-0">Listado independiente del dashboard.</p>
          </div>
        </div>

        <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={reload}>
          <RefreshCcw size={16} />
          Actualizar
        </button>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre, RUT o empkey…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="col-md-7 d-flex align-items-center justify-content-md-end">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-outline-secondary ${filtro === 'todas' ? 'active' : ''}`}
              onClick={() => setFiltro('todas')}
            >
              Todas
            </button>
            <button
              type="button"
              className={`btn btn-outline-secondary ${filtro === 'pendientes' ? 'active' : ''}`}
              onClick={() => setFiltro('pendientes')}
            >
              Pendientes
            </button>
            <button
              type="button"
              className={`btn btn-outline-secondary ${filtro === 'proceso' ? 'active' : ''}`}
              onClick={() => setFiltro('proceso')}
            >
              En proceso
            </button>
            <button
              type="button"
              className={`btn btn-outline-secondary ${filtro === 'completadas' ? 'active' : ''}`}
              onClick={() => setFiltro('completadas')}
            >
              Completadas
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted mb-0">No hay empresas para este filtro (todavía 👀).</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Empkey</th>
                    <th>RUT</th>
                    <th>Razón Social</th>
                    <th style={{ width: 220 }}>Progreso</th>
                    <th className="text-end"></th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((e) => {
                    const p = getProgress(e)
                    const estado = getEstadoOnb(e)

                    return (
                      <tr key={e.empkey}>
                        <td className="fw-bold text-primary">{e.empkey}</td>
                        <td>{e.rut ? formatRut(e.rut) : '—'}</td>
                        <td>{e.nombre || e.nombre_fantasia || 'Sin nombre'}</td>
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
                            type="button"
                            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2"
                            onClick={() => navigate(`/configuracion-empresa/${e.empkey}`)}
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

      {total > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Anterior
          </button>

          <span className="text-muted small">
            Página <strong>{page}</strong> de <strong>{totalPages}</strong>
          </span>

          <button
            className="btn btn-outline-secondary"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  )
}

export default OnboardingMisEmpresasAsignadas