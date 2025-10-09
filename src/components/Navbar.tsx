// src/components/Navbar.tsx
import React from 'react'
import { Menu, Bell } from 'lucide-react'
import { SearchBar } from './SearchBar'
import { UserAvatar } from './UserAvatar'
import { useAuth } from '@/hooks/useAuth'

interface NavbarProps {
  onToggleSidebar: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { profile } = useAuth()

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
      <div className="container-fluid px-4">
        {/* Menu Toggle */}
        <button
          className="btn btn-outline-secondary d-lg-none me-3"
          type="button"
          onClick={onToggleSidebar}
        >
          <Menu size={20} />
        </button>

        {/* Brand */}
        <a className="navbar-brand font-display fw-bold text-primary" href="/dashboard">
          Sistema Empresas
        </a>

        {/* Center Search - Hidden on mobile */}
        <div className="d-none d-md-flex flex-grow-1 justify-content-center mx-4">
          <div style={{ maxWidth: '400px', width: '100%' }}>
            <SearchBar
              placeholder="Buscar empresa por nombre, RUT o empkey..."
              variant="navbar"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="d-flex align-items-center gap-3">
          {/* Notifications */}
          <div className="position-relative">
            <button className="btn btn-outline-secondary position-relative">
              <Bell size={18} />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
                <span className="visually-hidden">notificaciones no leídas</span>
              </span>
            </button>
          </div>

          {/* User Avatar */}
          <UserAvatar 
            user={{
              name: profile?.nombre || 'Usuario',
              role: profile?.perfil?.nombre || '',
              avatar: null
            }}
          />
        </div>
      </div>

      {/* Mobile Search */}
      <div className="d-md-none border-top bg-light p-3">
        <SearchBar
          placeholder="Buscar empresa..."
          variant="mobile"
        />
      </div>
    </nav>
  )
}
