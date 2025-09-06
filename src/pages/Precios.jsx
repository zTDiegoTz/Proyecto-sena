import React, { useState, useEffect } from 'react'
import { useGasStation } from '../context/GasStationContext'

function Precios() {
  const { configuracion, actualizarPrecios, tienePermiso, usuarioActual } = useGasStation()
  const [editingPrecios, setEditingPrecios] = useState(false)
  const [nuevosPrecios, setNuevosPrecios] = useState({
    extra: configuracion.precios.extra,
    corriente: configuracion.precios.corriente,
    acpm: configuracion.precios.acpm
  })
  const [historialPrecios, setHistorialPrecios] = useState([])

  // Verificar permisos
  if (!tienePermiso('gestionar_precios') && !tienePermiso('todos')) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-xl font-semibold">
          Acceso Denegado
        </div>
        <p className="text-gray-600 mt-2">
          No tienes permisos para gestionar precios.
        </p>
      </div>
    )
  }

  // Cargar historial de precios desde localStorage
  useEffect(() => {
    const historial = localStorage.getItem('historialPrecios')
    if (historial) {
      try {
        setHistorialPrecios(JSON.parse(historial))
      } catch (error) {
        console.error('Error al cargar historial de precios:', error)
      }
    }
  }, [])

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD'
    }).format(valor)
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const guardarPrecios = () => {
    // Validar que los precios sean válidos
    if (nuevosPrecios.extra <= 0 || nuevosPrecios.corriente <= 0 || nuevosPrecios.acpm <= 0) {
      alert('Todos los precios deben ser mayores a $0')
      return
    }

    // Guardar en el historial
    const cambioPrecio = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      usuario: usuarioActual.nombre,
      rol: usuarioActual.rol,
      preciosAnteriores: { ...configuracion.precios },
      preciosNuevos: { ...nuevosPrecios },
      cambios: {
        extra: nuevosPrecios.extra - configuracion.precios.extra,
        corriente: nuevosPrecios.corriente - configuracion.precios.corriente,
        acpm: nuevosPrecios.acpm - configuracion.precios.acpm
      }
    }

    const nuevoHistorial = [cambioPrecio, ...historialPrecios].slice(0, 50) // Mantener solo los últimos 50 cambios
    setHistorialPrecios(nuevoHistorial)
    localStorage.setItem('historialPrecios', JSON.stringify(nuevoHistorial))

    // Actualizar precios en el contexto
    actualizarPrecios(nuevosPrecios)
    setEditingPrecios(false)

    // Mostrar confirmación
    alert('✅ Precios actualizados exitosamente!\n\nLos nuevos precios se han aplicado a todos los surtidores.')
  }

  const cancelarEdicionPrecios = () => {
    setNuevosPrecios({
      extra: configuracion.precios.extra,
      corriente: configuracion.precios.corriente,
      acpm: configuracion.precios.acpm
    })
    setEditingPrecios(false)
  }

  const getCambioColor = (cambio) => {
    if (cambio > 0) return 'text-red-600'
    if (cambio < 0) return 'text-green-600'
    return 'text-gray-600'
  }

  const getCambioIcono = (cambio) => {
    if (cambio > 0) return '↗️'
    if (cambio < 0) return '↘️'
    return '→'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Precios</h1>
          <p className="text-sm text-gray-600 mt-1">
            Configura los precios por galón para todos los tipos de combustible
          </p>
        </div>
      </div>

      {/* Tarjetas de precios actuales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Extra</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-blue-700">Precio Actual:</span>
              <span className="font-bold text-blue-900 text-xl">
                {formatearMoneda(configuracion.precios.extra)}
              </span>
            </div>
            <div className="text-xs text-blue-600">
              Combustible de alto octanaje
            </div>
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Corriente</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-green-700">Precio Actual:</span>
              <span className="font-bold text-green-900 text-xl">
                {formatearMoneda(configuracion.precios.corriente)}
              </span>
            </div>
            <div className="text-xs text-green-600">
              Combustible estándar
            </div>
          </div>
        </div>

        <div className="card bg-orange-50 border-orange-200">
          <h3 className="text-lg font-semibold text-orange-900 mb-4">ACPM</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-orange-700">Precio Actual:</span>
              <span className="font-bold text-orange-900 text-xl">
                {formatearMoneda(configuracion.precios.acpm)}
              </span>
            </div>
            <div className="text-xs text-orange-600">
              Combustible diesel
            </div>
          </div>
        </div>
      </div>

      {/* Configuración de precios */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Editar Precios</h3>
            <p className="text-sm text-gray-600">
              Los cambios se aplicarán a todos los surtidores inmediatamente
            </p>
          </div>
          {!editingPrecios ? (
            <button
              onClick={() => setEditingPrecios(true)}
              className="btn-primary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modificar Precios
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={guardarPrecios}
                className="btn-primary"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar Cambios
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio Extra (por galón)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input-field pl-8"
                value={nuevosPrecios.extra}
                onChange={(e) => setNuevosPrecios({...nuevosPrecios, extra: parseFloat(e.target.value) || 0})}
                disabled={!editingPrecios}
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Precio actual: {formatearMoneda(configuracion.precios.extra)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio Corriente (por galón)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input-field pl-8"
                value={nuevosPrecios.corriente}
                onChange={(e) => setNuevosPrecios({...nuevosPrecios, corriente: parseFloat(e.target.value) || 0})}
                disabled={!editingPrecios}
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Precio actual: {formatearMoneda(configuracion.precios.corriente)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio ACPM (por galón)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="input-field pl-8"
                value={nuevosPrecios.acpm}
                onChange={(e) => setNuevosPrecios({...nuevosPrecios, acpm: parseFloat(e.target.value) || 0})}
                disabled={!editingPrecios}
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Precio actual: {formatearMoneda(configuracion.precios.acpm)}
            </p>
          </div>
        </div>

        {editingPrecios && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-sm text-yellow-800 font-medium">Importante:</p>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• Los cambios se aplicarán inmediatamente a todos los surtidores</li>
                  <li>• Las ventas en curso mantendrán el precio anterior</li>
                  <li>• Se registrará un historial de todos los cambios realizados</li>
                  <li>• Solo usuarios con permisos de gerencia pueden modificar precios</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Historial de cambios de precios */}
      {historialPrecios.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Cambios de Precios</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historialPrecios.map((cambio) => (
                  <tr key={cambio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatearFecha(cambio.fecha)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{cambio.usuario}</div>
                      <div className="text-xs text-gray-500 capitalize">{cambio.rol.replace('_', ' ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatearMoneda(cambio.preciosNuevos.extra)}
                      </div>
                      <div className={`text-xs ${getCambioColor(cambio.cambios.extra)}`}>
                        {getCambioIcono(cambio.cambios.extra)} {formatearMoneda(Math.abs(cambio.cambios.extra))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatearMoneda(cambio.preciosNuevos.corriente)}
                      </div>
                      <div className={`text-xs ${getCambioColor(cambio.cambios.corriente)}`}>
                        {getCambioIcono(cambio.cambios.corriente)} {formatearMoneda(Math.abs(cambio.cambios.corriente))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatearMoneda(cambio.preciosNuevos.acpm)}
                      </div>
                      <div className={`text-xs ${getCambioColor(cambio.cambios.acpm)}`}>
                        {getCambioIcono(cambio.cambios.acpm)} {formatearMoneda(Math.abs(cambio.cambios.acpm))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Precios
