import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, RefreshCcw } from 'lucide-react'

import { BackButton } from '@/components/BackButton'
import { useEmpresaSearch } from '@/hooks/useEmpresaSearch'
import type { EmpresaCompleta } from '@/types/empresa'
import { formatRut } from '@/lib/utils'

function getEstadoOnb(e: EmpresaCompleta): string {
  // Por si la relación viene como array u objeto
  const onb: any = (e as any).empresa_onboarding
  const estado = Array.isArray(onb) ? onb?.[0]?.estado : onb?.estado
  return (estado || (e as any).estado || 'pendiente').toString()
}

function getEmpkeyConfigurado(e: EmpresaCompleta): string {
  // Obtener el empkey del formulario de configuración
  const onb: any = (e as any).empresa_onboarding
  const config = Array.isArray(onb) ? onb?.[0]?.configuracion : onb?.configuracion
  
  // Intentar obtener el empkey de enterfac o andespos
  const empkeyEnterfac = config?.enterfac?.empkey
  const empkeyAndespos = config?.andespos?.empkey
  
  // Retornar el que esté disponible, o el empkey interno como fallback
  return empkeyEnterfac || empkeyAndespos || String(e.empkey || '—')
}

function isPendientePAP(e: EmpresaCompleta): boolean {
  const estado = getEstadoOnb(e).toLowerCase()
  // Estados según el constraint de BD: 'pendiente', 'en_proceso', 'completado', 'cancelado'
  // 'completado' significa que está listo para PAP
  return estado === 'completado'
}

const LOCAL_PAGE_SIZE = 12

const PasoProduccionListado: React.FC = () => {
  const navigate = useNavigate()
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

  // Traemos hartas para no quedar cortos por la paginación del hook
  useEffect(() => {
    setPageSize(500)
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pendientes = useMemo(() => empresas.filter(isPendientePAP), [empresas])

  // Paginación local simple
  const [page, setPage] = useState(1)
  useEffect(() => {
    setPage(1)
  }, [searchQuery, pendientes.length])

  const total = pendientes.length
  const totalPages = Math.max(1, Math.ceil(total / LOCAL_PAGE_SIZE))
  const pageItems = pendientes.slice(
    (page - 1) * LOCAL_PAGE_SIZE,
    (page - 1) * LOCAL_PAGE_SIZE + LOCAL_PAGE_SIZE
  )

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <BackButton fallback="/onboarding/mis-empresas" />
          <div>
            <h1 className="font-primary fw-bold mb-1">Paso a Producción</h1>
            <p className="text-muted mb-0">
              Empresas listas para PAP (Empkey · RUT · Nombre) + botón para abrir el formulario.
            </p>
          </div>
        </div>

        <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={reload}>
          <RefreshCcw size={16} />
          Actualizar listado
        </button>
      </div>

      <div className="row mb-3">
        <div className="col-md-5">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre, RUT o empkey…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="col-md-7 d-flex align-items-center justify-content-md-end mt-2 mt-md-0">
          <span className="text-muted small">
            Mostrando <strong>{Math.min(total, (page - 1) * LOCAL_PAGE_SIZE + pageItems.length)}</strong> de{' '}
            <strong>{total}</strong>
          </span>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : pendientes.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted mb-0">No hay empresas listas para PAP por ahora 👀</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Empkey</th>
                    <th>RUT</th>
                    <th>Empresa</th>
                    <th className="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((e) => {
                    const empkeyMostrar = getEmpkeyConfigurado(e)
                    return (
                      <tr key={e.empkey}>
                        <td className="fw-bold text-primary">{empkeyMostrar}</td>
                        <td>{e.rut ? formatRut(e.rut) : '—'}</td>
                        <td>{e.nombre || e.nombre_fantasia || 'Sin nombre'}</td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2"
                            onClick={() => {
                              // Enviamos el empkey INTERNO para que funcione la consulta
                              const qs = new URLSearchParams({
                                empkey: String(e.empkey ?? ''),  // Empkey interno para la query
                                rut: e.rut ?? '',
                                nombre: e.nombre ?? e.nombre_fantasia ?? '',
                              })
                              navigate(`/onboarding/paso-produccion?${qs.toString()}`)
                            }}
                          >
                            Ir a PAP <ArrowRight size={16} />
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

export default PasoProduccionListado