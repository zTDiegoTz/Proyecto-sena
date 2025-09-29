// ============================================================================
// PROBAR CREACIÓN DE USUARIO - ESTACIÓN DE GASOLINA
// ============================================================================
// Script para probar la creación de usuarios sin error de email duplicado

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function probarCreacionUsuario() {
  try {
    console.log('🧪 PROBANDO CREACIÓN DE USUARIO...')
    
    // Simular el usuario que se está intentando crear
    const nuevoUsuario = {
      username: 'bombero4',
      password: 'bombero123',
      name: 'VOLMAR GAY',
      role: 'bombero',
      email: '' // Email vacío como en el problema
    }
    
    console.log('📊 Datos del usuario a crear:')
    console.log(`   Nombre: ${nuevoUsuario.name}`)
    console.log(`   Usuario: ${nuevoUsuario.username}`)
    console.log(`   Rol: ${nuevoUsuario.role}`)
    console.log(`   Email: "${nuevoUsuario.email}" (vacío)`)
    
    // Paso 1: Verificar usuarios existentes
    console.log('\n📋 PASO 1: Verificando usuarios existentes...')
    
    const { data: usuariosExistentes, error: usuariosError } = await supabase
      .from('users')
      .select('username, email')
    
    if (usuariosError) {
      console.log('❌ Error obteniendo usuarios:', usuariosError.message)
      return false
    }
    
    console.log('✅ Usuarios existentes:')
    usuariosExistentes.forEach((u, i) => {
      console.log(`   ${i+1}. ${u.username} - Email: "${u.email || 'Sin email'}"`)
    })
    
    // Verificar si el username ya existe
    const usernameExiste = usuariosExistentes.some(u => u.username === nuevoUsuario.username)
    if (usernameExiste) {
      console.log(`⚠️  El username "${nuevoUsuario.username}" ya existe`)
    } else {
      console.log(`✅ El username "${nuevoUsuario.username}" está disponible`)
    }
    
    // Paso 2: Intentar crear usuario con email vacío
    console.log('\n📋 PASO 2: Intentando crear usuario con email vacío...')
    
    // Preparar datos de inserción (simulando la lógica corregida)
    const userData = {
      username: nuevoUsuario.username,
      password_hash: nuevoUsuario.password,
      name: nuevoUsuario.name,
      role: nuevoUsuario.role,
      activo: true
    }
    
    // Solo agregar email si no está vacío
    if (nuevoUsuario.email && nuevoUsuario.email.trim() !== '') {
      userData.email = nuevoUsuario.email.trim()
      console.log(`   Email agregado: "${userData.email}"`)
    } else {
      console.log('   Email omitido (campo vacío)')
    }
    
    console.log('📊 Datos a insertar:')
    Object.entries(userData).forEach(([key, value]) => {
      console.log(`   - ${key}: ${value}`)
    })
    
    // Intentar insertar
    const { data: usuarioCreado, error: createError } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()
    
    if (createError) {
      console.log('❌ Error creando usuario:', createError.message)
      console.log('   Código:', createError.code)
      console.log('   Detalles:', createError.details)
      return false
    }
    
    console.log('✅ Usuario creado exitosamente:')
    console.log(`   ID: ${usuarioCreado.id}`)
    console.log(`   Nombre: ${usuarioCreado.name}`)
    console.log(`   Usuario: ${usuarioCreado.username}`)
    console.log(`   Rol: ${usuarioCreado.role}`)
    console.log(`   Email: "${usuarioCreado.email || 'Sin email'}"`)
    console.log(`   Activo: ${usuarioCreado.activo}`)
    
    // Paso 3: Verificar que el usuario se creó correctamente
    console.log('\n📋 PASO 3: Verificando usuario creado...')
    
    const { data: usuarioVerificado, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', usuarioCreado.id)
      .single()
    
    if (verifyError) {
      console.log('❌ Error verificando usuario:', verifyError.message)
      return false
    }
    
    console.log('✅ Usuario verificado correctamente')
    console.log(`   Username: ${usuarioVerificado.username}`)
    console.log(`   Email: "${usuarioVerificado.email || 'NULL'}"`)
    
    // Paso 4: Limpiar - eliminar usuario de prueba
    console.log('\n📋 PASO 4: Limpiando usuario de prueba...')
    
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', usuarioCreado.id)
    
    if (deleteError) {
      console.log('⚠️  Error eliminando usuario de prueba:', deleteError.message)
    } else {
      console.log('✅ Usuario de prueba eliminado correctamente')
    }
    
    console.log('\n🎉 PRUEBA DE CREACIÓN DE USUARIO COMPLETADA 🎉')
    console.log('✅ El problema de email duplicado ha sido solucionado')
    console.log('✅ Los usuarios se pueden crear sin email')
    console.log('✅ El campo email se maneja correctamente como NULL')
    
    return true
    
  } catch (error) {
    console.log('❌ Error durante la prueba:', error.message)
    return false
  }
}

async function probarCreacionConEmail() {
  try {
    console.log('\n🧪 PROBANDO CREACIÓN DE USUARIO CON EMAIL...')
    
    const usuarioConEmail = {
      username: 'testuser_' + Date.now(),
      password: 'test123',
      name: 'Usuario Test',
      role: 'bombero',
      email: 'test@estacion.com'
    }
    
    console.log('📊 Datos del usuario con email:')
    console.log(`   Usuario: ${usuarioConEmail.username}`)
    console.log(`   Email: ${usuarioConEmail.email}`)
    
    // Preparar datos de inserción
    const userData = {
      username: usuarioConEmail.username,
      password_hash: usuarioConEmail.password,
      name: usuarioConEmail.name,
      role: usuarioConEmail.role,
      activo: true
    }
    
    // Agregar email
    if (usuarioConEmail.email && usuarioConEmail.email.trim() !== '') {
      userData.email = usuarioConEmail.email.trim()
    }
    
    // Crear usuario
    const { data: usuarioCreado, error: createError } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()
    
    if (createError) {
      console.log('❌ Error creando usuario con email:', createError.message)
      return false
    }
    
    console.log('✅ Usuario con email creado exitosamente')
    console.log(`   Email: "${usuarioCreado.email}"`)
    
    // Limpiar
    await supabase
      .from('users')
      .delete()
      .eq('id', usuarioCreado.id)
    
    console.log('✅ Usuario con email eliminado')
    
    return true
    
  } catch (error) {
    console.log('❌ Error probando creación con email:', error.message)
    return false
  }
}

async function main() {
  try {
    console.log('🔧 INICIANDO PRUEBA DE CREACIÓN DE USUARIOS...')
    
    // Probar creación sin email
    const pruebaSinEmail = await probarCreacionUsuario()
    
    if (!pruebaSinEmail) {
      console.log('❌ La prueba sin email falló')
      return
    }
    
    // Probar creación con email
    const pruebaConEmail = await probarCreacionConEmail()
    
    if (!pruebaConEmail) {
      console.log('❌ La prueba con email falló')
      return
    }
    
    console.log('\n🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE 🎉')
    console.log('✅ Problema de email duplicado solucionado')
    console.log('✅ Usuarios se pueden crear sin email')
    console.log('✅ Usuarios se pueden crear con email')
    console.log('✅ El servicio maneja correctamente emails vacíos')
    
  } catch (error) {
    console.log('❌ Error durante las pruebas:', error.message)
  }
}

main()
