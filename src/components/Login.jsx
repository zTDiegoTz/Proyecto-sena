import { useState } from 'react'
import { useSupabaseGasStation as useGasStation } from '../context/SupabaseGasStationContext'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useGasStation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validación de campos
    if (!username.trim() || !password.trim()) {
      setError('Por favor complete todos los campos')
      setIsLoading(false)
      return
    }

    // Validación de longitud mínima
    if (password.length < 3) {
      setError('La contraseña debe tener al menos 3 caracteres')
      setIsLoading(false)
      return
    }

    try {
      const result = await login(username, password)
      
      if (result.success) {
        // El login se maneja automáticamente en el contexto
        setError('')
        
        // Mostrar mensaje específico para bomberos
        if (result.usuario.role === 'bombero') {
          // Pequeño delay para que se vea el mensaje
          setTimeout(() => {
            alert(`✅ ¡Bienvenido ${result.usuario.name}!\n\nTu turno se ha iniciado automáticamente.\n\nPuedes comenzar a registrar ventas.`)
          }, 100)
        }
      } else {
        setError(result.message || 'Error al iniciar sesión')
      }
    } catch (err) {
      console.error('Error de login:', err)
      setError(
        err.message || 
        err.response?.data?.message || 
        'Error interno del sistema. Intente nuevamente.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Estación de Gasolina
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Gestión
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input-field rounded-t-lg"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field rounded-b-lg"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <span>Iniciar Sesión</span>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Usuarios de prueba:
            </p>
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <p><strong>Super Admin:</strong> admin / admin123</p>
              <p><strong>Administrador:</strong> gerente / gerente123</p>
              <p><strong>Bombero:</strong> bombero1 / bombero123</p>
            </div>
            
            {/* Información adicional */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-400">
                Sistema de Gestión de Estación de Gasolina
              </p>
              <p className="text-xs text-gray-400">
                Todos los roles tienen acceso a cerrar sesión
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login



