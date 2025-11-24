import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { EmpresaCompleta } from '@/types/empresa'

interface SearchFilters {
  estado?: 'COMERCIAL' | 'ONBOARDING' | 'SAC' | 'COMPLETADA'
  producto?: 'ENTERFAC' | 'ANDESPOS'
  fechaInicio?: string
  fechaFin?: string
  categoria?: string
}

interface UseEmpresaSearchReturn {
  empresas: EmpresaCompleta[]
  loading: boolean
  error: string | null
  searchQuery: string
  setSearchQuery: (query: string) => void
  filters: SearchFilters
  updateFilters: (newFilters: Partial<SearchFilters>) => void
  totalCount: number
  currentPage: number
  setCurrentPage: (page: number) => void
  pageSize: number
  setPageSize: (size: number) => void
  /** 🔄 Forzar recarga manual desde las pantallas (btn “Actualizar listado”) */
  reload: () => void
}

export const useEmpresaSearch = (): UseEmpresaSearchReturn => {
  const [empresas, setEmpresas] = useState<EmpresaCompleta[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  const { profile } = useAuth()

  const buildQuery = useCallback(() => {
    return supabase
      .from('empresa')
      .select(
        `
        empkey,
        rut,
        nombre,
        nombre_fantasia,
        fecha_inicio,
        logo,
        domicilio,
        telefono,
        correo,
        empresa_comercial (
          nombre_comercial,
          correo_comercial,
          telefono_comercial
        ),
        empresa_onboarding (
          estado,
          encargado_name,
          encargado_email,
          encargado_phone,
          fecha_inicio,
          fecha_fin
        ),
        empresa_sac (
          nombre_sac,
          correo_sac,
          telefono_sac,
          direccion_sac,
          horario_atencion
        )
      `,
        { count: 'exact' }
      )
  }, [])

  const filterEmpresasByProfile = useCallback(
    (data: EmpresaCompleta[]) => {
      if (!profile) return []

      const filtered = data.filter((e) => {
        let keep = true

        switch (profile.perfil.nombre) {
          case 'COM':
            keep = !!e.empresa_comercial
            break
          case 'ADMIN_OB':
            // Admin OB ve todas las que tengan registro onboarding
            keep = !!e.empresa_onboarding
            break
          case 'OB':
            // Ejecutivo OB ve todas las empresas (para tests / solicitudes nuevas)
            keep = !!e.empresa_onboarding
            break
          case 'ADMIN_SAC':
          case 'SAC':
            keep = !!e.empresa_sac
            break
          default:
            keep = true
            break
        }

        return keep
      })

      return filtered
    },
    [profile]
  )

  const searchEmpresas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const query = buildQuery().range(
        (currentPage - 1) * pageSize,
        currentPage * pageSize - 1
      )

      const { data, error: searchError } = await query
      if (searchError) throw searchError

      let filtered = filterEmpresasByProfile((data || []) as EmpresaCompleta[])

      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        filtered = filtered.filter(
          (e) =>
            (e.nombre?.toLowerCase() || '').includes(q) ||
            (e.rut?.toString() || '').includes(q) ||
            (e.nombre_fantasia?.toLowerCase() || '').includes(q)
        )
      }

      setEmpresas(filtered)
      setTotalCount(filtered.length)
    } catch (err: any) {
      setError('Error al buscar empresas: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [buildQuery, currentPage, pageSize, filterEmpresasByProfile, searchQuery])

  // 🔄 función pública para que las pantallas puedan refrescar a mano
  const reload = useCallback(() => {
    // si quieres que siempre vuelva a página 1 al refrescar:
    setCurrentPage(1)
    searchEmpresas()
  }, [searchEmpresas])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchEmpresas()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchEmpresas])

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }, [])

  return {
    empresas,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    totalCount,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    reload,
  }
}
