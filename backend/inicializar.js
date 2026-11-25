/**
 * TransmiFlow - Prepara la base de datos automaticamente.
 *
 * Se ejecuta al arrancar el servidor. Es idempotente: se puede
 * ejecutar las veces que quieras sin romper nada.
 *
 * Hace tres cosas:
 *   1. Crea las tablas que faltan (no toca las que ya existen)
 *   2. Crea los indices
 *   3. Si la tabla de estaciones esta vacia, carga las 153 del JSON
 *      Si las tablas de rutas / camaras estan vacias, cargan sus datos
 */
const fs = require('fs');
const path = require('path');

const ARCHIVO_ESTACIONES = path.join(__dirname, 'datos', 'estaciones.json');
const ARCHIVO_RUTAS = path.join(__dirname, 'datos', 'rutas.json');
const ARCHIVO_CAMARAS = path.join(__dirname, 'datos', 'camaras.json');

// ---------------------------------------------------------------
// Esquema
// ---------------------------------------------------------------
const ESQUEMA = [
  `CREATE TABLE IF NOT EXISTS usuarios (
     id         SERIAL PRIMARY KEY,
     nombre     VARCHAR(100) NOT NULL,
     email      VARCHAR(150) UNIQUE NOT NULL,
     password   VARCHAR(255) NOT NULL,
     rol        VARCHAR(20) DEFAULT 'usuario',
     codigo_operador VARCHAR(20),
     creado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`,

  `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol VARCHAR(20) DEFAULT 'usuario'`,
  `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS codigo_operador VARCHAR(20)`,

  // tipo / latitud / longitud se conservan por compatibilidad
  // con el esquema previo del proyecto
  `CREATE TABLE IF NOT EXISTS estaciones (
     id           SERIAL PRIMARY KEY,
     nombre       VARCHAR(120) NOT NULL,
     tipo         VARCHAR(60)  NOT NULL,
     latitud      NUMERIC(10,7) NOT NULL,
     longitud     NUMERIC(10,7) NOT NULL,
     troncal      VARCHAR(60),
     aglomeracion VARCHAR(20) DEFAULT 'Media',
     capacidad    INTEGER     DEFAULT 0,
     lat          NUMERIC(10,7),
     lng          NUMERIC(10,7)
   )`,

  `CREATE TABLE IF NOT EXISTS reportes (
     id         SERIAL PRIMARY KEY,
     estacion   VARCHAR(120) NOT NULL,
     ruta       VARCHAR(20),
     nivel      VARCHAR(20)  NOT NULL,
     usuario    VARCHAR(150),
     creado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`,
  `ALTER TABLE reportes ADD COLUMN IF NOT EXISTS ruta VARCHAR(20)`,

  // Modulo Operario: despachos de buses
  `CREATE TABLE IF NOT EXISTS despachos (
     id         SERIAL PRIMARY KEY,
     estacion  VARCHAR(120) NOT NULL,
     ruta       VARCHAR(20),
     bus        VARCHAR(20) NOT NULL,
     tipo_bus   VARCHAR(30) DEFAULT 'Bus normal',
     operador  VARCHAR(150) NOT NULL,
     creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`,
  `ALTER TABLE despachos ADD COLUMN IF NOT EXISTS ruta VARCHAR(20)`,
  `ALTER TABLE despachos ADD COLUMN IF NOT EXISTS tipo_bus VARCHAR(30) DEFAULT 'Bus normal'`,
  `ALTER TABLE despachos ADD COLUMN IF NOT EXISTS conductor VARCHAR(30)`,
  `CREATE INDEX IF NOT EXISTS idx_despachos_estacion ON despachos(estacion)`,

  // Modulo Operario: rutas del sistema (linea + estaciones que la sirven)
  `CREATE TABLE IF NOT EXISTS rutas (
     id         SERIAL PRIMARY KEY,
     codigo     VARCHAR(20) NOT NULL,
     nombre     VARCHAR(160) NOT NULL,
     color_hex  VARCHAR(10)
   )`,
  `CREATE INDEX IF NOT EXISTS idx_rutas_codigo ON rutas(codigo)`,
  // Trazo de la ruta (misma estructura que usa el mapa del panel de usuario)
  `ALTER TABLE rutas ADD COLUMN IF NOT EXISTS coordenadas JSONB`,
  `ALTER TABLE rutas ADD COLUMN IF NOT EXISTS origen VARCHAR(160)`,
  `ALTER TABLE rutas ADD COLUMN IF NOT EXISTS destino VARCHAR(160)`,
  `CREATE TABLE IF NOT EXISTS ruta_estaciones (
     id         SERIAL PRIMARY KEY,
     ruta_id    INTEGER NOT NULL,
     estacion_id INTEGER NOT NULL,
     orden      INTEGER DEFAULT 0
   )`,
  `CREATE INDEX IF NOT EXISTS idx_ruta_estaciones_ruta ON ruta_estaciones(ruta_id)`,
  `CREATE INDEX IF NOT EXISTS idx_ruta_estaciones_estacion ON ruta_estaciones(estacion_id)`,

  // Modulo Operario: camaras de seguridad
  `CREATE TABLE IF NOT EXISTS camaras (
     id         SERIAL PRIMARY KEY,
     estacion  VARCHAR(120) NOT NULL,
     nombre    VARCHAR(160) NOT NULL,
     latitud   NUMERIC(10,7),
     longitud NUMERIC(10,7),
     creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`,
  `CREATE INDEX IF NOT EXISTS idx_camaras_estacion ON camaras(estacion)`,

  // Flota de buses y conductores para despacho
  `CREATE TABLE IF NOT EXISTS buses (
     id      SERIAL PRIMARY KEY,
     placa   VARCHAR(20) UNIQUE NOT NULL,
     tipo    VARCHAR(30) DEFAULT 'Bus normal',
     activo  BOOLEAN DEFAULT TRUE
   )`,
  `CREATE TABLE IF NOT EXISTS conductores (
     id      SERIAL PRIMARY KEY,
     nombre  VARCHAR(120) NOT NULL,
     cedula  VARCHAR(20) UNIQUE NOT NULL,
     telefono VARCHAR(20),
     activo  BOOLEAN DEFAULT TRUE
   )`,

  // Notificaciones: operario atendio un reporte
  `CREATE TABLE IF NOT EXISTS notificaciones (
     id         SERIAL PRIMARY KEY,
     usuario   VARCHAR(150) NOT NULL,
     mensaje   VARCHAR(255) NOT NULL,
     tipo       VARCHAR(30) DEFAULT 'operador',
     leido      BOOLEAN DEFAULT FALSE,
     creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`,
  `CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario)`,

  // Columnas extra por si la tabla ya existia con otra forma
  `ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS tipo         VARCHAR(60)`,
  `ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS latitud      NUMERIC(10,7)`,
  `ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS longitud     NUMERIC(10,7)`,
  `ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS troncal      VARCHAR(60)`,
  `ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS aglomeracion VARCHAR(20) DEFAULT 'Media'`,
  `ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS capacidad    INTEGER DEFAULT 0`,
  `ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS lat          NUMERIC(10,7)`,
  `ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS lng          NUMERIC(10,7)`,
  `ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS leido BOOLEAN DEFAULT FALSE`,

  // Indices
  `CREATE INDEX IF NOT EXISTS idx_usuarios_email       ON usuarios(email)`,
  `CREATE INDEX IF NOT EXISTS idx_estaciones_nombre     ON estaciones(nombre)`,
  `CREATE INDEX IF NOT EXISTS idx_estaciones_troncal    ON estaciones(troncal)`,
  `CREATE INDEX IF NOT EXISTS idx_reportes_estacion    ON reportes(estacion)`,

  // --- Normalizacion relacional: llaves foraneas e integridad ---
  `ALTER TABLE reportes ADD COLUMN IF NOT EXISTS estacion_id INTEGER`,
  `ALTER TABLE reportes ADD COLUMN IF NOT EXISTS ruta_id INTEGER`,
  `ALTER TABLE reportes ADD COLUMN IF NOT EXISTS usuario_id INTEGER`,
  `ALTER TABLE despachos ADD COLUMN IF NOT EXISTS estacion_id INTEGER`,
  `ALTER TABLE despachos ADD COLUMN IF NOT EXISTS ruta_id INTEGER`,
  `ALTER TABLE despachos ADD COLUMN IF NOT EXISTS bus_id INTEGER`,
  `ALTER TABLE despachos ADD COLUMN IF NOT EXISTS conductor_id INTEGER`,
  `ALTER TABLE despachos ADD COLUMN IF NOT EXISTS operador_id INTEGER`,
  `ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS usuario_id INTEGER`,
  `ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS reporte_id INTEGER`,
  `ALTER TABLE camaras ADD COLUMN IF NOT EXISTS estacion_id INTEGER`,

  `ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS direccion VARCHAR(255)`,
  `ALTER TABLE estaciones ADD COLUMN IF NOT EXISTS portal VARCHAR(120)`,
  `ALTER TABLE reportes ADD COLUMN IF NOT EXISTS vagon_id INTEGER`,
  `ALTER TABLE camaras ADD COLUMN IF NOT EXISTS vagon_id INTEGER`,
  `CREATE TABLE IF NOT EXISTS vagones (
     id SERIAL PRIMARY KEY,
     estacion_id INTEGER NOT NULL REFERENCES estaciones(id) ON DELETE CASCADE,
     nombre VARCHAR(120) NOT NULL,
     sentido VARCHAR(20) NOT NULL DEFAULT 'Ida',
     activo BOOLEAN DEFAULT TRUE
   )`,
  `CREATE TABLE IF NOT EXISTS vagon_rutas (
     id SERIAL PRIMARY KEY,
     vagon_id INTEGER NOT NULL REFERENCES vagones(id) ON DELETE CASCADE,
     ruta_id INTEGER NOT NULL REFERENCES rutas(id) ON DELETE CASCADE,
     orden INTEGER DEFAULT 0
   )`,

  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_rep_est') THEN ALTER TABLE reportes ADD CONSTRAINT fk_rep_est FOREIGN KEY (estacion_id) REFERENCES estaciones(id) ON DELETE SET NULL; END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_rep_ruta') THEN ALTER TABLE reportes ADD CONSTRAINT fk_rep_ruta FOREIGN KEY (ruta_id) REFERENCES rutas(id) ON DELETE SET NULL; END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_rep_usu') THEN ALTER TABLE reportes ADD CONSTRAINT fk_rep_usu FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL; END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_des_est') THEN ALTER TABLE despachos ADD CONSTRAINT fk_des_est FOREIGN KEY (estacion_id) REFERENCES estaciones(id) ON DELETE SET NULL; END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_des_ruta') THEN ALTER TABLE despachos ADD CONSTRAINT fk_des_ruta FOREIGN KEY (ruta_id) REFERENCES rutas(id) ON DELETE SET NULL; END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_des_bus') THEN ALTER TABLE despachos ADD CONSTRAINT fk_des_bus FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE SET NULL; END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_des_cond') THEN ALTER TABLE despachos ADD CONSTRAINT fk_des_cond FOREIGN KEY (conductor_id) REFERENCES conductores(id) ON DELETE SET NULL; END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_des_op') THEN ALTER TABLE despachos ADD CONSTRAINT fk_des_op FOREIGN KEY (operador_id) REFERENCES usuarios(id) ON DELETE SET NULL; END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_not_usu') THEN ALTER TABLE notificaciones ADD CONSTRAINT fk_not_usu FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE; END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_not_rep') THEN ALTER TABLE notificaciones ADD CONSTRAINT fk_not_rep FOREIGN KEY (reporte_id) REFERENCES reportes(id) ON DELETE CASCADE; END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_cam_est') THEN ALTER TABLE camaras ADD CONSTRAINT fk_cam_est FOREIGN KEY (estacion_id) REFERENCES estaciones(id) ON DELETE SET NULL; END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_rep_vagon') THEN ALTER TABLE reportes ADD CONSTRAINT fk_rep_vagon FOREIGN KEY (vagon_id) REFERENCES vagones(id) ON DELETE SET NULL; END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_cam_vagon') THEN ALTER TABLE camaras ADD CONSTRAINT fk_cam_vagon FOREIGN KEY (vagon_id) REFERENCES vagones(id) ON DELETE SET NULL; END IF; END $$;`,

  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='uq_buses_placa') THEN ALTER TABLE buses ADD CONSTRAINT uq_buses_placa UNIQUE (placa); END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='uq_cond_cedula') THEN ALTER TABLE conductores ADD CONSTRAINT uq_cond_cedula UNIQUE (cedula); END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='uq_rutas_codigo') THEN ALTER TABLE rutas ADD CONSTRAINT uq_rutas_codigo UNIQUE (codigo); END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ck_rep_nivel') THEN ALTER TABLE reportes ADD CONSTRAINT ck_rep_nivel CHECK (nivel IN ('Baja','Media','Alta')); END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ck_usu_rol') THEN ALTER TABLE usuarios ADD CONSTRAINT ck_usu_rol CHECK (rol IN ('usuario','operario')); END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ck_des_tipo') THEN ALTER TABLE despachos ADD CONSTRAINT ck_des_tipo CHECK (tipo_bus IS NULL OR tipo_bus IN ('Bus normal','Biarticulado')); END IF; END $$;`,

  `CREATE INDEX IF NOT EXISTS idx_rep_est_id ON reportes(estacion_id)`,
  `CREATE INDEX IF NOT EXISTS idx_rep_ruta_id ON reportes(ruta_id)`,
  `CREATE INDEX IF NOT EXISTS idx_des_est_id ON despachos(estacion_id)`,
  `CREATE INDEX IF NOT EXISTS idx_des_ruta_id ON despachos(ruta_id)`,
  `CREATE INDEX IF NOT EXISTS idx_not_usu_id ON notificaciones(usuario_id)`,

  // Modulo de monitoreo de aglomeracion por camaras (IA)
  `CREATE TABLE IF NOT EXISTS monitoring_stations (
     id BIGSERIAL PRIMARY KEY,
     code VARCHAR(50) NOT NULL UNIQUE,
     name VARCHAR(150) NOT NULL,
     location TEXT,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   )`,
  `CREATE TABLE IF NOT EXISTS monitoring_zones (
     id BIGSERIAL PRIMARY KEY,
     station_id BIGINT NOT NULL REFERENCES monitoring_stations(id) ON DELETE CASCADE,
     vagon_id BIGINT REFERENCES vagones(id) ON DELETE SET NULL,
     ruta_codigo VARCHAR(20),
     code VARCHAR(50) NOT NULL,
     name VARCHAR(150) NOT NULL,
     capacity INTEGER NOT NULL CHECK (capacity > 0),
     area_m2 NUMERIC(10,2) CHECK (area_m2 IS NULL OR area_m2 > 0),
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     UNIQUE(station_id, code)
   )`,
  `CREATE TABLE IF NOT EXISTS monitoring_cameras (
     id BIGSERIAL PRIMARY KEY,
     zone_id BIGINT NOT NULL REFERENCES monitoring_zones(id) ON DELETE CASCADE,
     code VARCHAR(50) NOT NULL UNIQUE,
     name VARCHAR(160) NOT NULL,
     source TEXT NOT NULL DEFAULT '0',
     polygon JSONB NOT NULL DEFAULT '[]'::jsonb,
     enabled BOOLEAN NOT NULL DEFAULT TRUE,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   )`,
  `CREATE TABLE IF NOT EXISTS monitoring_metrics (
     id BIGSERIAL PRIMARY KEY,
     camera_id BIGINT NOT NULL REFERENCES monitoring_cameras(id) ON DELETE CASCADE,
     people_count INTEGER NOT NULL CHECK (people_count >= 0),
     occupancy_percentage NUMERIC(7,2) NOT NULL,
     density_people_m2 NUMERIC(7,2),
     crowd_level VARCHAR(30) NOT NULL,
     captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   )`,
  `CREATE INDEX IF NOT EXISTS idx_mon_metrics_camera_time ON monitoring_metrics(camera_id, captured_at DESC)`,
  `CREATE TABLE IF NOT EXISTS monitoring_alerts (
     id BIGSERIAL PRIMARY KEY,
     zone_id BIGINT NOT NULL REFERENCES monitoring_zones(id) ON DELETE CASCADE,
     camera_id BIGINT REFERENCES monitoring_cameras(id) ON DELETE SET NULL,
     level VARCHAR(30) NOT NULL,
     message TEXT NOT NULL,
     occupancy_percentage NUMERIC(7,2) NOT NULL,
     status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','acknowledged','resolved')),
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     acknowledged_at TIMESTAMPTZ,
     acknowledged_by VARCHAR(150)
   )`,
  `CREATE INDEX IF NOT EXISTS idx_mon_alerts_status ON monitoring_alerts(status, created_at DESC)`,
];

