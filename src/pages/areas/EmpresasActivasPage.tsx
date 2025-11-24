import React, { useState } from 'react'
import { useEmpresaSearch } from '@/hooks/useEmpresaSearch'
import { EmpresaGrid } from '@/components/EmpresaGrid'

const EmpresasActivasPage: React.FC = () => {
  const [searchText, setSearchText] = useState('')
  const {
    empresas,
    loading,
    currentPage,
    setCurrentPage,
    totalCount,
    setSearchQuery,
  } = useEmpresaSearch()

  // 👉 Por ahora NO filtramos por estado, mostramos todo lo que devuelva el hook
  const empresasActivas = empresas

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchText(value)
    setSearchQuery(value)
  }

  const handleRefresh = () => {
    // truquito simple: forzar nueva búsqueda reseteando el query
    setSearchQuery(searchText.trim())
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col d-flex justify-content-between align-items-center">
          <div>
            <h1 className="font-primary fw-bold mb-1">Empresas activas Onboarding</h1>
            <p className="text-muted mb-0">
              Empresas registradas en el sistema (sin filtrar por estado, solo para pruebas).
            </p>
          </div>

          <button className="btn btn-outline-primary" onClick={handleRefresh}>
            Actualizar listado
          </button>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar empresas por nombre, RUT o empkey"
            value={searchText}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <EmpresaGrid
        empresas={empresasActivas}
        viewMode="grid"
        currentPage={currentPage}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
        loading={loading}
      />
    </div>
  )
}

export default EmpresasActivasPage
