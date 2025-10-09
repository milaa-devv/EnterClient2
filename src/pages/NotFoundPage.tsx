import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Home } from 'lucide-react'

const NotFoundPage: React.FC = () => {
  return (
    <div className="vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
      <AlertTriangle size={80} className="mb-4 text-warning" />
      <h1 className="display-4 fw-bold mb-3">404 - Página no encontrada</h1>
      <p className="mb-4 text-muted">La página que estás buscando no existe.</p>
      <Link to="/" className="btn btn-primary">
        <Home className="me-2" /> Volver al inicio
      </Link>
    </div>
  )
}

export default NotFoundPage
