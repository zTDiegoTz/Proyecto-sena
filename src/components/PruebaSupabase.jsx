import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function PruebaSupabase() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [conexionExitosa, setConexionExitosa] = useState(false)

  const probarConexion = async () => {
    try {
      setCargando(true)
      setError(null)
      
      console.log('🔄 Intentando conectar a Supabase...')
      
      // Probar conexión básica
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('❌ Error al conectar:', error)
        throw error
      }
      
      console.log('✅ Conexión exitosa! Datos recibidos:', data)
      setUsuarios(data)
      setConexionExitosa(true)
      
    } catch (err) {
      console.error('💥 Error:', err)
      setError(err.message)
      setConexionExitosa(false)
    } finally {
      setCargando(false)
    }
  }

  // Probar conexión al cargar el componente
  useEffect(() => {
    probarConexion()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
            🧪 Prueba de Conexión a Supabase
          </h1>

          {/* Estado de conexión */}
          <div className="mb-6 p-4 rounded-lg border">
            <h2 className="text-xl font-semibold mb-2">Estado de Conexión</h2>
            
            {cargando && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                Conectando a Supabase...
              </div>
            )}
            
            {!cargando && conexionExitosa && (
              <div className="flex items-center text-green-600">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ¡Conexión exitosa! ✅
              </div>
            )}
            
            {!cargando && error && (
              <div className="flex items-center text-red-600">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Error de conexión: {error}
              </div>
            )}
          </div>

          {/* Información de configuración */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Configuración:</h3>
            <p><strong>URL:</strong> https://armmhwlnqesuhbugdmbp.supabase.co</p>
            <p><strong>Proyecto:</strong> armmhwlnqesuhbugdmbp</p>
            <p><strong>Tabla:</strong> users</p>
          </div>

          {/* Datos recibidos */}
          {usuarios.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Usuarios encontrados ({usuarios.length}):</h3>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {usuarios.map((usuario) => (
                  <div key={usuario.id} className="border rounded-lg p-4 bg-white shadow">
                    <div className="font-semibold text-lg text-gray-800">{usuario.name}</div>
                    <div className="text-gray-600">{usuario.role}</div>
                    <div className="text-xs text-gray-400 mt-2">ID: {usuario.id}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Datos en formato JSON */}
          {usuarios.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Datos en JSON:</h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(usuarios, null, 2)}
              </pre>
            </div>
          )}

          {/* Botones de acción */}
          <div className="text-center space-x-4">
            <button
              onClick={probarConexion}
              disabled={cargando}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {cargando ? 'Conectando...' : 'Probar Conexión'}
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Recargar Página
            </button>
          </div>

          {/* Instrucciones */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">📋 Instrucciones:</h4>
            <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
              <li>Asegúrate de haber ejecutado el SQL en Supabase</li>
              <li>Verifica que la tabla 'users' existe</li>
              <li>Si hay error, revisa la consola del navegador (F12)</li>
              <li>Si funciona, verás los 3 usuarios: admin, gerente, bombero1</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PruebaSupabase
