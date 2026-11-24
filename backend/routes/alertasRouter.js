/** Alertas de aglomeracion por ruta, estacion y portal */
const { calcular } = require('../services/aglomeracion');
const seg = require('../seguridad');
const express = require('express');

const router = express.Router();

async function aglomeracion(req, res) {
  try {
    res.json(await calcular(req.query.horas));
  } catch (err) {
    console.error('ERROR_ALERTAS: ' + err.message);
    res.json({ rutas: [], estaciones: [], portales: [], resumen: { rutasCriticas: 0, estacionesCriticas: 0, portalesCriticos: 0 } });
  }
}

router.get('/aglomeracion', seg.requerirAuth, aglomeracion);
module.exports = router;
