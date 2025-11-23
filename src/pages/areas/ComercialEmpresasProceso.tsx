import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, FileEdit } from 'lucide-react'

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
      <div className="row mb-4">
        <div className="col">
          <h1 className="font-primary fw-bold mb-1">Empresas en Proceso</h1>
          <p className="text-muted mb-0">
            Aquí puedes retomar formularios de empresas que guardaste para continuar más tarde.
          </p>
        </div>
      </div>

      {!draft && (
        <div className="text-center py-5">
          <AlertTriangle size={48} className="text-muted mb-3" />
          <p className="text-muted">
            No tienes formularios de empresa en proceso en este navegador.
          </p>
        </div>
      )}

      {draft && (
        <div className="card">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">{nombre}</h5>
              <p className="mb-1 text-muted">RUT: {rut}</p>
              <small className="text-muted">
                Paso guardado: {currentStep + 1} · Última actualización:{' '}
                {new Date(draft.savedAt).toLocaleString('es-CL')}
              </small>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={handleResume}
              >
                <FileEdit size={16} />
                Reanudar
              </button>
              <button className="btn btn-outline-danger btn-sm" onClick={handleDiscard}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ComercialEmpresasProceso
