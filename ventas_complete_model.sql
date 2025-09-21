-- Modelo completo y limpio de la tabla ventas
-- Ejecutar en Supabase SQL Editor

-- Primero, verificar la estructura actual
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ventas' 
ORDER BY ordinal_position;

-- Crear tabla ventas limpia (si no existe) o modificar la existente
CREATE TABLE IF NOT EXISTS ventas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Información del surtidor
  surtidor_id BIGINT NOT NULL,
  surtidor_nombre VARCHAR(100) NOT NULL,
  
  -- Información del bombero
  bombero_id UUID NOT NULL,
  bombero_nombre VARCHAR(100) NOT NULL,
  
  -- Información del combustible
  tipo_combustible VARCHAR(20) NOT NULL,
  cantidad DECIMAL(10,3) NOT NULL, -- Cantidad en litros (para stock)
  cantidad_galones DECIMAL(10,3) NOT NULL, -- Cantidad en galones (para mostrar)
  precio_por_galon DECIMAL(10,2) NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL, -- Precio por litro (para cálculos)
  
  -- Información financiera
  valor_total DECIMAL(12,2) NOT NULL,
  metodo_pago VARCHAR(20) NOT NULL DEFAULT 'efectivo',
  
  -- Información del cliente (opcional)
  cliente_nombre VARCHAR(100),
  cliente_documento VARCHAR(20),
  placa_vehiculo VARCHAR(10),
  
  -- Información del turno
  turno_id UUID,
  
  -- Timestamps
  fecha_venta TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Agregar columnas faltantes si la tabla ya existe
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS precio_unitario DECIMAL(10,2);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMPTZ DEFAULT NOW();

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_ventas_surtidor_id ON ventas(surtidor_id);
CREATE INDEX IF NOT EXISTS idx_ventas_bombero_id ON ventas(bombero_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha_venta ON ventas(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_ventas_tipo_combustible ON ventas(tipo_combustible);

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_ventas()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar fecha_actualizacion
DROP TRIGGER IF EXISTS trigger_actualizar_fecha_ventas ON ventas;
CREATE TRIGGER trigger_actualizar_fecha_ventas
  BEFORE UPDATE ON ventas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_fecha_ventas();

-- Verificar la estructura final
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ventas' 
ORDER BY ordinal_position;

-- Mostrar algunos datos de ejemplo (si existen)
SELECT * FROM ventas LIMIT 5;
