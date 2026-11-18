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

/**
 * GET /api/rutas/itinerario?origen=...&destino=...
 * Calcula el viaje completo entre dos estaciones. Busca primero una linea
 * directa y, si no existe, combina lineas haciendo el menor numero de
 * transbordos posible (recorriendo cada linea en ambos sentidos).
 */
async function itinerario(req, res) {
  const origen = (req.query.origen || '').toString();
  const destino = (req.query.destino || '').toString();

  if (!origen || !destino) {
    return res.status(400).json({ error: 'Indica la estacion de origen y la de destino.' });
  }

  try {
    const o = await buscarEstacion(origen);
    const d = await buscarEstacion(destino);
    if (!o || !d) {
      return res.status(404).json({ error: 'No se encontro la estacion de origen o de destino.' });
    }
    if (o.id === d.id) {
      return res.status(400).json({ error: 'El origen y el destino son la misma estacion.' });
    }

    const hay = await pool.query('SELECT COUNT(*)::int n FROM rutas');
    if (!hay.rows[0].n) {
      return res.status(503).json({ error: 'El sistema aun no tiene las rutas cargadas.' });
    }

    // Todas las rutas con sus paradas ordenadas
    const q = await pool.query(
      'SELECT r.id, r.codigo, r.nombre, r.origen AS linea_origen, r.destino AS linea_destino, r.coordenadas, ' +
      're.orden, e.id AS estacion_id, e.nombre AS estacion_nombre, ' +
      'e.lat AS estacion_lat, e.lng AS estacion_lng ' +
      'FROM rutas r ' +
      'JOIN ruta_estaciones re ON re.ruta_id = r.id ' +
      'JOIN estaciones e ON e.id = re.estacion_id ' +
      'ORDER BY r.codigo, re.orden'
    );

    const rutasMap = {};
    q.rows.forEach(function (x) {
      if (!rutasMap[x.id]) {
        rutasMap[x.id] = {
          id: x.id, codigo: x.codigo, nombre: x.nombre,
          origen: x.linea_origen || '', destino: x.linea_destino || '',
          coordenadas: Array.isArray(x.coordenadas) ? x.coordenadas : [],
          paradas: []
        };
      }
      rutasMap[x.id].paradas.push(parada(x));
    });
    const rutas = Object.keys(rutasMap).map(function (k) { return rutasMap[k]; });

    // Indice: estacion -> lineas que la sirven y en que posicion
    const porEstacion = {};
    rutas.forEach(function (r) {
      r.paradas.forEach(function (p, i) {
        if (!porEstacion[p.id]) porEstacion[p.id] = [];
        porEstacion[p.id].push({ ruta: r, i: i });
      });
    });

    // Busqueda por niveles: nivel 0 = una linea, nivel 1 = un transbordo, ...
    let frente = [{ estacion: o.id, rutaId: null, pasos: [{ estacion: o.id, rutaId: null }], transbordos: 0 }];
    const visitados = new Set();
    let solucion = null;

    for (let nivel = 0; nivel <= 4 && !solucion && frente.length; nivel++) {
      const siguiente = [];
      for (let s = 0; s < frente.length && !solucion; s++) {
        const est = frente[s];
        const opciones = porEstacion[est.estacion] || [];
        for (let a = 0; a < opciones.length && !solucion; a++) {
          const op = opciones[a];
          if (op.ruta.id === est.rutaId) { continue; } // seguimos en la misma linea
          for (let ddir = 0; ddir < 2 && !solucion; ddir++) {
            const dir = ddir === 0 ? 1 : -1;
            for (let j = op.i + dir; j >= 0 && j < op.ruta.paradas.length; j += dir) {
              const paradaDest = op.ruta.paradas[j];
              const key = paradaDest.id + '|' + op.ruta.id;
              if (visitados.has(key)) { continue; }
              visitados.add(key);

              const pasos = est.pasos.concat([{ estacion: paradaDest.id, rutaId: op.ruta.id }]);
              const nuevo = {
                estacion: paradaDest.id,
                rutaId: op.ruta.id,
                pasos: pasos,
                transbordos: est.rutaId ? est.transbordos + 1 : 0
              };
              if (paradaDest.id === d.id) { solucion = nuevo; break; }
              siguiente.push(nuevo);
            }
          }
        }
      }
      frente = siguiente;
    }

    if (!solucion) {
      return res.status(404).json({ error: 'No se encontro un itinerario entre esas estaciones.' });
    }

    // Agrupar los pasos consecutivos de la misma linea en tramos
    const grupos = [];
    solucion.pasos.forEach(function (p, i) {
      if (i === 0) { return; }
      const ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.rutaId === p.rutaId) {
        ultimo.hasta = p.estacion;
      } else {
        grupos.push({ rutaId: p.rutaId, desde: solucion.pasos[i - 1].estacion, hasta: p.estacion });
      }
    });

    const porId = {};
    rutas.forEach(function (r) { porId[r.id] = r; });
    const colores = ['#8b5cf6', '#f59e0b', '#22c55e', '#3b82f6', '#ec4899', '#06b6d4'];

    const tramos = grupos.map(function (g, i) {
      const ruta = porId[g.rutaId];
      const iDesde = ruta.paradas.findIndex(function (p) { return p.id === g.desde; });
      const iHasta = ruta.paradas.findIndex(function (p) { return p.id === g.hasta; });
      const ini = Math.min(iDesde, iHasta);
      const fin = Math.max(iDesde, iHasta);
      const paradasTramo = ruta.paradas.slice(ini, fin + 1);
      if (iDesde > iHasta) { paradasTramo.reverse(); }

      return {
        tipo: 'transmilenio',
        orden: i + 1,
        codigo: ruta.codigo,
        nombre: ruta.nombre,
        linea_origen: ruta.origen,
        linea_destino: ruta.destino,
        color: colores[i % colores.length],
        coordenadas: ruta.coordenadas,
        estaciones: paradasTramo,
        indice_origen: 0,
        indice_destino: paradasTramo.length - 1,
        desde: paradasTramo.length ? paradasTramo[0].nombre : '',
        hasta: paradasTramo.length ? paradasTramo[paradasTramo.length - 1].nombre : '',
        paradas: paradasTramo.map(function (p) { return p.nombre; }),
        numero_paradas: paradasTramo.length
      };
    });

    const estacionJson = function (e) {
      if (!e) return null;
      return {
        id: e.id,
        nombre: e.nombre,
        latitud: e.lat != null ? parseFloat(e.lat) : null,
        longitud: e.lng != null ? parseFloat(e.lng) : null
      };
    };

    res.json({
      origen: estacionJson(o),
      destino: estacionJson(d),
      transbordos: solucion.transbordos,
      tramos: tramos,
      total_paradas: tramos.reduce(function (a, t) { return a + t.numero_paradas; }, 0)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudo calcular el itinerario: ' + err.message });
  }
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

module.exports = { listarRutas, listarRutasEstacion, planearRuta, itinerario, norm };
