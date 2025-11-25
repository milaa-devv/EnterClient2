import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Bell } from 'lucide-react'

interface Movimiento {
  id: number
  tabla: string
  registro_id: string
  accion: string
  cambios: any
  usuario: string | null
  fecha: string
}

const OnboardingNotificaciones: React.FC = () => {
  const [items, setItems] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMovimientos = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('historial_movimientos')
        .select('*')
        .eq('tabla', 'empresa_onboarding')
        .order('fecha', { ascending: false })
        .limit(50)

      if (error) throw error
      setItems(data || [])
    } catch (err: any) {
      console.error(err)
      setError('Error al cargar notificaciones: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMovimientos()
  }, [])

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col d-flex justify-content-between align-items-center">
          <div>
            <h1 className="font-primary fw-bold mb-1">
              Notificaciones de Onboarding
            </h1>
            <p className="text-muted mb-0">
              Cambios recientes en las empresas en Onboarding (asignaciones, estados, etc.)
            </p>
          </div>
          <button
            className="btn btn-outline-secondary"
            onClick={loadMovimientos}
            disabled={loading}
          >
            Actualizar
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="text-muted">Cargando notificaciones...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-5">
          <Bell size={48} className="text-muted mb-2" />
          <p className="text-muted mb-0">
            Aún no hay notificaciones registradas para Onboarding
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <ul className="list-unstyled mb-0">
              {items.map((mov) => (
                <li key={mov.id} className="mb-3 pb-3 border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-light text-dark me-2">
                        {mov.accion}
                      </span>
                      <strong>Registro:</strong> {mov.registro_id}
                    </div>
                    <small className="text-muted">
                      {new Date(mov.fecha).toLocaleString('es-CL')}
                    </small>
                  </div>
                  {mov.usuario && (
                    <div className="small text-muted mt-1">
                      Usuario: {mov.usuario}
                    </div>
                  )}
                  {mov.cambios && (
                    <pre className="small bg-light p-2 mt-2 rounded mb-0">
                      {JSON.stringify(mov.cambios, null, 2)}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default OnboardingNotificaciones
