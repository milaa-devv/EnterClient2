// === Secciones base ===

export interface DatosGenerales {
  nombre: string
  rut: string
  categoria_tributaria: number[]
  logo: string | null
  fecha_inicio: string | null
}

export interface DatosContacto {
  domicilio: string
  telefono: string
  correo: string
}

export interface ActividadEconomica {
  cod: number
  nombre: string
  posee_iva: boolean
}

export interface RepresentanteLegal {
  id?: string
  rut: string
  nombre: string
  correo: string
  telefono: string
  fecha_incorporacion: string
}

export interface DocumentoTributario {
  id: string
  nombre: string
  selected: boolean
}

export interface Contraparte {
  id?: string
  rut?: string
  nombre: string
  correo: string
  telefono?: string
  cargo?: string
  tipo: 'TECNICA' | 'ADMINISTRATIVA'
}

export interface UsuarioPlataforma {
  id?: string
  rut: string
  nombre: string
  correo: string
  rol: string
  telefono?: string
  activo?: boolean
}

export interface ConfiguracionNotificacion {
  id?: string
  correo: string
  tipo?: string
  descripcion: string
  activo?: boolean
}

export interface InformacionPlan {
  producto: 'ENTERFAC' | 'ANDESPOS'
  codigo_plan: string
  plan_nombre?: string
  precio?: string
}

// === Datos Comercial completos ===
export interface DatosComercial {
  datosGenerales: DatosGenerales
  datosContacto: DatosContacto
  actividadesEconomicas: ActividadEconomica[]
  representantesLegales: RepresentanteLegal[]
  documentosTributarios: DocumentoTributario[]
  contrapartes: Contraparte[]
  usuariosPlataforma: UsuarioPlataforma[]
  configuracionNotificaciones: ConfiguracionNotificacion[]
  informacionPlan: InformacionPlan
}

// === Datos Onboarding ===
export interface ConfiguracionEmpresa {
  formato_impresion: 'TERMICA' | 'LASER'
  casilla_intercambio: string
  replica_password: string
  empkey: number
  url_visto_bueno?: string
  url_membrete?: string
  layout: 'CUSTOM' | 'ESTANDAR'
  layout_opciones?: string[]
  dte_habilitados: string[]
  tipo_integracion?: string[] | string
  otros?: string
  version_mensaje?: string
  version_emisor?: string
  version_app_full?: string
  version_winplugin?: string
}

export interface DatosOnboarding {
  configuracionEmpresa: ConfiguracionEmpresa
}

// === Datos SAC ===
export interface DatosPAP {
  declaracion_cumplimiento: boolean
  casilla: string
  sender_enternet: string[]
  acotaciones: string
}

export interface DatosSAC {
  pap: DatosPAP
}

// === Empresa completa: para Grid/Dashboard (con relaciones supabase) ===
export interface EmpresaCompleta {
  id?: number
  empkey?: number
  rut?: string
  nombre?: string
  nombre_fantasia?: string
  fecha_inicio?: string
  logo?: string
  domicilio?: string
  telefono?: string
  correo?: string

  estado: 'COMERCIAL' | 'ONBOARDING' | 'SAC' | 'COMPLETADA'
  created_at?: string
  updated_at?: string

  // Relaciones (1:1)
  empresa_comercial?: {
    nombre_comercial: string
    correo_comercial: string
    telefono_comercial: string
  } | null

  empresa_onboarding?: {
    estado: string
    encargado_name: string
    encargado_email?: string
    encargado_phone?: string
    fecha_inicio?: string
    fecha_fin?: string
  } | null

  empresa_sac?: {
    nombre_sac: string
    correo_sac?: string
    telefono_sac?: string
    direccion_sac?: string
    horario_atencion?: string
  } | null

  // Internos para formularios si los sigues usando:
  comercial?: DatosComercial
  onboarding?: DatosOnboarding
  sac?: DatosSAC
}

// Estados del formulario
export type FormStep =
  | 'datos-generales'
  | 'datos-contacto'
  | 'actividades-economicas'
  | 'representantes-legales'
  | 'documentos-tributarios'
  | 'contrapartes'
  | 'usuarios-plataforma'
  | 'configuracion-notificaciones'
  | 'informacion-plan'

export interface FormState {
  currentStep: number
  completedSteps: Set<number>
  data: Partial<DatosComercial>
  errors: Record<string, string>
  isValid: boolean
}
