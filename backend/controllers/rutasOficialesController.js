/**
 * Controller de rutas y estaciones oficiales de Transmilenio
 * (servicio geografico ArcGIS REST del Portal de Datos Abiertos).
 *
 * GET /api/rutas/oficiales                -> rutas con inicio, fin, paradas y geometria
 * GET /api/rutas/oficiales/estaciones     -> estaciones oficiales
 * GET /api/rutas/oficiales/estacion/:nom  -> rutas que sirven una estacion
 * GET /api/rutas/oficiales/plan?o=&d=     -> rutas que conectan origen y destino
 *
 * Las paradas de cada ruta se calculan de forma geografica: una estacion
 * "sirve" a la ruta si esta a menos de RADIO_SERVICIO_M metros del corredor
 * (la polilinea de la ruta). Asi se sabe exactamente que rutas pasan por
 * cada estacion y en que orden, que es lo que necesita el usuario para
 * planificar el viaje de una estacion a otra.
 */
const ARGIS = 'https://gis.transmilenio.gov.co/arcgis/rest/services/ConsultaSubgerenciaPlanificacionSITP/Consulta_Planificacion_SITP/FeatureServer';
const LAYER_RUTAS = 15;
const LAYER_ESTACIONES = 2;

// Distancia maxima (metros) entre una estacion y el corredor de la ruta
// para que la cuenta como parada de esa ruta.
const RADIO_SERVICIO_M = 250;

// Los datos oficiales cambian muy poco: se cachean un rato largo.
const TTL_MS = 30 * 60 * 1000;

// Error tolerated al simplificar el trazo (metros). 20 m no se notan en el mapa.
const TOLERANCIA_SIMPLIFICACION_M = 20;

// Metros por grado (Bogota)
const KX = 111320 * Math.cos(4.6097 * Math.PI / 180);
const KY = 110540;

let cache = { ts: 0, rutas: null, estaciones: null, indice: null };

/** Normaliza un texto: sin acentos, sin puntuacion, en minusculas */
function norm(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/** Normaliza un texto pero conservando espacios (para busquedas "lovely") */
function normEsp(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Busca la estacion oficial que corresponde a un nombre escrito por el usuario.
 * Primero coincidencia exacta (normalizada), luego la que empieza por el texto
 * escrito y por ultimo la que lo contiene.
 */
function buscarEstacion(estaciones, nombre) {
  if (!nombre) return null;
  const n = norm(nombre);
  if (!n) return null;

  let exacto = null;
  let prefijo = null;
  let contiene = null;

  for (let i = 0; i < estaciones.length; i++) {
    const e = estaciones[i];
    const m = norm(e.nombre);
    if (m === n) { exacto = e; break; }
    if (!prefijo && (m.indexOf(n) === 0 || n.indexOf(m) === 0)) { prefijo = e; }
    if (!contiene && (m.indexOf(n) !== -1 || n.indexOf(m) !== -1)) { contiene = e; }
  }
  return exacto || prefijo || contiene;
}

/** Acumulado de distancia (metros) de cada vertice de una polilinea */
function acumular(coords) {
  const acum = [0];
  for (let i = 1; i < coords.length; i++) {
    const dx = (coords[i][1] - coords[i - 1][1]) * KX;
    const dy = (coords[i][0] - coords[i - 1][0]) * KY;
    acum.push(acum[i - 1] + Math.sqrt(dx * dx + dy * dy));
  }
  return acum;
}

/** Caja de inclinacion (bounding box) de una polilinea, con margen en metros */
function caja(coords, margen) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < coords.length; i++) {
    const x = coords[i][1] * KX;
    const y = coords[i][0] * KY;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX: minX - margen, maxX: maxX + margen, minY: minY - margen, maxY: maxY + margen };
}

/**
 * Distancia (metros) de un punto al corredor y posicion del punto sobre el
 * recorrido (para ordenar las paradas en el sentido de la ruta).
 */