// ---------------------------------------------------------------
// Siembra
// ---------------------------------------------------------------
async function sembrarSiEstaVacia(pool) {
  const actual = await pool.query('SELECT COUNT(*) AS n FROM estaciones');
  if (parseInt(actual.rows[0].n, 10) > 0) {
    console.log('   Estaciones ya cargadas: ' + actual.rows[0].n);
    return;
  }

  if (!fs.existsSync(ARCHIVO_ESTACIONES)) {
    console.warn('   No se encontro datos/estaciones.json: la tabla queda vacia.');
    return;
  }

  const datos = JSON.parse(fs.readFileSync(ARCHIVO_ESTACIONES, 'utf8'));
  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');
    for (const e of datos) {
      await cliente.query(
        `INSERT INTO estaciones
           (nombre, tipo, latitud, longitud, lat, lng, troncal, aglomeracion, capacidad)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [e.nombre, e.tipo || 'troncal', e.lat, e.lng, e.lat, e.lng,
         e.troncal, e.aglomeracion, e.capacidad || 0]
      );
    }
    await cliente.query('COMMIT');
    console.log('   Cargadas ' + datos.length + ' estaciones desde datos/estaciones.json');
  } catch (e) {
    await cliente.query('ROLLBACK');
    throw e;
  } finally {
    cliente.release();
  }
}

async function sembrarRutas(pool) {
  const actual = await pool.query('SELECT COUNT(*) AS n FROM rutas');
  if (parseInt(actual.rows[0].n, 10) > 0) {
    console.log('   Rutas ya cargadas: ' + actual.rows[0].n);
    return;
  }

  if (!fs.existsSync(ARCHIVO_RUTAS)) {
    console.warn('   No se encontro datos/rutas.json: la tabla rutas queda vacia.');
    return;
  }

  const datos = JSON.parse(fs.readFileSync(ARCHIVO_RUTAS, 'utf8'));
  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');
    for (const r of datos) {
      const ex = await cliente.query('SELECT id FROM rutas WHERE codigo = $1', [r.codigo]);
      if (ex.rows.length > 0) continue;
      await cliente.query(
        'INSERT INTO rutas (codigo, nombre, color_hex) VALUES ($1, $2, $3)',
        [r.codigo, r.nombre, r.color_hex || '#3b82f6']
      );
    }
    await cliente.query('COMMIT');
    console.log('   Cargadas ' + datos.length + ' rutas desde datos/rutas.json');
  } catch (e) {
    await cliente.query('ROLLBACK');
    throw e;
  } finally {
    cliente.release();
  }
}

async function sembrarCamaras(pool) {
  const actual = await pool.query('SELECT COUNT(*) AS n FROM camaras');
  if (parseInt(actual.rows[0].n, 10) > 0) {
    console.log('   Camaras ya cargadas: ' + actual.rows[0].n);
    return;
  }

  if (!fs.existsSync(ARCHIVO_CAMARAS)) {
    console.warn('   No se encontro datos/camaras.json: la tabla camaras queda vacia.');
    return;
  }

  const datos = JSON.parse(fs.readFileSync(ARCHIVO_CAMARAS, 'utf8'));
  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');
    for (const c of datos) {
      await cliente.query(
        'INSERT INTO camaras (estacion, nombre) VALUES ($1, $2)',
        [c.estacion, c.nombre]
      );
    }
    await cliente.query('COMMIT');
    console.log('   Cargadas ' + datos.length + ' camaras desde datos/camaras.json');
  } catch (e) {
    await cliente.query('ROLLBACK');
    throw e;
  } finally {
    cliente.release();
  }
}

/**
 * Completa la ruta de los reportes antiguos y crea reportes de practica.
 */
async function arreglarReportes(pool) {
  try {
    await pool.query(
      `UPDATE reportes r SET ruta = (
          SELECT ru.codigo
            FROM rutas ru
            JOIN ruta_estaciones re ON re.ruta_id = ru.id
            JOIN estaciones e ON e.id = re.estacion_id
           WHERE LOWER(e.nombre) = LOWER(r.estacion)
           ORDER BY ru.codigo
           LIMIT 1
        )
        WHERE r.ruta IS NULL OR r.ruta = ''`
    );

    const ya = await pool.query(
      "SELECT COUNT(*)::int n FROM reportes WHERE usuario LIKE 'practica%@transmiflow.local'");
    if (ya.rows[0].n > 0) {
      console.log('   Reportes de practica ya cargados');
      return;
    }

    const ejemplos = [
      ['Portal Américas', 'B28', 'Alta'],
      ['Museo Nacional', 'G47', 'Media'],
      ['Patio Bonito', '5 C', 'Alta'],
      ['Ricaurte - NQS', 'B12', 'Media'],
      ['Comuneros', 'G11', 'Baja'],
      ['Portal Norte – Unicervantes', 'B28', 'Alta']
    ];

    for (let i = 0; i < ejemplos.length; i++) {
      const [estacion, ruta, nivel] = ejemplos[i];
      await pool.query(
        'INSERT INTO reportes (estacion, ruta, nivel, usuario, creado_en) VALUES ($1,$2,$3,$4, NOW() - ($5 || \' minutes\')::interval)',
        [estacion, ruta, nivel, 'practica' + (i + 1) + '@transmiflow.local', (i + 1) * 7]
      );
    }
    console.log('   Reportes de practica creados: ' + ejemplos.length);
  } catch (err) {
    console.warn('   No se pudieron arreglar los reportes: ' + err.message);
  }
}

/**
 * Siembra buses y conductores de prueba para el despacho.
 */
async function sembrarFlota(pool) {
  try {
    const b = await pool.query('SELECT COUNT(*)::int n FROM buses');
    if (!b.rows[0].n) {
      const placas = [
        ['BCO-101','Bus normal'], ['BCO-102','Bus normal'], ['BCO-103','Bus normal'],
        ['BCO-104','Biarticulado'], ['BCO-105','Biarticulado'], ['BCO-106','Bus normal'],
        ['BCO-107','Bus normal'], ['BCO-108','Bus normal'], ['BCO-109','Biarticulado'],
        ['BCO-110','Bus normal'], ['BCO-111','Bus normal'], ['BCO-112','Bus normal']
      ];
      for (const [placa, tipo] of placas) {
        await pool.query('INSERT INTO buses (placa, tipo) VALUES ($1,$2)', [placa, tipo]);
      }
      console.log('   Buses de prueba creados: ' + placas.length);
    }

    const c = await pool.query('SELECT COUNT(*)::int n FROM conductores');
    if (!c.rows[0].n) {
      const conductores = [
        ['Carlos Ramírez','1012345678','3001112233'],
        ['María Gómez','1023456789','3002223344'],
        ['Johan Sánchez','1034567890','3003334455'],
        ['Andrés Torres','1045678901','3004445566'],
        ['Laura Martínez','1056789012','3005556677'],
        ['Diego Hernández','1067890123','3006667788']
      ];
      for (const [nombre, cedula, telefono] of conductores) {
        await pool.query('INSERT INTO conductores (nombre, cedula, telefono) VALUES ($1,$2,$3)', [nombre, cedula, telefono]);
      }
      console.log('   Conductores de prueba creados: ' + conductores.length);
    }
  } catch (err) {
    console.warn('   No se pudo sembrar la flota: ' + err.message);
  }
}

/**
 * Completa las llaves foraneas de registros existentes (creados antes de
 * normalizar el modelo) usando las columnas de texto originales.
 */
/**
 * Completa direccion ( ArcGIS ub_est ), portal, vagones por estacion
 * y genera reportes adicionales de prueba.
 */
/** Siembra estaciones, zonas por vagón y cámaras del módulo de monitoreo */
async function sincronizarMonitoreo(pool) {
  try {
    await pool.query(`INSERT INTO monitoring_stations (code, name, location)
      SELECT 'EST-' || id, nombre, direccion FROM estaciones
      WHERE NOT EXISTS (SELECT 1 FROM monitoring_stations ms WHERE ms.code = 'EST-' || estaciones.id)`);

    // Una zona por vagón, con la ruta que para en ese vagón
    await pool.query(`
      INSERT INTO monitoring_zones (station_id, vagon_id, ruta_codigo, code, name, capacity, area_m2)
      SELECT ms.id, v.id,
             (SELECT vr.codigo FROM vagon_rutas x JOIN rutas vr ON vr.id=x.ruta_id
               WHERE x.vagon_id=v.id ORDER BY x.orden LIMIT 1),
             'ZONA-' || v.id, v.nombre,
             GREATEST(20, COALESCE(e.capacidad,100) /
               GREATEST(1,(SELECT COUNT(*)::int FROM vagones vv WHERE vv.estacion_id=e.id))),
             50
        FROM monitoring_stations ms
        JOIN estaciones e ON 'EST-' || e.id = ms.code
        JOIN vagones v ON v.estacion_id = e.id
       WHERE NOT EXISTS (SELECT 1 FROM monitoring_zones z WHERE z.code = 'ZONA-' || v.id)`);

    // Camaras existentes enlazadas a su zona/vagón
    await pool.query(`
      INSERT INTO monitoring_cameras (zone_id, code, name, source, polygon)
      SELECT z.id, 'CAM-' || c.id, c.nombre, '0', '[[0,0],[640,0],[640,480],[0,480]]'::jsonb
        FROM camaras c
        JOIN monitoring_zones z ON z.code = 'ZONA-' || (
          SELECT v.id FROM vagones v
          WHERE v.estacion_id = c.estacion_id ORDER BY v.id LIMIT 1)
       WHERE NOT EXISTS (SELECT 1 FROM monitoring_cameras mc WHERE mc.code = 'CAM-' || c.id)`);

    console.log('   Modulo de monitoreo sincronizado');
  } catch (err) {
    console.warn('   No se pudo sincronizar monitoreo: ' + err.message);
  }
}

async function enriquecerRed(pool) {
  try {
    // Direccion desde el servicio oficial
    try {
      const BASE = 'https://gis.transmilenio.gov.co/arcgis/rest/services/' +
        'ConsultaSubgerenciaPlanificacionSITP/Consulta_Planificacion_SITP/FeatureServer';
      const body = new URLSearchParams({ f: 'json', where: '1=1',
        outFields: 'num_est,nom_est,ub_est,tipo_esta', returnGeometry: 'false', resultRecordCount: '3000' });
      const r = await fetch(BASE + '/2/query', { method: 'POST', body,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      const j = await r.json();
      const dirs = {};
      (j.features || []).forEach(function (f) {
        const a = f.attributes;
        if (a && a.nom_est && a.ub_est) { dirs[a.nom_est.trim().toLowerCase()] = a.ub_est; }
      });
      const ests = await pool.query('SELECT id, nombre FROM estaciones');
      for (const e of ests.rows) {
        const d = dirs[String(e.nombre).toLowerCase()];
        if (d) { await pool.query('UPDATE estaciones SET direccion=$1 WHERE id=$2', [d, e.id]); }
      }
      console.log('   Direcciones oficiales actualizadas');
    } catch (err) {
      console.warn('   No se pudieron actualizar direcciones: ' + err.message);
    }

    // Portal segun la troncal
    const portales = await pool.query("SELECT nombre FROM estaciones WHERE nombre ILIKE 'Portal%'");
    const claves = {};
    portales.rows.forEach(function (x) {
      const n = x.nombre.replace(/^Portal\s*/i, '').trim().toLowerCase();
      claves[n] = x.nombre;
    });
    claves['norte'] = 'Portal Norte – Unicervantes';
    claves['unicervantes'] = 'Portal Norte – Unicervantes';
    claves['occidental'] = 'Portal Américas';
    claves['sur'] = 'Portal Sur - JFK Coop. Financiera';
    const letras = {
      A:'Portal Norte – Unicervantes', B:'Portal Norte – Unicervantes',
      C:'Portal Suba', D:'Portal 80', E:'Portal 20 de Julio',
      F:'Portal Américas', G:'Portal Sur - JFK Coop. Financiera',
      H:'Portal El Dorado – C.C. Nuestro Bogotá', J:'Portal 20 de Julio',
      K:'Portal 20 de Julio', L:'Portal 20 de Julio', M:'Portal Tunal',
      N:'Portal Norte – Unicervantes', Q:'Portal Tunal', R:'Portal Usme',
      S:'Portal Usme', T:'Portal Tunal', U:'Portal Suba', V:'Portal 80',
      X:'Portal Américas', Y:'Portal Sur - JFK Coop. Financiera', Z:'Portal Usme'
    };
    const ests2 = await pool.query('SELECT id, nombre, troncal FROM estaciones');
    for (const e of ests2.rows) {
      const txt = (e.troncal || '').toLowerCase();
      let portal = null;
      Object.keys(claves).forEach(function (k) { if (!portal && txt.indexOf(k) !== -1) { portal = claves[k]; } });
      if (!portal) {
        const m = (e.troncal || '').trim().match(/^([A-Za-z])/);
        if (m && letras[m[1].toUpperCase()]) { portal = letras[m[1].toUpperCase()]; }
      }
      if (portal) { await pool.query('UPDATE estaciones SET portal=$1 WHERE id=$2', [portal, e.id]); }
    }

    // Vagones: 2 por estacion (ida y vuelta) con las rutas que paran en cada uno
    const rutasEst = await pool.query(
      'SELECT e.id AS estacion_id, r.id AS ruta_id, r.codigo, re.orden, ' +
      '(SELECT COUNT(*)::int FROM ruta_estaciones x WHERE x.ruta_id = r.id) AS total ' +
      'FROM estaciones e JOIN ruta_estaciones re ON re.estacion_id = e.id ' +
      'JOIN rutas r ON r.id = re.ruta_id ORDER BY e.id, r.codigo');
    const porEst = {};
    rutasEst.rows.forEach(function (x) {
      if (!porEst[x.estacion_id]) { porEst[x.estacion_id] = []; }
      porEst[x.estacion_id].push(x);
    });

    for (const id of Object.keys(porEst)) {
      const yaVagon = await pool.query('SELECT COUNT(*)::int n FROM vagones WHERE estacion_id=$1', [id]);
      if (yaVagon.rows[0].n > 0) { continue; }
      const lista = porEst[id];
      const v1 = await pool.query(
        "INSERT INTO vagones (estacion_id, nombre, sentido) VALUES ($1,'Vagón 1 · Ida','Ida') RETURNING id", [id]);
      const v2 = await pool.query(
        "INSERT INTO vagones (estacion_id, nombre, sentido) VALUES ($1,'Vagón 2 · Vuelta','Vuelta') RETURNING id", [id]);
      for (const r of lista) {
        const mitad = r.total / 2;
        const vagon = r.orden <= mitad ? v1.rows[0].id : v2.rows[0].id;
        await pool.query('INSERT INTO vagon_rutas (vagon_id, ruta_id, orden) VALUES ($1,$2,$3)', [vagon, r.ruta_id, r.orden]);
      }
    }
    console.log('   Vagones creados: ' + Object.keys(porEst).length + ' estaciones');

    // Camaras: asignar al Vagon 1 de su estacion
    await pool.query(`UPDATE camaras c SET vagon_id = (
        SELECT v.id FROM vagones v WHERE v.estacion_id = c.estacion_id ORDER BY v.id LIMIT 1)
      WHERE c.vagon_id IS NULL AND c.estacion_id IS NOT NULL`);

    // 17 reportes adicionales en estaciones y rutas distintas
    const ya = await pool.query("SELECT COUNT(*)::int n FROM reportes WHERE usuario LIKE 'extra%@transmiflow.local'");
    if (!ya.rows[0].n) {
      const ejemplos = [
        ['Portal Américas','B28','Alta'], ['Portal Américas','F28','Alta'],
        ['Portal Norte – Unicervantes','B28','Media'], ['Museo Nacional','G47','Alta'],
        ['Museo Nacional','2 M','Media'], ['Patio Bonito','5 C','Alta'],
        ['Ricaurte - CL 13','B12','Media'], ['Ricaurte - NQS','B12','Alta'],
        ['Comuneros','G11','Media'], ['Santa Isabel','G11','Baja'],
        ['Portal Suba','C19','Alta'], ['Portal 80','D10','Media'],
        ['Portal Tunal','K43','Alta'], ['Portal Usme','L41','Media'],
        ['Portal Sur - JFK Coop. Financiera','B46','Alta'], ['Calle 26 - Atrio','1 P','Media'],
        ['Temporal Calle 34','8 G','Alta']
      ];
      for (let i = 0; i < ejemplos.length; i++) {
        const [est, ruta, nivel] = ejemplos[i];
        await pool.query(
          'INSERT INTO reportes (estacion, ruta, nivel, usuario, creado_en) VALUES ($1,$2,$3,$4, NOW() - ($5||\' hours\')::interval)',
          [est, ruta, nivel, 'extra' + (i + 1) + '@transmiflow.local', i + 1]
        );
      }
      console.log('   Reportes adicionales creados: 17');
    }
  } catch (err) {
    console.warn('   No se pudo enriquecer la red: ' + err.message);
  }
}

async function normalizarRelaciones(pool) {
  try {
    // Usuario de sistema para los reportes generados por camaras/IA
    await pool.query(
      "INSERT INTO usuarios (nombre, email, password, rol) " +
      "VALUES ('Sistema Cámaras', 'camara@transmiflow.local', " +
      "'$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2', 'usuario') " +
      "ON CONFLICT (email) DO NOTHING");

    // Crear referencias faltantes para datos heredados (texto sin FK)
    await pool.query(`INSERT INTO buses (placa, tipo)
      SELECT DISTINCT d.bus, COALESCE(d.tipo_bus,'Bus normal')
        FROM despachos d
       WHERE d.bus IS NOT NULL AND d.bus <> ''
         AND NOT EXISTS (SELECT 1 FROM buses b WHERE b.placa = d.bus)`);
    await pool.query(`INSERT INTO conductores (nombre, cedula)
      SELECT DISTINCT 'Conductor importado', d.conductor
        FROM despachos d
       WHERE d.conductor IS NOT NULL AND d.conductor <> ''
         AND NOT EXISTS (SELECT 1 FROM conductores c WHERE c.cedula = d.conductor)`);
    await pool.query(`INSERT INTO usuarios (nombre, email, password, rol)
      SELECT DISTINCT 'Usuario practica', r.usuario, '$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2', 'usuario'
        FROM reportes r
       WHERE r.usuario LIKE '%@%'
         AND NOT EXISTS (SELECT 1 FROM usuarios u WHERE LOWER(u.email)=LOWER(r.usuario))`);

    await pool.query(`UPDATE reportes r SET
        estacion_id = (SELECT id FROM estaciones WHERE LOWER(nombre)=LOWER(r.estacion) LIMIT 1),
        ruta_id = (SELECT id FROM rutas WHERE codigo=r.ruta LIMIT 1),
        usuario_id = (SELECT id FROM usuarios WHERE LOWER(email)=LOWER(r.usuario) LIMIT 1)
      WHERE estacion_id IS NULL OR ruta_id IS NULL OR usuario_id IS NULL`);

    await pool.query(`UPDATE despachos d SET
        estacion_id = (SELECT id FROM estaciones WHERE LOWER(nombre)=LOWER(d.estacion) LIMIT 1),
        ruta_id = (SELECT id FROM rutas WHERE codigo=d.ruta LIMIT 1),
        bus_id = (SELECT id FROM buses WHERE placa=d.bus LIMIT 1),
        conductor_id = (SELECT id FROM conductores WHERE cedula=d.conductor LIMIT 1),
        operador_id = (SELECT id FROM usuarios WHERE LOWER(email)=LOWER(d.operador) LIMIT 1)
      WHERE estacion_id IS NULL OR ruta_id IS NULL OR bus_id IS NULL OR conductor_id IS NULL OR operador_id IS NULL`);

    await pool.query(`UPDATE notificaciones n SET
        usuario_id = (SELECT id FROM usuarios WHERE LOWER(email)=LOWER(n.usuario) LIMIT 1),
        reporte_id = (SELECT r.id FROM reportes r WHERE LOWER(r.usuario)=LOWER(n.usuario)
                      AND n.mensaje LIKE '%' || r.estacion || '%'
                      ORDER BY r.creado_en DESC LIMIT 1)
      WHERE usuario_id IS NULL`);

    await pool.query(`UPDATE camaras c SET
        estacion_id = (SELECT id FROM estaciones WHERE LOWER(nombre)=LOWER(c.estacion) LIMIT 1)
      WHERE estacion_id IS NULL`);

    console.log('   Relaciones normalizadas');
  } catch (err) {
    console.warn('   No se pudieron normalizar las relaciones: ' + err.message);
  }
}

/**
 * Sincroniza las rutas oficiales de Transmilenio (servicio ArcGIS) con las
 * tablas rutas / ruta_estaciones de la base de datos.
 *
 * Asi el sistema guarda las rutas con sus paradas y el usuario puede verlas
 * aunque el servicio externo no este disponible. Es idempotente: si ya estan
 * sincronizadas no vuelve a escribir nada.
 */
async function sincronizarRutasOficiales(pool) {
  try {
    const oficial = require('./controllers/rutasOficialesController');
    const data = await oficial.obtenerDatos();
    if (!data || !data.rutas || !data.rutas.length) {
      console.log('   No hay rutas oficiales para sincronizar');
      return;
    }

    // Estaciones de la base de datos indexadas por nombre normalizado
    const estDB = await pool.query('SELECT id, nombre, lat, lng FROM estaciones');
    const porNombre = {};
    estDB.rows.forEach(function (e) {
      const k = oficial.norm(e.nombre);
      if (!porNombre[k]) { porNombre[k] = []; }
      porNombre[k].push(e);
    });

    // Cuando dos estaciones comparten nombre (ej. Temporal AV. Jiménez),
    // se elige la mas cercana por coordenadas para no mezclar sus paradas
    function estacionIdPorNombre(nombre, lat, lng) {
      const lista = porNombre[oficial.norm(nombre)] || [];
      if (!lista.length) { return null; }
      if (lista.length === 1) { return lista[0].id; }
      let mejor = lista[0];
      let mejorDist = Infinity;
      lista.forEach(function (e) {
        const dla = (e.lat != null ? parseFloat(e.lat) : 0) - (lat || 0);
        const dlo = (e.lng != null ? parseFloat(e.lng) : 0) - (lng || 0);
        const d = dla * dla + dlo * dlo;
        if (d < mejorDist) { mejorDist = d; mejor = e; }
      });
      return mejor.id;
    }

    const codigos = Array.from(new Set(data.rutas.map(function (r) { return r.codigo; })));
    const ya = await pool.query(
      'SELECT COUNT(*)::int n FROM rutas WHERE codigo = ANY($1) AND coordenadas IS NOT NULL AND origen IS NOT NULL', [codigos]);
    const paradas = await pool.query(
      'SELECT COUNT(*)::int n FROM ruta_estaciones re JOIN rutas r ON r.id = re.ruta_id WHERE r.codigo = ANY($1)',
      [codigos]
    );
    if (ya.rows[0].n === codigos.length && paradas.rows[0].n > 0 && process.env.RECALCULAR_RUTAS !== '1') {
      console.log('   Rutas oficiales ya sincronizadas: ' + ya.rows[0].n);
      return;
    }

    const cliente = await pool.connect();
    let rutasNuevas = 0;
    let paradasNuevas = 0;
    try {
      await cliente.query('BEGIN');

      for (const r of data.rutas) {
        const ex = await cliente.query('SELECT id FROM rutas WHERE codigo = $1 LIMIT 1', [r.codigo]);
        const nombreRuta = r.nombre + ' - ' + r.origen + ' → ' + r.destino;
        const trazo = JSON.stringify(r.coordenadas || []);
        let rutaId;
        if (ex.rows.length) {
          rutaId = ex.rows[0].id;
          await cliente.query(
            'UPDATE rutas SET nombre = $1, color_hex = $2, coordenadas = $3::jsonb, origen = $4, destino = $5 WHERE id = $6',
            [nombreRuta, r.color_hex || '#3b82f6', trazo, r.origen || '', r.destino || '', rutaId]);
        } else {
          const ins = await cliente.query(
            'INSERT INTO rutas (codigo, nombre, color_hex, coordenadas, origen, destino) ' +
            'VALUES ($1, $2, $3, $4::jsonb, $5, $6) RETURNING id',
            [r.codigo, nombreRuta, r.color_hex || '#3b82f6', trazo, r.origen || '', r.destino || '']
          );
          rutaId = ins.rows[0].id;
          rutasNuevas++;
        }

        await cliente.query('DELETE FROM ruta_estaciones WHERE ruta_id = $1', [rutaId]);

        const rutasId = [];
        const estacionesId = [];
        const ordenes = [];
        let orden = 0;
        for (const p of r.estaciones) {
          const estId = estacionIdPorNombre(p.nombre, p.latitud, p.longitud);
          if (!estId) continue;
          orden++;
          rutasId.push(rutaId);
          estacionesId.push(estId);
          ordenes.push(orden);
        }
        if (rutasId.length) {
          await cliente.query(
            'INSERT INTO ruta_estaciones (ruta_id, estacion_id, orden) ' +
            'SELECT * FROM unnest($1::int[], $2::int[], $3::int[])',
            [rutasId, estacionesId, ordenes]
          );
          paradasNuevas += rutasId.length;
        }
      }

      await cliente.query('COMMIT');
      console.log('   Rutas oficiales sincronizadas: ' + data.rutas.length +
        ' (' + rutasNuevas + ' nuevas, ' + paradasNuevas + ' paradas)');
    } catch (e) {
      await cliente.query('ROLLBACK');
      throw e;
    } finally {
      cliente.release();
    }
  } catch (err) {
    // Nunca debe impedir que la aplicacion arranque
    console.warn('   No se pudieron sincronizar las rutas oficiales: ' + err.message);
  }
}

// ---------------------------------------------------------------
// Proceso completo
// ---------------------------------------------------------------
async function inicializar(pool, intentos = 5) {
  for (let i = 1; i <= intentos; i++) {
    try {
      await pool.query('SELECT 1');
      break;
    } catch (err) {
      if (i === intentos) throw err;
      const espera = i * 2000;
      console.log('   No se pudo conectar (' + err.message + ')');
      console.log('   Reintento ' + i + ' de ' + intentos + ' en ' + espera / 1000 + 's...');
      await new Promise(r => setTimeout(r, espera));
    }
  }

  for (const sql of ESQUEMA) {
    await pool.query(sql);
  }
  await sembrarSiEstaVacia(pool);
  await sembrarRutas(pool);
  await sembrarCamaras(pool);
  await sembrarFlota(pool);
  await arreglarReportes(pool);
  await enriquecerRed(pool);
  await sincronizarMonitoreo(pool);
  await normalizarRelaciones(pool);
  await sincronizarRutasOficiales(pool);
}

module.exports = { inicializar };
