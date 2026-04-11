import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Send } from 'lucide-react'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { FormProvider, useFormContext } from '@/contexts/FormContext'
import type { PreIngreso } from '@/hooks/usePreIngresos'

// Steps existentes
import { DatosGeneralesStep } from '@/components/forms/DatosGeneralesStep'
import { DatosContactoStep } from '@/components/forms/DatosContactoStep'
import { RepresentantesLegalesStep } from '@/components/forms/RepresentantesLegalesStep'
import { UsuariosPlataformaStep } from '@/components/forms/UsuariosPlataformaStep'
import { ContrapartesStep } from '@/components/forms/ContrapartesStep'
import { ConfiguracionNotificacionesStep } from '@/components/forms/ConfiguracionNotificacionesStep'
import { ActividadesEconomicasStep } from '@/components/forms/ActividadesEconomicasStep'
import { DocumentosTributariosStep } from '@/components/forms/DocumentosTributariosStep'
import { InformacionPlanStep } from '@/components/forms/InformacionPlanStep'

// Steps nuevos
import { DocumentacionEmpresaStep } from '@/components/forms/DocumentacionEmpresaStep'
import { ResumenPreIngresoStep } from '@/components/forms/ResumenPreIngresoStep'

// ——— Pasos ————————————————————————————————————————
const STEPS = [
  { id: 0,  label: 'Datos Generales' },
  { id: 1,  label: 'Datos Contacto' },
  { id: 2,  label: 'Representantes' },
  { id: 3,  label: 'Usuarios' },
  { id: 4,  label: 'Contrapartes' },
  { id: 5,  label: 'Notificaciones' },
  { id: 6,  label: 'Documentación' },
  { id: 7,  label: 'Actividades' },
  { id: 8,  label: 'Docs. Tributarios' },
  { id: 9,  label: 'Plan' },
  { id: 10, label: 'Resumen' },
]

// ——— Función para detectar si un step tiene datos ———
function stepTieneDatos(stepIndex: number, data: any): boolean {
  switch (stepIndex) {
    case 0:  return !!(data.datosGenerales?.nombre || data.datosGenerales?.rut)
    case 1:  return !!(data.datosContacto?.domicilio || data.datosContacto?.telefono)
    case 2:  return (data.representantesLegales?.length ?? 0) > 0
    case 3:  return (data.usuariosPlataforma?.length ?? 0) > 0
    case 4:  return (data.contrapartes?.length ?? 0) > 0
    case 5:  return (data.configuracionNotificaciones?.length ?? 0) > 0
    case 6:  return !!(data.documentacionEmpresa?.logoNombre || data.documentacionEmpresa?.carpetaNombre)
    case 7:  return (data.actividadesEconomicas?.length ?? 0) > 0
    case 8:  return (data.documentosTributarios?.filter((d: any) => d.selected)?.length ?? 0) > 0
    case 9:  return !!(
      data.informacionPlan?.productos &&
      Object.values(data.informacionPlan.productos as Record<string, boolean>).some(v => v === true)
    )
    case 10: return false // Resumen nunca se "completa"
    default: return false
  }
}

