import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import ConfiguracionEmpresaForm from './ConfiguracionEmpresaForm'

type ProductoKey = 'ENTERFAC' | 'ANDESPOS' | 'ANDESPOS_ENTERBOX' | 'LCE'

// Variable global para prevenir subidas duplicadas (fuera del componente)
let uploadingFileHash: string | null = null

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
          let datosComercial: any = null
          if (data.rut) {
            const { data: preData } = await (supabase as any)
              .from('pre_ingresos')
              .select('datos_json')
              .eq('rut', data.rut)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle()

            if (preData?.datos_json) {
              const dj = preData.datos_json
              if (dj.documentacion) {
                docComercial = dj.documentacion
              }
              // Guardar datos de Comercial (representantes, usuarios, contactos)
              datosComercial = {
                representantes: dj.representantes ?? [],  // ✅ Cambiado de representantes_legales
                usuarios: dj.usuarios ?? [],              // ✅ Cambiado de usuarios_plataforma
                contactos: dj.contactos ?? [],            // ✅ Cambiado de contactos_cliente
              }
            }
          }

          setEmpresa({
            ...data,
            productos: productosFinales,
            producto: productosFinales[0] ?? null,
            docComercial,
            datosComercial,  // Agregar datos de Comercial
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
    console.log('🔵 handleSave llamado', new Date().getTime())
    
    setSaveError(null)
    setSaving(true)
    try {
      if (!empkey) throw new Error('No hay empkey')

      // Determinar el estado según el constraint de la BD
      const esCompletado = payload._completado === true
      const nuevoEstado = esCompletado ? 'completado' : 'en_proceso'

      // Remover banderas internas
      const { _completado, _vistoBuenoFile, ...payloadLimpio } = payload
      
      // Agregar datos de Comercial si existen y no están ya en el payload
      if (empresa?.datosComercial) {
        console.log('🔍 Fusionando datos de Comercial:', empresa.datosComercial);
        
        // Solo agregar si no existen o están vacíos en el payload actual
        if ((!payloadLimpio.representantes || payloadLimpio.representantes.length === 0) 
            && empresa.datosComercial.representantes?.length > 0) {
          console.log('✅ Agregando representantes de Comercial:', empresa.datosComercial.representantes);
          payloadLimpio.representantes = empresa.datosComercial.representantes;
        }
        if ((!payloadLimpio.usuarios || payloadLimpio.usuarios.length === 0) 
            && empresa.datosComercial.usuarios?.length > 0) {
          console.log('✅ Agregando usuarios de Comercial:', empresa.datosComercial.usuarios);
          payloadLimpio.usuarios = empresa.datosComercial.usuarios;
        }
        if ((!payloadLimpio.contactos || payloadLimpio.contactos.length === 0) 
            && empresa.datosComercial.contactos?.length > 0) {
          console.log('✅ Agregando contactos de Comercial:', empresa.datosComercial.contactos);
          payloadLimpio.contactos = empresa.datosComercial.contactos;
        }
      }

      // Si hay un archivo de Visto Bueno para subir
      if (_vistoBuenoFile && _vistoBuenoFile instanceof File) {
        console.log('📁 Archivo detectado:', _vistoBuenoFile.name)
        
        // Crear identificador único del archivo basado en nombre, tamaño y última modificación
        const fileHash = `${_vistoBuenoFile.name}_${_vistoBuenoFile.size}_${_vistoBuenoFile.lastModified}`
        
        console.log('🔑 Hash del archivo:', fileHash)
        console.log('🔒 Hash actual (variable global):', uploadingFileHash)
        
        // Prevenir subidas duplicadas del mismo archivo
        const esArchivoYaSubiendo = uploadingFileHash === fileHash
        
        if (esArchivoYaSubiendo) {
          console.log('⚠️ Archivo ya está siendo subido, saltando subida pero continuando con guardado en BD')
        } else {
          uploadingFileHash = fileHash
          console.log('✅ Hash guardado (variable global):', uploadingFileHash)
          
          try {
            // Función para sanitizar nombre de archivo
            const sanitizeFileName = (name: string): string => {
              return name
                .normalize('NFD') // Descomponer caracteres acentuados
                .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos (acentos)
                .replace(/[^a-zA-Z0-9._-]/g, '_') // Reemplazar caracteres especiales con _
                .replace(/_{2,}/g, '_') // Reemplazar múltiples _ con uno solo
                .replace(/^_+|_+$/g, ''); // Eliminar _ al inicio y final
            };

            // Generar nombre único para el archivo
            const timestamp = Date.now()
            const sanitizedName = sanitizeFileName(_vistoBuenoFile.name)
            const fileName = `${empkey}_${timestamp}_${sanitizedName}`
            const filePath = `visto-bueno/${fileName}`

            console.log('📤 Subiendo archivo:', filePath)

            // Subir archivo a Supabase Storage
            const { error: uploadError } = await supabase.storage
              .from('onboarding-documentos')
                .upload(filePath, _vistoBuenoFile, {
                  cacheControl: '3600',
                  upsert: false
                })

              if (uploadError) throw uploadError

              // Obtener URL pública del archivo
              const { data: publicUrlData } = supabase.storage
                .from('onboarding-documentos')
                .getPublicUrl(filePath)

              console.log('✅ Archivo subido correctamente:', publicUrlData.publicUrl)

              // Actualizar el payload con la URL del archivo
              if (payloadLimpio.enterfac) {
                payloadLimpio.enterfac.url_visto_bueno = publicUrlData.publicUrl
                payloadLimpio.enterfac.visto_bueno_nombre = _vistoBuenoFile.name
              }
            } catch (uploadErr: any) {
              console.error('Error subiendo archivo:', uploadErr)
              throw new Error(`Error al subir el archivo: ${uploadErr.message}`)
            } finally {
              // Limpiar el hash después de 30 segundos para permitir nuevas subidas
              setTimeout(() => {
                uploadingFileHash = null
                console.log('🧹 Hash limpiado (variable global)')
              }, 30000)  // 30 segundos
            }
        }
      }

      // Guardar configuración en la base de datos
      console.log('💾 Guardando en BD con estado:', nuevoEstado)
      
      const { error } = await (supabase as any)
        .from('empresa_onboarding')
        .update({
          configuracion: payloadLimpio,
          estado: nuevoEstado,
        })
        .eq('empkey', Number(empkey))

      if (error) {
        console.error('❌ Error guardando en BD:', error)
        throw error
      }

      console.log('✅ Configuración guardada con estado:', nuevoEstado)

      onSave?.(payloadLimpio)
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