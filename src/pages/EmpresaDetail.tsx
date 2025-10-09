import React, { useState} from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, History, Download } from 'lucide-react'
import { useEmpresaDetail } from '@/hooks/useEmpresaDetail'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { ErrorMessage } from '@/components/ErrorMessage'

// Componentes de detalle
import { DatosGeneralesSection } from '@/components/empresa-detail/DatosGeneralesSection'
import { RepresentantesLegalesSection } from '@/components/empresa-detail/RepresentantesLegalesSection'
import { ContraparteTecnicaSection } from '@/components/empresa-detail/ContraparteTecnicaSection'
import { ContraparteAdministrativaSection } from '@/components/empresa-detail/ContraparteAdministrativaSection'
import { DTEEmpresasSection } from '@/components/empresa-detail/DTEEmpresasSection'
import { SucursalesSection } from '@/components/empresa-detail/SucursalesSection'
import { FichaTecnicaSection } from '@/components/empresa-detail/FichaTecnicaSection'
import { ServiciosContratadosSection } from '@/components/empresa-detail/ServiciosContratadosSection'
import { HistorialCambiosModal } from '@/components/modals/HistorialCambiosModal'

const EmpresaDetail: React.FC = () => {
  const { empkey } = useParams<{ empkey: string }>()
  const navigate = useNavigate()
  const [showHistorial, setShowHistorial] = useState(false)
  
  const {
    empresa,
    loading,
    error,
    refreshEmpresa
  } = useEmpresaDetail(empkey ? parseInt(empkey) : null)

  if (loading) {
    return <LoadingSpinner message="Cargando información de la empresa..." />
  }

  if (error || !empresa) {
    return (
      <ErrorMessage 
        message={error || 'Empresa no encontrada'}
        onRetry={refreshEmpresa}
      />
    )
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="font-primary fw-bold mb-1">
                  {empresa.comercial?.datosGenerales?.nombre || 'Sin nombre'}
                </h1>
                <div className="d-flex align-items-center gap-3">
                  <span className="text-muted">
                    Empkey: <strong>{empresa.empkey}</strong>
                  </span>
                  <span className={`badge bg-${
                    empresa.estado === 'COMERCIAL' ? 'warning' :
                    empresa.estado === 'ONBOARDING' ? 'info' :
                    empresa.estado === 'SAC' ? 'primary' : 'success'
                    }`}>
                    {empresa.estado}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary d-flex align-items-center gap-2"
                onClick={() => setShowHistorial(true)}
              >
                <History size={18} />
                Historial
              </button>
              <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                <Download size={18} />
                Exportar
              </button>
              <button className="btn btn-primary d-flex align-items-center gap-2">
                <Edit size={18} />
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="row g-4">
        {/* Datos Generales */}
        <div className="col-12">
          <DatosGeneralesSection empresa={empresa} />
        </div>

        {/* Representantes Legales */}
        <div className="col-12">
          <RepresentantesLegalesSection empresa={empresa} />
        </div>

        {/* Contrapartes */}
        <div className="col-lg-6">
          <ContraparteTecnicaSection empresa={empresa} />
        </div>
        <div className="col-lg-6">
          <ContraparteAdministrativaSection empresa={empresa} />
        </div>

        {/* DTE Empresas */}
        <div className="col-12">
          <DTEEmpresasSection empresa={empresa} />
        </div>

        {/* Sucursales */}
        <div className="col-12">
          <SucursalesSection empresa={empresa} />
        </div>

        {/* Ficha Técnica */}
        <div className="col-lg-8">
          <FichaTecnicaSection empresa={empresa} />
        </div>

        {/* Servicios Contratados */}
        <div className="col-lg-4">
          <ServiciosContratadosSection empresa={empresa} />
        </div>
      </div>

      {/* Modals */}
      {showHistorial && empresa.empkey !== undefined && (
        <HistorialCambiosModal
          empkey={empresa.empkey}
          isOpen={showHistorial}
          onClose={() => setShowHistorial(false)}
        />
      )}
    </div>
  )
}

export default EmpresaDetail
