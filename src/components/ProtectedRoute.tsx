import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth, usePermissions } from '@/hooks/useAuth'
import type { UserRole, Permission } from '@/types/roles'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requiredPermission?: Permission
  fallbackPath?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallbackPath = '/login'
}) => {
  const { user, loading, profile } = useAuth()
  const { hasRole, hasPermission } = usePermissions()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return <Navigate to={fallbackPath} replace />
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

// Componente para mostrar contenido basado en permisos
interface ConditionalRenderProps {
  children: React.ReactNode
  role?: UserRole
  permission?: Permission
  fallback?: React.ReactNode
}

export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  children,
  role,
  permission,
  fallback = null
}) => {
  const { hasRole, hasPermission } = usePermissions()

  if (role && !hasRole(role)) {
    return <>{fallback}</>
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}