// src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { useAuth, usePermissions } from '@/hooks/useAuth'
import { EmpresaGrid } from '@/components/EmpresaGrid'
import { useEmpresaSearch } from '@/hooks/useEmpresaSearch'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

type AdminSacEmpresaRow = {
  empkey: number
  rut: string | null
  nombre: string | null
  logo: string | null

  // (opcionales, por si tu view los trae)
  fecha_paso_produccion?: string | null
  ejecutivo_ob?: string | null
  ejecutivo_sac?: string | null
  estado_final?: string | null
}

const PAGE_SIZE = 12
const ADMIN_SAC_VIEW_NAME = 'vw_empresas_activas_admin_sac' // ✅ nombre de tu VIEW

const DashboardContent: React.FC = () => {
  const { profile, logout } = useAuth()
  const { canEditComercial } = usePermissions()
  const navigate = useNavigate()

  const role = profile?.perfil?.nombre
  const isAdminSac = role === 'ADMIN_SAC'

  const [searchText, setSearchText] = useState('')

  // --- Flujo actual (no Admin SAC) ---
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
    // Solo aplica a vistas “normales”
    if (!isAdminSac) {
      updateFilters({ estado: 'COMPLETADA' })
    }
  }, [updateFilters, isAdminSac])

  // --- Flujo Admin SAC (desde VIEW) ---
  const [adminSacRows, setAdminSacRows] = useState<AdminSacEmpresaRow[]>([])
  const [adminSacLoading, setAdminSacLoading] = useState(false)
  const [adminSacTotal, setAdminSacTotal] = useState(0)
  const [adminSacPage, setAdminSacPage] = useState(1)
  const [adminSacError, setAdminSacError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdminSac) return

    const run = async () => {
      setAdminSacLoading(true)
      setAdminSacError(null)

      const from = (adminSacPage - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const q = searchText.trim()

      let query = supabase
        .from(ADMIN_SAC_VIEW_NAME)
        .select('*', { count: 'exact' })

      // Búsqueda por nombre / rut / (si es número) empkey
      if (q) {
        const parts: string[] = [
          `nombre.ilike.%${q}%`,
          `rut.ilike.%${q}%`,
        ]
        if (/^\d+$/.test(q)) {
          parts.push(`empkey.eq.${q}`)
        }
        query = query.or(parts.join(','))
      }

      const { data, error, count } = await query
        .order('nombre', { ascending: true, nullsFirst: false })
        .range(from, to)

      if (error) {
        setAdminSacError(error.message)
        setAdminSacRows([])
        setAdminSacTotal(0)
      } else {
        setAdminSacRows((data as AdminSacEmpresaRow[]) ?? [])
        setAdminSacTotal(count ?? 0)
      }

      setAdminSacLoading(false)
    }

    run()
  }, [isAdminSac, adminSacPage, searchText])

  if (!profile) return null

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchText(value)

    if (isAdminSac) {
      setAdminSacPage(1)
    } else {
      setSearchQuery(value)
    }
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
        return (
          <>
            <h2 className="mb-1">Empresas activas (Admin SAC)</h2>
            <p className="text-muted mb-0">
              Aquí encontraras todas las empresas activas en producción.
            </p>
          </>
        )
      default:
        return <h2>Empresas activas</h2>
    }
  }
  // Normalizamos data para EmpresaGrid
  const empresasToRender = useMemo(() => {
    if (!isAdminSac) return empresas
    return adminSacRows.map((r) => ({
      empkey: r.empkey,
      rut: r.rut ?? undefined,
      nombre: r.nombre ?? undefined,
      logo: r.logo ?? undefined,
    })) as any
  }, [isAdminSac, empresas, adminSacRows])

  const pageToRender = isAdminSac ? adminSacPage : currentPage
  const totalToRender = isAdminSac ? adminSacTotal : totalCount
  const setPageToRender = isAdminSac ? setAdminSacPage : setCurrentPage
  const loadingToRender = isAdminSac ? adminSacLoading : loading

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
            placeholder="Buscar empresas por nombre, RUT o empkey"
            value={searchText}
            onChange={handleSearchChange}
            className="form-control mt-3"
          />

          {isAdminSac && adminSacError && (
            <div className="alert alert-danger mt-3 mb-0">
              No pude cargar la vista <strong>{ADMIN_SAC_VIEW_NAME}</strong>: {adminSacError}
            </div>
          )}
        </div>
      </div>

      <div>
        {getDashboardHeader()}
        <div className="mt-3">
          <EmpresaGrid
            empresas={empresasToRender}
            viewMode="grid"
            currentPage={pageToRender}
            totalCount={totalToRender}
            onPageChange={setPageToRender}
            loading={loadingToRender}
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
