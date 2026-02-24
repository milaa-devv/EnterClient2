// src/components/Sidebar.tsx
import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth, usePermissions } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import {
  Building2,
  Plus,
  Clock,
  History,
  Bell,
  Users,
  CheckCircle,
  AlertTriangle,
  Settings,
  LogOut,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface SidebarItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  badge?: number
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { isComercial, isOnboardingAdmin, isOnboardingExecutive, isSacAdmin, isSacExecutive } =
    usePermissions()

  const role = profile?.perfil?.nombre

  // Badges dinámicos SAC
  const [badgeSacPendientes, setBadgeSacPendientes] = useState<number>(0)
  const [badgeSacMisEmpresas, setBadgeSacMisEmpresas] = useState<number>(0)
  const [badgeAdminSolicitudes, setBadgeAdminSolicitudes] = useState<number>(0)

  useEffect(() => {
    let mounted = true

    const run = async () => {
      try {
        if (!profile?.rut || !role) return

        // Ejecutivo SAC: cola + mis completadas
        if (role === 'SAC') {
          const { count: pendientesCount } = await supabase
            .from('pap_solicitud')
            .select('id', { count: 'exact', head: true })
            .eq('asignado_a_rut', profile.rut)
            .in('estado', ['pendiente', 'asignada', 'en_proceso'])

          const { count: misCount } = await supabase
            .from('empresa')
            .select('empkey', { count: 'exact', head: true })
            .eq('estado', 'COMPLETADA')
            .eq('paso_produccion_por_rut', profile.rut)

          if (mounted) {
            setBadgeSacPendientes(pendientesCount ?? 0)
            setBadgeSacMisEmpresas(misCount ?? 0)
          }
        }

        // Admin SAC: solicitudes pendientes (opcional)
        if (role === 'ADMIN_SAC') {
          const { count } = await supabase
            .from('pap_solicitud')
            .select('id', { count: 'exact', head: true })
            .eq('estado', 'pendiente')

          if (mounted) setBadgeAdminSolicitudes(count ?? 0)
        }
      } catch {
        if (mounted) {
          setBadgeSacPendientes(0)
          setBadgeSacMisEmpresas(0)
          setBadgeAdminSolicitudes(0)
        }
      }
    }

    run()
    return () => {
      mounted = false
    }
  }, [profile?.rut, role])

  // Dashboard real de SAC
const dashboardPath =
  role === 'COM'
    ? '/comercial/dashboard'
    : role === 'OB'
    ? '/onboarding/mis-empresas'
    : role === 'ADMIN_OB'
    ? '/onboarding/admin-dashboard'
    : role === 'SAC' || role === 'ADMIN_SAC'
    ? '/sac/mis-empresas'
    : '/dashboard'

  const alwaysItems: SidebarItem[] = [
    {
      id: 'empresas-activas',
      label: 'Empresas Activas',
      icon: <Building2 className="nav-icon" />,
      path: '/empresas/activas',
    },
  ]

  const getSidebarItems = (): SidebarItem[] => {
    if (isComercial()) {
      return [
        ...alwaysItems,
        { id: 'nueva-empresa', label: 'Nueva Empresa', icon: <Plus className="nav-icon" />, path: '/comercial/nueva-empresa' },
        { id: 'empresas-proceso', label: 'Empresas en Proceso', icon: <Clock className="nav-icon" />, path: '/comercial/empresas-proceso', badge: 5 },
        { id: 'historial', label: 'Historial de Empresas', icon: <History className="nav-icon" />, path: '/comercial/historial' },
        { id: 'notificaciones', label: 'Notificaciones', icon: <Bell className="nav-icon" />, path: '/comercial/notificaciones', badge: 3 },
      ]
    }

    if (isOnboardingAdmin()) {
      return [
        ...alwaysItems,
        { id: 'solicitudes-pendientes', label: '📥 Bandeja de Solicitudes', icon: <AlertTriangle className="nav-icon" />, path: '/onboarding/solicitudes-pendientes' },
        { id: 'empresas-proceso', label: 'Empresas en Proceso', icon: <Clock className="nav-icon" />, path: '/onboarding/empresas-proceso' },
        { id: 'notificaciones', label: 'Notificaciones', icon: <Bell className="nav-icon" />, path: '/onboarding/notificaciones', badge: 2 },
      ]
    }

    if (isOnboardingExecutive()) {
      return [
        ...alwaysItems,
        { id: 'mis-empresas', label: 'Mis Empresas', icon: <Building2 className="nav-icon" />, path: '/onboarding/mis-empresas' },
        { id: 'solicitudes-nuevas', label: 'Solicitudes Nuevas', icon: <Plus className="nav-icon" />, path: '/onboarding/solicitudes-nuevas', badge: 4 },
        { id: 'paso-produccion', label: 'Paso a Producción', icon: <Settings className="nav-icon" />, path: '/onboarding/paso-produccion-listado' },
      ]
    }

    if (isSacAdmin()) {
      return [
        ...alwaysItems,
        {
          id: 'solicitudes-pendientes-sac',
          label: 'Solicitudes Pendientes',
          icon: <AlertTriangle className="nav-icon" />,
          path: '/sac/solicitudes-pendientes',
          badge: badgeAdminSolicitudes || undefined,
        },
        {
          id: 'ejecutar-pap',
          label: 'Ejecutar PAP',
          icon: <CheckCircle className="nav-icon" />,
          path: '/sac/pap',
        },
        {
          id: 'historial-sac',
          label: 'Historial de Empresas',
          icon: <History className="nav-icon" />,
          path: '/sac/historial',
        },
      ]
    }

    if (isSacExecutive()) {
      return [
        ...alwaysItems,
        {
          id: 'mis-empresas-sac',
          label: 'Mis Empresas',
          icon: <Building2 className="nav-icon" />,
          path: '/sac/empresas-asignadas',
          badge: badgeSacMisEmpresas || undefined,
        },
        {
          id: 'empresas-pendientes-sac',
          label: 'Empresas Pendientes',
          icon: <Clock className="nav-icon" />,
          path: '/sac/pendientes',
          badge: badgeSacPendientes || undefined,
        },
        {
          id: 'ejecutar-pap-sac',
          label: 'Ejecutar PAP',
          icon: <CheckCircle className="nav-icon" />,
          path: '/sac/pap',
        },
      ]
    }

    return alwaysItems
  }

  const getQuickActions = (): SidebarItem[] => {
    if (isComercial()) return []
    if (isOnboardingAdmin()) {
      return [{ id: 'asignar-ejecutivo', label: '👥 Gestión de Ejecutivos', icon: <Users className="nav-icon" />, path: '/onboarding/asignar-ejecutivos' }]
    }
    if (isOnboardingExecutive()) return []

    // Evitamos rutas inventadas; si quieres, después armamos las pantallas admin reales.
    return []
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      onClose()
      navigate('/', { replace: true })
    }
  }

  const sidebarItems = getSidebarItems()
  const quickActions = getQuickActions()

  return (
    <>
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50 d-lg-none"
          style={{ zIndex: 999 }}
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${isOpen === undefined ? '' : isOpen ? 'expanded' : 'hidden'}`}>
        <div className="sidebar-header">
          <div className="d-flex align-items-center gap-3">
            <Building2 size={24} />
            <div>
              <h6 className="mb-0">{profile?.nombre}</h6>
              <small className="opacity-75">
                {role === 'COM' && 'Área Comercial'}
                {role === 'OB' && 'Ejecutivo Onboarding'}
                {role === 'ADMIN_OB' && 'Admin Onboarding'}
                {role === 'SAC' && 'Área SAC'}
                {role === 'ADMIN_SAC' && 'Admin SAC'}
              </small>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav flex-column">
            <li className="nav-item">
              <NavLink
                to={dashboardPath}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Building2 className="nav-icon" />
                <span>Dashboard</span>
              </NavLink>
            </li>

            <li>
              <hr className="my-3 mx-3" />
            </li>

            {sidebarItems.map((item) => (
              <li key={item.id} className="nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && <span className="badge bg-danger rounded-pill ms-auto">{item.badge}</span>}
                </NavLink>
              </li>
            ))}

            {quickActions.length > 0 && (
              <>
                <li>
                  <hr className="my-3 mx-3" />
                </li>
                <li className="px-3 mb-2">
                  <small className="text-muted font-primary fw-semibold text-uppercase">Acciones Rápidas</small>
                </li>
                {quickActions.map((action) => (
                  <li key={action.id} className="nav-item">
                    <NavLink
                      to={action.path}
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </NavLink>
                  </li>
                ))}
              </>
            )}

            <li>
              <hr className="my-3 mx-3" />
            </li>
            <li className="nav-item">
              <button type="button" className="nav-link w-100 text-start" onClick={handleLogout}>
                <LogOut className="nav-icon" />
                <span>Cerrar sesión</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  )
}