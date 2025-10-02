import React, { useState, useMemo } from 'react'
import { useSupabaseGasStation as useGasStation } from '../context/SupabaseGasStationContext'

const Reportes = () => {
  const { ventas, surtidores, tienePermiso } = useGasStation()
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('hoy')

  // Verificar permisos
  if (!tienePermiso('ver_reportes') && !tienePermiso('todos')) {
    return (
      <div className="text-center py-8 px-4 sm:py-12">
        <div className="text-red-600 text-lg sm:text-xl font-semibold">
          Acceso Denegado
        </div>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
    )
  }

  // Verificar que hay datos disponibles
  if (!ventas || ventas.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-600 text-sm sm:text-base">Análisis detallado de ventas y rendimiento</p>
        </div>
        
        <div className="card">
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-500 text-lg sm:text-xl font-semibold">
              No hay datos disponibles
            </div>
            <p className="text-gray-400 mt-2 text-sm sm:text-base px-4">
              No se han registrado ventas aún. Los reportes aparecerán aquí una vez que se realicen las primeras ventas.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatVolume = (liters) => {
    return `${liters.toLocaleString('es-CO')} L`
  }

  // Filtrar ventas por período
  const ventasFiltradas = useMemo(() => {
    if (!ventas || !Array.isArray(ventas)) return []
    
    const ahora = new Date()
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
    const ayer = new Date(hoy.getTime() - 24 * 60 * 60 * 1000)
    const semanaPasada = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000)
    const mesPasado = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000)

    return ventas.filter(venta => {
      if (!venta || !venta.fechaHora) return false
      const fechaVenta = new Date(venta.fechaHora)
      switch (periodoSeleccionado) {
        case 'hoy':
          return fechaVenta >= hoy
        case 'ayer':
          return fechaVenta >= ayer && fechaVenta < hoy
        case 'semana':
          return fechaVenta >= semanaPasada
        case 'mes':
          return fechaVenta >= mesPasado
        default:
          return true
      }
    })
  }, [ventas, periodoSeleccionado])

  // Calcular estadísticas de forma segura
  const estadisticas = useMemo(() => {
    if (!ventasFiltradas || ventasFiltradas.length === 0) {
      return {
        totalVentas: 0,
        totalIngresos: 0,
        totalCantidad: 0,
        promedioVenta: 0,
        porCombustible: {
          extra: { ventas: 0, cantidad: 0, ingresos: 0 },
          corriente: { ventas: 0, cantidad: 0, ingresos: 0 },
          acpm: { ventas: 0, cantidad: 0, ingresos: 0 }
        },
        porSurtidor: {}
      }
    }

    const totalVentas = ventasFiltradas.length
    const totalIngresos = ventasFiltradas.reduce((sum, venta) => sum + (venta.valorTotal || 0), 0)
    const totalCantidad = ventasFiltradas.reduce((sum, venta) => sum + (venta.cantidad || 0), 0)
    const promedioVenta = totalVentas > 0 ? totalIngresos / totalVentas : 0

    // Estadísticas por combustible
    const porCombustible = {
      extra: { ventas: 0, cantidad: 0, ingresos: 0 },
      corriente: { ventas: 0, cantidad: 0, ingresos: 0 },
      acpm: { ventas: 0, cantidad: 0, ingresos: 0 }
    }

    ventasFiltradas.forEach(venta => {
      if (venta.tipoCombustible && porCombustible[venta.tipoCombustible]) {
        porCombustible[venta.tipoCombustible].ventas++
        porCombustible[venta.tipoCombustible].cantidad += venta.cantidad || 0
        porCombustible[venta.tipoCombustible].ingresos += venta.valorTotal || 0
      }
    })

    // Estadísticas por surtidor
    const porSurtidor = {}
    ventasFiltradas.forEach(venta => {
      if (venta.surtidorId) {
        if (!porSurtidor[venta.surtidorId]) {
          porSurtidor[venta.surtidorId] = { ventas: 0, cantidad: 0, ingresos: 0 }
        }
        porSurtidor[venta.surtidorId].ventas++
        porSurtidor[venta.surtidorId].cantidad += venta.cantidad || 0
        porSurtidor[venta.surtidorId].ingresos += venta.valorTotal || 0
      }
    })

    return {
      totalVentas,
      totalIngresos,
      totalCantidad,
      promedioVenta,
      porCombustible,
      porSurtidor
    }
  }, [ventasFiltradas])

  // Generar datos para gráficos simples
  const datosCombustible = [
    { nombre: 'Extra', ventas: estadisticas.porCombustible.extra.ventas, color: 'bg-blue-500' },
    { nombre: 'Corriente', ventas: estadisticas.porCombustible.corriente.ventas, color: 'bg-green-500' },
    { nombre: 'ACPM', ventas: estadisticas.porCombustible.acpm.ventas, color: 'bg-yellow-500' }
  ]

  const datosSurtidor = Object.keys(estadisticas.porSurtidor).map(surtidorId => {
    // Buscar el nombre del surtidor
    const surtidor = surtidores.find(s => s.id === surtidorId)
    const nombreSurtidor = surtidor ? surtidor.nombre : `Surtidor ${surtidorId.substring(0, 8)}...`
    
    return {
      id: surtidorId,
      nombre: nombreSurtidor,
      ventas: estadisticas.porSurtidor[surtidorId].ventas,
      color: 'bg-purple-500'
    }
  })

  // Calcular maxVentas de forma segura
  const maxVentas = Math.max(
    ...datosCombustible.map(d => d.ventas || 0), 
    ...datosSurtidor.map(d => d.ventas || 0),
    0 // Valor mínimo por defecto
  )

  // Función segura para encontrar el combustible más vendido
  const getCombustibleMasVendido = () => {
    const entries = Object.entries(estadisticas.porCombustible)
    if (entries.length === 0) return 'N/A'
    
    let maxCombustible = entries[0][0]
    let maxCantidad = entries[0][1].cantidad || 0
    
    for (let i = 1; i < entries.length; i++) {
      const [combustible, datos] = entries[i]
      if ((datos.cantidad || 0) > maxCantidad) {
        maxCantidad = datos.cantidad || 0
        maxCombustible = combustible
      }
    }
    
    return maxCombustible
  }

  // Función segura para encontrar el surtidor más activo
  const getSurtidorMasActivo = () => {
    const entries = Object.entries(estadisticas.porSurtidor)
    if (entries.length === 0) return 'N/A'
    
    let maxSurtidor = entries[0][0]
    let maxVentas = entries[0][1].ventas || 0
    
    for (let i = 1; i < entries.length; i++) {
      const [surtidor, datos] = entries[i]
      if ((datos.ventas || 0) > maxVentas) {
        maxVentas = datos.ventas || 0
        maxSurtidor = surtidor
      }
    }
    
    // Buscar el nombre del surtidor más activo
    const surtidor = surtidores.find(s => s.id === maxSurtidor)
    return surtidor ? surtidor.nombre : `Surtidor ${maxSurtidor.substring(0, 8)}...`
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
        <p className="text-gray-600 text-sm sm:text-base">Análisis detallado de ventas y rendimiento</p>
      </div>

      {/* Selector de período */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <label className="text-sm font-medium text-gray-700">Período:</label>
          <select
            value={periodoSeleccionado}
            onChange={(e) => setPeriodoSeleccionado(e.target.value)}
            className="input-field w-full sm:w-auto"
          >
            <option value="hoy">Hoy</option>
            <option value="ayer">Ayer</option>
            <option value="semana">Última Semana</option>
            <option value="mes">Último Mes</option>
            <option value="todo">Todo el Tiempo</option>
          </select>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h6a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Ventas</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{estadisticas.totalVentas}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Ingresos</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{formatCurrency(estadisticas.totalIngresos)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Litros</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{formatVolume(estadisticas.totalCantidad)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Promedio Venta</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">{formatCurrency(estadisticas.promedioVenta)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Ventas por combustible */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Ventas por Combustible</h3>
          <div className="space-y-3 sm:space-y-4">
            {datosCombustible.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="font-medium">{item.nombre}</span>
                  <span className="text-gray-600">{item.ventas || 0} ventas</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${maxVentas > 0 ? ((item.ventas || 0) / maxVentas) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {formatVolume(estadisticas.porCombustible[item.nombre.toLowerCase()]?.cantidad || 0)} - 
                  {formatCurrency(estadisticas.porCombustible[item.nombre.toLowerCase()]?.ingresos || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ventas por surtidor */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Ventas por Surtidor</h3>
          <div className="space-y-3 sm:space-y-4">
            {datosSurtidor.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="font-medium">{item.nombre}</span>
                  <span className="text-gray-600">{item.ventas || 0} ventas</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${maxVentas > 0 ? ((item.ventas || 0) / maxVentas) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {formatVolume(estadisticas.porSurtidor[item.id]?.cantidad || 0)} - 
                  {formatCurrency(estadisticas.porSurtidor[item.id]?.ingresos || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla detallada */}
      <div className="card">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Análisis Detallado por Combustible</h3>
        
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-full inline-block align-middle">
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Combustible
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ventas
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ingresos
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Promedio
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % del Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(estadisticas.porCombustible).map(([combustible, datos]) => (
                    <tr key={combustible}>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 capitalize">
                        {combustible}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {datos.ventas}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {formatVolume(datos.cantidad)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {formatCurrency(datos.ingresos)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {datos.ventas > 0 ? formatCurrency(datos.ingresos / datos.ventas) : formatCurrency(0)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {estadisticas.totalIngresos > 0 ? ((datos.ingresos / estadisticas.totalIngresos) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen de rendimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Rendimiento por Surtidor</h3>
          <div className="space-y-3">
            {Object.entries(estadisticas.porSurtidor).map(([surtidorId, datos]) => (
              <div key={surtidorId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Surtidor {surtidorId}</p>
                  <p className="text-gray-600 text-xs sm:text-sm">{datos.ventas} ventas</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">{formatCurrency(datos.ingresos)}</p>
                  <p className="text-gray-600 text-xs sm:text-sm">{formatVolume(datos.cantidad)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Métricas de Eficiencia</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Promedio de ventas por día:</span>
              <span className="font-medium text-xs sm:text-sm">
                {estadisticas.totalVentas > 0 ? (estadisticas.totalVentas / Math.max(1, ventasFiltradas.length > 0 ? 1 : 1)).toFixed(1) : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Litros promedio por venta:</span>
              <span className="font-medium text-xs sm:text-sm">
                {estadisticas.totalVentas > 0 ? formatVolume(estadisticas.totalCantidad / estadisticas.totalVentas) : formatVolume(0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Combustible más vendido:</span>
              <span className="font-medium text-xs sm:text-sm capitalize">
                {getCombustibleMasVendido()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Surtidor más activo:</span>
              <span className="font-medium text-xs sm:text-sm">
                {getSurtidorMasActivo()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reportes



