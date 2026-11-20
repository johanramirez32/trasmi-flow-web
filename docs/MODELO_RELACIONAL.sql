-- ============================================================
-- TransmiFlow - Modelo relacional (DDL) - Documentacion actualizada
-- Basado en el esquema real del backend (inicializar.js)
-- ============================================================

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,          -- hash bcrypt
    rol VARCHAR(20) DEFAULT 'usuario' CHECK (rol IN ('usuario','operario')),
    codigo_operador VARCHAR(20),              -- requerido solo para operario
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

CREATE TABLE rutas (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(160) NOT NULL,
    color_hex VARCHAR(10),
    coordenadas JSONB,                        -- trazo del corredor [lat,lng]
    origen VARCHAR(160),
    destino VARCHAR(160)
);

-- Muchos a muchos: una ruta sirve varias estaciones y viceversa
CREATE TABLE ruta_estaciones (
    id SERIAL PRIMARY KEY,
    ruta_id INTEGER NOT NULL REFERENCES rutas(id) ON DELETE CASCADE,
    estacion_id INTEGER NOT NULL REFERENCES estaciones(id) ON DELETE CASCADE,
    orden INTEGER DEFAULT 0                   -- orden de la parada en la ruta
);

CREATE TABLE reportes (
    id SERIAL PRIMARY KEY,
    estacion VARCHAR(120) NOT NULL,
    estacion_id INTEGER REFERENCES estaciones(id) ON DELETE SET NULL,
    ruta VARCHAR(20),
    ruta_id INTEGER REFERENCES rutas(id) ON DELETE SET NULL,
    nivel VARCHAR(20) NOT NULL CHECK (nivel IN ('Baja','Media','Alta')),
    usuario VARCHAR(150),
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buses (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(20) UNIQUE NOT NULL,
    tipo VARCHAR(30) DEFAULT 'Bus normal',
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE conductores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE despachos (
    id SERIAL PRIMARY KEY,
    estacion VARCHAR(120) NOT NULL,
    estacion_id INTEGER REFERENCES estaciones(id) ON DELETE SET NULL,
    ruta VARCHAR(20),
    ruta_id INTEGER REFERENCES rutas(id) ON DELETE SET NULL,
    bus VARCHAR(20) NOT NULL,                 -- placa del bus
    bus_id INTEGER REFERENCES buses(id) ON DELETE SET NULL,
    conductor VARCHAR(30),                    -- cedula del conductor
    conductor_id INTEGER REFERENCES conductores(id) ON DELETE SET NULL,
    tipo_bus VARCHAR(30) CHECK (tipo_bus IN ('Bus normal','Biarticulado')),
    operador VARCHAR(150) NOT NULL,
    operador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notificaciones (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(150) NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    reporte_id INTEGER REFERENCES reportes(id) ON DELETE CASCADE,
    mensaje VARCHAR(255) NOT NULL,
    tipo VARCHAR(30) DEFAULT 'operador',
    leido BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE camaras (
    id SERIAL PRIMARY KEY,
    estacion VARCHAR(120) NOT NULL,
    estacion_id INTEGER REFERENCES estaciones(id) ON DELETE SET NULL,
    nombre VARCHAR(160) NOT NULL,
    latitud NUMERIC(10,7),
    longitud NUMERIC(10,7),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices
CREATE INDEX idx_estaciones_nombre ON estaciones(nombre);
CREATE INDEX idx_estaciones_troncal ON estaciones(troncal);
CREATE INDEX idx_rutas_codigo ON rutas(codigo);
CREATE INDEX idx_ruta_estaciones_ruta ON ruta_estaciones(ruta_id);
CREATE INDEX idx_ruta_estaciones_estacion ON ruta_estaciones(estacion_id);
CREATE INDEX idx_reportes_estacion ON reportes(estacion);
CREATE INDEX idx_reportes_est_id ON reportes(estacion_id);
CREATE INDEX idx_reportes_ruta_id ON reportes(ruta_id);
CREATE INDEX idx_despachos_estacion ON despachos(estacion);
CREATE INDEX idx_despachos_est_id ON despachos(estacion_id);
CREATE INDEX idx_despachos_ruta_id ON despachos(ruta_id);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario);
CREATE INDEX idx_not_usu_id ON notificaciones(usuario_id);
CREATE INDEX idx_camaras_estacion ON camaras(estacion);

-- Notas de integridad
-- * Las columnas de texto (estacion, ruta, usuario, bus, conductor) se mantienen
--   para compatibilidad y despliegue en el panel; las columnas *_id son las
--   relaciones formales y se llenan al crear cada registro.
-- * notificaciones.reporte_id enlaza directamente el reporte atendido por un
--   despacho, evitando comparaciones fragiles por texto.
-- * reportes.ruta y ruta_estaciones.orden permiten saber que ruta genero la
--   aglomeracion y en que orden se recorren las paradas.
