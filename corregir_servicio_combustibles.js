// =====================================================
// CORRECCIÓN DEL SERVICIO DE COMBUSTIBLES
// =====================================================
// Script para corregir el servicio que obtiene combustibles de surtidores

// PROBLEMA IDENTIFICADO:
// El servicio surtidoresService.obtenerTodos() está intentando obtener datos de 
// la tabla 'configuracion_combustibles' que no existe en la nueva base de datos.
// En su lugar, debe usar la tabla 'combustibles_surtidor'.

// SOLUCIÓN: Actualizar el servicio para usar la estructura correcta

// ============================================================================
// CÓDIGO CORREGIDO PARA src/services/supabaseServiceFinal.js
// ============================================================================

// Reemplazar la función obtenerTodos() en surtidoresService:

export const surtidoresService = {
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

  // Obtener surtidor específico con combustibles
  async obtenerPorId(id) {
    try {
      // Obtener surtidor
      const { data: surtidor, error: surtidorError } = await supabase
        .from('surtidores')
        .select('*')
        .eq('id', id)
        .single()
      
      if (surtidorError) throw surtidorError
      
      // Obtener combustibles del surtidor
      const { data: combustibles, error: combustiblesError } = await supabase
        .from('combustibles_surtidor')
        .select('*')
        .eq('surtidor_id', id)
        .order('tipo_combustible')
      
      if (combustiblesError) throw combustiblesError
      
      // Formatear combustibles
      const combustiblesObj = combustibles.reduce((acc, combustible) => {
        acc[combustible.tipo_combustible] = {
          precio: parseFloat(combustible.precio),
          stock: parseFloat(combustible.stock),
          capacidad_maxima: parseFloat(combustible.capacidad_maxima),
          vendido: parseFloat(combustible.vendido)
        }
        return acc
      }, {})
      
      return {
        success: true,
        data: {
          id: surtidor.id,
          nombre: surtidor.nombre,
          estado: surtidor.estado,
          ubicacion: surtidor.ubicacion,
          combustibles: combustiblesObj
        }
      }
    } catch (error) {
      return handleSupabaseError(error)
    }
  },

  // Actualizar stock de combustible después de una venta
  async actualizarStock(surtidorId, tipoCombustible, cantidadVendida) {
    try {
      const { data, error } = await supabase
        .from('combustibles_surtidor')
        .update({
          stock: supabase.raw(`stock - ${cantidadVendida}`),
          vendido: supabase.raw(`vendido + ${cantidadVendida}`),
          fecha_actualizacion: new Date().toISOString()
        })
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

  // Obtener combustibles disponibles para un surtidor
  async obtenerCombustiblesDisponibles(surtidorId) {
    try {
      const { data, error } = await supabase
        .from('combustibles_surtidor')
        .select('*')
        .eq('surtidor_id', surtidorId)
        .gt('stock', 0)
        .order('tipo_combustible')
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return handleSupabaseError(error)
    }
  }
}

// ============================================================================
// INSTRUCCIONES PARA APLICAR LA CORRECCIÓN
// ============================================================================

/*
PASOS PARA CORREGIR EL PROBLEMA:

1. Abrir el archivo: src/services/supabaseServiceFinal.js

2. Buscar la función obtenerTodos() en surtidoresService (línea ~403)

3. Reemplazar toda la función con el código corregido de arriba

4. Guardar el archivo

5. Recargar la aplicación

6. Probar el módulo de ventas

ALTERNATIVA: Si prefieres, puedes copiar y pegar solo la parte de la función obtenerTodos():

// Reemplazar desde la línea 403 hasta la línea 461 con:
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
}
*/

// ============================================================================
// VERIFICACIÓN POST-CORRECCIÓN
// ============================================================================

/*
DESPUÉS DE APLICAR LA CORRECCIÓN:

1. Abrir la consola del navegador (F12)
2. Ir al módulo de ventas
3. Seleccionar un surtidor
4. Verificar que aparezcan los combustibles en el dropdown
5. Revisar la consola para ver los logs de datos obtenidos

LOGS ESPERADOS EN CONSOLA:
- "Obteniendo surtidores con combustibles..."
- "Surtidores obtenidos: [array de surtidores]"
- "Combustibles obtenidos: [array de combustibles]"
- "Surtidores formateados: [array con combustibles incluidos]"

SI SIGUE SIN FUNCIONAR:
1. Ejecutar el script verificar_combustibles_surtidores.sql en Supabase
2. Verificar que existan datos en la tabla combustibles_surtidor
3. Revisar que los precios sean mayores a 0
4. Confirmar que el stock sea mayor a 0
*/
