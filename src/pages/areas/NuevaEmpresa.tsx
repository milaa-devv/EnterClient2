import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { FormStepper } from '@/components/FormStepper'
import { FormProvider, useFormContext } from '@/contexts/FormContext'
import { supabase, getCurrentUser } from '@/lib/supabase'

// Pasos del formulario
import { DatosGeneralesStep } from '@/components/forms/DatosGeneralesStep'
import { DatosContactoStep } from '@/components/forms/DatosContactoStep'
import { ActividadesEconomicasStep } from '@/components/forms/ActividadesEconomicasStep'
import { RepresentantesLegalesStep } from '@/components/forms/RepresentantesLegalesStep'
import { DocumentosTributariosStep } from '@/components/forms/DocumentosTributariosStep'
import { ContrapartesStep } from '@/components/forms/ContrapartesStep'
import { UsuariosPlataformaStep } from '@/components/forms/UsuariosPlataformaStep'
import { ConfiguracionNotificacionesStep } from '@/components/forms/ConfiguracionNotificacionesStep'
import { InformacionPlanStep } from '@/components/forms/InformacionPlanStep'

const STEP_COMPONENTS = [
  DatosGeneralesStep,
  DatosContactoStep,
  ActividadesEconomicasStep,
  RepresentantesLegalesStep,
  DocumentosTributariosStep,
  ContrapartesStep,
  UsuariosPlataformaStep,
  ConfiguracionNotificacionesStep,
  InformacionPlanStep
]

/* ================= Helpers ================= */

// Regex “parece RUT” (con o sin puntos, con o sin guión, acepta K/k)
const RUT_LIKE_RE =
  /^(\d{1,3}(?:\.\d{3})+|\d{7,9})[-\s/]?([\dkK])$/;

// Normaliza a "12345678-K" (sin puntos)
function normalizeRut(raw?: string): string | null {
  if (!raw) return null
  // quitar espacios
  const trimmed = raw.trim()
  // si viene con puntos o sin guión, capturamos usando regex amigable
  const m = trimmed.match(RUT_LIKE_RE)
  if (m) {
    const cuerpo = m[1].replace(/\./g, '')
    const dv = m[2].toUpperCase()
    return `${cuerpo}-${dv}`
  }
  // fallback: quitar todo menos dígitos y K, y recomponer
  const cleaned = trimmed.replace(/[^\dkK]/g, '')
  if (cleaned.length < 2) return null
  const dv = cleaned.slice(-1).toUpperCase()
  const cuerpo = cleaned.slice(0, -1)
  return /^\d+$/.test(cuerpo) ? `${cuerpo}-${dv}` : null
}

// Deriva empkey desde los dígitos del RUT (sin DV)
function empkeyFromRut(rutNorm?: string): number | null {
  if (!rutNorm) return null
  const digits = rutNorm.replace(/\D+/g, '')
  if (digits.length < 2) return null
  const sinDv = digits.slice(0, -1)
  const trimmed = sinDv.slice(-9) // limitar largo
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

// Busca una ruta segura dentro de un objeto por path "a.b.c"
function getPath(obj: any, path: string) {
  const parts = path.split('.')
  let cur = obj
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p]
    else return undefined
  }
  return cur
}

// Toma la primera clave que exista y tenga valor no vacío
function pick(obj: any, keys: string[]) {
  for (const k of keys) {
    const v = k.includes('.') ? getPath(obj, k) : obj?.[k]
    if (v !== undefined && v !== null && `${v}`.trim() !== '') return { key: k, value: v }
  }
  return { key: undefined as string | undefined, value: undefined as any }
}

// Recorre profundidades del objeto y devuelve el primer string que “parece RUT”
function findRutAnywhere(obj: any): { keyPath: string; value: string } | null {
  const seen = new WeakSet()
  function walk(node: any, path: string[]): { keyPath: string; value: string } | null {
    if (!node || typeof node !== 'object') return null
    if (seen.has(node)) return null
    seen.add(node)
    for (const k of Object.keys(node)) {
      const v = (node as any)[k]
      const p = [...path, k]
      if (typeof v === 'string') {
        const s = v.trim()
        if (RUT_LIKE_RE.test(s) || /[\dkK]$/.test(s) && normalizeRut(s)) {
          return { keyPath: p.join('.'), value: s }
        }
      } else if (v && typeof v === 'object') {
        const hit = walk(v, p)
        if (hit) return hit
      }
    }
    return null
  }
  return walk(obj, [])
}

