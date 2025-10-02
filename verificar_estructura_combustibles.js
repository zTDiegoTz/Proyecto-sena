const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://adbzfiepkxtyqudwfysk.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkYnpmaWVwa3h0eXF1ZHdmeXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MzI4NTMsImV4cCI6MjA3MzAwODg1M30.p28PzncJkprjEluCMsFsaqio0zTsrRrzM2whZ52_rtI'
)

async function verificarEstructura() {
  console.log('Verificando estructura de configuracion_combustibles...')
  
  const { data, error } = await supabase
    .from('configuracion_combustibles')
    .select('*')
    .limit(3)
  
  if (error) {
    console.log('Error:', error.message)
  } else {
    console.log('Datos encontrados:', data.length)
    if (data.length > 0) {
      console.log('Primer registro:', data[0])
      console.log('Columnas:', Object.keys(data[0]))
    }
  }
}

verificarEstructura()
