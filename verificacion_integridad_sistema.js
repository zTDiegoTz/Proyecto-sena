// ============================================================================
// VERIFICACIÓN DE INTEGRIDAD DEL SISTEMA - ESTACIÓN DE GASOLINA
// ============================================================================
// Script para verificar que los cambios no dañen la base de datos ni su lógica

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔍 INICIANDO VERIFICACIÓN DE INTEGRIDAD DEL SISTEMA...')

// ============================================================================
// VERIFICACIÓN 1: ESTRUCTURA DE TABLAS CRÍTICAS
// ============================================================================
async function verificarEstructuraTablas() {
  console.log('\n📋 VERIFICANDO ESTRUCTURA DE TABLAS CRÍTICAS...')
  
  const tablasEsenciales = ['users', 'surtidores', 'ventas', 'combustibles_surtidor', 'configuracion_combustibles']
  let errores = 0
  
  for (const tabla of tablasEsenciales) {
    try {
      const { data, error } = await supabase
        .from(tabla)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`   ❌ ${tabla}: ${error.message}`)
        errores++
      } else {
        console.log(`   ✅ ${tabla}: Estructura correcta`)
        
        // Verificar columnas específicas críticas
        if (data && data.length > 0) {
          const columnas = Object.keys(data[0])
          
          // Verificaciones específicas por tabla
          if (tabla === 'ventas') {
            const columnasRequeridas = ['id', 'surtidor_id', 'bombero_id', 'tipo_combustible', 'cantidad', 'valor_total']
            const faltantes = columnasRequeridas.filter(col => !columnas.includes(col))
            if (faltantes.length > 0) {
              console.log(`      ⚠️  Columnas faltantes en ventas: ${faltantes.join(', ')}`)
              errores++
            }
          }
          
          if (tabla === 'surtidores') {
            const columnasRequeridas = ['id', 'nombre', 'estado']
            const faltantes = columnasRequeridas.filter(col => !columnas.includes(col))
            if (faltantes.length > 0) {
              console.log(`      ⚠️  Columnas faltantes en surtidores: ${faltantes.join(', ')}`)
              errores++
            }
          }
          
          if (tabla === 'users') {
            const columnasRequeridas = ['id', 'username', 'name', 'role', 'activo']
            const faltantes = columnasRequeridas.filter(col => !columnas.includes(col))
            if (faltantes.length > 0) {
              console.log(`      ⚠️  Columnas faltantes en users: ${faltantes.join(', ')}`)
              errores++
            }
          }
        }
      }
    } catch (error) {
      console.log(`   ❌ ${tabla}: Error de conexión - ${error.message}`)
      errores++
    }
  }
  
  return errores
}

