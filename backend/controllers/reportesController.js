/**
 * Controller de reportes compatible con esquemas anteriores.
 * POST /api/reportes
 * GET  /api/reportes
 * GET  /api/reportes/rutas
 * POST /api/reportes/:id/atender
 */
const { getPool } = require('../db');

const pool = getPool();

function texto(valor, max) {
  return String(valor == null ? '' : valor).trim().slice(0, max);
}

/** Columnas existentes en una tabla (para despliegues con esquema anterior) */
async function columnas(tabla) {
  const r = await pool.query(
    'SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2',
    ['public', tabla]
  );
  return r.rows.map(function (x) { return x.column_name; });
}

async function crearReporte(req, res) {
  const estacion = texto(req.body.estacion, 120);
  const ruta = texto(req.body.ruta, 20);
  const nivel = ['Baja', 'Media', 'Alta'].indexOf(req.body.nivel) !== -1 ? req.body.nivel : '';
  const usuario = req.usuario ? req.usuario.email : 'anonimo';

  if (!estacion || !ruta || !nivel) {
    return res.status(400).json({ error: 'Indica la estacion, la ruta y el nivel de ocupacion.' });
  }

  try {
    const cols = await columnas('reportes');
    const campos = ['estacion', 'nivel', 'usuario'];
    const valores = [estacion, nivel, usuario];

    if (cols.indexOf('ruta') !== -1) { campos.push('ruta'); valores.push(ruta); }
    if (cols.indexOf('estacion_id') !== -1) {
      const e = await pool.query('SELECT id FROM estaciones WHERE LOWER(nombre)=LOWER($1) LIMIT 1', [estacion]);
      campos.push('estacion_id'); valores.push(e.rows[0] ? e.rows[0].id : null);
    }
    if (cols.indexOf('ruta_id') !== -1 && cols.indexOf('ruta') !== -1) {
      const rr = await pool.query('SELECT id FROM rutas WHERE codigo=$1 LIMIT 1', [ruta]);
      campos.push('ruta_id'); valores.push(rr.rows[0] ? rr.rows[0].id : null);
    }
    if (cols.indexOf('usuario_id') !== -1) {
      const u = await pool.query('SELECT id FROM usuarios WHERE LOWER(email)=LOWER($1) LIMIT 1', [usuario]);
      campos.push('usuario_id'); valores.push(u.rows[0] ? u.rows[0].id : null);
    }

    const marcadores = campos.map(function (_, i) { return '$' + (i + 1); });
    const resultado = await pool.query(
      'INSERT INTO reportes (' + campos.join(',') + ') VALUES (' + marcadores.join(',') + ') RETURNING id',
      valores
    );

    const nuevo = await pool.query(
      'SELECT id, estacion, nivel, usuario, creado_en' +
      (cols.indexOf('ruta') !== -1 ? ', ruta' : '') + ' FROM reportes WHERE id = $1',
      [resultado.rows[0].id]
    );
    res.status(201).json({ mensaje: 'Reporte recibido', reporte: nuevo.rows[0] });
  } catch (err) {
    console.error('ERROR_CREAR_REPORTE: ' + err.message);
    res.status(500).json({ error: 'No se pudo guardar el reporte: ' + err.message });
  }
}

/** EXISTENCIA de atencion: usa reporte_id si existe, si no compara por texto */
async function expresionAtendido() {
  const cols = await columnas('notificaciones');
  if (cols.indexOf('reporte_id') !== -1) {
    return 'EXISTS (SELECT 1 FROM notificaciones n WHERE n.reporte_id = r.id)';
  }
  return "EXISTS (SELECT 1 FROM notificaciones n WHERE LOWER(n.usuario)=LOWER(r.usuario) " +
         "AND n.mensaje LIKE '%' || r.estacion || '%' AND n.creado_en >= r.creado_en)";
}

