export type UserRole = 'COM' | 'OB' | 'SAC' | 'OB_ADMIN' | 'SAC_ADMIN'

export type Permission = 
  | 'create_empresa'
  | 'edit_comercial'
  | 'view_comercial'
  | 'edit_onboarding'
  | 'view_onboarding'
  | 'assign_onboarding'
  | 'edit_sac'
  | 'view_sac'
  | 'assign_sac'
  | 'complete_pap'
  | 'view_historial'
  | 'edit_all'

export interface RoleConfig {
  role: UserRole
  permissions: Permission[]
  routes: string[]
  sidebarItems: string[]
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  COM: {
    role: 'COM',
    permissions: ['create_empresa', 'edit_comercial', 'view_comercial'],
    routes: ['/comercial', '/comercial/nueva-empresa', '/comercial/empresas-proceso'],
    sidebarItems: ['nueva-empresa', 'empresas-proceso', 'historial', 'notificaciones']
  },
  OB: {
    role: 'OB',
    permissions: ['edit_onboarding', 'view_onboarding'],
    routes: ['/onboarding', '/onboarding/mis-empresas'],
    sidebarItems: ['mis-empresas', 'solicitudes-nuevas', 'acciones-rapidas']
  },
  OB_ADMIN: {
    role: 'OB_ADMIN',
    permissions: ['edit_onboarding', 'view_onboarding', 'assign_onboarding', 'edit_comercial'],
    routes: ['/onboarding', '/onboarding/solicitudes-pendientes', '/onboarding/empresas-proceso'],
    sidebarItems: ['solicitudes-pendientes', 'empresas-proceso', 'historial', 'acciones-rapidas']
  },
  SAC: {
    role: 'SAC',
    permissions: ['edit_sac', 'view_sac', 'complete_pap'],
    routes: ['/sac', '/sac/mis-empresas'],
    sidebarItems: ['mis-empresas', 'empresas-pendientes', 'acciones-rapidas']
  },
  SAC_ADMIN: {
    role: 'SAC_ADMIN',
    permissions: ['edit_sac', 'view_sac', 'assign_sac', 'edit_onboarding'],
    routes: ['/sac', '/sac/solicitudes-pendientes', '/sac/empresas-sac'],
    sidebarItems: ['solicitudes-pendientes', 'empresas-sac', 'historial', 'acciones-rapidas']
  }
}