import React, { createContext, useContext, useState, useEffect } from 'react'
import { usuariosService, surtidoresService } from '../services/supabaseServiceFinal'
import { ventasServiceClean } from '../services/ventasServiceClean'

const SimpleSupabaseContext = createContext()

export function SimpleSupabaseProvider({ children }) {
  // Inicializar usuario desde localStorage si existe
  const [usuarioActual, setUsuarioActual] = useState(() => {
    try {
      const usuarioGuardado = localStorage.getItem('usuario_actual')
      return usuarioGuardado ? JSON.parse(usuarioGuardado) : null
    } catch (error) {
      console.error('Error al cargar usuario desde localStorage:', error)
      return null
    }
  })
  
  const [surtidores, setSurtidores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Cargar surtidores
        const surtidoresResult = await surtidoresService.obtenerTodos()
        if (surtidoresResult.success) {
          setSurtidores(surtidoresResult.data)
        } else {
          setError(surtidoresResult.message)
        }
      } catch (err) {
        setError('Error al cargar datos: ' + err.message)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [])

  // Login
  const login = async (username, password) => {
    try {
      setError(null)
      const resultado = await usuariosService.login(username, password)
      
      if (resultado.success) {
        setUsuarioActual(resultado.data)
        // Guardar usuario en localStorage para persistencia
        localStorage.setItem('usuario_actual', JSON.stringify(resultado.data))
        return { success: true, usuario: resultado.data }
      } else {
        setError(resultado.message)
        return resultado
      }
    } catch (err) {
      const errorMsg = 'Error al iniciar sesión: ' + err.message
      setError(errorMsg)
      return { success: false, message: errorMsg }
    }
  }

  // Logout
  const logout = () => {
    setUsuarioActual(null)
    setError(null)
    // Limpiar localStorage al cerrar sesión
    localStorage.removeItem('usuario_actual')
  }

  // Función simple de permisos
  const tienePermiso = (permiso) => {
    if (!usuarioActual) return false
    
    const permisos = {
      super_admin: ['todos'],
      administrador: ['gestionar_surtidores', 'gestionar_ventas', 'gestionar_turnos', 'ver_reportes', 'ver_ventas', 'gestionar_precios', 'gestionar_inventario'],
      bombero: ['registrar_ventas', 'gestionar_turno_propio']
    }
    
    const permisosUsuario = permisos[usuarioActual.role] || []
    return permisosUsuario.includes('todos') || permisosUsuario.includes(permiso)
  }

  // Limpiar error
  const limpiarError = () => setError(null)

  // Función para obtener surtidores (recarga desde Supabase)
  const obtenerSurtidores = async () => {
    try {
      const resultado = await surtidoresService.obtenerTodos()
      if (resultado.success) {
        setSurtidores(resultado.data)
        return resultado
      } else {
        setError(resultado.message)
        return resultado
      }
    } catch (err) {
      const errorMsg = 'Error al cargar surtidores: ' + err.message
      setError(errorMsg)
      return { success: false, message: errorMsg }
    }
  }

  // Función para realizar una venta
  const realizarVenta = async (datosVenta) => {
    try {
      setError(null)
      
      // Registrar la venta en Supabase usando el servicio limpio
      const resultadoVenta = await ventasServiceClean.crear(datosVenta)
      
      if (resultadoVenta.success) {
        // Actualizar stock del surtidor (usar cantidad en litros para el stock)
        const resultadoStock = await surtidoresService.actualizarStock(
          datosVenta.surtidor_id,
          datosVenta.tipo_combustible,
          datosVenta.cantidad_litros || datosVenta.cantidad
        )
        
        if (resultadoStock.success) {
          // Recargar surtidores para reflejar el nuevo stock
          await obtenerSurtidores()
          return { success: true, venta: resultadoVenta.data }
        } else {
          setError('Venta registrada pero error al actualizar stock: ' + resultadoStock.message)
          return { success: false, error: resultadoStock.message }
        }
      } else {
        setError(resultadoVenta.message)
        return resultadoVenta
      }
    } catch (err) {
      const errorMsg = 'Error al procesar la venta: ' + err.message
      setError(errorMsg)
      return { success: false, error: errorMsg }
    }
  }

  const value = {
    // Estado
    usuarioActual,
    surtidores,
    loading,
    error,
    
    // Funciones
    login,
    logout,
    tienePermiso,
    limpiarError,
    obtenerSurtidores,
    realizarVenta,
    
    // Datos mock para compatibilidad
    ventas: [],
    configuracion: {
      precios: {
        extra: 12500,
        corriente: 11500,
        acpm: 10500
      }
    },
    usuarios: [],
    turnos: [],
    
    // Funciones mock para compatibilidad
    iniciarVenta: () => {},
    finalizarVenta: () => {},
    actualizarPrecios: () => {},
    actualizarStock: () => {},
    cambiarEstadoSurtidor: () => {},
    crearUsuario: () => {},
    actualizarUsuario: () => {},
    eliminarUsuario: () => {},
    iniciarTurno: () => {},
    finalizarTurno: () => {},
    cargarDatosIniciales: () => {},
    cargarSurtidores: () => {},
    cargarVentas: () => {},
    cargarTurnos: () => {},
    cargarUsuarios: () => {},
    cargarConfiguracion: () => {}
  }

  return (
    <SimpleSupabaseContext.Provider value={value}>
      {children}
    </SimpleSupabaseContext.Provider>
  )
}

export function useSimpleSupabase() {
  const context = useContext(SimpleSupabaseContext)
  if (!context) {
    throw new Error('useSimpleSupabase debe ser usado dentro de un SimpleSupabaseProvider')
  }
  return context
}
