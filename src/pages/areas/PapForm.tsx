import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

interface Sender {
  id: string
  nombre: string
}

const PapForm = () => {
  const { empkey } = useParams()
  const navigate = useNavigate()

  const [dataCasilla, setDataCasilla] = useState('')
  const [senders, setSenders] = useState<Sender[]>([])
  const [selectedSenders, setSelectedSenders] = useState<string[]>([])
  const [declaracionCumplimiento, setDeclaracionCumplimiento] = useState<'Si' | 'No' | ''>('')
  const [acotacionesPAP, setAcotacionesPAP] = useState('')

  // Simula cargar la casilla desde onboarding
  useEffect(() => {
    async function fetchCasilla() {
      // TODO: Implementa la llamada a backend o Supabase para traer Casilla
      setDataCasilla('casilla_obtenida_desde_onboarding')
    }
    fetchCasilla()
  }, [empkey])

  // Simula cargar lista de senders
  useEffect(() => {
    async function fetchSenders() {
      // TODO: Se cambiara por real a API o Supabase
      setSenders([
        { id: 'sender1', nombre: 'Pablo Mateluna' },
        { id: 'sender2', nombre: 'Tomas Hidalgo' },
        { id: 'sender3', nombre: 'Gonzalo Medina' },
      ])
    }
    fetchSenders()
  }, [])

  const toggleSender = (id: string) => {
    setSelectedSenders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implementa guardar datos en backend o Supabase
    alert('Datos de PAP guardados correctamente.')
    navigate('/sac') // Navegar después
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Formulario PAP (Empresa {empkey})</h2>

      <label className="form-label required">Declaración de Cumplimiento</label>
      <select
        className="form-select mb-3"
        value={declaracionCumplimiento}
        onChange={(e) => setDeclaracionCumplimiento(e.target.value as 'Si' | 'No' | '')}
        required
      >
        <option value="">-- Seleccione --</option>
        <option value="Si">Sí</option>
        <option value="No">No</option>
      </select>

      <div className="mb-3">
        <label className="form-label">Casilla (de Onboarding)</label>
        <input className="form-control" type="text" value={dataCasilla} readOnly />
      </div>

      <fieldset className="mb-3">
        <legend>Sender Enternet</legend>
        {senders.map((sender) => (
          <div key={sender.id} className="form-check">
            <input
              type="checkbox"
              id={sender.id}
              className="form-check-input"
              checked={selectedSenders.includes(sender.id)}
              onChange={() => toggleSender(sender.id)}
            />
            <label className="form-check-label" htmlFor={sender.id}>
              {sender.nombre}
            </label>
          </div>
        ))}
      </fieldset>

      <div className="mb-3">
        <label className="form-label">Acotaciones del PAP</label>
        <textarea
          className="form-control"
          rows={4}
          value={acotacionesPAP}
          onChange={(e) => setAcotacionesPAP(e.target.value)}
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Guardar y Finalizar
      </button>
    </form>
  )
}

export default PapForm
