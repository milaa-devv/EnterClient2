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

export const FormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FormState>({
    currentStep: 0,
    data: {}
  })

  const updateData = (newData: any) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...newData }
    }))
  }

  const nextStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 8) // 9 pasos total (0-8)
    }))
  }

  const prevStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0)
    }))
  }

  const setCurrentStep = (step: number) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, 8))
    }))
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

