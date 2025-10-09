import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldOff, ArrowLeft, Home } from 'lucide-react'

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-vh-100 bg-light d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6 text-center">
            {/* Icon */}
            <div className="mb-4">
              <ShieldOff size={120} className="text-danger mb-3" />
              <h1 className="display-4 font-primary fw-bold text-danger mb-3">
                403
              </h1>
              <h2 className="font-primary fw-semibold mb-3">
                Acceso Denegado
              </h2>
            </div>

            {/* Message */}
            <div className="mb-5">
              <p className="lead text-muted mb-4">
                No tienes permisos para acceder a esta página.
              </p>
              <p className="text-muted">
                Si crees que esto es un error, contacta con el administrador del sistema 
                o verifica que tengas el rol correcto asignado.
              </p>
            </div>

            {/* Actions */}
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
              <button
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={() => window.history.back()}
              >
                <ArrowLeft size={18} />
                Volver Atrás
              </button>
              <Link
                to="/dashboard"
                className="btn btn-primary d-flex align-items-center gap-2"
              >
                <Home size={18} />
                Ir al Dashboard
              </Link>
            </div>

            {/* Help Text */}
            <div className="mt-5 pt-4 border-top">
              <h6 className="font-primary fw-semibold mb-2">¿Necesitas ayuda?</h6>
              <p className="small text-muted">
                Si necesitas acceso a esta función, contacta con:
              </p>
              <ul className="list-unstyled small text-muted">
                <li>• Tu supervisor directo</li>
                <li>• El administrador del sistema</li>
                <li>• El equipo de TI</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnauthorizedPage
