import React from 'react'
import { Link } from 'react-router-dom'
import { Building2, Users, Settings, BarChart3 } from 'lucide-react'

const HomePage: React.FC = () => {
  return (
    <div className="min-vh-100 bg-gradient-primary d-flex flex-column">
      {/* Hero Section */}
      <main className="flex-grow-1 d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8 col-xl-6">
              {/* Logo/Brand */}
              <div className="mb-5">
                <Building2 size={80} className="text-white mb-4" />
                <h1 className="font-display text-white mb-3" style={{ fontSize: '3.5rem' }}>
                  Sistema Gestión Empresas
                </h1>
                <p className="lead text-white-50 mb-5">
                  Plataforma integral para la gestión del ciclo completo de incorporación 
                  y administración de empresas clientes
                </p>
              </div>

              {/* CTA Button */}
              <div className="mb-5">
                <Link
                  to="/login"
                  className="btn btn-light btn-lg px-5 py-3 font-primary fw-semibold"
                  style={{ fontSize: '1.1rem' }}
                >
                  Ingresar
                </Link>
              </div>

              {/* Features Preview */}
              <div className="row g-4 mt-5">
                <div className="col-md-4">
                  <div className="text-center">
                    <Users className="text-white-50 mb-3" size={40} />
                    <h5 className="text-white font-primary">Multi-Área</h5>
                    <p className="text-white-50 small">
                      Comercial, Onboarding y SAC trabajando en conjunto
                    </p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <Settings className="text-white-50 mb-3" size={40} />
                    <h5 className="text-white font-primary">Control Total</h5>
                    <p className="text-white-50 small">
                      Seguimiento completo del proceso de incorporación
                    </p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-center">
                    <BarChart3 className="text-white-50 mb-3" size={40} />
                    <h5 className="text-white font-primary">Reportes</h5>
                    <p className="text-white-50 small">
                      Historial y auditoría de todos los cambios
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4">
        <div className="container">
          <p className="text-white-50 small mb-0">
            © 2025 Sistema Gestión Empresas. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
