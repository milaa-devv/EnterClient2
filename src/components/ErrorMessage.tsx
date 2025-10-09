// src/components/ErrorMessage.tsx
import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  showRetry?: boolean
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  showRetry = true 
}) => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5">
      <AlertTriangle size={64} className="text-danger mb-3" />
      <h4 className="text-danger mb-2">Error</h4>
      <p className="text-muted text-center mb-4">{message}</p>
      {showRetry && onRetry && (
        <button 
          className="btn btn-outline-primary d-flex align-items-center gap-2"
          onClick={onRetry}
        >
          <RefreshCw size={18} />
          Reintentar
        </button>
      )}
    </div>
  )
}
