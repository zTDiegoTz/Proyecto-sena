# ANÁLISIS COMPLETO DE LA ESTRUCTURA DE LA BASE DE DATOS

## 📊 **TABLAS PRINCIPALES IDENTIFICADAS:**

### 1. **`users`** - Gestión de Usuarios
```sql
- id (UUID) - Clave primaria
- username (VARCHAR) - Nombre de usuario único
- password_hash (VARCHAR) - Contraseña hasheada
- name (VARCHAR) - Nombre completo del usuario
- role (VARCHAR) - Rol: 'super_admin', 'administrador', 'bombero'
- email (VARCHAR) - Email del usuario
- activo (BOOLEAN) - Estado del usuario
- fecha_creacion (TIMESTAMP) - Fecha de creación
```

### 2. **`surtidores`** - Gestión de Surtidores
```sql
- id (UUID) - Clave primaria ⚠️ PROBLEMA: Actualmente es BIGINT
- nombre (VARCHAR) - Nombre del surtidor
- estado (VARCHAR) - Estado: 'disponible', 'ocupado', 'mantenimiento', 'fuera_servicio'
- created_at (TIMESTAMP) - Fecha de creación
- updated_at (TIMESTAMP) - Fecha de actualización
```

### 3. **`ventas`** - Registro de Ventas
```sql
- id (UUID) - Clave primaria
- surtidor_id (UUID) - Referencia a surtidores
- bombero_id (UUID) - Referencia a users (bombero)
- tipo_combustible (VARCHAR) - 'extra', 'corriente', 'acpm'
- cantidad_litros (DECIMAL) - Cantidad vendida
- valor_total (DECIMAL) - Valor total de la venta
- fecha_venta (TIMESTAMP) - Fecha y hora de la venta
- metodo_pago (VARCHAR) - Método de pago
- surtidor_nombre (VARCHAR) - Nombre del surtidor (denormalizado)
- bombero_nombre (VARCHAR) - Nombre del bombero (denormalizado)
```

### 4. **`combustibles_surtidor`** - Combustibles por Surtidor (DEPRECADO)
```sql
- id (UUID) - Clave primaria
- surtidor_id (UUID) - Referencia a surtidores ⚠️ PROBLEMA: Actualmente es BIGINT
- tipo_combustible (VARCHAR) - Tipo de combustible
- precio (DECIMAL) - Precio por litro
- stock (DECIMAL) - Stock disponible
- vendido (DECIMAL) - Cantidad vendida
```

### 5. **`configuracion_combustibles`** - Configuración Global (NUEVA)
```sql
- id (UUID) - Clave primaria
- tipo_combustible (VARCHAR) - Tipo de combustible único
- precio (DECIMAL) - Precio global por litro
- stock_total (DECIMAL) - Stock total disponible
- stock_disponible (DECIMAL) - Stock actualmente disponible
- created_at (TIMESTAMP) - Fecha de creación
- updated_at (TIMESTAMP) - Fecha de actualización
```

## 🔗 **RELACIONES IDENTIFICADAS:**

### **Relaciones Principales:**
1. **`ventas.surtidor_id`** → **`surtidores.id`** (1:N)
2. **`ventas.bombero_id`** → **`users.id`** (1:N)
3. **`combustibles_surtidor.surtidor_id`** → **`surtidores.id`** (1:N) ⚠️ PROBLEMA

### **Vistas Problemáticas:**
- **`vista_combustibles_disponibles`** - Depende de `surtidores.id`

## ⚠️ **PROBLEMAS IDENTIFICADOS:**

### **1. Problema de Tipos de Datos:**
- **`surtidores.id`** es `BIGINT` pero debería ser `UUID`
- **`combustibles_surtidor.surtidor_id`** es `BIGINT` pero debería ser `UUID`
- **Incompatibilidad** entre tipos causa errores de constraint

### **2. Problema de Dependencias:**
- **Vista `vista_combustibles_disponibles`** impide cambiar el tipo de `surtidores.id`
- **Clave foránea `combustibles_surtidor_surtidor_id_fkey`** impide el cambio

### **3. Problema de Lógica de Negocio:**
- **`combustibles_surtidor`** está **DEPRECADO** - ya no se usa
- **`configuracion_combustibles`** es la nueva tabla para precios globales
- **Confusión** entre el sistema antiguo y el nuevo

## 🎯 **SOLUCIÓN RECOMENDADA:**

### **Paso 1: Limpiar Dependencias**
```sql
-- Eliminar vista problemática
DROP VIEW IF EXISTS vista_combustibles_disponibles CASCADE;

-- Eliminar clave foránea problemática
ALTER TABLE combustibles_surtidor DROP CONSTRAINT IF EXISTS combustibles_surtidor_surtidor_id_fkey;
```

### **Paso 2: Corregir Tipos de Datos**
```sql
-- Cambiar surtidores.id de BIGINT a UUID
ALTER TABLE surtidores ALTER COLUMN id TYPE UUID USING gen_random_uuid();
ALTER TABLE surtidores ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE surtidores ALTER COLUMN id SET NOT NULL;
ALTER TABLE surtidores ADD CONSTRAINT surtidores_pkey PRIMARY KEY (id);
```

### **Paso 3: Migrar Lógica de Negocio**
- **Eliminar** tabla `combustibles_surtidor` (ya no se usa)
- **Usar** tabla `configuracion_combustibles` para precios globales
- **Actualizar** servicios para usar la nueva lógica

## 📋 **ESTADO ACTUAL:**

### **✅ Funcionando Correctamente:**
- Tabla `users` - Gestión de usuarios
- Tabla `ventas` - Registro de ventas
- Tabla `configuracion_combustibles` - Precios globales
- Servicios de usuarios y ventas

### **❌ Con Problemas:**
- Tabla `surtidores` - Tipo de ID incorrecto
- Tabla `combustibles_surtidor` - Deprecada y con problemas
- Vista `vista_combustibles_disponibles` - Impide cambios
- Creación de surtidores - Falla por constraint

### **🔄 En Transición:**
- Sistema de precios: De individual por surtidor → Global
- Gestión de surtidores: De combustibles individuales → Configuración global

## 🚀 **PRÓXIMOS PASOS:**

1. **Ejecutar** script de limpieza de dependencias
2. **Corregir** tipos de datos en `surtidores`
3. **Eliminar** tabla `combustibles_surtidor` (opcional)
4. **Probar** creación de surtidores
5. **Verificar** funcionalidad completa
