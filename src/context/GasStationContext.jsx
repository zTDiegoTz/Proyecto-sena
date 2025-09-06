import React, { createContext, useContext, useReducer, useEffect } from 'react'

// Estado inicial expandido
const initialState = {
  // Surtidores (sin cambios)
  surtidores: [
    {
      id: 1,
      nombre: "Surtidor 1",
      estado: "disponible",
      combustibles: {
        extra: { precio: 3.50, stock: 1000, vendido: 0 },
        corriente: { precio: 3.20, stock: 1000, vendido: 0 },
        acpm: { precio: 2.80, stock: 1000, vendido: 0 }
      }
    },
    {
      id: 2,
      nombre: "Surtidor 2",
      estado: "disponible",
      combustibles: {
        extra: { precio: 3.50, stock: 1000, vendido: 0 },
        corriente: { precio: 3.20, stock: 1000, vendido: 0 },
        acpm: { precio: 2.80, stock: 1000, vendido: 0 }
      }
    },
    {
      id: 3,
      nombre: "Surtidor 3",
      estado: "disponible",
      combustibles: {
        extra: { precio: 3.50, stock: 1000, vendido: 0 },
        corriente: { precio: 3.20, stock: 1000, vendido: 0 },
        acpm: { precio: 2.80, stock: 1000, vendido: 0 }
      }
    },
    {
      id: 4,
      nombre: "Surtidor 4",
      estado: "disponible",
      combustibles: {
        extra: { precio: 3.50, stock: 1000, vendido: 0 },
        corriente: { precio: 3.20, stock: 1000, vendido: 0 },
        acpm: { precio: 2.80, stock: 1000, vendido: 0 }
      }
    },
    {
      id: 5,
      nombre: "Surtidor 5",
      estado: "disponible",
      combustibles: {
        extra: { precio: 3.50, stock: 1000, vendido: 0 },
        corriente: { precio: 3.20, stock: 1000, vendido: 0 },
        acpm: { precio: 2.80, stock: 1000, vendido: 0 }
      }
    },
    {
      id: 6,
      nombre: "Surtidor 6",
      estado: "disponible",
      combustibles: {
        extra: { precio: 3.50, stock: 1000, vendido: 0 },
        corriente: { precio: 3.20, stock: 1000, vendido: 0 },
        acpm: { precio: 2.80, stock: 1000, vendido: 0 }
      }
    }
  ],
  
  // Ventas mejoradas con todos los campos solicitados
  ventas: [],
  
  // Configuración de precios
  configuracion: {
    precios: {
      extra: 3.50,
      corriente: 3.20,
      acpm: 2.80
    }
  },

  // Sistema de usuarios
  usuarios: [
    {
      id: 1,
      username: "admin",
      password: "admin123", // En producción usar hash
      nombre: "Administrador Principal",
      email: "admin@estacion.com",
      rol: "super_admin",
      activo: true,
      fechaCreacion: new Date().toISOString()
    },
    {
      id: 2,
      username: "gerente",
      password: "gerente123",
      nombre: "Gerente de Estación",
      email: "gerente@estacion.com",
      rol: "administrador",
      activo: true,
      fechaCreacion: new Date().toISOString()
    },
    {
      id: 3,
      username: "bombero1",
      password: "bombero123",
      nombre: "Juan Pérez",
      email: "juan@estacion.com",
      rol: "bombero",
      activo: true,
      fechaCreacion: new Date().toISOString()
    }
  ],

  // Control de turnos
  turnos: [],

  // Usuario actual (sesión)
  usuarioActual: null
}

