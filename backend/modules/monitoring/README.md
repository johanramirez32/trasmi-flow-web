# TransmiFlow - Módulo de monitoreo de aglomeraciones

Módulo independiente para integrar al backend Node.js + Express + PostgreSQL de TransmiFlow.

## Qué incluye
- API Express para recibir mediciones de cámaras/IA y consultar dashboard, zonas y alertas.
- Esquema PostgreSQL para estaciones, zonas, cámaras, mediciones y alertas.
- Worker Python con YOLO + OpenCV para contar personas dentro de una zona poligonal.
- Ejemplo de consumo desde el frontend.

## Arquitectura
Cámara/archivo de video -> worker Python (YOLO) -> POST API Node -> PostgreSQL -> frontend web.

El worker envía métricas, no transmite video al servidor web. Esto reduce tráfico y evita almacenar video innecesariamente.

## 1. Base de datos
Ejecuta `database/schema.sql` sobre la base PostgreSQL de TransmiFlow, por ejemplo:

```powershell
psql -U postgres -d transmiflow -f .\database\schema.sql
```

Si aún no tienes creada la base:
```sql
CREATE DATABASE transmiflow;
```

## 2. Backend Node/Express
Requisitos: Node.js 18+ y un backend Express existente.

Instala la dependencia si no está:
```bash
npm install pg
```

Copia la carpeta `backend/monitoring` dentro de tu backend, por ejemplo:
`src/modules/monitoring/`

En el archivo donde creas tu app Express, integra:

```js
const express = require("express");
const { createMonitoringRouter } = require("./modules/monitoring");

const app = express();
app.use(express.json({ limit: "1mb" }));

const pool = require("./db"); // debe exportar un pool pg
app.use("/api/monitoring", createMonitoringRouter({
  pool,
  apiKey: process.env.MONITORING_API_KEY
}));
```

Si tu `db.js` exporta `{ pool }` en vez del pool directamente, usa:
`const { pool } = require("./db");`

En `.env` del backend agrega una clave larga:
```env
MONITORING_API_KEY=pon_una_clave_larga_y_privada
```

No expongas esta clave en el frontend. Solo el worker de IA debe utilizarla.

## 3. Crear datos de prueba
Después de ejecutar el esquema, inserta una estación, zona y cámara:

```sql
INSERT INTO monitoring_stations (code, name, location)
VALUES ('EST-DEMO', 'Estación de prueba', 'Bogotá, Colombia')
ON CONFLICT (code) DO NOTHING;

INSERT INTO monitoring_zones (station_id, code, name, capacity, area_m2)
SELECT id, 'ZONA-A', 'Zona A - Andén', 100, 50
FROM monitoring_stations WHERE code = 'EST-DEMO'
ON CONFLICT (station_id, code) DO NOTHING;

INSERT INTO monitoring_cameras (zone_id, code, name, source, polygon)
SELECT z.id, 'CAM-DEMO', 'Cámara de prueba', '0',
       '[[100,100],[500,100],[500,400],[100,400]]'::jsonb
FROM monitoring_zones z
JOIN monitoring_stations s ON s.id = z.station_id
WHERE s.code = 'EST-DEMO'
ON CONFLICT (code) DO NOTHING;
```

`source='0'` significa webcam local para pruebas. En producción, configura un stream autorizado, por ejemplo RTSP, y protege credenciales.

## 4. Worker de IA
Requisitos: Python 3.10+; cámara accesible desde el equipo que ejecuta el worker.

```bash
cd ai_worker
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Linux:
# source .venv/bin/activate

pip install -r requirements.txt
```

Crea `ai_worker/.env` a partir de `.env.example`:
```env
MONITORING_API_URL=http://localhost:3000/api/monitoring
MONITORING_API_KEY=la_misma_clave_privada_del_backend
CAMERAS_CONFIG=cameras.json
SEND_EVERY_SECONDS=5
MODEL=yolo11n.pt
```

Edita `ai_worker/cameras.json`. Los puntos del polígono están en coordenadas de píxeles del video (x,y), en orden alrededor del área. Ajusta resolución y polígono a la cámara real.

Ejecuta:
```bash
python worker.py
```

El modelo se descarga automáticamente la primera vez. Para pruebas puedes cambiar `source` a `0` (webcam) o a una ruta de video. El worker procesa una cámara a la vez en este ejemplo. Para varias cámaras, despliega workers separados o añade un proceso por cámara con límites de CPU/GPU.

## 5. Frontend
Usa el ejemplo `frontend/monitoring.js` o adapta las llamadas a tu framework. El frontend consulta:
- `GET /api/monitoring/dashboard`
- `GET /api/monitoring/zones`
- `GET /api/monitoring/alerts`

El endpoint de métricas está protegido por API key y no debe llamarse directamente desde el navegador.

## API
- `GET /dashboard?stationId=...`
- `GET /zones?stationId=...`
- `GET /alerts?status=active&limit=50`
- `POST /metrics` (API key)
- `PATCH /alerts/:id/acknowledge` (requiere autenticación de usuario en tu backend; este módulo deja el punto de integración marcado)

## Importante antes de producción
- La capacidad debe ser configurada por personal responsable y validada por estación/zona.
- Conteo de cámara es una estimación: oclusiones, ángulos, iluminación y densidad afectan precisión.
- El porcentaje es `personas / capacidad * 100`, no una certificación oficial de seguridad.
- Densidad `personas/m²` solo es fiable si `area_m2` y área útil están medidas/calibradas.
- Usa cámaras autorizadas, minimiza almacenamiento de imágenes y aplica políticas de protección de datos.
- El módulo no ordena despachos ni controla infraestructura. Solo genera información/alertas; acciones operativas requieren permisos e integración oficial.
