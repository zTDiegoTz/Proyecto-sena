import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { 
  usuariosService, 
  surtidoresService, 
  ventasService, 
  turnosService, 
  configuracionService 
} from '../services/supabaseServiceFinal'

// Estado inicial simplificado (los datos se cargan desde Supabase)
const initialState = {
  surtidores: [],
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
  usuarioActual: null,
  loading: false,
  error: null
}

// Acciones
const ACTIONS = {
  // Estado de carga
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  
  // Datos
  SET_SURTIDORES: 'SET_SURTIDORES',
  SET_VENTAS: 'SET_VENTAS',
  SET_USUARIOS: 'SET_USUARIOS',
  SET_TURNOS: 'SET_TURNOS',
  SET_CONFIGURACION: 'SET_CONFIGURACION',
  
  // Acciones locales (optimistas)
  INICIAR_VENTA: 'INICIAR_VENTA',
  FINALIZAR_VENTA: 'FINALIZAR_VENTA',
  ACTUALIZAR_PRECIOS: 'ACTUALIZAR_PRECIOS',
  ACTUALIZAR_STOCK: 'ACTUALIZAR_STOCK',
  CAMBIAR_ESTADO_SURTIDOR: 'CAMBIAR_ESTADO_SURTIDOR',
  
  // Usuario
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  
  // Turnos
  INICIAR_TURNO: 'INICIAR_TURNO',
  FINALIZAR_TURNO: 'FINALIZAR_TURNO'
}

// Reducer
function gasStationReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false }
    
    case ACTIONS.SET_SURTIDORES:
      return { ...state, surtidores: action.payload }
    
    case ACTIONS.SET_VENTAS:
      return { ...state, ventas: action.payload }
    
    case ACTIONS.SET_USUARIOS:
      return { ...state, usuarios: action.payload }
    
    case ACTIONS.SET_TURNOS:
      return { ...state, turnos: action.payload }
    
    case ACTIONS.SET_CONFIGURACION:
      return { ...state, configuracion: action.payload }
    
    case ACTIONS.LOGIN:
      return { ...state, usuarioActual: action.payload }
    
    case ACTIONS.LOGOUT:
      return { ...state, usuarioActual: null }
    
    // Actualizaciones optimistas (se reflejan inmediatamente en la UI)
    case ACTIONS.INICIAR_VENTA:
      return {
        ...state,
        surtidores: state.surtidores.map(surtidor =>
          surtidor.id === action.payload.surtidorId
            ? { ...surtidor, estado: 'ocupado' }
            : surtidor
        )
      }
    
    case ACTIONS.FINALIZAR_VENTA:
      const { surtidorId, combustible, cantidad, precioUnitario, total } = action.payload
      const nuevaVenta = {
        id: Date.now(), // Temporal, se reemplazará con el ID de Supabase
        surtidor_id: surtidorId,
        surtidor_nombre: state.surtidores.find(s => s.id === surtidorId)?.nombre,
        tipo_combustible: combustible,
        cantidad: parseFloat(cantidad),
        precio_unitario: parseFloat(precioUnitario),
        valor_total: parseFloat(total),
        fecha_hora: new Date().toISOString(),
        bombero_id: state.usuarioActual?.id,
        bombero_nombre: state.usuarioActual?.nombre
      }

      return {
        ...state,
        surtidores: state.surtidores.map(surtidor =>
          surtidor.id === surtidorId
            ? {
                ...surtidor,
                estado: 'disponible',
                combustibles: {
                  ...surtidor.combustibles,
                  [combustible]: {
                    ...surtidor.combustibles[combustible],
                    stock: surtidor.combustibles[combustible].stock - parseFloat(cantidad),
                    vendido: surtidor.combustibles[combustible].vendido + parseFloat(cantidad)
                  }
                }
              }
            : surtidor
        ),
        ventas: [nuevaVenta, ...state.ventas]
      }
    
    case ACTIONS.CAMBIAR_ESTADO_SURTIDOR:
      return {
        ...state,
        surtidores: state.surtidores.map(surtidor =>
          surtidor.id === action.payload.surtidorId
            ? { ...surtidor, estado: action.payload.nuevoEstado }
            : surtidor
        )
      }
    
    case ACTIONS.ACTUALIZAR_PRECIOS:
      return {
        ...state,
        configuracion: {
          ...state.configuracion,
          precios: action.payload
        },
        surtidores: state.surtidores.map(surtidor => ({
          ...surtidor,
          combustibles: {
            extra: { ...surtidor.combustibles.extra, precio: action.payload.extra },
            corriente: { ...surtidor.combustibles.corriente, precio: action.payload.corriente },
            acpm: { ...surtidor.combustibles.acpm, precio: action.payload.acpm }
          }
        }))
      }
    
    case ACTIONS.ACTUALIZAR_STOCK:
      const { surtidorId: surtId, combustible: comb, nuevoStock } = action.payload
      return {
        ...state,
        surtidores: state.surtidores.map(surtidor =>
          surtidor.id === surtId
            ? {
                ...surtidor,
                combustibles: {
                  ...surtidor.combustibles,
                  [comb]: { ...surtidor.combustibles[comb], stock: parseFloat(nuevoStock) }
                }
              }
            : surtidor
        )
      }
    
    default:
      return state
  }
}

