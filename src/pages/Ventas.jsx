import React, { useState, useMemo } from 'react'
import { useGasStation } from '../context/GasStationContext'

function Ventas() {
  const { ventas, surtidores, tienePermiso } = useGasStation()
  
  const [filtroSurtidor, setFiltroSurtidor] = useState('')
  const [filtroCombustible, setFiltroCombustible] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroBombero, setFiltroBombero] = useState('')

  // Verificar permisos
  if (!tienePermiso('gestionar_ventas') && !tienePermiso('registrar_ventas') && !tienePermiso('ver_ventas')) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-xl font-semibold">
          Acceso Denegado
        </div>
        <p className="text-gray-600 mt-2">
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
    )
  }

  // Filtrar ventas
  const ventasFiltradas = useMemo(() => {
    let filtradas = ventas

    if (filtroSurtidor) {
      filtradas = filtradas.filter(venta => 
        venta.surtidorNombre.toLowerCase().includes(filtroSurtidor.toLowerCase())
      )
    }

    if (filtroCombustible) {
      filtradas = filtradas.filter(venta => 
        venta.tipoCombustible === filtroCombustible
      )
    }

    if (filtroFecha) {
      const fechaFiltro = new Date(filtroFecha).toDateString()
      filtradas = filtradas.filter(venta => 
        new Date(venta.fechaHora).toDateString() === fechaFiltro
      )
    }

    if (filtroBombero) {
      filtradas = filtradas.filter(venta => 
        venta.bomberoNombre?.toLowerCase().includes(filtroBombero.toLowerCase())
      )
    }

    return filtradas.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))
  }, [ventas, filtroSurtidor, filtroCombustible, filtroFecha, filtroBombero])

  // Calcular estadísticas de ventas filtradas
  const estadisticas = useMemo(() => {
    const total = ventasFiltradas.reduce((sum, venta) => sum + venta.valorTotal, 0)
    const cantidad = ventasFiltradas.reduce((sum, venta) => sum + venta.cantidad, 0)
    const promedio = ventasFiltradas.length > 0 ? total / ventasFiltradas.length : 0

    const porCombustible = ventasFiltradas.reduce((acc, venta) => {
      const tipo = venta.tipoCombustible
      if (!acc[tipo]) {
        acc[tipo] = { cantidad: 0, total: 0 }
      }
      acc[tipo].cantidad += venta.cantidad
      acc[tipo].total += venta.valorTotal
      return acc
    }, {})

    return {
      total,
      cantidad,
      promedio,
      porCombustible,
      totalVentas: ventasFiltradas.length
    }
  }, [ventasFiltradas])

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD'
    }).format(valor)
  }

  const formatearCantidad = (cantidad) => {
    return `${cantidad.toFixed(2)} gal`
  }

  const getCombustibleLabel = (tipo) => {
    const labels = {
      extra: 'Extra',
      corriente: 'Corriente',
      acpm: 'ACPM'
    }
    return labels[tipo] || tipo
  }

  const getCombustibleColor = (tipo) => {
    const colors = {
      extra: 'bg-blue-100 text-blue-800',
      corriente: 'bg-green-100 text-green-800',
      acpm: 'bg-orange-100 text-orange-800'
    }
    return colors[tipo] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Registro de Ventas</h1>
        
        {/* Botón para ir a registrar ventas (solo para bomberos) */}
        {tienePermiso('registrar_ventas') && (
          <button
            onClick={() => window.location.href = '/surtidores'}
            className="btn-primary flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Registrar Nueva Venta
          </button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Ventas</p>
              <p className="text-2xl font-semibold text-gray-900">{formatearMoneda(estadisticas.total)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cantidad Total</p>
              <p className="text-2xl font-semibold text-gray-900">{formatearCantidad(estadisticas.cantidad)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Promedio</p>
              <p className="text-2xl font-semibold text-gray-900">{formatearMoneda(estadisticas.promedio)}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Transacciones</p>
              <p className="text-2xl font-semibold text-gray-900">{estadisticas.totalVentas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen del bombero (solo para bomberos) */}
      {tienePermiso('registrar_ventas') && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-900">Resumen de Mis Ventas del Día</h3>
              <p className="text-sm text-blue-700">
                Aquí puedes ver un resumen de todas las ventas que has registrado hoy
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-600">Total del día</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatearMoneda(
                  ventas
                    .filter(venta => 
                      venta.bomberoId === useGasStation().usuarioActual?.id &&
                      new Date(venta.fechaHora).toDateString() === new Date().toDateString()
                    )
                    .reduce((sum, venta) => sum + venta.valorTotal, 0)
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Surtidor
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Buscar surtidor..."
              value={filtroSurtidor}
              onChange={(e) => setFiltroSurtidor(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Combustible
            </label>
            <select
              className="input-field"
              value={filtroCombustible}
              onChange={(e) => setFiltroCombustible(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="extra">Extra</option>
              <option value="corriente">Corriente</option>
              <option value="acpm">ACPM</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              className="input-field"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bombero
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Buscar bombero..."
              value={filtroBombero}
              onChange={(e) => setFiltroBombero(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Surtidor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo Combustible
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio Unitario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bombero
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ventasFiltradas.map((venta) => (
                <tr key={venta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatearFecha(venta.fechaHora)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {venta.surtidorNombre}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCombustibleColor(venta.tipoCombustible)}`}>
                      {getCombustibleLabel(venta.tipoCombustible)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatearCantidad(venta.cantidad)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatearMoneda(venta.precioUnitario)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatearMoneda(venta.valorTotal)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {venta.bomberoNombre || 'N/A'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {ventasFiltradas.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron ventas</p>
          </div>
        )}
      </div>

      {/* Resumen por combustible */}
      {Object.keys(estadisticas.porCombustible).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen por Tipo de Combustible</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(estadisticas.porCombustible).map(([tipo, datos]) => (
              <div key={tipo} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCombustibleColor(tipo)}`}>
                    {getCombustibleLabel(tipo)}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Cantidad: {formatearCantidad(datos.cantidad)}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    Total: {formatearMoneda(datos.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Ventas