// Acciones expandidas
const ACTIONS = {
  // Acciones existentes
  INICIAR_VENTA: 'INICIAR_VENTA',
  FINALIZAR_VENTA: 'FINALIZAR_VENTA',
  ACTUALIZAR_PRECIOS: 'ACTUALIZAR_PRECIOS',
  ACTUALIZAR_STOCK: 'ACTUALIZAR_STOCK',
  CAMBIAR_ESTADO_SURTIDOR: 'CAMBIAR_ESTADO_SURTIDOR',
  CARGAR_DATOS: 'CARGAR_DATOS',
  
  // Nuevas acciones para usuarios
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CREAR_USUARIO: 'CREAR_USUARIO',
  ACTUALIZAR_USUARIO: 'ACTUALIZAR_USUARIO',
  ELIMINAR_USUARIO: 'ELIMINAR_USUARIO',
  
  // Acciones para turnos
  INICIAR_TURNO: 'INICIAR_TURNO',
  FINALIZAR_TURNO: 'FINALIZAR_TURNO',
  ACTUALIZAR_TURNO: 'ACTUALIZAR_TURNO'
}

// Reducer expandido
function gasStationReducer(state, action) {
  switch (action.type) {
    // Acciones existentes
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
        id: Date.now(),
        surtidorId,
        surtidorNombre: state.surtidores.find(s => s.id === surtidorId)?.nombre,
        tipoCombustible: combustible,
        cantidad: parseFloat(cantidad),
        precioUnitario: parseFloat(precioUnitario),
        valorTotal: parseFloat(total),
        fechaHora: new Date().toISOString(),
        bomberoId: state.usuarioActual?.id,
        bomberoNombre: state.usuarioActual?.nombre
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
        ventas: [...state.ventas, nuevaVenta]
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

    case ACTIONS.CAMBIAR_ESTADO_SURTIDOR:
      return {
        ...state,
        surtidores: state.surtidores.map(surtidor =>
          surtidor.id === action.payload.surtidorId
            ? { ...surtidor, estado: action.payload.nuevoEstado }
            : surtidor
        )
      }

    // Nuevas acciones para usuarios
    case ACTIONS.LOGIN:
      return {
        ...state,
        usuarioActual: action.payload
      }

    case ACTIONS.LOGOUT:
      return {
        ...state,
        usuarioActual: null
      }

    case ACTIONS.CREAR_USUARIO:
      const nuevoUsuario = {
        id: Date.now(),
        ...action.payload,
        activo: true,
        fechaCreacion: new Date().toISOString()
      }
      return {
        ...state,
        usuarios: [...state.usuarios, nuevoUsuario]
      }

    case ACTIONS.ACTUALIZAR_USUARIO:
      return {
        ...state,
        usuarios: state.usuarios.map(usuario =>
          usuario.id === action.payload.id
            ? { ...usuario, ...action.payload }
            : usuario
        )
      }

    case ACTIONS.ELIMINAR_USUARIO:
      return {
        ...state,
        usuarios: state.usuarios.filter(usuario => usuario.id !== action.payload)
      }

    // Acciones para turnos
    case ACTIONS.INICIAR_TURNO:
      const nuevoTurno = {
        id: Date.now(),
        bomberoId: action.payload.bomberoId,
        bomberoNombre: action.payload.bomberoNombre,
        horaEntrada: new Date().toISOString(),
        horaSalida: null,
        activo: true
      }
      return {
        ...state,
        turnos: [...state.turnos, nuevoTurno]
      }

    case ACTIONS.FINALIZAR_TURNO:
      return {
        ...state,
        turnos: state.turnos.map(turno =>
          turno.id === action.payload
            ? {
                ...turno,
                horaSalida: new Date().toISOString(),
                activo: false
              }
            : turno
        )
      }

    case ACTIONS.ACTUALIZAR_TURNO:
      return {
        ...state,
        turnos: state.turnos.map(turno =>
          turno.id === action.payload.id
            ? { ...turno, ...action.payload }
            : turno
        )
      }

    case ACTIONS.CARGAR_DATOS:
      return {
        ...state,
        ...action.payload
      }

    default:
      return state
  }
}

// Contexto
const GasStationContext = createContext()

