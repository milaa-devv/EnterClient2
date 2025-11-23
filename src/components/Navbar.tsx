import React from 'react'
import { Menu, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SearchBar } from './SearchBar'
import { UserAvatar } from './UserAvatar'
import { useAuth } from '@/hooks/useAuth'

interface NavbarProps {
  onToggleSidebar: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { profile } = useAuth()
  const role = profile?.perfil?.nombre

  const dashboardPath =
    role === 'COM'
      ? '/comercial/dashboard'
      : role === 'OB'
      ? '/onboarding/mis-empresas'
      : role === 'SAC'
      ? '/sac/mis-empresas'      // 👈 SAC ejecutivo
      : role === 'ADMIN_SAC'
      ? '/sac/empresas-sac'
      : '/dashboard'

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
      <div className="container-fluid px-4">
        <button
          className="btn btn-outline-secondary d-lg-none me-3"
          type="button"
          onClick={onToggleSidebar}
        >
          <Menu size={20} />
        </button>

        <Link className="navbar-brand font-display fw-bold text-primary" to={dashboardPath}>
          Sistema Empresas
        </Link>

        <div className="d-none d-md-flex flex-grow-1 justify-content-center mx-4">
          <div style={{ maxWidth: '400px', width: '100%' }}>
            <SearchBar
              placeholder="Buscar empresa por nombre, RUT o empkey..."
              variant="navbar"
            />
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="position-relative">
            <button className="btn btn-outline-secondary position-relative">
              <Bell size={18} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
                <span className="visually-hidden">notificaciones no leídas</span>
              </span>
            </button>
          </div>

          <UserAvatar 
            user={{
              name: profile?.nombre || 'Usuario',
              role: role || '',
              avatar: null
            }}
          />
        </div>
      </div>

      <div className="d-md-none border-top bg-light p-3">
        <SearchBar placeholder="Buscar empresa..." variant="mobile" />
      </div>
    </nav>
  )
}
