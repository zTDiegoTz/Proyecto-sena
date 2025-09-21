import React, { useState, useEffect } from 'react'
import { useSimpleSupabase } from '../context/SimpleSupabaseContext'

function VentaCombustibleSimple() {
  const { usuarioActual, surtidores, realizarVenta, obtenerSurtidores } = useSimpleSupabase()
  
  // Estados del formulario de venta
  const [ventaData, setVentaData] = useState({
    surtidor_id: '',
    tipo_combustible: '',
    monto_dinero: '',
    precio_por_galon: '',
    metodo_pago: 'efectivo',
    cliente_nombre: '',
    cliente_documento: '',
    placa_vehiculo: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [surtidorSeleccionado, setSurtidorSeleccionado] = useState(null)
  const [combustiblesDisponibles, setCombustiblesDisponibles] = useState([])

  // Cargar surtidores al montar el componente
  useEffect(() => {
    obtenerSurtidores()
  }, [])

  // Actualizar combustibles disponibles cuando se selecciona un surtidor
  useEffect(() => {
    if (ventaData.surtidor_id) {
      const surtidor = surtidores.find(s => s.id.toString() === ventaData.surtidor_id)
      setSurtidorSeleccionado(surtidor)
      
      if (surtidor && surtidor.combustibles) {
        const combustibles = Object.entries(surtidor.combustibles)
          .filter(([tipo, datos]) => datos.stock > 0)
          .map(([tipo, datos]) => ({ tipo, ...datos }))
        setCombustiblesDisponibles(combustibles)
      } else {
        setCombustiblesDisponibles([])
      }
      
      // Limpiar tipo de combustible si ya no está disponible
      setVentaData(prev => ({ ...prev, tipo_combustible: '', precio_por_galon: '' }))
    }
  }, [ventaData.surtidor_id, surtidores])

  // Actualizar precio cuando se selecciona un combustible
  useEffect(() => {
    if (ventaData.tipo_combustible && surtidorSeleccionado) {
      const combustible = surtidorSeleccionado.combustibles[ventaData.tipo_combustible]
      if (combustible) {
        setVentaData(prev => ({ 
          ...prev, 
          precio_por_galon: combustible.precio.toString() 
        }))
      }
    }
  }, [ventaData.tipo_combustible, surtidorSeleccionado])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Si cambió el método de pago, limpiar información del cliente
    if (name === 'metodo_pago') {
      setVentaData(prev => ({ 
        ...prev, 
        [name]: value,
        cliente_nombre: '',
        cliente_documento: '',
        placa_vehiculo: ''
      }))
    } else {
      setVentaData(prev => ({ ...prev, [name]: value }))
    }
  }

  // Cálculos automáticos - Solo venta por dinero
  const calcularGalones = () => {
    const dinero = parseFloat(ventaData.monto_dinero) || 0
    const precio = parseFloat(ventaData.precio_por_galon) || 0
    return precio > 0 ? dinero / precio : 0
  }

  const calcularTotal = () => {
    return parseFloat(ventaData.monto_dinero) || 0
  }

  const galonesCalculados = calcularGalones()
  const totalCalculado = calcularTotal()

  const validarFormulario = () => {
    if (!ventaData.surtidor_id) return 'Debe seleccionar un surtidor'
    if (!ventaData.tipo_combustible) return 'Debe seleccionar un tipo de combustible'
    
    if (!ventaData.monto_dinero || parseFloat(ventaData.monto_dinero) <= 0) {
      return 'Debe ingresar un monto válido'
    }
    
    // Validación de cliente según método de pago
    if (ventaData.metodo_pago === 'credito') {
      if (!ventaData.cliente_nombre.trim()) return 'Debe ingresar el nombre del cliente para venta a crédito'
      if (!ventaData.cliente_documento.trim()) return 'Debe ingresar el documento del cliente para venta a crédito'
      if (!ventaData.placa_vehiculo.trim()) return 'Debe ingresar la placa del vehículo para venta a crédito'
    }
    
    // Validar stock disponible (convertir galones a litros para validar)
    const galones = galonesCalculados
    const litrosEquivalentes = galones * 3.78541 // 1 galón = 3.78541 litros
    const stockDisponible = surtidorSeleccionado?.combustibles[ventaData.tipo_combustible]?.stock || 0
    
    if (litrosEquivalentes > stockDisponible) {
      return `Stock insuficiente. Disponible: ${stockDisponible}L (${(stockDisponible / 3.78541).toFixed(2)} gal), solicitado: ${galones.toFixed(2)} gal`
    }

    return null
  }

  const handleSubmitVenta = async (e) => {
    e.preventDefault()
    
    const errorValidacion = validarFormulario()
    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    setLoading(true)
    setError('')
    setMensaje('')

    try {
      const ventaCompleta = {
        ...ventaData,
        cantidad_galones: galonesCalculados,
        cantidad_litros: galonesCalculados * 3.78541, // Para actualizar stock
        precio_por_galon: parseFloat(ventaData.precio_por_galon),
        valor_total: totalCalculado, // Cambiar de 'total' a 'valor_total'
        surtidor_nombre: surtidorSeleccionado?.nombre || '', // Agregar nombre del surtidor
        bombero_id: usuarioActual.id,
        bombero_nombre: usuarioActual.name,
        fecha_venta: new Date().toISOString()
      }

      const resultado = await realizarVenta(ventaCompleta)
      
      if (resultado.success) {
        setMensaje('¡Venta registrada exitosamente!')
        
        // Limpiar formulario
        setVentaData({
          surtidor_id: '',
          tipo_combustible: '',
          monto_dinero: '',
          precio_por_galon: '',
          metodo_pago: 'efectivo',
          cliente_nombre: '',
          cliente_documento: '',
          placa_vehiculo: ''
        })
        setSurtidorSeleccionado(null)
        setCombustiblesDisponibles([])
        
        // Recargar surtidores para actualizar stock
        setTimeout(() => {
          obtenerSurtidores()
          setMensaje('')
        }, 3000)
      } else {
        setError(resultado.error || 'Error al registrar la venta')
      }
    } catch (error) {
      console.error('Error en venta:', error)
      setError('Error inesperado al procesar la venta')
    } finally {
      setLoading(false)
    }
  }

  const limpiarFormulario = () => {
    setVentaData({
      surtidor_id: '',
      tipo_combustible: '',
      monto_dinero: '',
      precio_por_galon: '',
      metodo_pago: 'efectivo',
      cliente_nombre: '',
      cliente_documento: '',
      placa_vehiculo: ''
    })
    setSurtidorSeleccionado(null)
    setCombustiblesDisponibles([])
    setError('')
    setMensaje('')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          ⛽ Venta de Combustible
        </h2>
        <p className="text-gray-600 mt-1">
          Bombero: <span className="font-semibold">{usuarioActual.name}</span>
        </p>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✅ {mensaje}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">❌ {error}</p>
        </div>
      )}

      <form onSubmit={handleSubmitVenta} className="space-y-6">
        {/* Información del sistema */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-900 mb-2">💰 Venta por Monto</h3>
          <p className="text-sm text-green-700">
            💡 Ingresa el monto de dinero y automáticamente se calcularán los galones a entregar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Selección de Surtidor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏪 Surtidor
            </label>
            <select
              name="surtidor_id"
              value={ventaData.surtidor_id}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccionar surtidor...</option>
              {surtidores
                .filter(s => s.estado === 'disponible' || s.estado === 'ocupado')
                .map((surtidor) => (
                <option key={surtidor.id} value={surtidor.id}>
                  {surtidor.nombre} - {surtidor.estado}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Combustible */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⛽ Tipo de Combustible
            </label>
            <select
              name="tipo_combustible"
              value={ventaData.tipo_combustible}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={!ventaData.surtidor_id}
            >
              <option value="">Seleccionar combustible...</option>
              {combustiblesDisponibles.map((combustible) => (
                <option key={combustible.tipo} value={combustible.tipo}>
                  {combustible.tipo.toUpperCase()} - ${combustible.precio.toLocaleString()}/gal
                </option>
              ))}
            </select>
          </div>

          {/* Monto a vender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💰 Monto a Vender
            </label>
            <input
              type="number"
              name="monto_dinero"
              value={ventaData.monto_dinero}
              onChange={handleInputChange}
              step="1000"
              min="1000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="50000"
              required
            />
            <p className="text-xs text-green-600 mt-1 font-medium">
              💡 Galones calculados: {galonesCalculados.toFixed(2)} gal
            </p>
            {surtidorSeleccionado?.combustibles[ventaData.tipo_combustible] && (
              <p className="text-xs text-gray-500">
                Máximo disponible: {(surtidorSeleccionado.combustibles[ventaData.tipo_combustible].stock / 3.78541).toFixed(2)} gal
              </p>
            )}
          </div>

          {/* Precio por Galón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💰 Precio por Galón
            </label>
            <input
              type="number"
              name="precio_por_galon"
              value={ventaData.precio_por_galon}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              readOnly
            />
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💳 Método de Pago
            </label>
            <select
              name="metodo_pago"
              value={ventaData.metodo_pago}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="efectivo">💵 Efectivo</option>
              <option value="tarjeta">💳 Tarjeta</option>
              <option value="transferencia">🏦 Transferencia</option>
              <option value="credito">📋 Crédito</option>
            </select>
          </div>

          {/* Resumen de la venta */}
          <div className="md:col-span-2 bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
            <h4 className="font-semibold text-gray-900 mb-3">📋 Resumen de la Venta</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-100 rounded-lg">
                <p className="text-xs text-blue-600 font-medium">GALONES</p>
                <p className="text-lg font-bold text-blue-800">{galonesCalculados.toFixed(2)} gal</p>
              </div>
              <div className="text-center p-3 bg-yellow-100 rounded-lg">
                <p className="text-xs text-yellow-600 font-medium">PRECIO/GALÓN</p>
                <p className="text-lg font-bold text-yellow-800">${ventaData.precio_por_galon ? parseFloat(ventaData.precio_por_galon).toLocaleString() : '0'}</p>
              </div>
              <div className="text-center p-3 bg-green-100 rounded-lg">
                <p className="text-xs text-green-600 font-medium">TOTAL A PAGAR</p>
                <p className="text-xl font-bold text-green-800">${totalCalculado.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-sm text-green-600 mt-2 text-center font-medium">
              ✅ Venta por monto fijo: ${ventaData.monto_dinero ? parseFloat(ventaData.monto_dinero).toLocaleString() : '0'}
            </p>
          </div>
        </div>

        {/* Información del Cliente - Solo para crédito */}
        {ventaData.metodo_pago === 'credito' && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Información del Cliente (Crédito)</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-700">
                📋 <strong>Venta a crédito:</strong> Es obligatorio registrar la información completa del cliente.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="cliente_nombre"
                  value={ventaData.cliente_nombre}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre del cliente"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documento/Cédula *
                </label>
                <input
                  type="text"
                  name="cliente_documento"
                  value={ventaData.cliente_documento}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Número de documento"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placa del Vehículo *
                </label>
                <input
                  type="text"
                  name="placa_vehiculo"
                  value={ventaData.placa_vehiculo}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ABC-123"
                  style={{ textTransform: 'uppercase' }}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Información básica para otros métodos de pago */}
        {ventaData.metodo_pago !== 'credito' && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Cliente (Opcional)</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-700">
                💵 <strong>Venta de contado:</strong> La información del cliente es opcional.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="cliente_nombre"
                  value={ventaData.cliente_nombre}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Cliente (opcional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documento/Cédula
                </label>
                <input
                  type="text"
                  name="cliente_documento"
                  value={ventaData.cliente_documento}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Documento (opcional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placa del Vehículo
                </label>
                <input
                  type="text"
                  name="placa_vehiculo"
                  value={ventaData.placa_vehiculo}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ABC-123 (opcional)"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex space-x-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-colors duration-200 ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Procesando...
              </span>
            ) : (
              '💰 Registrar Venta'
            )}
          </button>
          
          <button
            type="button"
            onClick={limpiarFormulario}
            className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
          >
            🧹 Limpiar
          </button>
        </div>
      </form>
    </div>
  )
}

export default VentaCombustibleSimple
