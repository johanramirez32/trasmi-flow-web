/** Alertas de aglomeracion por ruta, estacion y portal */
const { calcular } = require('../services/aglomeracion');
const seg = require('../seguridad');
const express = require('express');

const router = express.Router();

async function aglomeracion(req, res) {
  try {
    res.json(await calcular(req.query.horas));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron calcular las alertas.' });
  }
}

router.get('/aglomeracion', seg.requerirAuth, aglomeracion);
module.exports = router;
