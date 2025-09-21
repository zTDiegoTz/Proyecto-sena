import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SimpleSupabaseProvider, useSimpleSupabase } from './context/SimpleSupabaseContext'
import AdminDashboard from './components/AdminDashboard'

// Componente de Login Simple
function LoginSimple() {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const { login, error, loading } = useSimpleSupabase()

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(username, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Estación de Gasolina
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Conectado a Supabase ✅
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Conectando...' : 'Iniciar Sesión'}
          </button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Usuarios de prueba:</p>
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>Gerente:</strong> gerente / gerente123</p>
              <p><strong>Bombero:</strong> bombero1 / bombero123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// Dashboard Simple
function DashboardSimple() {
  const { usuarioActual, logout, surtidores, loading } = useSimpleSupabase()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos desde Supabase...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard - Estación de Gasolina
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {usuarioActual.name || usuarioActual.nombre}
                </p>
                <p className="text-xs text-gray-500">
                  {usuarioActual.role || usuarioActual.rol}
                </p>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Estado de Conexión */}
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-green-800 font-medium">
                ✅ Conectado a Supabase exitosamente
              </span>
            </div>
          </div>

          {/* Información del Usuario */}
          <div className="mb-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Usuario</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-medium">{usuarioActual.name || usuarioActual.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rol</p>
                <p className="font-medium">{usuarioActual.role || usuarioActual.rol}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Usuario</p>
                <p className="font-medium">{usuarioActual.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{usuarioActual.email}</p>
              </div>
            </div>
          </div>

          {/* Surtidores */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Surtidores ({surtidores.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {surtidores.map((surtidor) => (
                <div key={surtidor.id} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{surtidor.nombre}</h3>
                  <p className="text-sm text-gray-500 mb-2">Estado: {surtidor.estado}</p>
                  
                  <div className="space-y-1">
                    {Object.entries(surtidor.combustibles || {}).map(([tipo, datos]) => (
                      <div key={tipo} className="flex justify-between text-xs">
                        <span className="capitalize">{tipo}:</span>
                        <span>${datos.precio} - Stock: {datos.stock}L</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Componente Principal
function AppContent() {
  const { usuarioActual, loading } = useSimpleSupabase()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Conectando a Supabase...</p>
        </div>
      </div>
    )
  }

  if (!usuarioActual) {
    return <LoginSimple />
  }

  // Redirigir según el rol del usuario
  if (usuarioActual.role === 'super_admin' || usuarioActual.role === 'administrador') {
    return <AdminDashboard />
  }

  // Para bomberos, mostrar dashboard simple
  return <DashboardSimple />
}

function AppBasico() {
  return (
    <SimpleSupabaseProvider>
      <Router>
        <Routes>
          <Route path="*" element={<AppContent />} />
        </Routes>
      </Router>
    </SimpleSupabaseProvider>
  )
}

export default AppBasico
