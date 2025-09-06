import React, { useState } from 'react'
import { useGasStation } from '../context/GasStationContext'

function Surtidores() {
  const { 
    surtidores, 
    iniciarVenta, 
    finalizarVenta, 
    cambiarEstadoSurtidor, 
    tienePermiso,
    usuarioActual 
  } = useGasStation()
  
  const [showModal, setShowModal] = useState(false)
  const [selectedSurtidor, setSelectedSurtidor] = useState(null)
  const [ventaData, setVentaData] = useState({
    combustible: 'extra',
    cantidad: '',
    valor: '',
    precioUnitario: 0
  })

  // Verificar permisos
  if (!tienePermiso('gestionar_surtidores') && !tienePermiso('registrar_ventas')) {
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

  const handleIniciarVenta = (surtidor) => {
    if (surtidor.estado !== 'disponible') {
      alert('Este surtidor no está disponible para ventas')
      return
    }
    
    setSelectedSurtidor(surtidor)
    setVentaData({
      combustible: 'extra',
      cantidad: '',
      valor: '',
      precioUnitario: surtidor.combustibles.extra.precio
    })
    setShowModal(true)
    iniciarVenta(surtidor.id)
  }

  const handleFinalizarVenta = (e) => {
    e.preventDefault()
    
    if (!ventaData.valor || parseFloat(ventaData.valor) <= 0) {
      alert('Por favor ingrese un valor válido')
      return
    }

    if (!ventaData.cantidad || parseFloat(ventaData.cantidad) <= 0) {
      alert('Error en el cálculo de galones. Verifique el valor ingresado.')
      return
    }

    // Validar que el precio unitario no haya sido modificado por usuarios no autorizados
    const precioOriginal = selectedSurtidor.combustibles[ventaData.combustible].precio
    if (ventaData.precioUnitario !== precioOriginal && !tienePermiso('gestionar_precios') && !tienePermiso('todos')) {
      alert('No tienes permisos para modificar el precio unitario. Contacta al gerente.')
      return
    }

    const cantidad = parseFloat(ventaData.cantidad)
    const precioUnitario = parseFloat(ventaData.precioUnitario)
    const total = cantidad * precioUnitario

    // Verificar stock disponible
    const stockDisponible = selectedSurtidor.combustibles[ventaData.combustible].stock
    if (cantidad > stockDisponible) {
      alert(`Stock insuficiente. Disponible: ${stockDisponible} galones`)
      return
    }

    finalizarVenta(
      selectedSurtidor.id,
      ventaData.combustible,
      cantidad,
      precioUnitario,
      total
    )

    // Mostrar mensaje de confirmación
    if (tienePermiso('registrar_ventas')) {
      alert(`✅ Venta registrada exitosamente!\n\nSurtidor: ${selectedSurtidor.nombre}\nCombustible: ${ventaData.combustible.toUpperCase()}\nValor: ${formatearMoneda(parseFloat(ventaData.valor))}\nCantidad: ${cantidad} galones\nPrecio unitario: ${formatearMoneda(precioUnitario)}\nTotal: ${formatearMoneda(total)}\n\nLa venta ha sido registrada a tu nombre.`)
    }

    setShowModal(false)
    setSelectedSurtidor(null)
    setVentaData({ combustible: 'extra', cantidad: '', valor: '', precioUnitario: 0 })
  }

  const handleCambiarEstado = (surtidorId, nuevoEstado) => {
    cambiarEstadoSurtidor(surtidorId, nuevoEstado)
  }

  const handleCombustibleChange = (combustible) => {
    if (selectedSurtidor) {
      const nuevoPrecio = selectedSurtidor.combustibles[combustible].precio
      const nuevaCantidad = ventaData.valor ? (parseFloat(ventaData.valor) / nuevoPrecio).toFixed(2) : ''
      
      setVentaData({
        ...ventaData,
        combustible,
        precioUnitario: nuevoPrecio,
        cantidad: nuevaCantidad
      })
    }
  }

  const handleValorChange = (valor) => {
    if (valor && !isNaN(parseFloat(valor)) && ventaData.precioUnitario > 0) {
      const cantidad = (parseFloat(valor) / ventaData.precioUnitario).toFixed(2)
      setVentaData({
        ...ventaData,
        valor,
        cantidad
      })
    } else {
      setVentaData({
        ...ventaData,
        valor,
        cantidad: ''
      })
    }
  }

  const handlePrecioUnitarioChange = (precio) => {
    // Solo permitir cambio si tiene permisos
    if (tienePermiso('gestionar_precios') || tienePermiso('todos')) {
      const nuevoPrecio = parseFloat(precio) || 0
      const nuevaCantidad = ventaData.valor && nuevoPrecio > 0 ? 
        (parseFloat(ventaData.valor) / nuevoPrecio).toFixed(2) : ''
      
      setVentaData({
        ...ventaData,
        precioUnitario: nuevoPrecio,
        cantidad: nuevaCantidad
      })
    }
  }


  const getEstadoColor = (estado) => {
    const colors = {
      disponible: 'bg-green-100 text-green-800',
      ocupado: 'bg-yellow-100 text-yellow-800',
      mantenimiento: 'bg-red-100 text-red-800'
    }
    return colors[estado] || 'bg-gray-100 text-gray-800'
  }

  const getEstadoLabel = (estado) => {
    const labels = {
      disponible: 'Disponible',
      ocupado: 'Ocupado',
      mantenimiento: 'Mantenimiento'
    }
    return labels[estado] || estado
  }

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor)
  }

  const formatearCantidad = (cantidad) => {
    return `${cantidad.toFixed(2)} gal`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Surtidores</h1>
          {tienePermiso('registrar_ventas') && !tienePermiso('gestionar_surtidores') && (
            <p className="text-sm text-gray-600 mt-1">
              Selecciona un surtidor disponible para registrar una nueva venta
            </p>
          )}
        </div>
      </div>

      {/* Grid de surtidores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surtidores.map((surtidor) => (
          <div key={surtidor.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{surtidor.nombre}</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(surtidor.estado)}`}>
                {getEstadoLabel(surtidor.estado)}
              </span>
            </div>

            {/* Información de combustibles */}
            <div className="space-y-3 mb-4">
              {Object.entries(surtidor.combustibles).map(([tipo, info]) => (
                <div key={tipo} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">{tipo}</p>
                    <p className="text-xs text-gray-500">
                      Stock: {formatearCantidad(info.stock)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatearMoneda(info.precio)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Vendido: {formatearCantidad(info.vendido)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Acciones */}
            <div className="flex space-x-2">
              {surtidor.estado === 'disponible' && (
                <button
                  onClick={() => handleIniciarVenta(surtidor)}
                  className="flex-1 btn-primary text-sm"
                >
                  {tienePermiso('registrar_ventas') ? 'Registrar Venta' : 'Iniciar Venta'}
                </button>
              )}
              
              {tienePermiso('gestionar_surtidores') && (
                <select
                  value={surtidor.estado}
                  onChange={(e) => handleCambiarEstado(surtidor.id, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="disponible">Disponible</option>
                  <option value="ocupado">Ocupado</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de venta */}
      {showModal && selectedSurtidor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nueva Venta - {selectedSurtidor.nombre}
              </h3>
              
              {tienePermiso('registrar_ventas') && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Instrucciones:</strong> Completa los datos de la venta. 
                    La venta se registrará automáticamente a tu nombre.
                  </p>
                </div>
              )}
              
              <form onSubmit={handleFinalizarVenta} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Combustible
                  </label>
                  <select
                    className="input-field"
                    value={ventaData.combustible}
                    onChange={(e) => handleCombustibleChange(e.target.value)}
                  >
                    <option value="extra">Extra</option>
                    <option value="corriente">Corriente</option>
                    <option value="acpm">ACPM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor a Cargar ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    className="input-field"
                    value={ventaData.valor}
                    onChange={(e) => handleValorChange(e.target.value)}
                    placeholder="Ej: 50000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Se calcularán automáticamente los galones
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad Calculada (galones)
                  </label>
                  <div className="input-field bg-gray-50 text-gray-700 cursor-not-allowed">
                    {ventaData.cantidad ? `${ventaData.cantidad} gal` : 'Se calculará automáticamente'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Stock disponible: {formatearCantidad(selectedSurtidor.combustibles[ventaData.combustible].stock)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio Unitario
                    {!tienePermiso('gestionar_precios') && !tienePermiso('todos') && (
                      <span className="text-xs text-gray-500 ml-2">(Solo lectura)</span>
                    )}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className={`input-field ${!tienePermiso('gestionar_precios') && !tienePermiso('todos') ? 'bg-gray-50 text-gray-700 cursor-not-allowed' : ''}`}
                    value={ventaData.precioUnitario}
                    onChange={(e) => handlePrecioUnitarioChange(e.target.value)}
                    disabled={!tienePermiso('gestionar_precios') && !tienePermiso('todos')}
                    title={!tienePermiso('gestionar_precios') && !tienePermiso('todos') ? 'Solo el Gerente y Super Admin pueden modificar precios' : ''}
                  />
                  {!tienePermiso('gestionar_precios') && !tienePermiso('todos') && (
                    <p className="text-xs text-gray-500 mt-1">
                      Solo el Gerente y Super Admin pueden modificar este precio
                    </p>
                  )}
                </div>

                {ventaData.cantidad && ventaData.precioUnitario && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Total:</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatearMoneda(parseFloat(ventaData.cantidad) * parseFloat(ventaData.precioUnitario))}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setSelectedSurtidor(null)
                      setVentaData({ combustible: 'extra', cantidad: '', precioUnitario: 0 })
                    }}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Finalizar Venta
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Surtidores
