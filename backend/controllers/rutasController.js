/**
 * Controller de rutas: consulta rutas y sus estaciones (inicio, fin, paradas).
 * GET /api/rutas
 * GET /api/rutas/estacion/:nombre
 *
 * Si la base de datos no tiene rutas para la estacion, se responde con los
 * datos oficiales de Transmilenio (ArcGIS) para que el usuario siempre vea
 * las rutas que le sirven.
 */
const { getPool } = require('../db');
const oficial = require('./rutasOficialesController');

const pool = getPool();

/** Normaliza texto: minusculas, sin acentos ni puntuacion */
function norm(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/** Convierte una fila de estacion de la BD al formato comun de paradas */
function parada(x, orden) {
  return {
    id: x.estacion_id,
    nombre: x.estacion_nombre,
    lat: x.estacion_lat != null ? parseFloat(x.estacion_lat) : null,
    lng: x.estacion_lng != null ? parseFloat(x.estacion_lng) : null,
    latitud: x.estacion_lat != null ? parseFloat(x.estacion_lat) : null,
    longitud: x.estacion_lng != null ? parseFloat(x.estacion_lng) : null,
    orden: orden != null ? orden : x.orden
  };
}

async function listarRutas(req, res) {
  try {
    // Una sola consulta: evita el N+1 cuando hay muchas rutas
    const r = await pool.query(
      'SELECT r.id, r.codigo, r.nombre, r.color_hex, r.coordenadas, r.origen, r.destino, re.orden, ' +
      'e.id AS estacion_id, e.nombre AS estacion_nombre, e.lat AS estacion_lat, e.lng AS estacion_lng ' +
      'FROM rutas r ' +
      'LEFT JOIN ruta_estaciones re ON re.ruta_id = r.id ' +
      'LEFT JOIN estaciones e ON e.id = re.estacion_id ' +
      'ORDER BY r.codigo, re.orden'
    );

    const mapa = {};
    const orden = [];
    r.rows.forEach(function (x) {
      if (!mapa[x.id]) {
        mapa[x.id] = {
          id: x.id, codigo: x.codigo, nombre: x.nombre, color_hex: x.color_hex,
          origen: x.origen || '', destino: x.destino || '',
          coordenadas: Array.isArray(x.coordenadas) ? x.coordenadas : [],
          estaciones: []
        };
        orden.push(x.id);
      }
      if (x.estacion_id != null) {
        mapa[x.id].estaciones.push(parada(x));
      }
    });

    res.json({ rutas: orden.map(function (id) { return mapa[id]; }) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron cargar las rutas.' });
  }
}

/** Busca la estacion en la BD tolerando acentos y diferencias de escritura */
async function buscarEstacion(nombre) {
  const exacto = await pool.query('SELECT * FROM estaciones WHERE LOWER(nombre) = LOWER($1) LIMIT 1', [nombre]);
  if (exacto.rows.length) return exacto.rows[0];

  const todas = await pool.query('SELECT * FROM estaciones');
  const n = norm(nombre);
  if (!n) return null;

  let prefijo = null;
  let contiene = null;
  for (const e of todas.rows) {
    const m = norm(e.nombre);
    if (!prefijo && (m.indexOf(n) === 0 || n.indexOf(m) === 0)) prefijo = e;
    if (!contiene && (m.indexOf(n) !== -1 || n.indexOf(m) !== -1)) contiene = e;
  }
  return prefijo || contiene;
}

/**
 * GET /api/rutas/plan?origen=...&destino=...
 * Planifica el viaje de una estacion a otra con las rutas guardadas en la
 * base de datos. Si la base de datos todavia no tiene las rutas oficiales,
 * se responde con los datos del servicio oficial de Transmilenio.
 */
async function planearRuta(req, res) {
  const origen = (req.query.origen || '').toString();
  const destino = (req.query.destino || '').toString();

  if (!destino) {
    return res.status(400).json({ error: 'Indica el destino de la ruta.' });
  }

  try {
    // Si la base de datos todavia no tiene rutas, se usan los datos oficiales
    const hay = await pool.query('SELECT COUNT(*)::int n FROM rutas');
    if (!hay.rows[0].n) {
      return oficial.planearRuta(req, res);
    }

    const o = await buscarEstacion(origen);
    const d = await buscarEstacion(destino);

    if (!d) {
      return res.status(404).json({ error: 'No se encontro el destino: ' + destino });
    }

    // Rutas que sirven la estacion de destino
    const rr = await pool.query(
      'SELECT DISTINCT r.id, r.codigo, r.nombre, r.color_hex, r.coordenadas, r.origen, r.destino ' +
      'FROM rutas r JOIN ruta_estaciones re ON re.ruta_id = r.id ' +
      'WHERE re.estacion_id = $1 ORDER BY r.codigo',
      [d.id]
    );

    const ids = rr.rows.map(function (x) { return x.id; });
    const paradasPorRuta = {};
    if (ids.length) {
      const pp = await pool.query(
        'SELECT re.ruta_id, re.orden, e.id AS estacion_id, e.nombre AS estacion_nombre, ' +
        'e.lat AS estacion_lat, e.lng AS estacion_lng ' +
        'FROM ruta_estaciones re JOIN estaciones e ON e.id = re.estacion_id ' +
        'WHERE re.ruta_id = ANY($1) ORDER BY re.ruta_id, re.orden',
        [ids]
      );
      pp.rows.forEach(function (x) {
        if (!paradasPorRuta[x.ruta_id]) paradasPorRuta[x.ruta_id] = [];
        paradasPorRuta[x.ruta_id].push(parada(x));
      });
    }

    const nombreEst = function (e) { return e ? e.nombre : ''; };
    const resumen = rr.rows.map(function (x) {
      const ests = paradasPorRuta[x.id] || [];
      const nombres = ests.map(function (e) { return e.nombre; });
      const iO = o ? nombres.indexOf(o.nombre) : -1;
      const iD = nombres.indexOf(d.nombre);
      return {
        id: x.id,
        codigo: x.codigo,
        linea: (x.codigo || '').split(' ')[0],
        nombre: x.nombre,
        origen: x.origen || '',
        destino: x.destino || '',
        operativa: true,
        coordenadas: Array.isArray(x.coordenadas) ? x.coordenadas : [],
        estaciones: ests,
        paradas: nombres,
        indice_origen: iO,
        indice_destino: iD,
        directa: iO !== -1 && iD !== -1 && iO <= iD
      };
    });

    const directas = resumen.filter(function (r) { return r.directa; });
    const otras = resumen.filter(function (r) { return !r.directa; });

    // Rutas que salen de la estacion de origen
    let rutasOrigen = [];
    if (o) {
      const ro = await pool.query(
        'SELECT DISTINCT r.id, r.codigo, r.nombre, r.origen, r.destino ' +
        'FROM rutas r JOIN ruta_estaciones re ON re.ruta_id = r.id ' +
        'WHERE re.estacion_id = $1 ORDER BY r.codigo',
        [o.id]
      );
      rutasOrigen = ro.rows.map(function (x) {
        return { id: x.id, codigo: x.codigo, nombre: x.nombre, origen: x.origen, destino: x.destino };
      });
    }

    const estacionJson = function (e) {
      if (!e) return null;
      const la = e.lat != null ? parseFloat(e.lat) : (e.latitud != null ? parseFloat(e.latitud) : null);
      const lo = e.lng != null ? parseFloat(e.lng) : (e.longitud != null ? parseFloat(e.longitud) : null);
      return { nombre: e.nombre, num_est: e.num_est || '', latitud: la, longitud: lo };
    };

    res.json({
      origen: estacionJson(o),
      destino: estacionJson(d),
      rutas: directas,
      otras: otras,
      rutas_origen: rutasOrigen
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo planificar la ruta: ' + err.message });
  }
}

async function listarRutasEstacion(req, res) {
  const nombre = req.params.nombre;

  try {
    const estacion = await buscarEstacion(nombre);
    let rutas = [];

    if (estacion) {
      // 1) Rutas que sirven la estacion
      const rr = await pool.query(
        'SELECT DISTINCT r.id, r.codigo, r.nombre, r.color_hex, r.coordenadas, r.origen, r.destino ' +
        'FROM rutas r ' +
        'JOIN ruta_estaciones re ON re.ruta_id = r.id ' +
        'WHERE re.estacion_id = $1 ORDER BY r.codigo',
        [estacion.id]
      );

      const ids = rr.rows.map(function (x) { return x.id; });

      // 2) Todas las paradas (con su orden) de esas rutas
      let paradasPorRuta = {};
      if (ids.length) {
        const pp = await pool.query(
          'SELECT re.ruta_id, re.orden, e.id AS estacion_id, e.nombre AS estacion_nombre, ' +
          'e.lat AS estacion_lat, e.lng AS estacion_lng ' +
          'FROM ruta_estaciones re JOIN estaciones e ON e.id = re.estacion_id ' +
          'WHERE re.ruta_id = ANY($1) ORDER BY re.ruta_id, re.orden',
          [ids]
        );
        pp.rows.forEach(function (x) {
          if (!paradasPorRuta[x.ruta_id]) paradasPorRuta[x.ruta_id] = [];
          paradasPorRuta[x.ruta_id].push(parada(x));
        });
      }

      rutas = rr.rows.map(function (x) {
        return {
          id: x.id,
          codigo: x.codigo,
          nombre: x.nombre,
          color_hex: x.color_hex,
          origen: x.origen || '',
          destino: x.destino || '',
          coordenadas: Array.isArray(x.coordenadas) ? x.coordenadas : [],
          estaciones: paradasPorRuta[x.id] || []
        };
      });
    }

    if (rutas.length) {
      return res.json({ estacion: estacion.nombre, origen: 'bd', rutas: rutas });
    }

    // Sin rutas en la base de datos: datos oficiales de Transmilenio
    const data = await oficial.obtenerDatos();
    const oficiales = oficial.rutasDeEstacion(data, nombre);
    res.json({
      estacion: oficiales.estacion || (estacion ? estacion.nombre : nombre),
      origen: 'oficial',
      rutas: oficiales.rutas
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron cargar las rutas de la estacion.' });
  }
}

module.exports = { listarRutas, listarRutasEstacion, planearRuta, norm };
