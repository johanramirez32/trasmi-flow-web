# Estructura del proyecto TransmiFlow

Este documento explica **cómo está organizado el proyecto y para qué sirve cada archivo**.
No se movió ni se modificó ningún archivo de código: solo se agregó esta guía y el
workspace de Visual Studio Code.

## Árbol general

```
transmiflow/
├─ transmiflow.code-workspace      Workspace de VS Code con las carpetas agrupadas
├─ .gitignore                      Archivos que NO se suben a Git (.env, .secret, node_modules)
├─ .vscode/
│  └─ launch.json                  Configuración para depurar el servidor en VS Code
├─ backend/                        Servidor Node.js + Express + PostgreSQL
│  ├─ README.md                    Guía del backend (este nivel)
│  ├─ .env                         Configuración local (NO se sube a Git)
│  ├─ .env.example                 Plantilla de variables de entorno
│  ├─ .secret                      Clave HMAC local (NO se sube a Git)
│  ├─ server.js                    Punto de entrada: crea Express y monta los routers
│  ├─ db.js                        Conexión a PostgreSQL (local / Render)
│  ├─ seguridad.js                 Tokens HMAC, requerirAuth, requerirOperario, límite de intentos
│  ├─ inicializar.js               Crea/actualiza tablas y siembra datos al arrancar
│  ├─ verificacion.js              Motor de las 15 comprobaciones de npm test
│  ├─ cargar-estaciones.js         Script: importa estaciones desde CSV
│  ├─ exportar-estaciones.js       Script: exporta estaciones a JSON
│  ├─ init-db.sql                  SQL base de la base de datos
│  ├─ seed-estaciones.sql          SQL de semilla de estaciones
│  ├─ package.json                 Dependencias y scripts (start, test, test:vuln)
│  ├─ package-lock.json            Versiones exactas de las dependencias
│  ├─ controllers/                 Lógica de negocio de cada endpoint
│  ├─ routes/                      Definición de URLs y middleware de cada endpoint
│  ├─ services/                    Cálculos reutilizables
│  ├─ modules/                     Módulos independientes (monitoreo de cámaras)
│  ├─ datos/                       Datos JSON que se usan para sembrar
│  ├─ test/                        Pruebas automatizadas
│  └─ public/                      Frontend (HTML, CSS, JS y librerías locales)
└─ docs/                           Documentación y respaldos de base de datos
```

## Carpetas principales

| Carpeta | Para qué sirve |
|---|---|
| `backend/controllers` | Funciones que ejecuta cada endpoint (login, reportes, rutas, etc.). |
| `backend/routes` | Declara las rutas `/api/...` y qué controlador las atiende. |
| `backend/services` | Lógica compartida, por ejemplo el cálculo de aglomeración. |
| `backend/modules` | Funcionalidades independientes; hoy contiene el módulo de cámaras con IA. |
| `backend/datos` | JSON con estaciones, rutas y cámaras para sembrar la base de datos. |
| `backend/test` | Scripts de verificación general y de vulnerabilidades. |
| `backend/public` | Todo lo que ve el usuario en el navegador. |
| `docs` | Diagramas, casos de uso, modelos de datos y dump de la base de datos. |

## Backend: archivos de la raíz

| Archivo | Para qué sirve |
|---|---|
| `server.js` | Arranca Express, configura CORS, monta `/api/...`, sirve `public/` y escucha el puerto. |
| `db.js` | Crea el pool de PostgreSQL; detecta si está en local o en Render. |
| `seguridad.js` | Firma y verifica tokens, exige login o rol operario, limita intentos de ingreso. |
| `inicializar.js` | Idempotente: crea esquema, siembra estaciones/rutas/cámaras/vagones y el operario de demostración. |
| `verificacion.js` | Compruebas de salud, seguridad e integridad usadas por `npm test`. |
| `cargar-estaciones.js` | Herramienta de una vez para cargar estaciones desde un CSV oficial. |
| `exportar-estaciones.js` | Exporta las estaciones de PostgreSQL a `backend/datos/estaciones.json`. |
| `init-db.sql`, `seed-estaciones.sql` | Sentencias SQL base y de datos iniciales. |
| `.env`, `.secret` | Configuración y clave privada local; excluidas de Git. |
| `.env.example` | Plantilla con las variables que hay que configurar. |

## Backend: controllers