// Contexto
const SupabaseGasStationContext = createContext()

// Provider
export function SupabaseGasStationProvider({ children }) {
  const [state, dispatch] = useReducer(gasStationReducer, initialState)

  // Funciones para cargar datos desde Supabase
  const cargarSurtidores = async () => {
    const resultado = await surtidoresService.obtenerTodos()
    if (resultado.success) {
      dispatch({ type: ACTIONS.SET_SURTIDORES, payload: resultado.data })
    } else {
      dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
    }
  }

  const cargarVentas = async () => {
    const resultado = await ventasService.obtenerTodos()
    if (resultado.success) {
      // Transformar los datos de la base de datos al formato esperado por la interfaz
      const ventasTransformadas = resultado.data.map(venta => ({
        id: venta.id,
        surtidorId: venta.surtidor_id,
        surtidorNombre: venta.surtidor_nombre,
        bomberoId: venta.bombero_id,
        bomberoNombre: venta.bombero_nombre,
        tipoCombustible: venta.tipo_combustible,
        cantidad: venta.cantidad || venta.cantidad_litros,
        cantidadGalones: venta.cantidad_galones,
        cantidadLitros: venta.cantidad_litros,
        precioUnitario: venta.precio_unitario || venta.precio_por_galon,
        precioPorGalon: venta.precio_por_galon,
        valorTotal: venta.valor_total,
        metodoPago: venta.metodo_pago,
        clienteNombre: venta.cliente_nombre,
        clienteDocumento: venta.cliente_documento,
        placaVehiculo: venta.placa_vehiculo,
        turnoId: venta.turno_id,
        fechaHora: venta.fecha_venta || venta.fecha_hora,
        fechaCreacion: venta.fecha_creacion,
        fechaActualizacion: venta.fecha_actualizacion
      }))
      dispatch({ type: ACTIONS.SET_VENTAS, payload: ventasTransformadas })
    } else {
      dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
    }
  }

  const cargarTurnos = async () => {
    const resultado = await turnosService.obtenerTodos()
    if (resultado.success) {
      dispatch({ type: ACTIONS.SET_TURNOS, payload: resultado.data })
    } else {
      dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
    }
  }

  const cargarUsuarios = async () => {
    const resultado = await usuariosService.obtenerTodos()
    if (resultado.success) {
      dispatch({ type: ACTIONS.SET_USUARIOS, payload: resultado.data })
    } else {
      dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
    }
  }

  const cargarConfiguracion = async () => {
    const resultado = await configuracionService.obtener('precios_base')
    if (resultado.success) {
      dispatch({ type: ACTIONS.SET_CONFIGURACION, payload: { precios: resultado.data } })
    }
  }

  // Cargar todos los datos al inicializar
  const cargarDatosIniciales = async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true })
    try {
      await Promise.all([
        cargarSurtidores(),
        cargarVentas(),
        cargarTurnos(),
        cargarUsuarios(),
        cargarConfiguracion()
      ])
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: 'Error al cargar datos iniciales' })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatosIniciales()
  }, [])

  // Funciones para surtidores
  const iniciarVenta = async (surtidorId) => {
    // Actualización optimista
    dispatch({ type: ACTIONS.INICIAR_VENTA, payload: { surtidorId } })
    
    // Sincronizar con Supabase
    const resultado = await surtidoresService.actualizarEstado(surtidorId, 'ocupado')
    if (!resultado.success) {
      // Revertir si hay error
      dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
      cargarSurtidores() // Recargar estado real
    }
  }

  const finalizarVenta = async (surtidorId, combustible, cantidad, precioUnitario, total) => {
    // Actualización optimista
    dispatch({
      type: ACTIONS.FINALIZAR_VENTA,
      payload: { surtidorId, combustible, cantidad, precioUnitario, total }
    })

    // Preparar datos para Supabase
    const ventaData = {
      surtidorId,
      surtidorNombre: state.surtidores.find(s => s.id === surtidorId)?.nombre,
      tipoCombustible: combustible,
      cantidad: parseFloat(cantidad),
      precioUnitario: parseFloat(precioUnitario),
      valorTotal: parseFloat(total),
      bomberoId: state.usuarioActual?.id,
      bomberoNombre: state.usuarioActual?.nombre,
      turnoId: state.turnos.find(t => t.bombero_id === state.usuarioActual?.id && t.activo)?.id
    }

    // Sincronizar con Supabase
    const resultado = await ventasService.crear(ventaData)
    if (resultado.success) {
      // Actualizar estado del surtidor a disponible
      await surtidoresService.actualizarEstado(surtidorId, 'disponible')
      // Recargar datos para estar sincronizado
      cargarSurtidores()
      cargarVentas()
    } else {
      dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
      // Recargar datos para revertir cambios optimistas
      cargarSurtidores()
      cargarVentas()
    }
  }

  const actualizarPrecios = async (precios) => {
    // Actualización optimista
    dispatch({ type: ACTIONS.ACTUALIZAR_PRECIOS, payload: precios })
    
    // Sincronizar con Supabase
    const resultado = await surtidoresService.actualizarPrecios(precios)
    if (resultado.success) {
      // Actualizar configuración
      await configuracionService.actualizar('precios_base', precios)
      cargarConfiguracion()
      cargarSurtidores()
    } else {
      dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
      cargarSurtidores()
      cargarConfiguracion()
    }
  }

  const actualizarStock = async (surtidorId, combustible, nuevoStock) => {
    // Actualización optimista
    dispatch({ type: ACTIONS.ACTUALIZAR_STOCK, payload: { surtidorId, combustible, nuevoStock } })
    
    // Sincronizar con Supabase
    const resultado = await surtidoresService.actualizarStock(surtidorId, combustible, nuevoStock)
    if (!resultado.success) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
      cargarSurtidores()
    }
  }

  const cambiarEstadoSurtidor = async (surtidorId, nuevoEstado) => {
    // Actualización optimista
    dispatch({ type: ACTIONS.CAMBIAR_ESTADO_SURTIDOR, payload: { surtidorId, nuevoEstado } })
    
    // Sincronizar con Supabase
    const resultado = await surtidoresService.actualizarEstado(surtidorId, nuevoEstado)
    if (!resultado.success) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
      cargarSurtidores()
    }
  }

  // Funciones para usuarios
  const login = async (username, password) => {
    const resultado = await usuariosService.login(username, password)
    
    if (resultado.success) {
      dispatch({ type: ACTIONS.LOGIN, payload: resultado.data })
      
      // Si es bombero, iniciar turno automáticamente
      if (resultado.data.rol === 'bombero') {
        const turnoActivo = await turnosService.obtenerActivo(resultado.data.id)
        
        // Solo iniciar turno si no tiene uno activo
        if (!turnoActivo.data) {
          await iniciarTurno(resultado.data.id, resultado.data.nombre)
        }
      }
      
      return { success: true, usuario: resultado.data }
    }
    
    return resultado
  }

  const logout = async () => {
    // Si es bombero, finalizar turno automáticamente
    if (state.usuarioActual && state.usuarioActual.rol === 'bombero') {
      const turnoActivo = state.turnos.find(turno => 
        turno.bombero_id === state.usuarioActual.id && turno.activo
      )
      
      if (turnoActivo) {
        await finalizarTurno(turnoActivo.id)
      }
    }
    
    dispatch({ type: ACTIONS.LOGOUT })
  }

  // Funciones para usuarios (CRUD)
  const crearUsuario = async (usuarioData) => {
    const resultado = await usuariosService.crear(usuarioData)
    if (resultado.success) {
      cargarUsuarios()
      return resultado
    } else {
      dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
      return resultado
    }
  }

  const actualizarUsuario = async (id, usuarioData) => {
    const resultado = await usuariosService.actualizar(id, usuarioData)
    if (resultado.success) {
      cargarUsuarios()
      return resultado
    } else {
      dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
      return resultado
    }
  }

  const eliminarUsuario = async (usuarioId) => {
    const resultado = await usuariosService.eliminar(usuarioId)
    if (resultado.success) {
      cargarUsuarios()
      return resultado
    } else {
      dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
      return resultado
    }
  }

  // Funciones para turnos
  const iniciarTurno = async (bomberoId, bomberoNombre) => {
    const resultado = await turnosService.iniciar(bomberoId, bomberoNombre)
    if (resultado.success) {
      cargarTurnos()
      return resultado
    } else {
      dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
      return resultado
    }
  }

  const finalizarTurno = async (turnoId) => {
    const resultado = await turnosService.finalizar(turnoId)
    if (resultado.success) {
      cargarTurnos()
      return resultado
    } else {
      dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
      return resultado
    }
  }

  // Funciones para ventas
  const actualizarVenta = async (id, ventaData) => {
    const resultado = await ventasService.actualizar(id, ventaData)
    if (resultado.success) {
      cargarVentas()
      return resultado
    } else {
      dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
      return resultado
    }
  }

  const eliminarVenta = async (id) => {
    const resultado = await ventasService.eliminar(id)
    if (resultado.success) {
      cargarVentas()
      return resultado
    } else {
      dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
      return resultado
    }
  }

  // Función de verificación de permisos (igual que antes)
  const tienePermiso = (permiso) => {
    if (!state.usuarioActual) return false
    
    const permisos = {
      super_admin: ['todos'],
      administrador: ['gestionar_surtidores', 'gestionar_ventas', 'gestionar_turnos', 'ver_reportes', 'ver_ventas', 'gestionar_precios', 'gestionar_inventario'],
      bombero: ['registrar_ventas', 'gestionar_turno_propio']
    }
    
    const permisosUsuario = permisos[state.usuarioActual.rol] || []
    return permisosUsuario.includes('todos') || permisosUsuario.includes(permiso)
  }

  // Función para limpiar errores
  const limpiarError = () => {
    dispatch({ type: ACTIONS.SET_ERROR, payload: null })
  }

  const value = {
    // Estado
    surtidores: state.surtidores,
    ventas: state.ventas,
    configuracion: state.configuracion,
    usuarios: state.usuarios,
    turnos: state.turnos,
    usuarioActual: state.usuarioActual,
    loading: state.loading,
    error: state.error,
    
    // Funciones para surtidores
    iniciarVenta,
    finalizarVenta,
    actualizarPrecios,
    actualizarStock,
    cambiarEstadoSurtidor,
    
    // Funciones para usuarios
    login,
    logout,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    
    // Funciones para turnos
    iniciarTurno,
    finalizarTurno,
    
    // Funciones para ventas
    actualizarVenta,
    eliminarVenta,
    
    // Funciones de utilidad
    tienePermiso,
    limpiarError,
    cargarDatosIniciales,
    
    // Funciones de recarga
    cargarSurtidores,
    cargarVentas,
    cargarTurnos,
    cargarUsuarios,
    cargarConfiguracion
  }

  return (
    <SupabaseGasStationContext.Provider value={value}>
      {children}
    </SupabaseGasStationContext.Provider>
  )
}

// Hook personalizado
export function useSupabaseGasStation() {
  const context = useContext(SupabaseGasStationContext)
  if (!context) {
    throw new Error('useSupabaseGasStation debe ser usado dentro de un SupabaseGasStationProvider')
  }
  return context
}
