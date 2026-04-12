import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import ConfiguracionEmpresaForm from './ConfiguracionEmpresaForm'

type ProductoKey = 'ENTERFAC' | 'ANDESPOS' | 'ANDESPOS_ENTERBOX' | 'LCE'

function mapearProducto(val: string | null): ProductoKey[] {
  if (!val) return []
  switch (val) {
    case 'ENTERFAC': case 'TAX':  return ['ENTERFAC']
    case 'ANDESPOS': case 'POS':  return ['ANDESPOS']
    case 'POS_BOX':               return ['ANDESPOS_ENTERBOX']
    case 'LCE':                   return ['LCE']
    default:                      return []
  }
}

const ConfiguracionEmpresaFormWrapper: React.FC<{ onSave?: (data: any) => void }> = ({ onSave }) => {
  const { empkey } = useParams<{ empkey: string }>()
  const [empresa, setEmpresa] = useState<any>(null)
  const [loading, setLoading] = useState(!!empkey)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (!empkey) { setLoading(false); return }

    const load = async () => {
      setLoading(true)
      try {
        const { data } = await (supabase as any)
          .from('empresa')
          .select(`
            empkey, rut, nombre, nombre_fantasia, producto,
            domicilio, telefono, correo, logo, estado,
            empresa_onboarding ( id, estado, encargado_name, encargado_rut, configuracion )
          `)
          .eq('empkey', Number(empkey))
          .single()

        if (data) {
          const productosFinales = mapearProducto(data.producto)
          const ob = Array.isArray(data.empresa_onboarding)
            ? data.empresa_onboarding[0]
            : data.empresa_onboarding

          const configuracionGuardada = ob?.configuracion ?? null

          // Cargar documentación de Comercial (pre_ingresos)
          let docComercial: any = null
          if (data.rut) {
            const { data: preData } = await (supabase as any)
              .from('pre_ingresos')
              .select('datos_json')
              .eq('rut', data.rut)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (preData?.datos_json?.documentacion) {
              docComercial = preData.datos_json.documentacion
            }
          }

          setEmpresa({
            ...data,
            productos: productosFinales,
            producto: productosFinales[0] ?? null,
            docComercial,
            onboarding: configuracionGuardada
              ? { configuracionEmpresa: configuracionGuardada }
              : undefined,
          })
        }
      } catch (err) {
        console.error('Error cargando empresa para OB:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [empkey])

  const handleSave = async (payload: any) => {
    setSaveError(null)
    setSaving(true)
    try {
      if (!empkey) throw new Error('No hay empkey')

      const { error } = await (supabase as any)
        .from('empresa_onboarding')
        .update({
          configuracion: payload,
          estado: 'en_proceso',
        })
        .eq('empkey', Number(empkey))

      if (error) throw error

      onSave?.(payload)
    } catch (err: any) {
      console.error('Error guardando configuración OB:', err)
      setSaveError(err?.message ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando…</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {saveError && (
        <div className="alert alert-danger mx-4 mt-3">{saveError}</div>
      )}
      {saving && (
        <div className="position-fixed top-0 end-0 m-3" style={{ zIndex: 9999 }}>
          <div className="alert alert-info py-2 px-3 d-flex align-items-center gap-2 shadow">
            <span className="spinner-border spinner-border-sm" />
            Guardando…
          </div>
        </div>
      )}
      <ConfiguracionEmpresaForm empresa={empresa} onSave={handleSave} docComercial={empresa?.docComercial} />
    </>
  )
}

export default ConfiguracionEmpresaFormWrapper