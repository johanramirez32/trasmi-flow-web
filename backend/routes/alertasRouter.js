/**
 * Alertas de aglomeracion a partir de los reportes de los usuarios.
 * GET /api/alertas/aglomeracion
 * Devuelve rutas con nivel > 50% y niveles por estacion.
 */
const { getPool } = require('../db');
const seg = require('../seguridad');
const express = require('express');

const pool = getPool();
const router = express.Router();

const PESO = { Baja: 30, Media: 60, Alta: 85 };
function nivelDe(pct) { return pct < 50 ? 'Baja' : (pct < 75 ? 'Media' : 'Alta'); }

async function aglomeracion(req, res) {
  try {
    const r = await pool.query(
      `SELECT id, estacion, COALESCE(ruta,'SIN RUTA') AS ruta, nivel, usuario, creado_en
         FROM reportes ORDER BY creado_en DESC LIMIT 300`
    );

    const porRuta = {};
    const porEstacion = {};
    r.rows.forEach(function (x) {
      const p = PESO[x.nivel] || 30;
      const kr = x.estacion + '|' + x.ruta;
      if (!porRuta[kr]) {
        porRuta[kr] = { estacion: x.estacion, ruta: x.ruta, porcentaje: 0, nivel: 'Baja', reportes: 0, ultimo: x.creado_en };
      }
      porRuta[kr].reportes++;
      if (p > porRuta[kr].porcentaje) {
        porRuta[kr].porcentaje = p;
        porRuta[kr].nivel = nivelDe(porRuta[kr].porcentaje);
      }
      if (!porEstacion[x.estacion]) {
        porEstacion[x.estacion] = { estacion: x.estacion, porcentaje: 0, nivel: 'Baja', reportes: 0, rutas: [] };
      }
      const e = porEstacion[x.estacion];
      e.reportes++;
      if (p > e.porcentaje) { e.porcentaje = p; e.nivel = nivelDe(e.porcentaje); }
      if (e.rutas.indexOf(x.ruta) === -1) { e.rutas.push(x.ruta); }
    });

    const rutasAltas = Object.keys(porRuta).map(function (k) { return porRuta[k]; })
      .filter(function (x) { return x.porcentaje > 50; })
      .sort(function (a, b) { return b.porcentaje - a.porcentaje || b.reportes - a.reportes; });

    const estaciones = Object.keys(porEstacion).map(function (k) { return porEstacion[k]; })
      .sort(function (a, b) { return b.porcentaje - a.porcentaje || b.reportes - a.reportes; });

    res.json({ rutas: rutasAltas, estaciones: estaciones, total: rutasAltas.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron calcular las alertas.' });
  }
}

router.get('/aglomeracion', seg.requerirAuth, aglomeracion);
module.exports = router;
