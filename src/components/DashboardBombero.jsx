import React, { useState } from 'react'
import { useSimpleSupabase } from '../context/SimpleSupabaseContext'
import VentaCombustibleSimple from './VentaCombustibleSimple'

function DashboardBombero() {
  const { usuarioActual, logout, surtidores } = useSimpleSupabase()
  const [vistaActual, setVistaActual] = useState('dashboard')

  const renderContenido = () => {
    switch (vistaActual) {
      case 'venta':
        return <VentaCombustibleSimple />
      case 'dashboard':
      default:
        return (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Bienvenido, {usuarioActual.name}! 👋
              </h2>
              <p className="text-gray-600">
                Panel de control para {usuarioActual.role}
              </p>
            </div>

            {/* Botones de acción para bomberos */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setVistaActual('venta')}
                  className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg text-left transition-colors duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">⛽</span>
                    <div>
                      <h3 className="text-xl font-semibold">Vender Combustible</h3>
                      <p className="text-green-100">Registrar nueva venta</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setVistaActual('dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-left transition-colors duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">📊</span>
                    <div>
                      <h3 className="text-xl font-semibold">Ver Surtidores</h3>
                      <p className="text-blue-100">Estado y disponibilidad</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Estado de Surtidores */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Estado de Surtidores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {surtidores.length > 0 ? (
                  surtidores.map((surtidor) => (
                    <div key={surtidor.id} className="bg-white p-4 rounded-lg shadow-md border hover:shadow-lg transition-shadow duration-200">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-900">{surtidor.nombre}</h4>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          surtidor.estado === 'disponible' 
                            ? 'bg-green-100 text-green-800'
                            : surtidor.estado === 'ocupado'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {surtidor.estado}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {Object.entries(surtidor.combustibles || {}).map(([tipo, datos]) => (
                          <div key={tipo} className="flex justify-between text-sm">
                            <span className="capitalize font-medium">{tipo}:</span>
                            <div className="text-right">
                              <div className="font-semibold">${(datos.precio || 0).toLocaleString()}</div>
                              <div className="text-xs text-gray-500">Stock: {datos.stock}L</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Indicador de disponibilidad para venta */}
                      {surtidor.estado === 'disponible' && Object.values(surtidor.combustibles || {}).some(c => c.stock > 0) && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="text-xs text-green-600 font-medium">
                            ✅ Disponible para ventas
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">⛽</div>
                    <p>No hay surtidores disponibles</p>
                  </div>
                )}
              </div>
            </div>

            {/* Panel de información del bombero */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 Panel del Bombero</h3>
              <p className="text-blue-700 mb-4">
                Desde aquí puedes ver el estado de los surtidores y realizar ventas de combustible.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-medium text-gray-900 mb-2">🕐 Turno Actual</h4>
                  <p className="text-sm text-gray-600">Inicio: Hoy 8:00 AM</p>
                  <p className="text-sm text-gray-600">Estado: <span className="text-green-600 font-medium">Activo</span></p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-medium text-gray-900 mb-2">💰 Ventas del Día</h4>
                  <p className="text-sm text-gray-600">Total: <span className="font-medium">$0</span></p>
                  <p className="text-sm text-gray-600">Transacciones: <span className="font-medium">0</span></p>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <h4 className="font-medium text-gray-900 mb-2">⛽ Surtidores</h4>
                  <p className="text-sm text-gray-600">Disponibles: <span className="font-medium text-green-600">{surtidores.filter(s => s.estado === 'disponible').length}</span></p>
                  <p className="text-sm text-gray-600">Total: <span className="font-medium">{surtidores.length}</span></p>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">🏪 Estación de Gasolina</h1>
              </div>
              
              {/* Navegación para bomberos */}
              <nav className="flex space-x-4">
                <button
                  onClick={() => setVistaActual('dashboard')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    vistaActual === 'dashboard'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => setVistaActual('venta')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    vistaActual === 'venta'
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ⛽ Vender
                </button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">👤</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{usuarioActual.name}</p>
                  <p className="text-xs text-gray-500">{usuarioActual.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                🚪 Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          {renderContenido()}
        </div>
      </main>
    </div>
  )
}

export default DashboardBombero