// ——— Stepper con navegación libre ————————————————
const Stepper: React.FC<{ currentStep: number; data: any; onStepClick: (i: number) => void }> = ({ currentStep, data, onStepClick }) => (
  <div className="card mb-4">
    <div className="card-body py-3">
      <div className="d-flex align-items-center justify-content-between gap-1" style={{ overflowX: 'auto' }}>
        {STEPS.map((step, i) => {
          const tieneDatos  = stepTieneDatos(i, data)
          const esActual    = i === currentStep
          const esResumen   = i === STEPS.length - 1
          const navegable   = tieneDatos || esActual || i === 0

          // Color del círculo
          let bgColor = 'var(--bs-gray-300)'
          let textColor = 'var(--bs-gray-600)'
          if (esActual) { bgColor = 'var(--bs-primary)'; textColor = '#fff' }
          else if (tieneDatos && !esResumen) { bgColor = 'var(--bs-success)'; textColor = '#fff' }

          // Color del conector
          const connectorColor = stepTieneDatos(i, data) && i < currentStep
            ? 'var(--bs-success)'
            : i < currentStep
              ? 'var(--bs-primary)'
              : 'var(--bs-gray-300)'

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => navegable && onStepClick(i)}
                disabled={!navegable}
                className="d-flex flex-column align-items-center gap-1 border-0 bg-transparent p-0 flex-shrink-0"
                style={{ cursor: navegable ? 'pointer' : 'default', minWidth: 48 }}
                title={!navegable ? 'Completa este paso para poder acceder' : step.label}
              >
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle fw-semibold"
                  style={{
                    width: 30, height: 30, fontSize: 12, flexShrink: 0,
                    background: bgColor,
                    color: textColor,
                    transition: 'all 0.2s',
                    opacity: navegable ? 1 : 0.45,
                    outline: esActual ? '2px solid var(--bs-primary)' : 'none',
                    outlineOffset: 2,
                  }}
                >
                  {tieneDatos && !esActual && !esResumen ? <Check size={14} /> : i + 1}
                </div>
                <span style={{
                  fontSize: 10, whiteSpace: 'nowrap', textAlign: 'center',
                  color: esActual ? 'var(--bs-primary)' : navegable ? 'var(--bs-gray-700)' : 'var(--bs-gray-400)',
                  fontWeight: esActual ? 600 : 400,
                }}>
                  {step.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 2, minWidth: 6, marginBottom: 20,
                  background: connectorColor,
                  transition: 'background 0.2s',
                }} />
              )}
            </React.Fragment>
          )
        })}
      </div>
      <div className="text-center mt-2" style={{ fontSize: 11, color: 'var(--bs-gray-500)' }}>
        Puedes navegar libremente entre los pasos que ya tienen información
      </div>
    </div>
  </div>
)

// ——— Mapeo xlsx → FormContext —————————————————————

function mapearRol(rol: string): string {
  const r = rol.toLowerCase()
  if (r.includes('admin')) return 'admin'
  if (r.includes('factur')) return 'facturador'
  if (r.includes('recep')) return 'recepcion'
  if (r.includes('guía') || r.includes('guia')) return 'guias'
  return 'facturador'
}

function mapearUsuariosXlsx(rows: Record<string, string>[]): any[] {
  return rows
    .filter(r => r['RUT'] && r['Nombre'])
    .map(r => ({
      id:       Date.now().toString() + Math.random(),
      rut:      r['RUT'] ?? '',
      nombre:   r['Nombre'] ?? '',
      correo:   r['Email'] ?? '',
      telefono: r['Teléfono'] ?? '',
      rol:      mapearRol(r['Rol'] ?? ''),
      activo:   true,
    }))
}

function mapearContraparteXlsx(rows: Record<string, string>[]): any[] {
  return rows
    .filter(r => r['RUT'] && r['Nombre Completo'])
    .map(r => ({
      id:       Date.now().toString() + Math.random(),
      rut:      r['RUT'] ?? '',
      nombre:   r['Nombre Completo'] ?? '',
      cargo:    r['Cargo'] ?? '',
      telefono: r['Teléfono'] ?? '',
      correo:   r['Correo Electrónico'] ?? '',
      tipo:     (r['Tipo'] ?? '').toUpperCase().includes('TEC') ? 'TECNICA' : 'ADMINISTRATIVA',
    }))
}

function mapearNotificacionesXlsx(rows: Record<string, string>[]): any[] {
  const tipos = [
    { key: 'Administración de Folios',           id: 'administrar_folios',      nombre: 'Administración de Folios' },
    { key: 'Rechazos Comerciales',                id: 'rechazos_comerciales',    nombre: 'Rechazos Comerciales' },
    { key: 'DTE Proveedores próximos a vencer',   id: 'dte_proveedores',         nombre: 'DTE proveedores próximos a vencer' },
    { key: 'Vencimiento de Certificado',          id: 'vencimiento_certificado', nombre: 'Vencimiento Certificado' },
    { key: 'Errores Técnicos',                    id: 'errores_tecnicos',        nombre: 'Errores Técnicos' },
    { key: 'Administración Certificado Digital',  id: 'admin_cert',              nombre: 'Administración Certificado Digital' },
  ]
  const result: any[] = []
  rows.filter(r => r['Correo Electrónico']).forEach(r => {
    tipos.forEach(t => {
      if ((r[t.key] ?? '').toString().toUpperCase() === 'X') {
        result.push({
          id:          Date.now().toString() + Math.random(),
          correo:      r['Correo Electrónico'],
          tipo:        t.id,
          descripcion: t.nombre,
          activo:      true,  // ✅ Fix: siempre activo cuando viene del xlsx con X
        })
      }
    })
  })
  return result
}

