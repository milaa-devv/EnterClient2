export interface Database {
  public: {
    Tables: {
      actividades_economicas: {
        Row: {
          cod: number
          nombre: string | null
          posee_iva: boolean | null
        }
        Insert: {
          cod?: number
          nombre?: string | null
          posee_iva?: boolean | null
        }
        Update: {
          cod?: number
          nombre?: string | null
          posee_iva?: boolean | null
        }
      }
      administrador_folios: {
        Row: {
          id: number
          nombre: string | null
        }
        Insert: {
          id?: number
          nombre?: string | null
        }
        Update: {
          id?: number
          nombre?: string | null
        }
      }
      box: {
        Row: {
          id: string
          punto_acceso_key: string | null
          punto_acceso_nombre: string | null
          router: string | null
          ip: string | null
          mac_eth0: string | null
          mac_wlan0: string | null
          sucursal_id: string | null
        }
        Insert: {
          id?: string
          punto_acceso_key?: string | null
          punto_acceso_nombre?: string | null
          router?: string | null
          ip?: string | null
          mac_eth0?: string | null
          mac_wlan0?: string | null
          sucursal_id?: string | null
        }
        Update: {
          id?: string
          punto_acceso_key?: string | null
          punto_acceso_nombre?: string | null
          router?: string | null
          ip?: string | null
          mac_eth0?: string | null
          mac_wlan0?: string | null
          sucursal_id?: string | null
        }
      }
      categorias_tributarias: {
        Row: {
          cod: number
          nombre: string | null
        }
        Insert: {
          cod?: number
          nombre?: string | null
        }
        Update: {
          cod?: number
          nombre?: string | null
        }
      }
      codigo_producto: {
        Row: {
          codigo: string
          nombre: string | null
          descripcion: string | null
          producto_id: number | null
        }
        Insert: {
          codigo?: string
          nombre?: string | null
          descripcion?: string | null
          producto_id?: number | null
        }
        Update: {
          codigo?: string
          nombre?: string | null
          descripcion?: string | null
          producto_id?: number | null
        }
      }
      contraparte_administrativa: {
        Row: {
          rut: string
          nombre: string | null
          telefono: string | null
          correo: string | null
        }
        Insert: {
          rut?: string
          nombre?: string | null
          telefono?: string | null
          correo?: string | null
        }
        Update: {
          rut?: string
          nombre?: string | null
          telefono?: string | null
          correo?: string | null
        }
      }
      contraparte_tecnica: {
        Row: {
          rut: string
          nombre: string | null
          telefono: string | null
          correo: string | null
        }
        Insert: {
          rut?: string
          nombre?: string | null
          telefono?: string | null
          correo?: string | null
        }
        Update: {
          rut?: string
          nombre?: string | null
          telefono?: string | null
          correo?: string | null
        }
      }
      empresa: {
        Row: {
          empkey: number
          rut: string
          nombre: string | null
          nombre_fantasia: string | null
          fecha_inicio: string | null
          logo: string | null
          domicilio: string | null
          telefono: string | null
          correo: string | null
          updated_at: string | null
          created_by: string | null
        }
        Insert: {
          empkey?: number
          rut?: string
          nombre?: string | null
          nombre_fantasia?: string | null
          fecha_inicio?: string | null
          logo?: string | null
          domicilio?: string | null
          telefono?: string | null
          correo?: string | null
          updated_at?: string | null
          created_by?: string | null
        }
        Update: {
          empkey?: number
          rut?: string
          nombre?: string | null
          nombre_fantasia?: string | null
          fecha_inicio?: string | null
          logo?: string | null
          domicilio?: string | null
          telefono?: string | null
          correo?: string | null
          updated_at?: string | null
          created_by?: string | null
        }
      }
      empresa_actividad: {
        Row: {
          empkey: number
          cod: number
        }
        Insert: {
          empkey?: number
          cod?: number
        }
        Update: {
          empkey?: number
          cod?: number
        }
      }
      empresa_categoria: {
        Row: {
          empkey: number
          cod: number
        }
        Insert: {
          empkey?: number
          cod?: number
        }
        Update: {
          empkey?: number
          cod?: number
        }
      }
      empresa_comercial: {
        Row: {
          id: number
          empkey: number
          nombre_comercial: string
          correo_comercial: string | null
          telefono_comercial: string | null
        }
        Insert: {
          id?: number
          empkey?: number
          nombre_comercial?: string
          correo_comercial?: string | null
          telefono_comercial?: string | null
        }
        Update: {
          id?: number
          empkey?: number
          nombre_comercial?: string
          correo_comercial?: string | null
          telefono_comercial?: string | null
        }
      }
      empresa_contraparte_adm: {
        Row: {
          empkey: number
          rut: string
        }
        Insert: {
          empkey?: number
          rut?: string
        }
        Update: {
          empkey?: number
          rut?: string
        }
      }
      empresa_contraparte_tecnica: {
        Row: {
          empkey: number
          rut: string
        }
        Insert: {
          empkey?: number
          rut?: string
        }
        Update: {
          empkey?: number
          rut?: string
        }
      }
      empresa_contrato: {
        Row: {
          empresa_id: number
          contrato_id: number
        }
        Insert: {
          empresa_id?: number
          contrato_id?: number
        }
        Update: {
          empresa_id?: number
          contrato_id?: number
        }
      }
      empresa_dte: {
        Row: {
          empresa_id: number
          dte_id: string
        }
        Insert: {
          empresa_id?: number
          dte_id?: string
        }
        Update: {
          empresa_id?: number
          dte_id?: string
        }
      }
      empresa_impuesto: {
        Row: {
          empresa_id: number
          impuesto_id: number
        }
        Insert: {
          empresa_id?: number
          impuesto_id?: number
        }
        Update: {
          empresa_id?: number
          impuesto_id?: number
        }
      }
      empresa_onboarding: {
        Row: {
          id: number
          empkey: number
          encargado_name: string | null
          encargado_email: string | null
          encargado_phone: string | null
          estado: string | null
          fecha_inicio: string | null
          fecha_fin: string | null
          created_at: string | null
          updated_at: string | null
          encargado_rut: string | null
        }
        Insert: {
          id?: number
          empkey?: number
          encargado_name?: string | null
          encargado_email?: string | null
          encargado_phone?: string | null
          estado?: string | null
          fecha_inicio?: string | null
          fecha_fin?: string | null
          created_at?: string | null
          updated_at?: string | null
          encargado_rut?: string | null
        }
        Update: {
          id?: number
          empkey?: number
          encargado_name?: string | null
          encargado_email?: string | null
          encargado_phone?: string | null
          estado?: string | null
          fecha_inicio?: string | null
          fecha_fin?: string | null
          created_at?: string | null
          updated_at?: string | null
          encargado_rut?: string | null
        }
      }
      empresa_producto: {
        Row: {
          empkey: number
          producto_id: number
        }
        Insert: {
          empkey?: number
          producto_id?: number
        }
        Update: {
          empkey?: number
          producto_id?: number
        }
      }
      empresa_representante: {
        Row: {
          empkey: number
          rut: string
        }
        Insert: {
          empkey?: number
          rut?: string
        }
        Update: {
          empkey?: number
          rut?: string
        }
      }
      empresa_sac: {
        Row: {
          id: number
          empkey: number
          nombre_sac: string
          correo_sac: string | null
          telefono_sac: string | null
          direccion_sac: string | null
          horario_atencion: string | null
        }
        Insert: {
          id?: number
          empkey?: number
          nombre_sac?: string
          correo_sac?: string | null
          telefono_sac?: string | null
          direccion_sac?: string | null
          horario_atencion?: string | null
        }
        Update: {
          id?: number
          empkey?: number
          nombre_sac?: string
          correo_sac?: string | null
          telefono_sac?: string | null
          direccion_sac?: string | null
          horario_atencion?: string | null
        }
      }
      empresa_servicio: {
        Row: {
          empresa_id: number
          servicio_id: number
        }
        Insert: {
          empresa_id?: number
          servicio_id?: number
        }
        Update: {
          empresa_id?: number
          servicio_id?: number
        }
      }
      empresa_soporte: {
        Row: {
          empresa_id: number
          soporte_id: number
        }
        Insert: {
          empresa_id?: number
          soporte_id?: number
        }
        Update: {
          empresa_id?: number
          soporte_id?: number
        }
      }
      empresa_sucursal: {
        Row: {
          empkey: number
          id: string
        }
        Insert: {
          empkey?: number
          id?: string
        }
        Update: {
          empkey?: number
          id?: string
        }
      }
      encargado_ef: {
        Row: {
          rut: string
          nombre: string | null
          telefono: string | null
          correo: string | null
          direccion: string | null
          cod_interno: string | null
        }
        Insert: {
          rut?: string
          nombre?: string | null
          telefono?: string | null
          correo?: string | null
          direccion?: string | null
          cod_interno?: string | null
        }
        Update: {
          rut?: string
          nombre?: string | null
          telefono?: string | null
          correo?: string | null
          direccion?: string | null
          cod_interno?: string | null
        }
      }
      encargado_pos: {
        Row: {
          rut: string
          nombre: string | null
          telefono: string | null
          correo: string | null
        }
        Insert: {
          rut?: string
          nombre?: string | null
          telefono?: string | null
          correo?: string | null
        }
        Update: {
          rut?: string
          nombre?: string | null
          telefono?: string | null
          correo?: string | null
        }
      }
      erp: {
        Row: {
          id: string
          nombre: string | null
          version: string | null
          lenguaje: string | null
          bd: string | null
        }
        Insert: {
          id?: string
          nombre?: string | null
          version?: string | null
          lenguaje?: string | null
          bd?: string | null
        }
        Update: {
          id?: string
          nombre?: string | null
          version?: string | null
          lenguaje?: string | null
          bd?: string | null
        }
      }
      ficha_tecnica: {
        Row: {
          id: number
          sistema_id: string | null
          version_so_id: string | null
          version_app_id: string | null
          admin_folios_id: number | null
          integracion_id: number | null
          retorno_id: number | null
          layout_id: string | null
          modo_firma: string | null
          modo_impresion: string | null
        }
        Insert: {
          id?: number
          sistema_id?: string | null
          version_so_id?: string | null
          version_app_id?: string | null
          admin_folios_id?: number | null
          integracion_id?: number | null
          retorno_id?: number | null
          layout_id?: string | null
          modo_firma?: string | null
          modo_impresion?: string | null
        }
        Update: {
          id?: number
          sistema_id?: string | null
          version_so_id?: string | null
          version_app_id?: string | null
          admin_folios_id?: number | null
          integracion_id?: number | null
          retorno_id?: number | null
          layout_id?: string | null
          modo_firma?: string | null
          modo_impresion?: string | null
        }
      }
      historial_movimientos: {
        Row: {
          id: number
          tabla: string
          registro_id: string
          accion: string | null
          cambios: any | null
          usuario: string | null
          fecha: string | null
        }
        Insert: {
          id?: number
          tabla?: string
          registro_id?: string
          accion?: string | null
          cambios?: any | null
          usuario?: string | null
          fecha?: string | null
        }
        Update: {
          id?: number
          tabla?: string
          registro_id?: string
          accion?: string | null
          cambios?: any | null
          usuario?: string | null
          fecha?: string | null
        }
      }
      integracion: {
        Row: {
          id: number
          parser: boolean | null
        }
        Insert: {
          id?: number
          parser?: boolean | null
        }
        Update: {
          id?: number
          parser?: boolean | null
        }
      }
      layout: {
        Row: {
          cod: string
          nombre: string | null
        }
        Insert: {
          cod?: string
          nombre?: string | null
        }
        Update: {
          cod?: string
          nombre?: string | null
        }
      }
      onboarding_notificacion: {
        Row: {
          id: number
          empkey: number
          tipo: string
          descripcion: string | null
          visto: boolean
          created_at: string
        }
        Insert: {
          id?: number
          empkey?: number
          tipo?: string
          descripcion?: string | null
          visto?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          empkey?: number
          tipo?: string
          descripcion?: string | null
          visto?: boolean
          created_at?: string
        }
      }
      pap_sac: {
        Row: {
          empkey: number
          estado: string
          fecha_hora: string | null
          data: any
          updated_at: string
        }
        Insert: {
          empkey?: number
          estado?: string
          fecha_hora?: string | null
          data?: any
          updated_at?: string
        }
        Update: {
          empkey?: number
          estado?: string
          fecha_hora?: string | null
          data?: any
          updated_at?: string
        }
      }
      pap_solicitud: {
        Row: {
          id: number
          empkey: number
          creado_por_rut: string | null
          asignado_a_rut: string | null
          completado_por_rut: string | null
          estado: string
          enviado_a_sac_at: string | null
          inicio_pap_at: string | null
          completado_at: string | null
          comentario: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          empkey?: number
          creado_por_rut?: string | null
          asignado_a_rut?: string | null
          completado_por_rut?: string | null
          estado?: string
          enviado_a_sac_at?: string | null
          inicio_pap_at?: string | null
          completado_at?: string | null
          comentario?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          empkey?: number
          creado_por_rut?: string | null
          asignado_a_rut?: string | null
          completado_por_rut?: string | null
          estado?: string
          enviado_a_sac_at?: string | null
          inicio_pap_at?: string | null
          completado_at?: string | null
          comentario?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      perfil_ef: {
        Row: {
          id: number
          nombre: string | null
        }
        Insert: {
          id?: number
          nombre?: string | null
        }
        Update: {
          id?: number
          nombre?: string | null
        }
      }
      perfil_encargado_ef: {
        Row: {
          perfil_id: number
          rut: string
        }
        Insert: {
          perfil_id?: number
          rut?: string
        }
        Update: {
          perfil_id?: number
          rut?: string
        }
      }
      perfil_encargado_pos: {
        Row: {
          perfil_id: number
          rut: string
        }
        Insert: {
          perfil_id?: number
          rut?: string
        }
        Update: {
          perfil_id?: number
          rut?: string
        }
      }
      perfil_pos: {
        Row: {
          id: number
          nombre: string | null
        }
        Insert: {
          id?: number
          nombre?: string | null
        }
        Update: {
          id?: number
          nombre?: string | null
        }
      }
      perfil_usuarios: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre?: string
        }
        Update: {
          id?: number
          nombre?: string
        }
      }
      producto: {
        Row: {
          id: number
          tipo: string | null
        }
        Insert: {
          id?: number
          tipo?: string | null
        }
        Update: {
          id?: number
          tipo?: string | null
        }
      }
      protocolo_comunicacion: {
        Row: {
          id: number
          nombre: string | null
          descripcion: string | null
        }
        Insert: {
          id?: number
          nombre?: string | null
          descripcion?: string | null
        }
        Update: {
          id?: number
          nombre?: string | null
          descripcion?: string | null
        }
      }
      representante_legal: {
        Row: {
          rut: string
          nombre: string | null
          correo: string | null
          telefono: string | null
        }
        Insert: {
          rut?: string
          nombre?: string | null
          correo?: string | null
          telefono?: string | null
        }
        Update: {
          rut?: string
          nombre?: string | null
          correo?: string | null
          telefono?: string | null
        }
      }
      retorno_integracion: {
        Row: {
          id: number
          nombre: string | null
        }
        Insert: {
          id?: number
          nombre?: string | null
        }
        Update: {
          id?: number
          nombre?: string | null
        }
      }
      servicio: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre?: string
        }
        Update: {
          id?: number
          nombre?: string
        }
      }
      sistema_operativo: {
        Row: {
          id: string
          nombre: string | null
        }
        Insert: {
          id?: string
          nombre?: string | null
        }
        Update: {
          id?: string
          nombre?: string | null
        }
      }
      sucursal_ef: {
        Row: {
          id: string
          nombre: string | null
        }
        Insert: {
          id?: string
          nombre?: string | null
        }
        Update: {
          id?: string
          nombre?: string | null
        }
      }
      sucursal_pos: {
        Row: {
          id: string
          nombre: string | null
          direccion: string | null
          box: boolean | null
          cant_box: number | null
          cajas: number | null
          otros: string | null
        }
        Insert: {
          id?: string
          nombre?: string | null
          direccion?: string | null
          box?: boolean | null
          cant_box?: number | null
          cajas?: number | null
          otros?: string | null
        }
        Update: {
          id?: string
          nombre?: string | null
          direccion?: string | null
          box?: boolean | null
          cant_box?: number | null
          cajas?: number | null
          otros?: string | null
        }
      }
      tipo_contrato: {
        Row: {
          id: number
          nombre: string | null
          descripcion: string | null
        }
        Insert: {
          id?: number
          nombre?: string | null
          descripcion?: string | null
        }
        Update: {
          id?: number
          nombre?: string | null
          descripcion?: string | null
        }
      }
      tipo_dte: {
        Row: {
          id: string
          nombre: string
        }
        Insert: {
          id?: string
          nombre?: string
        }
        Update: {
          id?: string
          nombre?: string
        }
      }
      tipo_impuesto: {
        Row: {
          cod: number
          nombre: string
        }
        Insert: {
          cod?: number
          nombre?: string
        }
        Update: {
          cod?: number
          nombre?: string
        }
      }
      tipo_mensaje: {
        Row: {
          id: number
          nombre: string | null
          descripcion: string | null
        }
        Insert: {
          id?: number
          nombre?: string | null
          descripcion?: string | null
        }
        Update: {
          id?: number
          nombre?: string | null
          descripcion?: string | null
        }
      }
      tipo_soporte: {
        Row: {
          id: number
          nombre: string | null
          descripcion: string | null
        }
        Insert: {
          id?: number
          nombre?: string | null
          descripcion?: string | null
        }
        Update: {
          id?: number
          nombre?: string | null
          descripcion?: string | null
        }
      }
      usuario: {
        Row: {
          rut: string
          nombre: string
          correo: string | null
          telefono: string | null
          perfil_id: number | null
        }
        Insert: {
          rut?: string
          nombre?: string
          correo?: string | null
          telefono?: string | null
          perfil_id?: number | null
        }
        Update: {
          rut?: string
          nombre?: string
          correo?: string | null
          telefono?: string | null
          perfil_id?: number | null
        }
      }
      version_app_full: {
        Row: {
          id: string
          nombre: string | null
        }
        Insert: {
          id?: string
          nombre?: string | null
        }
        Update: {
          id?: string
          nombre?: string | null
        }
      }
      version_sistema_operativo: {
        Row: {
          id: string
          nombre: string | null
          so_id: string | null
        }
        Insert: {
          id?: string
          nombre?: string | null
          so_id?: string | null
        }
        Update: {
          id?: string
          nombre?: string | null
          so_id?: string | null
        }
      }
      vw_empresa_produccion_resumen: {
        Row: {
          empkey: number | null
          rut: string | null
          razon_social: string | null
          fecha_pap_completado: string | null
          ejecutivo_ob: string | null
          ejecutivo_sac: string | null
          estado_final: string | null
        }
        Insert: {
          empkey?: number | null
          rut?: string | null
          razon_social?: string | null
          fecha_pap_completado?: string | null
          ejecutivo_ob?: string | null
          ejecutivo_sac?: string | null
          estado_final?: string | null
        }
        Update: {
          empkey?: number | null
          rut?: string | null
          razon_social?: string | null
          fecha_pap_completado?: string | null
          ejecutivo_ob?: string | null
          ejecutivo_sac?: string | null
          estado_final?: string | null
        }
      }
      vw_empresas_activas_admin_sac: {
        Row: {
          empkey: number | null
          rut: string | null
          nombre: string | null
          logo: string | null
        }
        Insert: {
          empkey?: number | null
          rut?: string | null
          nombre?: string | null
          logo?: string | null
        }
        Update: {
          empkey?: number | null
          rut?: string | null
          nombre?: string | null
          logo?: string | null
        }
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
  }
}