async function listarReportes(req, res) {
  try {
    const limite = Math.min(parseInt(req.query.limite, 10) || 25, 100);
    const cols = await columnas('reportes');
    const rutaCol = cols.indexOf('ruta') !== -1 ? "COALESCE(r.ruta,'') AS ruta," : "'' AS ruta,";
    const atendido = await expresionAtendido();
    const r = await pool.query(
      'SELECT r.id, r.estacion, ' + rutaCol + ' r.nivel, r.usuario, r.creado_en, ' +
      atendido + ' AS atendido FROM reportes r ORDER BY r.creado_en DESC, r.id DESC LIMIT $1',
      [limite]
    );
    res.json(r.rows);
  } catch (err) {
    console.error('ERROR_LISTAR_REPORTES: ' + err.message);
    // Ultimo recurso
    try {
      const r = await pool.query('SELECT id, estacion, nivel, usuario, creado_en FROM reportes ORDER BY id DESC LIMIT 25');
      res.json(r.rows.map(function (x) { return Object.assign({ ruta: '', atendido: false }, x); }));
    } catch (e2) { res.status(500).json({ error: 'No se pudieron cargar los reportes.' }); }
  }
}

async function rutasReportadas(req, res) {
  try {
    const cols = await columnas('reportes');
    const rutaCol = cols.indexOf('ruta') !== -1 ? "COALESCE(r.ruta,'SIN RUTA')" : "'SIN RUTA'";
    const atendido = await expresionAtendido();
    const r = await pool.query(
      'SELECT r.estacion, ' + rutaCol + ' AS ruta, r.nivel, r.usuario, r.creado_en, ' +
      atendido + ' AS atendido FROM reportes r ORDER BY r.creado_en DESC LIMIT 100'
    );

    const grupos = {};
    r.rows.forEach(function (x) {
      const k = x.estacion + '|' + x.ruta;
      if (!grupos[k]) {
        grupos[k] = { estacion: x.estacion, ruta: x.ruta, nivel: x.nivel,
          atendido: x.atendido, creado_en: x.creado_en, usuarios: [], total: 0 };
      }
      grupos[k].total++;
      if (grupos[k].usuarios.indexOf(x.usuario) === -1) { grupos[k].usuarios.push(x.usuario); }
    });
    res.json({ rutas: Object.keys(grupos).map(function (k) { return grupos[k]; }) });
  } catch (err) {
    console.error('ERROR_RUTAS_REPORTADAS: ' + err.message);
    res.json({ rutas: [] });
  }
}

async function atenderReporte(req, res) {
  try {
    const id = req.params.id;
    const r = await pool.query('SELECT * FROM reportes WHERE id = $1', [id]);
    if (!r.rows.length) { return res.status(404).json({ error: 'Reporte no encontrado.' }); }
    const rep = r.rows[0];

    const cols = await columnas('notificaciones');
    const campos = ['usuario', 'mensaje', 'tipo'];
    const valores = [rep.usuario,
      'Tu reporte en ' + rep.estacion + (rep.ruta ? ' (ruta ' + rep.ruta + ')' : '') +
        ' fue tramitado por el operario.', 'operador'];
    if (cols.indexOf('reporte_id') !== -1) { campos.push('reporte_id'); valores.push(rep.id); }
    if (cols.indexOf('usuario_id') !== -1) {
      const u = await pool.query('SELECT id FROM usuarios WHERE LOWER(email)=LOWER($1) LIMIT 1', [rep.usuario]);
      campos.push('usuario_id'); valores.push(u.rows[0] ? u.rows[0].id : null);
    }
    const marcadores = campos.map(function (_, i) { return '$' + (i + 1); });
    await pool.query(
      'INSERT INTO notificaciones (' + campos.join(',') + ') VALUES (' + marcadores.join(',') + ')',
      valores
    );

    res.json({ mensaje: 'Reporte tramitado', id: rep.id });
  } catch (err) {
    console.error('ERROR_ATENDER_REPORTE: ' + err.message);
    res.status(500).json({ error: 'No se pudo tramitar el reporte: ' + err.message });
  }
}

module.exports = { crearReporte, listarReportes, rutasReportadas, atenderReporte };
