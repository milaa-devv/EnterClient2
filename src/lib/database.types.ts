export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      actividades_economicas: {
        Row: {
          cod: number
          nombre: string | null
          posee_iva: boolean | null
        }
        Insert: {
          cod: number
          nombre?: string | null
          posee_iva?: boolean | null
        }
        Update: {
          cod?: number
          nombre?: string | null
          posee_iva?: boolean | null
        }
        Relationships: []
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
        Relationships: []
      }
      box: {
        Row: {
          id: string
          ip: string | null
          mac_eth0: string | null
          mac_wlan0: string | null
          punto_acceso_key: string | null
          punto_acceso_nombre: string | null
          router: string | null
          sucursal_id: string | null
        }
        Insert: {
          id: string
          ip?: string | null
          mac_eth0?: string | null
          mac_wlan0?: string | null
          punto_acceso_key?: string | null
          punto_acceso_nombre?: string | null
          router?: string | null
          sucursal_id?: string | null
        }
        Update: {
          id?: string
          ip?: string | null
          mac_eth0?: string | null
          mac_wlan0?: string | null
          punto_acceso_key?: string | null
          punto_acceso_nombre?: string | null
          router?: string | null
          sucursal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "box_sucursal_id_fkey"
            columns: ["sucursal_id"]
            isOneToOne: true
            referencedRelation: "sucursal_pos"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_tributarias: {
        Row: {
          cod: number
          nombre: string | null
        }
        Insert: {
          cod: number
          nombre?: string | null
        }
        Update: {
          cod?: number
          nombre?: string | null
        }
        Relationships: []
      }
      codigo_producto: {
        Row: {
          codigo: string
          descripcion: string | null
          nombre: string | null
          producto_id: number | null
        }
        Insert: {
          codigo: string
          descripcion?: string | null
          nombre?: string | null
          producto_id?: number | null
        }
        Update: {
          codigo?: string
          descripcion?: string | null
          nombre?: string | null
          producto_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "codigo_producto_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "producto"
            referencedColumns: ["id"]
          },
        ]
      }
      contraparte_administrativa: {
        Row: {
          correo: string | null
          nombre: string | null
          rut: string
          telefono: string | null
        }
        Insert: {
          correo?: string | null
          nombre?: string | null
          rut: string
          telefono?: string | null
        }
        Update: {
          correo?: string | null
          nombre?: string | null
          rut?: string
          telefono?: string | null
        }
        Relationships: []
      }
      contraparte_tecnica: {
        Row: {
          correo: string | null
          nombre: string | null
          rut: string
          telefono: string | null
        }
        Insert: {
          correo?: string | null
          nombre?: string | null
          rut: string
          telefono?: string | null
        }
        Update: {
          correo?: string | null
          nombre?: string | null
          rut?: string
          telefono?: string | null
        }
        Relationships: []
      }
      empresa: {
        Row: {
          correo: string | null
          created_by: string | null
          domicilio: string | null
          empkey: number
          estado: string
          fecha_inicio: string | null
          logo: string | null
          nombre: string | null
          nombre_fantasia: string | null
          paso_produccion_at: string | null
          paso_produccion_por_rut: string | null
          producto: string | null
          rut: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          correo?: string | null
          created_by?: string | null
          domicilio?: string | null
          empkey: number
          estado?: string
          fecha_inicio?: string | null
          logo?: string | null
          nombre?: string | null
          nombre_fantasia?: string | null
          paso_produccion_at?: string | null
          paso_produccion_por_rut?: string | null
          producto?: string | null
          rut: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          correo?: string | null
          created_by?: string | null
          domicilio?: string | null
          empkey?: number
          estado?: string
          fecha_inicio?: string | null
          logo?: string | null
          nombre?: string | null
          nombre_fantasia?: string | null
          paso_produccion_at?: string | null
          paso_produccion_por_rut?: string | null
          producto?: string | null
          rut?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empresa_paso_produccion_por_fkey"
            columns: ["paso_produccion_por_rut"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["rut"]
          },
        ]
      }
      empresa_actividad: {
        Row: {
          cod: number
          empkey: number
        }
        Insert: {
          cod: number
          empkey: number
        }
        Update: {
          cod?: number
          empkey?: number
        }
        Relationships: [
          {
            foreignKeyName: "empresa_actividad_cod_fkey"
            columns: ["cod"]
            isOneToOne: false
            referencedRelation: "actividades_economicas"
            referencedColumns: ["cod"]
          },
          {
            foreignKeyName: "empresa_actividad_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_actividad_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_actividad_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
        ]
      }
      empresa_categoria: {
        Row: {
          cod: number
          empkey: number
        }
        Insert: {
          cod: number
          empkey: number
        }
        Update: {
          cod?: number
          empkey?: number
        }
        Relationships: [
          {
            foreignKeyName: "empresa_categoria_cod_fkey"
            columns: ["cod"]
            isOneToOne: false
            referencedRelation: "categorias_tributarias"
            referencedColumns: ["cod"]
          },
          {
            foreignKeyName: "empresa_categoria_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_categoria_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_categoria_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
        ]
      }
      empresa_comercial: {
        Row: {
          correo_comercial: string | null
          empkey: number
          id: number
          nombre_comercial: string
          telefono_comercial: string | null
        }
        Insert: {
          correo_comercial?: string | null
          empkey: number
          id?: number
          nombre_comercial: string
          telefono_comercial?: string | null
        }
        Update: {
          correo_comercial?: string | null
          empkey?: number
          id?: number
          nombre_comercial?: string
          telefono_comercial?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_empresa"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "fk_empresa"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "fk_empresa"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
        ]
      }
      empresa_contraparte_adm: {
        Row: {
          empkey: number
          rut: string
        }
        Insert: {
          empkey: number
          rut: string
        }
        Update: {
          empkey?: number
          rut?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresa_contraparte_adm_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_contraparte_adm_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_contraparte_adm_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_contraparte_adm_rut_fkey"
            columns: ["rut"]
            isOneToOne: false
            referencedRelation: "contraparte_administrativa"
            referencedColumns: ["rut"]
          },
        ]
      }
      empresa_contraparte_tecnica: {
        Row: {
          empkey: number
          rut: string
        }
        Insert: {
          empkey: number
          rut: string
        }
        Update: {
          empkey?: number
          rut?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresa_contraparte_tecnica_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_contraparte_tecnica_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_contraparte_tecnica_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_contraparte_tecnica_rut_fkey"
            columns: ["rut"]
            isOneToOne: false
            referencedRelation: "contraparte_tecnica"
            referencedColumns: ["rut"]
          },
        ]
      }
      empresa_contrato: {
        Row: {
          contrato_id: number
          empresa_id: number
        }
        Insert: {
          contrato_id: number
          empresa_id: number
        }
        Update: {
          contrato_id?: number
          empresa_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "empresa_contrato_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "tipo_contrato"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresa_contrato_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_contrato_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_contrato_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
        ]
      }
      empresa_dte: {
        Row: {
          dte_id: string
          empresa_id: number
        }
        Insert: {
          dte_id: string
          empresa_id: number
        }
        Update: {
          dte_id?: string
          empresa_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "empresa_dte_dte_id_fkey"
            columns: ["dte_id"]
            isOneToOne: false
            referencedRelation: "tipo_dte"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresa_dte_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_dte_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_dte_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
        ]
      }
      empresa_impuesto: {
        Row: {
          empresa_id: number
          impuesto_id: number
        }
        Insert: {
          empresa_id: number
          impuesto_id: number
        }
        Update: {
          empresa_id?: number
          impuesto_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "empresa_impuesto_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_impuesto_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_impuesto_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_impuesto_impuesto_id_fkey"
            columns: ["impuesto_id"]
            isOneToOne: false
            referencedRelation: "tipo_impuesto"
            referencedColumns: ["cod"]
          },
        ]
      }
      empresa_onboarding: {
        Row: {
          casilla_intercambio: string | null
          created_at: string | null
          documentos_dte: string[] | null
          empkey: number
          encargado_email: string | null
          encargado_name: string | null
          encargado_phone: string | null
          encargado_rut: string | null
          estado: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: number
          pap_fecha_hora: string | null
          ticket_hs: string | null
          tipo_certificacion: string | null
          tipo_integracion: string | null
          updated_at: string | null
        }
        Insert: {
          casilla_intercambio?: string | null
          created_at?: string | null
          documentos_dte?: string[] | null
          empkey: number
          encargado_email?: string | null
          encargado_name?: string | null
          encargado_phone?: string | null
          encargado_rut?: string | null
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: number
          pap_fecha_hora?: string | null
          ticket_hs?: string | null
          tipo_certificacion?: string | null
          tipo_integracion?: string | null
          updated_at?: string | null
        }
        Update: {
          casilla_intercambio?: string | null
          created_at?: string | null
          documentos_dte?: string[] | null
          empkey?: number
          encargado_email?: string | null
          encargado_name?: string | null
          encargado_phone?: string | null
          encargado_rut?: string | null
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: number
          pap_fecha_hora?: string | null
          ticket_hs?: string | null
          tipo_certificacion?: string | null
          tipo_integracion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_empresa_onboarding"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "fk_empresa_onboarding"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "fk_empresa_onboarding"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
        ]
      }
      empresa_producto: {
        Row: {
          empkey: number
          producto_id: number
        }
        Insert: {
          empkey: number
          producto_id: number
        }
        Update: {
          empkey?: number
          producto_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "empresa_producto_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_producto_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_producto_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_producto_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "producto"
            referencedColumns: ["id"]
          },
        ]
      }
      empresa_representante: {
        Row: {
          empkey: number
          rut: string
        }
        Insert: {
          empkey: number
          rut: string
        }
        Update: {
          empkey?: number
          rut?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresa_representante_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_representante_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_representante_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_representante_rut_fkey"
            columns: ["rut"]
            isOneToOne: false
            referencedRelation: "representante_legal"
            referencedColumns: ["rut"]
          },
        ]
      }
      empresa_sac: {
        Row: {
          correo_sac: string | null
          direccion_sac: string | null
          empkey: number
          horario_atencion: string | null
          id: number
          nombre_sac: string
          telefono_sac: string | null
        }
        Insert: {
          correo_sac?: string | null
          direccion_sac?: string | null
          empkey: number
          horario_atencion?: string | null
          id?: number
          nombre_sac: string
          telefono_sac?: string | null
        }
        Update: {
          correo_sac?: string | null
          direccion_sac?: string | null
          empkey?: number
          horario_atencion?: string | null
          id?: number
          nombre_sac?: string
          telefono_sac?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_empresa_sac"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "fk_empresa_sac"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "fk_empresa_sac"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
        ]
      }
      empresa_servicio: {
        Row: {
          empresa_id: number
          servicio_id: number
        }
        Insert: {
          empresa_id: number
          servicio_id: number
        }
        Update: {
          empresa_id?: number
          servicio_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "empresa_servicio_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_servicio_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_servicio_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_servicio_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicio"
            referencedColumns: ["id"]
          },
        ]
      }
      empresa_soporte: {
        Row: {
          empresa_id: number
          soporte_id: number
        }
        Insert: {
          empresa_id: number
          soporte_id: number
        }
        Update: {
          empresa_id?: number
          soporte_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "empresa_soporte_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_soporte_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_soporte_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_soporte_soporte_id_fkey"
            columns: ["soporte_id"]
            isOneToOne: false
            referencedRelation: "tipo_soporte"
            referencedColumns: ["id"]
          },
        ]
      }
      empresa_sucursal: {
        Row: {
          empkey: number
          id: string
        }
        Insert: {
          empkey: number
          id: string
        }
        Update: {
          empkey?: number
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresa_sucursal_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_sucursal_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_sucursal_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "empresa_sucursal_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "sucursal_pos"
            referencedColumns: ["id"]
          },
        ]
      }
      encargado_ef: {
        Row: {
          cod_interno: string | null
          correo: string | null
          direccion: string | null
          nombre: string | null
          rut: string
          telefono: string | null
        }
        Insert: {
          cod_interno?: string | null
          correo?: string | null
          direccion?: string | null
          nombre?: string | null
          rut: string
          telefono?: string | null
        }
        Update: {
          cod_interno?: string | null
          correo?: string | null
          direccion?: string | null
          nombre?: string | null
          rut?: string
          telefono?: string | null
        }
        Relationships: []
      }
      encargado_pos: {
        Row: {
          correo: string | null
          nombre: string | null
          rut: string
          telefono: string | null
        }
        Insert: {
          correo?: string | null
          nombre?: string | null
          rut: string
          telefono?: string | null
        }
        Update: {
          correo?: string | null
          nombre?: string | null
          rut?: string
          telefono?: string | null
        }
        Relationships: []
      }
      erp: {
        Row: {
          bd: string | null
          id: string
          lenguaje: string | null
          nombre: string | null
          version: string | null
        }
        Insert: {
          bd?: string | null
          id: string
          lenguaje?: string | null
          nombre?: string | null
          version?: string | null
        }
        Update: {
          bd?: string | null
          id?: string
          lenguaje?: string | null
          nombre?: string | null
          version?: string | null
        }
        Relationships: []
      }
      ficha_tecnica: {
        Row: {
          admin_folios_id: number | null
          id: number
          integracion_id: number | null
          layout_id: string | null
          modo_firma: string | null
          modo_impresion: string | null
          retorno_id: number | null
          sistema_id: string | null
          version_app_id: string | null
          version_so_id: string | null
        }
        Insert: {
          admin_folios_id?: number | null
          id?: number
          integracion_id?: number | null
          layout_id?: string | null
          modo_firma?: string | null
          modo_impresion?: string | null
          retorno_id?: number | null
          sistema_id?: string | null
          version_app_id?: string | null
          version_so_id?: string | null
        }
        Update: {
          admin_folios_id?: number | null
          id?: number
          integracion_id?: number | null
          layout_id?: string | null
          modo_firma?: string | null
          modo_impresion?: string | null
          retorno_id?: number | null
          sistema_id?: string | null
          version_app_id?: string | null
          version_so_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ficha_tecnica_admin_folios_id_fkey"
            columns: ["admin_folios_id"]
            isOneToOne: false
            referencedRelation: "administrador_folios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ficha_tecnica_integracion_id_fkey"
            columns: ["integracion_id"]
            isOneToOne: false
            referencedRelation: "integracion"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ficha_tecnica_layout_id_fkey"
            columns: ["layout_id"]
            isOneToOne: false
            referencedRelation: "layout"
            referencedColumns: ["cod"]
          },
          {
            foreignKeyName: "ficha_tecnica_retorno_id_fkey"
            columns: ["retorno_id"]
            isOneToOne: false
            referencedRelation: "retorno_integracion"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ficha_tecnica_sistema_id_fkey"
            columns: ["sistema_id"]
            isOneToOne: false
            referencedRelation: "sistema_operativo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ficha_tecnica_version_app_id_fkey"
            columns: ["version_app_id"]
            isOneToOne: false
            referencedRelation: "version_app_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ficha_tecnica_version_so_id_fkey"
            columns: ["version_so_id"]
            isOneToOne: false
            referencedRelation: "version_sistema_operativo"
            referencedColumns: ["id"]
          },
        ]
      }
      historial_movimientos: {
        Row: {
          accion: string | null
          cambios: Json | null
          fecha: string | null
          id: number
          registro_id: string
          tabla: string
          usuario: string | null
        }
        Insert: {
          accion?: string | null
          cambios?: Json | null
          fecha?: string | null
          id?: number
          registro_id: string
          tabla: string
          usuario?: string | null
        }
        Update: {
          accion?: string | null
          cambios?: Json | null
          fecha?: string | null
          id?: number
          registro_id?: string
          tabla?: string
          usuario?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      layout: {
        Row: {
          cod: string
          nombre: string | null
        }
        Insert: {
          cod: string
          nombre?: string | null
        }
        Update: {
          cod?: string
          nombre?: string | null
        }
        Relationships: []
      }
      onboarding_notificacion: {
        Row: {
          created_at: string
          descripcion: string | null
          empkey: number
          id: number
          tipo: string
          visto: boolean
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          empkey: number
          id?: number
          tipo: string
          visto?: boolean
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          empkey?: number
          id?: number
          tipo?: string
          visto?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_notificacion_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "onboarding_notificacion_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "onboarding_notificacion_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
        ]
      }
      pap_sac: {
        Row: {
          data: Json
          empkey: number
          estado: string
          fecha_hora: string | null
          updated_at: string
        }
        Insert: {
          data?: Json
          empkey: number
          estado?: string
          fecha_hora?: string | null
          updated_at?: string
        }
        Update: {
          data?: Json
          empkey?: number
          estado?: string
          fecha_hora?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pap_sac_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: true
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "pap_sac_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: true
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "pap_sac_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: true
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
        ]
      }
      pap_solicitud: {
        Row: {
          asignado_a_rut: string | null
          comentario: string | null
          completado_at: string | null
          completado_por_rut: string | null
          creado_por_rut: string | null
          created_at: string
          empkey: number
          enviado_a_sac_at: string | null
          estado: string
          id: number
          inicio_pap_at: string | null
          updated_at: string
        }
        Insert: {
          asignado_a_rut?: string | null
          comentario?: string | null
          completado_at?: string | null
          completado_por_rut?: string | null
          creado_por_rut?: string | null
          created_at?: string
          empkey: number
          enviado_a_sac_at?: string | null
          estado?: string
          id?: never
          inicio_pap_at?: string | null
          updated_at?: string
        }
        Update: {
          asignado_a_rut?: string | null
          comentario?: string | null
          completado_at?: string | null
          completado_por_rut?: string | null
          creado_por_rut?: string | null
          created_at?: string
          empkey?: number
          enviado_a_sac_at?: string | null
          estado?: string
          id?: never
          inicio_pap_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pap_solicitud_asignado_a_rut_fkey"
            columns: ["asignado_a_rut"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["rut"]
          },
          {
            foreignKeyName: "pap_solicitud_completado_por_rut_fkey"
            columns: ["completado_por_rut"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["rut"]
          },
          {
            foreignKeyName: "pap_solicitud_creado_por_rut_fkey"
            columns: ["creado_por_rut"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["rut"]
          },
          {
            foreignKeyName: "pap_solicitud_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "pap_solicitud_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "pap_solicitud_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
        ]
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
        Relationships: []
      }
      perfil_encargado_ef: {
        Row: {
          perfil_id: number
          rut: string
        }
        Insert: {
          perfil_id: number
          rut: string
        }
        Update: {
          perfil_id?: number
          rut?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfil_encargado_ef_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfil_ef"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfil_encargado_ef_rut_fkey"
            columns: ["rut"]
            isOneToOne: false
            referencedRelation: "encargado_ef"
            referencedColumns: ["rut"]
          },
        ]
      }
      perfil_encargado_pos: {
        Row: {
          perfil_id: number
          rut: string
        }
        Insert: {
          perfil_id: number
          rut: string
        }
        Update: {
          perfil_id?: number
          rut?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfil_encargado_pos_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfil_pos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfil_encargado_pos_rut_fkey"
            columns: ["rut"]
            isOneToOne: false
            referencedRelation: "encargado_pos"
            referencedColumns: ["rut"]
          },
        ]
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
        Relationships: []
      }
      perfil_usuarios: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre: string
        }
        Update: {
          id?: number
          nombre?: string
        }
        Relationships: []
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
        Relationships: []
      }
      protocolo_comunicacion: {
        Row: {
          descripcion: string | null
          id: number
          nombre: string | null
        }
        Insert: {
          descripcion?: string | null
          id?: number
          nombre?: string | null
        }
        Update: {
          descripcion?: string | null
          id?: number
          nombre?: string | null
        }
        Relationships: []
      }
      representante_legal: {
        Row: {
          correo: string | null
          nombre: string | null
          rut: string
          telefono: string | null
        }
        Insert: {
          correo?: string | null
          nombre?: string | null
          rut: string
          telefono?: string | null
        }
        Update: {
          correo?: string | null
          nombre?: string | null
          rut?: string
          telefono?: string | null
        }
        Relationships: []
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
        Relationships: []
      }
      sac_evento: {
        Row: {
          actor_rut: string | null
          asignado_a_rut: string | null
          created_at: string
          detalle: Json
          empkey: number
          id: number
          tipo: string
        }
        Insert: {
          actor_rut?: string | null
          asignado_a_rut?: string | null
          created_at?: string
          detalle?: Json
          empkey: number
          id?: never
          tipo: string
        }
        Update: {
          actor_rut?: string | null
          asignado_a_rut?: string | null
          created_at?: string
          detalle?: Json
          empkey?: number
          id?: never
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "sac_evento_actor_rut_fkey"
            columns: ["actor_rut"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["rut"]
          },
          {
            foreignKeyName: "sac_evento_asignado_a_rut_fkey"
            columns: ["asignado_a_rut"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["rut"]
          },
          {
            foreignKeyName: "sac_evento_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "sac_evento_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "sac_evento_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
        ]
      }
      sac_notificacion: {
        Row: {
          created_at: string
          destinatario_rut: string
          empkey: number | null
          id: number
          leida: boolean
          mensaje: string | null
          titulo: string | null
        }
        Insert: {
          created_at?: string
          destinatario_rut: string
          empkey?: number | null
          id?: never
          leida?: boolean
          mensaje?: string | null
          titulo?: string | null
        }
        Update: {
          created_at?: string
          destinatario_rut?: string
          empkey?: number | null
          id?: never
          leida?: boolean
          mensaje?: string | null
          titulo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sac_notificacion_destinatario_rut_fkey"
            columns: ["destinatario_rut"]
            isOneToOne: false
            referencedRelation: "usuario"
            referencedColumns: ["rut"]
          },
          {
            foreignKeyName: "sac_notificacion_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "empresa"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "sac_notificacion_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresa_produccion_resumen"
            referencedColumns: ["empkey"]
          },
          {
            foreignKeyName: "sac_notificacion_empkey_fkey"
            columns: ["empkey"]
            isOneToOne: false
            referencedRelation: "vw_empresas_activas_admin_sac"
            referencedColumns: ["empkey"]
          },
        ]
      }
      servicio: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre: string
        }
        Update: {
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      sistema_operativo: {
        Row: {
          id: string
          nombre: string | null
        }
        Insert: {
          id: string
          nombre?: string | null
        }
        Update: {
          id?: string
          nombre?: string | null
        }
        Relationships: []
      }
      sucursal_ef: {
        Row: {
          id: string
          nombre: string | null
        }
        Insert: {
          id: string
          nombre?: string | null
        }
        Update: {
          id?: string
          nombre?: string | null
        }
        Relationships: []
      }
      sucursal_pos: {
        Row: {
          box: boolean | null
          cajas: number | null
          cant_box: number | null
          direccion: string | null
          id: string
          nombre: string | null
          otros: string | null
        }
        Insert: {
          box?: boolean | null
          cajas?: number | null
          cant_box?: number | null
          direccion?: string | null
          id: string
          nombre?: string | null
          otros?: string | null
        }
        Update: {
          box?: boolean | null
          cajas?: number | null
          cant_box?: number | null
          direccion?: string | null
          id?: string
          nombre?: string | null
          otros?: string | null
        }
        Relationships: []
      }
      tipo_contrato: {
        Row: {
          descripcion: string | null
          id: number
          nombre: string | null
        }
        Insert: {
          descripcion?: string | null
          id?: number
          nombre?: string | null
        }
        Update: {
          descripcion?: string | null
          id?: number
          nombre?: string | null
        }
        Relationships: []
      }
      tipo_dte: {
        Row: {
          id: string
          nombre: string
        }
        Insert: {
          id: string
          nombre: string
        }
        Update: {
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      tipo_impuesto: {
        Row: {
          cod: number
          nombre: string
        }
        Insert: {
          cod: number
          nombre: string
        }
        Update: {
          cod?: number
          nombre?: string
        }
        Relationships: []
      }
      tipo_mensaje: {
        Row: {
          descripcion: string | null
          id: number
          nombre: string | null
        }
        Insert: {
          descripcion?: string | null
          id?: number
          nombre?: string | null
        }
        Update: {
          descripcion?: string | null
          id?: number
          nombre?: string | null
        }
        Relationships: []
      }
      tipo_soporte: {
        Row: {
          descripcion: string | null
          id: number
          nombre: string | null
        }
        Insert: {
          descripcion?: string | null
          id?: number
          nombre?: string | null
        }
        Update: {
          descripcion?: string | null
          id?: number
          nombre?: string | null
        }
        Relationships: []
      }
      usuario: {
        Row: {
          correo: string | null
          nombre: string
          perfil_id: number | null
          rut: string
          telefono: string | null
        }
        Insert: {
          correo?: string | null
          nombre: string
          perfil_id?: number | null
          rut: string
          telefono?: string | null
        }
        Update: {
          correo?: string | null
          nombre?: string
          perfil_id?: number | null
          rut?: string
          telefono?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuario_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfil_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      version_app_full: {
        Row: {
          id: string
          nombre: string | null
        }
        Insert: {
          id: string
          nombre?: string | null
        }
        Update: {
          id?: string
          nombre?: string | null
        }
        Relationships: []
      }
      version_sistema_operativo: {
        Row: {
          id: string
          nombre: string | null
          so_id: string | null
        }
        Insert: {
          id: string
          nombre?: string | null
          so_id?: string | null
        }
        Update: {
          id?: string
          nombre?: string | null
          so_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "version_sistema_operativo_so_id_fkey"
            columns: ["so_id"]
            isOneToOne: false
            referencedRelation: "sistema_operativo"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_empresa_produccion_resumen: {
        Row: {
          ejecutivo_ob: string | null
          ejecutivo_sac: string | null
          empkey: number | null
          estado_final: string | null
          fecha_pap_completado: string | null
          razon_social: string | null
          rut: string | null
        }
        Relationships: []
      }
      vw_empresas_activas_admin_sac: {
        Row: {
          empkey: number | null
          logo: string | null
          nombre: string | null
          rut: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
