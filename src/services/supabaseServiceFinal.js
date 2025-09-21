import { supabase, handleSupabaseError } from '../lib/supabase'

// ==================== SERVICIOS DE USUARIOS ====================

export const usuariosService = {
  // Obtener todos los usuarios
  async obtenerTodos() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('fecha_creacion', { ascending: false })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Crear usuario
  async crear(usuario) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: usuario.username,
          password_hash: usuario.password, // En producción, hash la contraseña
          name: usuario.nombre || usuario.name,
          role: usuario.rol || usuario.role,
          email: usuario.email
        }])
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Actualizar usuario
  async actualizar(id, usuario) {
    try {
      const updateData = {}
      if (usuario.name || usuario.nombre) updateData.name = usuario.name || usuario.nombre
      if (usuario.role || usuario.rol) updateData.role = usuario.role || usuario.rol
      if (usuario.username) updateData.username = usuario.username
      if (usuario.email) updateData.email = usuario.email
      if (usuario.password) updateData.password_hash = usuario.password
      if (usuario.activo !== undefined) updateData.activo = usuario.activo

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Eliminar usuario (desactivar)
  async eliminar(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ activo: false })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Login
  async login(username, password) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password) // En producción, compara hash
        .eq('activo', true)
        .single()
      
      if (error) {
        return { success: false, message: 'Credenciales inválidas' }
      }
      
      return { success: true, data }
    } catch (error) {
      return { success: false, message: 'Error al iniciar sesión' }
    }
  }
}

// ==================== SERVICIOS DE VENTAS ====================

export const ventasService = {
  // Crear nueva venta
  async crear(venta) {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .insert([{
          surtidor_id: venta.surtidor_id,
          surtidor_nombre: venta.surtidor_nombre,
          bombero_id: venta.bombero_id,
          bombero_nombre: venta.bombero_nombre,
          tipo_combustible: venta.tipo_combustible,
          cantidad: venta.cantidad_litros, // Usar cantidad_litros para la columna cantidad
          cantidad_galones: venta.cantidad_galones,
          cantidad_litros: venta.cantidad_litros,
          precio_por_galon: venta.precio_por_galon,
          valor_total: venta.total,
          metodo_pago: venta.metodo_pago,
          cliente_nombre: venta.cliente_nombre,
          cliente_documento: venta.cliente_documento,
          placa_vehiculo: venta.placa_vehiculo,
          fecha_venta: venta.fecha_venta || new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Obtener todas las ventas
  async obtenerTodos() {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .order('fecha_venta', { ascending: false })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Obtener ventas por bombero
  async obtenerPorBombero(bomberoId) {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .eq('bombero_id', bomberoId)
        .order('fecha_venta', { ascending: false })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Obtener ventas por fecha
  async obtenerPorFecha(fechaInicio, fechaFin) {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .gte('fecha_venta', fechaInicio)
        .lte('fecha_venta', fechaFin)
        .order('fecha_venta', { ascending: false })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Obtener estadísticas de ventas del día
  async obtenerEstadisticasDelDia() {
    try {
      const hoy = new Date()
      const inicioDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).toISOString()
      const finDelDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1).toISOString()

      const { data, error } = await supabase
        .from('ventas')
        .select('total, cantidad')
        .gte('fecha_venta', inicioDelDia)
        .lt('fecha_venta', finDelDia)
      
      if (error) throw error

      const totalVentas = data.reduce((sum, venta) => sum + venta.total, 0)
      const totalLitros = data.reduce((sum, venta) => sum + venta.cantidad, 0)
      const numeroTransacciones = data.length

      return { 
        success: true, 
        data: {
          totalVentas,
          totalLitros,
          numeroTransacciones,
          ventasDelDia: data
        }
      }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}

// ==================== SERVICIOS DE SURTIDORES ====================

export const surtidoresService = {
  // Obtener todos los surtidores con combustibles
  async obtenerTodos() {
    try {
      const { data, error } = await supabase
        .from('surtidores')
        .select(`
          *,
          combustibles_surtidor (
            tipo_combustible,
            precio,
            stock,
            vendido
          )
        `)
        .order('id')
      
      if (error) throw error
      
      // Transformar los datos al formato esperado por la aplicación
      const surtidoresFormateados = data.map(surtidor => ({
        id: surtidor.id,
        nombre: surtidor.nombre,
        estado: surtidor.estado,
        combustibles: surtidor.combustibles_surtidor.reduce((acc, combustible) => {
          acc[combustible.tipo_combustible] = {
            precio: parseFloat(combustible.precio),
            stock: parseFloat(combustible.stock),
            vendido: parseFloat(combustible.vendido)
          }
          return acc
        }, {})
      }))
      
      return { success: true, data: surtidoresFormateados }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Actualizar estado de surtidor
  async actualizarEstado(id, estado) {
    try {
      const { data, error } = await supabase
        .from('surtidores')
        .update({ estado })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Actualizar stock de combustible (reducir por venta)
  async actualizarStock(surtidorId, tipoCombustible, cantidadVendida) {
    try {
      // Usar la función PostgreSQL para actualizar stock y vendido
      const { data, error } = await supabase.rpc('actualizar_stock_venta', {
        p_surtidor_id: surtidorId,
        p_tipo_combustible: tipoCombustible,
        p_cantidad: cantidadVendida
      })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Establecer stock específico de combustible
  async establecerStock(surtidorId, tipoCombustible, nuevoStock) {
    try {
      const { data, error } = await supabase
        .from('combustibles_surtidor')
        .update({ stock: nuevoStock })
        .eq('surtidor_id', surtidorId)
        .eq('tipo_combustible', tipoCombustible)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Actualizar precios
  async actualizarPrecios(precios) {
    try {
      const updates = []
      
      for (const [tipoCombustible, precio] of Object.entries(precios)) {
        const { data, error } = await supabase
          .from('combustibles_surtidor')
          .update({ precio })
          .eq('tipo_combustible', tipoCombustible)
        
        if (error) throw error
        updates.push(data)
      }
      
      return { success: true, data: updates }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}


// ==================== SERVICIOS DE TURNOS ====================

export const turnosService = {
  // Obtener todos los turnos
  async obtenerTodos() {
    try {
      const { data, error } = await supabase
        .from('turnos')
        .select('*')
        .order('hora_entrada', { ascending: false })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Iniciar turno
  async iniciar(bomberoId, bomberoNombre) {
    try {
      const { data, error } = await supabase
        .from('turnos')
        .insert([{
          bombero_id: bomberoId,
          bombero_nombre: bomberoNombre,
          hora_entrada: new Date().toISOString(),
          activo: true
        }])
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Finalizar turno
  async finalizar(turnoId) {
    try {
      const { data, error } = await supabase
        .from('turnos')
        .update({
          hora_salida: new Date().toISOString(),
          activo: false
        })
        .eq('id', turnoId)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Obtener turno activo de un bombero
  async obtenerActivo(bomberoId) {
    try {
      const { data, error } = await supabase
        .from('turnos')
        .select('*')
        .eq('bombero_id', bomberoId)
        .eq('activo', true)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}

// ==================== SERVICIOS DE CONFIGURACIÓN ====================

export const configuracionService = {
  // Obtener configuración
  async obtener(clave) {
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .select('valor')
        .eq('clave', clave)
        .single()
      
      if (error) throw error
      return { success: true, data: data.valor }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Actualizar configuración
  async actualizar(clave, valor) {
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .upsert({
          clave,
          valor,
          fecha_actualizacion: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}
