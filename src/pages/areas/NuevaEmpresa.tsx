import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { FormStepper } from '@/components/FormStepper'
import { FormProvider, useFormContext } from '@/contexts/FormContext'

// Importa tus componentes de cada paso
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

const NuevaEmpresaContent: React.FC = () => {
  const navigate = useNavigate()
  const { state, nextStep, prevStep } = useFormContext()
  const currentStep = state.currentStep
  const totalSteps = STEP_COMPONENTS.length

  const CurrentStepComponent = STEP_COMPONENTS[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  const handlePrevious = () => {
    if (isFirstStep) {
      navigate('/comercial')
    } else {
      prevStep()
    }
  }

  const handleNext = () => {
    if (!isLastStep) {
      nextStep()
    } else {
      // Aquí puedes agregar lógica para submit
      navigate('/comercial', { 
        state: { 
          message: 'Empresa creada exitosamente y enviada a Onboarding' 
        }
      })
    }
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex align-items-center gap-3 mb-3">
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/comercial')}
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

          {/* Stepper */}
          <FormStepper orientation="horizontal" />
        </div>
      </div>

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
                  >
                    {isFirstStep ? 'Cancelar' : 'Anterior'}
                  </button>

                  <button
                    type="button"
                    className={`btn ${isLastStep ? 'btn-success' : 'btn-primary'} d-flex align-items-center gap-2`}
                    onClick={handleNext}
                  >
                    {isLastStep ? (
                      <>
                        <Send size={16} />
                        Enviar a Onboarding
                      </>
                    ) : 'Siguiente'}
                  </button>
                </div>
              </div>
            </div>
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
