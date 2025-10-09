// src/components/Pagination.tsx
import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  itemsPerPage: number
  showItemsCount?: boolean
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  showItemsCount = true
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generar números de página a mostrar
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Lógica para mostrar páginas con elipsis
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  if (totalPages <= 1) {
    return showItemsCount ? (
      <div className="d-flex justify-content-center">
        <span className="text-muted small">
          Mostrando {totalItems} de {totalItems} elementos
        </span>
      </div>
    ) : null
  }

  return (
    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
      {/* Items count */}
      {showItemsCount && (
        <div className="text-muted small">
          Mostrando {startItem}-{endItem} de {totalItems} elementos
        </div>
      )}

      {/* Pagination */}
      <nav>
        <ul className="pagination pagination-sm mb-0">
          {/* Primera página */}
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              title="Primera página"
            >
              <ChevronsLeft size={14} />
            </button>
          </li>

          {/* Página anterior */}
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              title="Página anterior"
            >
              <ChevronLeft size={14} />
            </button>
          </li>

          {/* Números de página */}
          {pageNumbers.map((page, index) => (
            <li key={index} className={`page-item ${
              page === currentPage ? 'active' : ''
            } ${page === '...' ? 'disabled' : ''}`}>
              {page === '...' ? (
                <span className="page-link">...</span>
              ) : (
                <button
                  className="page-link"
                  onClick={() => onPageChange(page as number)}
                >
                  {page}
                </button>
              )}
            </li>
          ))}

          {/* Página siguiente */}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Página siguiente"
            >
              <ChevronRight size={14} />
            </button>
          </li>

          {/* Última página */}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              title="Última página"
            >
              <ChevronsRight size={14} />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}
