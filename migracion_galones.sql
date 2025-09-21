-- Migración para agregar soporte de galones en la tabla de ventas

-- Agregar columnas para galones en la tabla ventas
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS cantidad_galones DECIMAL(10,3);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS cantidad_litros DECIMAL(10,3);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS precio_por_galon DECIMAL(10,2);

-- Actualizar datos existentes (si los hay)
-- Convertir litros a galones para ventas existentes que no tengan estos campos
UPDATE ventas 
SET 
  cantidad_galones = cantidad / 3.78541,
  cantidad_litros = cantidad,
  precio_por_galon = precio_unitario * 3.78541
WHERE cantidad_galones IS NULL AND cantidad IS NOT NULL;

-- Agregar comentarios para claridad
COMMENT ON COLUMN ventas.cantidad_galones IS 'Cantidad de combustible vendida en galones';
COMMENT ON COLUMN ventas.cantidad_litros IS 'Cantidad de combustible vendida en litros (para stock)';
COMMENT ON COLUMN ventas.precio_por_galon IS 'Precio por galón al momento de la venta';

-- Verificar que los datos se migraron correctamente
SELECT 
  id,
  cantidad,
  cantidad_galones,
  cantidad_litros,
  precio_unitario,
  precio_por_galon,
  valor_total,
  fecha_hora
FROM ventas 
ORDER BY fecha_hora DESC 
LIMIT 10;
