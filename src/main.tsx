import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from '@/contexts/AuthContext'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/main.css'

// Nota: React.StrictMode deshabilitado temporalmente para evitar subidas duplicadas en desarrollo
ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)