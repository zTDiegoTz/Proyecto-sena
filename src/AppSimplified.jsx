import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Login from './components/Login'
import Dashboard from './pages/Dashboard'
import Surtidores from './pages/Surtidores'
import Ventas from './pages/Ventas'
import Turnos from './pages/Turnos'
import Inventario from './pages/Inventario'
import Precios from './pages/Precios'
import Usuarios from './pages/Usuarios'
import Reportes from './pages/Reportes'
import { SupabaseGasStationProvider, useSupabaseGasStation } from './context/SupabaseGasStationContext'

// Componente principal de la aplicación
function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { usuarioActual, logout, loading } = useSupabaseGasStation()

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario autenticado, mostrar login
  if (!usuarioActual) {
    return <Login />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Estación de Gasolina</h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              
              {/* Información del usuario y menú de cerrar sesión */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{usuarioActual.name || usuarioActual.nombre}</p>
                    <p className="text-xs text-gray-500 capitalize">{usuarioActual.role || usuarioActual.rol}</p>
                  </div>
                </div>
                
                {/* Botón de cerrar sesión en el header */}
                <button
                  onClick={() => logout()}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                  title="Cerrar Sesión"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/surtidores" element={<Surtidores />} />
              <Route path="/ventas" element={<Ventas />} />
              <Route path="/turnos" element={<Turnos />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/precios" element={<Precios />} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/reportes" element={<Reportes />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

function AppSimplified() {
  return (
    <SupabaseGasStationProvider>
      <Router>
        <AppContent />
      </Router>
    </SupabaseGasStationProvider>
  )
}

export default AppSimplified
