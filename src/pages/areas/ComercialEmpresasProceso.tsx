import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, FileEdit, ArrowLeft } from 'lucide-react'

const DRAFT_KEY = 'nueva-empresa-draft'

interface DraftState {
  savedAt: string
  state: {
    currentStep: number
    data: any
  }
}

const ComercialEmpresasProceso: React.FC = () => {
  const [draft, setDraft] = useState<DraftState | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as DraftState
      setDraft(parsed)
    } catch (err) {
      console.error('Error leyendo borrador comercial', err)
    }
  }, [])

  const handleBack = () => {
    // Si entran directo por URL y no hay historial real, evitamos volver a "nada"
    if (window.history.length > 1) navigate(-1)
    else navigate('/comercial/dashboard')
  }

  const handleResume = () => {
    navigate('/comercial/nueva-empresa')
  }

  const handleDiscard = () => {
    if (!window.confirm('¿Eliminar el formulario en progreso?')) return
    window.localStorage.removeItem(DRAFT_KEY)
    setDraft(null)
  }

  const datosGenerales = draft?.state?.data?.datosGenerales ?? {}
  const nombre = datosGenerales?.nombre || 'Sin nombre'
  const rut = datosGenerales?.rut || 'Sin RUT'
  const currentStep = draft?.state?.currentStep ?? 0

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h1 className="font-primary fw-bold mb-1">Empresas en Proceso</h1>
              <p className="text-muted mb-0">
                Aquí puedes retomar formularios de empresas que guardaste para continuar más tarde.
              </p>
            </div>

            <button
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={handleBack}
              type="button"
            >
              <ArrowLeft size={16} />
              Volver
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {!draft ? (
            <div className="text-center py-4">
              <AlertTriangle size={48} className="text-warning mb-2" />
              <p className="text-muted mb-0">
                No tienes formularios de empresa en proceso en este navegador.
              </p>
            </div>
          ) : (
            <div className="border rounded p-4">
              <h5 className="font-primary fw-semibold mb-2">{nombre}</h5>
              <p className="text-muted mb-2">RUT: {rut}</p>
              <p className="text-muted small mb-3">
                Paso guardado: {currentStep + 1} · Última actualización:{' '}
                {new Date(draft.savedAt).toLocaleString('es-CL')}
              </p>

              <div className="d-flex gap-2 flex-wrap">
                <button
                  className="btn btn-gradient d-flex align-items-center gap-2"
                  onClick={handleResume}
                  type="button"
                >
                  <FileEdit size={16} />
                  Reanudar
                </button>

                <button
                  className="btn btn-outline-danger"
                  onClick={handleDiscard}
                  type="button"
                >
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ComercialEmpresasProceso