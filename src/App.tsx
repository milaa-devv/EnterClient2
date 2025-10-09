import '@/styles/bootstrap-custom.scss';
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import MainLayout from '@/layouts/MainLayout'  // importa el layout con Sidebar
import Dashboard from './pages/Dashboard'
import Login from './pages/LoginPage'
import EmpresaDetail from './pages/EmpresaDetail'
import NuevaEmpresa from './pages/areas/NuevaEmpresa'
import ConfiguracionEmpresaForm from './pages/areas/ConfiguracionEmpresaForm'
import PapForm from './pages/areas/PapForm'

const App = () => {
  const { profile } = useAuth()

  if (!profile) {
    return <Login />
  }

  return (
    <Routes>
      {/* Poner el layout con sidebar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/empresa/:empkey" element={<EmpresaDetail />} />
        <Route path="/crear-empresa" element={<NuevaEmpresa />} />
        <Route path="/configuracion-empresa/:empkey?" element={<ConfiguracionEmpresaForm />} />
        <Route path="/crear-sac" element={<PapForm />} />
      </Route>

      {/* Ruta por defecto para redireccionar */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