/* ================ Componente ================ */
const NuevaEmpresaContent: React.FC = () => {
  const navigate = useNavigate()

  const ctx = useFormContext() as any
  const state = ctx?.state ?? {}
  const nextStep = ctx?.nextStep ?? (() => { })
  const prevStep = ctx?.prevStep ?? (() => { })
  const currentStep = state?.currentStep ?? 0

  const totalSteps = STEP_COMPONENTS.length
  const CurrentStepComponent = STEP_COMPONENTS[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const formDG = useMemo(
    () => state?.datosGenerales ?? state?.generales ?? {},
    [state]
  )

  const handlePrevious = () => {
    if (isFirstStep) navigate('/comercial')
    else prevStep()
  }

  const handleNext = async () => {
    if (!isLastStep) {
      nextStep()
      return
    }

    setErrorMsg(null)
    setSubmitting(true)

    try {
      // 1) Intentar por nombres “conocidos”
      const { value: rutVal1 } = pick(formDG, [
        'rut', 'rut_empresa', 'rutEmpresa', 'rutEmpresaFormateado', 'rut_empresa_formateado', 'rut_formateado',
        'datosGenerales.rut', 'datosGenerales.rutEmpresa'
      ])


      // 2) Si no, buscar en TODO el estado
      const rutFallback = rutVal1 ?? findRutAnywhere(state)?.value ?? findRutAnywhere(formDG)?.value

      const rutNorm = normalizeRut(String(rutFallback ?? ''))
      if (!rutNorm) {
        // debug amigable
        // console.log('STATE:', state); console.log('formDG:', formDG);
        throw new Error('Falta el RUT de la empresa en “Datos Generales”.')
      }

      // Otros datos (tolerantes)
      const razonSocial = (pick(formDG, ['razonSocial', 'nombre', 'razon_social']).value
        ?? pick(state, ['razonSocial', 'nombre', 'razon_social']).value) as string | undefined
      const nombreFantasia = (pick(formDG, ['nombreFantasia', 'fantasia', 'nombre_fantasia']).value
        ?? pick(state, ['nombreFantasia', 'fantasia', 'nombre_fantasia']).value) as string | undefined
      const domicilio = (pick(formDG, ['direccion', 'domicilio']).value
        ?? pick(state, ['direccion', 'domicilio']).value) as string | undefined
      const telefono = (pick(formDG, ['telefono', 'telefonoEmpresa']).value
        ?? pick(state, ['telefono', 'telefonoEmpresa']).value) as string | undefined
      const correo = (pick(formDG, ['correo', 'email']).value
        ?? pick(state, ['correo', 'email']).value) as string | undefined
      const empkeyForm = (pick(formDG, ['empkey']).value
        ?? pick(state, ['empkey']).value) as number | string | undefined

      // empkey
      let empkey: number | null = null
      if (empkeyForm !== undefined && empkeyForm !== null && `${empkeyForm}`.trim() !== '') {
        const n = Number(empkeyForm)
        if (!Number.isFinite(n)) throw new Error('El empkey indicado no es numérico.')
        empkey = n
      } else {
        empkey = empkeyFromRut(rutNorm)
        if (!empkey) throw new Error('No se pudo derivar un empkey desde el RUT. Ingresa un empkey en el formulario.')
      }

      const user = await getCurrentUser().catch(() => null)
      const created_by = (user as any)?.email ?? null

      // Insert empresa
      const empresaRow: any = {
        empkey,
        rut: rutNorm,
        nombre: razonSocial ?? null,
        nombre_fantasia: nombreFantasia ?? null,
        domicilio: domicilio ?? null,
        telefono: telefono ?? null,
        correo: correo ?? null,
        created_by
      }

      const { data: empresaData, error: empErr } = await (supabase as any)
        .from('empresa')
        .insert([empresaRow])
        .select()
        .single()
      if (empErr) throw empErr

      // Insert onboarding pendiente
      const { error: obErr } = await (supabase as any)
        .from('empresa_onboarding')
        .insert([{ empkey: empresaData.empkey, estado: 'pendiente' }])
      if (obErr) throw obErr

      navigate('/onboarding/solicitudes-nuevas', {
        state: { message: 'Empresa enviada a Onboarding (estado: pendiente)' }
      })
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err?.message ?? 'Ocurrió un error al enviar la empresa a Onboarding.')
    } finally {
      setSubmitting(false)
    }
  }

  // Info de diagnóstico para el badge de abajo
  const foundRut =
    pick(formDG, ['rut', 'rut_empresa', 'rutEmpresa', 'rutEmpresaFormateado', 'rut_empresa_formateado', 'rut_formateado']).value
    ?? findRutAnywhere(formDG)?.value
    ?? findRutAnywhere(state)?.value
    ?? '—'

  const foundKey =
    pick(formDG, ['rut', 'rut_empresa', 'rutEmpresa', 'rutEmpresaFormateado', 'rut_empresa_formateado', 'rut_formateado']).key
    ?? findRutAnywhere(formDG)?.keyPath
    ?? findRutAnywhere(state)?.keyPath
    ?? 'no-detectado'

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex align-items-center gap-3 mb-3">
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/comercial')}
              disabled={submitting}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="font-primary fw-bold mb-0">Nueva Empresa</h1>
              <p className="text-muted small mb-0">
                Complete la información para registrar una nueva empresa cliente
              </p>
            </div>
          </div>

          <FormStepper orientation="horizontal" />
        </div>
      </div>

      {errorMsg && (
        <div className="row mb-3">
          <div className="col-lg-10 col-xl-8 mx-auto">
            <div className="alert alert-danger">{errorMsg}</div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="row">
        <div className="col-lg-10 col-xl-8 mx-auto">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <CurrentStepComponent />
            </div>
            <div className="card-footer bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted small">
                  Paso {currentStep + 1} de {totalSteps}
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handlePrevious}
                    disabled={submitting}
                  >
                    {isFirstStep ? 'Cancelar' : 'Anterior'}
                  </button>

                  <button
                    type="button"
                    className={`btn ${isLastStep ? 'btn-success' : 'btn-primary'} d-flex align-items-center gap-2`}
                    onClick={handleNext}
                    disabled={submitting}
                  >
                    {isLastStep ? (
                      <>
                        <Send size={16} />
                        {submitting ? 'Enviando…' : 'Enviar a Onboarding'}
                      </>
                    ) : 'Siguiente'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-muted small mt-3">
            RUT detectado:&nbsp;<strong>{String(foundRut)}</strong>
            <span className="ms-2">(<em>clave:</em> {foundKey})</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const NuevaEmpresa: React.FC = () => (
  <FormProvider>
    <NuevaEmpresaContent />
  </FormProvider>
)

export default NuevaEmpresa