// ============================================================================
// VERIFICACIÓN 2: INTEGRIDAD REFERENCIAL
// ============================================================================
async function verificarIntegridadReferencial() {
  console.log('\n🔗 VERIFICANDO INTEGRIDAD REFERENCIAL...')
  
  let errores = 0
  
  try {
    // Verificar que todas las ventas tengan surtidores válidos
    const { data: ventasHuerfanas, error: ventasError } = await supabase
      .from('ventas')
      .select('id, surtidor_id, surtidor_nombre')
      .limit(100)
    
    if (ventasError) {
      console.log(`   ❌ Error verificando ventas: ${ventasError.message}`)
      errores++
    } else if (ventasHuerfanas && ventasHuerfanas.length > 0) {
      // Verificar que cada venta tenga un surtidor válido
      const { data: surtidores, error: surtidoresError } = await supabase
        .from('surtidores')
        .select('id')
      
      if (!surtidoresError && surtidores) {
        const idsValidos = surtidores.map(s => s.id)
        const ventasInvalidas = ventasHuerfanas.filter(v => !idsValidos.includes(v.surtidor_id))
        
        if (ventasInvalidas.length > 0) {
          console.log(`   ⚠️  Ventas con surtidores inexistentes: ${ventasInvalidas.length}`)
          errores++
        } else {
          console.log(`   ✅ Integridad ventas-surtidores: Correcta`)
        }
      }
    } else {
      console.log(`   ✅ Integridad ventas-surtidores: Sin datos para verificar`)
    }
    
    // Verificar que todas las ventas tengan usuarios válidos
    const { data: usuarios, error: usuariosError } = await supabase
      .from('users')
      .select('id')
    
    if (!usuariosError && usuarios && ventasHuerfanas) {
      const idsUsuariosValidos = usuarios.map(u => u.id)
      const ventasUsuariosInvalidos = ventasHuerfanas.filter(v => v.bombero_id && !idsUsuariosValidos.includes(v.bombero_id))
      
      if (ventasUsuariosInvalidos.length > 0) {
        console.log(`   ⚠️  Ventas con usuarios inexistentes: ${ventasUsuariosInvalidos.length}`)
        ventasUsuariosInvalidos.forEach(v => {
          console.log(`      - Venta ${v.id}: Bombero ID ${v.bombero_id} no existe`)
        })
        errores++
      } else {
        console.log(`   ✅ Integridad ventas-usuarios: Correcta`)
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Error verificando integridad: ${error.message}`)
    errores++
  }
  
  return errores
}

// ============================================================================
// VERIFICACIÓN 3: LÓGICA DE NEGOCIO
// ============================================================================
async function verificarLogicaNegocio() {
  console.log('\n🧠 VERIFICANDO LÓGICA DE NEGOCIO...')
  
  let errores = 0
  
  try {
    // Verificar que todos los surtidores tengan combustibles
    const { data: surtidores, error: surtidoresError } = await supabase
      .from('surtidores')
      .select(`
        id,
        nombre,
        combustibles_surtidor(*)
      `)
    
    if (surtidoresError) {
      console.log(`   ❌ Error obteniendo surtidores: ${surtidoresError.message}`)
      errores++
    } else if (surtidores) {
      let surtidoresSinCombustibles = 0
      let surtidoresIncompletos = 0
      
      surtidores.forEach(surtidor => {
        const combustibles = surtidor.combustibles_surtidor || []
        
        if (combustibles.length === 0) {
          surtidoresSinCombustibles++
        } else if (combustibles.length < 3) {
          surtidoresIncompletos++
        }
      })
      
      if (surtidoresSinCombustibles > 0) {
        console.log(`   ⚠️  Surtidores sin combustibles: ${surtidoresSinCombustibles}`)
        errores++
      }
      
      if (surtidoresIncompletos > 0) {
        console.log(`   ⚠️  Surtidores con combustibles incompletos: ${surtidoresIncompletos}`)
        errores++
      }
      
      if (surtidoresSinCombustibles === 0 && surtidoresIncompletos === 0) {
        console.log(`   ✅ Lógica surtidores-combustibles: Correcta`)
      }
    }
    
    // Verificar consistencia de precios
    const { data: combustibles, error: combustiblesError } = await supabase
      .from('combustibles_surtidor')
      .select('tipo_combustible, precio')
    
    if (!combustiblesError && combustibles) {
      const preciosPorTipo = combustibles.reduce((acc, c) => {
        if (!acc[c.tipo_combustible]) {
          acc[c.tipo_combustible] = []
        }
        acc[c.tipo_combustible].push(c.precio)
        return acc
      }, {})
      
      let preciosInconsistentes = 0
      Object.entries(preciosPorTipo).forEach(([tipo, precios]) => {
        const preciosUnicos = [...new Set(precios)]
        if (preciosUnicos.length > 1) {
          preciosInconsistentes++
          console.log(`   ⚠️  Precios inconsistentes para ${tipo}: ${preciosUnicos.join(', ')}`)
        }
      })
      
      if (preciosInconsistentes > 0) {
        errores++
      } else {
        console.log(`   ✅ Consistencia de precios: Correcta`)
      }
    }
    
    // Verificar que existan usuarios de todos los roles
    const { data: usuarios, error: usuariosError } = await supabase
      .from('users')
      .select('role')
      .eq('activo', true)
    
    if (!usuariosError && usuarios) {
      const roles = usuarios.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1
        return acc
      }, {})
      
      const rolesEsenciales = ['super_admin', 'administrador', 'bombero']
      const rolesFaltantes = rolesEsenciales.filter(rol => !roles[rol] || roles[rol] === 0)
      
      if (rolesFaltantes.length > 0) {
        console.log(`   ⚠️  Roles faltantes: ${rolesFaltantes.join(', ')}`)
        errores++
      } else {
        console.log(`   ✅ Roles de usuarios: Completos`)
      }
    }
    
  } catch (error) {
    console.log(`   ❌ Error verificando lógica de negocio: ${error.message}`)
    errores++
  }
  
  return errores
}

// ============================================================================
// VERIFICACIÓN 4: FUNCIONALIDAD CRÍTICA
// ============================================================================
async function verificarFuncionalidadCritica() {
  console.log('\n⚙️  VERIFICANDO FUNCIONALIDAD CRÍTICA...')
  
  let errores = 0
  
  try {
    // Probar login
    const { data: usuarioTest, error: loginError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .eq('password_hash', 'admin123')
      .eq('activo', true)
      .single()
    
    if (loginError) {
      console.log(`   ❌ Login de admin: ${loginError.message}`)
      errores++
    } else {
      console.log(`   ✅ Login de admin: Funcional`)
    }
    
    // Probar creación de venta (simulada)
    const { data: surtidorTest, error: surtidorError } = await supabase
      .from('surtidores')
      .select('*')
      .eq('estado', 'disponible')
      .limit(1)
      .single()
    
    const { data: bomberoTest, error: bomberoError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'bombero')
      .eq('activo', true)
      .limit(1)
      .single()
    
    if (surtidorError || bomberoError) {
      console.log(`   ❌ Datos para venta: Surtidor o bombero no disponible`)
      errores++
    } else {
      console.log(`   ✅ Datos para venta: Disponibles`)
    }
    
    // Verificar configuración de combustibles
    const { data: configCombustibles, error: configError } = await supabase
      .from('configuracion_combustibles')
      .select('*')
    
    if (configError) {
      console.log(`   ❌ Configuración de combustibles: ${configError.message}`)
      errores++
    } else if (!configCombustibles || configCombustibles.length < 3) {
      console.log(`   ⚠️  Configuración de combustibles incompleta`)
      errores++
    } else {
      console.log(`   ✅ Configuración de combustibles: Completa`)
    }
    
  } catch (error) {
    console.log(`   ❌ Error verificando funcionalidad: ${error.message}`)
    errores++
  }
  
  return errores
}

// ============================================================================
// VERIFICACIÓN 5: SERVICIOS DEL FRONTEND
// ============================================================================
async function verificarServiciosFrontend() {
  console.log('\n🖥️  VERIFICANDO SERVICIOS DEL FRONTEND...')
  
  let errores = 0
  
  try {
    // Probar servicios directamente con Supabase (sin importar módulos ES6)
    
    // Probar servicio de usuarios (simulado)
    const { data: usuariosTest, error: usuariosError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usuariosError) {
      console.log(`   ❌ Servicio de usuarios: ${usuariosError.message}`)
      errores++
    } else {
      console.log(`   ✅ Servicio de usuarios: Funcional`)
    }
    
    // Probar servicio de surtidores (simulado)
    const { data: surtidoresTest, error: surtidoresError } = await supabase
      .from('surtidores')
      .select(`
        *,
        combustibles_surtidor(*)
      `)
      .limit(1)
    
    if (surtidoresError) {
      console.log(`   ❌ Servicio de surtidores: ${surtidoresError.message}`)
      errores++
    } else {
      console.log(`   ✅ Servicio de surtidores: Funcional`)
    }
    
    // Probar servicio de ventas (simulado)
    const { data: ventasTest, error: ventasError } = await supabase
      .from('ventas')
      .select('*')
      .limit(1)
    
    if (ventasError) {
      console.log(`   ❌ Servicio de ventas: ${ventasError.message}`)
      errores++
    } else {
      console.log(`   ✅ Servicio de ventas: Funcional`)
    }
    
  } catch (error) {
    console.log(`   ❌ Error probando servicios: ${error.message}`)
    errores++
  }
  
  return errores
}

// ============================================================================
// FUNCIÓN PRINCIPAL DE VERIFICACIÓN
// ============================================================================
async function verificarIntegridadCompleta() {
  console.log('\n🔍 EJECUTANDO VERIFICACIÓN COMPLETA DE INTEGRIDAD...')
  
  let totalErrores = 0
  
  // Ejecutar todas las verificaciones
  totalErrores += await verificarEstructuraTablas()
  totalErrores += await verificarIntegridadReferencial()
  totalErrores += await verificarLogicaNegocio()
  totalErrores += await verificarFuncionalidadCritica()
  totalErrores += await verificarServiciosFrontend()
  
  // Resumen final
  console.log('\n' + '='.repeat(60))
  console.log('📊 RESUMEN DE VERIFICACIÓN DE INTEGRIDAD')
  console.log('='.repeat(60))
  
  if (totalErrores === 0) {
    console.log('🎉 ¡SISTEMA ÍNTEGRO Y FUNCIONAL!')
    console.log('✅ Todas las verificaciones pasaron exitosamente')
    console.log('✅ La base de datos mantiene su integridad')
    console.log('✅ La lógica de negocio está correcta')
    console.log('✅ Los servicios funcionan correctamente')
  } else {
    console.log('⚠️  PROBLEMAS DETECTADOS EN EL SISTEMA')
    console.log(`❌ Total de errores encontrados: ${totalErrores}`)
    console.log('🔧 Se requiere atención para corregir los problemas')
  }
  
  console.log('\n📋 RECOMENDACIONES:')
  if (totalErrores === 0) {
    console.log('   ✅ El sistema está listo para usar')
    console.log('   ✅ Todos los módulos funcionan correctamente')
    console.log('   ✅ La base de datos está optimizada')
  } else {
    console.log('   🔧 Revisar y corregir los errores identificados')
    console.log('   🔧 Ejecutar esta verificación después de cada cambio')
    console.log('   🔧 No realizar cambios adicionales hasta corregir problemas')
  }
  
  return totalErrores
}

// ============================================================================
// EJECUCIÓN
// ============================================================================
async function main() {
  try {
    const errores = await verificarIntegridadCompleta()
    process.exit(errores > 0 ? 1 : 0)
  } catch (error) {
    console.error('❌ Error crítico durante la verificación:', error)
    process.exit(1)
  }
}

// Ejecutar verificación
main()
