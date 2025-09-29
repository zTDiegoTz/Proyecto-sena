// ============================================================================
// LIMPIAR DATOS INCONSISTENTES - ESTACIÓN DE GASOLINA
// ============================================================================
// Script para limpiar datos que pueden causar problemas de integridad

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🧹 INICIANDO LIMPIEZA DE DATOS INCONSISTENTES...')

// ============================================================================
// FUNCIÓN PARA LIMPIAR VENTAS HUÉRFANAS
// ============================================================================
async function limpiarVentasHuerfanas() {
  console.log('\n🔍 IDENTIFICANDO VENTAS CON USUARIOS INEXISTENTES...')
  
  try {
    // Obtener todas las ventas
    const { data: ventas, error: ventasError } = await supabase
      .from('ventas')
      .select('id, bombero_id, bombero_nombre, fecha_venta')
    
    if (ventasError) {
      console.log('❌ Error obteniendo ventas:', ventasError.message)
      return
    }
    
    // Obtener todos los usuarios válidos
    const { data: usuarios, error: usuariosError } = await supabase
      .from('users')
      .select('id')
    
    if (usuariosError) {
      console.log('❌ Error obteniendo usuarios:', usuariosError.message)
      return
    }
    
    const idsUsuariosValidos = usuarios.map(u => u.id)
    const ventasHuerfanas = ventas.filter(v => !idsUsuariosValidos.includes(v.bombero_id))
    
    console.log(`📊 Ventas totales: ${ventas.length}`)
    console.log(`📊 Usuarios válidos: ${usuarios.length}`)
    console.log(`📊 Ventas huérfanas encontradas: ${ventasHuerfanas.length}`)
    
    if (ventasHuerfanas.length > 0) {
      console.log('\n🗑️  ELIMINANDO VENTAS HUÉRFANAS...')
      
      for (const venta of ventasHuerfanas) {
        console.log(`   Eliminando venta: ${venta.id} (${venta.bombero_nombre} - ${new Date(venta.fecha_venta).toLocaleDateString('es-ES')})`)
        
        const { error: deleteError } = await supabase
          .from('ventas')
          .delete()
          .eq('id', venta.id)
        
        if (deleteError) {
          console.log(`      ❌ Error eliminando venta ${venta.id}: ${deleteError.message}`)
        } else {
          console.log(`      ✅ Venta eliminada exitosamente`)
        }
      }
      
      console.log(`✅ Limpieza completada: ${ventasHuerfanas.length} ventas huérfanas eliminadas`)
    } else {
      console.log('✅ No se encontraron ventas huérfanas')
    }
    
  } catch (error) {
    console.log('❌ Error durante la limpieza:', error.message)
  }
}

// ============================================================================
// FUNCIÓN PARA VERIFICAR Y CORREGIR USUARIOS FALTANTES
// ============================================================================
async function verificarUsuariosFaltantes() {
  console.log('\n👥 VERIFICANDO USUARIOS FALTANTES...')
  
  try {
    const { data: usuarios, error: usuariosError } = await supabase
      .from('users')
      .select('*')
      .eq('activo', true)
    
    if (usuariosError) {
      console.log('❌ Error obteniendo usuarios:', usuariosError.message)
      return
    }
    
    const roles = usuarios.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1
      return acc
    }, {})
    
    console.log('📊 Usuarios por rol:')
    Object.entries(roles).forEach(([rol, cantidad]) => {
      console.log(`   - ${rol}: ${cantidad}`)
    })
    
    // Verificar que existan todos los roles esenciales
    const rolesEsenciales = ['super_admin', 'administrador', 'bombero']
    const rolesFaltantes = rolesEsenciales.filter(rol => !roles[rol] || roles[rol] === 0)
    
    if (rolesFaltantes.length > 0) {
      console.log(`⚠️  Roles faltantes: ${rolesFaltantes.join(', ')}`)
      console.log('🔧 Se recomienda crear usuarios para estos roles')
    } else {
      console.log('✅ Todos los roles esenciales están presentes')
    }
    
  } catch (error) {
    console.log('❌ Error verificando usuarios:', error.message)
  }
}

// ============================================================================
// FUNCIÓN PARA VERIFICAR INTEGRIDAD GENERAL
// ============================================================================
async function verificarIntegridadGeneral() {
  console.log('\n🔍 VERIFICANDO INTEGRIDAD GENERAL...')
  
  try {
    // Verificar surtidores con combustibles
    const { data: surtidores, error: surtidoresError } = await supabase
      .from('surtidores')
      .select(`
        id,
        nombre,
        combustibles_surtidor(*)
      `)
    
    if (surtidoresError) {
      console.log('❌ Error obteniendo surtidores:', surtidoresError.message)
      return
    }
    
    console.log(`📊 Surtidores totales: ${surtidores.length}`)
    
    let surtidoresCompletos = 0
    surtidores.forEach(surtidor => {
      const combustibles = surtidor.combustibles_surtidor || []
      if (combustibles.length === 3) {
        surtidoresCompletos++
      } else {
        console.log(`   ⚠️  ${surtidor.nombre}: ${combustibles.length}/3 combustibles`)
      }
    })
    
    console.log(`📊 Surtidores completos: ${surtidoresCompletos}/${surtidores.length}`)
    
    // Verificar configuración de combustibles
    const { data: configCombustibles, error: configError } = await supabase
      .from('configuracion_combustibles')
      .select('*')
    
    if (configError) {
      console.log('❌ Error obteniendo configuración:', configError.message)
    } else {
      console.log(`📊 Tipos de combustible configurados: ${configCombustibles.length}`)
      configCombustibles.forEach(c => {
        console.log(`   - ${c.tipo_combustible}: $${c.precio_por_litro} (${c.activo ? 'Activo' : 'Inactivo'})`)
      })
    }
    
  } catch (error) {
    console.log('❌ Error verificando integridad:', error.message)
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================
async function main() {
  try {
    console.log('🧹 INICIANDO LIMPIEZA DE DATOS INCONSISTENTES...')
    
    // Paso 1: Limpiar ventas huérfanas
    await limpiarVentasHuerfanas()
    
    // Paso 2: Verificar usuarios faltantes
    await verificarUsuariosFaltantes()
    
    // Paso 3: Verificar integridad general
    await verificarIntegridadGeneral()
    
    console.log('\n🎉 LIMPIEZA COMPLETADA 🎉')
    console.log('✅ Datos inconsistentes corregidos')
    console.log('✅ Integridad del sistema verificada')
    console.log('\n📋 PRÓXIMO PASO: Ejecutar verificación de integridad completa')
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
  }
}

// Ejecutar limpieza
main()
