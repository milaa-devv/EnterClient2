import '@/styles/bootstrap-custom.scss'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import MainLayout from '@/layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Login from './pages/LoginPage'
import EmpresaDetail from './pages/EmpresaDetail'
import NuevaEmpresa from './pages/areas/NuevaEmpresa'
import ConfiguracionEmpresaFormWrapper from './pages/areas/ConfiguracionEmpresaFormWrapper'
import OnboardingSolicitudesNuevas from './pages/areas/OnboardingSolicitudesNuevas'
import PasoProduccion from '@/pages/onboarding/PasoProduccion'
import PasoProduccionListado from '@/pages/onboarding/PasoProduccionListado'
import OnboardingMisEmpresasAsignadas from '@/pages/onboarding/OnboardingMisEmpresasAsignadas'

// Dashboards por área
import ComercialDashboard from '@/pages/areas/ComercialDashboard'
import OnboardingDashboard from '@/pages/areas/OnboardingDashboard'
import SacDashboard from '@/pages/areas/SacDashboard'

// Comercial
import ComercialEmpresasProceso from '@/pages/areas/ComercialEmpresasProceso'
import ComercialHistorial from '@/pages/areas/ComercialHistorial'
import ComercialNotificaciones from '@/pages/areas/ComercialNotificaciones'
import ComercialPreIngresos from '@/pages/areas/ComercialPreIngresos'
import ComercialPreIngresoFormulario from '@/pages/areas/ComercialPreIngresoFormulario'

// Panel asignar ejecutivos OB
import OnboardingAsignarEjecutivos from '@/pages/areas/OnboardingAsignarEjecutivos'

// Admin Onboarding
import OnboardingAdminDashboard from '@/pages/areas/OnboardingAdminDashboard'
import OnboardingEmpresasProceso from '@/pages/areas/OnboardingEmpresasProceso'
import OnboardingNotificaciones from '@/pages/areas/OnboardingNotificaciones'

//Ejecutivo SAC
import SacPapListado from '@/pages/areas/SacPapListado'
import PapForm from './pages/areas/PapForm'
import SacMisEmpresas from './pages/areas/SacMisEmpresas'
import SacEmpresaDetalle from './pages/areas/SacEmpresaDetalle'
import SacPendientesListado from './pages/areas/SacPendientesListado'
import SacSolicitudesPendientes from './pages/areas/SacSolicitudesPendientes'

//SAC ADMIN
import SacHistorialEmpresas from '@/pages/areas/SacHistorialEmpresas'
import SacEmpresaSacListado from '@/pages/areas/SacEmpresaSacListado'
import SacNotificaciones from '@/pages/areas/SacNotificaciones'
const App = () => {
  const { profile } = useAuth()

  if (!profile) return <Login />

  const role = profile?.perfil?.nombre
  const defaultDashboardPath =
    role === 'COM'
      ? '/comercial/dashboard'
      : role === 'OB'
        ? '/onboarding/mis-empresas'
        : role === 'ADMIN_OB'
          ? '/onboarding/admin-dashboard'
          : role === 'SAC'
            ? '/sac/mis-empresas'
            : role === 'ADMIN_SAC'
              ? '/sac/mis-empresas'
              : '/dashboard'

  return (
    <Routes>
      {/* ✅ Todo lo logueado con Layout (Navbar + Sidebar) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to={defaultDashboardPath} />} />

        {/* Generales */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/empresas/activas" element={<Dashboard />} />
        <Route path="/empresa/:empkey" element={<EmpresaDetail />} />

        {/* Comercial */}
        <Route path="/comercial/dashboard" element={<ComercialDashboard />} />
        <Route path="/comercial/nueva-empresa" element={<NuevaEmpresa />} />
        <Route path="/comercial/empresas-proceso" element={<ComercialEmpresasProceso />} />
        <Route path="/comercial/historial" element={<ComercialHistorial />} />
        <Route path="/comercial/notificaciones" element={<ComercialNotificaciones />} />
        <Route path="/comercial/pre-ingresos" element={<ComercialPreIngresos />} />
        <Route path="/comercial/pre-ingreso/:id" element={<ComercialPreIngresoFormulario />} />

        {/* Onboarding */}
        <Route path="/onboarding/mis-empresas" element={<OnboardingDashboard />} />
        <Route path="/onboarding/admin-dashboard" element={<OnboardingAdminDashboard />} />
        <Route path="/onboarding/solicitudes-nuevas" element={<OnboardingSolicitudesNuevas />} />
        <Route path="/onboarding/solicitudes-pendientes" element={<OnboardingSolicitudesNuevas />} />
        <Route path="/onboarding/empresas-proceso" element={<OnboardingEmpresasProceso />} />
        <Route path="/onboarding/asignar-ejecutivos" element={<OnboardingAsignarEjecutivos />} />
        <Route path="/onboarding/notificaciones" element={<OnboardingNotificaciones />} />
        <Route path="/onboarding/paso-produccion" element={<PasoProduccion />} />

        {/* SAC */}
        <Route path="/sac/mis-empresas" element={<SacDashboard />} />
        <Route path="/sac/pap" element={<SacPapListado />} />
        <Route path="/sac/pap/:empkey" element={<PapForm />} />
        <Route path="/sac/empresas-asignadas" element={<SacMisEmpresas />} />
        <Route path="/sac/empresa/:empkey" element={<SacEmpresaDetalle />} />
        <Route path="/sac/pendientes" element={<SacPendientesListado />} />
        <Route path="/sac/solicitudes-pendientes" element={<SacSolicitudesPendientes />} />

        {/* ADMIN SAC */}
        <Route path="/sac/historial" element={<SacHistorialEmpresas />} />
        <Route path="/sac/empresa-sac" element={<SacEmpresaSacListado />} />
        <Route path="/sac/notificaciones" element={<SacNotificaciones />} />

        {/* Otros */}
        <Route
          path="/configuracion-empresa/:empkey?"
          element={<ConfiguracionEmpresaFormWrapper />}
        />
        <Route path="/crear-sac" element={<PapForm />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={defaultDashboardPath} />} />
      </Route>

      <Route path="/onboarding/mis-empresas-asignadas" element={<OnboardingMisEmpresasAsignadas />} />
      <Route path="/onboarding/paso-produccion-listado" element={<PasoProduccionListado />} />
    </Routes>
  )
}

export default App