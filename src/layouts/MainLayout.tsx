import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import { Menu } from 'lucide-react'

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  return (
    <div className="d-flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`main-content flex-fill${!sidebarOpen ? ' collapsed' : ''}`}>
        <header className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <button
            className="btn btn-link p-0"
            style={{ fontSize: 24 }}
            aria-label={sidebarOpen ? 'Minimizar menú' : 'Expandir menú'}
            onClick={toggleSidebar}
          >
            <Menu />
          </button>
          <h1 className="mb-0"></h1>
        </header>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
