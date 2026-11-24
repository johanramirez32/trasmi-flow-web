/**
 * Servicio de aglomeracion: calcula niveles a partir de los reportes
 * de los usuarios para rutas, estaciones y portales.
 *
 * Escala unica: Baja <50% (30), Media 50-74% (60), Alta >=75% (85).
 */
const { getPool } = require('../db');

const pool = getPool();
const PESO = { Baja: 30, Media: 60, Alta: 85 };

function nivelDe(pct) {
  return pct < 50 ? 'Baja' : (pct < 75 ? 'Media' : 'Alta');
}

async function calcular(horas) {
  const h = Math.min(parseInt(horas, 10) || 168, 24 * 30);
  let tienePortal = false;
  try {
    const c = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='estaciones' AND column_name='portal'");
    tienePortal = c.rows.length > 0;
  } catch (e) { tienePortal = false; }

  const portalExpr = tienePortal ? "COALESCE(e.portal, 'Sin portal')" : "'Sin portal'";
  const r = await pool.query(
    `SELECT rep.id, rep.estacion, COALESCE(rep.ruta,'SIN RUTA') AS ruta,
            rep.nivel, rep.usuario, rep.creado_en,
            ${portalExpr} AS portal
       FROM reportes rep
       LEFT JOIN estaciones e ON LOWER(e.nombre) = LOWER(rep.estacion)
      WHERE rep.creado_en > NOW() - ($1 || ' hours')::interval
      ORDER BY rep.creado_en DESC`,
    [h]
  );

  const porEst = {};
  const porRuta = {};
  const porPortal = {};

  function actualizar(grupo, clave, fila) {
    const p = PESO[fila.nivel] || 30;
    if (!grupo[clave]) {
      grupo[clave] = { porcentaje: 0, nivel: 'Baja', reportes: 0, ultimo: fila.creado_en, rutas: [] };
    }
    const g = grupo[clave];
    g.reportes++;
    if (p > g.porcentaje) {
      g.porcentaje = p;
      g.nivel = nivelDe(p);
      g.ultimo = fila.creado_en;
    }
    if (fila.ruta && g.rutas.indexOf(fila.ruta) === -1) { g.rutas.push(fila.ruta); }
  }

  r.rows.forEach(function (f) {
    actualizar(porEst, f.estacion, f);
    actualizar(porRuta, f.estacion + '|' + f.ruta, Object.assign({}, f, { ruta: f.ruta }));
    actualizar(porPortal, f.portal, f);
  });

  const estaciones = Object.keys(porEst).map(function (k) {
    const g = porEst[k];
    const fila = r.rows.find(function (x) { return x.estacion === k; });
    return { estacion: k, portal: fila ? fila.portal : 'Sin portal', nivel: g.nivel,
             porcentaje: g.porcentaje, reportes: g.reportes, rutas: g.rutas, ultimo: g.ultimo };
  });

  const rutas = Object.keys(porRuta).map(function (k) {
    const g = porRuta[k];
    const partes = k.split('|');
    return { estacion: partes[0], ruta: partes[1], nivel: g.nivel,
             porcentaje: g.porcentaje, reportes: g.reportes, ultimo: g.ultimo };
  });

  const portales = Object.keys(porPortal).map(function (k) {
    const g = porPortal[k];
    return { portal: k, nivel: g.nivel, porcentaje: g.porcentaje,
             reportes: g.reportes, rutas: g.rutas,
             estaciones: estaciones.filter(function (e) { return e.portal === k; }).map(function (e) { return e.estacion; }) };
  });

  function ordenar(a, b) { return b.porcentaje - a.porcentaje || b.reportes - a.reportes; }
  estaciones.sort(ordenar);
  rutas.sort(ordenar);
  portales.sort(ordenar);

  return {
    horas: h,
    rutas: rutas,
    estaciones: estaciones,
    portales: portales,
    resumen: {
      rutasCriticas: rutas.filter(function (x) { return x.porcentaje > 50; }).length,
      estacionesCriticas: estaciones.filter(function (x) { return x.porcentaje > 50; }).length,
      portalesCriticos: portales.filter(function (x) { return x.porcentaje > 50; }).length
    }
  };
}

module.exports = { calcular, nivelDe, PESO };
