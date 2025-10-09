import React, { useState } from 'react'
import { useFormContext } from '@/contexts/FormContext'
import { Plus, X, User, Mail, Phone, Shield } from 'lucide-react'
import type { UsuarioPlataforma } from '@/types/empresa'

export const UsuariosPlataformaStep: React.FC = () => {
  const { state, updateData } = useFormContext()
  const [usuarios, setUsuarios] = useState<UsuarioPlataforma[]>(
    state.data.usuariosPlataforma || []
  )
  const [showForm, setShowForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [formData, setFormData] = useState<Partial<UsuarioPlataforma>>({})

  const rolesDisponibles = [
    { id: 'admin', nombre: 'Administrador', descripcion: 'Acceso completo al sistema' },
    { id: 'user', nombre: 'Usuario', descripcion: 'Acceso básico para emisión de documentos' },
    { id: 'viewer', nombre: 'Consulta', descripcion: 'Solo puede ver documentos y reportes' },
    { id: 'accountant', nombre: 'Contador', descripcion: 'Acceso a reportes contables y tributarios' }
  ]

  const formatRut = (value: string) => {
    const cleanValue = value.replace(/[^0-9kK]/g, '')
    if (cleanValue.length <= 1) return cleanValue
    
    const body = cleanValue.slice(0, -1)
    const dv = cleanValue.slice(-1)
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    
    return `${formattedBody}-${dv}`
  }

  const handleSaveUsuario = () => {
    if (!formData.rut || !formData.nombre || !formData.rol) return

    const newUsuario: UsuarioPlataforma = {
      id: editingIndex !== null ? usuarios[editingIndex].id : Date.now().toString(),
      rut: formData.rut,
      nombre: formData.nombre,
      correo: formData.correo || '',
      telefono: formData.telefono || '',
      rol: formData.rol,
      activo: formData.activo !== false
    }

    let updatedUsuarios: UsuarioPlataforma[]
    if (editingIndex !== null) {
      updatedUsuarios = usuarios.map((user, index) => 
        index === editingIndex ? newUsuario : user
      )
    } else {
      updatedUsuarios = [...usuarios, newUsuario]
    }

    setUsuarios(updatedUsuarios)
    updateData({ usuariosPlataforma: updatedUsuarios })
    
    // Reset form
    setFormData({})
    setShowForm(false)
    setEditingIndex(null)
  }

  const handleEditUsuario = (index: number) => {
    setFormData(usuarios[index])
    setEditingIndex(index)
    setShowForm(true)
  }

  const handleDeleteUsuario = (index: number) => {
    const updatedUsuarios = usuarios.filter((_, i) => i !== index)
    setUsuarios(updatedUsuarios)
    updateData({ usuariosPlataforma: updatedUsuarios })
  }

  const handleCancelForm = () => {
    setFormData({})
    setShowForm(false)
    setEditingIndex(null)
  }

  const getRolInfo = (rolId: string) => {
    return rolesDisponibles.find(rol => rol.id === rolId)
  }

  const getRolColor = (rolId: string) => {
    switch (rolId) {
      case 'admin': return 'danger'
      case 'user': return 'primary'
      case 'viewer': return 'info'
      case 'accountant': return 'warning'
      default: return 'secondary'
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="font-primary fw-semibold mb-2">Usuarios de la Plataforma</h4>
        <p className="text-muted">
          Configure los usuarios que tendrán acceso al sistema
        </p>
      </div>

      {/* Lista de usuarios */}
      <div className="mb-4">
        {usuarios.length === 0 ? (
          <div className="text-center py-4 border rounded bg-light">
            <User size={48} className="text-muted mb-2" />
            <p className="text-muted mb-0">No hay usuarios configurados</p>
          </div>
        ) : (
          <div className="row g-3">
            {usuarios.map((usuario, index) => {
              const rolInfo = getRolInfo(usuario.rol)
              
              return (
                <div key={usuario.id} className="col-lg-6">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <User size={20} />
                          <div>
                            <h6 className="mb-0">{usuario.nombre}</h6>
                            <small className="text-muted">{usuario.rut}</small>
                          </div>
                        </div>
                        <div className="d-flex gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditUsuario(index)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteUsuario(index)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <span className={`badge bg-${getRolColor(usuario.rol)}`}>
                          <Shield size={12} className="me-1" />
                          {rolInfo?.nombre || usuario.rol}
                        </span>
                        {!usuario.activo && (
                          <span className="badge bg-secondary ms-1">Inactivo</span>
                        )}
                      </div>
                      
                      <div className="small text-muted">
                        {usuario.correo && (
                          <div className="mb-1">
                            <Mail size={12} className="me-1" />
                            {usuario.correo}
                          </div>
                        )}
                        {usuario.telefono && (
                          <div>
                            <Phone size={12} className="me-1" />
                            {usuario.telefono}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Botón agregar */}
      {!showForm && (
        <button
          type="button"
          className="btn btn-outline-primary d-flex align-items-center gap-2 mb-4"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          Agregar Usuario
        </button>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              {editingIndex !== null ? 'Editar' : 'Agregar'} Usuario
            </h6>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label required">RUT</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="12.345.678-9"
                  value={formData.rut || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    rut: formatRut(e.target.value)
                  })}
                  maxLength={12}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label required">Nombre Completo</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Juan Pérez González"
                  value={formData.nombre || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    nombre: e.target.value
                  })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Correo Electrónico</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="usuario@empresa.cl"
                    value={formData.correo || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      correo: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label">Teléfono</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Phone size={18} />
                  </span>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+56 9 1234 5678"
                    value={formData.telefono || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      telefono: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="col-12">
                <label className="form-label required">Rol</label>
                <div className="row g-2">
                  {rolesDisponibles.map((rol) => (
                    <div key={rol.id} className="col-md-6">
                      <div 
                        className={`card cursor-pointer ${
                          formData.rol === rol.id 
                            ? `border-${getRolColor(rol.id)} bg-${getRolColor(rol.id)} bg-opacity-10` 
                            : 'border-light'
                        }`}
                        onClick={() => setFormData({
                          ...formData,
                          rol: rol.id
                        })}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <Shield size={16} className={`text-${getRolColor(rol.id)}`} />
                            <h6 className="mb-0">{rol.nombre}</h6>
                          </div>
                          <p className="small text-muted mb-0">
                            {rol.descripcion}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-12">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="usuario_activo"
                    checked={formData.activo !== false}
                    onChange={(e) => setFormData({
                      ...formData,
                      activo: e.target.checked
                    })}
                  />
                  <label className="form-check-label" htmlFor="usuario_activo">
                    Usuario Activo
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveUsuario}
                disabled={!formData.rut || !formData.nombre || !formData.rol}
              >
                {editingIndex !== null ? 'Actualizar' : 'Agregar'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelForm}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información importante */}
      <div className="alert alert-info mt-4">
        <h6 className="alert-heading">Información sobre Usuarios</h6>
        <ul className="mb-0 small">
          <li><strong>Administrador:</strong> Acceso completo al sistema, puede configurar otros usuarios</li>
          <li><strong>Usuario:</strong> Puede emitir documentos y gestionar datos básicos</li>
          <li><strong>Consulta:</strong> Solo visualización de documentos y reportes</li>
          <li><strong>Contador:</strong> Acceso especializado para reportes contables y tributarios</li>
          <li>Los usuarios recibirán credenciales de acceso por correo electrónico</li>
        </ul>
      </div>
    </div>
  )
}