function normRut(raw?: string | number | null): string {
  if (!raw) return ''
  return String(raw).trim()
}

// ——— Formulario interno ———————————————————————————
const PreIngresoFormInner: React.FC<{ preIngreso: PreIngreso; onEnviado: () => void }> = ({ preIngreso, onEnviado }) => {
  const { state, updateData, nextStep, prevStep, setCurrentStep } = useFormContext()
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const navigate = useNavigate()

  const currentStep = state.currentStep
  const isLastStep  = currentStep === STEPS.length - 1

  // Pre-llenar FormContext con datos de HubSpot + xlsx
  // Solo si el formulario aún no tiene datos (primera vez)
  useEffect(() => {
    if (state.data.datosGenerales?.nombre) return // Ya tiene datos, no sobreescribir

    const datos = preIngreso.datos_json as Record<string, string> | null
    const rep   = preIngreso.representante as Record<string, string> | null

    const usuariosXlsx = (preIngreso.usuarios_xlsx    as Record<string, string>[] | null) ?? []
    const contrapXlsx  = (preIngreso.contrapartes_xlsx as Record<string, string>[] | null) ?? []
    const notifXlsx    = (preIngreso.notificaciones_xlsx as Record<string, string>[] | null) ?? []

    updateData({
      datosGenerales: {
        nombre:         datos?.razon_social ?? preIngreso.nombre_empresa ?? '',
        rut:            normRut(preIngreso.rut),
        nombreFantasia: datos?.nombre_fantasia ?? '',
        correo:         datos?.email ?? '',
        telefono:       datos?.telefono ?? '',
      },
      datosContacto: {
        domicilio: datos?.direccion ?? '',
        comuna:    datos?.comuna ?? '',
        telefono:  datos?.telefono ?? '',
        correo:    datos?.email ?? '',
      },
      representantesLegales: rep?.nombre ? [{
        id:                  '1',
        rut:                 normRut(rep.rut),
        nombre:              rep.nombre ?? '',
        correo:              rep.correo ?? '',
        telefono:            rep.telefono ?? '',
        fecha_incorporacion: new Date().toISOString().split('T')[0],
      }] : [],
      usuariosPlataforma:          mapearUsuariosXlsx(usuariosXlsx),
      contrapartes:                mapearContraparteXlsx(contrapXlsx),
      configuracionNotificaciones: mapearNotificacionesXlsx(notifXlsx),
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preIngreso.id])

  const handleEnviarOnboarding = async () => {
    setErrorMsg(null)
    setSubmitting(true)
    try {
      const dg      = state.data.datosGenerales || {}
      const dc      = state.data.datosContacto  || {}
      const rutNorm = normRut(dg.rut || preIngreso.rut)
      if (!rutNorm) throw new Error('El RUT de la empresa es requerido.')

      const digits = rutNorm.replace(/\D/g, '')
      const sinDv  = digits.slice(0, -1).slice(-9)
      const empkey = parseInt(sinDv, 10)
      if (!empkey) throw new Error('No se pudo derivar el empkey desde el RUT.')

      const user       = await getCurrentUser().catch(() => null)
      const userEmail  = (user as any)?.email ?? null
      const created_by = userEmail

      // Buscar RUT del usuario por email para la FK de pap_solicitud
      let creado_por_rut: string | null = null
      if (userEmail) {
        const { data: usuarioData } = await supabase
          .from('usuario')
          .select('rut')
          .eq('correo', userEmail)
          .maybeSingle()
        creado_por_rut = usuarioData?.rut ?? null
      }

      // Verificar si la empresa ya existe
      const { data: empresaExistente } = await supabase
        .from('empresa')
        .select('empkey')
        .eq('empkey', empkey)
        .maybeSingle()

      let empresaEmpkey = empkey

      if (!empresaExistente) {
        // Crear empresa nueva
        const { data: empresaData, error: empErr } = await supabase
          .from('empresa')
          .insert([{
            empkey,
            rut:             rutNorm,
            nombre:          dg.nombre ?? preIngreso.nombre_empresa ?? null,
            nombre_fantasia: dg.nombreFantasia ?? null,
            domicilio:       dc.domicilio ?? null,
            telefono:        dg.telefono ?? null,
            correo:          dg.correo ?? null,
            estado:          'SAC',
            producto:        preIngreso.producto ?? null,
            created_by,
          }])
          .select()
          .single()
        if (empErr) throw empErr
        empresaEmpkey = empresaData.empkey
      }

      // empresa_onboarding — solo insertar si no existe
      const { data: obExistente } = await supabase
        .from('empresa_onboarding')
        .select('id')
        .eq('empkey', empresaEmpkey)
        .maybeSingle()

      if (!obExistente) {
        const { error: obErr } = await supabase
          .from('empresa_onboarding')
          .insert([{ empkey: empresaEmpkey, estado: 'pendiente' }])
        if (obErr) throw obErr
      }

      // pap_solicitud — solo insertar si no existe
      const { data: papExistente } = await supabase
        .from('pap_solicitud')
        .select('id')
        .eq('empkey', empresaEmpkey)
        .maybeSingle()

      if (!papExistente) {
        const { error: papErr } = await supabase
          .from('pap_solicitud')
          .insert([{ empkey: empresaEmpkey, estado: 'pendiente', creado_por_rut }])
        if (papErr) throw papErr
      }

      await supabase
        .from('pre_ingresos')
        .update({
          estado: 'Completado',
          // Guardar datos completos del formulario para que OB los vea
          datos_json: {
            ...(preIngreso.datos_json as Record<string, any> ?? {}),
            // Sobrescribir con los datos editados por COM
            razon_social:    dg.nombre ?? preIngreso.nombre_empresa,
            rut:             rutNorm,
            nombre_fantasia: dg.nombreFantasia ?? null,
            correo:          dg.correo ?? null,
            telefono:        dg.telefono ?? null,
            direccion:       dc.domicilio ?? null,
            comuna:          (dc as any).comuna ?? null,
            region:          (dc as any).region ?? null,
            // Datos adicionales del formulario
            actividades_economicas: state.data.actividadesEconomicas ?? [],
            documentos_tributarios: (state.data.documentosTributarios ?? []).filter((d: any) => d.selected),
            informacion_plan:       state.data.informacionPlan ?? null,
            documentacion:          {
              logoNombre:    state.data.documentacionEmpresa?.logoNombre ?? null,
              logoData:      state.data.documentacionEmpresa?.logo ?? null,
              carpetaNombre: state.data.documentacionEmpresa?.carpetaNombre ?? null,
              carpetaData:   state.data.documentacionEmpresa?.carpetaTributaria ?? null,
              vbNombre:      (state.data.documentacionEmpresa as any)?.vbNombre ?? null,
              vbData:        (state.data.documentacionEmpresa as any)?.vistoBueno ?? null,
            },
          },
        })
        .eq('id', preIngreso.id)

      onEnviado()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err?.message ?? 'Error al enviar a Onboarding.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:  return <DatosGeneralesStep />
      case 1:  return <DatosContactoStep />
      case 2:  return <RepresentantesLegalesStep />
      case 3:  return <UsuariosPlataformaStep />
      case 4:  return <ContrapartesStep />
      case 5:  return <ConfiguracionNotificacionesStep />
      case 6:  return <DocumentacionEmpresaStep />
      case 7:  return <ActividadesEconomicasStep />
      case 8:  return <DocumentosTributariosStep />
      case 9:  return <InformacionPlanStep />
      case 10: return <ResumenPreIngresoStep />
      default: return null
    }
  }

  return (
    <div>
      <Stepper currentStep={currentStep} data={state.data} onStepClick={setCurrentStep} />

      <div className="card">
        <div className="card-body p-4">
          {renderStep()}
        </div>
      </div>

      {errorMsg && <div className="alert alert-danger mt-3">{errorMsg}</div>}

      <div className="d-flex justify-content-between mt-4">
        <button
          type="button"
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
          onClick={() => currentStep === 0 ? navigate(-1) : prevStep()}
        >
          <ArrowLeft size={16} />
          {currentStep === 0 ? 'Volver' : 'Anterior'}
        </button>

        {isLastStep ? (
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary d-flex align-items-center gap-2"
              onClick={() => navigate('/comercial/pre-ingresos')}
              disabled={submitting}
            >
              Guardar y cerrar
            </button>
            <button
              type="button"
              className="btn btn-success d-flex align-items-center gap-2"
              onClick={handleEnviarOnboarding}
              disabled={submitting}
            >
              {submitting
                ? <><span className="spinner-border spinner-border-sm" /> Enviando...</>
                : <><Send size={16} /> Enviar a Onboarding</>
              }
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={nextStep}
          >
            Siguiente <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

// ——— Página principal ————————————————————————————
const ComercialPreIngresoFormulario: React.FC = () => {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()
  const [preIngreso, setPreIngreso] = useState<PreIngreso | null>(null)
  const [loading, setLoading]       = useState(true)
  const [enviado, setEnviado]       = useState(false)

  useEffect(() => {
    if (!id) return
    supabase
      .from('pre_ingresos')
      .select('*')
      .eq('id', Number(id))
      .single()
      .then(({ data, error }) => {
        if (!error && data) setPreIngreso(data as PreIngreso)
        setLoading(false)
      })
  }, [id])

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status" />
    </div>
  )

  if (!preIngreso) return (
    <div className="container-fluid">
      <div className="alert alert-danger">Pre-ingreso no encontrado.</div>
      <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Volver</button>
    </div>
  )

  if (enviado) return (
    <div className="container-fluid">
      <div className="text-center py-5">
        <div className="d-inline-flex p-4 rounded-circle bg-success bg-opacity-10 mb-4">
          <Check size={48} className="text-success" />
        </div>
        <h3 className="fw-bold mb-2">¡Empresa enviada a Onboarding!</h3>
        <p className="text-muted mb-4">
          <strong>{preIngreso.nombre_empresa}</strong> fue creada y está en cola para el equipo de Onboarding.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/comercial/pre-ingresos')}>
          Volver a Pre-Ingresos
        </button>
      </div>
    </div>
  )

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col">
          <button
            className="btn btn-link p-0 text-muted d-flex align-items-center gap-1 mb-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} /><small>Volver</small>
          </button>
          <h1 className="font-primary fw-bold mb-1">Completar Registro</h1>
          <p className="text-muted mb-0">
            {preIngreso.nombre_empresa ?? '—'}
            <span className="mx-2">·</span>
            {preIngreso.rut ?? '—'}
            <span style={{
              display: 'inline-block', padding: '2px 10px', borderRadius: 4,
              fontSize: 12, fontWeight: 500,
              background: preIngreso.producto === 'ANDESPOS' ? '#0dcaf020' : '#0d6efd20',
              color: preIngreso.producto === 'ANDESPOS' ? '#0a7a8f' : '#0a4db5',
              border: `1px solid ${preIngreso.producto === 'ANDESPOS' ? '#0dcaf060' : '#0d6efd60'}`,
              whiteSpace: 'nowrap',
            }}>
              {preIngreso.producto === 'ANDESPOS' ? 'AndesPOS' : preIngreso.producto === 'ENTERFAC' ? 'Enternet' : preIngreso.producto ?? '—'}
            </span>
          </p>
        </div>
      </div>

      <FormProvider
        maxStep={10}
        draftKey={`pre-ingreso-draft-${preIngreso.id}`}
      >
        <PreIngresoFormInner
          preIngreso={preIngreso}
          onEnviado={() => setEnviado(true)}
        />
      </FormProvider>
    </div>
  )
}

export default ComercialPreIngresoFormulario