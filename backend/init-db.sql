-- ============================================================
-- TransmiFlow - Migracion de la base de datos
-- Compatible con el esquema existente (no destruye nada)
-- Ejecuta en pgAdmin 4 > Query Tool
-- ============================================================

-- Agrega las columnas nuevas a la tabla estaciones existente
-- (tus columnas id, nombre, tipo, latitud, longitud se conservan)
ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS troncal      VARCHAR(60);
ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS aglomeracion VARCHAR(20) DEFAULT 'Media';
ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS capacidad    INTEGER DEFAULT 0;

-- Las columnas de coordenadas que usa la app
ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS lat NUMERIC(10,7);
ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS lng NUMERIC(10,7);

-- Copia las coordenadas existentes a las columnas nuevas
UPDATE estaciones SET lat = latitud WHERE lat IS NULL AND latitud IS NOT NULL;
UPDATE estaciones SET lng = longitud WHERE lng IS NULL AND longitud IS NOT NULL;

-- Asigna un valor por defecto a las filas que no tengan troncal
UPDATE estaciones SET troncal = 'Sin asignar' WHERE troncal IS NULL;

-- Tabla de reportes de ocupacion
CREATE TABLE IF NOT EXISTS reportes (
  id         SERIAL PRIMARY KEY,
  estacion   VARCHAR(120) NOT NULL,
  nivel      VARCHAR(20)  NOT NULL,
  usuario    VARCHAR(150),
  creado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices para busquedas rapidas
CREATE INDEX IF NOT EXISTS idx_estaciones_nombre  ON estaciones(nombre);
CREATE INDEX IF NOT EXISTS idx_estaciones_troncal ON estaciones(troncal);
CREATE INDEX IF NOT EXISTS idx_reportes_estacion ON reportes(estacion);

-- Verificacion
SELECT COUNT(*) AS total_estaciones FROM estaciones;
