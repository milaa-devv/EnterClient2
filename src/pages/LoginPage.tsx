import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useSignIn, useAuth } from '@/hooks/useAuth'
import { Building2, Eye, EyeOff, AlertCircle } from 'lucide-react'

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    rut: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { profile: user } = useAuth()
  const signIn = useSignIn()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const formatRut = (rut: string) => {
    const cleanRut = rut.replace(/[^0-9kK]/g, '')
    if (cleanRut.length <= 1) return cleanRut

    const body = cleanRut.slice(0, -1)
    const dv = cleanRut.slice(-1)

    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    return `${formattedBody}-${dv}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name === 'rut') {
      const formattedRut = formatRut(value)
      setFormData({ ...formData, rut: formattedRut })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Eliminar solo puntos para consulta, mantener guion
      const rutFiltrado = formData.rut.replace(/\./g, '').toUpperCase()

      const { data, error } = await supabase
        .from('usuario')
        .select('correo')
        .eq('rut', rutFiltrado)
        .single()

      const usuario = data as { correo?: string } | null

      if (error || !usuario?.correo) {
        setError('RUT no encontrado en el sistema.')
        setIsLoading(false)
        return
      }

      await signIn(usuario.correo, formData.password)
    } catch (err: any) {
      setError('Credenciales incorrectas. Verifique su RUT y contraseña.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5 col-xl-4">
            <div className="text-center mb-5">
              <Link to="/" className="text-decoration-none">
                <Building2 size={60} className="text-primary mb-3" />
                <h2 className="font-display text-primary mb-2">Bienvenido</h2>
              </Link>
              <p className="text-muted">Ingresa tus credenciales para continuar</p>
            </div>

            <div className="card shadow-sm">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <AlertCircle size={16} className="me-2" />
                      {error}
                    </div>
                  )}

                  <div className="mb-4">
                    <label htmlFor="rut" className="form-label font-primary fw-medium">
                      RUT
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="rut"
                      name="rut"
                      value={formData.rut}
                      onChange={handleInputChange}
                      placeholder="12.345.678-9"
                      maxLength={12}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label font-primary fw-medium">
                      Contraseña
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control form-control-lg pe-5"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Ingresa tu contraseña"
                        required
                      />
                      <button
                        type="button"
                        className="btn position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 font-primary fw-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Ingresando...
                      </>
                    ) : (
                      'Ingresar'
                    )}
                  </button>
                </form>
              </div>
            </div>

            <div className="text-center mt-4">
              <Link to="/" className="text-muted text-decoration-none">
                ← Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
