import '@/styles/bootstrap-custom.scss'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import MainLayout from '@/layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Login from './pages/LoginPage'
import EmpresaDetail from './pages/EmpresaDetail'
import NuevaEmpresa from './pages/areas/NuevaEmpresa'
import ConfiguracionEmpresaForm from './pages/areas/ConfiguracionEmpresaForm'
import PapForm from './pages/areas/PapForm'
import OnboardingSolicitudesNuevas from './pages/areas/OnboardingSolicitudesNuevas'
import PasoProduccion from '@/pages/onboarding/PasoProduccion'

// Dashboards por área
import ComercialDashboard from '@/pages/areas/ComercialDashboard'
import OnboardingDashboard from '@/pages/areas/OnboardingDashboard'
import SacDashboard from '@/pages/areas/SacDashboard' // 👈 NUEVO

const App = () => {
  const { profile } = useAuth()

  if (!profile) return <Login />

  const role = profile?.perfil?.nombre
  const defaultDashboardPath =
    role === 'COM'
      ? '/comercial/dashboard'
      : role === 'OB'
      ? '/onboarding/mis-empresas'
      : role === 'SAC'
      ? '/sac/mis-empresas'
      : role === 'ADMIN_SAC'
      ? '/sac/empresas-sac'
      : '/dashboard'

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Redirección inicial según rol */}
        <Route path="/" element={<Navigate to={defaultDashboardPath} />} />

        {/* Dashboards */}
        <Route path="/dashboard" element={<Dashboard />} />
         <Route path="/empresas/activas" element={<Dashboard />} />
        <Route path="/comercial/dashboard" element={<ComercialDashboard />} />
        <Route path="/onboarding/mis-empresas" element={<OnboardingDashboard />} />
        <Route path="/sac/mis-empresas" element={<SacDashboard />} /> {/* 👈 NUEVA RUTA */}

        {/* Otras rutas */}
        <Route path="/empresa/:empkey" element={<EmpresaDetail />} />
        <Route path="/crear-empresa" element={<NuevaEmpresa />} />
        <Route
          path="/configuracion-empresa/:empkey?"
          element={<ConfiguracionEmpresaForm onSave={() => {}} />}
        />
        <Route path="/crear-sac" element={<PapForm />} />
        <Route path="/onboarding/solicitudes-nuevas" element={<OnboardingSolicitudesNuevas />} />
        <Route path="/onboarding/paso-produccion" element={<PasoProduccion />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={defaultDashboardPath} />} />
    </Routes>
  )
}

export default App
