import React from 'react'
import { Building2 } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Cargando...', 
  size = 'md' 
}) => {
  const spinnerSize = {
    sm: '2rem',
    md: '3rem',
    lg: '4rem'
  }

  return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5">
      <div 
        className="spinner-border text-primary mb-3" 
        role="status"
        style={{ width: spinnerSize[size], height: spinnerSize[size] }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted font-primary">{message}</p>
    </div>
  )
}
