import type { UserRole, Permission, RoleConfig } from '@/types/roles'
import { ROLE_CONFIGS } from '@/types/roles'

export class PermissionManager {
  private static instance: PermissionManager
  private roleConfigs: Record<UserRole, RoleConfig> = ROLE_CONFIGS

  private constructor() {}

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager()
    }
    return PermissionManager.instance
  }

  hasPermission(userRole: UserRole, permission: Permission): boolean {
    const config = this.roleConfigs[userRole]
    return config?.permissions.includes(permission) || false
  }

  hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
    return userRole === requiredRole
  }

  canAccessRoute(userRole: UserRole, route: string): boolean {
    const config = this.roleConfigs[userRole]
    return config?.routes.some(r => route.startsWith(r)) || false
  }

  getSidebarItems(userRole: UserRole): string[] {
    const config = this.roleConfigs[userRole]
    return config?.sidebarItems || []
  }

  // Permisos específicos para campos de formulario
  canEditField(userRole: UserRole, fieldSection: 'comercial' | 'onboarding' | 'sac'): boolean {
    const adminRoles: UserRole[] = ['OB_ADMIN', 'SAC_ADMIN']
    
    // Los administradores pueden editar todo
    if (adminRoles.includes(userRole)) {
      return true
    }

    // Reglas específicas por sección
    switch (fieldSection) {
      case 'comercial':
        return userRole === 'COM'
      case 'onboarding':
        return userRole === 'OB'
      case 'sac':
        return userRole === 'SAC'
      default:
        return false
    }
  }

  // Obtener permisos de solo lectura
  getReadOnlyFields(userRole: UserRole): string[] {
    const readOnlyFields: Record<UserRole, string[]> = {
      COM: ['onboarding.*', 'sac.*'],
      OB: ['comercial.*', 'sac.*'],
      OB_ADMIN: ['sac.*'],
      SAC: ['comercial.*', 'onboarding.*'],
      SAC_ADMIN: ['comercial.*']
    }

    return readOnlyFields[userRole] || []
  }
}

export const permissionManager = PermissionManager.getInstance()