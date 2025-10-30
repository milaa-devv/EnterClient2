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
import OnboardingSolicitudesNuevas from './pages/areas/OnboardingSolicitudesNuevas' // 👈 NUEVO

const App = () => {
  const { profile } = useAuth()

  if (!profile) return <Login />

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/empresa/:empkey" element={<EmpresaDetail />} />
        <Route path="/crear-empresa" element={<NuevaEmpresa />} />
        <Route
          path="/configuracion-empresa/:empkey?"
          element={<ConfiguracionEmpresaForm onSave={() => {}} />}
        />
        <Route path="/crear-sac" element={<PapForm />} />

        {/* 👇 NUEVA RUTA PARA EL MENÚ DEL SIDEBAR */}
        <Route path="/onboarding/solicitudes-nuevas" element={<OnboardingSolicitudesNuevas />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
