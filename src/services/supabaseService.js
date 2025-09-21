import { supabase, handleSupabaseError } from '../lib/supabase'

// ==================== SERVICIOS DE USUARIOS ====================

export const usuariosService = {
  // Obtener todos los usuarios
  async obtenerTodos() {
    try {
      const { data, error } = await supabase
        .from('usuarios')
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
        .from('usuarios')
        .insert([{
          username: usuario.username,
          password_hash: usuario.password, // En producción, hash la contraseña
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol
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
      const { data, error } = await supabase
        .from('usuarios')
        .update(usuario)
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
        .from('usuarios')
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
        .from('usuarios')
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

  // Actualizar stock de combustible
  async actualizarStock(surtidorId, tipoCombustible, nuevoStock) {
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

// ==================== SERVICIOS DE VENTAS ====================

export const ventasService = {
  // Obtener todas las ventas
  async obtenerTodas() {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .select('*')
        .order('fecha_hora', { ascending: false })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Registrar nueva venta
  async registrar(venta) {
    try {
      // Iniciar transacción para actualizar stock y registrar venta
      const { data: ventaData, error: ventaError } = await supabase
        .from('ventas')
        .insert([{
          surtidor_id: venta.surtidorId,
          surtidor_nombre: venta.surtidorNombre,
          tipo_combustible: venta.tipoCombustible,
          cantidad: venta.cantidad,
          precio_unitario: venta.precioUnitario,
          valor_total: venta.valorTotal,
          bombero_id: venta.bomberoId,
          bombero_nombre: venta.bomberoNombre,
          turno_id: venta.turnoId
        }])
        .select()
        .single()
      
      if (ventaError) throw ventaError

      // Actualizar stock y vendido
      const { error: stockError } = await supabase.rpc('actualizar_stock_venta', {
        p_surtidor_id: venta.surtidorId,
        p_tipo_combustible: venta.tipoCombustible,
        p_cantidad: venta.cantidad
      })
      
      if (stockError) {
        // Si hay error al actualizar stock, podríamos revertir la venta
        console.error('Error al actualizar stock:', stockError)
      }
      
      return { success: true, data: ventaData }
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
