-- Script para arreglar la tabla ventas
-- Ejecutar en Supabase SQL Editor

-- Verificar si la tabla ventas existe
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'ventas' 
ORDER BY ordinal_position;

-- Agregar columnas faltantes si no existen
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS cantidad_galones DECIMAL(10,3);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS cantidad_litros DECIMAL(10,3);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS precio_por_galon DECIMAL(10,2);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(20) DEFAULT 'efectivo';
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS cliente_nombre VARCHAR(100);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS cliente_documento VARCHAR(20);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS placa_vehiculo VARCHAR(10);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS fecha_venta TIMESTAMPTZ DEFAULT NOW();

-- Verificar la estructura final
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'ventas' 
ORDER BY ordinal_position;
