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

      // ——— Mapeo producto COM → ProductoKey[] para formulario OB ———
      type ProductoKey = 'ENTERFAC' | 'ANDESPOS' | 'ANDESPOS_ENTERBOX' | 'LCE'

      function mapearProducto(val: string | null): ProductoKey[] {
        if (!val) return []
        switch (val) {
          case 'ENTERFAC': case 'TAX':     return ['ENTERFAC']
          case 'ANDESPOS': case 'POS':     return ['ANDESPOS']
          case 'POS_BOX':                  return ['ANDESPOS_ENTERBOX']
          case 'LCE':                      return ['LCE']
          default:                         return []
        }
      }

      const productoDirecto  = mapearProducto(empresaData.producto)
      const productosRelacion = (empresaData.productos ?? [])
        .map((p: any) => mapearProducto(p.producto?.tipo))
        .flat() as ProductoKey[]

      const productosFinales: ProductoKey[] =
        productoDirecto.length > 0 ? productoDirecto :
        productosRelacion.length > 0 ? productosRelacion : []

      // Transformar datos a la estructura esperada
      const empresaCompleta: EmpresaCompleta = {
        empkey: empresaData.empkey,
        estado: (empresaData.estado ?? 'SAC') as any,
        producto: empresaData.producto,
        productos: productosFinales,
        updated_at: empresaData.updated_at ?? undefined,
        comercial: {
          datosGenerales: {
            nombre: empresaData.nombre ?? '',
            rut: empresaData.rut ?? '',
            categoria_tributaria: empresaData.categorias?.map((c: any) => c.categoria.cod) || [],
            logo: empresaData.logo,
            fecha_inicio: empresaData.fecha_inicio ?? null,
          },
          datosContacto: {
            domicilio: empresaData.domicilio ?? '',
            telefono: empresaData.telefono ?? '',
            correo: empresaData.correo ?? ''
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
          usuariosPlataforma: [],
          configuracionNotificaciones: [],
          informacionPlan: { producto: productosFinales[0] as any, productos: productosFinales }
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