function puntoEnCorredor(lat, lng, caminos) {
  const px = lng * KX;
  const py = lat * KY;
  let mejor = { dist: Infinity, camino: 0, pos: 0 };

  for (let c = 0; c < caminos.length; c++) {
    const coords = caminos[c].coords;
    const acum = caminos[c].acum;
    const cajaC = caminos[c].caja;
    if (px < cajaC.minX || px > cajaC.maxX || py < cajaC.minY || py > cajaC.maxY) continue;

    for (let i = 0; i < coords.length - 1; i++) {
      const ax = coords[i][1] * KX, ay = coords[i][0] * KY;
      const bx = coords[i + 1][1] * KX, by = coords[i + 1][0] * KY;
      const dx = bx - ax, dy = by - ay;
      const l2 = dx * dx + dy * dy;
      let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
      if (t < 0) t = 0; else if (t > 1) t = 1;
      const cx = ax + t * dx, cy = ay + t * dy;
      const d = Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
      if (d < mejor.dist) {
        mejor = { dist: d, camino: c, pos: acum[i] + t * Math.sqrt(l2) };
      }
    }
  }
  return mejor;
}

/**
 * Distancia (metros) de un punto a un segmento.
 * Las coordenadas llegan como [lat, lng].
 */
function distPuntoSegmento(p, a, b) {
  const px = p[1] * KX, py = p[0] * KY;
  const ax = a[1] * KX, ay = a[0] * KY;
  const bx = b[1] * KX, by = b[0] * KY;
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
  if (t < 0) t = 0; else if (t > 1) t = 1;
  const cx = ax + t * dx, cy = ay + t * dy;
  return Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
}

/**
 * Simplifica la polilinea (Douglas-Peucker) para no enviar miles de puntos
 * al navegador: se pierde detalle, pero no se ve diferencia en el mapa.
 */
