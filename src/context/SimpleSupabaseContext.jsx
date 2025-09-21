import React, { createContext, useContext, useState, useEffect } from 'react'
import { usuariosService, surtidoresService } from '../services/supabaseServiceFinal'

const SimpleSupabaseContext = createContext()

export function SimpleSupabaseProvider({ children }) {
  const [usuarioActual, setUsuarioActual] = useState(null)
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
