import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth, usePermissions } from '@/hooks/useAuth'
import {
  Building2,
  Plus,
  Clock,
  History,
  Bell,
  Users,
  CheckCircle,
  AlertTriangle,
  Settings
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
  const { profile } = useAuth()
  const {
    isComercial,
    isOnboardingAdmin,
    isOnboardingExecutive,
    isSacAdmin,
    isSacExecutive
  } = usePermissions()

  const role = profile?.perfil?.nombre
  const dashboardPath =
    role === 'COM'
      ? '/comercial/dashboard'
      : role === 'OB'
        ? '/onboarding/dashboard'      // 👈 antes apuntaba a /onboarding/mis-empresas
        : role === 'SAC'
          ? '/sac/mis-empresas'
          : role === 'ADMIN_SAC'
            ? '/sac/empresas-sac'
            : '/dashboard'


  // Items comunes para todos los perfiles
  const alwaysItems: SidebarItem[] = [
    {
      id: 'empresas-activas',
      label: 'Empresas Activas',
      icon: <Building2 className="nav-icon" />,
      path: '/empresas/activas'
    }
  ]

  const getSidebarItems = (): SidebarItem[] => {
    if (isComercial()) {
      return [
        ...alwaysItems,
        { id: 'nueva-empresa', label: 'Nueva Empresa', icon: <Plus className="nav-icon" />, path: '/comercial/nueva-empresa' },
        { id: 'empresas-proceso', label: 'Empresas en Proceso', icon: <Clock className="nav-icon" />, path: '/comercial/empresas-proceso', badge: 5 },
        { id: 'historial', label: 'Historial de Empresas', icon: <History className="nav-icon" />, path: '/comercial/historial' },
        { id: 'notificaciones', label: 'Notificaciones', icon: <Bell className="nav-icon" />, path: '/comercial/notificaciones', badge: 3 }
      ]
    }
    if (isOnboardingAdmin()) {
      return [
        ...alwaysItems,
        { id: 'solicitudes-pendientes', label: 'Solicitudes Pendientes', icon: <AlertTriangle className="nav-icon" />, path: '/onboarding/solicitudes-pendientes', badge: 8 },
        { id: 'empresas-proceso', label: 'Empresas en Proceso', icon: <Clock className="nav-icon" />, path: '/onboarding/empresas-proceso' },
        { id: 'historial', label: 'Historial de Empresas', icon: <History className="nav-icon" />, path: '/onboarding/historial' },
        { id: 'notificaciones', label: 'Notificaciones', icon: <Bell className="nav-icon" />, path: '/onboarding/notificaciones', badge: 2 }
      ]
    }
    if (isOnboardingExecutive()) {
      return [
        ...alwaysItems,
        { id: 'mis-empresas', label: 'Mis Empresas', icon: <Building2 className="nav-icon" />, path: '/onboarding/mis-empresas' },
        { id: 'solicitudes-nuevas', label: 'Solicitudes Nuevas', icon: <Plus className="nav-icon" />, path: '/onboarding/solicitudes-nuevas', badge: 4 },
        { id: 'paso-produccion', label: 'Paso a Producción', icon: <Settings className="nav-icon" />, path: '/onboarding/paso-produccion' }
      ]
    }
    if (isSacAdmin()) {
      return [
        ...alwaysItems,
        { id: 'solicitudes-pendientes', label: 'Solicitudes Pendientes', icon: <AlertTriangle className="nav-icon" />, path: '/sac/solicitudes-pendientes', badge: 6 },
        { id: 'empresas-sac', label: 'Empresas en SAC', icon: <Settings className="nav-icon" />, path: '/sac/empresas-sac' },
        { id: 'historial', label: 'Historial de Empresas', icon: <History className="nav-icon" />, path: '/sac/historial' }
      ]
    }
    if (isSacExecutive()) {
      return [
        ...alwaysItems,
        { id: 'mis-empresas', label: 'Mis Empresas', icon: <Building2 className="nav-icon" />, path: '/sac/mis-empresas' },
        { id: 'empresas-pendientes', label: 'Empresas Pendientes', icon: <Clock className="nav-icon" />, path: '/sac/empresas-pendientes', badge: 3 }
      ]
    }
    return alwaysItems
  }

  const getQuickActions = (): SidebarItem[] => {
    if (isComercial()) {
      return [
        { id: 'agregar-representante', label: 'Agregar Representante', icon: <Users className="nav-icon" />, path: '/comercial/acciones/representante' }
      ]
    }
    if (isOnboardingAdmin()) {
      return [
        { id: 'asignar-ejecutivo', label: 'Asignar Ejecutivo', icon: <Users className="nav-icon" />, path: '/onboarding/acciones/asignar' },
        { id: 'marcar-revisado', label: 'Marcar como Revisado', icon: <CheckCircle className="nav-icon" />, path: '/onboarding/acciones/revisar' }
      ]
    }
    if (isOnboardingExecutive()) {
    }
    if (isSacAdmin()) {
      return [
        { id: 'asignar-ejecutivo-sac', label: 'Asignar Ejecutivo SAC', icon: <Users className="nav-icon" />, path: '/sac/acciones/asignar' },
        { id: 'revisar-pap', label: 'Revisar PAP', icon: <Settings className="nav-icon" />, path: '/sac/acciones/revisar-pap' }
      ]
    }
    if (isSacExecutive()) {
      return [
        { id: 'completar-pap', label: 'Completar PAP', icon: <CheckCircle className="nav-icon" />, path: '/sac/acciones/completar-pap' },
        { id: 'solicitar-revision', label: 'Solicitar Revisión', icon: <AlertTriangle className="nav-icon" />, path: '/sac/acciones/solicitar-revision' }
      ]
    }
    return []
  }

  const sidebarItems = getSidebarItems()
  const quickActions = getQuickActions()

  return (
    <>
      {/* Overlay solo en mobile */}
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-50 d-lg-none"
          style={{ zIndex: 999 }}
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${isOpen === undefined ? '' : (isOpen ? 'expanded' : 'hidden')}`}>
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
            {/* Dashboard por rol */}
            <li className="nav-item">
              <NavLink to={dashboardPath} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                <Building2 className="nav-icon" />
                <span>Dashboard</span>
              </NavLink>
            </li>

            <li><hr className="my-3 mx-3" /></li>

            {sidebarItems.map(item => (
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
                <li><hr className="my-3 mx-3" /></li>
                <li className="px-3 mb-2">
                  <small className="text-muted font-primary fw-semibold text-uppercase">Acciones Rápidas</small>
                </li>
                {quickActions.map(action => (
                  <li key={action.id} className="nav-item">
                    <NavLink to={action.path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onClose}>
                      {action.icon}
                      <span>{action.label}</span>
                    </NavLink>
                  </li>
                ))}
              </>
            )}
          </ul>
        </nav>
      </aside>
    </>
  )
}
