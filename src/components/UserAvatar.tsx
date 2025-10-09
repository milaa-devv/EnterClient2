import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { User, Settings, LogOut, Bell, HelpCircle } from 'lucide-react'

interface UserAvatarProps {
  user: {
    name: string
    role: string
    avatar?: string | null
  }
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { signOut } = useAuth()

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadge = (role: string) => {
    const roleMap = {
      COM: { label: 'Comercial', color: 'warning' },
      OB: { label: 'Onboarding', color: 'info' },
      SAC: { label: 'SAC', color: 'primary' }
    }
    
    const roleInfo = roleMap[role as keyof typeof roleMap] || { label: role, color: 'secondary' }
    
    return (
      <span className={`badge bg-${roleInfo.color} ms-2`}>
        {roleInfo.label}
      </span>
    )
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <div className="position-relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        className="btn btn-link p-0 border-0"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <div className="d-flex align-items-center gap-2">
          <div className="position-relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="rounded-circle"
                width="40"
                height="40"
              />
            ) : (
              <div
                className="rounded-circle bg-gradient-primary text-white d-flex align-items-center justify-content-center fw-semibold"
                style={{ width: '40px', height: '40px' }}
              >
                {getInitials(user.name)}
              </div>
            )}
            {/* Status indicator */}
            <div
              className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-white"
              style={{ width: '12px', height: '12px' }}
            />
          </div>
          
          {/* User info - solo en desktop */}
          <div className="d-none d-md-block text-start">
            <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
              {user.name}
            </div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              {user.role}
            </div>
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="position-absolute end-0 bg-white border rounded shadow-lg mt-2"
          style={{ minWidth: '280px', zIndex: 1050 }}
        >
          {/* Header */}
          <div className="p-3 border-bottom">
            <div className="d-flex align-items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="rounded-circle"
                  width="50"
                  height="50"
                />
              ) : (
                <div
                  className="rounded-circle bg-gradient-primary text-white d-flex align-items-center justify-content-center fw-semibold"
                  style={{ width: '50px', height: '50px' }}
                >
                  {getInitials(user.name)}
                </div>
              )}
              <div className="flex-grow-1">
                <div className="fw-semibold">{user.name}</div>
                <div className="text-muted small">
                  {user.role}
                  {getRoleBadge(user.role)}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              className="btn btn-link w-100 text-start px-3 py-2 border-0 rounded-0 d-flex align-items-center gap-2"
              onClick={() => {
                setIsOpen(false)
                // Navigate to profile
              }}
            >
              <User size={16} />
              Mi Perfil
            </button>

            <button
              className="btn btn-link w-100 text-start px-3 py-2 border-0 rounded-0 d-flex align-items-center gap-2"
              onClick={() => {
                setIsOpen(false)
                // Navigate to settings
              }}
            >
              <Settings size={16} />
              Configuración
            </button>

            <button
              className="btn btn-link w-100 text-start px-3 py-2 border-0 rounded-0 d-flex align-items-center gap-2"
              onClick={() => {
                setIsOpen(false)
                // Navigate to notifications
              }}
            >
              <Bell size={16} />
              Notificaciones
              <span className="badge bg-danger ms-auto">3</span>
            </button>

            <button
              className="btn btn-link w-100 text-start px-3 py-2 border-0 rounded-0 d-flex align-items-center gap-2"
              onClick={() => {
                setIsOpen(false)
                // Open help
              }}
            >
              <HelpCircle size={16} />
              Ayuda
            </button>
          </div>

          {/* Separator */}
          <div className="border-top">
            <button
              className="btn btn-link w-100 text-start px-3 py-2 border-0 rounded-0 d-flex align-items-center gap-2 text-danger"
              onClick={() => {
                setIsOpen(false)
                handleSignOut()
              }}
            >
              <LogOut size={16} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
