import React, { useState } from 'react'
import { testSimpleConnection } from '../lib/supabaseSimple'

function PruebaSimple() {
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando] = useState(false)

  const probar = async () => {
    setCargando(true)
    setResultado(null)
    
    console.log('🧪 Iniciando prueba de conexión...')
    
    const result = await testSimpleConnection()
    setResultado(result)
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          🔧 Prueba Simple de Supabase
        </h1>
        
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">✅ Configuración completada:</h3>
          <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
            <li>✅ Proyecto configurado: adbzfiepkxtyqudwfysk</li>
            <li>✅ API Key configurada correctamente</li>
            <li>📋 Asegúrate de haber creado la tabla 'users' en tu dashboard</li>
            <li>🧪 Haz clic en "Probar Conexión" para verificar</li>
          </ul>
        </div>

        <div className="text-center mb-6">
          <button
            onClick={probar}
            disabled={cargando}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {cargando ? '🔄 Probando...' : '🧪 Probar Conexión'}
          </button>
        </div>

        {resultado && (
          <div className={`p-4 rounded-lg ${resultado.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h3 className={`font-semibold mb-2 ${resultado.success ? 'text-green-800' : 'text-red-800'}`}>
              {resultado.success ? '✅ ¡Éxito!' : '❌ Error'}
            </h3>
            
            {resultado.success ? (
              <div>
                <p className="text-green-700 mb-2">Conexión establecida correctamente</p>
                {resultado.data && (
                  <pre className="bg-green-100 p-2 rounded text-sm overflow-x-auto">
                    {JSON.stringify(resultado.data, null, 2)}
                  </pre>
                )}
              </div>
            ) : (
              <div>
                <p className="text-red-700 mb-2">{resultado.message}</p>
                {resultado.details && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-red-600">Ver detalles técnicos</summary>
                    <pre className="bg-red-100 p-2 rounded mt-2 overflow-x-auto">
                      {JSON.stringify(resultado.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">🔍 Información del proyecto:</h4>
          <p><strong>URL:</strong> https://adbzfiepkxtyqudwfysk.supabase.co</p>
          <p><strong>Ref:</strong> adbzfiepkxtyqudwfysk</p>
          <p><strong>Tabla:</strong> users</p>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => window.open('https://adbzfiepkxtyqudwfysk.supabase.co', '_blank')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🌐 Abrir Supabase Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default PruebaSimple
