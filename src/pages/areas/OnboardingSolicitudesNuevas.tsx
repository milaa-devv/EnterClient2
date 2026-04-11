import React, { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { RefreshCcw } from 'lucide-react'
import { useEmpresaSearch } from '@/hooks/useEmpresaSearch'
import { EmpresaOBCard } from '@/components/EmpresaOBCard'
import { BackButton } from '@/components/BackButton'

type View = 'todas' | 'configurar' | 'proceso' | 'pap' | 'asignadas'

const getEmpresaRut = (empresa: any) =>
  empresa?.rut || empresa?.comercial?.datosGenerales?.rut || 'Sin RUT'

const getEmpresaNombre = (empresa: any) =>
  empresa?.nombre || empresa?.nombre_fantasia || 'Sin nombre'

const getObEstado = (empresa: any) =>
  empresa?.empresa_onboarding?.estado ||
  empresa?.empresa_onboarding?.[0]?.estado || ''

const OnboardingSolicitudesNuevas: React.FC = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const view = (params.get('view') as View) || 'todas'

  const hook = (useEmpresaSearch as any)(
    view === 'todas' ? undefined : { obView: view }
  ) as ReturnType<typeof useEmpresaSearch>

  const {
    empresas,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalCount,
    reload,
  } = hook

  const title = useMemo(() => {
    if (view === 'configurar') return 'Empresas para Configurar'
    if (view === 'proceso')    return 'Empresas en Configuración'
    if (view === 'pap')        return 'Empresas Listas para PAP'
    if (view === 'asignadas')  return 'Mis Empresas Asignadas'
    return 'Solicitudes Nuevas'
  }, [view])

  const subtitle = useMemo(() => {
    if (view === 'configurar') return 'Empresas pendientes de iniciar configuración.'
    if (view === 'proceso')    return 'Empresas avanzando por etapas de configuración.'
    if (view === 'pap')        return 'Empresas listas para pasar a Paso a Producción.'
    if (view === 'asignadas')  return 'Empresas donde estás asignado(a) como encargado(a).'
    return 'Empresas pendientes de configurar o en proceso de Onboarding.'
  }, [view])

  const empresasForView = useMemo(() => {
    if (!empresas) return []
    const est = (s: string) => (s || '').toLowerCase()
    if (view === 'configurar') return empresas.filter((e: any) => est(getObEstado(e)) === 'pendiente')
    if (view === 'proceso')    return empresas.filter((e: any) => est(getObEstado(e)).includes('proceso') || est(getObEstado(e)).includes('config'))
    if (view === 'pap')        return empresas.filter((e: any) => est(getObEstado(e)).includes('pap'))
    return empresas
  }, [empresas, view])

  const goToPAP = (empkey: number) => navigate(`/onboarding/paso-produccion?empkey=${empkey}`)

  const LoadingState = () => (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status" />
      <p className="text-muted mt-2">Cargando…</p>
    </div>
  )

  const EmptyState = ({ msg }: { msg: string }) => (
    <div className="text-center py-5 text-muted">{msg}</div>
  )

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          <BackButton fallback="/onboarding/mis-empresas" />
          <div>
            <h1 className="font-primary fw-bold mb-1">{title}</h1>
            <p className="text-muted mb-0">{subtitle}</p>
          </div>
        </div>
        <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={reload}>
          <RefreshCcw size={18} /> Actualizar listado
        </button>
      </div>

      {/* Filtros de vista */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {([
          { key: 'todas',     label: 'Todas' },
          { key: 'configurar',label: 'Pendientes' },
          { key: 'proceso',   label: 'En Proceso' },
          { key: 'asignadas', label: 'Mis Asignadas' },
          { key: 'pap',       label: 'Listas PAP' },
        ] as { key: View; label: string }[]).map(({ key, label }) => (
          <Link
            key={key}
            to={`/onboarding/solicitudes-nuevas?view=${key}`}
            className={`btn btn-sm ${view === key ? 'btn-primary' : 'btn-outline-primary'}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Buscador */}
      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre o RUT…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="col-md-8 d-flex align-items-center justify-content-end">
          <span className="text-muted small">Total: <b>{totalCount}</b></span>
        </div>
      </div>

      {/* Vista PAP — tabla */}
      {view === 'pap' ? (
        <div className="card">
          <div className="card-body">
            {loading ? <LoadingState /> : empresasForView.length === 0 ? (
              <EmptyState msg="No hay empresas listas para PAP." />
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>RUT</th>
                      <th>Razón Social</th>
                      <th className="text-end">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empresasForView.map((empresa: any) => (
                      <tr key={empresa.empkey}>
                        <td>{getEmpresaRut(empresa)}</td>
                        <td>{getEmpresaNombre(empresa)}</td>
                        <td className="text-end">
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => goToPAP(empresa.empkey)}
                          >
                            Ir a PAP
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="d-flex justify-content-between mt-3">
                  <button className="btn btn-outline-secondary" disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>← Anterior</button>
                  <button className="btn btn-outline-secondary" disabled={empresasForView.length === 0}
                    onClick={() => setCurrentPage(currentPage + 1)}>Siguiente →</button>
                </div>
              </div>
            )}
            {error && <p className="text-danger small mt-3 mb-0">{error}</p>}
          </div>
        </div>
      ) : (
        /* Vista cards con EmpresaOBCard */
        <>
          {loading ? (
            <LoadingState />
          ) : empresasForView.length === 0 ? (
            <EmptyState msg="No se encontraron empresas para este filtro." />
          ) : (
            <div>
              {empresasForView.map((empresa: any) => (
                <EmpresaOBCard key={empresa.empkey} empresa={empresa} />
              ))}

              {/* Paginación */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                  className="btn btn-outline-secondary"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >← Anterior</button>
                <span className="text-muted small">Página <strong>{currentPage}</strong></span>
                <button
                  className="btn btn-outline-secondary"
                  disabled={empresasForView.length < 12}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >Siguiente →</button>
              </div>
            </div>
          )}
          {error && <p className="text-danger small mt-3">{error}</p>}
        </>
      )}
    </div>
  )
}

export default OnboardingSolicitudesNuevas