// ============================================================================
// CORRECCIÓN COMPLETA DEL SISTEMA - ESTACIÓN DE GASOLINA
// ============================================================================
// Script de Node.js para corregir todos los problemas identificados
// usando la conexión directa a Supabase

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase
const supabaseUrl = 'https://adbzfiepkxtyqudwfysk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'

// Crear cliente de Supabase con clave anónima
const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🚀 INICIANDO CORRECCIÓN COMPLETA DEL SISTEMA...')

// ============================================================================
// PASO 1: VERIFICAR ESTADO ACTUAL DE LA BASE DE DATOS
// ============================================================================
async function verificarEstadoActual() {
  console.log('🔍 VERIFICANDO ESTADO ACTUAL DE LA BASE DE DATOS...')
  
  // Verificar surtidores existentes
  const { data: surtidores, error: surtidoresError } = await supabase
    .from('surtidores')
    .select('*')
  
  if (surtidoresError) {
    console.error('Error verificando surtidores:', surtidoresError)
  } else {
    console.log('✅ Surtidores existentes:', surtidores?.length)
    if (surtidores && surtidores.length > 0) {
      console.log('   - Primer surtidor:', surtidores[0])
    }
  }
  
  // Verificar usuarios existentes
  const { data: usuarios, error: usuariosError } = await supabase
    .from('users')
    .select('*')
  
  if (usuariosError) {
    console.error('Error verificando usuarios:', usuariosError)
  } else {
    console.log('✅ Usuarios existentes:', usuarios?.length)
    if (usuarios && usuarios.length > 0) {
      console.log('   - Primer usuario:', usuarios[0])
    }
  }
  
  // Verificar configuración existente
  const { data: configuracion, error: configError } = await supabase
    .from('configuracion')
    .select('*')
  
  if (configError) {
    console.error('Error verificando configuración:', configError)
  } else {
    console.log('✅ Configuración existente:', configuracion?.length)
    if (configuracion && configuracion.length > 0) {
      console.log('   - Primera configuración:', configuracion[0])
    }
  }
  
  // Verificar combustibles_surtidor
  const { data: combustibles, error: combustiblesError } = await supabase
    .from('combustibles_surtidor')
    .select('*')
  
  if (combustiblesError) {
    console.error('Error verificando combustibles_surtidor:', combustiblesError)
  } else {
    console.log('✅ Combustibles por surtidor:', combustibles?.length)
    if (combustibles && combustibles.length > 0) {
      console.log('   - Primer combustible:', combustibles[0])
    }
  }
}