| Archivo | Para qué sirve |
|---|---|
| `authController.js` | Registro, login con contraseña, login con Google y retorno del operario demo. |
| `reportesController.js` | Crear, listar y atender reportes de aglomeración. |
| `estacionesController.js` | Catálogo de estaciones, con compatibilidad con esquemas anteriores. |
| `rutasController.js` | Rutas por estación, itinerario y planificación con respaldo oficial. |
| `rutasOficialesController.js` | Datos oficiales de Transmilenio (ArcGIS) y planificación estación por estación. |
| `nivelesController.js` | Niveles de ocupación por estación, ruta y portal. |
| `notificacionesController.js` | Notificaciones por usuario y marcado como leídas. |
| `camarasController.js` | Cámaras de seguridad por estación. |
| `despachoController.js` | Despacho de buses (placa, cédula, tipo) y estadísticas. |
| `healthController.js` | Respuesta de estado del servidor (`/api/health`). |

## Backend: routes

| Archivo | URLs que expone |
|---|---|
| `authRouter.js` | `/api/registro`, `/api/login`, `/api/google`, `/api/config` |
| `reportesRouter.js` | `/api/reportes` y atención de reportes |
| `estacionesRouter.js` | `/api/estaciones` |
| `rutasRouter.js` | `/api/rutas`, `/api/rutas/estacion`, `/api/rutas/itinerario`, `/api/rutas/oficiales` |
| `nivelesRouter.js` | `/api/niveles` |
| `alertasRouter.js` | `/api/alertas/aglomeracion` |
| `notificacionesRouter.js` | `/api/notificaciones` |
| `camarasRouter.js` | `/api/camaras` |
| `despachosRouter.js` | `/api/despacho`, `/api/despachos` |
| `flotaRouter.js` | Buses y conductores disponibles |
| `vagonesRouter.js` | `/api/vagones/:estacionId` (rutas y cámaras por vagón) |
| `healthRouter.js` | `/api/health` |

## Backend: servicios y módulos

| Archivo / carpeta | Para qué sirve |
|---|---|
| `services/aglomeracion.js` | Convierte reportes en niveles Baja/Media/Alta para rutas, estaciones y portales. |
| `modules/monitoring/index.js` | API del módulo de cámaras: dashboard, zonas, alertas, métricas IA y top 5. |
| `modules/monitoring/schema.sql` | Tablas del módulo de monitoreo. |
| `modules/monitoring/README.md` | Documentación del módulo de aglomeración por cámaras. |
| `modules/monitoring/ai_worker/` | Worker Python (YOLO + OpenCV) que envía métricas al backend. |

## Backend: datos y pruebas

| Archivo | Para qué sirve |
|---|---|
| `datos/estaciones.json` | Catálogo de estaciones para sembrar la base de datos. |
| `datos/rutas.json` | Catálogo de rutas. |
| `datos/camaras.json` | Catálogo de cámaras. |
| `test/ejecutar-verificacion.js` | Ejecuta `npm test` (15 comprobaciones). |
| `test/vulnerabilidades.js` | Ejecuta `npm run test:vuln` (11 comprobaciones en vivo). |

## Frontend (`backend/public`)

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Pantalla principal: acceso de usuario y operador, mapa, alertas, reportes y panel operativo. |
| `operador.html` | Página alternativa de acceso operativo. |
| `js/estado.js` | Estado global: `API_URL`, token y encabezado `Authorization` de las peticiones. |
| `js/api.js` | Búsqueda y sugerencias de estaciones. |
| `js/app.js` | Navegación, login/registro, Google, permisos por rol, reportes, notificaciones y campana. |
| `js/mapa.js` | Mapa Leaflet, trazo estación por estación, itinerario y rutas alternativas. |
| `js/operador.js` | Panel operativo: reportes, rutas/bagones, despachos y cámaras. |
| `vendor/` | Tailwind, Lucide, Leaflet servidos localmente (sin depender de CDNs). |

## Documentación (`docs`)

| Archivo | Para qué sirve |
|---|---|
| `CASOS_DE_USO.md` | Casos de uso del sistema. |
| `DIAGRAMAS_UML.md` | Diagramas UML. |
| `MODELO_ENTIDAD_RELACION.md` | Modelo entidad-relación. |
| `MODELO_RELACIONAL.sql` | Modelo relacional en SQL. |
| `INVENTARIO_ESTACIONES.md` | Inventario de estaciones. |
| `transmiflow_dump.sql` | Respaldo completo de la base de datos (incluye el módulo de cámaras). |

## Cómo abrirlo en VS Code

Abre `transmiflow.code-workspace` desde **Archivo → Abrir workspace**. Las carpetas
quedan agrupadas como `TransmiFlow (raíz)`, `Backend`, `Frontend`, `Módulos`, `Datos`,
`Pruebas` y `Documentación`.
