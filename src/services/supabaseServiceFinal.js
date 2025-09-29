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
      // Preparar datos de inserción
      const userData = {
        username: usuario.username,
        password_hash: usuario.password, // En producción, hash la contraseña
        name: usuario.nombre || usuario.name,
        role: usuario.rol || usuario.role,
        activo: true // Establecer como activo por defecto
      }
      
      // Solo agregar email si no está vacío
      if (usuario.email && usuario.email.trim() !== '') {
        userData.email = usuario.email.trim()
      }
      
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
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
      if (usuario.password) updateData.password_hash = usuario.password
      if (usuario.activo !== undefined) updateData.activo = usuario.activo
      
      // Solo actualizar email si no está vacío
      if (usuario.email !== undefined) {
        if (usuario.email && usuario.email.trim() !== '') {
          updateData.email = usuario.email.trim()
        } else {
          // Si el email está vacío, establecer como null
          updateData.email = null
        }
      }

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
      console.log('Intentando login para usuario:', username)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password) // Comparar con password_hash como está almacenado
        .eq('activo', true)
        .single()
      
      if (error) {
        console.log('Error de login:', error)
        
        // Si no encuentra el usuario, verificar si existe pero está inactivo
        if (error.code === 'PGRST116') {
          const { data: userExists } = await supabase
            .from('users')
            .select('username, activo')
            .eq('username', username)
            .single()
          
          if (userExists) {
            return { success: false, message: 'Usuario inactivo. Contacte al administrador.' }
          } else {
            return { success: false, message: 'Usuario no encontrado' }
          }
        }
        
        return { success: false, message: 'Credenciales inválidas' }
      }
      
      console.log('Login exitoso para:', data.username)
      return { success: true, data }
    } catch (error) {
      console.log('Error catch login:', error)
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
          surtidor_id: venta.surtidorId || venta.surtidor_id,
          surtidor_nombre: venta.surtidorNombre || venta.surtidor_nombre,
          bombero_id: venta.bomberoId || venta.bombero_id,
          bombero_nombre: venta.bomberoNombre || venta.bombero_nombre,
          tipo_combustible: venta.tipoCombustible || venta.tipo_combustible,
          cantidad: venta.cantidad || venta.cantidad_litros,
          cantidad_galones: venta.cantidadGalones || venta.cantidad_galones,
          precio_por_galon: venta.precioPorGalon || venta.precio_por_galon,
          precio_unitario: venta.precioUnitario || venta.precio_unitario,
          valor_total: venta.valorTotal || venta.valor_total || venta.total,
          metodo_pago: venta.metodoPago || venta.metodo_pago,
          cliente_nombre: venta.clienteNombre || venta.cliente_nombre,
          cliente_documento: venta.clienteDocumento || venta.cliente_documento,
          placa_vehiculo: venta.placaVehiculo || venta.placa_vehiculo,
          fecha_venta: venta.fechaVenta || venta.fecha_venta || new Date().toISOString()
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
  },

  // Actualizar venta
  async actualizar(id, ventaData) {
    try {
      const { data, error } = await supabase
        .from('ventas')
        .update({
          surtidor_id: ventaData.surtidorId || ventaData.surtidor_id,
          surtidor_nombre: ventaData.surtidorNombre || ventaData.surtidor_nombre,
          bombero_id: ventaData.bomberoId || ventaData.bombero_id,
          bombero_nombre: ventaData.bomberoNombre || ventaData.bombero_nombre,
          tipo_combustible: ventaData.tipoCombustible || ventaData.tipo_combustible,
          cantidad: ventaData.cantidad || ventaData.cantidad_litros,
          cantidad_galones: ventaData.cantidadGalones || ventaData.cantidad_galones,
          precio_por_galon: ventaData.precioPorGalon || ventaData.precio_por_galon,
          precio_unitario: ventaData.precioUnitario || ventaData.precio_unitario,
          valor_total: ventaData.valorTotal || ventaData.valor_total || ventaData.total,
          metodo_pago: ventaData.metodoPago || ventaData.metodo_pago,
          cliente_nombre: ventaData.clienteNombre || ventaData.cliente_nombre,
          cliente_documento: ventaData.clienteDocumento || ventaData.cliente_documento,
          placa_vehiculo: ventaData.placaVehiculo || ventaData.placa_vehiculo
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Eliminar venta
  async eliminar(id) {
    try {
      const { error } = await supabase
        .from('ventas')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true, message: 'Venta eliminada exitosamente' }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}

// ==================== SERVICIOS DE COMBUSTIBLES GLOBALES ====================

export const combustiblesService = {
  // Obtener configuración global de combustibles
  async obtenerConfiguracionGlobal() {
    try {
      const { data, error } = await supabase
        .from('configuracion_combustibles')
        .select('*')
        .order('tipo_combustible')
      
      if (error) throw error
      
      // Transformar a formato de objeto
      const configuracion = data.reduce((acc, combustible) => {
        acc[combustible.tipo_combustible] = {
          precio: parseFloat(combustible.precio),
          stock_total: parseFloat(combustible.stock_total),
          stock_disponible: parseFloat(combustible.stock_disponible)
        }
        return acc
      }, {})
      
      return { success: true, data: configuracion }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Actualizar configuración global de combustibles
  async actualizarConfiguracionGlobal(configuracion) {
    try {
      const updates = []
      
      for (const [tipoCombustible, data] of Object.entries(configuracion)) {
        const { error } = await supabase
          .from('configuracion_combustibles')
          .update({ 
            precio: data.precio,
            stock_total: data.stock_total,
            stock_disponible: data.stock_disponible
          })
          .eq('tipo_combustible', tipoCombustible)
        
        if (error) throw error
        updates.push({ tipo: tipoCombustible, success: true })
      }
      
      return { success: true, data: updates }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Crear configuración inicial de combustibles
  async crearConfiguracionInicial() {
    try {
      const combustiblesIniciales = [
        { tipo_combustible: 'extra', precio: 12500, stock_total: 10000, stock_disponible: 10000 },
        { tipo_combustible: 'corriente', precio: 11500, stock_total: 10000, stock_disponible: 10000 },
        { tipo_combustible: 'acpm', precio: 10500, stock_total: 10000, stock_disponible: 10000 }
      ]
      
      const { error } = await supabase
        .from('configuracion_combustibles')
        .insert(combustiblesIniciales)
      
      if (error) throw error
      return { success: true, message: 'Configuración inicial creada' }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}

// ==================== SERVICIOS DE SURTIDORES ====================

export const surtidoresService = {
  // Crear nuevo surtidor
  async crear(surtidorData) {
    try {
      console.log('Creando surtidor con datos:', surtidorData)
      
      const { data, error } = await supabase
        .from('surtidores')
        .insert([{
          nombre: surtidorData.nombre,
          estado: surtidorData.estado || 'disponible'
        }])
        .select()
        .single()
      
      if (error) {
        console.error('Error al crear surtidor:', error)
        throw error
      }
      
      console.log('Surtidor creado exitosamente:', data)
      
      // Los combustibles ahora son globales, no necesitamos crear registros individuales
      return { success: true, data }
    } catch (error) {
      console.error('Error completo al crear surtidor:', error)
      return handleSupabaseError(error)
    }
  },

  // Obtener todos los surtidores con combustibles desde combustibles_surtidor
  async obtenerTodos() {
    try {
      console.log('Obteniendo surtidores con combustibles...')
      
      // Obtener surtidores
      const { data: surtidores, error: surtidoresError } = await supabase
        .from('surtidores')
        .select('*')
        .order('id')
      
      if (surtidoresError) {
        console.error('Error al obtener surtidores:', surtidoresError)
        throw surtidoresError
      }
      
      console.log('Surtidores obtenidos:', surtidores)
      
      // Obtener combustibles por surtidor
      const { data: combustibles, error: combustiblesError } = await supabase
        .from('combustibles_surtidor')
        .select('*')
        .order('surtidor_id, tipo_combustible')
      
      if (combustiblesError) {
        console.error('Error al obtener combustibles:', combustiblesError)
        throw combustiblesError
      }
      
      console.log('Combustibles obtenidos:', combustibles)
      
      // Formatear surtidores con sus combustibles
      const surtidoresFormateados = surtidores.map(surtidor => {
        // Filtrar combustibles para este surtidor
        const combustiblesSurtidor = combustibles.filter(c => c.surtidor_id === surtidor.id)
        
        // Crear objeto de combustibles
        const combustiblesObj = combustiblesSurtidor.reduce((acc, combustible) => {
          acc[combustible.tipo_combustible] = {
            precio: parseFloat(combustible.precio),
            stock: parseFloat(combustible.stock),
            capacidad_maxima: parseFloat(combustible.capacidad_maxima),
            vendido: parseFloat(combustible.vendido)
          }
          return acc
        }, {})
        
        return {
          id: surtidor.id,
          nombre: surtidor.nombre,
          estado: surtidor.estado,
          ubicacion: surtidor.ubicacion,
          combustibles: combustiblesObj
        }
      })
      
      console.log('Surtidores formateados:', surtidoresFormateados)
      return { success: true, data: surtidoresFormateados }
    } catch (error) {
      console.error('Error completo al obtener surtidores:', error)
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
      // Actualizar stock directamente sin usar función problemática
      // Primero obtener el stock actual
      const { data: stockActual, error: stockError } = await supabase
        .from('combustibles_surtidor')
        .select('stock, vendido')
        .eq('surtidor_id', surtidorId)
        .eq('tipo_combustible', tipoCombustible)
        .single()
      
      if (stockError) {
        console.error('Error obteniendo stock actual:', stockError)
        return { success: false, message: 'Error obteniendo stock actual' }
      }
      
      if (!stockActual) {
        return { success: false, message: 'No se encontró el combustible en el surtidor' }
      }
      
      // Calcular nuevo stock y vendido
      const nuevoStock = stockActual.stock - cantidadVendida
      const nuevoVendido = stockActual.vendido + cantidadVendida
      
      // Actualizar con el nuevo valor
      const { data, error: updateError } = await supabase
        .from('combustibles_surtidor')
        .update({ 
          stock: nuevoStock,
          vendido: nuevoVendido,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('surtidor_id', surtidorId)
        .eq('tipo_combustible', tipoCombustible)
        .select()
      
      if (updateError) {
        console.error('Error actualizando stock:', updateError)
        return { success: false, message: 'Error actualizando stock' }
      }
      
      console.log('Stock actualizado exitosamente')
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
