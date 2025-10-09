import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { EmpresaCompleta } from '@/types/empresa'

interface UseEmpresaDetailReturn {
  empresa: EmpresaCompleta | null
  loading: boolean
  error: string | null
  refreshEmpresa: () => void
}

export const useEmpresaDetail = (empkey: number | null): UseEmpresaDetailReturn => {
  const [empresa, setEmpresa] = useState<EmpresaCompleta | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEmpresaDetail = async () => {
    if (!empkey) return

    setLoading(true)
    setError(null)

    try {
      // Cargar datos principales de la empresa
      const { data: empresaData, error: empresaError } = await supabase
        .from('empresa')
        .select(`
          *,
          categorias:empresa_categoria(categoria:categorias_tributarias(*)),
          actividades:empresa_actividad(actividad:actividades_economicas(*)),
          representantes:empresa_representante(representante:representante_legal(*)),
          contrapartes_tecnicas:empresa_contraparte_tecnica(contraparte:contraparte_tecnica(*)),
          contrapartes_admin:empresa_contraparte_adm(contraparte:contraparte_administrativa(*)),
          productos:empresa_producto(producto:producto(*)),
          dte:empresa_dte(documento:tipo_dte(*)),
          sucursales:empresa_sucursal(sucursal:sucursal_pos(*)),
          servicios:empresa_servicio(servicio:servicio(*))
        `)
        .eq('empkey', empkey)
        .single()

      if (empresaError) throw empresaError

      // Transformar datos a la estructura esperada
      const empresaCompleta: EmpresaCompleta = {
        id: empresaData.id,
        empkey: empresaData.empkey,
        estado: empresaData.estado,
        created_at: empresaData.created_at,
        updated_at: empresaData.updated_at,
        comercial: {
          datosGenerales: {
            nombre: empresaData.nombre,
            rut: empresaData.rut,
            categoria_tributaria: empresaData.categorias?.map((c: any) => c.categoria.cod) || [],
            logo: empresaData.logo,
            fecha_inicio: empresaData.fecha_inicio
          },
          datosContacto: {
            domicilio: empresaData.domicilio,
            telefono: empresaData.telefono,
            correo: empresaData.correo
          },
          actividadesEconomicas: empresaData.actividades?.map((a: any) => a.actividad) || [],
          representantesLegales: empresaData.representantes?.map((r: any) => r.representante) || [],
          documentosTributarios: empresaData.dte?.map((d: any) => ({
            ...d.documento,
            selected: true
          })) || [],
          contrapartes: [
            ...(empresaData.contrapartes_tecnicas?.map((c: any) => ({
              ...c.contraparte,
              tipo: 'TECNICA' as const
            })) || []),
            ...(empresaData.contrapartes_admin?.map((c: any) => ({
              ...c.contraparte,
              tipo: 'ADMINISTRATIVA' as const
            })) || [])
          ],
          usuariosPlataforma: [], // Se cargaría desde otra tabla si existe
          configuracionNotificaciones: [],
          informacionPlan: empresaData.productos?.[0]?.producto || null
        }
      }

      setEmpresa(empresaCompleta)

    } catch (err: any) {
      console.error('Error cargando empresa:', err)
      setError('Error al cargar la información de la empresa: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const refreshEmpresa = () => {
    loadEmpresaDetail()
  }

  useEffect(() => {
    if (empkey) {
      loadEmpresaDetail()
    }
  }, [empkey])

  return {
    empresa,
    loading,
    error,
    refreshEmpresa
  }
}
