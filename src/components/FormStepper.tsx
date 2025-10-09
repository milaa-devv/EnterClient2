import React from 'react'
import { Check } from 'lucide-react'
import { useFormContext } from '@/contexts/FormContext'

interface FormStepperProps {
  orientation?: 'horizontal' | 'vertical'
}

const STEPS = [
  'Datos Generales',
  'Datos de Contacto', 
  'Actividades Económicas',
  'Representantes Legales',
  'Documentos Tributarios',
  'Contrapartes',
  'Usuarios de Plataforma',
  'Notificaciones',
  'Información del Plan'
]

export const FormStepper: React.FC<FormStepperProps> = ({
  orientation = 'horizontal'
}) => {
  const { state, setCurrentStep } = useFormContext()
  
  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= state.currentStep) {
      setCurrentStep(stepIndex)
    }
  }

  return (
    <div className={`stepper-${orientation}`}>
      <div className="stepper-container">
        {STEPS.map((title, index) => (
          <React.Fragment key={index}>
            <div 
              className={`step ${
                index === state.currentStep ? 'active' : 
                index < state.currentStep ? 'completed' : ''
              }`}
            >
              <button
                type="button"
                className="step-button"
                onClick={() => handleStepClick(index)}
                disabled={index > state.currentStep}
              >
                <div className="step-indicator">
                  {index < state.currentStep ? (
                    <Check size={16} />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="step-title">{title}</div>
              </button>
            </div>
            
            {index < STEPS.length - 1 && orientation === 'horizontal' && (
              <div className="step-separator">—</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

