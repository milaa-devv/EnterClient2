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
  nombre: string
  cargo: string
  telefono: string
  correo: string
  tipo: 'TECNICA' | 'ADMINISTRATIVA'
}

export interface UsuarioPlataforma {
  id?: string
  rut: string
  nombre: string
  rol: string
  correo: string
}

export interface ConfiguracionNotificacion {
  id?: string
  correo: string
  descripcion: string
}

export interface InformacionPlan {
  producto: 'ENTERFAC' | 'ANDESPOS'
  codigo_plan: string
}

// Datos Comercial completos
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

// Datos Onboarding
export interface ConfiguracionEmpresa {
  formato_impresion: 'TERMICA' | 'LASER'
  casilla_intercambio: string
  replica_password: string
  empkey: number
  url_visto_bueno: string
  url_membrete: string
  layout: 'CUSTOM' | 'ESTANDAR'
  layout_opciones?: string[]
  dte_habilitados: string[]
  tipo_integracion: string[]
  otros: string
  version_mensaje: string
  version_emisor: string
  version_app_full: string
  version_winplugin: string
}

export interface DatosOnboarding {
  configuracionEmpresa: ConfiguracionEmpresa
}

// Datos SAC
export interface DatosPAP {
  declaracion_cumplimiento: boolean
  casilla: string
  sender_enternet: string[]
  acotaciones: string
}

export interface DatosSAC {
  pap: DatosPAP
}

// Empresa completa
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
  comercial: DatosComercial
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
export interface UsuarioPlataforma {
  id: string
  rut: string
  nombre: string
  correo: string
  telefono?: string
  rol: 'admin' | 'user' | 'viewer' | 'accountant'
  activo: boolean
}

export interface ConfiguracionNotificacion {
  id: string
  correo: string
  tipo: string
  descripcion: string
  activo: boolean
}

export interface Contraparte {
  id: string
  rut: string
  nombre: string
  correo: string
  telefono?: string
  cargo?: string
  tipo: 'TECNICA' | 'ADMINISTRATIVA'
}

export interface ConfiguracionEmpresa {
  formato_impresion: 'TERMICA' | 'LASER'
  casilla_intercambio: string
  replica_password: string
  empkey: number
  url_visto_bueno?: string
  url_membrete?: string
  layout: 'CUSTOM' | 'ESTANDAR'
  dte_habilitados: string[]
  tipo_integracion?: string
  otros?: string
  version_mensaje?: string
  version_emisor?: string
  version_app_full?: string
  version_winplugin?: string
}

export interface DatosPAP {
  declaracion_cumplimiento: boolean
  casilla: string
  sender_enternet: string[]
  acotaciones: string
}
export interface InformacionPlan {
  producto: 'ENTERFAC' | 'ANDESPOS'
  codigo_plan: string
  plan_nombre: string
  precio: string
}
