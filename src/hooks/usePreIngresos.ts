import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface PreIngreso {
  id: number
  nombre_empresa: string | null
  rut: string | null
  contacto: string | null
  origen: string | null
  estado: string | null
  producto: 'ENTERFAC' | 'ANDESPOS' | null
  hs_contact_id: string | null
  representante: {
    nombre?: string
    apellido?: string
    rut?: string
    correo?: string
    telefono?: string
  } | null
  contacto_principal: {
    nombre?: string
    apellido?: string
    telefono?: string
    email?: string
  } | null
  usuarios_xlsx: Record<string, string>[] | null
  contrapartes_xlsx: Record<string, string>[] | null
  notificaciones_xlsx: Record<string, string>[] | null
  archivos_hs: {
    plantilla_usuarios?: string
    plantilla_contraparte?: string
    plantilla_notificaciones?: string
  } | null
  datos_json: Record<string, unknown> | null
  created_at: string | null
  procesado_at: string | null
}

export interface PreIngresoStats {
  totalMes: number
  pendientes: number
}

export function usePreIngresos() {
  const [preIngresos, setPreIngresos] = useState<PreIngreso[]>([])
  const [stats, setStats] = useState<PreIngresoStats>({ totalMes: 0, pendientes: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPreIngresos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('pre_ingresos')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const todos = (data ?? []) as PreIngreso[]
      setPreIngresos(todos)

      // Calcular stats del mes actual
      const ahora = new Date()
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString()

      const totalMes = todos.filter(
        (p) => p.created_at && p.created_at >= inicioMes
      ).length

      const pendientes = todos.filter((p) => p.estado === 'Pendiente').length

      setStats({ totalMes, pendientes })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPreIngresos()
  }, [fetchPreIngresos])

  return { preIngresos, stats, loading, error, refetch: fetchPreIngresos }
}