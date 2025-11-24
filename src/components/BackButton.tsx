import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  /** Ruta a la que caer si no hay historial (ej: acceso directo) */
  fallback?: string
  className?: string
}

export const BackButton: React.FC<BackButtonProps> = ({
  fallback = '/',
  className = ''
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    // Si hay historial previo, volvemos
    if (location.key && location.key !== 'default') {
      navigate(-1)
    } else {
      // Si no, vamos a la ruta de fallback
      navigate(fallback)
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`btn btn-outline-secondary d-flex align-items-center gap-2 ${className}`}
    >
      <ArrowLeft size={16} />
      Atrás
    </button>
  )
}
