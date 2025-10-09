import { useContext, useCallback } from 'react'
import { AuthContext, type AuthContextType } from '@/contexts/AuthContext'

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}

export const usePermissions = () => {
  const { hasRole, hasPermission, profile } = useAuth()

  const isComercial = () =>
    hasRole('COM') && profile?.perfil?.nombre === 'COM'

  const isOnboardingAdmin = () =>
    hasRole('ADMIN_OB') && profile?.perfil?.nombre === 'ADMIN_OB'

  const isOnboardingExecutive = () =>
    hasRole('OB') && profile?.perfil?.nombre === 'OB'

  const isSacAdmin = () =>
    hasRole('ADMIN_SAC') && profile?.perfil?.nombre === 'ADMIN_SAC'

  const isSacExecutive = () =>
    hasRole('SAC') && profile?.perfil?.nombre === 'SAC'

  // Permisos para edición segmentada
  const canEditComercial = () => isComercial() || isOnboardingAdmin() || isSacAdmin()
  const canEditOnboarding = () => isOnboardingExecutive() || isOnboardingAdmin()
  const canEditSac = () => isSacExecutive() || isSacAdmin()

  return {
    isComercial,
    isOnboardingAdmin,
    isOnboardingExecutive,
    isSacAdmin,
    isSacExecutive,
    canEditComercial,
    canEditOnboarding,
    canEditSac,

    hasRole,
    hasPermission,
  }
}

export const useSignIn = (): ((
  email: string,
  password: string
) => Promise<void>) => {
  const { login } = useAuth()

  const signIn = useCallback(
    async (email: string, password: string) => {
      await login(email, password)
    },
    [login]
  )

  return signIn
}

export const useLogout = (): (() => Promise<void>) => {
  const { logout } = useAuth()

  const doLogout = useCallback(async () => {
    await logout()
  }, [logout])

  return doLogout
}