function simplificar(coords, tolerancia) {
  if (!coords || coords.length < 3) return coords || [];
  const keep = new Uint8Array(coords.length);
  keep[0] = 1;
  keep[coords.length - 1] = 1;
  const pila = [[0, coords.length - 1]];

  while (pila.length) {
    const par = pila.pop();
    const ini = par[0], fin = par[1];
    let maxD = -1, idx = -1;
    for (let i = ini + 1; i < fin; i++) {
      const d = distPuntoSegmento(coords[i], coords[ini], coords[fin]);
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (idx > 0 && maxD > tolerancia) {
      keep[idx] = 1;
      pila.push([ini, idx]);
      pila.push([idx, fin]);
    }
  }

  const out = [];
  for (let i = 0; i < coords.length; i++) { if (keep[i]) out.push(coords[i]); }
  return out;
}

/** Consulta al servicio ArcGIS (POST, para no saturar la URL) */
async function consultar(capa, params) {
  const body = new URLSearchParams(Object.assign({ f: 'json' }, params));
  const r = await fetch(ARGIS + '/' + capa + '/query', {
    method: 'POST',
    body: body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  if (!r.ok) throw new Error('El servicio oficial de Transmilenio no respondio (' + r.status + ').');
  const texto = await r.text();
  let data;
  try { data = JSON.parse(texto); } catch (e) { throw new Error('Respuesta invalida del servicio oficial.'); }
  if (data.error) throw new Error(data.error.message || 'Error del servicio oficial.');
  return data;
}

/**
 * Descarga y procesa los datos oficiales: rutas con sus paradas ordenadas
 * e indice estacion -> rutas que la sirven.
 */
async function obtenerDatos(forzar) {
  if (!forzar && cache.rutas && (Date.now() - cache.ts) < TTL_MS) {
    return cache;
  }

  try {
    // 1) Rutas (corredores) de Transmilenio con su geometria
    const dRutas = await consultar(LAYER_RUTAS, {
      where: 'comp_sitp=1',
      outFields: 'objectid,abrevia,cod_ruta,cod_linea,nom_ruta,orig_ruta,dest_ruta,route_id,tip_serv,est_ruta,comp_sitp',
      returnGeometry: 'true',
      outSR: '4326',
      resultRecordCount: '2000',
      orderByFields: 'cod_ruta'
    });

    // 2) Estaciones troncales
    const dEst = await consultar(LAYER_ESTACIONES, {
      where: '1=1',
      outFields: 'num_est,nom_est,id_trazado,latitud,longitud,esta_oper,tipo_esta,ub_est',
      returnGeometry: 'false',
      resultRecordCount: '3000',
      orderByFields: 'nom_est'
    });

    const estaciones = (dEst.features || []).map(function (f) {
      const a = f.attributes || {};
      return {
        id: a.num_est || '',
        num_est: a.num_est || '',
        nombre: a.nom_est || '',
        id_trazado: a.id_trazado || '',
        latitud: a.latitud != null ? Number(a.latitud) : null,
        longitud: a.longitud != null ? Number(a.longitud) : null,
        lat: a.latitud != null ? Number(a.latitud) : null,
        lng: a.longitud != null ? Number(a.longitud) : null,
        esta_oper: a.esta_oper != null ? Number(a.esta_oper) : null,
        tipo_esta: a.tipo_esta != null ? Number(a.tipo_esta) : null,
        ub_est: a.ub_est || ''
      };
    }).filter(function (e) { return e.latitud != null && e.longitud != null; });

    // 3) Rutas: paradas (estaciones cercanas al corredor) ordenadas en el sentido de la ruta
    const rutas = (dRutas.features || []).map(function (f) {
      const a = f.attributes || {};
      const paths = (f.geometry && f.geometry.paths) || [];
      const caminos = paths.map(function (p) {
        const coords = p.map(function (pt) { return [pt[1], pt[0]]; });
        return { coords: coords, acum: acumular(coords), caja: caja(coords, RADIO_SERVICIO_M) };
      });

      const paradas = [];
      for (let i = 0; i < estaciones.length; i++) {
        const e = estaciones[i];
        const hit = puntoEnCorredor(e.latitud, e.longitud, caminos);
        if (hit.dist <= RADIO_SERVICIO_M) {
          paradas.push({
            id: e.num_est,
            num_est: e.num_est,
            nombre: e.nombre,
            id_trazado: e.id_trazado,
            latitud: e.latitud,
            longitud: e.longitud,
            lat: e.latitud,
            lng: e.longitud,
            _camino: hit.camino,
            _pos: hit.pos,
            _dist: hit.dist
          });
        }
      }
      paradas.sort(function (x, y) {
        if (x._camino !== y._camino) return x._camino - y._camino;
        return x._pos - y._pos;
      });

      const limpias = paradas.map(function (p, i) {
        return {
          id: p.id, num_est: p.num_est, nombre: p.nombre, id_trazado: p.id_trazado,
          latitud: p.latitud, longitud: p.longitud, lat: p.lat, lng: p.lng, orden: i + 1
        };
      });

      const coords = [];
      caminos.forEach(function (c) {
        simplificar(c.coords, TOLERANCIA_SIMPLIFICACION_M).forEach(function (pt) { coords.push(pt); });
      });

      return {
        id: f.attributes.objectid,
        codigo: a.cod_ruta || a.cod_linea || '',
        linea: a.cod_linea || '',
        nombre: a.nom_ruta || '',
        abrevia: a.abrevia || '',
        origen: a.orig_ruta || (limpias.length ? limpias[0].nombre : ''),
        destino: a.dest_ruta || (limpias.length ? limpias[limpias.length - 1].nombre : ''),
        ruta_id: a.route_id != null ? Number(a.route_id) : null,
        tip_serv: a.tip_serv != null ? Number(a.tip_serv) : null,
        est_ruta: a.est_ruta != null ? Number(a.est_ruta) : null,
        operativa: a.est_ruta === 1,
        comp_sitp: a.comp_sitp != null ? Number(a.comp_sitp) : null,
        coordenadas: coords,
        estaciones: limpias
      };
    });

    // 4) Indice: estacion normalizada -> rutas que la sirven
    const indice = {};
    rutas.forEach(function (r) {
      r.estaciones.forEach(function (p) {
        const k = norm(p.nombre);
        if (!k) return;
        if (!indice[k]) indice[k] = [];
        indice[k].push(r.id);
      });
    });

    cache = { ts: Date.now(), rutas: rutas, estaciones: estaciones, indice: indice };
    return cache;
  } catch (err) {
    // Si ya tenemos datos, seguimos servirlos aunque el servicio falle
    if (cache.rutas) return cache;
    throw err;
  }
}

/** Rutas (resumen) que sirven una estacion: busca el nombre mas parecido */
function rutasDeEstacion(data, nombre) {
  const estaciones = data.estaciones || [];
  const est = buscarEstacion(estaciones, nombre);
  if (!est) return { estacion: nombre, rutas: [] };

  const k = norm(est.nombre);
  const ids = (data.indice && data.indice[k]) || [];
  const rutas = ids.map(function (id) {
    return data.rutas.filter(function (r) { return r.id === id; })[0];
  }).filter(Boolean);

  return { estacion: est.nombre, num_est: est.num_est, rutas: rutas };
}

/** GET /api/rutas/oficiales */
async function listarRutasOficiales(req, res) {
  try {
    const data = await obtenerDatos();
    res.json({ rutas: data.rutas || [] });
  } catch (err) {
    console.error('ERROR_RUTAS_OFICIALES: ' + err.message);
    res.status(502).json({ error: 'No se pudo obtener las rutas oficiales de Transmilenio.', detalle: err.message });
  }
}

/** GET /api/rutas/oficiales/estaciones */
async function listarEstacionesOficiales(req, res) {
  try {
    const data = await obtenerDatos();
    res.json({ estaciones: data.estaciones || [] });
  } catch (err) {
    console.error('ERROR_ESTACIONES_OFICIALES: ' + err.message);
    res.status(502).json({ error: 'No se pudieron obtener las estaciones oficiales de Transmilenio.', detalle: err.message });
  }
}

/** GET /api/rutas/oficiales/estacion/:nombre */
async function listarRutasPorEstacion(req, res) {
  try {
    const data = await obtenerDatos();
    const resultado = rutasDeEstacion(data, req.params.nombre);
    res.json(resultado);
  } catch (err) {
    console.error('ERROR_RUTAS_POR_ESTACION: ' + err.message);
    res.status(502).json({ error: 'No se pudieron obtener las rutas de la estacion.', detalle: err.message });
  }
}

/**
 * GET /api/rutas/oficiales/plan?origen=...&destino=...
 * Devuelve las rutas que conectan el origen con el destino y, si no hay una
 * directa, las rutas que sirven el destino (para fazer transferencia).
 */
async function planearRuta(req, res) {
  const origen = (req.query.origen || '').toString();
  const destino = (req.query.destino || '').toString();

  try {
    const data = await obtenerDatos();

    const o = buscarEstacion(data.estaciones || [], origen);
    const d = buscarEstacion(data.estaciones || [], destino);

    if (!d) {
      return res.status(404).json({ error: 'No se encontro el destino: ' + destino });
    }

    const idsDestino = new Set((data.indice && data.indice[norm(d.nombre)]) || []);
    const idsOrigen = o ? new Set((data.indice && data.indice[norm(o.nombre)]) || []) : new Set();

    const resumenRuta = function (r) {
      const paradas = r.estaciones.map(function (p) { return p.nombre; });
      const iO = o ? paradas.indexOf(o.nombre) : -1;
      const iD = paradas.indexOf(d.nombre);
      return {
        id: r.id, codigo: r.codigo, linea: r.linea, nombre: r.nombre,
        origen: r.origen, destino: r.destino, operativa: r.operativa,
        coordenadas: r.coordenadas, estaciones: r.estaciones,
        paradas: paradas,
        indice_origen: iO, indice_destino: iD,
        // Directa solo si la ruta va del origen al destino (en ese sentido)
        directa: iO !== -1 && iD !== -1 && iO <= iD
      };
    };

    const rutasDestino = [];
    idsDestino.forEach(function (id) {
      const r = data.rutas.filter(function (x) { return x.id === id; })[0];
      if (r) rutasDestino.push(resumenRuta(r));
    });

    const directas = rutasDestino.filter(function (r) { return r.directa; });
    const conSalida = rutasDestino.filter(function (r) { return !r.directa; });

    // Origenes que salen de la estacion actual (para el mensaje)
    const rutasOrigen = [];
    idsOrigen.forEach(function (id) {
      const r = data.rutas.filter(function (x) { return x.id === id; })[0];
      if (r) rutasOrigen.push({ id: r.id, codigo: r.codigo, nombre: r.nombre, origen: r.origen, destino: r.destino, paradas: r.estaciones.length });
    });

    res.json({
      origen: o ? { nombre: o.nombre, num_est: o.num_est, latitud: o.latitud, longitud: o.longitud } : null,
      destino: { nombre: d.nombre, num_est: d.num_est, latitud: d.latitud, longitud: d.longitud },
      rutas: directas,
      otras: conSalida,
      rutas_origen: rutasOrigen
    });
  } catch (err) {
    console.error('ERROR_PLAN_ROTA: ' + err.message);
    res.status(502).json({ error: 'No se pudo planificar la ruta.', detalle: err.message });
  }
}

module.exports = {
  listarRutasOficiales,
  listarEstacionesOficiales,
  listarRutasPorEstacion,
  planearRuta,
  obtenerDatos,
  buscarEstacion,
  rutasDeEstacion,
  norm
};
