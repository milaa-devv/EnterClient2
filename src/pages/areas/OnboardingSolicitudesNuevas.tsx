import React from 'react'
import { useEmpresaSearch } from '@/hooks/useEmpresaSearch'
import { EmpresaGrid } from '@/components/EmpresaGrid'
import { BackButton } from '@/components/BackButton'


const OnboardingSolicitudesNuevas: React.FC = () => {
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
  } = useEmpresaSearch()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <BackButton fallback="/onboarding/dashboard" />
          <div>
            <h1 className="font-primary fw-bold mb-1">Solicitudes Nuevas</h1>
            <p className="text-muted mb-0">
              Empresas pendientes de configurar o en proceso de Onboarding.
            </p>
          </div>
        </div>
        <button className="btn btn-outline-primary" onClick={reload}>
          Actualizar listado
        </button>
      </div>



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
      </div>

      <EmpresaGrid
        empresas={empresas}
        viewMode="list"
        currentPage={currentPage}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        loading={loading}
      />

      {error && (
        <p className="text-danger small mt-3">
          {error}
        </p>
      )}
    </div>
  )
}

export default OnboardingSolicitudesNuevas
