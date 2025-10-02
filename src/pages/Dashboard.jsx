import React from 'react'
import { useSupabaseGasStation as useGasStation } from '../context/SupabaseGasStationContext'

const Dashboard = () => {
  const { ventas, surtidores, tienePermiso } = useGasStation()

  // Calcular estadísticas
  const totalVentas = ventas.length
  const ventasHoy = ventas.filter(venta => {
    const hoy = new Date().toDateString()
    return new Date(venta.fechaHora).toDateString() === hoy
  }).length

  const totalIngresos = ventas.reduce((total, venta) => total + venta.valorTotal, 0)
  const ingresosHoy = ventas
    .filter(venta => {
      const hoy = new Date().toDateString()
      return new Date(venta.fechaHora).toDateString() === hoy
    })
    .reduce((total, venta) => total + venta.valorTotal, 0)

  const surtidoresDisponibles = surtidores.filter(s => s.estado === 'disponible').length
  const surtidoresOcupados = surtidores.filter(s => s.estado === 'ocupado').length
  const surtidoresMantenimiento = surtidores.filter(s => s.estado === 'mantenimiento').length

  // Estadísticas por combustible
  const estadisticasCombustible = {
    extra: { vendido: 0, ingresos: 0 },
    corriente: { vendido: 0, ingresos: 0 },
    acpm: { vendido: 0, ingresos: 0 }
  }

  ventas.forEach(venta => {
    estadisticasCombustible[venta.tipoCombustible].vendido += venta.cantidad
    estadisticasCombustible[venta.tipoCombustible].ingresos += venta.valorTotal
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatVolume = (gallons) => {
    return `${gallons.toFixed(2)} gal`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Resumen general de la estación de gasolina</p>
        </div>
        
        {/* Accesos rápidos */}
        <div className="flex space-x-3">
          {tienePermiso('gestionar_precios') && (
            <button
              onClick={() => window.location.href = '/admin'}
              className="btn-primary flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Panel de Administración
            </button>
          )}
        </div>
      </div>

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ventas Hoy</p>
              <p className="text-2xl font-semibold text-gray-900">{ventasHoy}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ingresos Hoy</p>
              <p className="text-2xl font-semibold text-gray-900">{formatCurrency(ingresosHoy)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Surtidores Activos</p>
              <p className="text-2xl font-semibold text-gray-900">{surtidoresDisponibles}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Ventas</p>
              <p className="text-2xl font-semibold text-gray-900">{totalVentas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estado de surtidores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Surtidores</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Disponibles</span>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="font-medium">{surtidoresDisponibles}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ocupados</span>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span className="font-medium">{surtidoresOcupados}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mantenimiento</span>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="font-medium">{surtidoresMantenimiento}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Combustible</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Extra</span>
              <div className="text-right">
                <p className="font-medium">{formatVolume(estadisticasCombustible.extra.vendido)}</p>
                <p className="text-xs text-gray-500">{formatCurrency(estadisticasCombustible.extra.ingresos)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Corriente</span>
              <div className="text-right">
                <p className="font-medium">{formatVolume(estadisticasCombustible.corriente.vendido)}</p>
                <p className="text-xs text-gray-500">{formatCurrency(estadisticasCombustible.corriente.ingresos)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ACPM</span>
              <div className="text-right">
                <p className="font-medium">{formatVolume(estadisticasCombustible.acpm.vendido)}</p>
                <p className="text-xs text-gray-500">{formatCurrency(estadisticasCombustible.acpm.ingresos)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ventas recientes */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas Recientes</h3>
        {ventas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay ventas registradas</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Surtidor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Combustible
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bombero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ventas.slice(-5).reverse().map((venta) => (
                  <tr key={venta.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {venta.surtidorNombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {venta.tipoCombustible}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatVolume(venta.cantidad)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(venta.valorTotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {venta.bomberoNombre || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(venta.fechaHora).toLocaleDateString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
