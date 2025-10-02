import { supabase, handleSupabaseError } from '../lib/supabase'

// ==================== SERVICIO LIMPIO DE VENTAS ====================

export const ventasServiceClean = {
  // Crear nueva venta con validación completa
  async crear(venta) {
    try {
      // Validar datos requeridos
      const datosRequeridos = [
        'surtidor_id', 'surtidor_nombre', 'bombero_id', 'bombero_nombre',
        'tipo_combustible', 'cantidad_galones', 'cantidad', 
        'precio_por_galon', 'valor_total'
      ]
      
      // Asegurar que precio_unitario esté calculado
      if (!venta.precio_unitario && venta.cantidad > 0) {
        venta.precio_unitario = parseFloat((venta.valor_total / venta.cantidad).toFixed(2))
      }
      
      for (const campo of datosRequeridos) {
        if (!venta[campo] && venta[campo] !== 0) {
          throw new Error(`Campo requerido faltante: ${campo}`)
        }
      }

      // Usar precio_unitario calculado o calcularlo si no existe
      const precioUnitario = venta.precio_unitario || (venta.cantidad > 0 
        ? parseFloat((venta.valor_total / venta.cantidad).toFixed(2))
        : 0)

      const ventaCompleta = {
        // Información del surtidor
        surtidor_id: venta.surtidor_id,
        surtidor_nombre: venta.surtidor_nombre,
        
        // Información del bombero
        bombero_id: venta.bombero_id,
        bombero_nombre: venta.bombero_nombre,
        
        // Información del combustible
        tipo_combustible: venta.tipo_combustible,
        cantidad: venta.cantidad, // Para stock (litros)
        cantidad_galones: venta.cantidad_galones,
        precio_por_galon: venta.precio_por_galon,
        precio_unitario: precioUnitario, // Precio por litro
        
        // Información financiera
        valor_total: venta.valor_total,
        metodo_pago: venta.metodo_pago || 'efectivo',
        
        // Información del cliente (opcional)
        cliente_nombre: venta.cliente_nombre || null,
        cliente_documento: venta.cliente_documento || null,
        placa_vehiculo: venta.placa_vehiculo || null,
        
        // Información del turno (opcional)
        turno_id: venta.turno_id || null,
        
        // Timestamps
        fecha_venta: venta.fecha_venta || new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('ventas')
        .insert([ventaCompleta])
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Obtener todas las ventas con filtros
  async obtenerTodas(filtros = {}) {
    try {
      let query = supabase
        .from('ventas')
        .select('*')
        .order('fecha_venta', { ascending: false })

      // Aplicar filtros
      if (filtros.surtidor_id) {
        query = query.eq('surtidor_id', filtros.surtidor_id)
      }
      if (filtros.bombero_id) {
        query = query.eq('bombero_id', filtros.bombero_id)
      }
      if (filtros.tipo_combustible) {
        query = query.eq('tipo_combustible', filtros.tipo_combustible)
      }
      if (filtros.fecha_desde) {
        query = query.gte('fecha_venta', filtros.fecha_desde)
      }
      if (filtros.fecha_hasta) {
        query = query.lte('fecha_venta', filtros.fecha_hasta)
      }

      const { data, error } = await query
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Obtener ventas por bombero
  async obtenerPorBombero(bomberoId, fechaDesde = null, fechaHasta = null) {
    try {
      let query = supabase
        .from('ventas')
        .select('*')
        .eq('bombero_id', bomberoId)
        .order('fecha_venta', { ascending: false })

      if (fechaDesde) {
        query = query.gte('fecha_venta', fechaDesde)
      }
      if (fechaHasta) {
        query = query.lte('fecha_venta', fechaHasta)
      }

      const { data, error } = await query
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Obtener estadísticas de ventas
  async obtenerEstadisticas(filtros = {}) {
    try {
      let query = supabase
        .from('ventas')
        .select('*')

      // Aplicar filtros
      if (filtros.fecha_desde) {
        query = query.gte('fecha_venta', filtros.fecha_desde)
      }
      if (filtros.fecha_hasta) {
        query = query.lte('fecha_venta', filtros.fecha_hasta)
      }

      const { data, error } = await query
      if (error) throw error

      // Calcular estadísticas
      const estadisticas = {
        total_ventas: data.length,
        total_galones: data.reduce((sum, v) => sum + (v.cantidad_galones || 0), 0),
        total_litros: data.reduce((sum, v) => sum + (v.cantidad_litros || 0), 0),
        total_valor: data.reduce((sum, v) => sum + (v.valor_total || 0), 0),
        por_combustible: {},
        por_surtidor: {},
        por_bombero: {}
      }

      // Agrupar por combustible
      data.forEach(venta => {
        const tipo = venta.tipo_combustible
        if (!estadisticas.por_combustible[tipo]) {
          estadisticas.por_combustible[tipo] = {
            cantidad: 0,
            galones: 0,
            valor: 0
          }
        }
        estadisticas.por_combustible[tipo].cantidad++
        estadisticas.por_combustible[tipo].galones += venta.cantidad_galones || 0
        estadisticas.por_combustible[tipo].valor += venta.valor_total || 0
      })

      return { success: true, data: estadisticas }
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
