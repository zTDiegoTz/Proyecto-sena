import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { 
  usuariosService, 
  surtidoresService, 
  ventasService, 
  turnosService, 
  configuracionService 
} from '../services/supabaseServiceFinal'
import { ventasServiceClean } from '../services/ventasServiceClean'

// Función para obtener el estado inicial desde localStorage
const getInitialState = () => {
  try {
    const savedUser = localStorage.getItem('gasStation_user')
    const usuarioActual = savedUser ? JSON.parse(savedUser) : null
    
    return {
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
      usuarioActual,
      loading: false,
      error: null
    }
  } catch (error) {
    console.error('Error al cargar estado desde localStorage:', error)
    return {
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
  }
}

// Estado inicial
const initialState = getInitialState()

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
  
  // Gestión de surtidores
  CREAR_SURTIDOR: 'CREAR_SURTIDOR',
  EDITAR_SURTIDOR: 'EDITAR_SURTIDOR',
  ELIMINAR_SURTIDOR: 'ELIMINAR_SURTIDOR',
  CONFIGURAR_COMBUSTIBLES: 'CONFIGURAR_COMBUSTIBLES',
  
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
      // Guardar usuario en localStorage
      try {
        localStorage.setItem('gasStation_user', JSON.stringify(action.payload))
      } catch (error) {
        console.error('Error al guardar usuario en localStorage:', error)
      }
      return { ...state, usuarioActual: action.payload }
    
    case ACTIONS.LOGOUT:
      // Limpiar localStorage
      try {
        localStorage.removeItem('gasStation_user')
      } catch (error) {
        console.error('Error al limpiar localStorage:', error)
      }
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
        bombero_nombre: state.usuarioActual?.name
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
    
    case ACTIONS.CREAR_SURTIDOR:
      return {
        ...state,
        surtidores: [...state.surtidores, action.payload]
      }
    
    case ACTIONS.EDITAR_SURTIDOR:
      return {
        ...state,
        surtidores: state.surtidores.map(surtidor =>
          surtidor.id === action.payload.id
            ? { ...surtidor, ...action.payload }
            : surtidor
        )
      }
    
    case ACTIONS.ELIMINAR_SURTIDOR:
      return {
        ...state,
        surtidores: state.surtidores.filter(surtidor => surtidor.id !== action.payload)
      }
    
    case ACTIONS.CONFIGURAR_COMBUSTIBLES:
      const { surtidorId: configSurtId, combustibles: configComb } = action.payload
      return {
        ...state,
        surtidores: state.surtidores.map(surtidor =>
          surtidor.id === configSurtId
            ? { ...surtidor, combustibles: configComb }
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
    try {
      // Intentar cargar desde configuracion_combustibles (nueva estructura)
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        'https://adbzfiepkxtyqudwfysk.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'
      )
      
      const { data: combustibles, error } = await supabase
        .from('configuracion_combustibles')
        .select('tipo_combustible, precio_por_litro')
        .eq('activo', true)
      
      if (!error && combustibles && combustibles.length > 0) {
        // Convertir a formato esperado por el frontend
        const precios = combustibles.reduce((acc, combustible) => {
          acc[combustible.tipo_combustible] = combustible.precio_por_litro
          return acc
        }, {})
        
        dispatch({ type: ACTIONS.SET_CONFIGURACION, payload: { precios } })
      } else {
        // Fallback: usar valores por defecto
        const preciosDefecto = {
          extra: 12500,
          corriente: 11500,
          acpm: 10500
        }
        dispatch({ type: ACTIONS.SET_CONFIGURACION, payload: { precios: preciosDefecto } })
      }
    } catch (error) {
      console.error('Error cargando configuración:', error)
      // Usar valores por defecto en caso de error
      const preciosDefecto = {
        extra: 12500,
        corriente: 11500,
        acpm: 10500
      }
      dispatch({ type: ACTIONS.SET_CONFIGURACION, payload: { precios: preciosDefecto } })
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

  // Verificar sesión persistente al cargar
  useEffect(() => {
    const verificarSesion = async () => {
      if (state.usuarioActual) {
        // Si hay un usuario guardado, verificar que sigue siendo válido
        try {
          const resultado = await usuariosService.obtenerTodos()
          if (resultado.success) {
            const usuarioValido = resultado.data.find(u => u.id === state.usuarioActual.id)
            if (!usuarioValido || !usuarioValido.activo) {
              // Usuario no válido o inactivo, cerrar sesión
              dispatch({ type: ACTIONS.LOGOUT })
            }
          }
        } catch (error) {
          console.error('Error verificando sesión:', error)
          // En caso de error de conexión, mantener la sesión local
        }
      }
    }

    verificarSesion()
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
    try {
      // Actualización optimista
      dispatch({
        type: ACTIONS.FINALIZAR_VENTA,
        payload: { surtidorId, combustible, cantidad, precioUnitario, total }
      })

      // Preparar datos para Supabase (formato correcto)
      const cantidadLitros = parseFloat(cantidad) * 3.78541; // Convertir galones a litros
      const ventaData = {
        surtidor_id: surtidorId,
        surtidor_nombre: state.surtidores.find(s => s.id === surtidorId)?.nombre,
        tipo_combustible: combustible,
        cantidad_galones: parseFloat(cantidad),
        cantidad: cantidadLitros,
        precio_por_galon: parseFloat(precioUnitario),
        valor_total: parseFloat(total),
        bombero_id: state.usuarioActual?.id,
        bombero_nombre: state.usuarioActual?.name || state.usuarioActual?.nombre,
        turno_id: state.turnos.find(t => t.bombero_id === state.usuarioActual?.id && t.estado === 'activo')?.id,
        precio_unitario: cantidadLitros > 0 ? parseFloat((parseFloat(total) / cantidadLitros).toFixed(2)) : 0
      }

      // Sincronizar con Supabase usando el servicio correcto
      const resultado = await ventasServiceClean.crear(ventaData)
      if (resultado.success) {
        // Actualizar estado del surtidor a disponible
        await surtidoresService.actualizarEstado(surtidorId, 'disponible')
        // Recargar datos para estar sincronizado
        cargarSurtidores()
        cargarVentas()
        return { success: true, data: resultado.data }
      } else {
        dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
        // Recargar datos para revertir cambios optimistas
        cargarSurtidores()
        cargarVentas()
        return { success: false, error: resultado.message }
      }
    } catch (error) {
      console.error('Error en finalizarVenta:', error)
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
      // Recargar datos para revertir cambios optimistas
      cargarSurtidores()
      cargarVentas()
      return { success: false, error: error.message }
    }
  }

  const actualizarPrecios = async (precios) => {
    try {
      // Actualización optimista
      dispatch({ type: ACTIONS.ACTUALIZAR_PRECIOS, payload: precios })
      
      // Actualizar en configuracion_combustibles (nueva estructura)
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        'https://adbzfiepkxtyqudwfysk.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'
      )

      // Actualizar cada precio en configuracion_combustibles
      for (const [tipo, precio] of Object.entries(precios)) {
        const { error } = await supabase
          .from('configuracion_combustibles')
          .update({ 
            precio_por_litro: precio,
            fecha_actualizacion: new Date().toISOString()
          })
          .eq('tipo_combustible', tipo)
        
        if (error) {
          throw new Error(`Error actualizando ${tipo}: ${error.message}`)
        }
      }

      // También actualizar en combustibles_surtidor para mantener compatibilidad
      await surtidoresService.actualizarPrecios(precios)

      // Recargar datos
      cargarConfiguracion()
      cargarSurtidores()
    } catch (error) {
      console.error('Error actualizando precios:', error)
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
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
      if (resultado.data.role === 'bombero') {
        const turnoActivo = await turnosService.obtenerActivo(resultado.data.id)
        
        // Solo iniciar turno si no tiene uno activo
        if (!turnoActivo.data) {
          await iniciarTurno(resultado.data.id, resultado.data.name)
        }
      }
      
      return { success: true, usuario: resultado.data }
    }
    
    return resultado
  }

  const logout = async () => {
    // Si es bombero, finalizar turno automáticamente
    if (state.usuarioActual && state.usuarioActual.role === 'bombero') {
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

  // Funciones para gestión completa de surtidores
  const crearSurtidor = async (surtidorData) => {
    try {
      // Obtener precios globales para configurar combustibles
      const preciosResultado = await surtidoresService.obtenerPreciosGlobales()
      const precios = preciosResultado.success ? preciosResultado.data : {
        extra: 10000,
        corriente: 9500,
        acpm: 8500
      }

      // Crear el surtidor
      const resultado = await surtidoresService.crear(surtidorData)
      if (!resultado.success) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
        return resultado
      }

      // Configurar combustibles con precios globales
      const combustibles = {
        extra: { precio: precios.extra, stock: 1000, capacidad_maxima: 2000, vendido: 0 },
        corriente: { precio: precios.corriente, stock: 1000, capacidad_maxima: 2000, vendido: 0 },
        acpm: { precio: precios.acpm, stock: 1000, capacidad_maxima: 2000, vendido: 0 }
      }

      const configResultado = await surtidoresService.configurarCombustibles(resultado.data.id, combustibles)
      if (!configResultado.success) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: configResultado.message })
        return configResultado
      }

      // Actualizar estado local
      dispatch({ 
        type: ACTIONS.CREAR_SURTIDOR, 
        payload: {
          ...resultado.data,
          combustibles
        }
      })

      // Recargar datos para sincronizar
      cargarSurtidores()
      return { success: true, data: resultado.data }
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
      return { success: false, message: error.message }
    }
  }

  const editarSurtidor = async (id, datosActualizados) => {
    try {
      const resultado = await surtidoresService.editar(id, datosActualizados)
      if (!resultado.success) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
        return resultado
      }

      // Actualización optimista
      dispatch({ type: ACTIONS.EDITAR_SURTIDOR, payload: { id, ...datosActualizados } })
      
      // Recargar datos para sincronizar
      cargarSurtidores()
      return resultado
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
      return { success: false, message: error.message }
    }
  }

  const eliminarSurtidor = async (id) => {
    try {
      const resultado = await surtidoresService.eliminar(id)
      if (!resultado.success) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
        return resultado
      }

      // Actualización optimista
      dispatch({ type: ACTIONS.ELIMINAR_SURTIDOR, payload: id })
      
      // Recargar datos para sincronizar
      cargarSurtidores()
      return resultado
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
      return { success: false, message: error.message }
    }
  }

  const configurarCombustiblesSurtidor = async (surtidorId, combustibles) => {
    try {
      const resultado = await surtidoresService.configurarCombustibles(surtidorId, combustibles)
      if (!resultado.success) {
        dispatch({ type: ACTIONS.SET_ERROR, payload: resultado.message })
        return resultado
      }

      // Actualización optimista
      dispatch({ 
        type: ACTIONS.CONFIGURAR_COMBUSTIBLES, 
        payload: { surtidorId, combustibles }
      })
      
      // Recargar datos para sincronizar
      cargarSurtidores()
      return resultado
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
      return { success: false, message: error.message }
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
    
    const permisosUsuario = permisos[state.usuarioActual.role] || []
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
    crearSurtidor,
    editarSurtidor,
    eliminarSurtidor,
    configurarCombustiblesSurtidor,
    
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
