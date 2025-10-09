import React, { useState, useCallback, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useEmpresaSearch } from '@/hooks/useEmpresaSearch'
import { debounce } from '@/lib/utils'

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  variant?: 'default' | 'navbar' | 'mobile'
  onSelect?: (empresa: any) => void
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Buscar...',
  value: controlledValue,
  onChange: controlledOnChange,
  variant = 'default',
  onSelect
}) => {
  const [internalValue, setInternalValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Usar valor controlado o interno
  const value = controlledValue !== undefined ? controlledValue : internalValue
  const onChange = controlledOnChange || setInternalValue

  // Función de búsqueda con debounce
  const searchEmpresas = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([])
        setIsLoading(false)
        return
      }

      try {
        // Aquí harías la búsqueda real a Supabase
        // Por ahora simulamos con datos mock
        const mockResults = [
          {
            empkey: 12345,
            nombre: 'Empresa Demo S.A.',
            rut: '96.123.456-7',
            estado: 'COMERCIAL'
          },
          {
            empkey: 12346,
            nombre: 'Comercial Demo Ltda.',
            rut: '76.654.321-0',
            estado: 'ONBOARDING'
          }
        ].filter(empresa => 
          empresa.nombre.toLowerCase().includes(query.toLowerCase()) ||
          empresa.rut.includes(query) ||
          empresa.empkey.toString().includes(query)
        )

        setSuggestions(mockResults)
      } catch (error) {
        console.error('Error en búsqueda:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 300),
    []
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    if (newValue.length >= 2) {
      setIsLoading(true)
      setIsOpen(true)
      searchEmpresas(newValue)
    } else {
      setIsOpen(false)
      setSuggestions([])
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    onChange('')
    setIsOpen(false)
    setSuggestions([])
    inputRef.current?.focus()
  }

  const handleSelectSuggestion = (empresa: any) => {
    setIsOpen(false)
    
    if (onSelect) {
      onSelect(empresa)
    } else {
      navigate(`/empresa/${empresa.empkey}`)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      // Navegar a resultados de búsqueda o seleccionar primera sugerencia
      if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0])
      } else {
        navigate(`/dashboard?search=${encodeURIComponent(value)}`)
      }
    }
  }

  const getInputClasses = () => {
    const baseClasses = "form-control pe-5"
    
    switch (variant) {
      case 'navbar':
        return `${baseClasses} form-control-sm`
      case 'mobile':
        return baseClasses
      default:
        return baseClasses
    }
  }

  return (
    <div className="position-relative">
      <form onSubmit={handleSubmit}>
        <div className="position-relative">
          <input
            ref={inputRef}
            type="text"
            className={getInputClasses()}
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onFocus={() => value.length >= 2 && setIsOpen(true)}
            onBlur={() => {
              // Delay para permitir clicks en sugerencias
              setTimeout(() => setIsOpen(false), 200)
            }}
          />
          
          {/* Iconos */}
          <div className="position-absolute end-0 top-50 translate-middle-y pe-3">
            {value ? (
              <button
                type="button"
                className="btn btn-sm p-0 border-0 bg-transparent"
                onClick={handleClear}
              >
                <X size={16} className="text-muted" />
              </button>
            ) : (
              <Search size={16} className="text-muted" />
            )}
          </div>
        </div>
      </form>

      {/* Sugerencias */}
      {isOpen && (suggestions.length > 0 || isLoading) && (
        <div className="position-absolute top-100 start-0 end-0 bg-white border rounded-bottom shadow-lg" style={{ zIndex: 1000 }}>
          {isLoading ? (
            <div className="p-3 text-center">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Buscando...</span>
              </div>
            </div>
          ) : (
            <ul className="list-unstyled mb-0">
              {suggestions.map((empresa) => (
                <li key={empresa.empkey}>
                  <button
                    type="button"
                    className="btn btn-link w-100 text-start p-3 border-0 rounded-0"
                    onClick={() => handleSelectSuggestion(empresa)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold">{empresa.nombre}</div>
                        <small className="text-muted">
                          {empresa.rut} • Empkey: {empresa.empkey}
                        </small>
                      </div>
                      <span className={`badge bg-${
                        empresa.estado === 'COMERCIAL' ? 'warning' :
                        empresa.estado === 'ONBOARDING' ? 'info' :
                        empresa.estado === 'SAC' ? 'primary' : 'success'
                      }`}>
                        {empresa.estado}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
