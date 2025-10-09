import React, { useState } from 'react'
import { useAuth, usePermissions } from '@/hooks/useAuth'
import { EmpresaGrid } from '@/components/EmpresaGrid'
import { useEmpresaSearch } from '@/hooks/useEmpresaSearch'
import { useNavigate } from 'react-router-dom'

const DashboardContent: React.FC = () => {
  const { profile, logout } = useAuth()
  const {
    canEditComercial,
    canEditSac,
    canEditOnboarding,
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

  const renderDashboardByRole = () => {
    switch (profile.perfil.nombre) {
      case 'COM':
        return (
          <div>
            <h2>Dashboard Comercial</h2>
            {canEditComercial() && (
              <button className="btn btn-gradient mb-3" onClick={handleCrearEmpresa}>
                Crear Empresa Comercial
              </button>
            )}
            <EmpresaGrid
              empresas={empresas}
              viewMode="grid"
              currentPage={currentPage}
              totalCount={totalCount}
              onPageChange={setCurrentPage}
              loading={loading}
            />
          </div>
        )
      case 'OB':
        return (
          <div>
            <h2>Onboarding Ejecutivo</h2>
            {canEditOnboarding() && (
              <button
                className="btn-outline-primary mb-3"
                onClick={() => navigate('/configuracion-empresa')}
              >
                Completar Configuración Empresa
              </button>
            )}
            <EmpresaGrid
              empresas={empresas}
              viewMode="list"
              currentPage={currentPage}
              totalCount={totalCount}
              onPageChange={setCurrentPage}
              loading={loading}
            />
          </div>
        )
      case 'ADMIN_OB':
        return (
          <div>
            <h2>Onboarding Administrador</h2>
            <button>Gestión Administrativa de Onboardings</button>
            <EmpresaGrid
              empresas={empresas}
              viewMode="list"
              currentPage={currentPage}
              totalCount={totalCount}
              onPageChange={setCurrentPage}
              loading={loading}
            />
          </div>
        )
      case 'SAC':
        return (
          <div>
            <h2>SAC Ejecutivo</h2>
            {canEditSac() && (
              <button
                className="btn-acento mb-3"
                onClick={() => navigate('/crear-sac')}
              >
                Crear SAC
              </button>
            )}
            <EmpresaGrid
              empresas={empresas}
              viewMode="list"
              currentPage={currentPage}
              totalCount={totalCount}
              onPageChange={setCurrentPage}
              loading={loading}
            />
          </div>
        )
      case 'ADMIN_SAC':
        return (
          <div>
            <h2>SAC Administrador</h2>
            <button>Gestión Administrativa de SAC</button>
            <EmpresaGrid
              empresas={empresas}
              viewMode="list"
              currentPage={currentPage}
              totalCount={totalCount}
              onPageChange={setCurrentPage}
              loading={loading}
            />
          </div>
        )
      default:
        return (
          <div>
            <h2>Dashboard genérico</h2>
            <EmpresaGrid
              empresas={empresas}
              viewMode="grid"
              currentPage={currentPage}
              totalCount={totalCount}
              onPageChange={setCurrentPage}
              loading={loading}
            />
          </div>
        )
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
      {renderDashboardByRole()}
    </div>
  )
}

const Dashboard: React.FC = () => {
  return <DashboardContent />
}

export default Dashboard