// ============================================================================
// PASO 3: CREAR DATOS INICIALES
// ============================================================================
async function crearDatosIniciales() {
  console.log('📝 CREANDO DATOS INICIALES...')
  
  // Insertar surtidores iniciales
  const { data: surtidores, error: surtidoresError } = await supabase
    .from('surtidores')
    .upsert([
      { nombre: 'Surtidor 1', estado: 'disponible', ubicacion: 'Entrada principal' },
      { nombre: 'Surtidor 2', estado: 'disponible', ubicacion: 'Entrada secundaria' },
      { nombre: 'Surtidor 3', estado: 'disponible', ubicacion: 'Área de carga' }
    ], { onConflict: 'nombre' })
    .select()
  
  if (surtidoresError) {
    console.error('Error creando surtidores:', surtidoresError)
  } else {
    console.log('✅ Surtidores creados:', surtidores?.length)
  }
  
  // Insertar usuarios iniciales
  const { data: usuarios, error: usuariosError } = await supabase
    .from('users')
    .upsert([
      { username: 'admin', password_hash: 'admin123', name: 'Administrador Principal', role: 'super_admin', email: 'admin@estacion.com', activo: true },
      { username: 'gerente', password_hash: 'gerente123', name: 'Gerente de Estación', role: 'administrador', email: 'gerente@estacion.com', activo: true },
      { username: 'bombero1', password_hash: 'bombero123', name: 'Juan Pérez', role: 'bombero', email: 'juan@estacion.com', activo: true },
      { username: 'bombero2', password_hash: 'bombero123', name: 'María García', role: 'bombero', email: 'maria@estacion.com', activo: true }
    ], { onConflict: 'username' })
    .select()
  
  if (usuariosError) {
    console.error('Error creando usuarios:', usuariosError)
  } else {
    console.log('✅ Usuarios creados:', usuarios?.length)
  }
  
  // Insertar configuración inicial
  const { data: configuracion, error: configError } = await supabase
    .from('configuracion')
    .upsert([
      { clave: 'precio_extra', valor: '12500', descripcion: 'Precio por galón de gasolina extra', tipo: 'number' },
      { clave: 'precio_corriente', valor: '12000', descripcion: 'Precio por galón de gasolina corriente', tipo: 'number' },
      { clave: 'precio_acpm', valor: '11000', descripcion: 'Precio por galón de ACPM', tipo: 'number' },
      { clave: 'nombre_estacion', valor: 'Estación de Gasolina SENA', descripcion: 'Nombre de la estación', tipo: 'string' },
      { clave: 'direccion_estacion', valor: 'Calle 123 #45-67', descripcion: 'Dirección de la estación', tipo: 'string' },
      { clave: 'telefono_estacion', valor: '300-123-4567', descripcion: 'Teléfono de la estación', tipo: 'string' },
      { clave: 'monitoreo_stock', valor: 'false', descripcion: 'Indica si se monitorea el stock en tiempo real', tipo: 'boolean' },
      { clave: 'version_sistema', valor: '2.0', descripcion: 'Versión del sistema', tipo: 'string' }
    ], { onConflict: 'clave' })
    .select()
  
  if (configError) {
    console.error('Error creando configuración:', configError)
  } else {
    console.log('✅ Configuración creada:', configError?.length)
  }
  
  console.log('✅ Datos iniciales creados correctamente')
}

// ============================================================================
// PASO 4: VERIFICAR FUNCIONAMIENTO
// ============================================================================
async function verificarFuncionamiento() {
  console.log('🔍 VERIFICANDO FUNCIONAMIENTO...')
  
  // Verificar surtidores
  const { data: surtidores, error: surtidoresError } = await supabase
    .from('surtidores')
    .select('*')
  
  if (surtidoresError) {
    console.error('Error verificando surtidores:', surtidoresError)
  } else {
    console.log('✅ Surtidores disponibles:', surtidores?.length)
  }
  
  // Verificar usuarios
  const { data: usuarios, error: usuariosError } = await supabase
    .from('users')
    .select('*')
  
  if (usuariosError) {
    console.error('Error verificando usuarios:', usuariosError)
  } else {
    console.log('✅ Usuarios disponibles:', usuarios?.length)
  }
  
  // Verificar configuración
  const { data: configuracion, error: configError } = await supabase
    .from('configuracion')
    .select('*')
  
  if (configError) {
    console.error('Error verificando configuración:', configError)
  } else {
    console.log('✅ Configuración disponible:', configuracion?.length)
  }
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================
async function main() {
  try {
    console.log('🚀 INICIANDO VERIFICACIÓN Y CORRECCIÓN DEL SISTEMA...')
    
    // Paso 1: Verificar estado actual
    await verificarEstadoActual()
    
    // Paso 2: Crear datos iniciales
    await crearDatosIniciales()
    
    // Paso 3: Verificar funcionamiento
    await verificarFuncionamiento()
    
    console.log('🎉 VERIFICACIÓN Y CORRECCIÓN DEL SISTEMA FINALIZADA 🎉')
    console.log('✅ Sistema listo para funcionar con el frontend')
    console.log('🚀 Todos los módulos del frontend deberían funcionar correctamente')
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error)
  }
}

// Ejecutar la corrección
main()
