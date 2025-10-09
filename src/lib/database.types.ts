export interface Database {
  public: {
    Tables: {
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
        }
        Insert: {
          empkey: number
          rut: string
          nombre?: string | null
          nombre_fantasia?: string | null
          fecha_inicio?: string | null
          logo?: string | null
          domicilio?: string | null
          telefono?: string | null
          correo?: string | null
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
          rut: string
          nombre: string
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
      perfil_usuarios: {
        Row: {
          id: number
          nombre: 'OB' | 'SAC' | 'COM'
        }
        Insert: {
          id?: number
          nombre: 'OB' | 'SAC' | 'COM'
        }
        Update: {
          id?: number
          nombre?: 'OB' | 'SAC' | 'COM'
        }
      }
      historial_movimientos: {
        Row: {
          id: number
          tabla: string
          registro_id: string
          accion: 'INSERT' | 'UPDATE' | 'DELETE'
          cambios: any
          usuario: string | null
          fecha: string
        }
        Insert: {
          id?: number
          tabla: string
          registro_id: string
          accion: 'INSERT' | 'UPDATE' | 'DELETE'
          cambios: any
          usuario?: string | null
          fecha?: string
        }
        Update: {
          id?: number
          tabla?: string
          registro_id?: string
          accion?: 'INSERT' | 'UPDATE' | 'DELETE'
          cambios?: any
          usuario?: string | null
          fecha?: string
        }
      }
      // Añadir más tablas según sea necesario...
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}