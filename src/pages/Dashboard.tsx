import React, { useState, useEffect } from 'react'
import { useAuth, usePermissions } from '@/hooks/useAuth'
import { EmpresaGrid } from '@/components/EmpresaGrid'
import { useEmpresaSearch } from '@/hooks/useEmpresaSearch'
import { useNavigate } from 'react-router-dom'

const DashboardContent: React.FC = () => {
  const { profile, logout } = useAuth()
  const { canEditComercial } = usePermissions()

  const navigate = useNavigate()

  const [searchText, setSearchText] = useState('')
  const {
    empresas,
    currentPage,
    setCurrentPage,
    totalCount,
    setSearchQuery,
    loading,
    updateFilters,
  } = useEmpresaSearch()

  useEffect(() => {
    // 👇 Empresas activas = COMPLETADAS por todas las áreas
    updateFilters({ estado: 'COMPLETADA' })
  }, [updateFilters])

  if (!profile) return null

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchText(value)
    setSearchQuery(value)
  }

  const handleCrearEmpresa = () => {
    navigate('/comercial/nueva-empresa')
  }

  const getDashboardHeader = () => {
    switch (profile.perfil.nombre) {
      case 'COM':
        return (
          <>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h2 className="mb-0">Empresas activas</h2>
              {canEditComercial() && (
                <button className="btn btn-gradient" onClick={handleCrearEmpresa}>
                  Nueva Empresa
                </button>
              )}
            </div>
            <p className="text-muted mb-0">
              Empresas completadas al 100% por Comercial, Onboarding y SAC.
            </p>
          </>
        )
      case 'OB':
        return <h2>Empresas activas Onboarding</h2>
      case 'ADMIN_OB':
        return <h2>Empresas activas (Admin Onboarding)</h2>
      case 'SAC':
        return <h2>Empresas activas SAC</h2>
      case 'ADMIN_SAC':
        return <h2>Empresas activas (Admin SAC)</h2>
      default:
        return <h2>Empresas activas</h2>
    }
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <h1>Bienvenido {profile.rut}</h1>
            <button className="btn btn-secondary" onClick={logout}>
              Cerrar sesión
            </button>
          </div>

          <input
            type="text"
            placeholder="Buscar empresas por nombre, RUT o empresa"
            value={searchText}
            onChange={handleSearchChange}
            className="form-control mt-3"
          />
        </div>
      </div>

      <div>
        {getDashboardHeader()}
        <div className="mt-3">
          <EmpresaGrid
            empresas={empresas}
            viewMode="grid"
            currentPage={currentPage}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

const Dashboard: React.FC = () => {
  return <DashboardContent />
}

export default Dashboard
