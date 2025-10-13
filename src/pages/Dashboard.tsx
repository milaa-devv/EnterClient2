import React, { useState } from 'react'
import { useAuth, usePermissions } from '@/hooks/useAuth'
import { EmpresaGrid } from '@/components/EmpresaGrid'
import { useEmpresaSearch } from '@/hooks/useEmpresaSearch'
import { useNavigate } from 'react-router-dom'

const DashboardContent: React.FC = () => {
  const { profile, logout } = useAuth()
  const {
    canEditComercial,
  } = usePermissions()

  const navigate = useNavigate()

  const [searchText, setSearchText] = useState('')
  const {
    empresas,
    currentPage,
    setCurrentPage,
    totalCount,
    setSearchQuery,
    loading,
  } = useEmpresaSearch()

  if (!profile) return null

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchText(value)
    setSearchQuery(value)
  }

  const handleCrearEmpresa = () => {
    navigate('/crear-empresa')
  }

  // Los títulos por rol y opción de crear empresa en Comercial
  const getDashboardHeader = () => {
    switch (profile.perfil.nombre) {
      case 'COM':
        return (
          <>
            <h2>Dashboard Comercial</h2>
            {canEditComercial() && (
              <button className="btn btn-gradient mb-3" onClick={handleCrearEmpresa}>
                Crear Empresa Comercial
              </button>
            )}
          </>
        )
      case 'OB':
        return <h2>Onboarding Ejecutivo</h2>
      case 'ADMIN_OB':
        return <h2>Onboarding Administrador</h2>
      case 'SAC':
        return <h2>SAC Ejecutivo</h2>
      case 'ADMIN_SAC':
        return <h2>SAC Administrador</h2>
      default:
        return <h2>Dashboard</h2>
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
  )
}

const Dashboard: React.FC = () => {
  return <DashboardContent />
}

export default Dashboard