// Provider
export function GasStationProvider({ children }) {
  const [state, dispatch] = useReducer(gasStationReducer, initialState)

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const datosGuardados = localStorage.getItem('gasStationData')
    if (datosGuardados) {
      try {
        const datos = JSON.parse(datosGuardados)
        dispatch({ type: ACTIONS.CARGAR_DATOS, payload: datos })
      } catch (error) {
        console.error('Error al cargar datos:', error)
      }
    }
  }, [])

  // Guardar datos en localStorage cuando cambie el estado
  useEffect(() => {
    localStorage.setItem('gasStationData', JSON.stringify(state))
  }, [state])

  // Funciones para surtidores
  const iniciarVenta = (surtidorId) => {
    dispatch({ type: ACTIONS.INICIAR_VENTA, payload: { surtidorId } })
  }

  const finalizarVenta = (surtidorId, combustible, cantidad, precioUnitario, total) => {
    dispatch({
      type: ACTIONS.FINALIZAR_VENTA,
      payload: { surtidorId, combustible, cantidad, precioUnitario, total }
    })
  }

  const actualizarPrecios = (precios) => {
    dispatch({ type: ACTIONS.ACTUALIZAR_PRECIOS, payload: precios })
  }

  const actualizarStock = (surtidorId, combustible, nuevoStock) => {
    dispatch({ type: ACTIONS.ACTUALIZAR_STOCK, payload: { surtidorId, combustible, nuevoStock } })
  }

  const cambiarEstadoSurtidor = (surtidorId, nuevoEstado) => {
    dispatch({ type: ACTIONS.CAMBIAR_ESTADO_SURTIDOR, payload: { surtidorId, nuevoEstado } })
  }

  // Funciones para usuarios
  const login = (username, password) => {
    const usuario = state.usuarios.find(u => 
      u.username === username && u.password === password && u.activo
    )
    if (usuario) {
      dispatch({ type: ACTIONS.LOGIN, payload: usuario })
      return { success: true, usuario }
    }
    return { success: false, message: 'Credenciales inválidas' }
  }

  const logout = () => {
    dispatch({ type: ACTIONS.LOGOUT })
  }

  const crearUsuario = (usuarioData) => {
    dispatch({ type: ACTIONS.CREAR_USUARIO, payload: usuarioData })
  }

  const actualizarUsuario = (usuarioData) => {
    dispatch({ type: ACTIONS.ACTUALIZAR_USUARIO, payload: usuarioData })
  }

  const eliminarUsuario = (usuarioId) => {
    dispatch({ type: ACTIONS.ELIMINAR_USUARIO, payload: usuarioId })
  }

  // Funciones para turnos
  const iniciarTurno = (bomberoId, bomberoNombre) => {
    dispatch({ type: ACTIONS.INICIAR_TURNO, payload: { bomberoId, bomberoNombre } })
  }

  const finalizarTurno = (turnoId) => {
    dispatch({ type: ACTIONS.FINALIZAR_TURNO, payload: turnoId })
  }

  const actualizarTurno = (turnoData) => {
    dispatch({ type: ACTIONS.ACTUALIZAR_TURNO, payload: turnoData })
  }

  // Funciones de verificación de permisos
  const tienePermiso = (permiso) => {
    if (!state.usuarioActual) return false
    
    const permisos = {
      super_admin: ['todos'],
      administrador: ['gestionar_surtidores', 'gestionar_ventas', 'gestionar_turnos', 'ver_reportes', 'ver_ventas', 'gestionar_precios'],
      bombero: ['registrar_ventas', 'gestionar_turno_propio']
    }
    
    const permisosUsuario = permisos[state.usuarioActual.rol] || []
    return permisosUsuario.includes('todos') || permisosUsuario.includes(permiso)
  }

  const value = {
    // Estado
    surtidores: state.surtidores,
    ventas: state.ventas,
    configuracion: state.configuracion,
    usuarios: state.usuarios,
    turnos: state.turnos,
    usuarioActual: state.usuarioActual,
    
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
    actualizarTurno,
    
    // Funciones de permisos
    tienePermiso
  }

  return (
    <GasStationContext.Provider value={value}>
      {children}
    </GasStationContext.Provider>
  )
}

// Hook personalizado
export function useGasStation() {
  const context = useContext(GasStationContext)
  if (!context) {
    throw new Error('useGasStation debe ser usado dentro de un GasStationProvider')
  }
  return context
}
