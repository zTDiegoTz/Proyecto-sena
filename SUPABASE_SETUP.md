# Configuración de Supabase para Estación de Gasolina

## Resumen

Este documento contiene todos los pasos necesarios para conectar tu aplicación React de gestión de estación de gasolina con Supabase.

## 🔧 Configuración Completada

✅ Cliente de Supabase instalado (`@supabase/supabase-js`)
✅ Archivo de configuración creado (`src/lib/supabase.js`)
✅ Servicios para todas las entidades (`src/services/supabaseService.js`)
✅ Contexto modificado para usar Supabase (`src/context/SupabaseGasStationContext.jsx`)
✅ Schema de base de datos diseñado (`database_schema.sql`)
✅ Funciones auxiliares de PostgreSQL (`database_functions.sql`)
✅ Componente de prueba creado (`src/components/TestSupabase.jsx`)

## 📋 Pasos que DEBES completar

### 1. Ejecutar el Schema en Supabase

1. Ve a tu proyecto de Supabase: https://armmhwlnqesuhbugdmbp.supabase.co
2. Accede al **SQL Editor**
3. Copia y pega el contenido de `database_schema.sql`
4. Ejecuta el script (botón "Run")
5. Luego copia y pega el contenido de `database_functions.sql`
6. Ejecuta también este segundo script

### 2. Verificar las Credenciales

Tu configuración actual usa:
- **Project Reference:** armmhwlnqesuhbugdmbp
- **URL:** https://armmhwlnqesuhbugdmbp.supabase.co
- **Anon Key:** La clave está configurada en `src/lib/supabase.js`

### 3. Probar la Conexión

Para probar que todo funciona, modifica temporalmente tu `App.jsx`:

```jsx
import TestSupabase from './components/TestSupabase'

function App() {
  return <TestSupabase />
}

export default App
```

Ejecuta la aplicación y verifica que se conecte correctamente.

### 4. Cambiar al Nuevo Contexto

Una vez confirmado que la conexión funciona, reemplaza el contexto actual:

1. En `src/App.jsx`, cambia:
```jsx
// De:
import { GasStationProvider, useGasStation } from './context/GasStationContext'

// A:
import { SupabaseGasStationProvider as GasStationProvider, useSupabaseGasStation as useGasStation } from './context/SupabaseGasStationContext'
```

2. Reemplaza en el JSX:
```jsx
// De:
<GasStationProvider>

// A:
<GasStationProvider>
```

3. En todos los componentes que usen el contexto, cambia:
```jsx
// De:
import { useGasStation } from '../context/GasStationContext'

// A:
import { useGasStation } from '../context/SupabaseGasStationContext'
```

## 🗄️ Estructura de la Base de Datos

### Tablas principales:
- **usuarios**: Gestión de usuarios y roles
- **surtidores**: Configuración de surtidores
- **combustibles_surtidor**: Precios y stock por surtidor
- **ventas**: Registro de todas las ventas
- **turnos**: Control de turnos de bomberos
- **configuracion**: Configuración global del sistema

### Funciones PostgreSQL:
- `actualizar_stock_venta()`: Actualiza stock automáticamente al registrar venta
- `obtener_resumen_ventas()`: Estadísticas de ventas por período
- `obtener_ventas_por_surtidor()`: Ventas agrupadas por surtidor
- `obtener_estadisticas_turnos()`: Estadísticas de turnos y rendimiento

## 🔒 Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Políticas básicas configuradas
- Autenticación requerida para acceso a datos

## 📊 Características Implementadas

### Actualizaciones Optimistas
- Los cambios se reflejan inmediatamente en la UI
- Se sincronizan con Supabase en segundo plano
- Auto-reversión en caso de errores

### Sincronización Automática
- Datos actualizados automáticamente
- Manejo de errores centralizado
- Estado de carga para mejor UX

### Funcionalidades Específicas
- Login automático de turnos para bomberos
- Control de stock en tiempo real
- Validaciones de negocio en base de datos
- Historial completo de operaciones

## 🚀 Siguiente Paso

Una vez que hayas ejecutado el schema en Supabase, ejecuta:

```bash
npm run dev
```

Y accede a la aplicación para probar la conexión con el componente `TestSupabase`.

## 💡 Datos de Prueba

Los usuarios iniciales son:
- **admin / admin123** (Super Admin)
- **gerente / gerente123** (Administrador)
- **bombero1 / bombero123** (Bombero)

## 🔧 Personalización

### Variables de Entorno (Opcional)
Puedes mover las credenciales a variables de entorno creando un archivo `.env`:

```
VITE_SUPABASE_URL=https://armmhwlnqesuhbugdmbp.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_aqui
```

Y modificar `src/lib/supabase.js`:
```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

## 📞 Soporte

Si encuentras algún error:
1. Verifica que el schema se ejecutó correctamente
2. Revisa la consola del navegador para errores
3. Usa el componente `TestSupabase` para diagnosticar problemas
