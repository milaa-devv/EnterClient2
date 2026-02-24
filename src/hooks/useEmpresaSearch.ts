import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

export type OnboardingView = 'todas' | 'configurar' | 'proceso' | 'pap' | 'asignadas'

interface UseEmpresaSearchOptions {
  /** Solo aplica si el usuario es OB / ADMIN_OB */
  obView?: OnboardingView
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

const firstOrSelf = <T,>(v: T | T[] | null | undefined): T | null => {
  if (!v) return null
  return Array.isArray(v) ? (v[0] ?? null) : v
}

export const useEmpresaSearch = (options?: UseEmpresaSearchOptions): UseEmpresaSearchReturn => {
  const { profile } = useAuth()

  const [empresas, setEmpresas] = useState<EmpresaCompleta[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  const [reloadTick, setReloadTick] = useState(0)

  const role = profile?.perfil?.nombre

  // Join "inner" para que el conteo/paginación quede correcto por rol
  const joins = useMemo(() => {
    const isCom = role === 'COM'
    const isOb = role === 'OB' || role === 'ADMIN_OB'
    const isSac = role === 'SAC' || role === 'ADMIN_SAC'

    return {
      comercial: isCom ? 'empresa_comercial!inner' : 'empresa_comercial',
      onboarding: isOb ? 'empresa_onboarding!inner' : 'empresa_onboarding',
      sac: isSac ? 'empresa_sac!inner' : 'empresa_sac',
      isOb,
    }
  }, [role])

  const buildQuery = useCallback(() => {
    return supabase
      .from('empresa')
      .select(
        `
        empkey,
        rut,
        nombre,
        nombre_fantasia,
        estado,
        created_at,
        updated_at,
        fecha_inicio,
        logo,
        domicilio,
        telefono,
        correo,
        ${joins.comercial} (
          nombre_comercial,
          correo_comercial,
          telefono_comercial
        ),
        ${joins.onboarding} (
          estado,
          encargado_name,
          encargado_rut,
          encargado_email,
          encargado_phone,
          fecha_inicio,
          fecha_fin,
          updated_at
        ),
        ${joins.sac} (
          nombre_sac,
          correo_sac,
          telefono_sac,
          direccion_sac,
          horario_atencion
        )
      `,
        { count: 'exact' }
      )
  }, [joins])

  const applyFilters = useCallback(
    (query: any) => {
      // Filtro por estado (columna de empresa)
      if (filters.estado) query = query.eq('estado', filters.estado)

      // Filtro por rango de fechas (usamos updated_at por defecto)
      if (filters.fechaInicio) query = query.gte('updated_at', filters.fechaInicio)
      if (filters.fechaFin) query = query.lte('updated_at', filters.fechaFin)

      // Filtro OB adicional por vista (pendiente / proceso / pap / asignadas)
      if (joins.isOb && options?.obView) {
        const v = options.obView

        if (v === 'configurar') query = query.eq('empresa_onboarding.estado', 'pendiente')
        if (v === 'proceso') query = query.eq('empresa_onboarding.estado', 'en_proceso')
        if (v === 'pap') query = query.ilike('empresa_onboarding.estado', '%PAP%')
        if (v === 'asignadas' && profile?.rut) query = query.eq('empresa_onboarding.encargado_rut', profile.rut)
      }

      return query
    },
    [filters.estado, filters.fechaInicio, filters.fechaFin, joins.isOb, options?.obView, profile?.rut]
  )

  const inFlight = useRef(0)

  const searchEmpresas = useCallback(async () => {
    const ticket = ++inFlight.current

    setLoading(true)
    setError(null)

    try {
      const from = (currentPage - 1) * pageSize
      const to = currentPage * pageSize - 1

      let query = buildQuery()

      // 🔎 Búsqueda server-side (nombre / rut / nombre_fantasia / empkey)
      const q = searchQuery.trim()
      if (q) {
        const parts: string[] = [
          `nombre.ilike.%${q}%`,
          `rut.ilike.%${q}%`,
          `nombre_fantasia.ilike.%${q}%`,
        ]
        if (/^\d+$/.test(q)) parts.push(`empkey.eq.${q}`)
        query = query.or(parts.join(','))
      }

      query = applyFilters(query)

      const { data, error: searchError, count } = await query
        .order('updated_at', { ascending: false, nullsFirst: false })
        .range(from, to)

      // Si hubo otra búsqueda después, ignoramos esta respuesta
      if (ticket !== inFlight.current) return

      if (searchError) throw searchError

      const normalized = ((data as any[]) ?? []).map((row) => ({
        ...row,
        empresa_comercial: firstOrSelf(row.empresa_comercial),
        empresa_onboarding: firstOrSelf(row.empresa_onboarding),
        empresa_sac: firstOrSelf(row.empresa_sac),
      })) as EmpresaCompleta[]

      setEmpresas(normalized)
      setTotalCount(count ?? 0)
    } catch (err: any) {
      setEmpresas([])
      setTotalCount(0)
      setError('Error al buscar empresas: ' + (err?.message ?? String(err)))
    } finally {
      if (ticket === inFlight.current) setLoading(false)
    }
  }, [applyFilters, buildQuery, currentPage, pageSize, searchQuery])

  const reload = useCallback(() => {
    setReloadTick((t) => t + 1)
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      searchEmpresas()
    }, 250)
    return () => window.clearTimeout(timeoutId)
  }, [searchEmpresas, reloadTick])

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }, [])

  return {
    empresas,
    loading,
    error,
    searchQuery,
    setSearchQuery: (q: string) => {
      setSearchQuery(q)
      setCurrentPage(1)
    },
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