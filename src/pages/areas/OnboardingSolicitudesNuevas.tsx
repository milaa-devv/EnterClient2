import React, { useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { RefreshCcw } from 'lucide-react'
import { useEmpresaSearch } from '@/hooks/useEmpresaSearch'
import { EmpresaGrid } from '@/components/EmpresaGrid'
import { BackButton } from '@/components/BackButton'

type View = 'todas' | 'configurar' | 'proceso' | 'pap' | 'asignadas'

const getEmpresaNombre = (empresa: any) => {
  return (
    empresa?.nombre ||
    empresa?.nombre_fantasia ||
    empresa?.comercial?.datosGenerales?.nombre ||
    empresa?.comercial?.datos_generales?.nombre ||
    empresa?.empresa_comercial?.nombre_comercial ||
    'Sin nombre'
  )
}

const getEmpresaRut = (empresa: any) => {
  return (
    empresa?.rut ||
    empresa?.comercial?.datosGenerales?.rut ||
    empresa?.comercial?.datos_generales?.rut ||
    'Sin RUT'
  )
}

const getObEstado = (empresa: any) => {
  return (
    empresa?.empresa_onboarding?.estado ||
    empresa?.empresa_onboarding?.[0]?.estado || // por si viene como array
    ''
  )
}

const OnboardingSolicitudesNuevas: React.FC = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const view = (params.get('view') as View) || 'todas'

  // ✅ Compatible con tu hook viejo y el nuevo (si tu hook aún no recibe options, no rompe TS)
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
    if (view === 'proceso') return 'Empresas en Configuración'
    if (view === 'pap') return 'Empresas Listas para PAP'
    if (view === 'asignadas') return 'Mis Empresas Asignadas'
    return 'Solicitudes Nuevas'
  }, [view])

  const subtitle = useMemo(() => {
    if (view === 'configurar') return 'Listado de empresas pendientes de iniciar configuración.'
    if (view === 'proceso') return 'Empresas avanzando por etapas de configuración.'
    if (view === 'pap') return 'Empresas listas para pasar a Paso a Producción (PAP).'
    if (view === 'asignadas') return 'Solo las empresas donde tú estás asignado(a) como encargado(a).'
    return 'Empresas pendientes de configurar o en proceso de Onboarding.'
  }, [view])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // ✅ Fallback de filtrado por si aún tienes el hook viejo sin obView
  const empresasForView = useMemo(() => {
    if (!empresas) return []

    const estado = (s: string) => (s || '').toLowerCase()

    if (view === 'configurar') {
      return empresas.filter((e: any) => estado(getObEstado(e)) === 'pendiente')
    }

    if (view === 'proceso') {
      const st = (e: any) => estado(getObEstado(e))
      return empresas.filter((e: any) => st(e).includes('proceso') || st(e).includes('config'))
    }

    if (view === 'pap') {
      return empresas.filter((e: any) => estado(getObEstado(e)).includes('pap'))
    }

    // asignadas idealmente se filtra server-side por encargado_rut en el hook nuevo
    return empresas
  }, [empresas, view])

  const goToPAP = (empkey: number) => {
    // 👇 Ideal: PasoProduccion.tsx lea ?empkey=...
    navigate(`/onboarding/paso-produccion?empkey=${empkey}`)
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div className="d-flex align-items-center gap-3">
          {/* 👇 fallback real, para no volver a una ruta que no existe */}
          <BackButton fallback="/onboarding/mis-empresas" />
          <div>
            <h1 className="font-primary fw-bold mb-1">{title}</h1>
            <p className="text-muted mb-0">{subtitle}</p>
          </div>
        </div>

        <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={reload}>
          <RefreshCcw size={18} />
          Actualizar listado
        </button>
      </div>

      {/* Vistas OB */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <Link
          to="/onboarding/solicitudes-nuevas?view=todas"
          className={`btn btn-sm ${view === 'todas' ? 'btn-primary' : 'btn-outline-primary'}`}
        >
          Todas
        </Link>
        <Link
          to="/onboarding/solicitudes-nuevas?view=configurar"
          className={`btn btn-sm ${view === 'configurar' ? 'btn-primary' : 'btn-outline-primary'}`}
        >
          Configurar
        </Link>
        <Link
          to="/onboarding/solicitudes-nuevas?view=proceso"
          className={`btn btn-sm ${view === 'proceso' ? 'btn-primary' : 'btn-outline-primary'}`}
        >
          En Proceso
        </Link>
        <Link
          to="/onboarding/solicitudes-nuevas?view=asignadas"
          className={`btn btn-sm ${view === 'asignadas' ? 'btn-primary' : 'btn-outline-primary'}`}
        >
          Mis Asignadas
        </Link>
        <Link
          to="/onboarding/solicitudes-nuevas?view=pap"
          className={`btn btn-sm ${view === 'pap' ? 'btn-primary' : 'btn-outline-primary'}`}
        >
          Listas PAP
        </Link>
      </div>

      {/* Buscador */}
      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre, RUT o empkey…"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="col-md-8 d-flex align-items-center justify-content-end">
          <span className="text-muted small">
            Total: <b>{totalCount}</b>
          </span>
        </div>
      </div>

      {/* Vista especial PAP (tabla exacta como pediste) */}
      {view === 'pap' ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status" />
                <div className="text-muted mt-2">Cargando…</div>
              </div>
            ) : empresasForView.length === 0 ? (
              <div className="text-center py-4 text-muted">
                No hay empresas listas para PAP.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Empkey</th>
                      <th>RUT</th>
                      <th>Nombre Empresa</th>
                      <th className="text-end">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empresasForView.map((empresa: any) => (
                      <tr key={empresa.empkey}>
                        <td className="fw-bold text-primary">{empresa.empkey}</td>
                        <td>{getEmpresaRut(empresa)}</td>
                        <td>{getEmpresaNombre(empresa)}</td>
                        <td className="text-end">
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => goToPAP(empresa.empkey)}
                            type="button"
                          >
                            Ir a PAP
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <button
                    className="btn btn-outline-secondary"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    type="button"
                  >
                    ← Anterior
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    disabled={empresasForView.length === 0}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    type="button"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-danger small mt-3 mb-0">{error}</p>}
          </div>
        </div>
      ) : (
        <>
          {/* Vista normal con tu EmpresaGrid */}
          <EmpresaGrid
            empresas={empresasForView}
            viewMode="list"
            currentPage={currentPage}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
            loading={loading}
          />

          {error && <p className="text-danger small mt-3">{error}</p>}
        </>
      )}
    </div>
  )
}

export default OnboardingSolicitudesNuevas