import React, { useState, useEffect } from 'react'
import { testConnection } from '../lib/supabase'
import { usuariosService, surtidoresService } from '../services/supabaseService'

function TestSupabase() {
  const [resultados, setResultados] = useState({
    conexion: null,
    usuarios: null,
    surtidores: null
  })
  const [probando, setProbando] = useState(false)

  const probarConexion = async () => {
    setProbando(true)
    
    try {
      // Probar conexión básica
      const testConn = await testConnection()
      setResultados(prev => ({ ...prev, conexion: testConn }))

      // Probar usuarios
      const testUsuarios = await usuariosService.obtenerTodos()
      setResultados(prev => ({ ...prev, usuarios: testUsuarios }))

      // Probar surtidores
      const testSurtidores = await surtidoresService.obtenerTodos()
      setResultados(prev => ({ ...prev, surtidores: testSurtidores }))

    } catch (error) {
      console.error('Error en las pruebas:', error)
    } finally {
      setProbando(false)
    }
  }

  useEffect(() => {
    probarConexion()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Prueba de Conexión a Supabase
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Conexión Básica */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-gray-700">Conexión Básica</h3>
          <div className="flex items-center space-x-2">
            {resultados.conexion === null ? (
              <div className="flex items-center text-yellow-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                Probando...
              </div>
            ) : resultados.conexion?.success ? (
              <div className="flex items-center text-green-600">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Conectado
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Error: {resultados.conexion?.message}
              </div>
            )}
          </div>
        </div>

        {/* Usuarios */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-gray-700">Tabla Usuarios</h3>
          <div className="flex items-center space-x-2">
            {resultados.usuarios === null ? (
              <div className="flex items-center text-yellow-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                Probando...
              </div>
            ) : resultados.usuarios?.success ? (
              <div className="flex items-center text-green-600">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {resultados.usuarios.data?.length || 0} usuarios
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Error: {resultados.usuarios?.message}
              </div>
            )}
          </div>
        </div>

        {/* Surtidores */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-gray-700">Tabla Surtidores</h3>
          <div className="flex items-center space-x-2">
            {resultados.surtidores === null ? (
              <div className="flex items-center text-yellow-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                Probando...
              </div>
            ) : resultados.surtidores?.success ? (
              <div className="flex items-center text-green-600">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {resultados.surtidores.data?.length || 0} surtidores
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Error: {resultados.surtidores?.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botón para repetir pruebas */}
      <div className="text-center">
        <button
          onClick={probarConexion}
          disabled={probando}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {probando ? 'Probando...' : 'Repetir Pruebas'}
        </button>
      </div>

      {/* Detalles de los resultados */}
      {resultados.usuarios?.data && (
        <div className="mt-6 border-t pt-6">
          <h3 className="font-semibold mb-3 text-gray-700">Usuarios encontrados:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm text-gray-600 overflow-x-auto">
              {JSON.stringify(resultados.usuarios.data.map(u => ({
                id: u.id,
                username: u.username,
                nombre: u.nombre,
                rol: u.rol,
                activo: u.activo
              })), null, 2)}
            </pre>
          </div>
        </div>
      )}

      {resultados.surtidores?.data && (
        <div className="mt-6 border-t pt-6">
          <h3 className="font-semibold mb-3 text-gray-700">Surtidores encontrados:</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="text-sm text-gray-600 overflow-x-auto">
              {JSON.stringify(resultados.surtidores.data.map(s => ({
                id: s.id,
                nombre: s.nombre,
                estado: s.estado,
                combustibles: Object.keys(s.combustibles || {})
              })), null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestSupabase
