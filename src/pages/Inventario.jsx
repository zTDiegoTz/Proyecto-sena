import React, { useState } from 'react'
import { useGasStation } from '../context/GasStationContext'

const Inventario = () => {
  const { surtidores, configuracion, actualizarPrecios, actualizarStock, tienePermiso } = useGasStation()
  const [editingPrecios, setEditingPrecios] = useState(false)
  const [editingStock, setEditingStock] = useState(null)
  const [nuevosPrecios, setNuevosPrecios] = useState({
    extra: configuracion.precios.extra,
    corriente: configuracion.precios.corriente,
    acpm: configuracion.precios.acpm
  })
  const [nuevoStock, setNuevoStock] = useState('')

  // Verificar permisos
  if (!tienePermiso('gestionar_inventario') && !tienePermiso('gestionar_precios')) {
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

  // Calcular totales de inventario
  const totalesInventario = {
    extra: { stock: 0, vendido: 0 },
    corriente: { stock: 0, vendido: 0 },
    acpm: { stock: 0, vendido: 0 }
  }

  surtidores.forEach(surtidor => {
    Object.keys(totalesInventario).forEach(combustible => {
      totalesInventario[combustible].stock += surtidor.combustibles[combustible].stock
      totalesInventario[combustible].vendido += surtidor.combustibles[combustible].vendido
    })
  })

  const guardarPrecios = () => {
    actualizarPrecios(nuevosPrecios)
    setEditingPrecios(false)
  }

  const cancelarEdicionPrecios = () => {
    setNuevosPrecios({
      extra: configuracion.precios.extra,
      corriente: configuracion.precios.corriente,
      acpm: configuracion.precios.acpm
    })
    setEditingPrecios(false)
  }

  const iniciarEdicionStock = (surtidorId, combustible) => {
    const surtidor = surtidores.find(s => s.id === surtidorId)
    setNuevoStock(surtidor.combustibles[combustible].stock.toString())
    setEditingStock({ surtidorId, combustible })
  }

  const guardarStock = () => {
    const stockNum = parseFloat(nuevoStock)
    if (isNaN(stockNum) || stockNum < 0) {
      alert('Por favor ingrese un valor válido')
      return
    }

    actualizarStock(
      editingStock.surtidorId,
      editingStock.combustible,
      stockNum
    )

    setEditingStock(null)
    setNuevoStock('')
  }

  const cancelarEdicionStock = () => {
    setEditingStock(null)
    setNuevoStock('')
  }

  const getStockColor = (stock, vendido) => {
    const porcentaje = (vendido / (stock + vendido)) * 100
    if (porcentaje > 80) return 'text-red-600'
    if (porcentaje > 60) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
          <p className="text-gray-600">Control de stock y precios de combustibles</p>
        </div>
        
        {/* Enlace a gestión de precios */}
        {tienePermiso('gestionar_precios') && (
          <button
            onClick={() => window.location.href = '/precios'}
            className="btn-primary flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Gestionar Precios
          </button>
        )}
      </div>

      {/* Resumen de inventario */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Extra</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Stock Total:</span>
              <span className="font-medium">{formatVolume(totalesInventario.extra.stock)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Vendido:</span>
              <span className={`font-medium ${getStockColor(totalesInventario.extra.stock, totalesInventario.extra.vendido)}`}>
                {formatVolume(totalesInventario.extra.vendido)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Precio:</span>
              <span className="font-medium">{formatCurrency(configuracion.precios.extra)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Corriente</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Stock Total:</span>
              <span className="font-medium">{formatVolume(totalesInventario.corriente.stock)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Vendido:</span>
              <span className={`font-medium ${getStockColor(totalesInventario.corriente.stock, totalesInventario.corriente.vendido)}`}>
                {formatVolume(totalesInventario.corriente.vendido)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Precio:</span>
              <span className="font-medium">{formatCurrency(configuracion.precios.corriente)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ACPM</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Stock Total:</span>
              <span className="font-medium">{formatVolume(totalesInventario.acpm.stock)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Vendido:</span>
              <span className={`font-medium ${getStockColor(totalesInventario.acpm.stock, totalesInventario.acpm.vendido)}`}>
                {formatVolume(totalesInventario.acpm.vendido)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Precio:</span>
              <span className="font-medium">{formatCurrency(configuracion.precios.acpm)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuración de precios */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Configuración de Precios</h3>
          {!editingPrecios ? (
            <button
              onClick={() => setEditingPrecios(true)}
              className="btn-primary"
            >
              Editar Precios
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={guardarPrecios}
                className="btn-primary"
              >
                Guardar
              </button>
              <button
                onClick={cancelarEdicionPrecios}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Extra</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input-field"
              value={nuevosPrecios.extra}
              onChange={(e) => setNuevosPrecios({...nuevosPrecios, extra: parseFloat(e.target.value) || 0})}
              disabled={!editingPrecios}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Corriente</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input-field"
              value={nuevosPrecios.corriente}
              onChange={(e) => setNuevosPrecios({...nuevosPrecios, corriente: parseFloat(e.target.value) || 0})}
              disabled={!editingPrecios}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ACPM</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input-field"
              value={nuevosPrecios.acpm}
              onChange={(e) => setNuevosPrecios({...nuevosPrecios, acpm: parseFloat(e.target.value) || 0})}
              disabled={!editingPrecios}
            />
          </div>
        </div>
      </div>

      {/* Tabla de stock por surtidor */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock por Surtidor</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Surtidor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Extra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Corriente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACPM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {surtidores.map((surtidor) => (
                <tr key={surtidor.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {surtidor.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatVolume(surtidor.combustibles.extra.stock)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatVolume(surtidor.combustibles.corriente.stock)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatVolume(surtidor.combustibles.acpm.stock)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => iniciarEdicionStock(surtidor.id, 'extra')}
                      className="text-primary-600 hover:text-primary-900 mr-2"
                    >
                      Editar Extra
                    </button>
                    <button
                      onClick={() => iniciarEdicionStock(surtidor.id, 'corriente')}
                      className="text-primary-600 hover:text-primary-900 mr-2"
                    >
                      Editar Corriente
                    </button>
                    <button
                      onClick={() => iniciarEdicionStock(surtidor.id, 'acpm')}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Editar ACPM
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para editar stock */}
      {editingStock && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Editar Stock - {editingStock.combustible.toUpperCase()}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nuevo Stock (galones)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-field"
                    value={nuevoStock}
                    onChange={(e) => setNuevoStock(e.target.value)}
                    placeholder="Ingrese el nuevo stock"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={cancelarEdicionStock}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarStock}
                    className="btn-primary"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventario
