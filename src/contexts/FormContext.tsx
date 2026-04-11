import React, { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface FormState {
  currentStep: number
  data: any
}

interface FormContextType {
  state: FormState
  updateData: (newData: any) => void
  nextStep: () => void
  prevStep: () => void
  setCurrentStep: (step: number) => void
}

const FormContext = createContext<FormContextType | undefined>(undefined)

const DRAFT_KEY = 'nueva-empresa-draft'

interface FormProviderProps {
  children: ReactNode
  maxStep?: number        // ← configurable, default 9 para NuevaEmpresa
  draftKey?: string      // ← clave de localStorage, default 'nueva-empresa-draft'
  initialStep?: number   // ← paso inicial, default 0
}

export const FormProvider: React.FC<FormProviderProps> = ({
  children,
  maxStep = 9,
  draftKey = DRAFT_KEY,
  initialStep = 0,
}) => {
  const [state, setState] = useState<FormState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem(draftKey)
        if (raw) {
          const parsed = JSON.parse(raw) as { state?: FormState }
          if (parsed?.state) {
            return parsed.state
          }
        }
      } catch (err) {
        console.error('Error leyendo borrador al iniciar el formulario:', err)
      }
    }
    return {
      currentStep: initialStep,
      data: {},
    }
  })

  const updateData = (newData: any) => {
    setState((prev) => {
      const next = {
        ...prev,
        data: { ...prev.data, ...newData },
      }
      // Persistir automáticamente en localStorage
      try {
        window.localStorage.setItem(draftKey, JSON.stringify({ state: next }))
      } catch {}
      return next
    })
  }

  const nextStep = () => {
    setState((prev) => {
      const next = {
        ...prev,
        currentStep: Math.min(prev.currentStep + 1, maxStep),
      }
      try {
        window.localStorage.setItem(draftKey, JSON.stringify({ state: next }))
      } catch {}
      return next
    })
  }

  const prevStep = () => {
    setState((prev) => {
      const next = {
        ...prev,
        currentStep: Math.max(prev.currentStep - 1, 0),
      }
      try {
        window.localStorage.setItem(draftKey, JSON.stringify({ state: next }))
      } catch {}
      return next
    })
  }

  const setCurrentStep = (step: number) => {
    setState((prev) => {
      const next = {
        ...prev,
        currentStep: Math.max(0, Math.min(step, maxStep)),
      }
      try {
        window.localStorage.setItem(draftKey, JSON.stringify({ state: next }))
      } catch {}
      return next
    })
  }

  return (
    <FormContext.Provider value={{ state, updateData, nextStep, prevStep, setCurrentStep }}>
      {children}
    </FormContext.Provider>
  )
}

export const useFormContext = (): FormContextType => {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider')
  }
  return context
}