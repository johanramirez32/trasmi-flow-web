-- ============================================================
-- TransmiFlow - Modelo relacional (DDL) - Documentacion
-- Basado en el esquema real del backend
-- ============================================================

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'usuario',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE estaciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    tipo VARCHAR(60),
    latitud NUMERIC(10,7),
    longitud NUMERIC(10,7),
    troncal VARCHAR(60),
    aglomeracion VARCHAR(20) DEFAULT 'Media',
    capacidad INTEGER DEFAULT 0,
    lat NUMERIC(10,7),
    lng NUMERIC(10,7)
);

CREATE TABLE reportes (
    id SERIAL PRIMARY KEY,
    estacion VARCHAR(120) NOT NULL,
    nivel VARCHAR(20) NOT NULL,
    usuario VARCHAR(150),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_estaciones_nombre  ON estaciones(nombre);
CREATE INDEX IF NOT EXISTS idx_estaciones_troncal ON estaciones(troncal);
CREATE INDEX IF NOT EXISTS idx_reportes_estacion ON reportes(estacion);
