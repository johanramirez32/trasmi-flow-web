/** Vagones de una estacion con las rutas y camaras de cada vagón */
const { getPool } = require('../db');
const seg = require('../seguridad');
const express = require('express');

const pool = getPool();
const router = express.Router();

async function listar(req, res) {
  try {
    const id = req.params.estacionId;
    const v = await pool.query('SELECT * FROM vagones WHERE estacion_id=$1 ORDER BY id', [id]);
    const vr = await pool.query(
      'SELECT vr.vagon_id, r.id, r.codigo, r.origen, r.destino, vr.orden ' +
      'FROM vagon_rutas vr JOIN rutas r ON r.id=vr.ruta_id ' +
      'JOIN vagones v ON v.id=vr.vagon_id WHERE v.estacion_id=$1 ORDER BY vr.vagon_id, vr.orden', [id]);
    const cam = await pool.query('SELECT id, nombre, vagon_id FROM camaras WHERE estacion_id=$1 ORDER BY id', [id]);

    const vagones = v.rows.map(function (vagon) {
      return {
        id: vagon.id, nombre: vagon.nombre, sentido: vagon.sentido,
        rutas: vr.rows.filter(function (x) { return x.vagon_id === vagon.id; }),
        camaras: cam.rows.filter(function (x) { return x.vagon_id === vagon.id; })
      };
    });
    res.json({ estacion_id: id, vagones: vagones });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'No se pudieron cargar los vagones.' });
  }
}

router.get('/:estacionId', seg.requerirAuth, listar);
module.exports = router;
