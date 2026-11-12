/**
 * Controller de rutas y estaciones oficiales de Transmilenio
 * (servicio geografico ArcGIS REST del Portal de Datos Abiertos).
 *
 * GET /api/rutas/oficiales      -> rutas con inicio, fin y paradas
 * GET /api/rutas/oficiales/estaciones -> estaciones oficiales
 */
const ARGIS = 'https://gis.transmilenio.gov.co/arcgis/rest/services/ConsultaSubgerenciaPlanificacionSITP/Consulta_Planificacion_SITP/FeatureServer';
const LAYER_RUTAS = 15;
const LAYER_ESTACIONES = 2;

let cache = { ts: 0, rutas: null, estaciones: null };
const TTL_MS = 60 * 1000;

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function contiene(nombre, patron) {
  const n = norm(nombre);
  const p = norm(patron);
  if (!n || !p) { return false; }
  return n.indexOf(p) !== -1;
}

async function obtenerDatos() {
  if (cache.rutas && cache.estaciones && (Date.now() - cache.ts) < TTL_MS) {
    return cache;
  }

  // 1) Rutas (polilineas) del troncal desde la capa 15
  const r15 = await fetch(
    ARGIS + '/' + LAYER_RUTAS + '/query?where=comp_sitp%3D1&outFields=abrevia,cod_linea,nom_ruta,orig_ruta,dest_ruta,route_id,cod_ruta,tip_serv,comp_sitp&returnGeometry=true&outSR=4326&resultRecordCount=2000&f=json&orderByFields=cod_ruta'
  );
  if (!r15.ok) { throw new Error('No se pudo consultar el servicio de rutas de Transmilenio.'); }
  const d15 = await r15.json();

  // 2) Estaciones desde la capa 2
  const r2 = await fetch(
    ARGIS + '/' + LAYER_ESTACIONES + '/query?where=1%3D1&outFields=num_est,nom_est,id_trazado,latitud,longitud,cap_art,cap_biart,tipo_esta,esta_oper&returnGeometry=false&orderByFields=id_trazado,long_est&resultRecordCount=3000&f=json'
  );
  if (!r2.ok) { throw new Error('No se pudo consultar el servicio de estaciones de Transmilenio.'); }
  const d2 = await r2.json();

  // Agrupar estaciones por trazado y ordenar por distancia a lo largo de la linea
  const grupos = {};
  (d2.features || []).forEach(function (f) {
    const a = f.attributes || {};
    const key = String(a.id_trazado || 'SIN_TRAZADO');
    if (!grupos[key]) { grupos[key] = []; }
    grupos[key].push({
      id: a.cod_nodo != null ? Number(a.cod_nodo) : (f.objectid != null ? Number(f.objectid) : null),
      num_est: a.num_est || '',
      nombre: a.nom_est || '',
      latitud: a.latitud != null ? Number(a.latitud) : null,
      longitud: a.longitud != null ? Number(a.longitud) : null,
      cap_art: a.cap_art != null ? Number(a.cap_art) : null,
      cap_biart: a.cap_biart != null ? Number(a.cap_biart) : null,
      tipo_esta: a.tipo_esta != null ? Number(a.tipo_esta) : null,
      esta_oper: a.esta_oper != null ? Number(a.esta_oper) : null,
      long_est: a.long_est != null ? Number(a.long_est) : 0
    });
  });

  Object.keys(grupos).forEach(function (k) {
    grupos[k].sort(function (a, b) { return (a.long_est || 0) - (b.long_est || 0); });
  });

  // Rutas: cada polilinea del servicio trae codigo, origen, destino y geometria
  const rutas = (d15.features || []).map(function (f) {
    const a = f.attributes || {};
    const g = f.geometry || {};
    const coords = [];
    if (g.paths) { g.paths.forEach(function (p) { p.forEach(function (pt) { coords.push([pt[1], pt[0]]); }); }); }

    // Buscar paradas del trazado (agrupadas por id_trazado) que coincidan con origen/destino
    let stops = [];
    const orig = a.orig_ruta || '';
    const dest = a.dest_ruta || '';
    const keys = [orig, dest].filter(function (x) { return x; });
    const grupoKeys = Object.keys(grupos);
    for (let i = 0; i < grupoKeys.length; i++) {
      const stopsG = grupos[grupoKeys[i]] || [];
      let ok = false;
      for (let j = 0; j < stopsG.length; j++) {
        if (contiene(stopsG[j].nombre, orig) || contiene(stopsG[j].nombre, dest)) { ok = true; break; }
      }
      if (ok) { stops = stopsG; break; }
    }

    const primero = stops.length ? stops[0] : null;
    const ultimo = stops.length ? stops[stops.length - 1] : null;

    return {
      id: f.objectid,
      codigo: a.cod_ruta || a.cod_linea || '',
      nombre: a.nom_ruta || '',
      origen: a.orig_ruta || (primero ? primero.nombre : ''),
      destino: a.dest_ruta || (ultimo ? ultimo.nombre : ''),
      comp_sitp: a.comp_sitp,
      tip_serv: a.tip_serv,
      est_ruta: a.est_ruta,
      coordenadas: coords,
      estaciones: stops
    };
  });

  cache = { ts: Date.now(), rutas: rutas, estaciones: d2.features || [] };
  return cache;
}

async function listarRutasOficiales(req, res) {
  try {
    const data = await obtenerDatos();
    res.json({ rutas: data.rutas || [] });
  } catch (err) {
    console.error('ERROR_RUTAS_OFICIALES: ' + err.message);
    res.status(502).json({ error: 'No se pudo obtener las rutas oficiales de Transmilenio.' });
  }
}

async function listarEstacionesOficiales(req, res) {
  try {
    const data = await obtenerDatos();
    const estaciones = (data.estaciones || []).map(function (f) {
      const a = f.attributes || {};
      return {
        id: a.cod_nodo != null ? Number(a.cod_nodo) : (f.objectid != null ? Number(f.objectid) : null),
        num_est: a.num_est || '',
        nombre: a.nom_est || '',
        id_trazado: a.id_trazado || '',
        latitud: a.latitud != null ? Number(a.latitud) : null,
        longitud: a.longitud != null ? Number(a.longitud) : null,
        cap_art: a.cap_art != null ? Number(a.cap_art) : null,
        cap_biart: a.cap_biart != null ? Number(a.cap_biart) : null,
        tipo_esta: a.tipo_esta != null ? Number(a.tipo_esta) : null,
        esta_oper: a.esta_oper != null ? Number(a.esta_oper) : null,
        ub_est: a.ub_est || ''
      };
    });
    res.json({ estaciones: estaciones });
  } catch (err) {
    console.error('ERROR_ESTACIONES_OFICIALES: ' + err.message);
    res.status(502).json({ error: 'No se pudieron obtener las estaciones oficiales de Transmilenio.' });
  }
}

module.exports = { listarRutasOficiales, listarEstacionesOficiales };
