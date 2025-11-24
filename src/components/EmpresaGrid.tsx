import React from 'react'
import { useNavigate } from 'react-router-dom'
import { EmpresaCard } from './EmpresaCard'
import { EmpresaListItem } from './EmpresaListItem'
import { Pagination } from './Pagination'
import { Building2 } from 'lucide-react'
import type { EmpresaCompleta } from '@/types/empresa'

interface EmpresaGridProps {
  empresas: EmpresaCompleta[]
  viewMode: 'grid' | 'list'
  currentPage: number
  totalCount: number
  onPageChange: (page: number) => void
  pageSize?: number
  loading?: boolean

  /** Si es true, muestra el botón "Ir al formulario de Onboarding" cuando no hay empresas */
  showOnboardingButton?: boolean

  /** (Opcional) callback para refrescar listado si algún día lo usamos desde aquí */
  onRefresh?: () => void
}

export const EmpresaGrid: React.FC<EmpresaGridProps> = ({
  empresas,
  viewMode,
  currentPage,
  totalCount,
  onPageChange,
  pageSize = 12,
  loading = false,
  showOnboardingButton,   // 👉 sin valor por defecto: undefined = FALSO
}) => {
  const totalPages = Math.ceil(totalCount / pageSize)
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Cargando empresas...</span>
          </div>
          <p className="text-muted">Cargando empresas...</p>
        </div>
      </div>
    )
  }

  if (empresas.length === 0) {
    return (
      <div className="text-center py-5">
        <Building2 size={64} className="text-muted mb-3" />
        <h4 className="text-muted mb-2">No se encontraron empresas</h4>
        <p className="text-muted">
          Intenta ajustar los filtros de búsqueda o crear una nueva empresa.
        </p>

        {/* 👉 Solo se muestra si explícitamente se pasa showOnboardingButton={true} */}
        {showOnboardingButton && (
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate('/configuracion-empresa')}
          >
            Ir al formulario de Onboarding
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      {viewMode === 'grid' ? (
        <div className="row g-4 mb-4">
          {empresas.map((empresa) => (
            <div key={empresa.empkey} className="col-lg-4 col-md-6">
              <EmpresaCard empresa={empresa} />
            </div>
          ))}
        </div>
      ) : (
        <div className="d-flex flex-column gap-3 mb-4">
          {empresas.map((empresa) => (
            <EmpresaListItem key={empresa.empkey} empresa={empresa} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={totalCount}
          itemsPerPage={pageSize}
        />
      )}
    </div>
  )
}
