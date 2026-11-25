/**
 * TransmiFlow - Módulo independiente de monitoreo de aglomeración por cámaras.
 *
 * Expuesto en /api/monitoring. El worker de IA envía métricas con API key;
 * el panel web consulta con el token normal de la aplicación.
 *
 * Las mediciones con nivel >= MODERATE generan un reporte en la tabla
 * `reportes`, alimentando notificaciones, alertas y aglomeración en tiempo real.
 */
const express = require('express');
const { getPool } = require('../../db');
const seg = require('../../seguridad');

function createMonitoringRouter(options) {
  options = options || {};
  const pool = options.pool || getPool();
  const apiKey = options.apiKey || process.env.MONITORING_API_KEY || '';
  const router = express.Router();

  function requireWorkerKey(req, res, next) {
    const supplied = req.get('x-monitoring-key');
    if (!apiKey || supplied !== apiKey) {
      return res.status(401).json({ error: 'API key inválida' });
    }
    next();
  }

  /** Nivel unico de aglomeración en toda la app */
  function nivelDe(occupancy) {
    if (occupancy >= 75) return 'Alta';
    if (occupancy >= 50) return 'Media';
    return 'Baja';
  }

  /** Dashboard: ultima medicion por zona/vagon */
  router.get('/dashboard', seg.requerirAuth, async (req, res, next) => {
    try {
      const stationId = req.query.stationId ? Number(req.query.stationId) : null;
      const result = await pool.query(`
        SELECT s.id AS station_id, s.name AS station_name, e.portal,
               v.id AS vagon_id, v.nombre AS vagon_name,
               z.id AS zone_id, z.code AS zone_code, z.name AS zone_name,
               z.capacity, z.area_m2, z.ruta_codigo,
               latest.people_count, latest.occupancy_percentage,
               latest.density_people_m2, latest.crowd_level, latest.captured_at,
               CASE WHEN latest.occupancy_percentage >= 75 THEN 'Alta'
                    WHEN latest.occupancy_percentage >= 50 THEN 'Media'
                    ELSE 'Baja' END AS nivel
        FROM monitoring_zones z
        JOIN monitoring_stations s ON s.id = z.station_id
        LEFT JOIN estaciones e ON 'EST-' || e.id = s.code
        LEFT JOIN vagones v ON v.id = z.vagon_id
        LEFT JOIN LATERAL (
          SELECT m.people_count, m.occupancy_percentage, m.density_people_m2,
                 m.crowd_level, m.captured_at
          FROM monitoring_cameras c JOIN monitoring_metrics m ON m.camera_id = c.id
          WHERE c.zone_id = z.id ORDER BY m.captured_at DESC LIMIT 1
        ) latest ON TRUE
        WHERE ($1::bigint IS NULL OR s.id = $1)
        ORDER BY s.name, v.id, z.name
      `, [Number.isFinite(stationId) ? stationId : null]);
      res.json({ data: result.rows });
    } catch (err) { next(err); }
  });

  router.get('/zones', seg.requerirAuth, async (req, res, next) => {
    try {
      const stationId = req.query.stationId ? Number(req.query.stationId) : null;
      const result = await pool.query(`
        SELECT z.*, s.name AS station_name, v.nombre AS vagon_name
        FROM monitoring_zones z
        JOIN monitoring_stations s ON s.id = z.station_id
        LEFT JOIN estaciones e ON 'EST-' || e.id = s.code
        LEFT JOIN vagones v ON v.id = z.vagon_id
        WHERE ($1::bigint IS NULL OR s.id = $1)
        ORDER BY s.name, v.id, z.name
      `, [Number.isFinite(stationId) ? stationId : null]);
      res.json({ data: result.rows });
    } catch (err) { next(err); }
  });

  router.get('/alerts', seg.requerirAuth, async (req, res, next) => {
    try {
      const status = req.query.status || 'active';
      const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
      const result = await pool.query(`
        SELECT a.*, z.name AS zone_name, s.name AS station_name,
               v.nombre AS vagon_name, c.name AS camera_name
        FROM monitoring_alerts a
        JOIN monitoring_zones z ON z.id = a.zone_id
        JOIN monitoring_stations s ON s.id = z.station_id
        LEFT JOIN estaciones e ON 'EST-' || e.id = s.code
        LEFT JOIN vagones v ON v.id = z.vagon_id
        LEFT JOIN monitoring_cameras c ON c.id = a.camera_id
        WHERE ($1 = 'all' OR a.status = $1)
        ORDER BY a.created_at DESC LIMIT $2
      `, [status, limit]);
      res.json({ data: result.rows });
    } catch (err) { next(err); }
  });

  /** Top 5 estaciones mas congestionadas (reportes + camaras) */
  router.get('/top', seg.requerirAuth, async (req, res, next) => {
    try {
      const result = await pool.query(`
        SELECT s.name AS estacion, e.portal,
               MAX(COALESCE(m.occupancy_percentage, 0)) AS porcentaje_camara,
               (SELECT COUNT(*)::int FROM reportes r
                 WHERE LOWER(r.estacion) = LOWER(s.name)
                   AND r.creado_en > NOW() - INTERVAL '7 days') AS reportes
        FROM monitoring_stations s
        LEFT JOIN estaciones e ON 'EST-' || e.id = s.code
        LEFT JOIN monitoring_zones z ON z.station_id = s.id
        LEFT JOIN monitoring_cameras c ON c.zone_id = z.id
        LEFT JOIN LATERAL (
          SELECT occupancy_percentage FROM monitoring_metrics
          WHERE camera_id = c.id ORDER BY captured_at DESC LIMIT 1
        ) m ON TRUE
        GROUP BY s.id, s.name, e.portal
        ORDER BY porcentaje_camara DESC, reportes DESC
        LIMIT 5
      `);
      res.json({ data: result.rows });
    } catch (err) { next(err); }
  });

  /** Endpoint interno del worker de IA */
  router.post('/metrics', requireWorkerKey, async (req, res, next) => {
    const { cameraCode, peopleCount, capturedAt } = req.body || {};
    if (!cameraCode || !Number.isInteger(peopleCount) || peopleCount < 0) {
      return res.status(400).json({ error: 'cameraCode y peopleCount entero >= 0 son obligatorios' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const cameraResult = await client.query(`
        SELECT c.id AS camera_id, c.zone_id, z.capacity, z.area_m2,
               z.ruta_codigo, s.name AS estacion,
               v.id AS vagon_id
        FROM monitoring_cameras c
        JOIN monitoring_zones z ON z.id = c.zone_id
        JOIN monitoring_stations s ON s.id = z.station_id
        LEFT JOIN estaciones e ON 'EST-' || e.id = s.code
        LEFT JOIN vagones v ON v.id = z.vagon_id
        WHERE c.code = $1 AND c.enabled = TRUE FOR UPDATE OF c
      `, [cameraCode]);

      if (!cameraResult.rows.length) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Cámara no encontrada o deshabilitada' });
      }

      const camera = cameraResult.rows[0];
      const occupancy = (peopleCount / Number(camera.capacity)) * 100;
      const density = camera.area_m2 ? peopleCount / Number(camera.area_m2) : null;
      const nivel = nivelDe(occupancy);

      let crowdLevel = 'LOW';
      if (occupancy >= 100) crowdLevel = 'OVER_CAPACITY';
      else if (occupancy >= 85) crowdLevel = 'CRITICAL';
      else if (occupancy >= 70) crowdLevel = 'HIGH';
      else if (occupancy >= 50) crowdLevel = 'MODERATE';

      const metric = await client.query(`
        INSERT INTO monitoring_metrics
          (camera_id, people_count, occupancy_percentage, density_people_m2, crowd_level, captured_at)
        VALUES ($1,$2,$3,$4,$5, COALESCE($6::timestamptz, NOW())) RETURNING *
      `, [camera.camera_id, peopleCount, occupancy, density, crowdLevel, capturedAt || null]);

      if (occupancy >= 70) {
        const message = `Ocupación ${occupancy.toFixed(1)}% (${peopleCount} personas)`;
        const existing = await client.query(`
          SELECT id FROM monitoring_alerts WHERE zone_id=$1 AND status='active'
          ORDER BY created_at DESC LIMIT 1`, [camera.zone_id]);
        if (!existing.rows.length) {
          await client.query(`
            INSERT INTO monitoring_alerts (zone_id,camera_id,level,message,occupancy_percentage)
            VALUES ($1,$2,$3,$4,$5)`, [camera.zone_id, camera.camera_id, crowdLevel, message, occupancy]);
        } else {
          await client.query(`UPDATE monitoring_alerts
            SET level=$2, message=$3, occupancy_percentage=$4 WHERE id=$1`,
            [existing.rows[0].id, crowdLevel, message, occupancy]);
        }
      } else {
        await client.query(`UPDATE monitoring_alerts SET status='resolved'
          WHERE zone_id=$1 AND status='active'`, [camera.zone_id]);
      }

      // Alimentar reportes y notificaciones de la app con la lectura de camara
      if (nivel !== 'Baja') {
        const ruta = camera.ruta_codigo || 'SIN RUTA';
        await client.query(`
          INSERT INTO reportes (estacion, ruta, nivel, usuario, creado_en)
          VALUES ($1,$2,$3,'camara@transmiflow.local', NOW())
        `, [camera.estacion, ruta, nivel]);
      }

      await client.query('COMMIT');
      res.status(201).json({
        data: metric.rows[0],
        computed: {
          occupancyPercentage: Number(occupancy.toFixed(2)),
          densityPeopleM2: density === null ? null : Number(density.toFixed(2)),
          crowdLevel: crowdLevel,
          nivel: nivel,
          estacion: camera.estacion,
          ruta: camera.ruta_codigo || 'SIN RUTA'
        }
      });
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally { client.release(); }
  });

  router.patch('/alerts/:id/acknowledge', seg.requerirAuth, async (req, res, next) => {
    try {
      const who = req.usuario ? (req.usuario.email || req.usuario.id) : 'operario';
      const result = await pool.query(`
        UPDATE monitoring_alerts SET status='acknowledged', acknowledged_at=NOW(), acknowledged_by=$2
        WHERE id=$1 AND status='active' RETURNING *`, [Number(req.params.id), String(who)]);
      if (!result.rows.length) return res.status(404).json({ error: 'Alerta activa no encontrada' });
      res.json({ data: result.rows[0] });
    } catch (err) { next(err); }
  });

  return router;
}

module.exports = { createMonitoringRouter };
