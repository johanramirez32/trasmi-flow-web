-- ============================================================
-- TransmiFlow - Volcado completo de la base de datos
-- Esquema + datos: estaciones (direccion y portal), rutas, ruta_estaciones,
-- vagones, vagon_rutas, usuarios, buses, conductores, despachos,
-- reportes, notificaciones y camaras.
--
-- Restaurar: psql -U postgres -d transmiflow_db -f transmiflow_dump.sql
-- ============================================================

--
-- PostgreSQL database dump
--

\restrict U4zzv8AlOTdaCTmlhZWlUdHb6OH8523qRvesJGFIel2jIK7KslVFsqdABot8QJL

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.vagones DROP CONSTRAINT IF EXISTS vagones_estacion_id_fkey;
ALTER TABLE IF EXISTS ONLY public.vagon_rutas DROP CONSTRAINT IF EXISTS vagon_rutas_vagon_id_fkey;
ALTER TABLE IF EXISTS ONLY public.vagon_rutas DROP CONSTRAINT IF EXISTS vagon_rutas_ruta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ruta_estaciones DROP CONSTRAINT IF EXISTS ruta_estaciones_ruta_id_fkey;
ALTER TABLE IF EXISTS ONLY public.ruta_estaciones DROP CONSTRAINT IF EXISTS ruta_estaciones_estacion_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reportes DROP CONSTRAINT IF EXISTS fk_rep_vagon;
ALTER TABLE IF EXISTS ONLY public.reportes DROP CONSTRAINT IF EXISTS fk_rep_usu;
ALTER TABLE IF EXISTS ONLY public.reportes DROP CONSTRAINT IF EXISTS fk_rep_ruta;
ALTER TABLE IF EXISTS ONLY public.reportes DROP CONSTRAINT IF EXISTS fk_rep_est;
ALTER TABLE IF EXISTS ONLY public.notificaciones DROP CONSTRAINT IF EXISTS fk_not_usu;
ALTER TABLE IF EXISTS ONLY public.notificaciones DROP CONSTRAINT IF EXISTS fk_not_rep;
ALTER TABLE IF EXISTS ONLY public.despachos DROP CONSTRAINT IF EXISTS fk_des_ruta;
ALTER TABLE IF EXISTS ONLY public.despachos DROP CONSTRAINT IF EXISTS fk_des_op;
ALTER TABLE IF EXISTS ONLY public.despachos DROP CONSTRAINT IF EXISTS fk_des_est;
ALTER TABLE IF EXISTS ONLY public.despachos DROP CONSTRAINT IF EXISTS fk_des_cond;
ALTER TABLE IF EXISTS ONLY public.despachos DROP CONSTRAINT IF EXISTS fk_des_bus;
ALTER TABLE IF EXISTS ONLY public.camaras DROP CONSTRAINT IF EXISTS fk_cam_vagon;
ALTER TABLE IF EXISTS ONLY public.camaras DROP CONSTRAINT IF EXISTS fk_cam_est;
DROP INDEX IF EXISTS public.idx_usuarios_email;
DROP INDEX IF EXISTS public.idx_rutas_codigo;
DROP INDEX IF EXISTS public.idx_ruta_estaciones_ruta;
DROP INDEX IF EXISTS public.idx_ruta_estaciones_estacion;
DROP INDEX IF EXISTS public.idx_reportes_estacion;
DROP INDEX IF EXISTS public.idx_rep_ruta_id;
DROP INDEX IF EXISTS public.idx_rep_est_id;
DROP INDEX IF EXISTS public.idx_notificaciones_usuario;
DROP INDEX IF EXISTS public.idx_not_usu_id;
DROP INDEX IF EXISTS public.idx_estaciones_troncal;
DROP INDEX IF EXISTS public.idx_estaciones_nombre;
DROP INDEX IF EXISTS public.idx_despachos_estacion;
DROP INDEX IF EXISTS public.idx_des_ruta_id;
DROP INDEX IF EXISTS public.idx_des_est_id;
DROP INDEX IF EXISTS public.idx_camaras_estacion;
ALTER TABLE IF EXISTS ONLY public.vagones DROP CONSTRAINT IF EXISTS vagones_pkey;
ALTER TABLE IF EXISTS ONLY public.vagon_rutas DROP CONSTRAINT IF EXISTS vagon_rutas_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_email_key;
ALTER TABLE IF EXISTS ONLY public.rutas DROP CONSTRAINT IF EXISTS uq_rutas_codigo;
ALTER TABLE IF EXISTS ONLY public.conductores DROP CONSTRAINT IF EXISTS uq_cond_cedula;
ALTER TABLE IF EXISTS ONLY public.buses DROP CONSTRAINT IF EXISTS uq_buses_placa;
ALTER TABLE IF EXISTS ONLY public.rutas DROP CONSTRAINT IF EXISTS rutas_pkey;
ALTER TABLE IF EXISTS ONLY public.rutas DROP CONSTRAINT IF EXISTS rutas_codigo_key;
ALTER TABLE IF EXISTS ONLY public.ruta_estaciones DROP CONSTRAINT IF EXISTS ruta_estaciones_pkey;
ALTER TABLE IF EXISTS ONLY public.reportes DROP CONSTRAINT IF EXISTS reportes_pkey;
ALTER TABLE IF EXISTS ONLY public.notificaciones DROP CONSTRAINT IF EXISTS notificaciones_pkey;
ALTER TABLE IF EXISTS ONLY public.estaciones DROP CONSTRAINT IF EXISTS estaciones_pkey;
ALTER TABLE IF EXISTS ONLY public.despachos DROP CONSTRAINT IF EXISTS despachos_pkey;
ALTER TABLE IF EXISTS ONLY public.conductores DROP CONSTRAINT IF EXISTS conductores_pkey;
ALTER TABLE IF EXISTS ONLY public.conductores DROP CONSTRAINT IF EXISTS conductores_cedula_key;
ALTER TABLE IF EXISTS ONLY public.camaras DROP CONSTRAINT IF EXISTS camaras_pkey;
ALTER TABLE IF EXISTS ONLY public.buses DROP CONSTRAINT IF EXISTS buses_placa_key;
ALTER TABLE IF EXISTS ONLY public.buses DROP CONSTRAINT IF EXISTS buses_pkey;
ALTER TABLE IF EXISTS public.vagones ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.vagon_rutas ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.usuarios ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.rutas ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.ruta_estaciones ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.reportes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notificaciones ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.estaciones ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.despachos ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.conductores ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.camaras ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.buses ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.vagones_id_seq;
DROP TABLE IF EXISTS public.vagones;
DROP SEQUENCE IF EXISTS public.vagon_rutas_id_seq;
DROP TABLE IF EXISTS public.vagon_rutas;
DROP SEQUENCE IF EXISTS public.usuarios_id_seq;
DROP TABLE IF EXISTS public.usuarios;
DROP SEQUENCE IF EXISTS public.rutas_id_seq;
DROP TABLE IF EXISTS public.rutas;
DROP SEQUENCE IF EXISTS public.ruta_estaciones_id_seq;
DROP TABLE IF EXISTS public.ruta_estaciones;
DROP SEQUENCE IF EXISTS public.reportes_id_seq;
DROP TABLE IF EXISTS public.reportes;
DROP SEQUENCE IF EXISTS public.notificaciones_id_seq;
DROP TABLE IF EXISTS public.notificaciones;
DROP SEQUENCE IF EXISTS public.estaciones_id_seq;
DROP TABLE IF EXISTS public.estaciones;
DROP SEQUENCE IF EXISTS public.despachos_id_seq;
DROP TABLE IF EXISTS public.despachos;
DROP SEQUENCE IF EXISTS public.conductores_id_seq;
DROP TABLE IF EXISTS public.conductores;
DROP SEQUENCE IF EXISTS public.camaras_id_seq;
DROP TABLE IF EXISTS public.camaras;
DROP SEQUENCE IF EXISTS public.buses_id_seq;
DROP TABLE IF EXISTS public.buses;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: buses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.buses (
    id integer NOT NULL,
    placa character varying(20) NOT NULL,
    tipo character varying(30) DEFAULT 'Bus normal'::character varying,
    activo boolean DEFAULT true
);


--
-- Name: buses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.buses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: buses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.buses_id_seq OWNED BY public.buses.id;


--
-- Name: camaras; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.camaras (
    id integer NOT NULL,
    estacion character varying(120) NOT NULL,
    nombre character varying(160) NOT NULL,
    latitud numeric(10,7),
    longitud numeric(10,7),
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estacion_id integer,
    vagon_id integer
);


--
-- Name: camaras_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.camaras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: camaras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.camaras_id_seq OWNED BY public.camaras.id;


--
-- Name: conductores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conductores (
    id integer NOT NULL,
    nombre character varying(120) NOT NULL,
    cedula character varying(20) NOT NULL,
    telefono character varying(20),
    activo boolean DEFAULT true
);


--
-- Name: conductores_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conductores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conductores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conductores_id_seq OWNED BY public.conductores.id;


--
-- Name: despachos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.despachos (
    id integer NOT NULL,
    estacion character varying(120) NOT NULL,
    bus character varying(20) NOT NULL,
    operador character varying(150) NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ruta character varying(20),
    tipo_bus character varying(30) DEFAULT 'Bus normal'::character varying,
    conductor character varying(30),
    estacion_id integer,
    ruta_id integer,
    bus_id integer,
    conductor_id integer,
    operador_id integer,
    CONSTRAINT ck_des_tipo CHECK (((tipo_bus IS NULL) OR ((tipo_bus)::text = ANY ((ARRAY['Bus normal'::character varying, 'Biarticulado'::character varying])::text[]))))
);


--
-- Name: despachos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.despachos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: despachos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.despachos_id_seq OWNED BY public.despachos.id;


--
-- Name: estaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estaciones (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    tipo character varying(50) NOT NULL,
    latitud numeric(10,8) NOT NULL,
    longitud numeric(11,8) NOT NULL,
    troncal character varying(60),
    aglomeracion character varying(20) DEFAULT 'Media'::character varying,
    capacidad integer DEFAULT 0,
    lat numeric(10,7),
    lng numeric(10,7),
    direccion character varying(255),
    portal character varying(120)
);


--
-- Name: estaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.estaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: estaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.estaciones_id_seq OWNED BY public.estaciones.id;


--
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notificaciones (
    id integer NOT NULL,
    usuario character varying(150) NOT NULL,
    mensaje character varying(255) NOT NULL,
    tipo character varying(30) DEFAULT 'operador'::character varying,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    leido boolean DEFAULT false,
    usuario_id integer,
    reporte_id integer
);


--
-- Name: notificaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notificaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notificaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notificaciones_id_seq OWNED BY public.notificaciones.id;


--
-- Name: reportes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reportes (
    id integer NOT NULL,
    estacion character varying(120) NOT NULL,
    nivel character varying(20) NOT NULL,
    usuario character varying(150),
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ruta character varying(20),
    estacion_id integer,
    ruta_id integer,
    usuario_id integer,
    vagon_id integer,
    CONSTRAINT ck_rep_nivel CHECK (((nivel)::text = ANY ((ARRAY['Baja'::character varying, 'Media'::character varying, 'Alta'::character varying])::text[])))
);


--
-- Name: reportes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reportes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reportes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reportes_id_seq OWNED BY public.reportes.id;


--
-- Name: ruta_estaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ruta_estaciones (
    id integer NOT NULL,
    ruta_id integer,
    estacion_id integer,
    orden integer NOT NULL
);


--
-- Name: ruta_estaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ruta_estaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ruta_estaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ruta_estaciones_id_seq OWNED BY public.ruta_estaciones.id;


--
-- Name: rutas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rutas (
    id integer NOT NULL,
    codigo character varying(10) NOT NULL,
    nombre character varying(100) NOT NULL,
    color_hex character varying(7) DEFAULT '#000000'::character varying,
    coordenadas jsonb,
    origen character varying(160),
    destino character varying(160)
);


--
-- Name: rutas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rutas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rutas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rutas_id_seq OWNED BY public.rutas.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(255) NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    rol character varying(20) DEFAULT 'usuario'::character varying,
    codigo_operador character varying(20),
    CONSTRAINT ck_usu_rol CHECK (((rol)::text = ANY ((ARRAY['usuario'::character varying, 'operario'::character varying])::text[])))
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: vagon_rutas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vagon_rutas (
    id integer NOT NULL,
    vagon_id integer NOT NULL,
    ruta_id integer NOT NULL,
    orden integer DEFAULT 0
);


--
-- Name: vagon_rutas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vagon_rutas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vagon_rutas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vagon_rutas_id_seq OWNED BY public.vagon_rutas.id;


--
-- Name: vagones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vagones (
    id integer NOT NULL,
    estacion_id integer NOT NULL,
    nombre character varying(120) NOT NULL,
    sentido character varying(20) DEFAULT 'Ida'::character varying NOT NULL,
    activo boolean DEFAULT true
);


--
-- Name: vagones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vagones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vagones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vagones_id_seq OWNED BY public.vagones.id;


--
-- Name: buses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buses ALTER COLUMN id SET DEFAULT nextval('public.buses_id_seq'::regclass);


--
-- Name: camaras id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.camaras ALTER COLUMN id SET DEFAULT nextval('public.camaras_id_seq'::regclass);


--
-- Name: conductores id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conductores ALTER COLUMN id SET DEFAULT nextval('public.conductores_id_seq'::regclass);


--
-- Name: despachos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.despachos ALTER COLUMN id SET DEFAULT nextval('public.despachos_id_seq'::regclass);


--
-- Name: estaciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estaciones ALTER COLUMN id SET DEFAULT nextval('public.estaciones_id_seq'::regclass);


--
-- Name: notificaciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones ALTER COLUMN id SET DEFAULT nextval('public.notificaciones_id_seq'::regclass);


--
-- Name: reportes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes ALTER COLUMN id SET DEFAULT nextval('public.reportes_id_seq'::regclass);


--
-- Name: ruta_estaciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ruta_estaciones ALTER COLUMN id SET DEFAULT nextval('public.ruta_estaciones_id_seq'::regclass);


--
-- Name: rutas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutas ALTER COLUMN id SET DEFAULT nextval('public.rutas_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: vagon_rutas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vagon_rutas ALTER COLUMN id SET DEFAULT nextval('public.vagon_rutas_id_seq'::regclass);


--
-- Name: vagones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vagones ALTER COLUMN id SET DEFAULT nextval('public.vagones_id_seq'::regclass);


--
-- Data for Name: buses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.buses (id, placa, tipo, activo) FROM stdin;
1	BCO-101	Bus normal	t
2	BCO-102	Bus normal	t
3	BCO-103	Bus normal	t
4	BCO-104	Biarticulado	t
5	BCO-105	Biarticulado	t
6	BCO-106	Bus normal	t
7	BCO-107	Bus normal	t
8	BCO-108	Bus normal	t
9	BCO-109	Biarticulado	t
10	BCO-110	Bus normal	t
11	BCO-111	Bus normal	t
12	BCO-112	Bus normal	t
13	B1	Biarticulado	t
\.


--
-- Data for Name: camaras; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.camaras (id, estacion, nombre, latitud, longitud, creado_en, estacion_id, vagon_id) FROM stdin;
1	Portal Tunal	Camara 1	\N	\N	2026-11-05 20:00:15.062825	426	235
2	Portal Usme	Camara 1	\N	\N	2026-11-05 20:00:15.062825	422	227
5	Portal Tunal	Camara 2	\N	\N	2026-11-05 20:00:15.062825	426	235
6	Portal Usme	Camara 2	\N	\N	2026-11-05 20:00:15.062825	422	227
3	Portal Suba	Camara 1	\N	\N	2026-11-05 20:00:15.062825	431	245
4	Temporal AV. Jiménez - Inter Eléctricas	Camara 1	\N	\N	2026-11-05 20:00:15.062825	394	141
\.


--
-- Data for Name: conductores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conductores (id, nombre, cedula, telefono, activo) FROM stdin;
1	Carlos Ramírez	1012345678	3001112233	t
2	María Gómez	1023456789	3002223344	t
3	Johan Sánchez	1034567890	3003334455	t
4	Andrés Torres	1045678901	3004445566	t
5	Laura Martínez	1056789012	3005556677	t
6	Diego Hernández	1067890123	3006667788	t
\.


--
-- Data for Name: despachos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.despachos (id, estacion, bus, operador, creado_en, ruta, tipo_bus, conductor, estacion_id, ruta_id, bus_id, conductor_id, operador_id) FROM stdin;
12	Patio Bonito	BCO-105	jxhansrs@gmail.com	2026-11-19 20:30:19.906523	5 C	Biarticulado	1034567890	425	11	5	3	10
13	Patio Bonito	BCO-105	jxhansrs@gmail.com	2026-11-19 20:30:38.84989	5 C	Biarticulado	1034567890	425	11	5	3	10
9	Alcalá – Colegio S. Tomás Dominicos	B1	jxhansrs@gmail.com	2026-11-19 19:04:10.137399	8 G	Biarticulado		362	17	13	\N	10
\.


--
-- Data for Name: estaciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.estaciones (id, nombre, tipo, latitud, longitud, troncal, aglomeracion, capacidad, lat, lng, direccion, portal) FROM stdin;
312	San Diego	troncal	4.61089909	-74.07150007	L - Carrera Decima	Alta	288	4.6108991	-74.0715001	KR 10 - CL 23	Portal 20 de Julio
314	Ricaurte - NQS	troncal	4.61168378	-74.09386595	E - NQS Central	Alta	392	4.6116838	-74.0938660	KR 30 - CL 10	Portal 20 de Julio
316	Suba - Calle 100	troncal	4.68696834	-74.06444284	C - Suba	Alta	304	4.6869683	-74.0644428	AV Suba - CL 100	Portal Suba
318	AV. Boyacá	troncal	4.69393268	-74.08713194	D - Calle 80	Alta	304	4.6939327	-74.0871319	TV 69 Bis	Portal 80
317	Calle 75 - Zona M	troncal	4.67015101	-74.07130492	E - NQS Central	Media	272	4.6701510	-74.0713049	KR 30 - CL 75A	Portal 20 de Julio
322	Niza - Calle 127	troncal	4.71200123	-74.07230720	C - Suba	Baja	200	4.7120012	-74.0723072	AV Suba - CL 127	Portal Suba
320	AV. Américas - AV. Boyacá	troncal	4.63011780	-74.13422457	F - Americas	Media	272	4.6301178	-74.1342246	AV Americas - KR 71	Portal Américas
321	Marsella	troncal	4.62967723	-74.13016385	F - Americas	Alta	320	4.6296772	-74.1301639	AV Americas - KR 69C	Portal Américas
323	La Campiña	troncal	4.74265433	-74.09120046	C - Suba	Alta	352	4.7426543	-74.0912005	AV Suba - KR 98A	Portal Suba
326	Guatoque - Veraguas	troncal	4.60417101	-74.09493313	G - NQS Sur (ramal)	Media	240	4.6041710	-74.0949331	KR 27	Portal Sur - JFK Coop. Financiera
325	Corferias	troncal	4.63430649	-74.08970085	K - Calle 26	Media	252	4.6343065	-74.0897009	KR 43	Portal 20 de Julio
335	AV. 68	troncal	4.68610088	-74.08076896	D - Calle 80	Alta	296	4.6861009	-74.0807690	KR 68D	Portal 80
327	CDS - Carrera 32	troncal	4.61613616	-74.09394954	F - Americas	Baja	168	4.6161362	-74.0939495	AV Americas - KR 32	Portal Américas
328	Ciudad Universitaria - Lotería de Bogotá	troncal	4.63087543	-74.08352723	K - Calle 26	Media	260	4.6308754	-74.0835272	KR 34	Portal 20 de Julio
329	Universidad Nacional	troncal	4.63712105	-74.07932618	E - NQS Central	Alta	412	4.6371211	-74.0793262	KR 30 - CL 45	Portal 20 de Julio
331	Tercer Milenio	troncal	4.59813501	-74.08383625	A - Caracas	Alta	320	4.5981350	-74.0838363	CL 8 - CL 6	Portal Norte – Unicervantes
332	Concejo de Bogotá	troncal	4.62598737	-74.08028966	K - Calle 26	Media	260	4.6259874	-74.0802897	CL 38	Portal 20 de Julio
337	Polo - FINCOMERCIO	troncal	4.67016265	-74.06433866	D - Calle 80	Alta	360	4.6701627	-74.0643387	TV 27	Portal 80
334	7 de Agosto	troncal	4.65729528	-74.07768646	E - NQS Central	Media	260	4.6572953	-74.0776865	KR 30 - CL 63	Portal 20 de Julio
344	Carrera 90	troncal	4.70466646	-74.10457027	D - Calle 80	Alta	304	4.7046665	-74.1045703	KR 90	Portal 80
347	Escuela Militar	troncal	4.67553501	-74.06980215	D - Calle 80	Media	272	4.6755350	-74.0698022	KR 40	Portal 80
339	Quinta Paredes	troncal	4.63750353	-74.09313226	K - Calle 26	Media	260	4.6375035	-74.0931323	KR 47	Portal 20 de Julio
340	Salitre - El Greco	troncal	4.65086482	-74.10164882	K - Calle 26	Media	260	4.6508648	-74.1016488	KR 66	Portal 20 de Julio
341	Zona Industrial	troncal	4.62032526	-74.09868611	F - Americas	Baja	168	4.6203253	-74.0986861	CL 13 - KR 38	Portal Américas
342	León XIII	troncal	4.59217281	-74.19313531	Zona Leon XIII	Media	224	4.5921728	-74.1931353	Soacha	Portal Usme
343	Paloquemao	troncal	4.61692188	-74.08955344	E - NQS Central	Media	272	4.6169219	-74.0895534	KR 30 - CL 19	Portal 20 de Julio
349	AV. Cali	troncal	4.70248285	-74.10028965	D - Calle 80	Alta	304	4.7024829	-74.1002897	KR 86	Portal 80
346	Terreros - Hospital Cardio Vascular	troncal	4.58896270	-74.19952261	Zona Leon XIII	Alta	356	4.5889627	-74.1995226	Soacha	Portal Usme
350	Suba - TV. 91	troncal	4.73893679	-74.08699228	C - Suba	Media	264	4.7389368	-74.0869923	AV Suba KR 90	Portal Suba
348	Mandalay	troncal	4.63086366	-74.14129817	F - Americas	Media	240	4.6308637	-74.1412982	AV Americas KR 73	Portal Américas
353	Prado	troncal	4.71455843	-74.05255829	B - Autopista Norte	Media	248	4.7145584	-74.0525583	CL 128 B	Portal Norte – Unicervantes
354	Terminal	troncal	4.76881876	-74.04357255	B - Autopista Norte	Baja	152	4.7688188	-74.0435726	CL 190	Portal Norte – Unicervantes
351	Ricaurte - CL 13	troncal	4.61301798	-74.09047650	F - Americas	Alta	312	4.6130180	-74.0904765	CL 13 - KR 28	Portal Américas
355	Virrey	troncal	4.67599737	-74.05901952	B - Autopista Norte	Alta	352	4.6759974	-74.0590195	CL 90	Portal Norte – Unicervantes
358	Calle 100 - Marketmedios	troncal	4.68394944	-74.05771230	B - Autopista Norte	Alta	392	4.6839494	-74.0577123	CL 97	Portal Norte – Unicervantes
359	Calle 142	troncal	4.72685009	-74.05050333	B - Autopista Norte	Baja	180	4.7268501	-74.0505033	CL 142	Portal Norte – Unicervantes
360	Portal Norte – Unicervantes	portal	4.75462286	-74.04604465	B - Autopista Norte	Baja	210	4.7546229	-74.0460447	CL 173	Portal Norte – Unicervantes
361	Calle 187	troncal	4.76333655	-74.04444370	B - Autopista Norte	Baja	152	4.7633366	-74.0444437	CL 184	Portal Norte – Unicervantes
362	Alcalá – Colegio S. Tomás Dominicos	troncal	4.72115820	-74.05145916	B - Autopista Norte	Alta	392	4.7211582	-74.0514592	CL 137	Portal Norte – Unicervantes
363	Calle 146	troncal	4.73089106	-74.04981123	B - Autopista Norte	Media	248	4.7308911	-74.0498112	CL 146	Portal Norte – Unicervantes
364	Calle 127	troncal	4.70463964	-74.05422516	B - Autopista Norte	Baja	200	4.7046396	-74.0542252	CL 127	Portal Norte – Unicervantes
365	Héroes - Colmena Seguros	troncal	4.66813603	-74.06030995	B - Autopista Norte	Media	264	4.6681360	-74.0603100	CL 80	Portal Norte – Unicervantes
368	Mazurén	troncal	4.73458855	-74.04922624	B - Autopista Norte	Media	248	4.7345886	-74.0492262	CL 152	Portal Norte – Unicervantes
370	Carrera 53	troncal	4.68180475	-74.07742142	D - Calle 80	Baja	152	4.6818048	-74.0774214	KR 53	Portal 80
369	Calle 45 - American School Way	troncal	4.63145241	-74.06787872	A - Caracas	Alta	320	4.6314524	-74.0678787	CL 45 - CL 42A	Portal Norte – Unicervantes
310	CAN	troncal	4.64687639	-74.09904645	K - Calle 26	Media	260	4.6468764	-74.0990465	KR 60	Portal 20 de Julio
371	La Castellana	troncal	4.67561116	-74.06444317	E - NQS Central	Media	232	4.6756112	-74.0644432	KR 30 KR 24	Portal 20 de Julio
372	AV. 1 Mayo	troncal	4.57693931	-74.09370940	L - Carrera Decima	Alta	384	4.5769393	-74.0937094	AV 1 De Mayo Con KR 7	Portal 20 de Julio
374	La Despensa	troncal	4.59459382	-74.18811218	Zona Leon XIII	Media	224	4.5945938	-74.1881122	Soacha	Portal Usme
315	Quirigua	troncal	4.70672525	-74.10873932	D - Calle 80	Baja	152	4.7067253	-74.1087393	KR 94	Portal 80
311	Campín - UAN	troncal	4.64539756	-74.07871009	E - NQS Central	Media	272	4.6453976	-74.0787101	KR 30 - CL 53	Portal 20 de Julio
386	Biblioteca	troncal	4.57030352	-74.13038868	Portal Tunal	Baja	60	4.5703035	-74.1303887	CL 48A Sur	Portal Tunal
381	El Tiempo – Cámara de Comercio de Bogotá	troncal	4.65706705	-74.10564666	K - Calle 26	Media	240	4.6570671	-74.1056467	KR 68D	Portal 20 de Julio
382	Biblioteca Tintal	troncal	4.63790778	-74.15935249	F - Americas	Alta	304	4.6379078	-74.1593525	AV Cali - CL 26 Sur	Portal Américas
383	Ciudad Jardín - UAN	troncal	4.58154254	-74.09035160	L - Carrera Decima	Media	264	4.5815425	-74.0903516	KR 10 - CL 12 Sur	Portal 20 de Julio
384	Bicentenario	troncal	4.59402077	-74.08183542	L - Carrera Decima	Alta	384	4.5940208	-74.0818354	KR 10 - CL 5	Portal 20 de Julio
385	Temporal Calle 57	troncal	4.64298162	-74.06582826	A - Caracas	Alta	320	4.6429816	-74.0658283	CL 57 - CL 54	Portal Norte – Unicervantes
389	Alquería	troncal	4.59426993	-74.13426993	G - NQS Sur	Baja	204	4.5942699	-74.1342699	Autosur - KR 48	Portal Sur - JFK Coop. Financiera
387	AV. ElDorado	troncal	4.63066841	-74.07987857	E - NQS Central	Media	260	4.6306684	-74.0798786	KR 30 AV 28	Portal 20 de Julio
390	Bosa	troncal	4.59688795	-74.18122500	G - NQS Sur	Media	272	4.5968880	-74.1812250	Soacha	Portal Sur - JFK Coop. Financiera
399	NQS - Calle 30 S	troncal	4.59479847	-74.11788075	G - NQS Sur	Media	232	4.5947985	-74.1178808	Autosur - DG 26 Sur	Portal Sur - JFK Coop. Financiera
391	CAD	troncal	4.62341573	-74.08418121	E - NQS Central	Media	272	4.6234157	-74.0841812	KR 30 - CL 26	Portal 20 de Julio
392	Banderas	troncal	4.63129454	-74.14576996	F - Americas	Alta	608	4.6312945	-74.1457700	AV Americas - KR 78	Portal Américas
393	Calle 19	troncal	4.60786462	-74.07686968	A - Caracas	Alta	320	4.6078646	-74.0768697	CL 19 - CL 17	Portal Norte – Unicervantes
396	Calle 76 - San Felipe	troncal	4.66302945	-74.06126126	A - Caracas	Alta	320	4.6630295	-74.0612613	CL 76 - CL 74	Portal Norte – Unicervantes
397	Calle 63	troncal	4.64840397	-74.06487053	A - Caracas	Baja	0	4.6484040	-74.0648705	CL 63 - CL 60	Portal Norte – Unicervantes
401	Carrera 47	troncal	4.67775575	-74.07325476	D - Calle 80	Alta	304	4.6777558	-74.0732548	KR 46	Portal 80
402	Portal 80	portal	4.70982949	-74.11050627	D - Calle 80	Baja	165	4.7098295	-74.1105063	KR 96	Portal 80
403	Olaya	troncal	4.57891519	-74.10736382	H - Caracas Sur	Alta	296	4.5789152	-74.1073638	CL 24 Sur - CL 27 Sur	Portal Sur - JFK Coop. Financiera
404	Molinos	troncal	4.55706456	-74.12182779	H - Caracas Sur	Alta	304	4.5570646	-74.1218278	KR 9A	Portal Sur - JFK Coop. Financiera
405	Nariño	troncal	4.58628471	-74.09392542	H - Caracas Sur	Baja	144	4.5862847	-74.0939254	CL 8 Sur - CL 11 Sur	Portal Sur - JFK Coop. Financiera
406	Gratamira	troncal	4.72745584	-74.07472334	C - Suba	Baja	144	4.7274558	-74.0747233	AV Suba - CL 135	Portal Suba
414	Humedal Córdoba	troncal	4.70668982	-74.07117427	C - Suba	Baja	156	4.7066898	-74.0711743	AV Suba - CL 119	Portal Suba
418	Hospital	troncal	4.59505052	-74.08622629	H - Caracas Sur	Baja	96	4.5950505	-74.0862263	CL 4 - CL 2	Portal Sur - JFK Coop. Financiera
408	Las Nieves	troncal	4.60606534	-74.07432675	L - Carrera Decima	Media	264	4.6060653	-74.0743268	KR 10 - CL 18	Portal 20 de Julio
409	Modelia	troncal	4.67502466	-74.11714710	K - Calle 26	Media	260	4.6750247	-74.1171471	KR 84	Portal 20 de Julio
410	Portal El Dorado – C.C. Nuestro Bogotá	portal	4.68162203	-74.12139802	K - Calle 26	Media	216	4.6816220	-74.1213980	KR 87	Portal 20 de Julio
411	Museo del Oro	troncal	4.60115298	-74.07290843	J - Eje Ambiental	Baja	144	4.6011530	-74.0729084	KR 2	Portal 20 de Julio
413	Portal 20 de Julio	portal	4.56571812	-74.09700841	L - Carrera Decima	Alta	350	4.5657181	-74.0970084	KR 5 A CL 33 Sur	Portal 20 de Julio
422	Portal Usme	portal	4.53171458	-74.11939099	Portal Usme	Baja	210	4.5317146	-74.1193910	CL 65C Sur	Portal Usme
416	Policarpa	troncal	4.58611582	-74.08701654	L - Carrera Decima	Media	264	4.5861158	-74.0870165	KR 10 - CL 3 Sur	Portal 20 de Julio
417	Museo Nacional	troncal	4.61524490	-74.06921969	M - Carrera Septima	Media	240	4.6152449	-74.0692197	KR 7 - CL 32	Portal Tunal
423	Ferias	troncal	4.69088593	-74.08460127	D - Calle 80	Baja	152	4.6908859	-74.0846013	TV 67 Bis	Portal 80
419	Normandía	troncal	4.66900868	-74.11328003	K - Calle 26	Media	260	4.6690087	-74.1132800	KR 73A	Portal 20 de Julio
426	Portal Tunal	portal	4.56957146	-74.13924020	Portal Tunal	Baja	152	4.5695715	-74.1392402	AV Boyaca	Portal Tunal
427	Fucha	troncal	4.58297258	-74.09940175	H - Caracas Sur	Baja	144	4.5829726	-74.0994018	CL 13 Sur - CL 16 Sur	Portal Sur - JFK Coop. Financiera
428	Minuto de Dios	troncal	4.69688160	-74.09193285	D - Calle 80	Alta	296	4.6968816	-74.0919329	KR 73 A	Portal 80
424	Temporal Marly	troncal	4.63755905	-74.06678795	A - Caracas	Alta	320	4.6375591	-74.0667880	CL 51 - CL 49	Portal Norte – Unicervantes
431	Portal Suba	portal	4.74681507	-74.09427890	C - Suba	Alta	304	4.7468151	-74.0942789	AV Suba AV Cali	Portal Suba
432	Suba - AV. Boyacá	troncal	4.72126716	-74.07471163	C - Suba	Baja	144	4.7212672	-74.0747116	AV Suba AV Boyaca	Portal Suba
434	San Martín	troncal	4.67638966	-74.06717674	C - Suba	Baja	192	4.6763897	-74.0671767	AV Suba - CL 81	Portal Suba
429	Portal Américas	portal	4.62938131	-74.17305846	F - Americas	Alta	342	4.6293813	-74.1730585	AV Cali - CL 43 Sur	Portal Américas
436	Santa Isabel	troncal	4.60167503	-74.10261755	G - NQS Sur	Media	240	4.6016750	-74.1026176	KR 30 AV 3	Portal Sur - JFK Coop. Financiera
439	Quiroga	troncal	4.57680973	-74.11438051	H - Caracas Sur	Baja	144	4.5768097	-74.1143805	CL 31 Sur - CL 32 Sur	Portal Sur - JFK Coop. Financiera
440	Puentelargo	troncal	4.69340077	-74.06720874	C - Suba	Baja	200	4.6934008	-74.0672087	AV Suba TV 48	Portal Suba
435	Universidades – CityU	troncal	4.60464623	-74.06731585	K - Calle 26	Media	260	4.6046462	-74.0673159	KR 3	Portal 20 de Julio
377	Carrera 43 - Comapan	troncal	4.62278154	-74.10143788	F - Americas	Baja	168	4.6227815	-74.1014379	AV Americas - KR 43	Portal Américas
438	Puente Aranda	troncal	4.62566974	-74.10463943	F - Americas	Baja	168	4.6256697	-74.1046394	CL 13 KR 47	Portal Américas
441	San Victorino	troncal	4.60102943	-74.07742242	L - Carrera Decima	Alta	384	4.6010294	-74.0774224	KR 10 - CL 12	Portal 20 de Julio
378	Consuelo	troncal	4.56022730	-74.12387433	H - Caracas Sur	Baja	192	4.5602273	-74.1238743	KR 11A - KR 10C	Portal Sur - JFK Coop. Financiera
380	Comuneros	troncal	4.60424998	-74.09986137	G - NQS Sur	Media	252	4.6042500	-74.0998614	KR 30 - CL 6A	Portal Sur - JFK Coop. Financiera
446	Suba - Calle 116	troncal	4.69924111	-74.06984394	C - Suba	Baja	200	4.6992411	-74.0698439	AV Suba CLL 114	Portal Suba
448	SENA	troncal	4.59737051	-74.11064255	G - NQS Sur	Alta	304	4.5973705	-74.1106426	Autosur - CL 17 S	Portal Sur - JFK Coop. Financiera
447	San Bernardo	troncal	4.59019556	-74.08432732	L - Carrera Decima	Media	264	4.5901956	-74.0843273	KR 10 - CL 1B Sur	Portal 20 de Julio
450	Socorro	troncal	4.56465328	-74.12558394	H - Caracas Sur	Baja	200	4.5646533	-74.1255839	KR 13B - KR 13C	Portal Sur - JFK Coop. Financiera
449	San Facon Carrera 22	troncal	4.60973521	-74.08679478	F - Americas	Media	272	4.6097352	-74.0867948	AV Americas - KR 22	Portal Américas
451	21 Ángeles	troncal	4.73550811	-74.08098652	C - Suba	Baja	144	4.7355081	-74.0809865	AV Suba - CL 136	Portal Suba
453	Venecia	troncal	4.59556283	-74.14264921	G - NQS Sur	Baja	204	4.5955628	-74.1426492	Autosur - AV 54	Portal Sur - JFK Coop. Financiera
454	Danubio	troncal	4.54365433	-74.12085159	Portal Usme	Alta	304	4.5436543	-74.1208516	Av. Calle 51 Sur entre carrera 5 y calle 56 sur	Portal Usme
455	Portal Sur - JFK Coop. Financiera	portal	4.59693995	-74.16929784	G - NQS Sur	Media	228	4.5969400	-74.1692978	Autosur - KR 82	Portal Sur - JFK Coop. Financiera
456	Temporal Calle 22	troncal	4.61001988	-74.07554139	A - Caracas	Alta	320	4.6100199	-74.0755414	CL 24 - CL 22	Portal Norte – Unicervantes
309	AV. Chile	troncal	4.66635264	-74.07457455	E - NQS Central	Alta	344	4.6663526	-74.0745746	KR 30 - CL 72	Portal 20 de Julio
457	Temporal AV. 39	troncal	4.62689718	-74.06869679	A - Caracas	Alta	312	4.6268972	-74.0686968	AV 39 - AV Calle	Portal Norte – Unicervantes
458	Temporal Flores – Areandina	troncal	4.65490299	-74.06300913	A - Caracas	Baja	192	4.6549030	-74.0630091	CL 69 - CL 67	Portal Norte – Unicervantes
459	Tibanica - Primavera	troncal	4.60672702	-74.20605303	Zona Tibanica	Alta	304	4.6067270	-74.2060530	CL 78 A Y CL 78 F	Portal Usme
460	Los Laureles	troncal	4.61109139	-74.20232841	Zona Tibanica	Alta	304	4.6110914	-74.2023284	Entre CL 80 J Y CL 81	Portal Usme
461	Islandia	troncal	4.61434757	-74.19374374	Zona Tibanica	Alta	304	4.6143476	-74.1937437	KR 70 A Sur Y CL 69 Sur	Portal Usme
333	Cl38A sur - CENTRO MAYOR	troncal	4.59380944	-74.12375508	G - NQS Sur	Media	212	4.5938094	-74.1237551	Autosur - KR 39A	Portal Sur - JFK Coop. Financiera
319	Calle 40 Sur	troncal	4.57579415	-74.12007924	H - Caracas Sur	Alta	392	4.5757942	-74.1200792	CL 38 Sur - CL 40 Sur	Portal Sur - JFK Coop. Financiera
352	Restrepo	troncal	4.58184906	-74.10142878	H - Caracas Sur	Baja	200	4.5818491	-74.1014288	CL 19 Sur - AV 1 De M	Portal Sur - JFK Coop. Financiera
357	Pepe Sierra Universidad UTEL	troncal	4.69812689	-74.05530880	B - Autopista Norte	Baja	200	4.6981269	-74.0553088	CL 116	Portal Norte – Unicervantes
366	Calle 161	troncal	4.74191530	-74.04800035	B - Autopista Norte	Baja	96	4.7419153	-74.0480004	CL 160	Portal Norte – Unicervantes
415	Parque	troncal	4.56832656	-74.13541451	Portal Tunal	Baja	60	4.5683266	-74.1354145	CL 55 Sur	Portal Tunal
420	Perdomo	troncal	4.59578778	-74.16496973	G - NQS Sur	Baja	200	4.5957878	-74.1649697	Autosur - KR 78C	Portal Sur - JFK Coop. Financiera
437	Suba - Calle 95	troncal	4.68469464	-74.06321827	C - Suba	Baja	144	4.6846946	-74.0632183	AV Suba - CL 97	Portal Suba
442	CC Paseo Villa del Río - Madelena	troncal	4.59628094	-74.15688105	G - NQS Sur	Baja	204	4.5962809	-74.1568811	Autosur - KR 67	Portal Sur - JFK Coop. Financiera
444	Sevillana	troncal	4.59510726	-74.14741029	G - NQS Sur	Baja	204	4.5951073	-74.1474103	Sevillana	Portal Sur - JFK Coop. Financiera
324	Transversal 86	troncal	4.63419465	-74.15206784	F - Americas	Media	240	4.6341947	-74.1520678	AV Americas - TV 86	Portal Américas
330	Avenida Rojas - UNISALESIANA	troncal	4.66194444	-74.10877200	K - Calle 26	Alta	320	4.6619444	-74.1087720	CL 26 - KR 69 D	Portal 20 de Julio
338	Tygua - San José	troncal	4.59978720	-74.08876139	G - NQS Sur (ramal)	Media	228	4.5997872	-74.0887614	KR 18	Portal Sur - JFK Coop. Financiera
336	Distrito Grafiti	troncal	4.62785005	-74.11158411	F - Americas	Media	272	4.6278501	-74.1115841	Americas - KR 53A	Portal Américas
345	Gobernación	troncal	4.64283002	-74.09653771	K - Calle 26	Media	260	4.6428300	-74.0965377	KR 54	Portal 20 de Julio
373	De La Sabana	troncal	4.60542110	-74.08189427	F - Americas	Baja	168	4.6054211	-74.0818943	CL 13 - KR 16	Portal Américas
375	Calle 72 - Areandina	troncal	4.65823755	-74.06206786	A - Caracas	Baja	0	4.6582376	-74.0620679	CL 72 - CL 70A	Portal Norte – Unicervantes
376	Centro Memoria	troncal	4.62046499	-74.07632059	K - Calle 26	Media	260	4.6204650	-74.0763206	KR 20	Portal 20 de Julio
388	Calle 26 - Atrio	troncal	4.61665155	-74.07215846	A - Caracas	Baja	0	4.6166516	-74.0721585	AV Calle 28 - CL 2	Portal Norte – Unicervantes
394	Temporal AV. Jiménez - Inter Eléctricas	troncal	4.60305325	-74.07909278	J - Eje Ambiental	Media	272	4.6030533	-74.0790928	CL 13 - Caracas	Portal 20 de Julio
400	Country Sur	troncal	4.57141673	-74.09863413	L - Carrera Decima	Media	264	4.5714167	-74.0986341	KR 10 - CL 28 Sur	Portal 20 de Julio
407	Pradera - Plaza Central	troncal	4.62850646	-74.11867713	F - Americas	Baja	200	4.6285065	-74.1186771	AV Americas - KR 64	Portal Américas
425	Patio Bonito	troncal	4.63318028	-74.16461427	F - Americas	Alta	304	4.6331803	-74.1646143	AV Cali - CL 40 Sur	Portal Américas
430	Las Aguas - Centro Colombo Americano	troncal	4.60257976	-74.06840144	J - Eje Ambiental	Baja	120	4.6025798	-74.0684014	KR 3	Portal 20 de Julio
443	San Mateo - CC Unisur	troncal	4.58596064	-74.20544974	Zona Leon XIII	Alta	424	4.5859606	-74.2054497	Soacha	Portal Usme
356	Toberin - Foundever	troncal	4.74618498	-74.04725485	B - Autopista Norte	Alta	552	4.7461850	-74.0472549	CL 165	Portal Norte – Unicervantes
367	Calle 106 - Maletas Explora	troncal	4.69298260	-74.05618243	B - Autopista Norte	Media	248	4.6929826	-74.0561824	CL 106	Portal Norte – Unicervantes
398	Calle 85	troncal	4.67231279	-74.05964363	B - Autopista Norte	Alta	320	4.6723128	-74.0596436	CL 85	Portal Norte – Unicervantes
412	General Santander	troncal	4.59355114	-74.12954496	G - NQS Sur	Alta	404	4.5935511	-74.1295450	Autosur - KR 43	Portal Sur - JFK Coop. Financiera
433	Santa Lucía	troncal	4.57096848	-74.12470872	H - Caracas Sur	Media	272	4.5709685	-74.1247087	CL 46A Sur - Diagonal 4	Portal Sur - JFK Coop. Financiera
313	Granja - Kr 77	troncal	4.69915096	-74.09601773	D - Calle 80	Alta	392	4.6991510	-74.0960177	KR 77 Bis	Portal 80
395	Movistar Arena	troncal	4.65003985	-74.07836246	E - NQS Central	Media	272	4.6500399	-74.0783625	KR 30 - CL 57	Portal 20 de Julio
421	Hortúa	troncal	4.59084725	-74.09024600	H - Caracas Sur	Baja	192	4.5908473	-74.0902460	CL 1 Sur - CL 3 Sur	Portal Sur - JFK Coop. Financiera
445	Rionegro	troncal	4.68035106	-74.06481662	C - Suba	Baja	144	4.6803511	-74.0648166	AV Suba - CL 87	Portal Suba
452	Temporal Calle 34	troncal	4.62157551	-74.06971918	A - Caracas	Alta	320	4.6215755	-74.0697192	AV Calle 34 - CL 3	Portal Norte – Unicervantes
379	Temporal AV. Jiménez - Inter Eléctricas	troncal	4.60286688	-74.08040995	A - Caracas	Alta	288	4.6028669	-74.0804100	CL 13 - Caracas	Portal Norte – Unicervantes
\.


--
-- Data for Name: notificaciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notificaciones (id, usuario, mensaje, tipo, creado_en, leido, usuario_id, reporte_id) FROM stdin;
1	practica5@transmiflow.local	Tu reporte en Comuneros (ruta G11) fue atendido. Bus ABC-123 en camino.	operador	2026-11-19 18:28:26.380673	f	35	18
2	practica5@transmiflow.local	Tu reporte en Comuneros (ruta G11) fue atendido. Bus ABC-123 en camino.	operador	2026-11-19 18:29:13.133984	f	35	18
3	practica5@transmiflow.local	Tu reporte en Comuneros (ruta G11) fue atendido. Bus XYZ-789 en camino.	operador	2026-11-19 19:00:20.82182	f	35	18
4	practica5@transmiflow.local	Tu reporte en Comuneros (ruta 4 H) fue atendido. Bus BCO-104 en camino.	operador	2026-11-19 19:42:13.786146	f	35	18
5	practica5@transmiflow.local	Tu reporte en Comuneros (ruta G11) fue atendido. Bus BCO-101 en camino.	operador	2026-11-19 19:51:27.170141	f	35	18
7	practica3@transmiflow.local	Tu reporte en Patio Bonito (ruta 5 C) fue atendido. Bus BCO-105 en camino.	operador	2026-11-19 20:30:19.909102	f	32	16
8	practica3@transmiflow.local	Tu reporte en Patio Bonito (ruta 5 C) fue atendido. Bus BCO-105 en camino.	operador	2026-11-19 20:30:38.852136	f	32	16
\.


--
-- Data for Name: reportes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reportes (id, estacion, nivel, usuario, creado_en, ruta, estacion_id, ruta_id, usuario_id, vagon_id) FROM stdin;
14	Portal Américas	Alta	practica1@transmiflow.local	2026-11-18 21:02:22.177271	B28	429	31	37	\N
15	Museo Nacional	Media	practica2@transmiflow.local	2026-11-18 20:55:22.178955	G47	417	72	36	\N
16	Patio Bonito	Alta	practica3@transmiflow.local	2026-11-18 20:48:22.179569	5 C	425	11	32	\N
17	Ricaurte - NQS	Media	practica4@transmiflow.local	2026-11-18 20:41:22.180118	B12	314	1	33	\N
18	Comuneros	Baja	practica5@transmiflow.local	2026-11-18 20:34:22.180599	G11	380	66	35	\N
19	Portal Norte – Unicervantes	Alta	practica6@transmiflow.local	2026-11-18 20:27:22.181188	B28	360	31	34	\N
39	Portal Américas	Alta	extra1@transmiflow.local	2026-11-19 19:47:24.966239	B28	429	31	42	\N
40	Portal Américas	Alta	extra2@transmiflow.local	2026-11-19 18:47:24.967112	F28	429	61	44	\N
41	Portal Norte – Unicervantes	Media	extra3@transmiflow.local	2026-11-19 17:47:24.967473	B28	360	31	41	\N
42	Museo Nacional	Alta	extra4@transmiflow.local	2026-11-19 16:47:24.967751	G47	417	72	54	\N
43	Museo Nacional	Media	extra5@transmiflow.local	2026-11-19 15:47:24.968033	2 M	417	5	46	\N
44	Patio Bonito	Alta	extra6@transmiflow.local	2026-11-19 14:47:24.968343	5 C	425	11	45	\N
45	Ricaurte - CL 13	Media	extra7@transmiflow.local	2026-11-19 13:47:24.968624	B12	351	1	55	\N
46	Ricaurte - NQS	Alta	extra8@transmiflow.local	2026-11-19 12:47:24.968935	B12	314	1	43	\N
47	Comuneros	Media	extra9@transmiflow.local	2026-11-19 11:47:24.969202	G11	380	66	52	\N
30	Santa Lucía	Alta	johansrs32@gmail.com	2026-11-19 18:48:14.128189	D21	433	48	2	\N
48	Santa Isabel	Baja	extra10@transmiflow.local	2026-11-19 10:47:24.969614	G11	436	66	49	\N
49	Portal Suba	Alta	extra11@transmiflow.local	2026-11-19 09:47:24.969882	C19	431	40	51	\N
50	Portal 80	Media	extra12@transmiflow.local	2026-11-19 08:47:24.970139	D10	402	46	48	\N
51	Portal Tunal	Alta	extra13@transmiflow.local	2026-11-19 07:47:24.970387	K43	426	97	40	\N
52	Portal Usme	Media	extra14@transmiflow.local	2026-11-19 06:47:24.970654	L41	422	105	50	\N
53	Portal Sur - JFK Coop. Financiera	Alta	extra15@transmiflow.local	2026-11-19 05:47:24.9709	B46	455	32	56	\N
54	Calle 26 - Atrio	Media	extra16@transmiflow.local	2026-11-19 04:47:24.971191	1 P	388	3	53	\N
55	Temporal Calle 34	Alta	extra17@transmiflow.local	2026-11-19 03:47:24.971436	8 G	452	17	47	\N
\.


--
-- Data for Name: ruta_estaciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ruta_estaciones (id, ruta_id, estacion_id, orden) FROM stdin;
10987	3	435	1
10988	3	312	2
10989	3	388	3
10990	3	376	4
10991	3	332	5
10992	3	328	6
10993	3	325	7
10994	3	339	8
10995	3	345	9
10996	3	310	10
10997	3	340	11
10998	3	381	12
10999	3	330	13
11000	3	419	14
11001	3	409	15
11002	3	410	16
11003	4	410	1
11004	4	409	2
11005	4	419	3
11006	4	330	4
11007	4	381	5
11008	4	340	6
11009	4	310	7
11010	4	345	8
11011	4	339	9
11012	4	325	10
11013	4	328	11
11014	4	332	12
11015	4	376	13
11016	4	388	14
11017	4	312	15
11018	4	435	16
11019	5	417	1
11020	5	312	2
11021	5	408	3
11022	5	441	4
11023	5	384	5
11024	5	447	6
11025	5	416	7
11026	5	383	8
11027	5	372	9
11028	5	400	10
11029	5	413	11
11030	6	413	1
11031	6	400	2
11032	6	372	3
11033	6	383	4
11034	6	416	5
11035	6	447	6
11036	6	384	7
11037	6	441	8
11038	6	408	9
11039	6	312	10
11040	6	417	11
11041	7	426	1
11042	7	415	2
11043	7	386	3
11044	7	433	4
11045	7	319	5
11046	7	439	6
11047	7	403	7
11048	7	352	8
11049	7	427	9
11050	7	405	10
11051	7	421	11
11052	7	418	12
11053	7	331	13
11054	7	379	14
11055	7	394	15
11056	7	393	16
11057	7	456	17
11058	7	388	18
11059	7	376	19
11060	7	332	20
11061	7	328	21
11062	7	325	22
11063	8	325	1
11064	8	328	2
11065	8	332	3
11066	8	376	4
11067	8	388	5
11068	8	456	6
11069	8	393	7
11070	8	394	8
11071	8	379	9
11072	8	331	10
11073	8	418	11
11074	8	421	12
11075	8	405	13
11076	8	427	14
11077	8	352	15
11078	8	403	16
11079	8	439	17
11080	8	319	18
11081	8	433	19
11082	8	386	20
11083	8	415	21
11084	8	426	22
11085	9	455	1
11086	9	420	2
11087	9	442	3
11088	9	444	4
11089	9	453	5
11090	9	389	6
11091	9	412	7
11092	9	333	8
11093	9	399	9
11094	9	448	10
11095	9	436	11
11096	9	380	12
11097	9	314	13
11098	9	351	14
11099	9	343	15
11100	9	391	16
11101	9	332	17
11102	9	387	18
11103	9	329	19
11104	9	311	20
11105	9	395	21
11106	9	334	22
11107	9	309	23
11108	9	317	24
11109	9	347	25
11110	9	434	26
11111	9	337	27
11112	9	365	28
11113	10	365	1
11114	10	337	2
11115	10	434	3
11116	10	347	4
11117	10	317	5
11118	10	309	6
11119	10	334	7
11120	10	395	8
11121	10	311	9
11122	10	329	10
11123	10	387	11
11124	10	332	12
11125	10	391	13
11126	10	343	14
11127	10	351	15
11128	10	314	16
11129	10	380	17
11130	10	436	18
11131	10	448	19
11132	10	399	20
11133	10	333	21
11134	10	412	22
11135	10	389	23
11136	10	453	24
11137	10	444	25
11138	10	442	26
11139	10	420	27
11140	10	455	28
11141	11	429	1
11142	11	425	2
11143	11	382	3
11144	11	324	4
11145	11	392	5
11146	11	348	6
11147	11	320	7
11148	11	321	8
11149	11	407	9
11150	11	336	10
11151	11	438	11
11152	11	377	12
11153	11	341	13
11154	11	327	14
11155	11	351	15
11156	11	449	16
11157	11	373	17
11158	11	338	18
11159	11	331	19
11160	11	379	20
11161	11	441	21
11162	11	394	22
11163	12	394	1
11164	12	379	2
11165	12	373	3
11166	12	449	4
11167	12	351	5
11168	12	327	6
11169	12	341	7
11170	12	377	8
11171	12	438	9
11172	12	336	10
11173	12	407	11
11174	12	321	12
11175	12	320	13
11176	12	348	14
11177	12	392	15
11178	12	324	16
11179	12	382	17
11180	12	425	18
11181	12	429	19
11182	13	402	1
11183	13	315	2
11184	13	344	3
11185	13	349	4
11186	13	313	5
11187	13	428	6
11188	13	318	7
11189	13	423	8
11190	13	335	9
11191	13	370	10
11192	13	401	11
11193	13	347	12
11194	13	434	13
11195	13	337	14
11196	13	365	15
11197	13	396	16
11198	14	396	1
11199	14	365	2
11200	14	337	3
11201	14	434	4
11202	14	347	5
11203	14	401	6
11204	14	370	7
11205	14	335	8
11206	14	423	9
11207	14	318	10
11208	14	428	11
11209	14	313	12
11210	14	349	13
11211	14	344	14
11212	14	315	15
11213	14	402	16
11214	15	431	1
11215	15	323	2
11216	15	350	3
11217	15	451	4
11218	15	406	5
11219	15	432	6
11220	15	322	7
11221	15	414	8
11222	15	446	9
11223	15	440	10
11224	15	316	11
11225	15	437	12
11226	15	445	13
11227	15	434	14
11228	15	347	15
11229	15	337	16
11230	16	337	1
11231	16	347	2
11232	16	434	3
11233	16	445	4
11234	16	437	5
11235	16	316	6
11236	16	440	7
11237	16	446	8
11238	16	414	9
11239	16	322	10
11240	16	432	11
11241	16	406	12
11242	16	451	13
11243	16	350	14
11244	16	323	15
11245	16	431	16
11246	17	354	1
11247	17	361	2
11248	17	360	3
11249	17	356	4
11250	17	366	5
11251	17	368	6
11252	17	363	7
11253	17	359	8
11254	17	362	9
11255	17	353	10
11256	17	364	11
11257	17	357	12
11258	17	367	13
11259	17	358	14
11260	17	355	15
11261	17	398	16
11262	17	365	17
11263	17	396	18
11264	17	375	19
11265	17	458	20
11266	17	397	21
11267	17	385	22
11268	17	424	23
11269	17	369	24
11270	17	457	25
11271	17	452	26
11272	17	388	27
11273	17	456	28
11274	17	393	29
11275	17	394	30
11276	17	379	31
11277	17	331	32
11278	17	338	33
11279	17	326	34
11280	18	326	1
11281	18	338	2
11282	18	331	3
11283	18	379	4
11284	18	394	5
11285	18	393	6
11286	18	456	7
11287	18	388	8
11288	18	452	9
11289	18	457	10
11290	18	369	11
11291	18	424	12
11292	18	385	13
11293	18	397	14
11294	18	458	15
11295	18	375	16
11296	18	396	17
11297	18	365	18
11298	18	398	19
11299	18	355	20
11300	18	358	21
11301	18	367	22
11302	18	357	23
11303	18	364	24
11304	18	353	25
11305	18	362	26
11306	18	359	27
11307	18	363	28
11308	18	368	29
11309	18	366	30
11310	18	356	31
11311	18	360	32
11312	18	361	33
11313	18	354	34
11314	19	455	1
11315	19	420	2
11316	19	442	3
11317	19	444	4
11318	19	453	5
11319	19	389	6
11320	19	412	7
11321	19	333	8
11322	19	399	9
11323	19	448	10
11324	19	436	11
11325	19	380	12
11326	19	314	13
11327	19	351	14
11328	19	343	15
11329	19	391	16
11330	19	332	17
11331	19	387	18
11332	19	329	19
11333	19	311	20
11334	19	395	21
11335	19	334	22
11336	19	309	23
11337	19	317	24
11338	19	347	25
11339	19	434	26
11340	19	337	27
11341	19	365	28
11342	19	396	29
11343	19	375	30
11344	19	458	31
11345	20	429	1
11346	20	425	2
11347	20	382	3
11348	20	324	4
11349	20	392	5
11350	20	348	6
11351	20	320	7
11352	20	321	8
11353	20	407	9
11354	20	336	10
11355	20	438	11
11356	20	377	12
11357	20	341	13
11358	20	327	14
11359	20	351	15
11360	20	449	16
11361	20	373	17
11362	20	379	18
11363	20	394	19
11364	20	393	20
11365	20	456	21
11366	20	388	22
11367	20	452	23
11368	20	457	24
11369	20	369	25
11370	20	424	26
11371	20	385	27
11372	20	397	28
11373	20	458	29
11374	20	375	30
11375	20	396	31
11376	21	459	1
11377	21	460	2
11378	21	461	3
11379	21	429	4
11380	21	425	5
11381	21	382	6
11382	21	324	7
11383	21	392	8
11384	21	348	9
11385	21	320	10
11386	21	321	11
11387	21	407	12
11388	21	336	13
11389	21	438	14
11390	21	377	15
11391	21	341	16
11392	21	327	17
11393	21	351	18
11394	21	449	19
11395	21	373	20
11396	21	379	21
11397	21	394	22
11398	21	393	23
11399	21	456	24
11400	21	388	25
11401	21	452	26
11402	21	457	27
11403	21	369	28
11404	21	424	29
11405	21	385	30
11406	21	397	31
11407	21	458	32
11408	21	375	33
11409	21	396	34
11410	21	365	35
11411	21	337	36
11412	22	402	1
11413	22	315	2
11414	22	344	3
11415	22	349	4
11416	22	313	5
11417	22	428	6
11418	22	318	7
11419	22	423	8
11420	22	335	9
11421	22	370	10
11422	22	401	11
11423	22	347	12
11424	22	434	13
11425	22	337	14
11426	22	365	15
11427	22	398	16
11428	22	355	17
11429	22	358	18
11430	22	367	19
11431	22	357	20
11432	22	364	21
11433	22	353	22
11434	22	362	23
11435	22	359	24
11436	22	363	25
11437	22	368	26
11438	22	366	27
11439	22	356	28
11440	22	360	29
11441	23	455	1
11442	23	420	2
11443	23	442	3
11444	23	444	4
11445	23	453	5
11446	23	389	6
11447	23	412	7
11448	23	333	8
11449	23	399	9
11450	23	448	10
11451	23	436	11
11452	23	380	12
11453	23	314	13
11454	23	351	14
11455	23	343	15
11456	23	391	16
11457	23	332	17
11458	23	387	18
11459	23	329	19
11460	23	311	20
11461	23	395	21
11462	23	334	22
11463	23	309	23
11464	23	317	24
11465	23	347	25
11466	23	434	26
11467	23	337	27
11468	23	365	28
11469	23	398	29
11470	23	355	30
11471	23	358	31
11472	23	367	32
11473	23	357	33
11474	23	364	34
11475	23	353	35
11476	23	362	36
11477	23	359	37
11478	23	363	38
11479	23	368	39
11480	23	366	40
11481	23	356	41
11482	23	360	42
11483	23	361	43
11484	23	354	44
11485	1	455	1
11486	1	420	2
11487	1	442	3
11488	1	444	4
11489	1	453	5
11490	1	389	6
11491	1	412	7
11492	1	333	8
11493	1	399	9
11494	1	448	10
11495	1	436	11
11496	1	380	12
11497	1	314	13
11498	1	351	14
11499	1	343	15
11500	1	391	16
11501	1	332	17
11502	1	387	18
11503	1	329	19
11504	1	311	20
11505	1	395	21
11506	1	334	22
11507	1	309	23
11508	1	317	24
11509	1	434	25
11510	1	371	26
11511	1	358	27
11512	1	367	28
11513	1	357	29
11514	1	364	30
11515	1	353	31
11516	1	362	32
11517	1	359	33
11518	1	363	34
11519	1	368	35
11520	1	366	36
11521	1	356	37
11522	1	360	38
11523	24	412	1
11524	24	333	2
11525	24	399	3
11526	24	448	4
11527	24	436	5
11528	24	380	6
11529	24	314	7
11530	24	351	8
11531	24	343	9
11532	24	391	10
11533	24	332	11
11534	24	387	12
11535	24	329	13
11536	24	311	14
11537	24	395	15
11538	24	334	16
11539	24	309	17
11540	24	317	18
11541	24	434	19
11542	24	371	20
11543	24	358	21
11544	24	367	22
11545	24	357	23
11546	24	364	24
11547	24	353	25
11548	24	362	26
11549	24	359	27
11550	24	363	28
11551	24	368	29
11552	24	366	30
11553	24	356	31
11554	24	360	32
11555	25	426	1
11556	25	415	2
11557	25	386	3
11558	25	433	4
11559	25	319	5
11560	25	439	6
11561	25	403	7
11562	25	352	8
11563	25	427	9
11564	25	405	10
11565	25	421	11
11566	25	418	12
11567	25	331	13
11568	25	379	14
11569	25	394	15
11570	25	393	16
11571	25	456	17
11572	25	388	18
11573	25	452	19
11574	25	457	20
11575	25	369	21
11576	25	424	22
11577	25	385	23
11578	25	397	24
11579	25	458	25
11580	25	375	26
11581	25	396	27
11582	25	365	28
11583	25	398	29
11584	25	355	30
11585	25	358	31
11586	25	367	32
11587	25	357	33
11588	25	364	34
11589	25	353	35
11590	25	362	36
11591	25	359	37
11592	25	363	38
11593	25	368	39
11594	25	366	40
11595	25	356	41
11596	25	360	42
11597	26	410	1
11598	26	409	2
11599	26	419	3
11600	26	330	4
11601	26	381	5
11602	26	340	6
11603	26	310	7
11604	26	345	8
11605	26	339	9
11606	26	325	10
11607	26	328	11
11608	26	387	12
11609	26	391	13
11610	26	332	14
11611	26	329	15
11612	26	311	16
11613	26	395	17
11614	26	334	18
11615	26	309	19
11616	26	317	20
11617	26	434	21
11618	26	371	22
11619	26	358	23
11620	26	367	24
11621	26	357	25
11622	26	364	26
11623	26	353	27
11624	26	362	28
11625	26	359	29
11626	26	363	30
11627	26	368	31
11628	26	366	32
11629	26	356	33
11630	26	360	34
11631	26	361	35
11632	26	354	36
11633	27	413	1
11634	27	400	2
11635	27	372	3
11636	27	383	4
11637	27	416	5
11638	27	447	6
11639	27	384	7
11640	27	338	8
11641	27	331	9
11642	27	379	10
11643	27	394	11
11644	27	393	12
11645	27	456	13
11646	27	388	14
11647	27	452	15
11648	27	457	16
11649	27	369	17
11650	27	424	18
11651	27	385	19
11652	27	397	20
11653	27	458	21
11654	27	375	22
11655	27	396	23
11656	27	365	24
11657	27	398	25
11658	27	355	26
11659	27	358	27
11660	27	367	28
11661	27	357	29
11662	27	364	30
11663	27	353	31
11664	27	362	32
11665	27	359	33
11666	27	363	34
11667	27	368	35
11668	27	366	36
11669	27	356	37
11670	27	360	38
11671	27	361	39
11672	27	354	40
11673	28	410	1
11674	28	409	2
11675	28	419	3
11676	28	330	4
11677	28	381	5
11678	28	340	6
11679	28	310	7
11680	28	345	8
11681	28	339	9
11682	28	325	10
11683	28	328	11
11684	28	332	12
11685	28	376	13
11686	28	388	14
11687	28	452	15
11688	28	457	16
11689	28	369	17
11690	28	424	18
11691	28	385	19
11692	28	397	20
11693	28	458	21
11694	28	375	22
11695	28	396	23
11696	28	365	24
11697	28	398	25
11698	28	355	26
11699	28	358	27
11700	28	367	28
11701	28	357	29
11702	28	364	30
11703	28	353	31
11704	28	362	32
11705	29	429	1
11706	29	425	2
11707	29	382	3
11708	29	324	4
11709	29	392	5
11710	29	348	6
11711	29	320	7
11712	29	321	8
11713	29	407	9
11714	29	336	10
11715	29	438	11
11716	29	377	12
11717	29	341	13
11718	29	327	14
11719	29	351	15
11720	29	314	16
11721	29	343	17
11722	29	391	18
11723	29	332	19
11724	29	387	20
11725	29	329	21
11726	29	311	22
11727	29	395	23
11728	29	334	24
11729	29	309	25
11730	29	317	26
11731	29	347	27
11732	29	434	28
11733	29	337	29
11734	29	365	30
11735	29	398	31
11736	29	355	32
11737	29	358	33
11738	29	367	34
11739	29	357	35
11740	29	364	36
11741	29	353	37
11742	29	362	38
11743	30	426	1
11744	30	415	2
11745	30	386	3
11746	30	433	4
11747	30	319	5
11748	30	439	6
11749	30	403	7
11750	30	352	8
11751	30	427	9
11752	30	405	10
11753	30	421	11
11754	30	418	12
11755	30	331	13
11756	30	379	14
11757	30	394	15
11758	30	393	16
11759	30	456	17
11760	30	388	18
11761	30	452	19
11762	30	457	20
11763	30	369	21
11764	30	424	22
11765	30	385	23
11766	30	397	24
11767	30	458	25
11768	30	375	26
11769	30	396	27
11770	30	365	28
11771	30	398	29
11772	30	355	30
11773	30	358	31
11774	30	367	32
11775	30	357	33
11776	30	364	34
11777	30	353	35
11778	30	362	36
11779	30	359	37
11780	30	363	38
11781	30	368	39
11782	30	366	40
11783	30	356	41
11784	30	360	42
11785	31	429	1
11786	31	425	2
11787	31	382	3
11788	31	324	4
11789	31	392	5
11790	31	348	6
11791	31	320	7
11792	31	321	8
11793	31	407	9
11794	31	336	10
11795	31	438	11
11796	31	377	12
11797	31	341	13
11798	31	327	14
11799	31	351	15
11800	31	314	16
11801	31	343	17
11802	31	391	18
11803	31	332	19
11804	31	387	20
11805	31	329	21
11806	31	311	22
11807	31	395	23
11808	31	334	24
11809	31	309	25
11810	31	317	26
11811	31	434	27
11812	31	371	28
11813	31	358	29
11814	31	367	30
11815	31	357	31
11816	31	364	32
11817	31	353	33
11818	31	362	34
11819	31	359	35
11820	31	363	36
11821	31	368	37
11822	31	366	38
11823	31	356	39
11824	31	360	40
11825	32	443	1
11826	32	346	2
11827	32	342	3
11828	32	374	4
11829	32	390	5
11830	32	455	6
11831	32	420	7
11832	32	442	8
11833	32	444	9
11834	32	453	10
11835	32	389	11
11836	32	412	12
11837	32	333	13
11838	32	399	14
11839	32	448	15
11840	32	436	16
11841	32	380	17
11842	32	314	18
11843	32	351	19
11844	32	343	20
11845	32	391	21
11846	32	332	22
11847	32	387	23
11848	32	329	24
11849	32	311	25
11850	32	395	26
11851	32	334	27
11852	32	309	28
11853	32	317	29
11854	32	434	30
11855	32	371	31
11856	32	358	32
11857	32	367	33
11858	32	357	34
11859	32	364	35
11860	32	353	36
11861	32	362	37
11862	32	359	38
11863	32	363	39
11864	32	368	40
11865	32	366	41
11866	32	356	42
11867	32	360	43
11868	33	431	1
11869	33	323	2
11870	33	350	3
11871	33	451	4
11872	33	406	5
11873	33	432	6
11874	33	322	7
11875	33	414	8
11876	33	446	9
11877	33	440	10
11878	33	316	11
11879	33	437	12
11880	33	445	13
11881	33	434	14
11882	33	347	15
11883	33	337	16
11884	33	365	17
11885	33	398	18
11886	33	355	19
11887	33	358	20
11888	33	367	21
11889	33	357	22
11890	33	364	23
11891	33	353	24
11892	33	362	25
11893	33	359	26
11894	33	363	27
11895	33	368	28
11896	33	366	29
11897	34	402	1
11898	34	315	2
11899	34	344	3
11900	34	349	4
11901	34	313	5
11902	34	428	6
11903	34	318	7
11904	34	423	8
11905	34	335	9
11906	34	370	10
11907	34	401	11
11908	34	347	12
11909	34	434	13
11910	34	337	14
11911	34	365	15
11912	34	398	16
11913	34	355	17
11914	34	358	18
11915	34	367	19
11916	34	357	20
11917	34	364	21
11918	34	353	22
11919	34	362	23
11920	34	359	24
11921	34	363	25
11922	34	368	26
11923	34	366	27
11924	34	356	28
11925	34	360	29
11926	34	361	30
11927	34	354	31
11928	35	422	1
11929	35	454	2
11930	35	404	3
11931	35	378	4
11932	35	450	5
11933	35	433	6
11934	35	319	7
11935	35	439	8
11936	35	403	9
11937	35	352	10
11938	35	427	11
11939	35	405	12
11940	35	421	13
11941	35	418	14
11942	35	331	15
11943	35	338	16
11944	35	326	17
11945	35	314	18
11946	35	351	19
11947	35	343	20
11948	35	391	21
11949	35	332	22
11950	35	387	23
11951	35	329	24
11952	35	311	25
11953	35	395	26
11954	35	334	27
11955	35	309	28
11956	35	317	29
11957	35	434	30
11958	35	371	31
11959	35	358	32
11960	35	367	33
11961	35	357	34
11962	35	364	35
11963	35	353	36
11964	35	362	37
11965	35	359	38
11966	35	363	39
11967	35	368	40
11968	35	366	41
11969	35	356	42
11970	36	435	1
11971	36	312	2
11972	36	388	3
11973	36	452	4
11974	36	457	5
11975	36	369	6
11976	36	424	7
11977	36	385	8
11978	36	397	9
11979	36	458	10
11980	36	375	11
11981	36	396	12
11982	36	365	13
11983	36	398	14
11984	36	355	15
11985	36	358	16
11986	36	367	17
11987	36	357	18
11988	36	364	19
11989	36	353	20
11990	36	362	21
11991	36	359	22
11992	36	363	23
11993	36	368	24
11994	36	366	25
11995	36	356	26
11996	36	360	27
11997	37	422	1
11998	37	454	2
11999	37	404	3
12000	37	378	4
12001	37	450	5
12002	37	433	6
12003	37	319	7
12004	37	439	8
12005	37	403	9
12006	37	352	10
12007	37	427	11
12008	37	405	12
12009	37	421	13
12010	37	418	14
12011	37	331	15
12012	37	379	16
12013	37	394	17
12014	37	393	18
12015	37	456	19
12016	37	388	20
12017	37	452	21
12018	37	457	22
12019	37	369	23
12020	37	424	24
12021	37	385	25
12022	37	397	26
12023	37	458	27
12024	37	375	28
12025	37	396	29
12026	37	365	30
12027	37	398	31
12028	37	355	32
12029	37	358	33
12030	37	367	34
12031	37	357	35
12032	37	364	36
12033	37	353	37
12034	37	362	38
12035	37	359	39
12036	37	363	40
12037	37	368	41
12038	37	366	42
12039	37	356	43
12040	37	360	44
12041	38	426	1
12042	38	415	2
12043	38	386	3
12044	38	433	4
12045	38	319	5
12046	38	439	6
12047	38	403	7
12048	38	352	8
12049	38	427	9
12050	38	405	10
12051	38	421	11
12052	38	418	12
12053	38	331	13
12054	38	379	14
12055	38	394	15
12056	38	393	16
12057	38	456	17
12058	38	388	18
12059	38	452	19
12060	38	457	20
12061	38	369	21
12062	38	424	22
12063	38	385	23
12064	38	397	24
12065	38	458	25
12066	38	375	26
12067	38	396	27
12068	38	365	28
12069	38	337	29
12070	38	347	30
12071	38	434	31
12072	38	445	32
12073	38	437	33
12074	38	316	34
12075	38	440	35
12076	38	446	36
12077	38	414	37
12078	38	322	38
12079	38	432	39
12080	38	406	40
12081	38	451	41
12082	38	350	42
12083	38	323	43
12084	38	431	44
12085	39	422	1
12086	39	454	2
12087	39	404	3
12088	39	378	4
12089	39	450	5
12090	39	433	6
12091	39	319	7
12092	39	439	8
12093	39	403	9
12094	39	352	10
12095	39	427	11
12096	39	405	12
12097	39	421	13
12098	39	418	14
12099	39	331	15
12100	39	338	16
12101	39	326	17
12102	39	314	18
12103	39	351	19
12104	39	343	20
12105	39	391	21
12106	39	332	22
12107	39	387	23
12108	39	329	24
12109	39	311	25
12110	39	395	26
12111	39	334	27
12112	39	309	28
12113	39	317	29
12114	39	347	30
12115	39	434	31
12116	39	445	32
12117	39	437	33
12118	39	316	34
12119	39	440	35
12120	39	446	36
12121	39	414	37
12122	39	322	38
12123	39	432	39
12124	39	406	40
12125	39	451	41
12126	39	350	42
12127	39	323	43
12128	39	431	44
12129	40	429	1
12130	40	425	2
12131	40	382	3
12132	40	324	4
12133	40	392	5
12134	40	348	6
12135	40	320	7
12136	40	321	8
12137	40	407	9
12138	40	336	10
12139	40	438	11
12140	40	377	12
12141	40	341	13
12142	40	327	14
12143	40	351	15
12144	40	449	16
12145	40	373	17
12146	40	379	18
12147	40	394	19
12148	40	393	20
12149	40	456	21
12150	40	388	22
12151	40	452	23
12152	40	457	24
12153	40	369	25
12154	40	424	26
12155	40	385	27
12156	40	397	28
12157	40	458	29
12158	40	375	30
12159	40	396	31
12160	40	365	32
12161	40	337	33
12162	40	347	34
12163	40	434	35
12164	40	445	36
12165	40	437	37
12166	40	316	38
12167	40	440	39
12168	40	446	40
12169	40	414	41
12170	40	322	42
12171	40	432	43
12172	40	406	44
12173	40	451	45
12174	40	350	46
12175	40	323	47
12176	40	431	48
12177	41	413	1
12178	41	400	2
12179	41	372	3
12180	41	383	4
12181	41	416	5
12182	41	447	6
12183	41	384	7
12184	41	331	8
12185	41	338	9
12186	41	326	10
12187	41	314	11
12188	41	351	12
12189	41	343	13
12190	41	391	14
12191	41	332	15
12192	41	387	16
12193	41	329	17
12194	41	311	18
12195	41	395	19
12196	41	334	20
12197	41	309	21
12198	41	317	22
12199	41	347	23
12200	41	434	24
12201	41	445	25
12202	41	437	26
12203	41	316	27
12204	41	440	28
12205	41	446	29
12206	41	414	30
12207	41	322	31
12208	41	432	32
12209	41	406	33
12210	41	451	34
12211	41	350	35
12212	41	323	36
12213	41	431	37
12214	42	455	1
12215	42	420	2
12216	42	442	3
12217	42	444	4
12218	42	453	5
12219	42	389	6
12220	42	412	7
12221	42	333	8
12222	42	399	9
12223	42	448	10
12224	42	436	11
12225	42	380	12
12226	42	314	13
12227	42	351	14
12228	42	343	15
12229	42	391	16
12230	42	332	17
12231	42	387	18
12232	42	329	19
12233	42	311	20
12234	42	395	21
12235	42	334	22
12236	42	309	23
12237	42	317	24
12238	42	347	25
12239	42	434	26
12240	42	445	27
12241	42	437	28
12242	42	316	29
12243	42	440	30
12244	42	446	31
12245	42	414	32
12246	42	322	33
12247	42	432	34
12248	42	406	35
12249	42	451	36
12250	42	350	37
12251	42	323	38
12252	42	431	39
12253	43	366	1
12254	43	368	2
12255	43	363	3
12256	43	359	4
12257	43	362	5
12258	43	353	6
12259	43	364	7
12260	43	357	8
12261	43	367	9
12262	43	358	10
12263	43	355	11
12264	43	398	12
12265	43	365	13
12266	43	337	14
12267	43	347	15
12268	43	434	16
12269	43	445	17
12270	43	437	18
12271	43	316	19
12272	43	440	20
12273	43	446	21
12274	43	414	22
12275	43	322	23
12276	43	432	24
12277	43	406	25
12278	43	451	26
12279	43	350	27
12280	43	323	28
12281	43	431	29
12282	44	435	1
12283	44	312	2
12284	44	388	3
12285	44	376	4
12286	44	332	5
12287	44	328	6
12288	44	339	7
12289	44	325	8
12290	44	387	9
12291	44	391	10
12292	44	329	11
12293	44	311	12
12294	44	395	13
12295	44	334	14
12296	44	309	15
12297	44	317	16
12298	44	347	17
12299	44	434	18
12300	44	445	19
12301	44	437	20
12302	44	316	21
12303	44	440	22
12304	44	446	23
12305	44	414	24
12306	44	322	25
12307	44	432	26
12308	44	406	27
12309	44	451	28
12310	44	350	29
12311	44	323	30
12312	44	431	31
12313	45	396	1
12314	45	365	2
12315	45	337	3
12316	45	347	4
12317	45	434	5
12318	45	445	6
12319	45	437	7
12320	45	316	8
12321	45	440	9
12322	45	446	10
12323	45	414	11
12324	45	322	12
12325	45	432	13
12326	45	406	14
12327	45	451	15
12328	45	350	16
12329	45	323	17
12330	45	431	18
12331	46	360	1
12332	46	356	2
12333	46	366	3
12334	46	368	4
12335	46	363	5
12336	46	359	6
12337	46	362	7
12338	46	353	8
12339	46	364	9
12340	46	357	10
12341	46	367	11
12342	46	358	12
12343	46	355	13
12344	46	398	14
12345	46	365	15
12346	46	337	16
12347	46	434	17
12348	46	347	18
12349	46	401	19
12350	46	370	20
12351	46	335	21
12352	46	423	22
12353	46	318	23
12354	46	428	24
12355	46	313	25
12356	46	349	26
12357	46	344	27
12358	46	315	28
12359	46	402	29
12360	47	422	1
12361	47	454	2
12362	47	404	3
12363	47	378	4
12364	47	450	5
12365	47	433	6
12366	47	319	7
12367	47	439	8
12368	47	403	9
12369	47	352	10
12370	47	427	11
12371	47	405	12
12372	47	421	13
12373	47	418	14
12374	47	331	15
12375	47	379	16
12376	47	394	17
12377	47	393	18
12378	47	456	19
12379	47	388	20
12380	47	452	21
12381	47	457	22
12382	47	369	23
12383	47	424	24
12384	47	385	25
12385	47	397	26
12386	47	458	27
12387	47	375	28
12388	47	396	29
12389	47	365	30
12390	47	337	31
12391	47	434	32
12392	47	347	33
12393	47	401	34
12394	47	370	35
12395	47	335	36
12396	47	423	37
12397	47	318	38
12398	47	428	39
12399	47	313	40
12400	47	349	41
12401	47	344	42
12402	47	315	43
12403	47	402	44
12404	48	426	1
12405	48	415	2
12406	48	386	3
12407	48	433	4
12408	48	319	5
12409	48	439	6
12410	48	403	7
12411	48	352	8
12412	48	427	9
12413	48	405	10
12414	48	421	11
12415	48	418	12
12416	48	331	13
12417	48	338	14
12418	48	326	15
12419	48	314	16
12420	48	351	17
12421	48	343	18
12422	48	391	19
12423	48	332	20
12424	48	387	21
12425	48	329	22
12426	48	311	23
12427	48	395	24
12428	48	334	25
12429	48	309	26
12430	48	317	27
12431	48	347	28
12432	48	401	29
12433	48	370	30
12434	48	335	31
12435	48	423	32
12436	48	318	33
12437	48	428	34
12438	48	313	35
12439	48	349	36
12440	48	344	37
12441	48	315	38
12442	48	402	39
12443	49	455	1
12444	49	420	2
12445	49	442	3
12446	49	444	4
12447	49	453	5
12448	49	389	6
12449	49	412	7
12450	49	333	8
12451	49	399	9
12452	49	448	10
12453	49	436	11
12454	49	380	12
12455	49	314	13
12456	49	351	14
12457	49	343	15
12458	49	391	16
12459	49	332	17
12460	49	387	18
12461	49	329	19
12462	49	311	20
12463	49	395	21
12464	49	334	22
12465	49	309	23
12466	49	317	24
12467	49	347	25
12468	49	401	26
12469	49	370	27
12470	49	335	28
12471	49	423	29
12472	49	318	30
12473	49	428	31
12474	49	313	32
12475	49	349	33
12476	49	344	34
12477	49	315	35
12478	49	402	36
12479	50	435	1
12480	50	312	2
12481	50	388	3
12482	50	452	4
12483	50	457	5
12484	50	369	6
12485	50	424	7
12486	50	385	8
12487	50	397	9
12488	50	458	10
12489	50	375	11
12490	50	396	12
12491	50	365	13
12492	50	337	14
12493	50	434	15
12494	50	347	16
12495	50	401	17
12496	50	370	18
12497	50	335	19
12498	50	423	20
12499	50	318	21
12500	50	428	22
12501	50	313	23
12502	50	349	24
12503	50	344	25
12504	50	315	26
12505	50	402	27
12506	51	354	1
12507	51	361	2
12508	51	360	3
12509	51	356	4
12510	51	366	5
12511	51	368	6
12512	51	363	7
12513	51	359	8
12514	51	362	9
12515	51	353	10
12516	51	364	11
12517	51	357	12
12518	51	367	13
12519	51	358	14
12520	51	355	15
12521	51	398	16
12522	51	365	17
12523	51	337	18
12524	51	434	19
12525	51	347	20
12526	51	401	21
12527	51	370	22
12528	51	335	23
12529	51	423	24
12530	51	318	25
12531	51	428	26
12532	51	313	27
12533	51	349	28
12534	51	344	29
12535	51	315	30
12536	51	402	31
12537	52	413	1
12538	52	400	2
12539	52	372	3
12540	52	383	4
12541	52	416	5
12542	52	447	6
12543	52	384	7
12544	52	441	8
12545	52	408	9
12546	52	312	10
12547	52	417	11
12548	52	396	12
12549	52	365	13
12550	52	337	14
12551	52	434	15
12552	52	347	16
12553	52	401	17
12554	52	370	18
12555	52	335	19
12556	52	423	20
12557	52	318	21
12558	52	428	22
12559	52	313	23
12560	52	349	24
12561	52	344	25
12562	52	315	26
12563	52	402	27
12564	53	413	1
12565	53	400	2
12566	53	372	3
12567	53	383	4
12568	53	416	5
12569	53	447	6
12570	53	384	7
12571	53	441	8
12572	53	408	9
12573	53	312	10
12574	53	417	11
12575	53	388	12
12576	53	452	13
12577	53	457	14
12578	53	369	15
12579	53	396	16
12580	53	365	17
12581	53	337	18
12582	53	434	19
12583	53	347	20
12584	53	401	21
12585	53	370	22
12586	53	335	23
12587	53	423	24
12588	53	318	25
12589	53	428	26
12590	53	313	27
12591	53	349	28
12592	53	344	29
12593	53	315	30
12594	53	402	31
12595	54	429	1
12596	54	425	2
12597	54	382	3
12598	54	324	4
12599	54	392	5
12600	54	348	6
12601	54	320	7
12602	54	321	8
12603	54	407	9
12604	54	336	10
12605	54	438	11
12606	54	377	12
12607	54	341	13
12608	54	327	14
12609	54	351	15
12610	54	314	16
12611	54	343	17
12612	54	391	18
12613	54	332	19
12614	54	387	20
12615	54	329	21
12616	54	311	22
12617	54	395	23
12618	54	334	24
12619	54	309	25
12620	54	317	26
12621	55	443	1
12622	55	346	2
12623	55	342	3
12624	55	374	4
12625	55	390	5
12626	55	455	6
12627	55	420	7
12628	55	442	8
12629	55	444	9
12630	55	453	10
12631	55	389	11
12632	55	412	12
12633	55	333	13
12634	55	399	14
12635	55	448	15
12636	55	436	16
12637	55	380	17
12638	55	314	18
12639	55	351	19
12640	55	343	20
12641	55	391	21
12642	55	332	22
12643	55	387	23
12644	55	329	24
12645	55	311	25
12646	55	395	26
12647	55	334	27
12648	56	443	1
12649	56	346	2
12650	56	342	3
12651	56	374	4
12652	56	390	5
12653	56	455	6
12654	56	420	7
12655	56	442	8
12656	56	444	9
12657	56	453	10
12658	56	389	11
12659	56	412	12
12660	56	333	13
12661	56	399	14
12662	56	448	15
12663	56	436	16
12664	56	380	17
12665	56	314	18
12666	56	351	19
12667	56	343	20
12668	56	391	21
12669	57	431	1
12670	57	323	2
12671	57	350	3
12672	57	451	4
12673	57	406	5
12674	57	432	6
12675	57	322	7
12676	57	414	8
12677	57	446	9
12678	57	440	10
12679	57	316	11
12680	57	437	12
12681	57	445	13
12682	57	434	14
12683	57	347	15
12684	57	337	16
12685	57	365	17
12686	57	396	18
12687	57	375	19
12688	57	458	20
12689	57	397	21
12690	57	385	22
12691	57	424	23
12692	57	369	24
12693	57	457	25
12694	57	452	26
12695	57	388	27
12696	57	456	28
12697	57	393	29
12698	57	394	30
12699	57	379	31
12700	57	373	32
12701	57	449	33
12702	57	351	34
12703	57	327	35
12704	57	341	36
12705	57	377	37
12706	57	438	38
12707	57	336	39
12708	57	407	40
12709	57	321	41
12710	57	320	42
12711	57	348	43
12712	57	392	44
12713	57	324	45
12714	57	382	46
12715	57	425	47
12716	57	429	48
12717	58	430	1
12718	58	435	2
12719	58	411	3
12720	58	441	4
12721	58	394	5
12722	58	379	6
12723	58	373	7
12724	58	449	8
12725	58	351	9
12726	58	327	10
12727	58	341	11
12728	58	377	12
12729	58	438	13
12730	58	336	14
12731	58	407	15
12732	58	321	16
12733	58	320	17
12734	58	348	18
12735	58	392	19
12736	58	324	20
12737	58	382	21
12738	58	425	22
12739	58	429	23
12740	59	430	1
12741	59	435	2
12742	59	411	3
12743	59	441	4
12744	59	394	5
12745	59	379	6
12746	59	373	7
12747	59	449	8
12748	59	351	9
12749	59	327	10
12750	59	341	11
12751	59	377	12
12752	59	438	13
12753	59	336	14
12754	59	407	15
12755	59	321	16
12756	59	320	17
12757	59	348	18
12758	59	392	19
12759	60	362	1
12760	60	353	2
12761	60	364	3
12762	60	357	4
12763	60	367	5
12764	60	358	6
12765	60	355	7
12766	60	398	8
12767	60	365	9
12768	60	337	10
12769	60	434	11
12770	60	347	12
12771	60	317	13
12772	60	309	14
12773	60	334	15
12774	60	395	16
12775	60	311	17
12776	60	329	18
12777	60	387	19
12778	60	332	20
12779	60	391	21
12780	60	343	22
12781	60	351	23
12782	60	314	24
12783	60	327	25
12784	60	341	26
12785	60	377	27
12786	60	438	28
12787	60	336	29
12788	60	407	30
12789	60	321	31
12790	60	320	32
12791	60	348	33
12792	60	392	34
12793	60	324	35
12794	60	382	36
12795	60	425	37
12796	60	429	38
12797	61	360	1
12798	61	356	2
12799	61	366	3
12800	61	368	4
12801	61	363	5
12802	61	359	6
12803	61	362	7
12804	61	353	8
12805	61	364	9
12806	61	357	10
12807	61	367	11
12808	61	358	12
12809	61	371	13
12810	61	434	14
12811	61	317	15
12812	61	309	16
12813	61	334	17
12814	61	395	18
12815	61	311	19
12816	61	329	20
12817	61	387	21
12818	61	332	22
12819	61	391	23
12820	61	343	24
12821	61	351	25
12822	61	314	26
12823	61	327	27
12824	61	341	28
12825	61	377	29
12826	61	438	30
12827	61	336	31
12828	61	407	32
12829	61	321	33
12830	61	320	34
12831	61	348	35
12832	61	392	36
12833	61	324	37
12834	61	382	38
12835	61	425	39
12836	61	429	40
12837	62	317	1
12838	62	309	2
12839	62	334	3
12840	62	395	4
12841	62	311	5
12842	62	329	6
12843	62	387	7
12844	62	332	8
12845	62	391	9
12846	62	343	10
12847	62	351	11
12848	62	314	12
12849	62	327	13
12850	62	341	14
12851	62	377	15
12852	62	438	16
12853	62	336	17
12854	62	407	18
12855	62	321	19
12856	62	320	20
12857	62	348	21
12858	62	392	22
12859	62	324	23
12860	62	382	24
12861	62	425	25
12862	62	429	26
12863	63	417	1
12864	63	312	2
12865	63	408	3
12866	63	441	4
12867	63	394	5
12868	63	379	6
12869	63	373	7
12870	63	449	8
12871	63	351	9
12872	63	327	10
12873	63	341	11
12874	63	377	12
12875	63	438	13
12876	63	336	14
12877	63	407	15
12878	63	321	16
12879	63	320	17
12880	63	348	18
12881	63	392	19
12882	63	324	20
12883	63	382	21
12884	63	425	22
12885	63	429	23
12886	64	396	1
12887	64	375	2
12888	64	458	3
12889	64	397	4
12890	64	385	5
12891	64	424	6
12892	64	369	7
12893	64	457	8
12894	64	452	9
12895	64	388	10
12896	64	456	11
12897	64	393	12
12898	64	394	13
12899	64	379	14
12900	64	373	15
12901	64	449	16
12902	64	351	17
12903	64	327	18
12904	64	341	19
12905	64	377	20
12906	64	438	21
12907	64	336	22
12908	64	407	23
12909	64	321	24
12910	64	320	25
12911	64	348	26
12912	64	392	27
12913	64	324	28
12914	64	382	29
12915	64	425	30
12916	64	429	31
12917	65	459	1
12918	65	460	2
12919	65	461	3
12920	65	429	4
12921	65	425	5
12922	65	382	6
12923	65	324	7
12924	65	392	8
12925	65	348	9
12926	65	320	10
12927	65	321	11
12928	65	407	12
12929	66	354	1
12930	66	361	2
12931	66	360	3
12932	66	356	4
12933	66	366	5
12934	66	368	6
12935	66	363	7
12936	66	359	8
12937	66	362	9
12938	66	353	10
12939	66	364	11
12940	66	357	12
12941	66	367	13
12942	66	358	14
12943	66	355	15
12944	66	398	16
12945	66	365	17
12946	66	337	18
12947	66	434	19
12948	66	347	20
12949	66	317	21
12950	66	309	22
12951	66	334	23
12952	66	395	24
12953	66	311	25
12954	66	329	26
12955	66	387	27
12956	66	332	28
12957	66	391	29
12958	66	343	30
12959	66	351	31
12960	66	314	32
12961	66	380	33
12962	66	436	34
12963	66	448	35
12964	66	399	36
12965	66	333	37
12966	66	412	38
12967	66	389	39
12968	66	453	40
12969	66	444	41
12970	66	442	42
12971	66	420	43
12972	66	455	44
12973	67	360	1
12974	67	356	2
12975	67	366	3
12976	67	368	4
12977	67	363	5
12978	67	359	6
12979	67	362	7
12980	67	353	8
12981	67	364	9
12982	67	357	10
12983	67	367	11
12984	67	358	12
12985	67	371	13
12986	67	434	14
12987	67	317	15
12988	67	309	16
12989	67	334	17
12990	67	395	18
12991	67	311	19
12992	67	329	20
12993	67	387	21
12994	67	332	22
12995	67	391	23
12996	67	343	24
12997	67	351	25
12998	67	314	26
12999	67	380	27
13000	67	436	28
13001	67	448	29
13002	67	399	30
13003	67	333	31
13004	67	412	32
13005	67	389	33
13006	67	453	34
13007	67	444	35
13008	67	442	36
13009	67	420	37
13010	67	455	38
13011	68	360	1
13012	68	356	2
13013	68	366	3
13014	68	368	4
13015	68	363	5
13016	68	359	6
13017	68	362	7
13018	68	353	8
13019	68	364	9
13020	68	357	10
13021	68	367	11
13022	68	358	12
13023	68	371	13
13024	68	434	14
13025	68	317	15
13026	68	309	16
13027	68	334	17
13028	68	395	18
13029	68	311	19
13030	68	329	20
13031	68	387	21
13032	68	332	22
13033	68	391	23
13034	68	343	24
13035	68	351	25
13036	68	314	26
13037	68	380	27
13038	68	436	28
13039	68	448	29
13040	68	399	30
13041	68	333	31
13042	68	412	32
13043	69	402	1
13044	69	315	2
13045	69	344	3
13046	69	349	4
13047	69	313	5
13048	69	428	6
13049	69	318	7
13050	69	423	8
13051	69	335	9
13052	69	370	10
13053	69	401	11
13054	69	347	12
13055	69	317	13
13056	69	309	14
13057	69	334	15
13058	69	395	16
13059	69	311	17
13060	69	329	18
13061	69	387	19
13062	69	332	20
13063	69	391	21
13064	69	343	22
13065	69	351	23
13066	69	314	24
13067	69	380	25
13068	69	436	26
13069	69	448	27
13070	69	399	28
13071	69	333	29
13072	69	412	30
13073	69	389	31
13074	69	453	32
13075	69	444	33
13076	69	442	34
13077	69	420	35
13078	69	455	36
13079	70	431	1
13080	70	323	2
13081	70	350	3
13082	70	451	4
13083	70	406	5
13084	70	432	6
13085	70	322	7
13086	70	414	8
13087	70	446	9
13088	70	440	10
13089	70	316	11
13090	70	437	12
13091	70	445	13
13092	70	434	14
13093	70	347	15
13094	70	317	16
13095	70	309	17
13096	70	334	18
13097	70	395	19
13098	70	311	20
13099	70	329	21
13100	70	387	22
13101	70	332	23
13102	70	391	24
13103	70	343	25
13104	70	351	26
13105	70	314	27
13106	70	380	28
13107	70	436	29
13108	70	448	30
13109	70	399	31
13110	70	333	32
13111	70	412	33
13112	70	389	34
13113	70	453	35
13114	70	444	36
13115	70	442	37
13116	70	420	38
13117	70	455	39
13118	71	443	1
13119	71	346	2
13120	71	342	3
13121	71	374	4
13122	71	390	5
13123	71	455	6
13124	72	417	1
13125	72	312	2
13126	72	408	3
13127	72	441	4
13128	72	384	5
13129	72	331	6
13130	72	338	7
13131	72	326	8
13132	72	380	9
13133	72	436	10
13134	72	448	11
13135	72	399	12
13136	72	333	13
13137	72	412	14
13138	72	389	15
13139	72	453	16
13140	72	444	17
13141	72	442	18
13142	72	420	19
13143	72	455	20
13144	73	458	1
13145	73	375	2
13146	73	396	3
13147	73	365	4
13148	73	337	5
13149	73	434	6
13150	73	347	7
13151	73	317	8
13152	73	309	9
13153	73	334	10
13154	73	395	11
13155	73	311	12
13156	73	329	13
13157	73	387	14
13158	73	332	15
13159	73	391	16
13160	73	343	17
13161	73	351	18
13162	73	314	19
13163	73	380	20
13164	73	436	21
13165	73	448	22
13166	73	399	23
13167	73	333	24
13168	73	412	25
13169	73	389	26
13170	73	453	27
13171	73	444	28
13172	73	442	29
13173	73	420	30
13174	73	455	31
13175	74	410	1
13176	74	409	2
13177	74	419	3
13178	74	330	4
13179	74	381	5
13180	74	340	6
13181	74	310	7
13182	74	345	8
13183	74	339	9
13184	74	325	10
13185	74	328	11
13186	74	387	12
13187	74	332	13
13188	74	391	14
13189	74	343	15
13190	74	351	16
13191	74	314	17
13192	74	380	18
13193	74	436	19
13194	74	448	20
13195	74	399	21
13196	74	333	22
13197	74	412	23
13198	74	389	24
13199	74	453	25
13200	74	444	26
13201	74	442	27
13202	74	420	28
13203	74	455	29
13204	75	360	1
13205	75	356	2
13206	75	366	3
13207	75	368	4
13208	75	363	5
13209	75	359	6
13210	75	362	7
13211	75	353	8
13212	75	364	9
13213	75	357	10
13214	75	367	11
13215	75	358	12
13216	75	355	13
13217	75	398	14
13218	75	365	15
13219	75	396	16
13220	75	375	17
13221	75	458	18
13222	75	397	19
13223	75	385	20
13224	75	424	21
13225	75	369	22
13226	75	457	23
13227	75	452	24
13228	75	388	25
13229	75	456	26
13230	75	393	27
13231	75	394	28
13232	75	379	29
13233	75	331	30
13234	75	418	31
13235	75	421	32
13236	75	405	33
13237	75	427	34
13238	75	352	35
13239	75	403	36
13240	75	439	37
13241	75	319	38
13242	75	433	39
13243	75	386	40
13244	75	415	41
13245	75	426	42
13246	76	431	1
13247	76	323	2
13248	76	350	3
13249	76	451	4
13250	76	406	5
13251	76	432	6
13252	76	322	7
13253	76	414	8
13254	76	446	9
13255	76	440	10
13256	76	316	11
13257	76	437	12
13258	76	445	13
13259	76	434	14
13260	76	347	15
13261	76	337	16
13262	76	365	17
13263	76	396	18
13264	76	375	19
13265	76	458	20
13266	76	397	21
13267	76	385	22
13268	76	424	23
13269	76	369	24
13270	76	457	25
13271	76	452	26
13272	76	388	27
13273	76	456	28
13274	76	393	29
13275	76	394	30
13276	76	379	31
13277	76	331	32
13278	76	418	33
13279	76	421	34
13280	76	405	35
13281	76	427	36
13282	76	352	37
13283	76	403	38
13284	76	439	39
13285	76	319	40
13286	76	433	41
13287	76	386	42
13288	76	415	43
13289	76	426	44
13290	77	431	1
13291	77	323	2
13292	77	350	3
13293	77	451	4
13294	77	406	5
13295	77	432	6
13296	77	322	7
13297	77	414	8
13298	77	446	9
13299	77	440	10
13300	77	316	11
13301	77	437	12
13302	77	445	13
13303	77	434	14
13304	77	347	15
13305	77	317	16
13306	77	309	17
13307	77	334	18
13308	77	395	19
13309	77	311	20
13310	77	329	21
13311	77	387	22
13312	77	332	23
13313	77	391	24
13314	77	343	25
13315	77	351	26
13316	77	314	27
13317	77	326	28
13318	77	338	29
13319	77	331	30
13320	77	418	31
13321	77	421	32
13322	77	405	33
13323	77	427	34
13324	77	352	35
13325	77	403	36
13326	77	439	37
13327	77	319	38
13328	77	433	39
13329	77	450	40
13330	77	378	41
13331	77	404	42
13332	77	454	43
13333	77	422	44
13334	78	402	1
13335	78	315	2
13336	78	344	3
13337	78	349	4
13338	78	313	5
13339	78	428	6
13340	78	318	7
13341	78	423	8
13342	78	335	9
13343	78	370	10
13344	78	401	11
13345	78	347	12
13346	78	434	13
13347	78	337	14
13348	78	365	15
13349	78	396	16
13350	78	375	17
13351	78	458	18
13352	78	397	19
13353	78	385	20
13354	78	424	21
13355	78	369	22
13356	78	457	23
13357	78	452	24
13358	78	388	25
13359	78	456	26
13360	78	393	27
13361	78	394	28
13362	78	379	29
13363	78	331	30
13364	78	418	31
13365	78	421	32
13366	78	405	33
13367	78	427	34
13368	78	352	35
13369	78	403	36
13370	78	439	37
13371	78	319	38
13372	78	433	39
13373	78	450	40
13374	78	378	41
13375	78	404	42
13376	78	454	43
13377	78	422	44
13378	79	402	1
13379	79	315	2
13380	79	344	3
13381	79	349	4
13382	79	313	5
13383	79	428	6
13384	79	318	7
13385	79	423	8
13386	79	335	9
13387	79	370	10
13388	79	401	11
13389	79	347	12
13390	79	317	13
13391	79	309	14
13392	79	334	15
13393	79	395	16
13394	79	311	17
13395	79	329	18
13396	79	387	19
13397	79	332	20
13398	79	391	21
13399	79	343	22
13400	79	351	23
13401	79	314	24
13402	79	326	25
13403	79	338	26
13404	79	331	27
13405	79	418	28
13406	79	421	29
13407	79	405	30
13408	79	427	31
13409	79	352	32
13410	79	403	33
13411	79	439	34
13412	79	319	35
13413	79	433	36
13414	79	386	37
13415	79	415	38
13416	79	426	39
13417	80	360	1
13418	80	356	2
13419	80	366	3
13420	80	368	4
13421	80	363	5
13422	80	359	6
13423	80	362	7
13424	80	353	8
13425	80	364	9
13426	80	357	10
13427	80	367	11
13428	80	358	12
13429	80	355	13
13430	80	398	14
13431	80	365	15
13432	80	396	16
13433	80	375	17
13434	80	458	18
13435	80	397	19
13436	80	385	20
13437	80	424	21
13438	80	369	22
13439	80	457	23
13440	80	452	24
13441	80	388	25
13442	80	456	26
13443	80	393	27
13444	80	394	28
13445	80	379	29
13446	80	331	30
13447	80	418	31
13448	80	421	32
13449	80	405	33
13450	80	427	34
13451	80	352	35
13452	80	403	36
13453	80	439	37
13454	80	319	38
13455	80	433	39
13456	80	386	40
13457	80	415	41
13458	80	426	42
13459	81	410	1
13460	81	409	2
13461	81	419	3
13462	81	330	4
13463	81	381	5
13464	81	340	6
13465	81	310	7
13466	81	345	8
13467	81	339	9
13468	81	325	10
13469	81	328	11
13470	81	332	12
13471	81	376	13
13472	81	388	14
13473	81	456	15
13474	81	393	16
13475	81	394	17
13476	81	379	18
13477	81	331	19
13478	81	418	20
13479	81	421	21
13480	81	405	22
13481	81	427	23
13482	81	352	24
13483	81	403	25
13484	81	439	26
13485	81	319	27
13486	81	433	28
13487	81	450	29
13488	81	378	30
13489	81	404	31
13490	81	454	32
13491	81	422	33
13492	82	356	1
13493	82	366	2
13494	82	368	3
13495	82	363	4
13496	82	359	5
13497	82	362	6
13498	82	353	7
13499	82	364	8
13500	82	357	9
13501	82	367	10
13502	82	358	11
13503	82	371	12
13504	82	434	13
13505	82	317	14
13506	82	309	15
13507	82	334	16
13508	82	395	17
13509	82	311	18
13510	82	329	19
13511	82	387	20
13512	82	332	21
13513	82	391	22
13514	82	343	23
13515	82	351	24
13516	82	314	25
13517	82	326	26
13518	82	338	27
13519	82	331	28
13520	82	418	29
13521	82	421	30
13522	82	405	31
13523	82	427	32
13524	82	352	33
13525	82	403	34
13526	82	439	35
13527	82	319	36
13528	82	433	37
13529	82	450	38
13530	82	378	39
13531	82	404	40
13532	82	454	41
13533	82	422	42
13534	83	356	1
13535	83	366	2
13536	83	368	3
13537	83	363	4
13538	83	359	5
13539	83	362	6
13540	83	353	7
13541	83	364	8
13542	83	357	9
13543	83	367	10
13544	83	358	11
13545	83	355	12
13546	83	398	13
13547	83	365	14
13548	83	396	15
13549	83	375	16
13550	83	458	17
13551	83	397	18
13552	83	385	19
13553	83	424	20
13554	83	369	21
13555	83	457	22
13556	83	452	23
13557	83	388	24
13558	83	456	25
13559	83	393	26
13560	83	394	27
13561	83	379	28
13562	83	331	29
13563	83	418	30
13564	83	421	31
13565	83	405	32
13566	83	427	33
13567	83	352	34
13568	83	403	35
13569	83	439	36
13570	83	319	37
13571	83	433	38
13572	83	386	39
13573	83	415	40
13574	83	426	41
13575	84	360	1
13576	84	356	2
13577	84	366	3
13578	84	368	4
13579	84	363	5
13580	84	359	6
13581	84	362	7
13582	84	353	8
13583	84	364	9
13584	84	357	10
13585	84	367	11
13586	84	358	12
13587	84	355	13
13588	84	398	14
13589	84	365	15
13590	84	396	16
13591	84	375	17
13592	84	458	18
13593	84	397	19
13594	84	385	20
13595	84	424	21
13596	84	369	22
13597	84	457	23
13598	84	452	24
13599	84	388	25
13600	84	456	26
13601	84	393	27
13602	84	394	28
13603	84	379	29
13604	84	331	30
13605	84	418	31
13606	84	421	32
13607	84	405	33
13608	84	427	34
13609	84	352	35
13610	84	403	36
13611	84	439	37
13612	84	319	38
13613	84	433	39
13614	84	450	40
13615	84	378	41
13616	84	404	42
13617	84	454	43
13618	84	422	44
13619	85	435	1
13620	85	430	2
13621	85	312	3
13622	85	388	4
13623	85	456	5
13624	85	393	6
13625	85	394	7
13626	85	379	8
13627	85	331	9
13628	85	418	10
13629	85	421	11
13630	85	405	12
13631	85	427	13
13632	85	352	14
13633	85	403	15
13634	85	439	16
13635	85	319	17
13636	85	433	18
13637	85	450	19
13638	85	378	20
13639	85	404	21
13640	85	454	22
13641	85	422	23
13642	86	417	1
13643	86	312	2
13644	86	408	3
13645	86	441	4
13646	86	384	5
13647	86	447	6
13648	86	416	7
13649	86	383	8
13650	86	372	9
13651	86	400	10
13652	86	403	11
13653	86	439	12
13654	86	319	13
13655	86	433	14
13656	86	450	15
13657	86	378	16
13658	86	404	17
13659	86	454	18
13660	86	422	19
13661	87	429	1
13662	87	425	2
13663	87	382	3
13664	87	324	4
13665	87	392	5
13666	87	348	6
13667	87	320	7
13668	87	321	8
13669	87	407	9
13670	87	336	10
13671	87	438	11
13672	87	377	12
13673	87	341	13
13674	87	327	14
13675	87	351	15
13676	87	449	16
13677	87	373	17
13678	87	379	18
13679	87	394	19
13680	87	441	20
13681	87	411	21
13682	87	430	22
13683	87	435	23
13684	88	392	1
13685	88	348	2
13686	88	320	3
13687	88	321	4
13688	88	407	5
13689	88	336	6
13690	88	438	7
13691	88	377	8
13692	88	341	9
13693	88	327	10
13694	88	351	11
13695	88	449	12
13696	88	373	13
13697	88	379	14
13698	88	394	15
13699	88	441	16
13700	88	411	17
13701	88	430	18
13702	88	435	19
13703	89	402	1
13704	89	315	2
13705	89	344	3
13706	89	349	4
13707	89	313	5
13708	89	428	6
13709	89	318	7
13710	89	423	8
13711	89	335	9
13712	89	370	10
13713	89	401	11
13714	89	347	12
13715	89	434	13
13716	89	337	14
13717	89	365	15
13718	89	396	16
13719	89	375	17
13720	89	458	18
13721	89	397	19
13722	89	385	20
13723	89	424	21
13724	89	369	22
13725	89	457	23
13726	89	452	24
13727	89	388	25
13728	89	312	26
13729	89	435	27
13730	89	430	28
13731	90	360	1
13732	90	356	2
13733	90	366	3
13734	90	368	4
13735	90	363	5
13736	90	359	6
13737	90	362	7
13738	90	353	8
13739	90	364	9
13740	90	357	10
13741	90	367	11
13742	90	358	12
13743	90	371	13
13744	90	434	14
13745	90	317	15
13746	90	309	16
13747	90	334	17
13748	90	395	18
13749	90	311	19
13750	90	329	20
13751	90	387	21
13752	90	332	22
13753	90	391	23
13754	90	343	24
13755	90	314	25
13756	90	327	26
13757	90	351	27
13758	90	449	28
13759	90	373	29
13760	90	379	30
13761	90	394	31
13762	90	441	32
13763	90	411	33
13764	90	430	34
13765	91	431	1
13766	91	323	2
13767	91	350	3
13768	91	451	4
13769	91	406	5
13770	91	432	6
13771	91	322	7
13772	91	414	8
13773	91	446	9
13774	91	440	10
13775	91	316	11
13776	91	437	12
13777	91	445	13
13778	91	434	14
13779	91	347	15
13780	91	317	16
13781	91	309	17
13782	91	334	18
13783	91	395	19
13784	91	311	20
13785	91	329	21
13786	91	387	22
13787	91	391	23
13788	91	328	24
13789	91	339	25
13790	91	325	26
13791	91	332	27
13792	91	376	28
13793	91	388	29
13794	91	312	30
13795	91	435	31
13796	91	430	32
13797	92	360	1
13798	92	356	2
13799	92	366	3
13800	92	368	4
13801	92	363	5
13802	92	359	6
13803	92	362	7
13804	92	353	8
13805	92	364	9
13806	92	357	10
13807	92	367	11
13808	92	358	12
13809	92	355	13
13810	92	398	14
13811	92	365	15
13812	92	396	16
13813	92	375	17
13814	92	458	18
13815	92	397	19
13816	92	385	20
13817	92	424	21
13818	92	369	22
13819	92	457	23
13820	92	452	24
13821	92	388	25
13822	92	312	26
13823	92	435	27
13824	92	430	28
13825	93	422	1
13826	93	454	2
13827	93	404	3
13828	93	378	4
13829	93	450	5
13830	93	433	6
13831	93	319	7
13832	93	439	8
13833	93	403	9
13834	93	352	10
13835	93	427	11
13836	93	405	12
13837	93	421	13
13838	93	418	14
13839	93	331	15
13840	93	379	16
13841	93	394	17
13842	93	393	18
13843	93	456	19
13844	93	388	20
13845	93	312	21
13846	93	435	22
13847	94	413	1
13848	94	400	2
13849	94	372	3
13850	94	383	4
13851	94	416	5
13852	94	447	6
13853	94	384	7
13854	94	441	8
13855	94	408	9
13856	94	312	10
13857	94	388	11
13858	94	376	12
13859	94	332	13
13860	94	328	14
13861	94	325	15
13862	94	339	16
13863	94	345	17
13864	94	310	18
13865	94	340	19
13866	94	381	20
13867	94	330	21
13868	94	419	22
13869	94	409	23
13870	94	410	24
13871	95	354	1
13872	95	361	2
13873	95	360	3
13874	95	356	4
13875	95	366	5
13876	95	368	6
13877	95	363	7
13878	95	359	8
13879	95	362	9
13880	95	353	10
13881	95	364	11
13882	95	357	12
13883	95	367	13
13884	95	358	14
13885	95	371	15
13886	95	434	16
13887	95	317	17
13888	95	309	18
13889	95	334	19
13890	95	395	20
13891	95	311	21
13892	95	329	22
13893	95	387	23
13894	95	391	24
13895	95	332	25
13896	95	328	26
13897	95	325	27
13898	95	339	28
13899	95	345	29
13900	95	310	30
13901	95	340	31
13902	95	381	32
13903	95	330	33
13904	95	419	34
13905	95	409	35
13906	95	410	36
13907	96	362	1
13908	96	353	2
13909	96	364	3
13910	96	357	4
13911	96	367	5
13912	96	358	6
13913	96	355	7
13914	96	398	8
13915	96	365	9
13916	96	396	10
13917	96	375	11
13918	96	458	12
13919	96	397	13
13920	96	385	14
13921	96	424	15
13922	96	369	16
13923	96	457	17
13924	96	452	18
13925	96	388	19
13926	96	376	20
13927	96	332	21
13928	96	328	22
13929	96	325	23
13930	96	339	24
13931	96	345	25
13932	96	310	26
13933	96	340	27
13934	96	381	28
13935	96	330	29
13936	96	419	30
13937	96	409	31
13938	96	410	32
13939	97	443	1
13940	97	346	2
13941	97	342	3
13942	97	374	4
13943	97	390	5
13944	97	455	6
13945	97	420	7
13946	97	442	8
13947	97	444	9
13948	97	453	10
13949	97	389	11
13950	97	412	12
13951	97	333	13
13952	97	399	14
13953	97	448	15
13954	97	436	16
13955	97	380	17
13956	97	314	18
13957	97	351	19
13958	97	343	20
13959	97	391	21
13960	97	332	22
13961	97	387	23
13962	97	328	24
13963	97	325	25
13964	97	339	26
13965	97	345	27
13966	97	310	28
13967	97	340	29
13968	97	381	30
13969	97	330	31
13970	97	419	32
13971	97	409	33
13972	97	410	34
13973	98	455	1
13974	98	420	2
13975	98	442	3
13976	98	444	4
13977	98	453	5
13978	98	389	6
13979	98	412	7
13980	98	333	8
13981	98	399	9
13982	98	448	10
13983	98	436	11
13984	98	380	12
13985	98	314	13
13986	98	351	14
13987	98	343	15
13988	98	391	16
13989	98	332	17
13990	98	387	18
13991	98	328	19
13992	98	325	20
13993	98	339	21
13994	98	345	22
13995	98	310	23
13996	98	340	24
13997	98	381	25
13998	98	330	26
13999	98	419	27
14000	98	409	28
14001	98	410	29
14002	99	422	1
14003	99	454	2
14004	99	404	3
14005	99	378	4
14006	99	450	5
14007	99	433	6
14008	99	319	7
14009	99	439	8
14010	99	403	9
14011	99	352	10
14012	99	427	11
14013	99	405	12
14014	99	421	13
14015	99	418	14
14016	99	331	15
14017	99	379	16
14018	99	394	17
14019	99	393	18
14020	99	456	19
14021	99	388	20
14022	99	376	21
14023	99	332	22
14024	99	328	23
14025	99	325	24
14026	99	339	25
14027	99	345	26
14028	99	310	27
14029	99	340	28
14030	99	381	29
14031	99	330	30
14032	99	419	31
14033	99	409	32
14034	99	410	33
14035	100	417	1
14036	100	312	2
14037	100	388	3
14038	100	376	4
14039	100	332	5
14040	100	328	6
14041	100	325	7
14042	100	339	8
14043	100	345	9
14044	100	310	10
14045	100	340	11
14046	100	381	12
14047	100	330	13
14048	100	419	14
14049	100	409	15
14050	100	410	16
14051	101	458	1
14052	101	397	2
14053	101	385	3
14054	101	424	4
14055	101	369	5
14056	101	457	6
14057	101	417	7
14058	101	312	8
14059	101	388	9
14060	101	376	10
14061	101	332	11
14062	101	328	12
14063	101	325	13
14064	101	339	14
14065	101	345	15
14066	101	310	16
14067	101	340	17
14068	101	381	18
14069	101	330	19
14070	101	419	20
14071	101	409	21
14072	101	410	22
14073	102	410	1
14074	102	409	2
14075	102	419	3
14076	102	330	4
14077	102	381	5
14078	102	340	6
14079	102	310	7
14080	102	345	8
14081	102	339	9
14082	102	325	10
14083	102	328	11
14084	102	332	12
14085	102	376	13
14086	102	388	14
14087	102	312	15
14088	102	408	16
14089	102	441	17
14090	102	384	18
14091	102	447	19
14092	102	416	20
14093	102	383	21
14094	102	372	22
14095	102	400	23
14096	102	413	24
14097	103	354	1
14098	103	361	2
14099	103	360	3
14100	103	356	4
14101	103	366	5
14102	103	368	6
14103	103	363	7
14104	103	359	8
14105	103	362	9
14106	103	353	10
14107	103	364	11
14108	103	357	12
14109	103	367	13
14110	103	358	14
14111	103	355	15
14112	103	398	16
14113	103	365	17
14114	103	396	18
14115	103	375	19
14116	103	458	20
14117	103	397	21
14118	103	385	22
14119	103	424	23
14120	103	369	24
14121	103	457	25
14122	103	452	26
14123	103	388	27
14124	103	456	28
14125	103	393	29
14126	103	394	30
14127	103	379	31
14128	103	331	32
14129	103	338	33
14130	103	384	34
14131	103	447	35
14132	103	416	36
14133	103	383	37
14134	103	372	38
14135	103	400	39
14136	103	413	40
14137	104	431	1
14138	104	323	2
14139	104	350	3
14140	104	451	4
14141	104	406	5
14142	104	432	6
14143	104	322	7
14144	104	414	8
14145	104	446	9
14146	104	440	10
14147	104	316	11
14148	104	437	12
14149	104	445	13
14150	104	434	14
14151	104	347	15
14152	104	317	16
14153	104	309	17
14154	104	334	18
14155	104	395	19
14156	104	311	20
14157	104	329	21
14158	104	387	22
14159	104	332	23
14160	104	391	24
14161	104	343	25
14162	104	351	26
14163	104	314	27
14164	104	326	28
14165	104	338	29
14166	104	331	30
14167	104	384	31
14168	104	447	32
14169	104	416	33
14170	104	383	34
14171	104	372	35
14172	104	400	36
14173	104	413	37
14174	105	443	1
14175	105	346	2
14176	105	342	3
14177	105	374	4
14178	105	390	5
14179	105	455	6
14180	105	420	7
14181	105	442	8
14182	105	444	9
14183	105	453	10
14184	105	389	11
14185	105	412	12
14186	105	333	13
14187	105	399	14
14188	105	448	15
14189	105	436	16
14190	105	380	17
14191	105	326	18
14192	105	338	19
14193	105	331	20
14194	105	384	21
14195	106	402	1
14196	106	315	2
14197	106	344	3
14198	106	349	4
14199	106	313	5
14200	106	428	6
14201	106	318	7
14202	106	423	8
14203	106	335	9
14204	106	370	10
14205	106	401	11
14206	106	347	12
14207	106	434	13
14208	106	337	14
14209	106	365	15
14210	106	398	16
14211	106	417	17
14212	106	312	18
14213	106	408	19
14214	106	441	20
14215	106	384	21
14216	106	447	22
14217	106	416	23
14218	106	383	24
14219	106	372	25
14220	106	400	26
14221	106	413	27
14222	107	402	1
14223	107	315	2
14224	107	344	3
14225	107	349	4
14226	107	313	5
14227	107	428	6
14228	107	318	7
14229	107	423	8
14230	107	335	9
14231	107	370	10
14232	107	401	11
14233	107	347	12
14234	107	434	13
14235	107	337	14
14236	107	365	15
14237	107	398	16
14238	107	458	17
14239	107	397	18
14240	107	385	19
14241	107	424	20
14242	107	369	21
14243	107	457	22
14244	107	417	23
14245	107	312	24
14246	107	408	25
14247	107	441	26
14248	107	384	27
14249	107	447	28
14250	107	416	29
14251	107	383	30
14252	107	372	31
14253	107	400	32
14254	107	413	33
14255	108	417	1
14256	108	312	2
14257	108	408	3
14258	108	441	4
14259	108	384	5
14260	108	447	6
14261	108	416	7
14262	108	383	8
14263	108	372	9
14264	108	400	10
14265	108	413	11
14266	109	458	1
14267	109	397	2
14268	109	385	3
14269	109	424	4
14270	109	369	5
14271	109	457	6
14272	109	417	7
14273	109	312	8
14274	109	408	9
14275	109	441	10
14276	109	384	11
14277	109	447	12
14278	109	416	13
14279	109	383	14
14280	109	372	15
14281	109	400	16
14282	109	413	17
14283	110	455	1
14284	110	420	2
14285	110	442	3
14286	110	444	4
14287	110	453	5
14288	110	389	6
14289	110	412	7
14290	110	333	8
14291	110	399	9
14292	110	448	10
14293	110	436	11
14294	110	380	12
14295	110	326	13
14296	110	338	14
14297	110	331	15
14298	110	384	16
14299	110	441	17
14300	110	408	18
14301	110	312	19
14302	110	417	20
14303	111	429	1
14304	111	425	2
14305	111	382	3
14306	111	324	4
14307	111	392	5
14308	111	348	6
14309	111	320	7
14310	111	321	8
14311	111	407	9
14312	111	336	10
14313	111	438	11
14314	111	377	12
14315	111	341	13
14316	111	327	14
14317	111	351	15
14318	111	449	16
14319	111	373	17
14320	111	379	18
14321	111	394	19
14322	111	441	20
14323	111	408	21
14324	111	312	22
14325	111	417	23
14326	112	413	1
14327	112	400	2
14328	112	372	3
14329	112	383	4
14330	112	416	5
14331	112	447	6
14332	112	384	7
14333	112	441	8
14334	112	408	9
14335	112	312	10
14336	112	417	11
14337	113	413	1
14338	113	400	2
14339	113	372	3
14340	113	383	4
14341	113	416	5
14342	113	447	6
14343	113	384	7
14344	113	441	8
14345	113	408	9
14346	113	312	10
14347	113	388	11
14348	113	452	12
14349	113	457	13
14350	113	369	14
14351	113	424	15
14352	114	422	1
14353	114	454	2
14354	114	404	3
14355	114	378	4
14356	114	450	5
14357	114	433	6
14358	114	319	7
14359	114	439	8
14360	114	403	9
14361	114	400	10
14362	114	372	11
14363	114	383	12
14364	114	416	13
14365	114	447	14
14366	114	384	15
14367	114	441	16
14368	114	408	17
14369	114	312	18
14370	114	417	19
14371	115	431	1
14372	115	323	2
14373	115	350	3
14374	115	451	4
14375	115	406	5
14376	115	432	6
14377	115	322	7
14378	115	414	8
14379	115	446	9
14380	115	440	10
14381	115	316	11
14382	115	437	12
14383	115	445	13
14384	115	434	14
14385	115	347	15
14386	115	337	16
14387	115	365	17
14388	115	398	18
14389	116	410	1
14390	116	409	2
14391	116	419	3
14392	116	330	4
14393	116	381	5
14394	116	340	6
14395	116	310	7
14396	116	345	8
14397	116	339	9
14398	116	325	10
14399	116	328	11
14400	116	332	12
14401	116	376	13
14402	116	388	14
14403	116	312	15
14404	116	417	16
14405	117	410	1
14406	117	409	2
14407	117	419	3
14408	117	330	4
14409	117	381	5
14410	117	340	6
14411	117	310	7
14412	117	345	8
14413	117	339	9
14414	117	325	10
14415	117	328	11
14416	117	332	12
14417	117	376	13
14418	117	456	14
14419	117	388	15
14420	117	452	16
14421	117	457	17
14422	117	369	18
14436	118	417	1
14437	118	388	2
14438	118	376	3
14439	118	332	4
14440	118	328	5
14441	118	310	6
14442	118	340	7
14443	118	407	8
14444	118	345	9
14445	118	339	10
14446	118	325	11
14447	118	312	12
14448	119	384	1
14449	119	331	2
14450	119	338	3
14451	119	326	4
14452	119	380	5
14453	119	436	6
14454	119	448	7
14455	119	399	8
14456	119	333	9
14457	119	412	10
14458	119	389	11
14459	119	453	12
14460	119	444	13
14461	119	442	14
14462	119	420	15
14463	119	455	16
14464	119	390	17
14465	119	374	18
14466	119	342	19
14467	119	346	20
14468	119	443	21
14469	120	334	1
14470	120	395	2
14471	120	311	3
14472	120	329	4
14473	120	387	5
14474	120	332	6
14475	120	391	7
14476	120	343	8
14477	120	351	9
14478	120	314	10
14479	120	380	11
14480	120	436	12
14481	120	448	13
14482	120	399	14
14483	120	333	15
14484	120	412	16
14485	120	389	17
14486	120	453	18
14487	120	444	19
14488	120	442	20
14489	120	420	21
14490	120	455	22
14491	120	390	23
14492	120	374	24
14493	120	342	25
14494	120	346	26
14495	120	443	27
14496	121	410	1
14497	121	409	2
14498	121	419	3
14499	121	330	4
14500	121	381	5
14501	121	340	6
14502	121	310	7
14503	121	345	8
14504	121	339	9
14505	121	325	10
14506	121	328	11
14507	121	387	12
14508	121	332	13
14509	121	391	14
14510	121	343	15
14511	121	351	16
14512	121	314	17
14513	121	380	18
14514	121	436	19
14515	121	448	20
14516	121	399	21
14517	121	333	22
14518	121	412	23
14519	121	389	24
14520	121	453	25
14521	121	444	26
14522	121	442	27
14523	121	420	28
14524	121	455	29
14525	121	390	30
14526	121	374	31
14527	121	342	32
14528	121	346	33
14529	121	443	34
14530	122	455	1
14531	122	390	2
14532	122	374	3
14533	122	342	4
14534	122	346	5
14535	122	443	6
14536	123	360	1
14537	123	356	2
14538	123	366	3
14539	123	368	4
14540	123	363	5
14541	123	359	6
14542	123	362	7
14543	123	353	8
14544	123	364	9
14545	123	357	10
14546	123	367	11
14547	123	358	12
14548	123	371	13
14549	123	434	14
14550	123	317	15
14551	123	309	16
14552	123	334	17
14553	123	395	18
14554	123	311	19
14555	123	329	20
14556	123	387	21
14557	123	332	22
14558	123	391	23
14559	123	343	24
14560	123	351	25
14561	123	314	26
14562	123	380	27
14563	123	436	28
14564	123	448	29
14565	123	399	30
14566	123	333	31
14567	123	412	32
14568	123	389	33
14569	123	453	34
14570	123	444	35
14571	123	442	36
14572	123	420	37
14573	123	455	38
14574	123	390	39
14575	123	374	40
14576	123	342	41
14577	123	346	42
14578	123	443	43
14579	124	391	1
14580	124	343	2
14581	124	351	3
14582	124	314	4
14583	124	380	5
14584	124	436	6
14585	124	448	7
14586	124	399	8
14587	124	333	9
14588	124	412	10
14589	124	389	11
14590	124	453	12
14591	124	444	13
14592	124	442	14
14593	124	420	15
14594	124	455	16
14595	124	390	17
14596	124	374	18
14597	124	342	19
14598	124	346	20
14599	124	443	21
14600	125	337	1
14601	125	365	2
14602	125	396	3
14603	125	375	4
14604	125	458	5
14605	125	397	6
14606	125	385	7
14607	125	424	8
14608	125	369	9
14609	125	457	10
14610	125	452	11
14611	125	388	12
14612	125	456	13
14613	125	393	14
14614	125	394	15
14615	125	379	16
14616	125	373	17
14617	125	449	18
14618	125	351	19
14619	125	327	20
14620	125	341	21
14621	125	377	22
14622	125	438	23
14623	125	336	24
14624	125	407	25
14625	125	321	26
14626	125	320	27
14627	125	348	28
14628	125	392	29
14629	125	324	30
14630	125	382	31
14631	125	425	32
14632	125	429	33
14633	125	461	34
14634	125	460	35
14635	125	459	36
14636	126	407	1
14637	126	321	2
14638	126	320	3
14639	126	348	4
14640	126	392	5
14641	126	324	6
14642	126	382	7
14643	126	425	8
14644	126	429	9
14645	126	461	10
14646	126	460	11
14647	126	459	12
\.


--
-- Data for Name: rutas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rutas (id, codigo, nombre, color_hex, coordenadas, origen, destino) FROM stdin;
3	1 P	1 - Universidades – CityU → Portal ElDorado – C.C.	#3b82f6	[[4.604585058104628, -74.06727783973636], [4.60645908735294, -74.06640189210013], [4.608774015084996, -74.06631548332544], [4.610207394287298, -74.06858244978758], [4.612316056068223, -74.0708831893579], [4.615124995284933, -74.07254801100575], [4.6239692979314375, -74.07891291920026], [4.632002737022819, -74.08426579831436], [4.632749552412936, -74.08533500424448], [4.634734636603903, -74.09057461190847], [4.635614775765174, -74.0917289104092], [4.667777307848211, -74.11247624667611], [4.679822840730703, -74.1199157831909], [4.683193364032853, -74.1223366023075], [4.684625860951709, -74.12436900043339], [4.682902388012874, -74.12255142934907], [4.680886221383028, -74.1210874954308]]	Universidades – CityU	Portal ElDorado – C.C.
4	1 U	1 - Portal ElDorado – C.C. → Universidades – CityU	#3b82f6	[[4.680886221383028, -74.1210874954308], [4.635939884762308, -74.092192571873], [4.634553774037823, -74.09050545896174], [4.632705048675513, -74.08540894870022], [4.632088258174256, -74.08449032216659], [4.6143373121149684, -74.07210453216057], [4.612303612352527, -74.07093748943704], [4.610494357626835, -74.06904234190647], [4.608801973888519, -74.06638745711346], [4.606540831950481, -74.06642235003387], [4.604908024080314, -74.06724068835499]]	Portal ElDorado – C.C.	Universidades – CityU
5	2 M	2 - Museo Nacional → Portal 20 De Julio	#3b82f6	[[4.6154857337298685, -74.06923652598336], [4.613838825264451, -74.06975748858157], [4.602314739044675, -74.07662799772078], [4.585588760836308, -74.08743590928026], [4.576001876100423, -74.09448502685498], [4.5689345543472735, -74.10082105321132], [4.565319172631687, -74.09813471864162], [4.564741731133761, -74.09802158562314], [4.56663997917708, -74.09593236655179], [4.566218209625287, -74.09670254718112]]	Museo Nacional	Portal 20 De Julio
6	2 P	2 - Portal 20 De Julio → Museo Nacional	#3b82f6	[[4.566218209625287, -74.09670254718112], [4.565079513176948, -74.09802695438364], [4.568920220278964, -74.10070408490918], [4.575896745550824, -74.09440015322492], [4.585731024763779, -74.08721173889246], [4.602350384990558, -74.0764889936123], [4.61385572312694, -74.06966718562873], [4.6162871870940325, -74.06892418112554], [4.6154857337298685, -74.06923652598336]]	Portal 20 De Julio	Museo Nacional
7	3 C	3 - Corferias → Portal Tunal	#3b82f6	[[4.57081833590829, -74.13944717410645], [4.572165248833575, -74.13977999838376], [4.572242857208472, -74.14002472774703], [4.570162698374316, -74.13954234529945], [4.569324351035362, -74.14009497079292], [4.567091139241642, -74.14028671011484], [4.567224147768592, -74.13739344188771], [4.570560891915608, -74.12928367434871], [4.570464802184865, -74.12831526584387], [4.5692264011371195, -74.12545126176326], [4.57406283421603, -74.12364977117964], [4.574973463028038, -74.12281652019651], [4.576012589314872, -74.11888735215072], [4.576893668907382, -74.11375399985563], [4.578488745585138, -74.10834139695869], [4.581523857778301, -74.10188562617847], [4.585756784289869, -74.09435211193274], [4.591507075354379, -74.08965102044563], [4.592156188123543, -74.0885404205843], [4.595221965126757, -74.08602584960704], [4.608659061101457, -74.07624321212981], [4.615143684278646, -74.07289153170055], [4.614649621416322, -74.07349422123032], [4.614323852314285, -74.07345617819075], [4.6134252332310055, -74.0724534149793], [4.6142759007957, -74.0720413402051], [4.632002737022819, -74.08426579831436], [4.632749552412936, -74.08533500424448], [4.634373625719512, -74.08968089839665]]	Corferias	Portal Tunal
8	3 P	3 - Portal Tunal → Corferias	#3b82f6	[[4.634228890709109, -74.08969058066698], [4.632705048675513, -74.08540894870022], [4.632088258174256, -74.08449032216659], [4.617164178909774, -74.07411332300865], [4.615294765130846, -74.07309336842502], [4.614559330568535, -74.07366733563761], [4.613149038101542, -74.07401499335212], [4.608508376166009, -74.07647969608291], [4.595206646991424, -74.08617653606801], [4.5922447678016916, -74.0886193841304], [4.591488214978066, -74.08981285638778], [4.585638177714991, -74.09468564966795], [4.580998209379693, -74.10310674090964], [4.578644441586253, -74.10817803016954], [4.576842702278899, -74.11440151197799], [4.576005473241663, -74.11947826414492], [4.575161824717403, -74.12257376835352], [4.574204972942876, -74.1236503831568], [4.569317620124276, -74.12555661974194], [4.570639631340208, -74.12839840761553], [4.570730700059492, -74.12960584375692], [4.56749469733532, -74.13751850985804], [4.567133394219476, -74.14018190380962], [4.569360092943138, -74.14000276090397], [4.569718018440523, -74.1391992506461], [4.57081833590829, -74.13944717410645]]	Portal Tunal	Corferias
9	4 H	4 - Héroes → Portal Sur - Jfk Coop. F	#3b82f6	[[4.596965712329363, -74.16958002374835], [4.597023495135248, -74.17063667741361], [4.596582056965576, -74.17076930460487], [4.5961320456700685, -74.1697304051414], [4.595724157306866, -74.16539580773075], [4.596389017260354, -74.15438049290015], [4.595579299416156, -74.15185045245023], [4.5949744157424846, -74.14671774382316], [4.595579939912979, -74.14140548418992], [4.593689928648466, -74.13142676070498], [4.593480791855978, -74.12844444781578], [4.593919437902667, -74.12218576065617], [4.59458007467855, -74.11863053812189], [4.595879302344186, -74.11407604495379], [4.598191432644763, -74.10880344030647], [4.598064964100961, -74.10745130696213], [4.601927904391434, -74.10223084617252], [4.606410074348512, -74.09770430396807], [4.606955854592375, -74.09761875512051], [4.6088493432914275, -74.09618602968517], [4.62686556369744, -74.08117563539484], [4.628403705282858, -74.08037303078594], [4.631579185198004, -74.07969572125751], [4.657131779842471, -74.07765430021524], [4.664187252291408, -74.07583462621841], [4.665323405261012, -74.07529771840959], [4.672905221277141, -74.06872511877873], [4.674198534829711, -74.06847262171365], [4.675090859558298, -74.07030038220394], [4.675773390918859, -74.0705207986027], [4.674161814802863, -74.06788755427714], [4.666805339926743, -74.06159712456446], [4.666657550387707, -74.06092969794912], [4.667639287935253, -74.06030606269162]]	Héroes	Portal Sur - Jfk Coop. F
10	4 P	4 - Portal Sur - Jfk Coop. F → Héroes	#3b82f6	[[4.668062784583186, -74.06043622586965], [4.666816820282907, -74.06078664071013], [4.666739248057428, -74.06138052604649], [4.674249888555856, -74.06784878396182], [4.675891813045534, -74.07053424114574], [4.6751810894455685, -74.07045150576997], [4.67431982891554, -74.06912778175521], [4.673153066887865, -74.06878004310204], [4.6654547794240395, -74.07550260816784], [4.658710519019149, -74.07746671226325], [4.65419807160293, -74.07809605580216], [4.634357704276537, -74.07949980335557], [4.629594836783032, -74.0800972483057], [4.627719973611194, -74.08074503931088], [4.607008268565429, -74.09761461824792], [4.606740553191618, -74.09807399480947], [4.605543975658791, -74.09871176716206], [4.602209166906499, -74.10207093406386], [4.598163032892752, -74.10745411738218], [4.598255051978691, -74.10894372422918], [4.596312441846158, -74.11316884944488], [4.594860013142867, -74.11788784838218], [4.5940839638736115, -74.12171906024001], [4.593595201616311, -74.12771828209962], [4.593712877737775, -74.13103753013085], [4.595693779572254, -74.14162123358591], [4.595084266942093, -74.14667969077098], [4.5956496025894635, -74.15192581926094], [4.596520904560812, -74.15467360403966], [4.5958489363172905, -74.16237020500165], [4.595851852314768, -74.16646639504502], [4.596090061383656, -74.16753741833483], [4.596809410694754, -74.16801872530881], [4.596965712329363, -74.16958002374835]]	Portal Sur - Jfk Coop. F	Héroes
11	5 C	5 - Calle 22 → Portal Américas	#3b82f6	[[4.629424299662244, -74.17295489999033], [4.629900699592794, -74.17214070044419], [4.631253500391105, -74.17283010031434], [4.6304886001688415, -74.17477900009439], [4.627304400310127, -74.1733487995511], [4.6290328003703145, -74.16959369988159], [4.640299399622115, -74.15639810033485], [4.635814400170659, -74.15385429979835], [4.633463499713844, -74.15149769988962], [4.632640000165037, -74.15027859986287], [4.631359399709467, -74.14940819963111], [4.6307605998813015, -74.14862500033519], [4.631343099621838, -74.14717569979723], [4.627357300124359, -74.10644189999397], [4.603687717091747, -74.08001466904376], [4.597186600771198, -74.0846481895853], [4.599059434580081, -74.08762675739547], [4.598881222817342, -74.08769596864292], [4.597424141122422, -74.0856219878351], [4.5971262811643125, -74.08458217012834], [4.603454893557014, -74.07990756564075], [4.602327655576733, -74.0781460368926], [4.6032344037123245, -74.07922614918135]]	Calle 22	Portal Américas
12	5 P	5 - Portal Américas → Calle 22	#3b82f6	[[4.603231899688338, -74.07922069960154], [4.627369699561059, -74.10636469995929], [4.631099200394474, -74.14316479991126], [4.632043600316754, -74.14921229981589], [4.63346179994221, -74.15112209971011], [4.636304999945604, -74.15396120032189], [4.64078839999732, -74.15630360003514], [4.634849400182095, -74.16270479997104], [4.629386800180527, -74.16922590038216], [4.627429299614453, -74.17327050017623], [4.628836900067816, -74.17397000001881], [4.629424299662244, -74.17295489999033]]	Portal Américas	Calle 22
119	S41	SL41 - Bicentenario → San Mateo - Cc Unisur	#3b82f6	[[4.593574178184346, -74.08207342106165], [4.595073880566912, -74.0811466630315], [4.595938294329783, -74.08311537283454], [4.597521059197729, -74.08543117426181], [4.603827329964592, -74.09433110812796], [4.60682058383578, -74.09788420284325], [4.605543975658791, -74.09871176716206], [4.602589489554706, -74.10164166223721], [4.598104123826998, -74.10755043928997], [4.598255051978691, -74.10894372422918], [4.595904369260862, -74.11433322792692], [4.594428713446053, -74.1199179239749], [4.59371197893965, -74.12528321562073], [4.5936564803922, -74.13034656066964], [4.595693779572254, -74.14162123358591], [4.595084266942093, -74.14667969077098], [4.5956496025894635, -74.15192581926094], [4.596504501361817, -74.15438838621219], [4.5958489363172905, -74.16237020500165], [4.59574369394623, -74.1686291766147], [4.59697932179456, -74.17683346288554], [4.596900529910171, -74.18221600318564], [4.594876691643363, -74.18769581758346], [4.585959253368491, -74.20559013679949]]	Bicentenario	San Mateo - Cc Unisur
16	7 P	7-1 - Polo - Fincomercio → Portal Suba	#3b82f6	[[4.670927291975161, -74.06488903895263], [4.674472168302799, -74.06808894581015], [4.67593125607697, -74.0703334060792], [4.675464888351912, -74.07058971643633], [4.674402204164456, -74.06919690995754], [4.673765005842928, -74.06879342062412], [4.673851280640545, -74.0684436829583], [4.674562431379567, -74.06845961679818], [4.682859912214676, -74.06300561397103], [4.6837588790634275, -74.06277457294448], [4.68791242345096, -74.06477965730342], [4.6914271183041345, -74.06599630838214], [4.696659070064943, -74.06894674667777], [4.701401636448559, -74.07047499899127], [4.705621812814769, -74.07089764313321], [4.711991427208578, -74.07223942966819], [4.719076753661951, -74.07397366200469], [4.720439494693572, -74.07465742361053], [4.729562816829254, -74.07461194497878], [4.732449679052661, -74.07509907086892], [4.732935898693024, -74.07555865889218], [4.733132404680272, -74.07714206105697], [4.734469667391834, -74.07957577473499], [4.73724529704848, -74.08286370669641], [4.738477596052789, -74.08644528320427], [4.741135272699933, -74.08910809810189], [4.744607419129662, -74.09352040556095], [4.747844903353785, -74.09416990384808], [4.748432613832138, -74.09456411042716], [4.748008973737608, -74.0949339683064], [4.746356652143765, -74.09454947772927]]	Polo - Fincomercio	Portal Suba
17	8 G	8 - Guatoque - Veraguas → Terminal	#3b82f6	[[4.768835115729735, -74.04374838467254], [4.753252602218065, -74.04655199284204], [4.74830837418837, -74.04696344467625], [4.6584718962593135, -74.0620926506548], [4.6558451739281645, -74.06261403812414], [4.653239808934983, -74.06395325266102], [4.651060507659577, -74.06443852099859], [4.6217648768343675, -74.0697293383729], [4.615269332278973, -74.0729474595791], [4.614559330568535, -74.07366733563761], [4.613149038101542, -74.07401499335212], [4.609165637640525, -74.07608048779261], [4.5971734847160866, -74.08464084741699], [4.603995782351729, -74.0945564878347]]	Guatoque - Veraguas	Terminal
18	8 T	8 - Terminal → Guatoque - Veraguas	#3b82f6	[[4.604040606837478, -74.09494597478908], [4.597418165389471, -74.08562594041125], [4.597129280868713, -74.08457165320992], [4.6089218697943615, -74.07607653016443], [4.621798713918134, -74.06961080061319], [4.651256654647612, -74.06431430433359], [4.653102098703329, -74.06389893329337], [4.6559077548480605, -74.06244329941313], [4.665349838448041, -74.06080923720118], [4.666322817754939, -74.0608608820482], [4.667217780244975, -74.06037675434187], [4.746647749262824, -74.04713649368482], [4.75103139173862, -74.04669252876946], [4.761706511026106, -74.044500117117], [4.768735134225234, -74.04339112375006]]	Terminal	Guatoque - Veraguas
19	A52	AG52 - Portal Sur - Jfk Coop. F → Flores - Areandina	#3b82f6	[[4.597584794683853, -74.16887156957264], [4.597702633324067, -74.17038339828906], [4.59647697865707, -74.17072248567402], [4.5961320456700685, -74.1697304051414], [4.595724157306866, -74.16539580773075], [4.596389017260354, -74.15438049290015], [4.595579299416156, -74.15185045245023], [4.5949744157424846, -74.14671774382316], [4.595579939912979, -74.14140548418992], [4.593689928648466, -74.13142676070498], [4.593480791855978, -74.12844444781578], [4.593919437902667, -74.12218576065617], [4.59458007467855, -74.11863053812189], [4.595879302344186, -74.11407604495379], [4.598191432644763, -74.10880344030647], [4.598036461655582, -74.10750311914788], [4.601927904391434, -74.10223084617252], [4.606410074348512, -74.09770430396807], [4.606955854592375, -74.09761875512051], [4.6088493432914275, -74.09618602968517], [4.62686556369744, -74.08117563539484], [4.628403705282858, -74.08037303078594], [4.631579185198004, -74.07969572125751], [4.657131779842471, -74.07765430021524], [4.664187252291408, -74.07583462621841], [4.665323405261012, -74.07529771840959], [4.672905221277141, -74.06872511877873], [4.674198534829711, -74.06847262171365], [4.675090859558298, -74.07030038220394], [4.675807035146901, -74.07046160031909], [4.674161814802863, -74.06788755427714], [4.665749463914765, -74.06093681414455], [4.656267117981496, -74.06250634191126], [4.654942380045104, -74.06309748028366]]	Portal Sur - Jfk Coop. F	Flores - Areandina
20	A60	AF60 - Portal Américas → Calle 76 - San Felipe	#3b82f6	[[4.629121436567219, -74.17271355212245], [4.629624376711751, -74.17196767528584], [4.6306033941716205, -74.17254980003362], [4.629468266657426, -74.17442865536167], [4.627313758861262, -74.17338992402593], [4.628262089847539, -74.17090065168013], [4.629674737783908, -74.16871421797087], [4.6403199088749965, -74.15636192828423], [4.635793581106857, -74.15387989827799], [4.633393700383487, -74.15145644016528], [4.6325663883025845, -74.15018348456677], [4.631366817383568, -74.14942969579998], [4.63074378661054, -74.14860146465678], [4.631336158233134, -74.14720230095068], [4.6273400370049655, -74.10637145169832], [4.612057534829835, -74.08948653844956], [4.603744908204575, -74.07981415866941], [4.6089218697943615, -74.07607653016443], [4.621798713918134, -74.06961080061319], [4.651256654647612, -74.06431430433359], [4.653102098703329, -74.06389893329337], [4.6559077548480605, -74.06244329941313], [4.662526591820684, -74.0613148333714]]	Portal Américas	Calle 76 - San Felipe
21	A61	AZ61 - Tibanica - Primavera → Polo	#3b82f6	[[4.607018528356535, -74.20539730035703], [4.6076559121385, -74.2044746538635], [4.613265323359243, -74.20064265932147], [4.613506415432236, -74.19980174584511], [4.613057518748459, -74.19751037400732], [4.613166260151323, -74.19502858014977], [4.6155694096701865, -74.19245914725464], [4.616469824839893, -74.18991217758378], [4.618324749046196, -74.1875865427363], [4.619212910027287, -74.18348329324685], [4.621498097921411, -74.18199174479862], [4.625762230796704, -74.17711968994095], [4.628075667942307, -74.17130694364694], [4.629373379844785, -74.16911023328976], [4.6403199088749965, -74.15636192828423], [4.635793581106857, -74.15387989827799], [4.633393700383487, -74.15145644016528], [4.6325663883025845, -74.15018348456677], [4.631366817383568, -74.14942969579998], [4.63074378661054, -74.14860146465678], [4.631336158233134, -74.14720230095068], [4.6273015310585714, -74.106270586831], [4.620811983868491, -74.09932748274319], [4.603744908204575, -74.07981415866941], [4.6089218697943615, -74.07607653016443], [4.620208523975073, -74.07023290898987], [4.6222706766759805, -74.0694849733031], [4.651256654647612, -74.06431430433359], [4.653102098703329, -74.06389893329337], [4.6559077548480605, -74.06244329941313], [4.66539014428212, -74.06080341577254], [4.666734669754676, -74.06146885281443], [4.670927291975161, -74.06488903895263]]	Tibanica - Primavera	Polo
23	B11	BG11 - Portal Sur - Jfk Coop. F → Terminal	#3b82f6	[[4.5973043536167655, -74.16956052031018], [4.59734201079705, -74.17054969133393], [4.596374475961839, -74.17064691182293], [4.595724157306866, -74.16539580773075], [4.596389017260354, -74.15438049290015], [4.595579299416156, -74.15185045245023], [4.5949744157424846, -74.14671774382316], [4.595579939912979, -74.14140548418992], [4.593689928648466, -74.13142676070498], [4.593480791855978, -74.12844444781578], [4.593919437902667, -74.12218576065617], [4.59458007467855, -74.11863053812189], [4.595879302344186, -74.11407604495379], [4.598191432644763, -74.10880344030647], [4.598004852048046, -74.10757507744003], [4.601927904391434, -74.10223084617252], [4.606410074348512, -74.09770430396807], [4.606955854592375, -74.09761875512051], [4.6088493432914275, -74.09618602968517], [4.62686556369744, -74.08117563539484], [4.6288483119468635, -74.08020062898498], [4.631278416033105, -74.07972501237957], [4.657131779842471, -74.07765430021524], [4.664187252291408, -74.07583462621841], [4.665323405261012, -74.07529771840959], [4.672905221277141, -74.06872511877873], [4.674198534829711, -74.06847262171365], [4.675090859558298, -74.07030038220394], [4.675773390918859, -74.0705207986027], [4.674161814802863, -74.06788755427714], [4.666912632002514, -74.0617303958431], [4.666586654882108, -74.06106788073168], [4.667298994163129, -74.06036477791338], [4.746647749262824, -74.04713649368482], [4.75103139173862, -74.04669252876946], [4.761706511026106, -74.044500117117], [4.768896179189474, -74.04336734729479]]	Portal Sur - Jfk Coop. F	Terminal
1	B12	BG12 - Portal Sur - Jfk Coop. F → Portal Norte-Unicervantes	#3b82f6	[[4.5970209786208835, -74.17020539542864], [4.5969364277409905, -74.17073677612275], [4.596260652845869, -74.17044168369979], [4.595754458956238, -74.16627837891492], [4.59574264468938, -74.16277099508221], [4.596403882694173, -74.1546363793718], [4.595579299416156, -74.15185045245023], [4.5949744157424846, -74.14671774382316], [4.595579939912979, -74.14140548418992], [4.593689928648466, -74.13142676070498], [4.593480791855978, -74.12844444781578], [4.593919437902667, -74.12218576065617], [4.59458007467855, -74.11863053812189], [4.595879302344186, -74.11407604495379], [4.598191432644763, -74.10880344030647], [4.598004852048046, -74.10757507744003], [4.601927904391434, -74.10223084617252], [4.606410074348512, -74.09770430396807], [4.606955854592375, -74.09761875512051], [4.6088493432914275, -74.09618602968517], [4.62686556369744, -74.08117563539484], [4.6288483119468635, -74.08020062898498], [4.631278416033105, -74.07972501237957], [4.657131779842471, -74.07765430021524], [4.664571363677734, -74.07568516415087], [4.665441358578245, -74.07521073714909], [4.672191860696144, -74.0694109590859], [4.674132535950516, -74.06682399858475], [4.678509595030083, -74.05906440797398], [4.679822405350211, -74.05871045473917], [4.680382462744018, -74.05823966429999], [4.746647749262824, -74.04713649368482], [4.75103139173862, -74.04669252876946], [4.756061966948459, -74.04557123179082], [4.7563669471209185, -74.04570709907624], [4.75517502814047, -74.0461418849384]]	Portal Sur - Jfk Coop. F	Portal Norte-Unicervantes
24	B12GS	BG12 - General Santander → Portal Norte-Unicervantes	#3b82f6	[[4.593493565130467, -74.12906255711383], [4.593919437902667, -74.12218576065617], [4.59458007467855, -74.11863053812189], [4.595879302344186, -74.11407604495379], [4.598191432644763, -74.10880344030647], [4.598064964100961, -74.10745130696213], [4.601927904391434, -74.10223084617252], [4.606410074348512, -74.09770430396807], [4.606955854592375, -74.09761875512051], [4.6088493432914275, -74.09618602968517], [4.627140500312349, -74.08098976470644], [4.629026293098947, -74.0801425928004], [4.631278416033105, -74.07972501237957], [4.657131779842471, -74.07765430021524], [4.664571363677734, -74.07568516415087], [4.665441358578245, -74.07521073714909], [4.672191860696144, -74.0694109590859], [4.674132535950516, -74.06682399858475], [4.678509595030083, -74.05906440797398], [4.679822405350211, -74.05871045473917], [4.680382462744018, -74.05823966429999], [4.746647749262824, -74.04713649368482], [4.75103139173862, -74.04669252876946], [4.756061966948459, -74.04557123179082], [4.7563669471209185, -74.04570709907624], [4.75517502814047, -74.0461418849384]]	General Santander	Portal Norte-Unicervantes
25	B13	BH13 - Portal Tunal → Portal Norte-Unicervantes	#3b82f6	[[4.567913624846648, -74.13945545518045], [4.569406600432383, -74.13908730806781], [4.572165248833575, -74.13977999838376], [4.572242857208472, -74.14002472774703], [4.570162698374316, -74.13954234529945], [4.569324351035362, -74.14009497079292], [4.567091139241642, -74.14028671011484], [4.567224147768592, -74.13739344188771], [4.570560891915608, -74.12928367434871], [4.570464802184865, -74.12831526584387], [4.569217662963769, -74.125475468141], [4.570742744063883, -74.12470645671885], [4.57406283421603, -74.12364977117964], [4.575059096577215, -74.1226769221529], [4.576893668907382, -74.11375399985563], [4.578758179670209, -74.10753592829992], [4.581523857778301, -74.10188562617847], [4.585756784289869, -74.09435211193274], [4.591507075354379, -74.08965102044563], [4.592156188123543, -74.0885404205843], [4.595221965126757, -74.08602584960704], [4.608659061101457, -74.07624321212981], [4.620208523975073, -74.07023290898987], [4.6222706766759805, -74.0694849733031], [4.651256654647612, -74.06431430433359], [4.653102098703329, -74.06389893329337], [4.6559077548480605, -74.06244329941313], [4.665349838448041, -74.06080923720118], [4.666322817754939, -74.0608608820482], [4.667217780244975, -74.06037675434187], [4.746647749262824, -74.04713649368482], [4.75103139173862, -74.04669252876946], [4.756061966948459, -74.04557123179082], [4.7563669471209185, -74.04570709907624], [4.756114851898784, -74.04596760843891], [4.753852990421221, -74.04638710083539]]	Portal Tunal	Portal Norte-Unicervantes
26	B16	BK16 - Portal ElDorado – C.C. → Terminal	#3b82f6	[[4.681996337606659, -74.12148580465116], [4.683310872091614, -74.1224574548576], [4.684625860951709, -74.12436900043339], [4.682902388012874, -74.12255142934907], [4.6790941795894865, -74.11988366661863], [4.635679912627938, -74.0919809364334], [4.634541144919187, -74.0904794894319], [4.632426560035747, -74.08490500570582], [4.630004151912684, -74.08297799328142], [4.631901574191316, -74.08006298888066], [4.631823713868916, -74.07983388194151], [4.628363514735904, -74.08044191468704], [4.6269774026853225, -74.08113487771578], [4.624951014168974, -74.08282349714455], [4.627140500312349, -74.08098976470644], [4.630156318346199, -74.07989274708848], [4.6558893352321835, -74.07780780598308], [4.664571363677734, -74.07568516415087], [4.665441358578245, -74.07521073714909], [4.672191860696144, -74.0694109590859], [4.674132535950516, -74.06682399858475], [4.678509595030083, -74.05906440797398], [4.679822405350211, -74.05871045473917], [4.680382462744018, -74.05823966429999], [4.746647749262824, -74.04713649368482], [4.75103139173862, -74.04669252876946], [4.761706511026106, -74.044500117117], [4.768896179189474, -74.04336734729479]]	Portal ElDorado – C.C.	Terminal
27	B18	BL18 - Portal 20 De Julio → Terminal	#3b82f6	[[4.565505606328036, -74.09750110887455], [4.565106750913975, -74.09806333208368], [4.568920220278964, -74.10070408490918], [4.575896745550824, -74.09440015322492], [4.585273213649085, -74.08752762705707], [4.594888910256215, -74.08110455478035], [4.599048519373036, -74.08776521814269], [4.597418165389471, -74.08562594041125], [4.597166028945726, -74.08452208242602], [4.6089218697943615, -74.07607653016443], [4.621901642218458, -74.06958202331481], [4.651256654647612, -74.06431430433359], [4.653102098703329, -74.06389893329337], [4.6559077548480605, -74.06244329941313], [4.665349838448041, -74.06080923720118], [4.666322817754939, -74.0608608820482], [4.667217780244975, -74.06037675434187], [4.746647749262824, -74.04713649368482], [4.75103139173862, -74.04669252876946], [4.761706511026106, -74.044500117117], [4.768896179189474, -74.04336734729479]]	Portal 20 De Julio	Terminal
28	B23	BK23 - Portal ElDorado – C.C. → Alcalá – Colegio S. To	#3b82f6	[[4.68239830016975, -74.12181449983132], [4.683457600280776, -74.12266040012463], [4.684593099726065, -74.1243815002657], [4.682857699780649, -74.1225234995969], [4.678691399548876, -74.11955359956204], [4.635940099981286, -74.09219289993031], [4.634573800267524, -74.09053930007919], [4.632738999626174, -74.0855311995944], [4.631980100084662, -74.0843848995572], [4.614465400295789, -74.07219850019004], [4.61382070010982, -74.07233420020339], [4.614585700046169, -74.07346450034802], [4.615516000303887, -74.07268989971344], [4.621743400074289, -74.06962129960948], [4.652674999587396, -74.06399399975814], [4.656688099884269, -74.06227549959513], [4.723144799777346, -74.05108900040112], [4.721128600092727, -74.05151609988802]]	Portal ElDorado – C.C.	Alcalá – Colegio S. To
29	B26	BF26 - Portal Américas → Alcalá – Colegio S. To	#3b82f6	[[4.62973469864654, -74.17312662326033], [4.630130381997535, -74.17233235708149], [4.630545055798032, -74.17243898977398], [4.629468266657426, -74.17442865536167], [4.627290321061076, -74.17331584771549], [4.628920227841676, -74.1697919270972], [4.6403199088749965, -74.15636192828423], [4.635793581106857, -74.15387989827799], [4.633393700383487, -74.15145644016528], [4.6325663883025845, -74.15018348456677], [4.631366817383568, -74.14942969579998], [4.63074378661054, -74.14860146465678], [4.631336158233134, -74.14720230095068], [4.627317088360696, -74.10630393398654], [4.626025523929491, -74.1051585508304], [4.613642451602689, -74.09127633035266], [4.6117751886625244, -74.09255250208093], [4.612330228736773, -74.09312169998645], [4.614027768561252, -74.09190830319365], [4.62686556369744, -74.08117563539484], [4.6288483119468635, -74.08020062898498], [4.631579185198004, -74.07969572125751], [4.657131779842471, -74.07765430021524], [4.664187252291408, -74.07583462621841], [4.665323405261012, -74.07529771840959], [4.672905221277141, -74.06872511877873], [4.674198534829711, -74.06847262171365], [4.675090859558298, -74.07030038220394], [4.675773390918859, -74.0705207986027], [4.674161814802863, -74.06788755427714], [4.666912632002514, -74.0617303958431], [4.666586654882108, -74.06106788073168], [4.667298994163129, -74.06036477791338], [4.721260099046561, -74.05139382012443]]	Portal Américas	Alcalá – Colegio S. To
30	B27	BH27 - Portal Tunal → Portal Norte-Unicervantes	#3b82f6	[[4.568340441860588, -74.13931759380844], [4.569406600432383, -74.13908730806781], [4.572267784377389, -74.13992299034778], [4.5720769810477, -74.14008868605018], [4.570162698374316, -74.13954234529945], [4.569324351035362, -74.14009497079292], [4.567091139241642, -74.14028671011484], [4.567224147768592, -74.13739344188771], [4.570560891915608, -74.12928367434871], [4.570464802184865, -74.12831526584387], [4.5692264011371195, -74.12545126176326], [4.57406283421603, -74.12364977117964], [4.575059096577215, -74.1226769221529], [4.576893668907382, -74.11375399985563], [4.578758179670209, -74.10753592829992], [4.581523857778301, -74.10188562617847], [4.585756784289869, -74.09435211193274], [4.591507075354379, -74.08965102044563], [4.592156188123543, -74.0885404205843], [4.595221965126757, -74.08602584960704], [4.608659061101457, -74.07624321212981], [4.620208523975073, -74.07023290898987], [4.6222706766759805, -74.0694849733031], [4.651256654647612, -74.06431430433359], [4.653102098703329, -74.06389893329337], [4.6559077548480605, -74.06244329941313], [4.665349838448041, -74.06080923720118], [4.666322817754939, -74.0608608820482], [4.667217780244975, -74.06037675434187], [4.746647749262824, -74.04713649368482], [4.75103139173862, -74.04669252876946], [4.756061966948459, -74.04557123179082], [4.7563669471209185, -74.04570709907624], [4.756114851898784, -74.04596760843891], [4.753852990421221, -74.04638710083539]]	Portal Tunal	Portal Norte-Unicervantes
13	6 C	6 - Calle 76 → Portal 80	#3b82f6	[[4.709514724074647, -74.11085767756161], [4.709178380076782, -74.11080438888614], [4.709186688981931, -74.1101145794128], [4.7081966997956135, -74.11049112784586], [4.706247892763692, -74.10810221939379], [4.703033236302945, -74.10112498497568], [4.698931830848297, -74.09578828132736], [4.694615061923916, -74.087889534095], [4.692945063584985, -74.08629385323832], [4.679356860751896, -74.07552650267185], [4.674514855105282, -74.068277269562], [4.671945540578497, -74.06583055960775], [4.665749463914765, -74.06093681414455], [4.663570563757222, -74.06123922007586]]	Calle 76	Portal 80
31	B28	BF28 - Portal Américas → Portal Norte-Unicervantes	#3b82f6	[[4.6300161276628895, -74.17253682588314], [4.6302584862397635, -74.17229322175302], [4.6306034339658355, -74.17258340893869], [4.629468266657426, -74.17442865536167], [4.627303864860471, -74.17336288393261], [4.628262089847539, -74.17090065168013], [4.629674737783908, -74.16871421797087], [4.6403199088749965, -74.15636192828423], [4.635793581106857, -74.15387989827799], [4.633393700383487, -74.15145644016528], [4.6325663883025845, -74.15018348456677], [4.631366817383568, -74.14942969579998], [4.63074378661054, -74.14860146465678], [4.631336158233134, -74.14720230095068], [4.627317088360696, -74.10630393398654], [4.626025523929491, -74.1051585508304], [4.613642451602689, -74.09127633035266], [4.6117751886625244, -74.09255250208093], [4.612330228736773, -74.09312169998645], [4.614027768561252, -74.09190830319365], [4.62686556369744, -74.08117563539484], [4.629026293098947, -74.0801425928004], [4.631579185198004, -74.07969572125751], [4.657131779842471, -74.07765430021524], [4.66488492984811, -74.07553471791884], [4.672398529730875, -74.06918072294708], [4.6743546195925205, -74.06646004408127], [4.678509595030083, -74.05906440797398], [4.679822405350211, -74.05871045473917], [4.680382462744018, -74.05823966429999], [4.746647749262824, -74.04713649368482], [4.75103139173862, -74.04669252876946], [4.7551315942331, -74.04576575556007]]	Portal Américas	Portal Norte-Unicervantes
32	B46	BS46 - San Mateo - Cc Unisur → Portal Norte-Unicervantes	#3b82f6	[[4.5859693973922795, -74.20533562403654], [4.595147171611442, -74.18692046530035], [4.596796173781552, -74.18214009486182], [4.596875939703918, -74.17695366418518], [4.5961498728005346, -74.17179287635317], [4.595724157306866, -74.16539580773075], [4.596403882694173, -74.1546363793718], [4.595579299416156, -74.15185045245023], [4.5949744157424846, -74.14671774382316], [4.595579939912979, -74.14140548418992], [4.593519887699878, -74.13033646179073], [4.593649641667033, -74.12503224793387], [4.594141100953519, -74.12080557310811], [4.595879302344186, -74.11407604495379], [4.598191432644763, -74.10880344030647], [4.598036461655582, -74.10750311914788], [4.601927904391434, -74.10223084617252], [4.606410074348512, -74.09770430396807], [4.606955854592375, -74.09761875512051], [4.6088493432914275, -74.09618602968517], [4.62686556369744, -74.08117563539484], [4.6286497522463215, -74.08027323262274], [4.631579185198004, -74.07969572125751], [4.657131779842471, -74.07765430021524], [4.66488492984811, -74.07553471791884], [4.672398529730875, -74.06918072294708], [4.6743546195925205, -74.06646004408127], [4.678509595030083, -74.05906440797398], [4.679822405350211, -74.05871045473917], [4.680325849905693, -74.05825856161609], [4.746647749262824, -74.04713649368482], [4.75103139173862, -74.04669252876946], [4.756061966948459, -74.04557123179082], [4.7563669471209185, -74.04570709907624], [4.75517502814047, -74.0461418849384]]	San Mateo - Cc Unisur	Portal Norte-Unicervantes
33	B50	BC50 - Portal Suba → Calle 161	#3b82f6	[[4.746286695070587, -74.09379471067032], [4.748204628739811, -74.0942772164251], [4.748406459352994, -74.09467775863445], [4.747940122552702, -74.0949318429091], [4.745688095415575, -74.09438804042897], [4.745168089567935, -74.09371802442774], [4.744588549160088, -74.09358914282382], [4.741679060175236, -74.09027074182879], [4.741017982863296, -74.08912356921431], [4.738399546967068, -74.0865237334126], [4.737085691726516, -74.08268765185389], [4.7358090341472385, -74.08153757900615], [4.7344340068332285, -74.07960642572644], [4.733853409829906, -74.07818378699655], [4.732927085155439, -74.07699897434603], [4.732794339812506, -74.07575895141167], [4.732160549380724, -74.07512706202934], [4.729416365561778, -74.07472579955498], [4.720387833763533, -74.0747504857274], [4.719117216429935, -74.07405521058661], [4.7131127936457204, -74.07259347677801], [4.705310202141907, -74.0709423512746], [4.7013822937711085, -74.07052277315738], [4.69626210564154, -74.06894003487342], [4.691208732285409, -74.06599715378671], [4.687538255043666, -74.06474166124354], [4.683740994010885, -74.06287829369846], [4.682997250374541, -74.06304252495208], [4.674521968755826, -74.06858388132184], [4.674428843957143, -74.06917579144422], [4.675450191094897, -74.0705468158663], [4.67579941844292, -74.070312381112], [4.6743993303890585, -74.0681315536112], [4.666912632002514, -74.0617303958431], [4.666584946404148, -74.0611350903531], [4.667298994163129, -74.06036477791338], [4.740562677987021, -74.04817214738007]]	Portal Suba	Calle 161
34	B55	BD55 - Portal 80 → Toberin - Foundever	#3b82f6	[[4.709761971291279, -74.11105749080457], [4.709544190879022, -74.111159647034], [4.709178380076782, -74.11080438888614], [4.709186688981931, -74.1101145794128], [4.7081966997956135, -74.11049112784586], [4.706247892763692, -74.10810221939379], [4.703033236302945, -74.10112498497568], [4.698931830848297, -74.09578828132736], [4.694615061923916, -74.087889534095], [4.692945063584985, -74.08629385323832], [4.679356860751896, -74.07552650267185], [4.6743993303890585, -74.0681315536112], [4.666912632002514, -74.0617303958431], [4.666584946404148, -74.0611350903531], [4.6667778995658855, -74.0607804308877], [4.667298994163129, -74.06036477791338], [4.668930524865121, -74.0600832693778], [4.746647749262824, -74.04713649368482], [4.75103139173862, -74.04669252876946], [4.761706511026106, -74.044500117117], [4.768929895008355, -74.04336037498803]]	Portal 80	Toberin - Foundever
14	6 P	6 - Portal 80 → Calle 76	#3b82f6	[[4.663707767074303, -74.0611090280071], [4.66539014428212, -74.06080341577254], [4.66607236295832, -74.06101435021054], [4.67227159462989, -74.06599096677455], [4.674663003409887, -74.06833531272302], [4.679432145172107, -74.07545313217109], [4.694574627755958, -74.08769297927385], [4.699128591029129, -74.09589765409861], [4.703246381337566, -74.10132389675921], [4.706651087728201, -74.1085085567133], [4.7083692299457685, -74.11045480580036], [4.7098016022832345, -74.10976420194308], [4.709514724074647, -74.11085767756161]]	Portal 80	Calle 76
35	B72	BH72 - Portal Usme → Toberin - Foundever	#3b82f6	[[4.531728676989255, -74.11941808905812], [4.529854702129559, -74.11917609771452], [4.532642209069388, -74.11913515206273], [4.534656371427002, -74.12064872759571], [4.536424877040395, -74.12009095322921], [4.537670944038629, -74.12044933166246], [4.555869007896142, -74.12139566518668], [4.557792278020145, -74.12215261807609], [4.5591397143782695, -74.12327409536242], [4.562229202981739, -74.12482727636679], [4.563639802009734, -74.12500085779341], [4.566250480343319, -74.12646306979565], [4.5673599713602755, -74.12644711431938], [4.570742744063883, -74.12470645671885], [4.57406283421603, -74.12364977117964], [4.574973463028038, -74.12281652019651], [4.576012589314872, -74.11888735215072], [4.576893668907382, -74.11375399985563], [4.578758179670209, -74.10753592829992], [4.585313506290349, -74.09502574106567], [4.586404393916708, -74.09374073298663], [4.591507075354379, -74.08965102044563], [4.592156188123543, -74.0885404205843], [4.5969313210939395, -74.08472584211214], [4.604935674301867, -74.09579350326369], [4.6064564951114715, -74.09758456191926], [4.606882308935937, -74.09764591995184], [4.62686556369744, -74.08117563539484], [4.6286497522463215, -74.08027323262274], [4.631579185198004, -74.07969572125751], [4.657131779842471, -74.07765430021524], [4.66488492984811, -74.07553471791884], [4.672398529730875, -74.06918072294708], [4.6743546195925205, -74.06646004408127], [4.678509595030083, -74.05906440797398], [4.679822405350211, -74.05871045473917], [4.680325849905693, -74.05825856161609], [4.745589813790551, -74.04732053868028]]	Portal Usme	Toberin - Foundever
36	B74	BJ74 - Universidades – CityU → Portal Norte-Unicervantes	#3b82f6	[[4.60517313964801, -74.06696865843541], [4.60645908735294, -74.06640189210013], [4.608725396170721, -74.06628687428037], [4.610207394287298, -74.06858244978758], [4.612164175815758, -74.07074929377832], [4.615674757124453, -74.07250954408282], [4.620626335923363, -74.07002825820923], [4.6222706766759805, -74.0694849733031], [4.651256654647612, -74.06431430433359], [4.653102098703329, -74.06389893329337], [4.656261702727943, -74.0623681548112], [4.665349838448041, -74.06080923720118], [4.666322817754939, -74.0608608820482], [4.667217780244975, -74.06037675434187], [4.723311957875814, -74.05098147674568], [4.746647749262824, -74.04713649368482], [4.75103139173862, -74.04669252876946], [4.754117366382433, -74.04596963639696]]	Universidades – CityU	Portal Norte-Unicervantes
37	B75	BH75 - Portal Usme → Portal Norte-Unicervantes	#3b82f6	[[4.531288833644123, -74.11937455709928], [4.529854702129559, -74.11917609771452], [4.532642209069388, -74.11913515206273], [4.534656371427002, -74.12064872759571], [4.536424877040395, -74.12009095322921], [4.537670944038629, -74.12044933166246], [4.555869007896142, -74.12139566518668], [4.557792278020145, -74.12215261807609], [4.5591397143782695, -74.12327409536242], [4.562134961132119, -74.12478471423765], [4.563639802009734, -74.12500085779341], [4.566610733838098, -74.1265399313398], [4.5673599713602755, -74.12644711431938], [4.570742744063883, -74.12470645671885], [4.5741035142376525, -74.12362834585652], [4.57522002724806, -74.12223989665264], [4.576893668907382, -74.11375399985563], [4.578758179670209, -74.10753592829992], [4.581523857778301, -74.10188562617847], [4.585756784289869, -74.09435211193274], [4.591507075354379, -74.08965102044563], [4.592156188123543, -74.0885404205843], [4.595221965126757, -74.08602584960704], [4.608659061101457, -74.07624321212981], [4.621380453693151, -74.06974408120959], [4.651256654647612, -74.06431430433359], [4.653102098703329, -74.06389893329337], [4.6559077548480605, -74.06244329941313], [4.665349838448041, -74.06080923720118], [4.666322817754939, -74.0608608820482], [4.667217780244975, -74.06037675434187], [4.746647749262824, -74.04713649368482], [4.75103139173862, -74.04669252876946], [4.756061966948459, -74.04557123179082], [4.7563669471209185, -74.04570709907624], [4.756114851898784, -74.04596760843891], [4.754154217168458, -74.04633344255355]]	Portal Usme	Portal Norte-Unicervantes
38	C15	CH15 - Portal Tunal → Portal Suba	#3b82f6	[[4.571468308549396, -74.13960594986555], [4.572242857208472, -74.14002472774703], [4.570162698374316, -74.13954234529945], [4.569324351035362, -74.14009497079292], [4.567091139241642, -74.14028671011484], [4.567224147768592, -74.13739344188771], [4.570560891915608, -74.12928367434871], [4.570464802184865, -74.12831526584387], [4.569217662963769, -74.125475468141], [4.570742744063883, -74.12470645671885], [4.57406283421603, -74.12364977117964], [4.575059096577215, -74.1226769221529], [4.576893668907382, -74.11375399985563], [4.578758179670209, -74.10753592829992], [4.581523857778301, -74.10188562617847], [4.5857149142325655, -74.09440900970833], [4.591507075354379, -74.08965102044563], [4.592156188123543, -74.0885404205843], [4.595221965126757, -74.08602584960704], [4.608659061101457, -74.07624321212981], [4.620208523975073, -74.07023290898987], [4.6222706766759805, -74.0694849733031], [4.651256654647612, -74.06431430433359], [4.653102098703329, -74.06389893329337], [4.6559077548480605, -74.06244329941313], [4.66539014428212, -74.06080341577254], [4.667091766177778, -74.06175022999946], [4.674144595676954, -74.06774412007682], [4.67593125607697, -74.0703334060792], [4.675609229725067, -74.07059691996982], [4.675133145240243, -74.0704072040425], [4.674402204164456, -74.06919690995754], [4.67381138134583, -74.06885150744169], [4.673851280640545, -74.0684436829583], [4.674562431379567, -74.06845961679818], [4.682859912214676, -74.06300561397103], [4.683923180863904, -74.0628045225836], [4.68791242345096, -74.06477965730342], [4.6914271183041345, -74.06599630838214], [4.696659070064943, -74.06894674667777], [4.701401636448559, -74.07047499899127], [4.705621812814769, -74.07089764313321], [4.711991427208578, -74.07223942966819], [4.719076753661951, -74.07397366200469], [4.720439494693572, -74.07465742361053], [4.729562816829254, -74.07461194497878], [4.732517837727458, -74.07512855978317], [4.7329582243822275, -74.0756097213495], [4.733132404680272, -74.07714206105697], [4.734469667391834, -74.07957577473499], [4.73724529704848, -74.08286370669641], [4.738477596052789, -74.08644528320427], [4.741135272699933, -74.08910809810189], [4.744607419129662, -74.09352040556095], [4.747844903353785, -74.09416990384808], [4.748432613832138, -74.09456411042716], [4.747940122552702, -74.0949318429091], [4.745698185616638, -74.09439047621602]]	Portal Tunal	Portal Suba
39	C17	CH17 - Portal Usme → Portal Suba	#3b82f6	[[4.532301218373254, -74.11947494088155], [4.529854702129559, -74.11917609771452], [4.532642209069388, -74.11913515206273], [4.534656371427002, -74.12064872759571], [4.536424877040395, -74.12009095322921], [4.537670944038629, -74.12044933166246], [4.555869007896142, -74.12139566518668], [4.557792278020145, -74.12215261807609], [4.5591397143782695, -74.12327409536242], [4.562229202981739, -74.12482727636679], [4.563639802009734, -74.12500085779341], [4.566250480343319, -74.12646306979565], [4.5673599713602755, -74.12644711431938], [4.570742744063883, -74.12470645671885], [4.57406283421603, -74.12364977117964], [4.574973463028038, -74.12281652019651], [4.576012589314872, -74.11888735215072], [4.576893668907382, -74.11375399985563], [4.578758179670209, -74.10753592829992], [4.585313506290349, -74.09502574106567], [4.586404393916708, -74.09374073298663], [4.591507075354379, -74.08965102044563], [4.592156188123543, -74.0885404205843], [4.596897619959847, -74.08474268780948], [4.604935674301867, -74.09579350326369], [4.6064564951114715, -74.09758456191926], [4.606882308935937, -74.09764591995184], [4.62686556369744, -74.08117563539484], [4.628403705282858, -74.08037303078594], [4.631579185198004, -74.07969572125751], [4.657131779842471, -74.07765430021524], [4.664187252291408, -74.07583462621841], [4.665441358578245, -74.07521073714909], [4.6728284803624796, -74.0687709188406], [4.674562431379567, -74.06845961679818], [4.683446702688285, -74.06277934287245], [4.68414182535017, -74.0628802042482], [4.68791242345096, -74.06477965730342], [4.6914271183041345, -74.06599630838214], [4.696659070064943, -74.06894674667777], [4.701401636448559, -74.07047499899127], [4.705621812814769, -74.07089764313321], [4.711991427208578, -74.07223942966819], [4.719076753661951, -74.07397366200469], [4.720439494693572, -74.07465742361053], [4.729562816829254, -74.07461194497878], [4.732517837727458, -74.07512855978317], [4.7329582243822275, -74.0756097213495], [4.733132404680272, -74.07714206105697], [4.734469667391834, -74.07957577473499], [4.73724529704848, -74.08286370669641], [4.738477596052789, -74.08644528320427], [4.741135272699933, -74.08910809810189], [4.744607419129662, -74.09352040556095], [4.747554898242515, -74.09409955443003]]	Portal Usme	Portal Suba
40	C19	CF19 - Banderas → Portal Suba	#3b82f6	[[4.629142448571736, -74.17267037499137], [4.629624376711751, -74.17196767528584], [4.6306033941716205, -74.17254980003362], [4.629468266657426, -74.17442865536167], [4.627313758861262, -74.17338992402593], [4.628262089847539, -74.17090065168013], [4.629674737783908, -74.16871421797087], [4.6403199088749965, -74.15636192828423], [4.635793581106857, -74.15387989827799], [4.633393700383487, -74.15145644016528], [4.6325663883025845, -74.15018348456677], [4.631366817383568, -74.14942969579998], [4.63074378661054, -74.14860146465678], [4.631336158233134, -74.14720230095068], [4.627317088360696, -74.10630393398654], [4.626025523929491, -74.1051585508304], [4.6037391207745495, -74.08003328268109], [4.603779223390881, -74.07975093394242], [4.608659061101457, -74.07624321212981], [4.621901642218458, -74.06958202331481], [4.651256654647612, -74.06431430433359], [4.653102098703329, -74.06389893329337], [4.6559077548480605, -74.06244329941313], [4.66539014428212, -74.06080341577254], [4.667091766177778, -74.06175022999946], [4.674144595676954, -74.06774412007682], [4.67593125607697, -74.0703334060792], [4.675775936159337, -74.07057258337494], [4.675133145240243, -74.0704072040425], [4.674402204164456, -74.06919690995754], [4.673765005842928, -74.06879342062412], [4.673851280640545, -74.0684436829583], [4.674562431379567, -74.06845961679818], [4.682859912214676, -74.06300561397103], [4.6837588790634275, -74.06277457294448], [4.68791242345096, -74.06477965730342], [4.6914271183041345, -74.06599630838214], [4.696659070064943, -74.06894674667777], [4.701401636448559, -74.07047499899127], [4.705621812814769, -74.07089764313321], [4.711991427208578, -74.07223942966819], [4.719076753661951, -74.07397366200469], [4.720439494693572, -74.07465742361053], [4.729562816829254, -74.07461194497878], [4.732517837727458, -74.07512855978317], [4.7329582243822275, -74.0756097213495], [4.733132404680272, -74.07714206105697], [4.734469667391834, -74.07957577473499], [4.73724529704848, -74.08286370669641], [4.738477596052789, -74.08644528320427], [4.741135272699933, -74.08910809810189], [4.744607419129662, -74.09352040556095], [4.74840211523636, -74.09445120717852], [4.748198429185366, -74.09488329972534], [4.747567163201657, -74.09484178315886]]	Banderas	Portal Suba
41	C25	CL25 - Portal 20 De Julio → Portal Suba	#3b82f6	[[4.565902199246758, -74.09658204971144], [4.566461520368082, -74.09593613063636], [4.566719099166977, -74.0960050928483], [4.565079513176948, -74.09802695438364], [4.568920220278964, -74.10070408490918], [4.575896745550824, -74.09440015322492], [4.585414049769909, -74.08742931833778], [4.594957835084958, -74.08109699682444], [4.595990946249704, -74.08320280706592], [4.603827329964592, -74.09433110812796], [4.606349191910096, -74.09746990288153], [4.606882308935937, -74.09764591995184], [4.62686556369744, -74.08117563539484], [4.628403705282858, -74.08037303078594], [4.631579185198004, -74.07969572125751], [4.657131779842471, -74.07765430021524], [4.664187252291408, -74.07583462621841], [4.665441358578245, -74.07521073714909], [4.6728284803624796, -74.0687709188406], [4.674562431379567, -74.06845961679818], [4.681952307733121, -74.0635718643898], [4.683643629298416, -74.06276899718033], [4.68791242345096, -74.06477965730342], [4.6914271183041345, -74.06599630838214], [4.696659070064943, -74.06894674667777], [4.701401636448559, -74.07047499899127], [4.705621812814769, -74.07089764313321], [4.711991427208578, -74.07223942966819], [4.719076753661951, -74.07397366200469], [4.720439494693572, -74.07465742361053], [4.729562816829254, -74.07461194497878], [4.732517837727458, -74.07512855978317], [4.7329582243822275, -74.0756097213495], [4.733132404680272, -74.07714206105697], [4.734469667391834, -74.07957577473499], [4.73724529704848, -74.08286370669641], [4.738477596052789, -74.08644528320427], [4.741135272699933, -74.08910809810189], [4.744607419129662, -74.09352040556095], [4.746957771379576, -74.09395396264001]]	Portal 20 De Julio	Portal Suba
42	C30	CG30 - Portal Sur - Jfk Coop. F → Portal Suba	#3b82f6	[[4.5969136601583935, -74.16899104366998], [4.597034894283531, -74.1705788591936], [4.596669651577903, -74.1707866946062], [4.596214003628818, -74.17023641565815], [4.595724157306866, -74.16539580773075], [4.596389017260354, -74.15438049290015], [4.595579299416156, -74.15185045245023], [4.5949744157424846, -74.14671774382316], [4.595579939912979, -74.14140548418992], [4.593689928648466, -74.13142676070498], [4.593480791855978, -74.12844444781578], [4.593919437902667, -74.12218576065617], [4.59458007467855, -74.11863053812189], [4.595879302344186, -74.11407604495379], [4.598191432644763, -74.10880344030647], [4.598004852048046, -74.10757507744003], [4.601927904391434, -74.10223084617252], [4.606410074348512, -74.09770430396807], [4.606955854592375, -74.09761875512051], [4.6088493432914275, -74.09618602968517], [4.627465305873426, -74.08082585626315], [4.629189447141343, -74.0800933138398], [4.631278416033105, -74.07972501237957], [4.657131779842471, -74.07765430021524], [4.664187252291408, -74.07583462621841], [4.665441358578245, -74.07521073714909], [4.6728284803624796, -74.0687709188406], [4.674562431379567, -74.06845961679818], [4.682859912214676, -74.06300561397103], [4.6837588790634275, -74.06277457294448], [4.68791242345096, -74.06477965730342], [4.6914271183041345, -74.06599630838214], [4.696659070064943, -74.06894674667777], [4.701401636448559, -74.07047499899127], [4.705621812814769, -74.07089764313321], [4.711991427208578, -74.07223942966819], [4.719076753661951, -74.07397366200469], [4.720439494693572, -74.07465742361053], [4.729562816829254, -74.07461194497878], [4.732517837727458, -74.07512855978317], [4.7329582243822275, -74.0756097213495], [4.733132404680272, -74.07714206105697], [4.734469667391834, -74.07957577473499], [4.73724529704848, -74.08286370669641], [4.738477596052789, -74.08644528320427], [4.741135272699933, -74.08910809810189], [4.744607419129662, -74.09352040556095], [4.748016783757263, -74.09422241742134]]	Portal Sur - Jfk Coop. F	Portal Suba
43	C50	BC50 - Calle 161 → Portal Suba	#3b82f6	[[4.743263286413705, -74.04782362420517], [4.668948052583868, -74.0602456257231], [4.667000379893916, -74.06068116004496], [4.6666292767792275, -74.06114483940706], [4.674249888555856, -74.06784878396182], [4.676196825701269, -74.07091199536565], [4.67592347528078, -74.07050016737334], [4.675133145240243, -74.0704072040425], [4.674402204164456, -74.06919690995754], [4.673765005842928, -74.06879342062412], [4.673851280640545, -74.0684436829583], [4.674562431379567, -74.06845961679818], [4.682859912214676, -74.06300561397103], [4.6837588790634275, -74.06277457294448], [4.68791242345096, -74.06477965730342], [4.6914271183041345, -74.06599630838214], [4.696659070064943, -74.06894674667777], [4.701401636448559, -74.07047499899127], [4.705621812814769, -74.07089764313321], [4.711991427208578, -74.07223942966819], [4.719076753661951, -74.07397366200469], [4.720439494693572, -74.07465742361053], [4.729562816829254, -74.07461194497878], [4.732449679052661, -74.07509907086892], [4.732935898693024, -74.07555865889218], [4.733132404680272, -74.07714206105697], [4.734469667391834, -74.07957577473499], [4.73724529704848, -74.08286370669641], [4.738477596052789, -74.08644528320427], [4.741135272699933, -74.08910809810189], [4.744607419129662, -74.09352040556095], [4.746286695070587, -74.09379471067032]]	Calle 161	Portal Suba
44	C73	CJ73 - Universidades – CityU → Portal Suba	#3b82f6	[[4.604585058104628, -74.06727783973636], [4.60645908735294, -74.06640189210013], [4.608774015084996, -74.06631548332544], [4.610207394287298, -74.06858244978758], [4.612316056068223, -74.0708831893579], [4.615124995284933, -74.07254801100575], [4.6239692979314375, -74.07891291920026], [4.631746262144339, -74.08405558191653], [4.632749552412936, -74.08533500424448], [4.634734636603903, -74.09057461190847], [4.636018552292641, -74.09220295492952], [4.634553774037823, -74.09050545896174], [4.632426560035747, -74.08490500570582], [4.630004151912684, -74.08297799328142], [4.631901574191316, -74.08006298888066], [4.631823713868916, -74.07983388194151], [4.628363514735904, -74.08044191468704], [4.6269774026853225, -74.08113487771578], [4.624951014168974, -74.08282349714455], [4.627140500312349, -74.08098976470644], [4.630156318346199, -74.07989274708848], [4.6558893352321835, -74.07780780598308], [4.664187252291408, -74.07583462621841], [4.665441358578245, -74.07521073714909], [4.6728284803624796, -74.0687709188406], [4.674562431379567, -74.06845961679818], [4.682859912214676, -74.06300561397103], [4.683923180863904, -74.0628045225836], [4.68791242345096, -74.06477965730342], [4.6914271183041345, -74.06599630838214], [4.696659070064943, -74.06894674667777], [4.701401636448559, -74.07047499899127], [4.705621812814769, -74.07089764313321], [4.711991427208578, -74.07223942966819], [4.719076753661951, -74.07397366200469], [4.720439494693572, -74.07465742361053], [4.729562816829254, -74.07461194497878], [4.732517837727458, -74.07512855978317], [4.7329582243822275, -74.0756097213495], [4.733132404680272, -74.07714206105697], [4.734469667391834, -74.07957577473499], [4.73724529704848, -74.08286370669641], [4.738477596052789, -74.08644528320427], [4.741135272699933, -74.08910809810189], [4.744607419129662, -74.09352040556095], [4.747844903353785, -74.09416990384808], [4.748432613832138, -74.09456411042716], [4.748008973737608, -74.0949339683064], [4.746962223295258, -74.09469570739218]]	Universidades – CityU	Portal Suba
45	C84	CM84 - Calle 72 → Etb Tibabuyes	#3b82f6	[[4.657869228121104, -74.05830531971996], [4.657080521818554, -74.05884027968179], [4.65487204160578, -74.05541485016695], [4.658774933269133, -74.05286208412741], [4.664071035354274, -74.06095311077848], [4.66539014428212, -74.06080341577254], [4.66607236295832, -74.06101435021054], [4.6719645519677, -74.06572822322389], [4.67473054924297, -74.06842544840693], [4.67593125607697, -74.0703334060792], [4.675464888351912, -74.07058971643633], [4.674402204164456, -74.06919690995754], [4.673765005842928, -74.06879342062412], [4.673851280640545, -74.0684436829583], [4.674562431379567, -74.06845961679818], [4.682859912214676, -74.06300561397103], [4.6837588790634275, -74.06277457294448], [4.68791242345096, -74.06477965730342], [4.6914271183041345, -74.06599630838214], [4.696659070064943, -74.06894674667777], [4.701401636448559, -74.07047499899127], [4.705621812814769, -74.07089764313321], [4.711991427208578, -74.07223942966819], [4.719076753661951, -74.07397366200469], [4.720439494693572, -74.07465742361053], [4.729562816829254, -74.07461194497878], [4.732517837727458, -74.07512855978317], [4.7329582243822275, -74.0756097213495], [4.733132404680272, -74.07714206105697], [4.734469667391834, -74.07957577473499], [4.73724529704848, -74.08286370669641], [4.738477596052789, -74.08644528320427], [4.741135272699933, -74.08910809810189], [4.744607419129662, -74.09352040556095], [4.748144473845458, -74.09425556543445], [4.748915523066634, -74.09488435426701], [4.7469728210490825, -74.09638475004323], [4.751013521918187, -74.10450029158449], [4.750451368964891, -74.10364203734274]]	Calle 72	Etb Tibabuyes
47	D20	DH20 - Portal Usme → Portal 80	#3b82f6	[[4.532000004906323, -74.11970137338977], [4.530726959232266, -74.11958731971174], [4.5298614058881315, -74.11914315798242], [4.532642209069388, -74.11913515206273], [4.534656371427002, -74.12064872759571], [4.536424877040395, -74.12009095322921], [4.537670944038629, -74.12044933166246], [4.555869007896142, -74.12139566518668], [4.557792278020145, -74.12215261807609], [4.5591397143782695, -74.12327409536242], [4.562134961132119, -74.12478471423765], [4.563639802009734, -74.12500085779341], [4.566610733838098, -74.1265399313398], [4.5673599713602755, -74.12644711431938], [4.570742744063883, -74.12470645671885], [4.57406283421603, -74.12364977117964], [4.57522002724806, -74.12223989665264], [4.576893668907382, -74.11375399985563], [4.578758179670209, -74.10753592829992], [4.581523857778301, -74.10188562617847], [4.5857149142325655, -74.09440900970833], [4.591507075354379, -74.08965102044563], [4.592156188123543, -74.0885404205843], [4.595221965126757, -74.08602584960704], [4.608659061101457, -74.07624321212981], [4.621901642218458, -74.06958202331481], [4.651256654647612, -74.06431430433359], [4.653102098703329, -74.06389893329337], [4.6559077548480605, -74.06244329941313], [4.66539014428212, -74.06080341577254], [4.667091766177778, -74.06175022999946], [4.674249888555856, -74.06784878396182], [4.679432145172107, -74.07545313217109], [4.694574627755958, -74.08769297927385], [4.699128591029129, -74.09589765409861], [4.703246381337566, -74.10132389675921], [4.706651087728201, -74.1085085567133], [4.708343057172405, -74.1104417703421], [4.710069027233626, -74.109524074196], [4.710106318152942, -74.11032030233918]]	Portal Usme	Portal 80
48	D21	DH21 - Portal Tunal → Portal 80	#3b82f6	[[4.572063696263249, -74.13975139210076], [4.572189291775942, -74.14008068985882], [4.570162698374316, -74.13954234529945], [4.569324351035362, -74.14009497079292], [4.567091139241642, -74.14028671011484], [4.567224147768592, -74.13739344188771], [4.570560891915608, -74.12928367434871], [4.570464802184865, -74.12831526584387], [4.5692264011371195, -74.12545126176326], [4.57406283421603, -74.12364977117964], [4.575059096577215, -74.1226769221529], [4.576893668907382, -74.11375399985563], [4.578758179670209, -74.10753592829992], [4.581523857778301, -74.10188562617847], [4.585550222607108, -74.09464689589836], [4.591507075354379, -74.08965102044563], [4.592156188123543, -74.0885404205843], [4.596897619959847, -74.08474268780948], [4.604935674301867, -74.09579350326369], [4.6064564951114715, -74.09758456191926], [4.606882308935937, -74.09764591995184], [4.62686556369744, -74.08117563539484], [4.628403705282858, -74.08037303078594], [4.631579185198004, -74.07969572125751], [4.657131779842471, -74.07765430021524], [4.663403056412177, -74.076044181768], [4.665323405261012, -74.07529771840959], [4.6728284803624796, -74.0687709188406], [4.673940223334603, -74.06839477498015], [4.674325762697447, -74.06859099861093], [4.675148280272799, -74.07036887095258], [4.676011553564877, -74.07044838618978], [4.679432145172107, -74.07545313217109], [4.694574627755958, -74.08769297927385], [4.699128591029129, -74.09589765409861], [4.703246381337566, -74.10132389675921], [4.706651087728201, -74.1085085567133], [4.7083692299457685, -74.11045480580036], [4.7098016022832345, -74.10976420194308], [4.709514724074647, -74.11085767756161]]	Portal Tunal	Portal 80
49	D22	DG22 - Portal Sur - Jfk Coop. F → Portal 80	#3b82f6	[[4.597363785954997, -74.17019376475581], [4.59734201079705, -74.17054969133393], [4.596751222786298, -74.17078870315842], [4.596269118602185, -74.17046549972122], [4.595754458956238, -74.16627837891492], [4.59574264468938, -74.16277099508221], [4.596389017260354, -74.15438049290015], [4.595579299416156, -74.15185045245023], [4.5949744157424846, -74.14671774382316], [4.595539322253807, -74.14093583573506], [4.593689928648466, -74.13142676070498], [4.593480791855978, -74.12844444781578], [4.593919437902667, -74.12218576065617], [4.59458007467855, -74.11863053812189], [4.595879302344186, -74.11407604495379], [4.598191432644763, -74.10880344030647], [4.598004852048046, -74.10757507744003], [4.601927904391434, -74.10223084617252], [4.606410074348512, -74.09770430396807], [4.606955854592375, -74.09761875512051], [4.6088493432914275, -74.09618602968517], [4.627140500312349, -74.08098976470644], [4.629026293098947, -74.0801425928004], [4.631278416033105, -74.07972501237957], [4.657131779842471, -74.07765430021524], [4.663755703436018, -74.07595095178276], [4.665441358578245, -74.07521073714909], [4.6728284803624796, -74.0687709188406], [4.67407680221128, -74.06840700826407], [4.675090859558298, -74.07030038220394], [4.675490656286373, -74.07055393298951], [4.676011553564877, -74.07044838618978], [4.679432145172107, -74.07545313217109], [4.694574627755958, -74.08769297927385], [4.699128591029129, -74.09589765409861], [4.703246381337566, -74.10132389675921], [4.706651087728201, -74.1085085567133], [4.708343057172405, -74.1104417703421], [4.709654022051328, -74.10972217656028], [4.709872845846606, -74.10987320498707], [4.709801079451881, -74.11040435225667]]	Portal Sur - Jfk Coop. F	Portal 80
50	D24	DJ24 - Universidades – CityU → Portal 80	#3b82f6	[[4.60517313964801, -74.06696865843541], [4.60645908735294, -74.06640189210013], [4.608725396170721, -74.06628687428037], [4.610207394287298, -74.06858244978758], [4.612164175815758, -74.07074929377832], [4.615674757124453, -74.07250954408282], [4.620626335923363, -74.07002825820923], [4.6222706766759805, -74.0694849733031], [4.651256654647612, -74.06431430433359], [4.653102098703329, -74.06389893329337], [4.656001677757906, -74.06242020598647], [4.665755539915392, -74.06085809693033], [4.671631290247573, -74.06544685339789], [4.674249888555856, -74.06784878396182], [4.679432145172107, -74.07545313217109], [4.694574627755958, -74.08769297927385], [4.699128591029129, -74.09589765409861], [4.703246381337566, -74.10132389675921], [4.706651087728201, -74.1085085567133], [4.7083692299457685, -74.11045480580036], [4.710156022776005, -74.10953940363873], [4.710073021805929, -74.11054367324267]]	Universidades – CityU	Portal 80
51	D55	BD55 - Toberin - Foundever → Portal 80	#3b82f6	[[4.767816460820672, -74.04392102624895], [4.753252602218065, -74.04655199284204], [4.74830837418837, -74.04696344467625], [4.6826166147436386, -74.0579395276804], [4.668948052583868, -74.0602456257231], [4.666745422204389, -74.06085664417226], [4.6666292767792275, -74.06114483940706], [4.667011028989088, -74.06168992060269], [4.674472168302799, -74.06808894581015], [4.679432145172107, -74.07545313217109], [4.694574627755958, -74.08769297927385], [4.699128591029129, -74.09589765409861], [4.703246381337566, -74.10132389675921], [4.706651087728201, -74.1085085567133], [4.7083692299457685, -74.11045480580036], [4.710156022776005, -74.10953940363873], [4.709761971291279, -74.11105749080457]]	Toberin - Foundever	Portal 80
52	D81	DL81 - Portal 20 De Julio → Puente De Guadua	#3b82f6	[[4.565130732688146, -74.09792521542862], [4.568920220278964, -74.10070408490918], [4.575896745550824, -74.09440015322492], [4.585414049769909, -74.08742931833778], [4.594860449725006, -74.08111430103305], [4.613954710237172, -74.0696176996528], [4.618332097603343, -74.06835697885617], [4.622833624046064, -74.0664951363677], [4.631596169795807, -74.0640830492982], [4.636171182923385, -74.06363088976542], [4.645269403442837, -74.06130217036366], [4.650272537832876, -74.05846871537109], [4.651886456715304, -74.05698944486122], [4.655773054287157, -74.05493695827171], [4.658774933269133, -74.05286208412741], [4.664071035354274, -74.06095311077848], [4.66539014428212, -74.06080341577254], [4.66607236295832, -74.06101435021054], [4.67227159462989, -74.06599096677455], [4.674663003409887, -74.06833531272302], [4.679432145172107, -74.07545313217109], [4.694574627755958, -74.08769297927385], [4.699128591029129, -74.09589765409861], [4.703246381337566, -74.10132389675921], [4.706277964920457, -74.10788911744326], [4.708194800879539, -74.11033539306845], [4.7122666372732205, -74.11437242318516], [4.721652969432421, -74.12105492170038], [4.72623825333078, -74.12492406327262], [4.72734782926617, -74.1252055597716], [4.727458549235169, -74.12564760197611], [4.727092506784604, -74.12578457269217], [4.7263474243840555, -74.12518280324548]]	Portal 20 De Julio	Puente De Guadua
53	D81CV	DL81 - Portal 20 De Julio → Puente De Guadua	#3b82f6	[[4.565130732688146, -74.09792521542862], [4.568920220278964, -74.10070408490918], [4.575896745550824, -74.09440015322492], [4.585414049769909, -74.08742931833778], [4.594860449725006, -74.08111430103305], [4.613954710237172, -74.0696176996528], [4.616279075256761, -74.06891007623965], [4.613838825264451, -74.06975748858157], [4.612507750979083, -74.07069449217951], [4.613262379232353, -74.07138206375265], [4.615674757124453, -74.07250954408282], [4.622036145228348, -74.06945596996322], [4.632394548940596, -74.06757571285898], [4.631434975925529, -74.06414847413748], [4.636898965150539, -74.0634823467244], [4.645269403442837, -74.06130217036366], [4.650272537832876, -74.05846871537109], [4.651886456715304, -74.05698944486122], [4.655773054287157, -74.05493695827171], [4.658774933269133, -74.05286208412741], [4.664071035354274, -74.06095311077848], [4.66539014428212, -74.06080341577254], [4.66607236295832, -74.06101435021054], [4.67227159462989, -74.06599096677455], [4.674663003409887, -74.06833531272302], [4.679432145172107, -74.07545313217109], [4.694574627755958, -74.08769297927385], [4.699128591029129, -74.09589765409861], [4.703246381337566, -74.10132389675921], [4.706277964920457, -74.10788911744326], [4.708194800879539, -74.11033539306845], [4.7122666372732205, -74.11437242318516], [4.721652969432421, -74.12105492170038], [4.72623825333078, -74.12492406327262], [4.72734782926617, -74.1252055597716], [4.727458549235169, -74.12564760197611], [4.727092506784604, -74.12578457269217], [4.7263474243840555, -74.12518280324548]]	Portal 20 De Julio	Puente De Guadua
54	E32	EF32 - Portal Américas → Calle 75 - Zona M	#3b82f6	[[4.629402610415557, -74.17214258994744], [4.629737040552963, -74.17199107096934], [4.6306033941716205, -74.17254980003362], [4.629504503394827, -74.17440760834988], [4.627313758861262, -74.17338992402593], [4.628262089847539, -74.17090065168013], [4.629674737783908, -74.16871421797087], [4.6403199088749965, -74.15636192828423], [4.635793581106857, -74.15387989827799], [4.633393700383487, -74.15145644016528], [4.6325663883025845, -74.15018348456677], [4.631366817383568, -74.14942969579998], [4.63074378661054, -74.14860146465678], [4.631336158233134, -74.14720230095068], [4.627317088360696, -74.10630393398654], [4.626025523929491, -74.1051585508304], [4.613642451602689, -74.09127633035266], [4.611753140811742, -74.09258809775095], [4.612330228736773, -74.09312169998645], [4.614027768561252, -74.09190830319365], [4.62686556369744, -74.08117563539484], [4.6288483119468635, -74.08020062898498], [4.631579185198004, -74.07969572125751], [4.657131779842471, -74.07765430021524], [4.664571363677734, -74.07568516415087], [4.669535048228908, -74.07171206241019]]	Portal Américas	Calle 75 - Zona M
22	B10	BD10 - Portal 80 → Portal Norte-Unicervantes	#3b82f6	[[4.709761971291279, -74.11105749080457], [4.709544190879022, -74.111159647034], [4.709178380076782, -74.11080438888614], [4.709186688981931, -74.1101145794128], [4.7081966997956135, -74.11049112784586], [4.706247892763692, -74.10810221939379], [4.703033236302945, -74.10112498497568], [4.698931830848297, -74.09578828132736], [4.694615061923916, -74.087889534095], [4.692945063584985, -74.08629385323832], [4.679356860751896, -74.07552650267185], [4.6743993303890585, -74.0681315536112], [4.666912632002514, -74.0617303958431], [4.666657550387707, -74.06092969794912], [4.667298994163129, -74.06036477791338], [4.668930524865121, -74.0600832693778], [4.746647749262824, -74.04713649368482], [4.75103139173862, -74.04669252876946], [4.754117366382433, -74.04596963639696]]	Portal 80	Portal Norte-Unicervantes
55	E42	ES42 - San Mateo - Cc Unisur → 7 De Agosto	#3b82f6	[[4.5859693973922795, -74.20533562403654], [4.595147171611442, -74.18692046530035], [4.596772305119332, -74.18238209421445], [4.596875939703918, -74.17695366418518], [4.5961498728005346, -74.17179287635317], [4.595724157306866, -74.16539580773075], [4.596389017260354, -74.15438049290015], [4.595579299416156, -74.15185045245023], [4.5949744157424846, -74.14671774382316], [4.595539322253807, -74.14093583573506], [4.593689928648466, -74.13142676070498], [4.593480791855978, -74.12844444781578], [4.593919437902667, -74.12218576065617], [4.59458007467855, -74.11863053812189], [4.595879302344186, -74.11407604495379], [4.598191432644763, -74.10880344030647], [4.598064964100961, -74.10745130696213], [4.601927904391434, -74.10223084617252], [4.606410074348512, -74.09770430396807], [4.606955854592375, -74.09761875512051], [4.6088493432914275, -74.09618602968517], [4.627140500312349, -74.08098976470644], [4.629026293098947, -74.0801425928004], [4.631278416033105, -74.07972501237957], [4.6569892154285855, -74.07766963981658]]	San Mateo - Cc Unisur	7 De Agosto
56	E48	ES48 - San Mateo - CC Unisur → CAD	#3b82f6	[[4.586624715970561, -74.20398949503833], [4.595147171611442, -74.18692046530035], [4.596772305119332, -74.18238209421445], [4.596875939703918, -74.17695366418518], [4.5961498728005346, -74.17179287635317], [4.595724157306866, -74.16539580773075], [4.596389017260354, -74.15438049290015], [4.595579299416156, -74.15185045245023], [4.5949744157424846, -74.14671774382316], [4.595539322253807, -74.14093583573506], [4.593689928648466, -74.13142676070498], [4.593480791855978, -74.12844444781578], [4.593919437902667, -74.12218576065617], [4.595524834656535, -74.11514302859257], [4.598191432644763, -74.10880344030647], [4.598036461655582, -74.10750311914788], [4.602824677069617, -74.10121853856177], [4.606410074348512, -74.09770430396807], [4.606955854592375, -74.09761875512051], [4.6088493432914275, -74.09618602968517], [4.62372782720172, -74.08385809769212]]	San Mateo - CC Unisur	CAD
57	F19	CF19 - Portal Suba → Banderas	#3b82f6	[[4.747567163201657, -74.09484178315886], [4.745603377137542, -74.0943534396187], [4.745168089567935, -74.09371802442774], [4.744588549160088, -74.09358914282382], [4.741679060175236, -74.09027074182879], [4.741017982863296, -74.08912356921431], [4.738334873767325, -74.08644177502109], [4.737085691726516, -74.08268765185389], [4.7358090341472385, -74.08153757900615], [4.7344340068332285, -74.07960642572644], [4.733853409829906, -74.07818378699655], [4.73295539364275, -74.0770575650738], [4.732794339812506, -74.07575895141167], [4.732295305008535, -74.07519207270278], [4.729416365561778, -74.07472579955498], [4.720387833763533, -74.0747504857274], [4.719117216429935, -74.07405521058661], [4.7131127936457204, -74.07259347677801], [4.705310202141907, -74.0709423512746], [4.7013822937711085, -74.07052277315738], [4.69626210564154, -74.06894003487342], [4.691208732285409, -74.06599715378671], [4.687538255043666, -74.06474166124354], [4.683873335446734, -74.06289505792887], [4.682997250374541, -74.06304252495208], [4.674521968755826, -74.06858388132184], [4.674428843957143, -74.06917579144422], [4.675025296942951, -74.07019358765841], [4.675697347021765, -74.07055715398153], [4.675780734136334, -74.07027589057742], [4.674161814802863, -74.06788755427714], [4.666686772941709, -74.06154514842804], [4.665356400197325, -74.06088885535496], [4.65597706940334, -74.06257654884453], [4.653239808934983, -74.06395325266102], [4.651060507659577, -74.06443852099859], [4.622103319345311, -74.06962792595553], [4.615269332278973, -74.0729474595791], [4.614559330568535, -74.07366733563761], [4.613149038101542, -74.07401499335212], [4.608508376166009, -74.07647969608291], [4.603847838131868, -74.07997973624688], [4.627313579552838, -74.1062392442311], [4.631091038332002, -74.14316224955793], [4.632050321704991, -74.14923353006807], [4.633583600685365, -74.15126760766562], [4.636377035325909, -74.15402053064433], [4.640785634758352, -74.15626995338202], [4.629932551216428, -74.1684940917852], [4.6285334900104536, -74.17055204683581], [4.627384087331998, -74.17327378089402], [4.628528795569362, -74.17380452697466], [4.629142448571736, -74.17267037499137]]	Portal Suba	Banderas
58	F23	FJ23 - Las Aguas - Centro Colom → Portal Américas	#3b82f6	[[4.60261819004212, -74.06828033079022], [4.6027776667751334, -74.06798169192417], [4.602337256585371, -74.06759286888126], [4.601287793159957, -74.06850390420496], [4.600942948083383, -74.0690501213454], [4.60063503108867, -74.07103424658533], [4.600968437416418, -74.07254941496014], [4.602255193431433, -74.07473153607664], [4.602196042423042, -74.077655475808], [4.602588833845979, -74.07843195519771], [4.627313579552838, -74.1062392442311], [4.631091038332002, -74.14316224955793], [4.632050321704991, -74.14923353006807], [4.633583600685365, -74.15126760766562], [4.636377035325909, -74.15402053064433], [4.640785634758352, -74.15626995338202], [4.629932551216428, -74.1684940917852], [4.6285334900104536, -74.17055204683581], [4.627384087331998, -74.17327378089402], [4.6288647089098225, -74.17397344920164], [4.629732849830918, -74.17233690405918]]	Las Aguas - Centro Colom	Portal Américas
59	F23B	FJ23 - Las Aguas - Centro Colom → Portal Américas	#3b82f6	[[4.60261819004212, -74.06828033079022], [4.6027776667751334, -74.06798169192417], [4.602337256585371, -74.06759286888126], [4.601287793159957, -74.06850390420496], [4.600942948083383, -74.0690501213454], [4.60063503108867, -74.07103424658533], [4.600968437416418, -74.07254941496014], [4.602255193431433, -74.07473153607664], [4.602196042423042, -74.077655475808], [4.602588833845979, -74.07843195519771], [4.627313579552838, -74.1062392442311], [4.631366982660046, -74.14535036856579]]	Las Aguas - Centro Colom	Portal Américas
60	F26	BF26 - Alcalá – Colegio S. To → Portal Américas	#3b82f6	[[4.720964837351839, -74.05154505202654], [4.667000379893916, -74.06068116004496], [4.666631060170356, -74.06107141903749], [4.666931894771018, -74.06161350885196], [4.674249888555856, -74.06784878396182], [4.675891813045534, -74.07053424114574], [4.6751810894455685, -74.07045150576997], [4.67431982891554, -74.06912778175521], [4.673153066887865, -74.06878004310204], [4.6654547794240395, -74.07550260816784], [4.658710519019149, -74.07746671226325], [4.65419807160293, -74.07809605580216], [4.634357704276537, -74.07949980335557], [4.6287377415657405, -74.08029272036987], [4.626803066335313, -74.08126552761834], [4.624859553688402, -74.08321477814843], [4.612465135895915, -74.09351537233981], [4.613812786212451, -74.09510346796985], [4.61575960102949, -74.09348180634139], [4.627313579552838, -74.1062392442311], [4.631091038332002, -74.14316224955793], [4.632050321704991, -74.14923353006807], [4.633583600685365, -74.15126760766562], [4.636377035325909, -74.15402053064433], [4.640785634758352, -74.15626995338202], [4.635002362427812, -74.16255336727414], [4.629278254343465, -74.16937768675535], [4.627379999833699, -74.17324051316466], [4.629126095610687, -74.17413407463128], [4.62973469864654, -74.17312662326033]]	Alcalá – Colegio S. To	Portal Américas
61	F28	BF28 - Portal Norte-Unicervantes → Portal Américas	#3b82f6	[[4.7551315942331, -74.04576575556007], [4.756157759817044, -74.04556342577511], [4.756369042075075, -74.04575886179632], [4.753252602218065, -74.04655199284204], [4.74830837418837, -74.04696344467625], [4.680374278557316, -74.05829852306445], [4.678802018119951, -74.05911025659623], [4.6741878110854085, -74.0671956539544], [4.67289493320461, -74.06896512283252], [4.665250480880975, -74.07561929855538], [4.657194956686689, -74.0777705245529], [4.634357704276537, -74.07949980335557], [4.6287377415657405, -74.08029272036987], [4.626803066335313, -74.08126552761834], [4.624859553688402, -74.08321477814843], [4.6124898160797105, -74.0934869566979], [4.613812786212451, -74.09510346796985], [4.61575960102949, -74.09348180634139], [4.627313579552838, -74.1062392442311], [4.631091038332002, -74.14316224955793], [4.632050321704991, -74.14923353006807], [4.633583600685365, -74.15126760766562], [4.636377035325909, -74.15402053064433], [4.640785634758352, -74.15626995338202], [4.629932551216428, -74.1684940917852], [4.6285334900104536, -74.17055204683581], [4.627384087331998, -74.17327378089402], [4.629198678766219, -74.1741230713928], [4.6300161276628895, -74.17253682588314]]	Portal Norte-Unicervantes	Portal Américas
62	F32	EF32 - Calle 75 - Zona M → Portal Américas	#3b82f6	[[4.669479371219997, -74.07210318439441], [4.664767743925932, -74.07585277934383], [4.657447278976355, -74.07772785124408], [4.634357704276537, -74.07949980335557], [4.6287377415657405, -74.08029272036987], [4.626803066335313, -74.08126552761834], [4.624859553688402, -74.08321477814843], [4.6124561701886, -74.09353181479689], [4.613812786212451, -74.09510346796985], [4.61575960102949, -74.09348180634139], [4.627313579552838, -74.1062392442311], [4.631091038332002, -74.14316224955793], [4.632050321704991, -74.14923353006807], [4.633583600685365, -74.15126760766562], [4.636377035325909, -74.15402053064433], [4.640785634758352, -74.15626995338202], [4.629932551216428, -74.1684940917852], [4.6285334900104536, -74.17055204683581], [4.627404379231793, -74.17331307914372], [4.628528795569362, -74.17380452697466], [4.629402610415557, -74.17214258994744]]	Calle 75 - Zona M	Portal Américas
63	F51	FM51 - Museo Nacional → Portal Américas	#3b82f6	[[4.615019290356097, -74.06924258576369], [4.616293280558397, -74.06894232079487], [4.613838825264451, -74.06975748858157], [4.602314739044675, -74.07662799772078], [4.602196042423042, -74.077655475808], [4.60574152642701, -74.08219783163247], [4.627365691897363, -74.10638100490817], [4.631091038332002, -74.14316224955793], [4.632050321704991, -74.14923353006807], [4.633583600685365, -74.15126760766562], [4.636377035325909, -74.15402053064433], [4.640794239597, -74.15631554133708], [4.635002362427812, -74.16255336727414], [4.629278254343465, -74.16937768675535], [4.62737897083033, -74.17322639792948], [4.628737787589389, -74.17399140261719], [4.629175818642738, -74.1734659287633]]	Museo Nacional	Portal Américas
64	F60	AF60 - Calle 76 - San Felipe → Portal Américas	#3b82f6	[[4.662230485393831, -74.06146168079493], [4.65597706940334, -74.06257654884453], [4.653239808934983, -74.06395325266102], [4.651060507659577, -74.06443852099859], [4.6217648768343675, -74.0697293383729], [4.615269332278973, -74.0729474595791], [4.614559330568535, -74.07366733563761], [4.613149038101542, -74.07401499335212], [4.609563338585511, -74.07585484272778], [4.603831342232032, -74.07981883709576], [4.627365691897363, -74.10638100490817], [4.631091038332002, -74.14316224955793], [4.632050321704991, -74.14923353006807], [4.633583600685365, -74.15126760766562], [4.636377035325909, -74.15402053064433], [4.640794239597, -74.15631554133708], [4.630115226047879, -74.1682629004066], [4.6285334900104536, -74.17055204683581], [4.627384087331998, -74.17327378089402], [4.628528795569362, -74.17380452697466], [4.629121436567219, -74.17271355212245]]	Calle 76 - San Felipe	Portal Américas
65	F63	FZ63 - Tibanica - Primavera → Pradera - Plaza Central	#3b82f6	[[4.606674723981871, -74.20615797488422], [4.6076559121385, -74.2044746538635], [4.613265323359243, -74.20064265932147], [4.613506415432236, -74.19980174584511], [4.613057518748459, -74.19751037400732], [4.613166260151323, -74.19502858014977], [4.6155694096701865, -74.19245914725464], [4.616469824839893, -74.18991217758378], [4.618324749046196, -74.1875865427363], [4.6191673153846615, -74.18356382323019], [4.6197909860266035, -74.18289441682354], [4.621457111906193, -74.18193664334675], [4.62561501721017, -74.17728817229734], [4.628262089847539, -74.17090065168013], [4.629373379844785, -74.16911023328976], [4.640313280319129, -74.15645873068966], [4.640110948221265, -74.15612790040103], [4.639140445418232, -74.15589986217424], [4.635793581106857, -74.15387989827799], [4.633393700383487, -74.15145644016528], [4.6325663883025845, -74.15018348456677], [4.631366817383568, -74.14942969579998], [4.6307607201917, -74.1486605956008], [4.631336158233134, -74.14720230095068], [4.629724724236424, -74.1322219572242], [4.629042948040916, -74.12264544826941], [4.628419971059844, -74.11875717087345]]	Tibanica - Primavera	Pradera - Plaza Central
66	G11	BG11 - Terminal → Portal Sur - Jfk Coop. F	#3b82f6	[[4.768663373001986, -74.04377617736101], [4.753252602218065, -74.04655199284204], [4.74830837418837, -74.04696344467625], [4.667349125153399, -74.06057588716777], [4.666651178249882, -74.06099053561447], [4.666849728941105, -74.06152134816011], [4.674249888555856, -74.06784878396182], [4.675891813045534, -74.07053424114574], [4.6751810894455685, -74.07045150576997], [4.67431982891554, -74.06912778175521], [4.673153066887865, -74.06878004310204], [4.665555589851001, -74.07544195341802], [4.659705723399806, -74.0772556941347], [4.65419807160293, -74.07809605580216], [4.632058259661043, -74.0797512102283], [4.629019411054716, -74.08020696441541], [4.6269774026853225, -74.08113487771578], [4.624766069965036, -74.08329271667434], [4.607008268565429, -74.09761461824792], [4.606740553191618, -74.09807399480947], [4.605543975658791, -74.09871176716206], [4.602209166906499, -74.10207093406386], [4.598080590989566, -74.1076135653012], [4.598255051978691, -74.10894372422918], [4.596312441846158, -74.11316884944488], [4.594860013142867, -74.11788784838218], [4.5940839638736115, -74.12171906024001], [4.593595201616311, -74.12771828209962], [4.593712877737775, -74.13103753013085], [4.595693779572254, -74.14162123358591], [4.595076670143365, -74.14643375835243], [4.59561723956666, -74.15173084920373], [4.596504501361817, -74.15438838621219], [4.5958489363172905, -74.16237020500165], [4.595851852314768, -74.16646639504502], [4.596149507774525, -74.1676180068557], [4.597156627289787, -74.16822861667511], [4.5973043536167655, -74.16956052031018]]	Terminal	Portal Sur - Jfk Coop. F
67	G12	BG12 - Portal Norte-Unicervantes → Portal Sur - Jfk Coop. F	#3b82f6	[[4.75517502814047, -74.0461418849384], [4.74830837418837, -74.04696344467625], [4.680374278557316, -74.05829852306445], [4.678802018119951, -74.05911025659623], [4.674145307784814, -74.06726646824721], [4.6727779669248415, -74.06909688578624], [4.66564523112982, -74.07537559266856], [4.664767743925932, -74.07585277934383], [4.657194956686689, -74.0777705245529], [4.632058259661043, -74.0797512102283], [4.629019411054716, -74.08020696441541], [4.626803066335313, -74.08126552761834], [4.624766069965036, -74.08329271667434], [4.607008268565429, -74.09761461824792], [4.606740553191618, -74.09807399480947], [4.605543975658791, -74.09871176716206], [4.602209166906499, -74.10207093406386], [4.598080590989566, -74.1076135653012], [4.598255051978691, -74.10894372422918], [4.596312441846158, -74.11316884944488], [4.594860013142867, -74.11788784838218], [4.5940839638736115, -74.12171906024001], [4.593595201616311, -74.12771828209962], [4.593712877737775, -74.13103753013085], [4.595693779572254, -74.14162123358591], [4.595084266942093, -74.14667969077098], [4.5956496025894635, -74.15192581926094], [4.596520904560812, -74.15467360403966], [4.5958489363172905, -74.16237020500165], [4.595851852314768, -74.16646639504502], [4.596090061383656, -74.16753741833483], [4.596824299302312, -74.16806105265087], [4.5970209786208835, -74.17020539542864]]	Portal Norte-Unicervantes	Portal Sur - Jfk Coop. F
68	G12GS	BG12 - Portal Norte-Unicervantes → General Santander	#3b82f6	[[4.75517502814047, -74.0461418849384], [4.74830837418837, -74.04696344467625], [4.680374278557316, -74.05829852306445], [4.678802018119951, -74.05911025659623], [4.674145307784814, -74.06726646824721], [4.6727779669248415, -74.06909688578624], [4.66564523112982, -74.07537559266856], [4.664767743925932, -74.07585277934383], [4.657194956686689, -74.0777705245529], [4.634357704276537, -74.07949980335557], [4.629019411054716, -74.08020696441541], [4.627136534695425, -74.08103338616813], [4.624859553688402, -74.08321477814843], [4.607008268565429, -74.09761461824792], [4.606740553191618, -74.09807399480947], [4.605543975658791, -74.09871176716206], [4.602209166906499, -74.10207093406386], [4.598163032892752, -74.10745411738218], [4.598255051978691, -74.10894372422918], [4.595904369260862, -74.11433322792692], [4.594428713446053, -74.1199179239749], [4.59371197893965, -74.12528321562073], [4.593658158937471, -74.1300632165964]]	Portal Norte-Unicervantes	General Santander
69	G22	DG22 - Portal 80 → Portal Sur - Jfk Coop. F	#3b82f6	[[4.709801079451881, -74.11040435225667], [4.709380517392608, -74.11093561886359], [4.709186688981931, -74.1101145794128], [4.708276189202956, -74.11055215386648], [4.706742556850951, -74.10884830165377], [4.703033236302945, -74.10112498497568], [4.698931830848297, -74.09578828132736], [4.694615061923916, -74.087889534095], [4.692945063584985, -74.08629385323832], [4.679475843714656, -74.07563912332705], [4.67592347528078, -74.07050016737334], [4.6751810894455685, -74.07045150576997], [4.674402204164456, -74.06919690995754], [4.673690432708066, -74.0687787088515], [4.6730320522677635, -74.06885587294404], [4.665555589851001, -74.07544195341802], [4.660825818214942, -74.07698165812754], [4.65419807160293, -74.07809605580216], [4.632058259661043, -74.0797512102283], [4.629019411054716, -74.08020696441541], [4.627136534695425, -74.08103338616813], [4.624859553688402, -74.08321477814843], [4.607008268565429, -74.09761461824792], [4.606740553191618, -74.09807399480947], [4.605543975658791, -74.09871176716206], [4.602209166906499, -74.10207093406386], [4.598080590989566, -74.1076135653012], [4.598255051978691, -74.10894372422918], [4.596312441846158, -74.11316884944488], [4.594860013142867, -74.11788784838218], [4.5940839638736115, -74.12171906024001], [4.593595201616311, -74.12771828209962], [4.593712877737775, -74.13103753013085], [4.595693779572254, -74.14162123358591], [4.595076670143365, -74.14643375835243], [4.59561723956666, -74.15173084920373], [4.596504501361817, -74.15438838621219], [4.5958489363172905, -74.16237020500165], [4.595851852314768, -74.16646639504502], [4.596090061383656, -74.16753741833483], [4.597176915091743, -74.16827429987089], [4.597363785954997, -74.17019376475581]]	Portal 80	Portal Sur - Jfk Coop. F
71	G45	GS45 - San Mateo - Cc Unisur → Portal Sur - Jfk Coop. F	#3b82f6	[[4.585662999091206, -74.20596203828126], [4.595147171611442, -74.18692046530035], [4.596621597241438, -74.18314828724898], [4.596891885601532, -74.17741758371464], [4.5961498728005346, -74.17179287635317], [4.596196433597971, -74.16809371824756], [4.597038045617118, -74.1680896600977], [4.597246486645696, -74.1689439599664]]	San Mateo - Cc Unisur	Portal Sur - Jfk Coop. F
70	G30	CG30 - Portal Suba → Portal Sur - Jfk Coop. F	#3b82f6	[[4.748016783757263, -74.09422241742134], [4.748432613832138, -74.09456411042716], [4.747940122552702, -74.0949318429091], [4.745688095415575, -74.09438804042897], [4.745168089567935, -74.09371802442774], [4.744588549160088, -74.09358914282382], [4.741679060175236, -74.09027074182879], [4.741017982863296, -74.08912356921431], [4.738399546967068, -74.0865237334126], [4.737085691726516, -74.08268765185389], [4.7358090341472385, -74.08153757900615], [4.7344340068332285, -74.07960642572644], [4.733853409829906, -74.07818378699655], [4.73295539364275, -74.0770575650738], [4.732794339812506, -74.07575895141167], [4.732295305008535, -74.07519207270278], [4.729416365561778, -74.07472579955498], [4.720387833763533, -74.0747504857274], [4.719117216429935, -74.07405521058661], [4.7131127936457204, -74.07259347677801], [4.705310202141907, -74.0709423512746], [4.7013822937711085, -74.07052277315738], [4.69626210564154, -74.06894003487342], [4.691208732285409, -74.06599715378671], [4.687538255043666, -74.06474166124354], [4.683740994010885, -74.06287829369846], [4.682997250374541, -74.06304252495208], [4.6755869866163255, -74.06772768933841], [4.6743252861992115, -74.06903411391377], [4.673084147203453, -74.06881479594897], [4.66564523112982, -74.07537559266856], [4.6644420526319434, -74.07596924986846], [4.657194956686689, -74.0777705245529], [4.634357704276537, -74.07949980335557], [4.629019411054716, -74.08020696441541], [4.627136534695425, -74.08103338616813], [4.624859553688402, -74.08321477814843], [4.607008268565429, -74.09761461824792], [4.606740553191618, -74.09807399480947], [4.605543975658791, -74.09871176716206], [4.602209166906499, -74.10207093406386], [4.598080590989566, -74.1076135653012], [4.598255051978691, -74.10894372422918], [4.596312441846158, -74.11316884944488], [4.594860013142867, -74.11788784838218], [4.5940839638736115, -74.12171906024001], [4.593595201616311, -74.12771828209962], [4.593712877737775, -74.13103753013085], [4.595693779572254, -74.14162123358591], [4.595084266942093, -74.14667969077098], [4.5956496025894635, -74.15192581926094], [4.596520904560812, -74.15467360403966], [4.5958489363172905, -74.16237020500165], [4.595851852314768, -74.16646639504502], [4.596090061383656, -74.16753741833483], [4.596809410694754, -74.16801872530881], [4.5969136601583935, -74.16899104366998]]	Portal Suba	Portal Sur - Jfk Coop. F
72	G47	GM47 - Museo Nacional → Portal Sur - Jfk Coop. F	#3b82f6	[[4.6146988752183535, -74.06949864423436], [4.612492864386832, -74.07052593816688], [4.595126286920724, -74.08120269675511], [4.595938294329783, -74.08311537283454], [4.597521059197729, -74.08543117426181], [4.603827329964592, -74.09433110812796], [4.60682058383578, -74.09788420284325], [4.605543975658791, -74.09871176716206], [4.602589489554706, -74.10164166223721], [4.598104123826998, -74.10755043928997], [4.5982871093260975, -74.10883139328955], [4.595904369260862, -74.11433322792692], [4.5940839638736115, -74.12171906024001], [4.593686224614838, -74.12571982902222], [4.5936564803922, -74.13034656066964], [4.595693779572254, -74.14162123358591], [4.595084266942093, -74.14667969077098], [4.5956496025894635, -74.15192581926094], [4.596520904560812, -74.15467360403966], [4.5958489363172905, -74.16237020500165], [4.595851852314768, -74.16646639504502], [4.596149507774525, -74.1676180068557], [4.597527019357181, -74.16838271822826], [4.597701085944941, -74.17019675164364]]	Museo Nacional	Portal Sur - Jfk Coop. F
73	G52	AG52 - Flores - Areandina → Portal Sur - Jfk Coop. F	#3b82f6	[[4.654726824105531, -74.06304502996979], [4.656261702727943, -74.0623681548112], [4.665755539915392, -74.06085809693033], [4.671631290247573, -74.06544685339789], [4.674144595676954, -74.06774412007682], [4.675932199875242, -74.07048220357481], [4.675296196125982, -74.07053011189736], [4.674361687050075, -74.06915932020567], [4.673153066887865, -74.06878004310204], [4.665555589851001, -74.07544195341802], [4.659705723399806, -74.0772556941347], [4.65419807160293, -74.07809605580216], [4.634357704276537, -74.07949980335557], [4.629594836783032, -74.0800972483057], [4.627719973611194, -74.08074503931088], [4.607008268565429, -74.09761461824792], [4.606740553191618, -74.09807399480947], [4.605543975658791, -74.09871176716206], [4.602209166906499, -74.10207093406386], [4.598104123826998, -74.10755043928997], [4.598255051978691, -74.10894372422918], [4.596312441846158, -74.11316884944488], [4.594860013142867, -74.11788784838218], [4.5940839638736115, -74.12171906024001], [4.593595201616311, -74.12771828209962], [4.593712877737775, -74.13103753013085], [4.595693779572254, -74.14162123358591], [4.595076670143365, -74.14643375835243], [4.59561723956666, -74.15173084920373], [4.596504501361817, -74.15438838621219], [4.5958489363172905, -74.16237020500165], [4.595851852314768, -74.16646639504502], [4.596090061383656, -74.16753741833483], [4.597432506896753, -74.16824325992881], [4.597584794683853, -74.16887156957264]]	Flores - Areandina	Portal Sur - Jfk Coop. F
74	G53	GK53 - Portal ElDorado – C.C. NUESTRO BOGOTA → Portal Sur - Jfk Coop. F	#3b82f6	[[4.681996337606659, -74.12148580465116], [4.683310872091614, -74.1224574548576], [4.684625860951709, -74.12436900043339], [4.682902388012874, -74.12255142934907], [4.6790941795894865, -74.11988366661863], [4.635679912627938, -74.0919809364334], [4.634541144919187, -74.0904794894319], [4.632426560035747, -74.08490500570582], [4.630004151912684, -74.08297799328142], [4.631901574191316, -74.08006298888066], [4.631823713868916, -74.07983388194151], [4.629019411054716, -74.08020696441541], [4.627136534695425, -74.08103338616813], [4.624859553688402, -74.08321477814843], [4.607008268565429, -74.09761461824792], [4.606740553191618, -74.09807399480947], [4.605543975658791, -74.09871176716206], [4.602209166906499, -74.10207093406386], [4.598080590989566, -74.1076135653012], [4.598255051978691, -74.10894372422918], [4.596312441846158, -74.11316884944488], [4.594860013142867, -74.11788784838218], [4.5940839638736115, -74.12171906024001], [4.593595201616311, -74.12771828209962], [4.593712877737775, -74.13103753013085], [4.595693779572254, -74.14162123358591], [4.595076670143365, -74.14643375835243], [4.59561723956666, -74.15173084920373], [4.596504501361817, -74.15438838621219], [4.5958489363172905, -74.16237020500165], [4.595851852314768, -74.16646639504502], [4.596149507774525, -74.1676180068557], [4.597499681853458, -74.16832765718509], [4.597641680965609, -74.1695198061698]]	Portal ElDorado – C.C. NUESTRO BOGOTA	Portal Sur - Jfk Coop. F
75	H13	BH13 - Portal Norte-Unicervantes → Portal Tunal	#3b82f6	[[4.753852990421221, -74.04638710083539], [4.74830837418837, -74.04696344467625], [4.657760317730843, -74.06221927862273], [4.6558451739281645, -74.06261403812414], [4.652933476606534, -74.06404050644947], [4.622186994949467, -74.06960582424733], [4.620550372037385, -74.07020242157986], [4.615269332278973, -74.0729474595791], [4.614559330568535, -74.07366733563761], [4.613149038101542, -74.07401499335212], [4.607692291371701, -74.07704979183508], [4.5949707189685, -74.08636190310544], [4.5922447678016916, -74.0886193841304], [4.591488214978066, -74.08981285638778], [4.585638177714991, -74.09468564966795], [4.580998209379693, -74.10310674090964], [4.578644441586253, -74.10817803016954], [4.576842702278899, -74.11440151197799], [4.576005473241663, -74.11947826414492], [4.575161824717403, -74.12257376835352], [4.574204972942876, -74.1236503831568], [4.569317620124276, -74.12555661974194], [4.570639631340208, -74.12839840761553], [4.570746729407282, -74.1294754341871], [4.56749469733532, -74.13751850985804], [4.567148267557376, -74.14021145944984], [4.567520157820472, -74.14022805231885], [4.5675548455914035, -74.13966505799644], [4.567913624846648, -74.13945545518045]]	Portal Norte-Unicervantes	Portal Tunal
76	H15	CH15 - Portal Suba → Portal Tunal	#3b82f6	[[4.745698185616638, -74.09439047621602], [4.745168089567935, -74.09371802442774], [4.744537889215561, -74.09353927171549], [4.741679060175236, -74.09027074182879], [4.741017982863296, -74.08912356921431], [4.738334873767325, -74.08644177502109], [4.737085691726516, -74.08268765185389], [4.7358090341472385, -74.08153757900615], [4.7344340068332285, -74.07960642572644], [4.733853409829906, -74.07818378699655], [4.73295539364275, -74.0770575650738], [4.732794339812506, -74.07575895141167], [4.732295305008535, -74.07519207270278], [4.729416365561778, -74.07472579955498], [4.720387833763533, -74.0747504857274], [4.719117216429935, -74.07405521058661], [4.7131127936457204, -74.07259347677801], [4.705310202141907, -74.0709423512746], [4.7013822937711085, -74.07052277315738], [4.69626210564154, -74.06894003487342], [4.691208732285409, -74.06599715378671], [4.687538255043666, -74.06474166124354], [4.683873335446734, -74.06289505792887], [4.682997250374541, -74.06304252495208], [4.674521968755826, -74.06858388132184], [4.674428843957143, -74.06917579144422], [4.675148280272799, -74.07036887095258], [4.67564168324191, -74.07056363033249], [4.675780734136334, -74.07027589057742], [4.674161814802863, -74.06788755427714], [4.666686772941709, -74.06154514842804], [4.665467877169526, -74.06089072830092], [4.65597706940334, -74.06257654884453], [4.653239808934983, -74.06395325266102], [4.651060507659577, -74.06443852099859], [4.622186994949467, -74.06960582424733], [4.615269332278973, -74.0729474595791], [4.614559330568535, -74.07366733563761], [4.613149038101542, -74.07401499335212], [4.608508376166009, -74.07647969608291], [4.5949707189685, -74.08636190310544], [4.5922447678016916, -74.0886193841304], [4.591488214978066, -74.08981285638778], [4.585638177714991, -74.09468564966795], [4.580998209379693, -74.10310674090964], [4.578644441586253, -74.10817803016954], [4.576842702278899, -74.11440151197799], [4.576005473241663, -74.11947826414492], [4.575161824717403, -74.12257376835352], [4.574204972942876, -74.1236503831568], [4.56930957472152, -74.12557976009523], [4.570639631340208, -74.12839840761553], [4.570730700059492, -74.12960584375692], [4.56749469733532, -74.13751850985804], [4.56713067811463, -74.14016644782829], [4.567520157820472, -74.14022805231885], [4.567699747430173, -74.13952453671014], [4.569207675108695, -74.13907026458324], [4.571468308549396, -74.13960594986555]]	Portal Suba	Portal Tunal
77	H17	CH17 - Portal Suba → Portal Usme	#3b82f6	[[4.747554898242515, -74.09409955443003], [4.7482852673973195, -74.09432362634516], [4.748344143740223, -74.09477856114978], [4.747940122552702, -74.0949318429091], [4.745688095415575, -74.09438804042897], [4.745168089567935, -74.09371802442774], [4.744588549160088, -74.09358914282382], [4.741679060175236, -74.09027074182879], [4.741017982863296, -74.08912356921431], [4.738399546967068, -74.0865237334126], [4.737085691726516, -74.08268765185389], [4.7358090341472385, -74.08153757900615], [4.7344340068332285, -74.07960642572644], [4.733853409829906, -74.07818378699655], [4.73295539364275, -74.0770575650738], [4.732794339812506, -74.07575895141167], [4.732295305008535, -74.07519207270278], [4.729416365561778, -74.07472579955498], [4.720387833763533, -74.0747504857274], [4.719117216429935, -74.07405521058661], [4.7131127936457204, -74.07259347677801], [4.705310202141907, -74.0709423512746], [4.7013822937711085, -74.07052277315738], [4.69626210564154, -74.06894003487342], [4.691208732285409, -74.06599715378671], [4.688041728224585, -74.06495013875374], [4.683520868075661, -74.06287987195073], [4.6755869866163255, -74.06772768933841], [4.6743252861992115, -74.06903411391377], [4.673084147203453, -74.06881479594897], [4.66564523112982, -74.07537559266856], [4.6644420526319434, -74.07596924986846], [4.657194956686689, -74.0777705245529], [4.634357704276537, -74.07949980335557], [4.628363514735904, -74.08044191468704], [4.626803066335313, -74.08126552761834], [4.624859553688402, -74.08321477814843], [4.606633292327397, -74.09812439443868], [4.603898939121167, -74.09476776372004], [4.597872631299225, -74.08625106926381], [4.596990284859436, -74.08524596471074], [4.596531481751729, -74.08515717588725], [4.5922447678016916, -74.0886193841304], [4.591587700775303, -74.08971911559142], [4.586310534582177, -74.09397561844348], [4.585275608381825, -74.09528302170908], [4.580998209379693, -74.10310674090964], [4.578644441586253, -74.10817803016954], [4.576842702278899, -74.11440151197799], [4.57584809993763, -74.12017504010423], [4.574817888177418, -74.12312704264093], [4.574204972942876, -74.1236503831568], [4.5704378328920585, -74.12495201679042], [4.567425695052796, -74.12649808014243], [4.566318099218698, -74.12658390141631], [4.563649902648191, -74.12509065564963], [4.562186597566748, -74.12489086060674], [4.55942598582512, -74.12356037116852], [4.5578086647328275, -74.12225955625102], [4.556403616358848, -74.12158678068326], [4.5378456129032685, -74.120540019082], [4.536442422295968, -74.12017115296703], [4.534678926369175, -74.12074645597723], [4.532301218373254, -74.11947494088155]]	Portal Suba	Portal Usme
78	H20	DH20 - Portal 80 → Portal Usme	#3b82f6	[[4.710106318152942, -74.11032030233918], [4.709544190879022, -74.111159647034], [4.709148882977145, -74.110736636646], [4.7092409436856855, -74.11013741192058], [4.708276189202956, -74.11055215386648], [4.706742556850951, -74.10884830165377], [4.703033236302945, -74.10112498497568], [4.698931830848297, -74.09578828132736], [4.694615061923916, -74.087889534095], [4.692945063584985, -74.08629385323832], [4.679475843714656, -74.07563912332705], [4.6743993303890585, -74.0681315536112], [4.666686772941709, -74.06154514842804], [4.665356400197325, -74.06088885535496], [4.65597706940334, -74.06257654884453], [4.653239808934983, -74.06395325266102], [4.651060507659577, -74.06443852099859], [4.622103319345311, -74.06962792595553], [4.615269332278973, -74.0729474595791], [4.614559330568535, -74.07366733563761], [4.613149038101542, -74.07401499335212], [4.608508376166009, -74.07647969608291], [4.5949707189685, -74.08636190310544], [4.5922447678016916, -74.0886193841304], [4.591488214978066, -74.08981285638778], [4.585638177714991, -74.09468564966795], [4.580998209379693, -74.10310674090964], [4.5787323131232665, -74.10795478476582], [4.576842702278899, -74.11440151197799], [4.575304592892042, -74.12224204217382], [4.574204972942876, -74.1236503831568], [4.5704378328920585, -74.12495201679042], [4.567425695052796, -74.12649808014243], [4.566473362320576, -74.12660978417016], [4.563649902648191, -74.12509065564963], [4.562186597566748, -74.12489086060674], [4.55970653913284, -74.12370716172589], [4.5578086647328275, -74.12225955625102], [4.556403616358848, -74.12158678068326], [4.5378456129032685, -74.120540019082], [4.536442422295968, -74.12017115296703], [4.534678926369175, -74.12074645597723], [4.533072635857382, -74.1198311222678], [4.532000004906323, -74.11970137338977]]	Portal 80	Portal Usme
79	H21	DH21 - Portal 80 → Portal Tunal	#3b82f6	[[4.709514724074647, -74.11085767756161], [4.709178380076782, -74.11080438888614], [4.709186688981931, -74.1101145794128], [4.7081966997956135, -74.11049112784586], [4.706247892763692, -74.10810221939379], [4.703033236302945, -74.10112498497568], [4.698931830848297, -74.09578828132736], [4.694615061923916, -74.087889534095], [4.692945063584985, -74.08629385323832], [4.679475843714656, -74.07563912332705], [4.67592347528078, -74.07050016737334], [4.675231393828683, -74.07048919288214], [4.674361687050075, -74.06915932020567], [4.673249576168825, -74.06874764317814], [4.665555589851001, -74.07544195341802], [4.660825818214942, -74.07698165812754], [4.65551975103275, -74.07795914061404], [4.634357704276537, -74.07949980335557], [4.628363514735904, -74.08044191468704], [4.626803066335313, -74.08126552761834], [4.624859553688402, -74.08321477814843], [4.606633292327397, -74.09812439443868], [4.603898939121167, -74.09476776372004], [4.597872631299225, -74.08625106926381], [4.596990284859436, -74.08524596471074], [4.596425002916525, -74.08522385321815], [4.5922447678016916, -74.0886193841304], [4.591488214978066, -74.08981285638778], [4.585638177714991, -74.09468564966795], [4.580998209379693, -74.10310674090964], [4.578644441586253, -74.10817803016954], [4.576842702278899, -74.11440151197799], [4.576005473241663, -74.11947826414492], [4.575161824717403, -74.12257376835352], [4.574204972942876, -74.1236503831568], [4.569317620124276, -74.12555661974194], [4.570639631340208, -74.12839840761553], [4.570730700059492, -74.12960584375692], [4.56749469733532, -74.13751850985804], [4.567133394219476, -74.14018190380962], [4.569360092943138, -74.14000276090397], [4.569718018440523, -74.1391992506461], [4.572063696263249, -74.13975139210076]]	Portal 80	Portal Tunal
80	H27	BH27 - Portal Norte-Unicervantes → Portal Tunal	#3b82f6	[[4.753852990421221, -74.04638710083539], [4.74830837418837, -74.04696344467625], [4.657760317730843, -74.06221927862273], [4.6558451739281645, -74.06261403812414], [4.652933476606534, -74.06404050644947], [4.622186994949467, -74.06960582424733], [4.620550372037385, -74.07020242157986], [4.615269332278973, -74.0729474595791], [4.614559330568535, -74.07366733563761], [4.613149038101542, -74.07401499335212], [4.607692291371701, -74.07704979183508], [4.5949707189685, -74.08636190310544], [4.5922447678016916, -74.0886193841304], [4.591488214978066, -74.08981285638778], [4.585638177714991, -74.09468564966795], [4.580998209379693, -74.10310674090964], [4.578644441586253, -74.10817803016954], [4.576842702278899, -74.11440151197799], [4.576005473241663, -74.11947826414492], [4.575161824717403, -74.12257376835352], [4.574204972942876, -74.1236503831568], [4.569317620124276, -74.12555661974194], [4.570575896820538, -74.128226299279], [4.570760694713043, -74.12931276467245], [4.56749469733532, -74.13751850985804], [4.567148267557376, -74.14021145944984], [4.567520157820472, -74.14022805231885], [4.567581101364283, -74.13962335558054], [4.568340441860588, -74.13931759380844]]	Portal Norte-Unicervantes	Portal Tunal
81	H54	HK54 - Portal ElDorado – C.C. → Portal Usme	#3b82f6	[[4.681731072771672, -74.12167787812248], [4.666513169889236, -74.1116605276126], [4.635939884762308, -74.092192571873], [4.634553774037823, -74.09050545896174], [4.632705048675513, -74.08540894870022], [4.632088258174256, -74.08449032216659], [4.617164178909774, -74.07411332300865], [4.615294765130846, -74.07309336842502], [4.614559330568535, -74.07366733563761], [4.613149038101542, -74.07401499335212], [4.608508376166009, -74.07647969608291], [4.59910961633552, -74.08316007810744], [4.5922447678016916, -74.0886193841304], [4.591488214978066, -74.08981285638778], [4.585638177714991, -74.09468564966795], [4.580998209379693, -74.10310674090964], [4.5787323131232665, -74.10795478476582], [4.576842702278899, -74.11440151197799], [4.575304592892042, -74.12224204217382], [4.574204972942876, -74.1236503831568], [4.5704378328920585, -74.12495201679042], [4.567425695052796, -74.12649808014243], [4.566473362320576, -74.12660978417016], [4.563649902648191, -74.12509065564963], [4.562186597566748, -74.12489086060674], [4.55970653913284, -74.12370716172589], [4.5578086647328275, -74.12225955625102], [4.556403616358848, -74.12158678068326], [4.5378456129032685, -74.120540019082], [4.536442422295968, -74.12017115296703], [4.534678926369175, -74.12074645597723], [4.533072635857382, -74.1198311222678], [4.530785524790041, -74.11959482485669]]	Portal ElDorado – C.C.	Portal Usme
82	H72	BH72 - Toberin - Foundever → Portal Usme	#3b82f6	[[4.748100767810797, -74.04700275702447], [4.680374278557316, -74.05829852306445], [4.678802018119951, -74.05911025659623], [4.6741878110854085, -74.0671956539544], [4.67289493320461, -74.06896512283252], [4.665250480880975, -74.07561929855538], [4.657194956686689, -74.0777705245529], [4.634357704276537, -74.07949980335557], [4.6287377415657405, -74.08029272036987], [4.626803066335313, -74.08126552761834], [4.624859553688402, -74.08321477814843], [4.606633292327397, -74.09812439443868], [4.603898939121167, -74.09476776372004], [4.597872631299225, -74.08625106926381], [4.596990284859436, -74.08524596471074], [4.596531481751729, -74.08515717588725], [4.5922447678016916, -74.0886193841304], [4.591587700775303, -74.08971911559142], [4.586310534582177, -74.09397561844348], [4.585275608381825, -74.09528302170908], [4.580998209379693, -74.10310674090964], [4.578644441586253, -74.10817803016954], [4.576842702278899, -74.11440151197799], [4.57584809993763, -74.12017504010423], [4.574817888177418, -74.12312704264093], [4.574204972942876, -74.1236503831568], [4.5704378328920585, -74.12495201679042], [4.567335358353409, -74.12653179532938], [4.566234580613121, -74.12655752791063], [4.563649902648191, -74.12509065564963], [4.562186597566748, -74.12489086060674], [4.55942598582512, -74.12356037116852], [4.5578086647328275, -74.12225955625102], [4.556403616358848, -74.12158678068326], [4.5378456129032685, -74.120540019082], [4.536442422295968, -74.12017115296703], [4.534678926369175, -74.12074645597723], [4.532732263198049, -74.11955719876183], [4.531728676989255, -74.11941808905812]]	Toberin - Foundever	Portal Usme
83	H73	H73 - Toberin - Foundever → Portal Tunal	#3b82f6	[[4.748100767810797, -74.04700275702447], [4.656267117981496, -74.06250634191126], [4.653239808934983, -74.06395325266102], [4.651060507659577, -74.06443852099859], [4.622103319345311, -74.06962792595553], [4.615269332278973, -74.0729474595791], [4.614559330568535, -74.07366733563761], [4.613149038101542, -74.07401499335212], [4.609563338585511, -74.07585484272778], [4.5949707189685, -74.08636190310544], [4.5922447678016916, -74.0886193841304], [4.591488214978066, -74.08981285638778], [4.585552406021477, -74.0948175155801], [4.580998209379693, -74.10310674090964], [4.578644441586253, -74.10817803016954], [4.576842702278899, -74.11440151197799], [4.576005473241663, -74.11947826414492], [4.575161824717403, -74.12257376835352], [4.574204972942876, -74.1236503831568], [4.56930957472152, -74.12557976009523], [4.570639631340208, -74.12839840761553], [4.570730700059492, -74.12960584375692], [4.56749469733532, -74.13751850985804], [4.567133394219476, -74.14018190380962], [4.567520157820472, -74.14022805231885], [4.567699747430173, -74.13952453671014], [4.568938228272559, -74.13912336044073], [4.570216285279945, -74.13930010431913]]	Toberin - Foundever	Portal Tunal
84	H75	BH75 - Portal Norte-Unicervantes → Portal Usme	#3b82f6	[[4.754154217168458, -74.04633344255355], [4.74830837418837, -74.04696344467625], [4.6584718962593135, -74.0620926506548], [4.6558451739281645, -74.06261403812414], [4.653239808934983, -74.06395325266102], [4.651060507659577, -74.06443852099859], [4.6217648768343675, -74.0697293383729], [4.615269332278973, -74.0729474595791], [4.614559330568535, -74.07366733563761], [4.613149038101542, -74.07401499335212], [4.608508376166009, -74.07647969608291], [4.5949707189685, -74.08636190310544], [4.5922447678016916, -74.0886193841304], [4.591488214978066, -74.08981285638778], [4.585803093360279, -74.09449685980161], [4.580998209379693, -74.10310674090964], [4.5787323131232665, -74.10795478476582], [4.576842702278899, -74.11440151197799], [4.575304592892042, -74.12224204217382], [4.574204972942876, -74.1236503831568], [4.5704378328920585, -74.12495201679042], [4.567425695052796, -74.12649808014243], [4.566473362320576, -74.12660978417016], [4.563649902648191, -74.12509065564963], [4.562186597566748, -74.12489086060674], [4.55970653913284, -74.12370716172589], [4.5578086647328275, -74.12225955625102], [4.556403616358848, -74.12158678068326], [4.5378456129032685, -74.120540019082], [4.536442422295968, -74.12017115296703], [4.534678926369175, -74.12074645597723], [4.532732263198049, -74.11955719876183], [4.531288833644123, -74.11937455709928]]	Portal Norte-Unicervantes	Portal Usme
85	H76	JH76 - Universidades – CityU → Portal Usme	#3b82f6	[[4.604908024080314, -74.06724068835499], [4.60340792844796, -74.06793879528844], [4.6064118264495955, -74.06641420782515], [4.608725396170721, -74.06628687428037], [4.610207394287298, -74.06858244978758], [4.612164175815758, -74.07074929377832], [4.614563570801627, -74.07200637258167], [4.61618668930543, -74.07321663708284], [4.616412049272962, -74.07312227174079], [4.616222441634973, -74.07258325457752], [4.615472469654931, -74.07284834860285], [4.614559330568535, -74.07366733563761], [4.613149038101542, -74.07401499335212], [4.607692291371701, -74.07704979183508], [4.5949707189685, -74.08636190310544], [4.5922447678016916, -74.0886193841304], [4.591488214978066, -74.08981285638778], [4.585638177714991, -74.09468564966795], [4.580998209379693, -74.10310674090964], [4.578644441586253, -74.10817803016954], [4.576842702278899, -74.11440151197799], [4.575304592892042, -74.12224204217382], [4.57441490122049, -74.12351586055208], [4.5704378328920585, -74.12495201679042], [4.567425695052796, -74.12649808014243], [4.566473362320576, -74.12660978417016], [4.563649902648191, -74.12509065564963], [4.562186597566748, -74.12489086060674], [4.55970653913284, -74.12370716172589], [4.5578086647328275, -74.12225955625102], [4.556403616358848, -74.12158678068326], [4.5378456129032685, -74.120540019082], [4.536442422295968, -74.12017115296703], [4.534678926369175, -74.12074645597723], [4.533072635857382, -74.1198311222678], [4.5312655222952, -74.11963873770738]]	Universidades – CityU	Portal Usme
86	H83	HM83 - Museo Nacional → Portal Usme	#3b82f6	[[4.6154857337298685, -74.06923652598336], [4.613838825264451, -74.06975748858157], [4.602314739044675, -74.07662799772078], [4.587399821365775, -74.08621039211422], [4.576001876100423, -74.09448502685498], [4.572211132252515, -74.0979928236665], [4.5791349789836175, -74.10690833231769], [4.577000750084054, -74.11375702416125], [4.575304592892042, -74.12224204217382], [4.574278155343169, -74.1236068155498], [4.5704378328920585, -74.12495201679042], [4.567425695052796, -74.12649808014243], [4.566473362320576, -74.12660978417016], [4.563649902648191, -74.12509065564963], [4.562186597566748, -74.12489086060674], [4.55970653913284, -74.12370716172589], [4.5578086647328275, -74.12225955625102], [4.556403616358848, -74.12158678068326], [4.5378456129032685, -74.120540019082], [4.536442422295968, -74.12017115296703], [4.534678926369175, -74.12074645597723], [4.533072635857382, -74.1198311222678], [4.5312655222952, -74.11963873770738]]	Museo Nacional	Portal Usme
87	J23	FJ23 - Portal Américas → Las Aguas - Centro Colom	#3b82f6	[[4.629732849830918, -74.17233690405918], [4.630033299389499, -74.17215383103871], [4.6306034339658355, -74.17258340893869], [4.629468266657426, -74.17442865536167], [4.627313758861262, -74.17338992402593], [4.628262089847539, -74.17090065168013], [4.629674737783908, -74.16871421797087], [4.6403199088749965, -74.15636192828423], [4.635793581106857, -74.15387989827799], [4.633393700383487, -74.15145644016528], [4.6325663883025845, -74.15018348456677], [4.631366817383568, -74.14942969579998], [4.63074378661054, -74.14860146465678], [4.631336158233134, -74.14720230095068], [4.627353982994435, -74.10642270539478], [4.602340505636823, -74.07833912568917], [4.602130739190955, -74.0769281205744], [4.602313594015576, -74.07502472110346], [4.600899817761097, -74.0726029331935], [4.600614698390034, -74.07101568295877], [4.600957763606627, -74.06914320071238], [4.60261819004212, -74.06828033079022]]	Portal Américas	Las Aguas - Centro Colom
88	J23B	FJ23 - Banderas → Las Aguas - Centro Colom	#3b82f6	[[4.631137174049019, -74.14503875913638], [4.627317088360696, -74.10630393398654], [4.620811983868491, -74.09932748274319], [4.602340505636823, -74.07833912568917], [4.602130739190955, -74.0769281205744], [4.602313594015576, -74.07502472110346], [4.600899817761097, -74.0726029331935], [4.600614698390034, -74.07101568295877], [4.600957763606627, -74.06914320071238], [4.60261819004212, -74.06828033079022]]	Banderas	Las Aguas - Centro Colom
89	J24	DJ24 - Portal 80 → Universidades – CityU	#3b82f6	[[4.710073021805929, -74.11054367324267], [4.709633587647858, -74.11116827172883], [4.709148882977145, -74.110736636646], [4.7092409436856855, -74.11013741192058], [4.708276189202956, -74.11055215386648], [4.706742556850951, -74.10884830165377], [4.703033236302945, -74.10112498497568], [4.698931830848297, -74.09578828132736], [4.694615061923916, -74.087889534095], [4.692945063584985, -74.08629385323832], [4.679475843714656, -74.07563912332705], [4.6743993303890585, -74.0681315536112], [4.671945540578497, -74.06583055960775], [4.665749463914765, -74.06093681414455], [4.656267117981496, -74.06250634191126], [4.653239808934983, -74.06395325266102], [4.650895311677615, -74.06447140302402], [4.622186994949467, -74.06960582424733], [4.615221127097889, -74.072948072715], [4.614535712042325, -74.07355015681156], [4.613436075288695, -74.0724923861743], [4.61385183732241, -74.0718579252137], [4.612303612352527, -74.07093748943704], [4.610494357626835, -74.06904234190647], [4.608764215849258, -74.0663651626704], [4.606439441009141, -74.06644772959024], [4.604352619565187, -74.06754099200141]]	Portal 80	Universidades – CityU
90	J70	J70 - Portal Norte-Unicervantes → Las Aguas - Centro Colom	#3b82f6	[[4.754117366382433, -74.04596963639696], [4.7563669471209185, -74.04570709907624], [4.756114851898784, -74.04596760843891], [4.753252602218065, -74.04655199284204], [4.74830837418837, -74.04696344467625], [4.680374278557316, -74.05829852306445], [4.678802018119951, -74.05911025659623], [4.6741878110854085, -74.0671956539544], [4.67289493320461, -74.06896512283252], [4.665250480880975, -74.07561929855538], [4.657194956686689, -74.0777705245529], [4.634357704276537, -74.07949980335557], [4.6287377415657405, -74.08029272036987], [4.626803066335313, -74.08126552761834], [4.624859553688402, -74.08321477814843], [4.6124898160797105, -74.0934869566979], [4.613829646197877, -74.09510277444846], [4.615533464111337, -74.09338225991712], [4.602226814963035, -74.07813322802424], [4.602313594015576, -74.07502472110346], [4.600899817761097, -74.0726029331935], [4.600614698390034, -74.07101568295877], [4.600928013176687, -74.06918575572227], [4.602466722642555, -74.06836355423091]]	Portal Norte-Unicervantes	Las Aguas - Centro Colom
46	D10	BD10 - Portal Norte-Unicervantes → Portal 80	#3b82f6	[[4.754117366382433, -74.04596963639696], [4.7563669471209185, -74.04570709907624], [4.756114851898784, -74.04596760843891], [4.753252602218065, -74.04655199284204], [4.74830837418837, -74.04696344467625], [4.668948052583868, -74.0602456257231], [4.666694255278718, -74.06092460393641], [4.667011028989088, -74.06168992060269], [4.674453929915701, -74.06806813158933], [4.679432145172107, -74.07545313217109], [4.694574627755958, -74.08769297927385], [4.699128591029129, -74.09589765409861], [4.703246381337566, -74.10132389675921], [4.706651087728201, -74.1085085567133], [4.7083692299457685, -74.11045480580036], [4.710156022776005, -74.10953940363873], [4.709761971291279, -74.11105749080457]]	Portal Norte-Unicervantes	Portal 80
91	J73	CJ73 - Portal Suba → Universidades – CityU	#3b82f6	[[4.746962223295258, -74.09469570739218], [4.745603377137542, -74.0943534396187], [4.745168089567935, -74.09371802442774], [4.744588549160088, -74.09358914282382], [4.741679060175236, -74.09027074182879], [4.741017982863296, -74.08912356921431], [4.738334873767325, -74.08644177502109], [4.737085691726516, -74.08268765185389], [4.7358090341472385, -74.08153757900615], [4.7344340068332285, -74.07960642572644], [4.733853409829906, -74.07818378699655], [4.73295539364275, -74.0770575650738], [4.732794339812506, -74.07575895141167], [4.732295305008535, -74.07519207270278], [4.729416365561778, -74.07472579955498], [4.720387833763533, -74.0747504857274], [4.719117216429935, -74.07405521058661], [4.7131127936457204, -74.07259347677801], [4.705310202141907, -74.0709423512746], [4.7013822937711085, -74.07052277315738], [4.69626210564154, -74.06894003487342], [4.691208732285409, -74.06599715378671], [4.687538255043666, -74.06474166124354], [4.683873335446734, -74.06289505792887], [4.682997250374541, -74.06304252495208], [4.6755869866163255, -74.06772768933841], [4.6743252861992115, -74.06903411391377], [4.673084147203453, -74.06881479594897], [4.66564523112982, -74.07537559266856], [4.6644420526319434, -74.07596924986846], [4.657194956686689, -74.0777705245529], [4.634357704276537, -74.07949980335557], [4.629594836783032, -74.0800972483057], [4.627136534695425, -74.08103338616813], [4.624951014168974, -74.08282349714455], [4.626899254810259, -74.0811513942103], [4.628403705282858, -74.08037303078594], [4.632191591246983, -74.07972502063072], [4.630187985979011, -74.08303733393241], [4.632512610814348, -74.08488261619779], [4.634734636603903, -74.09057461190847], [4.636018552292641, -74.09220295492952], [4.634645116951017, -74.09068179323364], [4.632675271421226, -74.08533909505742], [4.631774659587525, -74.08421731129945], [4.6143373121149684, -74.07210453216057], [4.612303612352527, -74.07093748943704], [4.610494357626835, -74.06904234190647], [4.608801973888519, -74.06638745711346], [4.606439441009141, -74.06644772959024], [4.604352619565187, -74.06754099200141]]	Portal Suba	Universidades – CityU
92	J74	BJ74 - Portal Norte-Unicervantes → Universidades – CityU	#3b82f6	[[4.754117366382433, -74.04596963639696], [4.7563669471209185, -74.04570709907624], [4.756114851898784, -74.04596760843891], [4.753252602218065, -74.04655199284204], [4.74830837418837, -74.04696344467625], [4.656267117981496, -74.06250634191126], [4.653239808934983, -74.06395325266102], [4.651060507659577, -74.06443852099859], [4.622103319345311, -74.06962792595553], [4.615221127097889, -74.072948072715], [4.614535712042325, -74.07355015681156], [4.613436075288695, -74.0724923861743], [4.61385183732241, -74.0718579252137], [4.612303612352527, -74.07093748943704], [4.610494357626835, -74.06904234190647], [4.608764215849258, -74.0663651626704], [4.606439441009141, -74.06644772959024], [4.604352619565187, -74.06754099200141]]	Portal Norte-Unicervantes	Universidades – CityU
93	J76	JH76 - Portal Usme → Universidades – CityU	#3b82f6	[[4.5312655222952, -74.11963873770738], [4.529975620866925, -74.11938846771582], [4.529866778588926, -74.11912433317782], [4.532642209069388, -74.11913515206273], [4.534656371427002, -74.12064872759571], [4.536424877040395, -74.12009095322921], [4.537670944038629, -74.12044933166246], [4.555869007896142, -74.12139566518668], [4.557792278020145, -74.12215261807609], [4.5591397143782695, -74.12327409536242], [4.562134961132119, -74.12478471423765], [4.563639802009734, -74.12500085779341], [4.566610733838098, -74.1265399313398], [4.5673599713602755, -74.12644711431938], [4.570742744063883, -74.12470645671885], [4.5741315345501015, -74.12361084610221], [4.57522002724806, -74.12223989665264], [4.576893668907382, -74.11375399985563], [4.578758179670209, -74.10753592829992], [4.581523857778301, -74.10188562617847], [4.585756784289869, -74.09435211193274], [4.591507075354379, -74.08965102044563], [4.592156188123543, -74.0885404205843], [4.599427497137765, -74.08279605786579], [4.6089218697943615, -74.07607653016443], [4.615161296106999, -74.07294998638243], [4.614615256846087, -74.07351913467204], [4.614323852314285, -74.07345617819075], [4.613436075288695, -74.0724923861743], [4.61385183732241, -74.0718579252137], [4.612303612352527, -74.07093748943704], [4.610494357626835, -74.06904234190647], [4.608764215849258, -74.0663651626704], [4.606540831950481, -74.06642235003387], [4.604908024080314, -74.06724068835499]]	Portal Usme	Universidades – CityU
94	K10	KL10 - Portal 20 De Julio → Portal ElDorado – C.C. NUESTRO BOGOTA	#3b82f6	[[4.565657392664141, -74.09686378779132], [4.566461520368082, -74.09593613063636], [4.566719099166977, -74.0960050928483], [4.565079513176948, -74.09802695438364], [4.568920220278964, -74.10070408490918], [4.575896745550824, -74.09440015322492], [4.585273213649085, -74.08752762705707], [4.594860449725006, -74.08111430103305], [4.611547440029993, -74.07109977697124], [4.612347617864106, -74.07045991842433], [4.612312591082929, -74.07009362291808], [4.6120780652227396, -74.07034811466873], [4.612659144005159, -74.07114423474562], [4.615124995284933, -74.07254801100575], [4.6239692979314375, -74.07891291920026], [4.632002737022819, -74.08426579831436], [4.632749552412936, -74.08533500424448], [4.634734636603903, -74.09057461190847], [4.635614775765174, -74.0917289104092], [4.667777307848211, -74.11247624667611], [4.679822840730703, -74.1199157831909], [4.683193364032853, -74.1223366023075], [4.684625860951709, -74.12436900043339], [4.682902388012874, -74.12255142934907], [4.6812887846996185, -74.12137157005917]]	Portal 20 De Julio	Portal ElDorado – C.C. NUESTRO BOGOTA
95	K16	BK16 - Terminal → Portal ElDorado – C.C.	#3b82f6	[[4.768663373001986, -74.04377617736101], [4.753252602218065, -74.04655199284204], [4.74830837418837, -74.04696344467625], [4.680374278557316, -74.05829852306445], [4.678802018119951, -74.05911025659623], [4.674145307784814, -74.06726646824721], [4.6727779669248415, -74.06909688578624], [4.66564523112982, -74.07537559266856], [4.664767743925932, -74.07585277934383], [4.657194956686689, -74.0777705245529], [4.634357704276537, -74.07949980335557], [4.629594836783032, -74.0800972483057], [4.627136534695425, -74.08103338616813], [4.624951014168974, -74.08282349714455], [4.626899254810259, -74.0811513942103], [4.628403705282858, -74.08037303078594], [4.632161209210889, -74.07970086191308], [4.630187985979011, -74.08303733393241], [4.631746262144339, -74.08405558191653], [4.632565799641312, -74.08496767306619], [4.634629193598584, -74.09035199136073], [4.63558505700269, -74.09170475468153], [4.681996337606659, -74.12148580465116]]	Terminal	Portal ElDorado – C.C.
96	K23	BK23 - Alcalá – Colegio S. To → Portal ElDorado – C.C.	#3b82f6	[[4.72110788462443, -74.05155137781244], [4.656131182112189, -74.0625464774329], [4.6531563821897395, -74.0639711768325], [4.651103281934249, -74.06446137715105], [4.621770381650103, -74.06975467718985], [4.615134381546699, -74.07301877651409], [4.614539181125538, -74.07357667690853], [4.613380481377376, -74.07242137707912], [4.614565581604184, -74.07219327689234], [4.6231315817495355, -74.0783733766989], [4.6319519818549235, -74.08425017665498], [4.632745481637775, -74.0853777770558], [4.634695581982167, -74.09058427701783], [4.636050781258775, -74.0921032770762], [4.679943483195136, -74.12004267726148], [4.682377583839582, -74.12184977733159]]	Alcalá – Colegio S. To	Portal ElDorado – C.C.
97	K43	KS43 - San Mateo - Cc Unisur → Portal ElDorado – C.C.	#3b82f6	[[4.586624715970561, -74.20398949503833], [4.595147171611442, -74.18692046530035], [4.596796173781552, -74.18214009486182], [4.596875939703918, -74.17695366418518], [4.5961498728005346, -74.17179287635317], [4.595724157306866, -74.16539580773075], [4.596403882694173, -74.1546363793718], [4.595579299416156, -74.15185045245023], [4.5949744157424846, -74.14671774382316], [4.595579939912979, -74.14140548418992], [4.593519887699878, -74.13033646179073], [4.593649641667033, -74.12503224793387], [4.594141100953519, -74.12080557310811], [4.595879302344186, -74.11407604495379], [4.598191432644763, -74.10880344030647], [4.598036461655582, -74.10750311914788], [4.601927904391434, -74.10223084617252], [4.606410074348512, -74.09770430396807], [4.606955854592375, -74.09761875512051], [4.6088493432914275, -74.09618602968517], [4.626899254810259, -74.0811513942103], [4.629189447141343, -74.0800933138398], [4.632144175645965, -74.07969345277179], [4.630187985979011, -74.08303733393241], [4.631746262144339, -74.08405558191653], [4.632565799641312, -74.08496767306619], [4.634629193598584, -74.09035199136073], [4.63558505700269, -74.09170475468153], [4.681584315206324, -74.12118840513403]]	San Mateo - Cc Unisur	Portal ElDorado – C.C.
98	K53	GK53 - Portal Sur - Jfk Coop. F → Portal ElDorado – C.C. NUESTRO BOGOTA	#3b82f6	[[4.597641680965609, -74.1695198061698], [4.597677724269286, -74.17042375597033], [4.596751222786298, -74.17078870315842], [4.596374475961839, -74.17064691182293], [4.595724157306866, -74.16539580773075], [4.596389017260354, -74.15438049290015], [4.595579299416156, -74.15185045245023], [4.5949744157424846, -74.14671774382316], [4.595579939912979, -74.14140548418992], [4.593689928648466, -74.13142676070498], [4.593480791855978, -74.12844444781578], [4.593919437902667, -74.12218576065617], [4.59458007467855, -74.11863053812189], [4.595879302344186, -74.11407604495379], [4.598191432644763, -74.10880344030647], [4.598004852048046, -74.10757507744003], [4.601927904391434, -74.10223084617252], [4.606410074348512, -74.09770430396807], [4.606955854592375, -74.09761875512051], [4.6088493432914275, -74.09618602968517], [4.627140500312349, -74.08098976470644], [4.629189447141343, -74.0800933138398], [4.632161209210889, -74.07970086191308], [4.630187985979011, -74.08303733393241], [4.631746262144339, -74.08405558191653], [4.632565799641312, -74.08496767306619], [4.634629193598584, -74.09035199136073], [4.63558505700269, -74.09170475468153], [4.681996337606659, -74.12148580465116]]	Portal Sur - Jfk Coop. F	Portal ElDorado – C.C. NUESTRO BOGOTA
99	K54	HK54 - Portal Usme → Portal ElDorado – C.C.	#3b82f6	[[4.530785524790041, -74.11959482485669], [4.529917114143671, -74.11936434791235], [4.529876258980322, -74.11910023710767], [4.532642209069388, -74.11913515206273], [4.534656371427002, -74.12064872759571], [4.536424877040395, -74.12009095322921], [4.537670944038629, -74.12044933166246], [4.555869007896142, -74.12139566518668], [4.557792278020145, -74.12215261807609], [4.5591397143782695, -74.12327409536242], [4.562134961132119, -74.12478471423765], [4.563639802009734, -74.12500085779341], [4.566610733838098, -74.1265399313398], [4.5673599713602755, -74.12644711431938], [4.570742744063883, -74.12470645671885], [4.5741035142376525, -74.12362834585652], [4.57522002724806, -74.12223989665264], [4.576893668907382, -74.11375399985563], [4.578758179670209, -74.10753592829992], [4.581523857778301, -74.10188562617847], [4.585756784289869, -74.09435211193274], [4.591507075354379, -74.08965102044563], [4.592156188123543, -74.0885404205843], [4.599427497137765, -74.08279605786579], [4.6089218697943615, -74.07607653016443], [4.615143684278646, -74.07289153170055], [4.614649621416322, -74.07349422123032], [4.614323852314285, -74.07345617819075], [4.6134252332310055, -74.0724534149793], [4.6142759007957, -74.0720413402051], [4.632002737022819, -74.08426579831436], [4.632749552412936, -74.08533500424448], [4.634734636603903, -74.09057461190847], [4.636070511293409, -74.09206932039794], [4.667777307848211, -74.11247624667611], [4.679822840730703, -74.1199157831909], [4.683193364032853, -74.1223366023075], [4.684625860951709, -74.12436900043339], [4.681731072771672, -74.12167787812248]]	Portal Usme	Portal ElDorado – C.C.
100	K86	MK86 - Hacienda Santa Barbara → Aeropuerto El Dorado	#3b82f6	[[4.695433785858436, -74.03238903869328], [4.6941310176138415, -74.0331663100515], [4.690403565803562, -74.03455464619366], [4.685003947984051, -74.0358637629776], [4.6802269448548275, -74.038104761029], [4.677575642932304, -74.04015948239613], [4.675512594046597, -74.04073863092746], [4.673424750760274, -74.04288647909235], [4.664944002989317, -74.04703936270651], [4.6587184567800355, -74.05305342725826], [4.655874567855732, -74.0550309736597], [4.6519380823902505, -74.05712926372678], [4.650328949147652, -74.05858695587625], [4.6452947542267005, -74.06139264327004], [4.636050968694109, -74.0637818865789], [4.63230902634577, -74.06406445409863], [4.622983643368584, -74.06658882118386], [4.618878134986519, -74.06823190739728], [4.613838825264451, -74.06975748858157], [4.612507750979083, -74.07069449217951], [4.6239692979314375, -74.07891291920026], [4.632002737022819, -74.08426579831436], [4.632749552412936, -74.08533500424448], [4.634734636603903, -74.09057461190847], [4.636070511293409, -74.09206932039794], [4.667777307848211, -74.11247624667611], [4.679822840730703, -74.1199157831909], [4.683169058410614, -74.12231646472625], [4.693414706773986, -74.13554736175855], [4.694454170879242, -74.13629501818049], [4.698132003982168, -74.14153948917948], [4.697140514041585, -74.14214083626172], [4.695621906885097, -74.14039924219422], [4.6941285990787005, -74.13840468135871], [4.693279773237502, -74.13649535563484], [4.684247099421569, -74.12420691239478], [4.683026597448141, -74.12266476543991], [4.680773213964549, -74.12102249382227]]	Hacienda Santa Barbara	Aeropuerto El Dorado
101	K86CV	MK86 - Hacienda Santa Barbara → Aeropuerto El Dorado	#3b82f6	[[4.695433785858436, -74.03238903869328], [4.6941310176138415, -74.0331663100515], [4.690403565803562, -74.03455464619366], [4.685576978167163, -74.03563056541238], [4.680547819635392, -74.03792482632727], [4.680267766937854, -74.03848811425293], [4.682651727559829, -74.0433298691902], [4.6708619672088565, -74.04951695586263], [4.654677019403764, -74.06050380602053], [4.652841717435293, -74.06142339241947], [4.6534582852097275, -74.06289272742517], [4.624143123380959, -74.06778717965781], [4.6233376757902676, -74.06649145427805], [4.618878134986519, -74.06823190739728], [4.613838825264451, -74.06975748858157], [4.612507750979083, -74.07069449217951], [4.6239692979314375, -74.07891291920026], [4.632002737022819, -74.08426579831436], [4.632749552412936, -74.08533500424448], [4.634734636603903, -74.09057461190847], [4.636070511293409, -74.09206932039794], [4.667777307848211, -74.11247624667611], [4.679822840730703, -74.1199157831909], [4.683169058410614, -74.12231646472625], [4.693414706773986, -74.13554736175855], [4.694454170879242, -74.13629501818049], [4.698132003982168, -74.14153948917948], [4.697140514041585, -74.14214083626172], [4.695621906885097, -74.14039924219422], [4.6941285990787005, -74.13840468135871], [4.693279773237502, -74.13649535563484], [4.682688632776786, -74.12256822858978], [4.679250285385726, -74.12020458533917], [4.677179658085667, -74.12168756206864], [4.6767039836010005, -74.12269239503878], [4.676387468658813, -74.12271447632087], [4.67716291465241, -74.12163265043914], [4.679497175647334, -74.11988554843052], [4.683175468999901, -74.12237374661224], [4.684612406867464, -74.12432523032196], [4.6828395686732405, -74.12244880560378], [4.680773213964549, -74.12102249382227]]	Hacienda Santa Barbara	Aeropuerto El Dorado
102	L10	KL10 - Portal ElDorado – C.C. → Portal 20 De Julio	#3b82f6	[[4.6812887846996185, -74.12137157005917], [4.635939884762308, -74.092192571873], [4.634553774037823, -74.09050545896174], [4.632705048675513, -74.08540894870022], [4.632088258174256, -74.08449032216659], [4.615466694659336, -74.0729775536029], [4.612002922084948, -74.07106814208318], [4.602314739044675, -74.07662799772078], [4.585588760836308, -74.08743590928026], [4.576001876100423, -74.09448502685498], [4.5689345543472735, -74.10082105321132], [4.565319172631687, -74.09813471864162], [4.564741731133761, -74.09802158562314], [4.565657392664141, -74.09686378779132]]	Portal ElDorado – C.C.	Portal 20 De Julio
103	L18	BL18 - Terminal → Portal 20 De Julio	#3b82f6	[[4.768663373001986, -74.04377617736101], [4.753252602218065, -74.04655199284204], [4.74830837418837, -74.04696344467625], [4.6584718962593135, -74.0620926506548], [4.6558451739281645, -74.06261403812414], [4.653239808934983, -74.06395325266102], [4.651060507659577, -74.06443852099859], [4.622103319345311, -74.06962792595553], [4.615269332278973, -74.0729474595791], [4.614559330568535, -74.07366733563761], [4.613149038101542, -74.07401499335212], [4.609165637640525, -74.07608048779261], [4.597202737657689, -74.08461231586489], [4.599048519373036, -74.08776521814269], [4.597418165389471, -74.08562594041125], [4.595282531343701, -74.08165080671013], [4.594678226362106, -74.08147987861693], [4.585588760836308, -74.08743590928026], [4.576001876100423, -74.09448502685498], [4.5689345543472735, -74.10082105321132], [4.565319172631687, -74.09813471864162], [4.564728263890309, -74.09799801193783], [4.56663997917708, -74.09593236655179], [4.565505606328036, -74.09750110887455]]	Terminal	Portal 20 De Julio
104	L25	CL25 - Portal Suba → Portal 20 De Julio	#3b82f6	[[4.746957771379576, -74.09395396264001], [4.748242894027009, -74.09429664677114], [4.748380500814067, -74.09473010972631], [4.747940122552702, -74.0949318429091], [4.745688095415575, -74.09438804042897], [4.745168089567935, -74.09371802442774], [4.744588549160088, -74.09358914282382], [4.741679060175236, -74.09027074182879], [4.741017982863296, -74.08912356921431], [4.738334873767325, -74.08644177502109], [4.737085691726516, -74.08268765185389], [4.7358090341472385, -74.08153757900615], [4.7344340068332285, -74.07960642572644], [4.733853409829906, -74.07818378699655], [4.73295539364275, -74.0770575650738], [4.732794339812506, -74.07575895141167], [4.732295305008535, -74.07519207270278], [4.729416365561778, -74.07472579955498], [4.720387833763533, -74.0747504857274], [4.719117216429935, -74.07405521058661], [4.7131127936457204, -74.07259347677801], [4.705310202141907, -74.0709423512746], [4.7013822937711085, -74.07052277315738], [4.69626210564154, -74.06894003487342], [4.691208732285409, -74.06599715378671], [4.688041728224585, -74.06495013875374], [4.6836004787732595, -74.06287334214564], [4.6755869866163255, -74.06772768933841], [4.6743252861992115, -74.06903411391377], [4.673084147203453, -74.06881479594897], [4.66564523112982, -74.07537559266856], [4.6644420526319434, -74.07596924986846], [4.657194956686689, -74.0777705245529], [4.634357704276537, -74.07949980335557], [4.628363514735904, -74.08044191468704], [4.626803066335313, -74.08126552761834], [4.624859553688402, -74.08321477814843], [4.606633292327397, -74.09812439443868], [4.603898939121167, -74.09476776372004], [4.597418165389471, -74.08562594041125], [4.595362900386357, -74.08177111643782], [4.594921738422567, -74.08147170524803], [4.585588760836308, -74.08743590928026], [4.576001876100423, -74.09448502685498], [4.5689345543472735, -74.10082105321132], [4.565319172631687, -74.09813471864162], [4.564741731133761, -74.09802158562314], [4.565902199246758, -74.09658204971144]]	Portal Suba	Portal 20 De Julio
105	L41	SL41 - San Mateo - Cc Unisur → Bicentenario	#3b82f6	[[4.585662999091206, -74.20596203828126], [4.595147171611442, -74.18692046530035], [4.596772305119332, -74.18238209421445], [4.596875939703918, -74.17695366418518], [4.5961498728005346, -74.17179287635317], [4.595724157306866, -74.16539580773075], [4.596403882694173, -74.1546363793718], [4.595579299416156, -74.15185045245023], [4.5949744157424846, -74.14671774382316], [4.595579939912979, -74.14140548418992], [4.593519887699878, -74.13033646179073], [4.593649641667033, -74.12503224793387], [4.594141100953519, -74.12080557310811], [4.595879302344186, -74.11407604495379], [4.598191432644763, -74.10880344030647], [4.598036461655582, -74.10750311914788], [4.601927904391434, -74.10223084617252], [4.606350051954896, -74.09785116022269], [4.597418165389471, -74.08562594041125], [4.595282531343701, -74.08165080671013], [4.594678226362106, -74.08147987861693], [4.593915481108797, -74.08199539900207]]	San Mateo - Cc Unisur	Bicentenario
106	L81	DL81 - Puente De Guadua → Portal 20 De Julio	#3b82f6	[[4.7263474243840555, -74.12518280324548], [4.721615652411073, -74.12116780939024], [4.712136553202808, -74.11441156699412], [4.7073449690270746, -74.10960134279979], [4.706247892763692, -74.10810221939379], [4.703033236302945, -74.10112498497568], [4.698931830848297, -74.09578828132736], [4.694615061923916, -74.087889534095], [4.692945063584985, -74.08629385323832], [4.679475843714656, -74.07563912332705], [4.6743993303890585, -74.0681315536112], [4.666805339926743, -74.06159712456446], [4.6666124524187325, -74.06100378267786], [4.667681031182195, -74.06009940975984], [4.6719176766555295, -74.05935338788044], [4.670015134053604, -74.05527340674963], [4.667844063803827, -74.05155674030048], [4.657170006754061, -74.05876802061692], [4.654680600835057, -74.05563889060845], [4.6519380823902505, -74.05712926372678], [4.650328949147652, -74.05858695587625], [4.645090694830133, -74.06146919696035], [4.636050968694109, -74.0637818865789], [4.631499473782657, -74.06427882626524], [4.622564461260661, -74.06671732908562], [4.618878134986519, -74.06823190739728], [4.613838825264451, -74.06975748858157], [4.595322149250768, -74.08096611028559], [4.5950568038284, -74.0814357574211], [4.585588760836308, -74.08743590928026], [4.576001876100423, -74.09448502685498], [4.5689345543472735, -74.10082105321132], [4.565319172631687, -74.09813471864162], [4.564741731133761, -74.09802158562314], [4.56663997917708, -74.09593236655179], [4.565854438450711, -74.09710263005111]]	Puente De Guadua	Portal 20 De Julio
107	L81CV	DL81 - Puente De Guadua → Portal 20 De Julio	#3b82f6	[[4.7263474243840555, -74.12518280324548], [4.721615652411073, -74.12116780939024], [4.712136553202808, -74.11441156699412], [4.7073449690270746, -74.10960134279979], [4.706247892763692, -74.10810221939379], [4.703033236302945, -74.10112498497568], [4.698931830848297, -74.09578828132736], [4.694615061923916, -74.087889534095], [4.692945063584985, -74.08629385323832], [4.679475843714656, -74.07563912332705], [4.6743993303890585, -74.0681315536112], [4.666805339926743, -74.06159712456446], [4.6666124524187325, -74.06100378267786], [4.667681031182195, -74.06009940975984], [4.6719176766555295, -74.05935338788044], [4.670015134053604, -74.05527340674963], [4.667844063803827, -74.05155674030048], [4.654677019403764, -74.06050380602053], [4.652841717435293, -74.06142339241947], [4.6534582852097275, -74.06289272742517], [4.624143123380959, -74.06778717965781], [4.6233376757902676, -74.06649145427805], [4.618878134986519, -74.06823190739728], [4.613838825264451, -74.06975748858157], [4.595322149250768, -74.08096611028559], [4.5950568038284, -74.0814357574211], [4.585588760836308, -74.08743590928026], [4.576001876100423, -74.09448502685498], [4.5689345543472735, -74.10082105321132], [4.565319172631687, -74.09813471864162], [4.564728263890309, -74.09799801193783], [4.56663997917708, -74.09593236655179], [4.565565595761272, -74.09743266686318]]	Puente De Guadua	Portal 20 De Julio
108	L82	ML82 - Clinica El Bosque → Portal 20 De Julio	#3b82f6	[[4.710171598464429, -74.0288948575736], [4.7066719363294105, -74.02859433701653], [4.701359280925435, -74.02865739324676], [4.699524478645878, -74.02903460113531], [4.698863455855233, -74.02941733460332], [4.697612124122629, -74.03102142474508], [4.6941310176138415, -74.0331663100515], [4.689624679283277, -74.03478775512431], [4.685576978167163, -74.03563056541238], [4.680547819635392, -74.03792482632727], [4.677700460303706, -74.04009427775094], [4.675261884963031, -74.04090604314007], [4.673424750760274, -74.04288647909235], [4.664944002989317, -74.04703936270651], [4.6587184567800355, -74.05305342725826], [4.655874567855732, -74.0550309736597], [4.6519380823902505, -74.05712926372678], [4.650328949147652, -74.05858695587625], [4.6452947542267005, -74.06139264327004], [4.636050968694109, -74.0637818865789], [4.631499473782657, -74.06427882626524], [4.622564461260661, -74.06671732908562], [4.618878134986519, -74.06823190739728], [4.613838825264451, -74.06975748858157], [4.595322149250768, -74.08096611028559], [4.5950568038284, -74.0814357574211], [4.585588760836308, -74.08743590928026], [4.576001876100423, -74.09448502685498], [4.5689345543472735, -74.10082105321132], [4.565319172631687, -74.09813471864162], [4.564741731133761, -74.09802158562314], [4.56663997917708, -74.09593236655179], [4.565856472309914, -74.09710036820472]]	Clinica El Bosque	Portal 20 De Julio
109	L82CV	ML82 - Clinica El Bosque → Portal 20 De Julio	#3b82f6	[[4.710171598464429, -74.0288948575736], [4.7066719363294105, -74.02859433701653], [4.701359280925435, -74.02865739324676], [4.699524478645878, -74.02903460113531], [4.698863455855233, -74.02941733460332], [4.697612124122629, -74.03102142474508], [4.6941310176138415, -74.0331663100515], [4.689624679283277, -74.03478775512431], [4.685576978167163, -74.03563056541238], [4.680547819635392, -74.03792482632727], [4.680267766937854, -74.03848811425293], [4.682651727559829, -74.0433298691902], [4.6708619672088565, -74.04951695586263], [4.654677019403764, -74.06050380602053], [4.652782131692359, -74.06142893565345], [4.653683992033986, -74.06281416566307], [4.624143123380959, -74.06778717965781], [4.623397814056291, -74.06647936877907], [4.618878134986519, -74.06823190739728], [4.613838825264451, -74.06975748858157], [4.595322149250768, -74.08096611028559], [4.5950568038284, -74.0814357574211], [4.585588760836308, -74.08743590928026], [4.576001876100423, -74.09448502685498], [4.5689345543472735, -74.10082105321132], [4.565319172631687, -74.09813471864162], [4.564728263890309, -74.09799801193783], [4.56663997917708, -74.09593236655179], [4.5658080277535715, -74.09715423078354]]	Clinica El Bosque	Portal 20 De Julio
110	M47	GM47 - Portal Sur - Jfk Coop. F → Museo Nacional	#3b82f6	[[4.597701085944941, -74.17019675164364], [4.597638642925169, -74.17045673643489], [4.596751222786298, -74.17078870315842], [4.596317053669561, -74.17056705506349], [4.595754458956238, -74.16627837891492], [4.59574264468938, -74.16277099508221], [4.596403882694173, -74.1546363793718], [4.595579299416156, -74.15185045245023], [4.5949744157424846, -74.14671774382316], [4.595539322253807, -74.14093583573506], [4.593519887699878, -74.13033646179073], [4.593919437902667, -74.12218576065617], [4.595524834656535, -74.11514302859257], [4.598191432644763, -74.10880344030647], [4.598036461655582, -74.10750311914788], [4.601927904391434, -74.10223084617252], [4.606348648201138, -74.09779708056844], [4.603898939121167, -74.09476776372004], [4.597418165389471, -74.08562594041125], [4.595362900386357, -74.08177111643782], [4.594739496251595, -74.08129672966437], [4.61385572312694, -74.06966718562873], [4.6162871870940325, -74.06892418112554], [4.6146988752183535, -74.06949864423436]]	Portal Sur - Jfk Coop. F	Museo Nacional
15	7 E	7-2 - Portal Suba → Polo - Fincomercio	#3b82f6	[[4.746356652143765, -74.09454947772927], [4.745536986380704, -74.09432181833665], [4.745168089567935, -74.09371802442774], [4.744537889215561, -74.09353927171549], [4.741679060175236, -74.09027074182879], [4.741017982863296, -74.08912356921431], [4.738334873767325, -74.08644177502109], [4.737085691726516, -74.08268765185389], [4.7358090341472385, -74.08153757900615], [4.7344340068332285, -74.07960642572644], [4.733853409829906, -74.07818378699655], [4.732927085155439, -74.07699897434603], [4.732794339812506, -74.07575895141167], [4.732160549380724, -74.07512706202934], [4.729416365561778, -74.07472579955498], [4.720387833763533, -74.0747504857274], [4.719117216429935, -74.07405521058661], [4.7131127936457204, -74.07259347677801], [4.705310202141907, -74.0709423512746], [4.7013822937711085, -74.07052277315738], [4.69626210564154, -74.06894003487342], [4.691208732285409, -74.06599715378671], [4.687538255043666, -74.06474166124354], [4.683740994010885, -74.06287829369846], [4.682997250374541, -74.06304252495208], [4.674521968755826, -74.06858388132184], [4.674428843957143, -74.06917579144422], [4.675450191094897, -74.0705468158663], [4.67579941844292, -74.070312381112], [4.6743993303890585, -74.0681315536112], [4.669435708438141, -74.0638031710049]]	Portal Suba	Polo - Fincomercio
111	M51	FM51 - Portal Américas → Portal Américas	#3b82f6	[[4.629175818642738, -74.1734659287633], [4.629823297844691, -74.17218894319436], [4.630572102796009, -74.17247253558638], [4.629468266657426, -74.17442865536167], [4.627288018683868, -74.17329584906854], [4.628920227841676, -74.1697919270972], [4.6403199088749965, -74.15636192828423], [4.635793581106857, -74.15387989827799], [4.633393700383487, -74.15145644016528], [4.6325663883025845, -74.15018348456677], [4.631366817383568, -74.14942969579998], [4.63074378661054, -74.14860146465678], [4.631336158233134, -74.14720230095068], [4.6273400370049655, -74.10637145169832], [4.606016569367517, -74.08266358319997], [4.602154607717254, -74.07787522027319], [4.602350384990558, -74.0764889936123], [4.61385572312694, -74.06966718562873], [4.615019290356097, -74.06924258576369]]	Portal Américas	Portal Américas
112	M82	ML82 - Portal 20 De Julio → Clinica El Bosque	#3b82f6	[[4.5658080277535715, -74.09715423078354], [4.565106750913975, -74.09806333208368], [4.568920220278964, -74.10070408490918], [4.575896745550824, -74.09440015322492], [4.585414049769909, -74.08742931833778], [4.594860449725006, -74.08111430103305], [4.61422768313665, -74.06949056379887], [4.618332097603343, -74.06835697885617], [4.622833624046064, -74.0664951363677], [4.631596169795807, -74.0640830492982], [4.636898965150539, -74.0634823467244], [4.645403281412007, -74.06123743188122], [4.650272537832876, -74.05846871537109], [4.651886456715304, -74.05698944486122], [4.655773054287157, -74.05493695827171], [4.658452404230156, -74.05307438473099], [4.664764801081178, -74.0469685640176], [4.673277416681193, -74.0428045490092], [4.674995726150051, -74.04087363201052], [4.677614349780565, -74.03996811696103], [4.680801535783681, -74.03750531320222], [4.685811092688414, -74.03526763281958], [4.689345086210109, -74.03446585141154], [4.694327277318396, -74.03281770918419], [4.697506803181503, -74.0308352834057], [4.69882905780163, -74.02916923308491], [4.699668200137179, -74.02877222807102], [4.706519683419506, -74.02837613018805], [4.709510787688057, -74.02856651634924], [4.711698203070643, -74.0291143199257], [4.712169878411863, -74.03020638661631], [4.712677020286358, -74.02981799565153], [4.712516365669287, -74.02949246181045], [4.710171598464429, -74.0288948575736]]	Portal 20 De Julio	Clinica El Bosque
113	M82CV	ML82 - Portal 20 De Julio → Clinica El Bosque	#3b82f6	[[4.5658080277535715, -74.09715423078354], [4.565106750913975, -74.09806333208368], [4.568920220278964, -74.10070408490918], [4.575896745550824, -74.09440015322492], [4.585273213649085, -74.08752762705707], [4.594860449725006, -74.08111430103305], [4.611547440029993, -74.07109977697124], [4.612397227638167, -74.07038839485573], [4.6121637423966355, -74.07008968074865], [4.612096711567701, -74.07038406030502], [4.6126990002076615, -74.07110097157455], [4.615674757124453, -74.07250954408282], [4.622036145228348, -74.06945596996322], [4.640312682869088, -74.0661849577732], [4.639498528898308, -74.06284254858848], [4.645269403442837, -74.06130217036366], [4.650272537832876, -74.05846871537109], [4.651886456715304, -74.05698944486122], [4.655773054287157, -74.05493695827171], [4.658644691387483, -74.0529248280736], [4.664764801081178, -74.0469685640176], [4.673277416681193, -74.0428045490092], [4.674995726150051, -74.04087363201052], [4.677614349780565, -74.03996811696103], [4.680801535783681, -74.03750531320222], [4.685811092688414, -74.03526763281958], [4.689345086210109, -74.03446585141154], [4.694327277318396, -74.03281770918419], [4.697506803181503, -74.0308352834057], [4.69882905780163, -74.02916923308491], [4.699668200137179, -74.02877222807102], [4.706519683419506, -74.02837613018805], [4.709510787688057, -74.02856651634924], [4.711698203070643, -74.0291143199257], [4.712169878411863, -74.03020638661631], [4.712677020286358, -74.02981799565153], [4.712516365669287, -74.02949246181045], [4.710171598464429, -74.0288948575736]]	Portal 20 De Julio	Clinica El Bosque
114	M83	HM83 - Portal Usme → Museo Nacional	#3b82f6	[[4.5312655222952, -74.11963873770738], [4.529975620866925, -74.11938846771582], [4.529866778588926, -74.11912433317782], [4.532642209069388, -74.11913515206273], [4.534656371427002, -74.12064872759571], [4.536424877040395, -74.12009095322921], [4.537670944038629, -74.12044933166246], [4.555869007896142, -74.12139566518668], [4.557792278020145, -74.12215261807609], [4.5591397143782695, -74.12327409536242], [4.562134961132119, -74.12478471423765], [4.563639802009734, -74.12500085779341], [4.566610733838098, -74.1265399313398], [4.5673599713602755, -74.12644711431938], [4.570742744063883, -74.12470645671885], [4.5741035142376525, -74.12362834585652], [4.57522002724806, -74.12223989665264], [4.576893668907382, -74.11375399985563], [4.5789708621318335, -74.1069008287653], [4.572180644019184, -74.09790716537019], [4.575896745550824, -74.09440015322492], [4.585273213649085, -74.08752762705707], [4.594860449725006, -74.08111430103305], [4.61385572312694, -74.06966718562873], [4.6162871870940325, -74.06892418112554], [4.6155812620238645, -74.069204703756]]	Portal Usme	Museo Nacional
115	M84	CM84 - Etb Tibabuyes → Calle 72	#3b82f6	[[4.750451368964891, -74.10364203734274], [4.747379847949879, -74.09747624075193], [4.741110901321474, -74.08923264122328], [4.738275029683386, -74.0863501575688], [4.737085691726516, -74.08268765185389], [4.7358090341472385, -74.08153757900615], [4.7344340068332285, -74.07960642572644], [4.733853409829906, -74.07818378699655], [4.73295539364275, -74.0770575650738], [4.732794339812506, -74.07575895141167], [4.732295305008535, -74.07519207270278], [4.729416365561778, -74.07472579955498], [4.720387833763533, -74.0747504857274], [4.719117216429935, -74.07405521058661], [4.7131127936457204, -74.07259347677801], [4.705310202141907, -74.0709423512746], [4.7013822937711085, -74.07052277315738], [4.69626210564154, -74.06894003487342], [4.691208732285409, -74.06599715378671], [4.687538255043666, -74.06474166124354], [4.683740994010885, -74.06287829369846], [4.682997250374541, -74.06304252495208], [4.674521968755826, -74.06858388132184], [4.674428843957143, -74.06917579144422], [4.675399635566704, -74.07053414326502], [4.675808213967082, -74.07033320814482], [4.6743993303890585, -74.0681315536112], [4.666912632002514, -74.0617303958431], [4.666593307622042, -74.06117277821372], [4.667681031182195, -74.06009940975984], [4.6719176766555295, -74.05935338788044], [4.670015134053604, -74.05527340674963], [4.667844063803827, -74.05155674030048], [4.657869228121104, -74.05830531971996]]	Etb Tibabuyes	Calle 72
116	M86	MK86 - Aeropuerto El Dorado → Hacienda Santa Barbara	#3b82f6	[[4.680767462734243, -74.12101970664436], [4.635939884762308, -74.092192571873], [4.634645116951017, -74.09068179323364], [4.632675271421226, -74.08533909505742], [4.631774659587525, -74.08421731129945], [4.613863828573074, -74.07198433872452], [4.612725821365966, -74.07153968902196], [4.611329798593044, -74.07256329667892], [4.610783496720373, -74.0715557936771], [4.61422768313665, -74.06949056379887], [4.618332097603343, -74.06835697885617], [4.622833624046064, -74.0664951363677], [4.63241146598246, -74.06389003164385], [4.636171182923385, -74.06363088976542], [4.645269403442837, -74.06130217036366], [4.650272537832876, -74.05846871537109], [4.651886456715304, -74.05698944486122], [4.655773054287157, -74.05493695827171], [4.658452404230156, -74.05307438473099], [4.664764801081178, -74.0469685640176], [4.673277416681193, -74.0428045490092], [4.674995726150051, -74.04087363201052], [4.677614349780565, -74.03996811696103], [4.680501755181909, -74.03765627826195], [4.685811092688414, -74.03526763281958], [4.692555324180042, -74.03343389487597], [4.695901847351353, -74.03200752207135], [4.695433785858436, -74.03238903869328]]	Aeropuerto El Dorado	Hacienda Santa Barbara
118	MP85	MP85 - AK 68 - CL 9A → Museo Nacional	#3b82f6	[[4.615019290356097, -74.06924258576369], [4.616293280558397, -74.06894232079487], [4.613838825264451, -74.06975748858157], [4.612560027167666, -74.07048759263134], [4.612555663259576, -74.07089516698356], [4.614563570801627, -74.07200637258167], [4.6239692979314375, -74.07891291920026], [4.632002737022819, -74.08426579831436], [4.632749552412936, -74.08533500424448], [4.634734636603903, -74.09057461190847], [4.63558505700269, -74.09170475468153], [4.653006813760001, -74.10314046873135], [4.652791040997341, -74.10377727167678], [4.647219762449037, -74.10854062135351], [4.636683911800176, -74.11918006503643], [4.628808082366299, -74.12264664014161], [4.628623831627596, -74.12327041801649], [4.6289138779993, -74.12429704603804], [4.62908627020452, -74.1240370086477], [4.6287893434316, -74.12107122095063], [4.628453881269127, -74.1206908768008], [4.628673148992598, -74.12238225439371], [4.636220478959741, -74.11923009659598], [4.647070089557347, -74.10834797718434], [4.651495410927712, -74.10494756159312], [4.652871897452067, -74.10362278243309], [4.652954450191634, -74.10317691221906], [4.635564997703606, -74.09187832389854], [4.634469008293314, -74.09032001599773], [4.632675271421226, -74.08533909505742], [4.631604326717444, -74.08408949872882], [4.613863828573074, -74.07198433872452], [4.612725821365966, -74.07153968902196], [4.611300617209646, -74.07253766367833], [4.610807043689977, -74.0715107301569], [4.615019290356097, -74.06924258576369]]	AK 68 - CL 9A	Museo Nacional
117	M86CV	MK86 - Aeropuerto El Dorado → Hacienda Santa Barbara	#3b82f6	[[4.680767462734243, -74.12101970664436], [4.635939884762308, -74.092192571873], [4.634553774037823, -74.09050545896174], [4.632705048675513, -74.08540894870022], [4.632088258174256, -74.08449032216659], [4.617164178909774, -74.07411332300865], [4.615294765130846, -74.07309336842502], [4.614559330568535, -74.07366733563761], [4.613474895835814, -74.07387759420475], [4.611684514903405, -74.0748303049484], [4.612363322209599, -74.07568567290981], [4.613155490776592, -74.07496411910807], [4.612750383108526, -74.0741073445896], [4.621380453693151, -74.06974408120959], [4.632411400666985, -74.06756897044973], [4.631370884364482, -74.06436947971527], [4.631506516123844, -74.0641120339187], [4.636898965150539, -74.0634823467244], [4.645403281412007, -74.06123743188122], [4.650272537832876, -74.05846871537109], [4.651886456715304, -74.05698944486122], [4.655773054287157, -74.05493695827171], [4.658452404230156, -74.05307438473099], [4.664764801081178, -74.0469685640176], [4.673277416681193, -74.0428045490092], [4.674995726150051, -74.04087363201052], [4.677614349780565, -74.03996811696103], [4.680501755181909, -74.03765627826195], [4.685811092688414, -74.03526763281958], [4.692555324180042, -74.03343389487597], [4.695901847351353, -74.03200752207135], [4.695433785858436, -74.03238903869328]]	Aeropuerto El Dorado	Hacienda Santa Barbara
122	S45	GS45 - Portal Sur - Jfk Coop. F → San Mateo - Cc Unisur	#3b82f6	[[4.597246486645696, -74.1689439599664], [4.597366927936546, -74.17051672707512], [4.596413190698121, -74.1709621406846], [4.59622774972217, -74.17157728069995], [4.597011621765703, -74.17735219806035], [4.596679212329574, -74.18330258179707], [4.594876691643363, -74.18769581758346], [4.585756092959773, -74.20600860709743]]	Portal Sur - Jfk Coop. F	San Mateo - Cc Unisur
120	S42	ES42 - 7 De Agosto → San Mateo - Cc Unisur	#3b82f6	[[4.657329939372877, -74.07774741870966], [4.634357704276537, -74.07949980335557], [4.629019411054716, -74.08020696441541], [4.627136534695425, -74.08103338616813], [4.624859553688402, -74.08321477814843], [4.607008268565429, -74.09761461824792], [4.606740553191618, -74.09807399480947], [4.605543975658791, -74.09871176716206], [4.602209166906499, -74.10207093406386], [4.598104123826998, -74.10755043928997], [4.598255051978691, -74.10894372422918], [4.596312441846158, -74.11316884944488], [4.594860013142867, -74.11788784838218], [4.5940839638736115, -74.12171906024001], [4.593595201616311, -74.12771828209962], [4.593712877737775, -74.13103753013085], [4.595693779572254, -74.14162123358591], [4.595076670143365, -74.14643375835243], [4.59561723956666, -74.15173084920373], [4.596504501361817, -74.15438838621219], [4.5958489363172905, -74.16237020500165], [4.59574369394623, -74.1686291766147], [4.59697932179456, -74.17683346288554], [4.5968778493322695, -74.18243447709067], [4.594876691643363, -74.18769581758346], [4.585959253368491, -74.20559013679949]]	7 De Agosto	San Mateo - Cc Unisur
121	S43	KS43 - Portal ElDorado – C.C. → San Mateo - Cc Unisur	#3b82f6	[[4.681584315206324, -74.12118840513403], [4.683251437831483, -74.12239299609936], [4.684625860951709, -74.12436900043339], [4.682902388012874, -74.12255142934907], [4.6790941795894865, -74.11988366661863], [4.635679912627938, -74.0919809364334], [4.634541144919187, -74.0904794894319], [4.632426560035747, -74.08490500570582], [4.630004151912684, -74.08297799328142], [4.631901574191316, -74.08006298888066], [4.631782553331502, -74.07981914655088], [4.629019411054716, -74.08020696441541], [4.6269774026853225, -74.08113487771578], [4.624859553688402, -74.08321477814843], [4.607008268565429, -74.09761461824792], [4.606740553191618, -74.09807399480947], [4.605808003331434, -74.09847971532167], [4.602209166906499, -74.10207093406386], [4.598104123826998, -74.10755043928997], [4.5982871093260975, -74.10883139328955], [4.595904369260862, -74.11433322792692], [4.5940839638736115, -74.12171906024001], [4.593686224614838, -74.12571982902222], [4.5936564803922, -74.13034656066964], [4.595693779572254, -74.14162123358591], [4.595084266942093, -74.14667969077098], [4.5956496025894635, -74.15192581926094], [4.596520904560812, -74.15467360403966], [4.5958489363172905, -74.16237020500165], [4.59574369394623, -74.1686291766147], [4.59697932179456, -74.17683346288554], [4.596900529910171, -74.18221600318564], [4.594876691643363, -74.18769581758346], [4.586509812699007, -74.20446810127225]]	Portal ElDorado – C.C.	San Mateo - Cc Unisur
123	S46	BS46 - Portal Norte-Unicervantes → San Mateo - Cc Unisur	#3b82f6	[[4.75517502814047, -74.0461418849384], [4.74830837418837, -74.04696344467625], [4.680374278557316, -74.05829852306445], [4.678802018119951, -74.05911025659623], [4.6741878110854085, -74.0671956539544], [4.67289493320461, -74.06896512283252], [4.665250480880975, -74.07561929855538], [4.657194956686689, -74.0777705245529], [4.634357704276537, -74.07949980335557], [4.6287377415657405, -74.08029272036987], [4.626803066335313, -74.08126552761834], [4.624766069965036, -74.08329271667434], [4.607008268565429, -74.09761461824792], [4.606740553191618, -74.09807399480947], [4.605543975658791, -74.09871176716206], [4.602209166906499, -74.10207093406386], [4.598104123826998, -74.10755043928997], [4.5982871093260975, -74.10883139328955], [4.595904369260862, -74.11433322792692], [4.5940839638736115, -74.12171906024001], [4.593686224614838, -74.12571982902222], [4.5936564803922, -74.13034656066964], [4.595693779572254, -74.14162123358591], [4.595084266942093, -74.14667969077098], [4.5956496025894635, -74.15192581926094], [4.596520904560812, -74.15467360403966], [4.5958489363172905, -74.16237020500165], [4.59574369394623, -74.1686291766147], [4.59697932179456, -74.17683346288554], [4.596900529910171, -74.18221600318564], [4.594876691643363, -74.18769581758346], [4.585959253368491, -74.20559013679949]]	Portal Norte-Unicervantes	San Mateo - Cc Unisur
124	S48	ES48 - CAD → San Mateo - CC Unisur	#3b82f6	[[4.623524648450357, -74.0841629310019], [4.607008268565429, -74.09761461824792], [4.606740553191618, -74.09807399480947], [4.605808003331434, -74.09847971532167], [4.602209166906499, -74.10207093406386], [4.598104123826998, -74.10755043928997], [4.598255051978691, -74.10894372422918], [4.596312441846158, -74.11316884944488], [4.595364833389949, -74.11601792339869], [4.5940839638736115, -74.12171906024001], [4.593594236143177, -74.1281228489421], [4.593712877737775, -74.13103753013085], [4.595693779572254, -74.14162123358591], [4.595084266942093, -74.14667969077098], [4.5956496025894635, -74.15192581926094], [4.596504501361817, -74.15438838621219], [4.5958489363172905, -74.16237020500165], [4.59574369394623, -74.1686291766147], [4.59697932179456, -74.17683346288554], [4.596900529910171, -74.18221600318564], [4.594876691643363, -74.18769581758346], [4.586509812699007, -74.20446810127225]]	CAD	San Mateo - CC Unisur
125	Z61	AZ61 - Polo → Tibanica - Primavera	#3b82f6	[[4.670092050079264, -74.06433854832622], [4.666479618264002, -74.06138613434707], [4.665356400197325, -74.06088885535496], [4.65597706940334, -74.06257654884453], [4.653239808934983, -74.06395325266102], [4.651060507659577, -74.06443852099859], [4.622186994949467, -74.06960582424733], [4.615269332278973, -74.0729474595791], [4.614559330568535, -74.07366733563761], [4.613149038101542, -74.07401499335212], [4.609563338585511, -74.07585484272778], [4.603831342232032, -74.07981883709576], [4.627313579552838, -74.1062392442311], [4.631091038332002, -74.14316224955793], [4.632050321704991, -74.14923353006807], [4.633583600685365, -74.15126760766562], [4.636377035325909, -74.15402053064433], [4.640794239597, -74.15631554133708], [4.635002362427812, -74.16255336727414], [4.629512572240399, -74.16903863636155], [4.628141090695996, -74.17137131292013], [4.625811789861328, -74.17725305006662], [4.621528695679787, -74.18207444563488], [4.619418305310432, -74.1834195956445], [4.618471011400353, -74.18749699478904], [4.616615346851368, -74.18983403964702], [4.6154863924118965, -74.1927038646485], [4.613231115929145, -74.1950416079414], [4.613125984679551, -74.19753824380871], [4.613594785292364, -74.20002252682461], [4.6133878871987415, -74.20079275683175], [4.6076295751158005, -74.20458562913159], [4.606562225610808, -74.2066349894057]]	Polo	Tibanica - Primavera
126	Z63	FZ63 - Pradera - Plaza Central → Tibanica - Primavera	#3b82f6	[[4.628688228129157, -74.11896166215226], [4.631091038332002, -74.14316224955793], [4.632050321704991, -74.14923353006807], [4.633583600685365, -74.15126760766562], [4.636377035325909, -74.15402053064433], [4.640694826173022, -74.15613719379243], [4.640776151077826, -74.15642546472709], [4.640177742685475, -74.15675527692144], [4.629512572240399, -74.16903863636155], [4.628141090695996, -74.17137131292013], [4.6255535366825, -74.17760973505456], [4.621606464451502, -74.1820315073734], [4.619909832231365, -74.18299709711803], [4.619316750557425, -74.18365505176146], [4.618471011400353, -74.18749699478904], [4.616615346851368, -74.18983403964702], [4.6154863924118965, -74.1927038646485], [4.613231115929145, -74.1950416079414], [4.613125984679551, -74.19753824380871], [4.613594785292364, -74.20002252682461], [4.613293241652156, -74.20094194811445], [4.6076295751158005, -74.20458562913159], [4.606929436866438, -74.20584839266252]]	Pradera - Plaza Central	Tibanica - Primavera
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id, nombre, email, password, creado_en, rol, codigo_operador) FROM stdin;
1	johan ramirez	johansrsr32@gmail.com	$2b$10$vF9QneL60ppLaObkP1vcz.PcMOXxahIYJb8npfUJUsyCFXQ6dej4m	2026-09-30 20:03:18.439096	usuario	\N
2	johan ramirez	johansrs32@gmail.com	$2b$10$TD57FWGqVkuZMxspnoG3YueUh8hUwqVJZ.I3y07Q12o//QAEmGU8i	2026-10-06 18:33:26.303773	usuario	\N
10	johan sanchez	jxhansrs@gmail.com	$2b$10$etVj10zEocihzovhB8wdwu.GTmRCBT0FS9viwvsJkY9E45ZqZtgdS	2026-11-05 19:40:32.687087	operario	OP2383
32	Usuario practica	practica3@transmiflow.local	$2b$10$practiceuserplaceholder0000000000000000000000000000000000000000000	2026-11-19 19:55:12.810913	usuario	\N
33	Usuario practica	practica4@transmiflow.local	$2b$10$practiceuserplaceholder0000000000000000000000000000000000000000000	2026-11-19 19:55:12.810913	usuario	\N
34	Usuario practica	practica6@transmiflow.local	$2b$10$practiceuserplaceholder0000000000000000000000000000000000000000000	2026-11-19 19:55:12.810913	usuario	\N
35	Usuario practica	practica5@transmiflow.local	$2b$10$practiceuserplaceholder0000000000000000000000000000000000000000000	2026-11-19 19:55:12.810913	usuario	\N
36	Usuario practica	practica2@transmiflow.local	$2b$10$practiceuserplaceholder0000000000000000000000000000000000000000000	2026-11-19 19:55:12.810913	usuario	\N
37	Usuario practica	practica1@transmiflow.local	$2b$10$practiceuserplaceholder0000000000000000000000000000000000000000000	2026-11-19 19:55:12.810913	usuario	\N
40	Usuario practica	extra13@transmiflow.local	$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2	2026-11-19 20:47:24.974522	usuario	\N
41	Usuario practica	extra3@transmiflow.local	$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2	2026-11-19 20:47:24.974522	usuario	\N
42	Usuario practica	extra1@transmiflow.local	$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2	2026-11-19 20:47:24.974522	usuario	\N
43	Usuario practica	extra8@transmiflow.local	$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2	2026-11-19 20:47:24.974522	usuario	\N
44	Usuario practica	extra2@transmiflow.local	$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2	2026-11-19 20:47:24.974522	usuario	\N
45	Usuario practica	extra6@transmiflow.local	$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2	2026-11-19 20:47:24.974522	usuario	\N
46	Usuario practica	extra5@transmiflow.local	$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2	2026-11-19 20:47:24.974522	usuario	\N
47	Usuario practica	extra17@transmiflow.local	$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2	2026-11-19 20:47:24.974522	usuario	\N
48	Usuario practica	extra12@transmiflow.local	$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2	2026-11-19 20:47:24.974522	usuario	\N
49	Usuario practica	extra10@transmiflow.local	$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2	2026-11-19 20:47:24.974522	usuario	\N
50	Usuario practica	extra14@transmiflow.local	$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2	2026-11-19 20:47:24.974522	usuario	\N
51	Usuario practica	extra11@transmiflow.local	$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2	2026-11-19 20:47:24.974522	usuario	\N
52	Usuario practica	extra9@transmiflow.local	$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2	2026-11-19 20:47:24.974522	usuario	\N
53	Usuario practica	extra16@transmiflow.local	$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2	2026-11-19 20:47:24.974522	usuario	\N
54	Usuario practica	extra4@transmiflow.local	$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2	2026-11-19 20:47:24.974522	usuario	\N
55	Usuario practica	extra7@transmiflow.local	$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2	2026-11-19 20:47:24.974522	usuario	\N
56	Usuario practica	extra15@transmiflow.local	$2b$10$MZDLUCkCfX.zEw1MQBUUpeu9xXsdSVHiaRyKI2CvJypcjicyINdf2	2026-11-19 20:47:24.974522	usuario	\N
\.


--
-- Data for Name: vagon_rutas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vagon_rutas (id, vagon_id, ruta_id, orden) FROM stdin;
1	2	9	23
2	1	10	6
3	2	19	23
4	2	23	23
5	2	1	23
6	2	24	17
7	2	26	19
8	2	29	25
9	2	31	25
10	2	32	28
11	2	35	28
12	2	39	28
13	2	41	21
14	2	42	23
15	1	44	15
16	2	48	26
17	2	49	23
18	2	54	25
19	1	60	14
20	1	61	16
21	1	62	2
22	1	66	22
23	1	67	16
24	1	68	16
25	1	69	14
26	1	70	17
27	1	73	9
28	1	77	17
29	1	79	14
30	1	82	15
31	1	90	16
32	2	91	17
33	1	95	18
34	1	104	17
35	1	123	16
36	4	3	10
37	3	4	7
38	3	26	7
39	3	28	7
40	3	74	7
41	3	81	7
42	4	94	18
43	4	95	30
44	4	96	26
45	4	97	28
46	4	98	23
47	4	99	27
48	4	100	10
49	4	101	16
50	3	102	7
51	3	116	7
52	3	117	7
53	3	118	6
54	3	121	7
55	6	9	20
56	5	10	9
57	6	19	20
58	5	23	20
59	6	1	20
60	5	24	14
61	5	26	16
62	6	29	22
63	6	31	22
64	6	32	25
65	6	35	25
66	6	39	25
67	5	41	18
68	6	42	20
69	5	44	12
70	6	48	23
71	6	49	20
72	6	54	22
73	6	55	25
74	5	60	17
75	5	61	19
76	5	62	5
77	6	66	25
78	5	67	19
79	6	68	19
80	5	69	17
81	6	70	20
82	5	73	12
83	5	77	20
84	5	79	17
85	5	82	18
86	6	90	19
87	6	91	20
88	6	95	21
89	6	104	20
90	5	120	3
91	5	123	19
92	7	3	2
93	8	4	15
94	7	5	2
95	8	6	10
96	7	36	2
97	7	44	2
98	7	50	2
99	7	52	10
100	7	53	10
101	7	63	2
102	7	72	2
103	7	85	3
104	7	86	2
105	8	89	26
106	8	91	30
107	8	92	26
108	8	93	21
109	7	94	10
110	7	100	2
111	7	101	8
112	8	102	15
113	8	106	18
114	8	107	24
115	7	108	2
116	7	109	8
117	8	110	19
118	8	111	22
119	8	112	10
120	8	113	10
121	8	114	18
122	8	116	15
123	8	118	12
124	9	13	5
125	10	14	12
126	9	22	5
127	9	34	5
128	10	46	25
129	10	47	40
130	10	48	35
131	10	49	32
132	10	50	23
133	10	51	27
134	10	52	23
135	10	53	27
136	9	69	5
137	9	78	5
138	9	79	5
139	9	89	5
140	9	106	5
141	9	107	5
142	11	9	13
143	12	10	16
144	11	19	13
145	11	23	13
146	11	1	13
147	11	24	7
148	11	29	16
149	11	31	16
150	11	32	18
151	11	35	18
152	11	39	18
153	11	41	11
154	11	42	13
155	11	48	16
156	11	49	13
157	12	54	16
158	12	55	18
159	12	56	18
160	12	60	24
161	12	61	26
162	11	62	12
163	12	66	32
164	12	67	26
165	12	68	26
166	12	69	24
167	12	70	27
168	12	73	19
169	12	74	17
170	12	77	27
171	12	79	24
172	12	82	25
173	12	90	25
174	12	97	18
175	11	98	13
176	12	104	27
177	11	120	10
178	11	121	17
179	12	123	26
180	11	124	4
181	13	13	2
182	14	14	15
183	13	22	2
184	13	34	2
185	14	46	28
186	14	47	43
187	14	48	38
188	14	49	35
189	14	50	26
190	14	51	30
191	14	52	26
192	14	53	30
193	13	69	2
194	13	78	2
195	13	79	2
196	13	89	2
197	13	106	2
198	13	107	2
199	16	15	11
200	15	16	6
201	15	33	11
202	16	38	34
203	16	39	34
204	16	40	38
205	16	41	27
206	16	42	29
207	16	43	19
208	16	44	21
209	15	45	8
210	15	57	11
211	15	70	11
212	15	76	11
213	15	77	11
214	15	91	11
215	15	104	11
216	16	115	11
217	18	9	24
218	17	10	5
219	18	19	24
220	18	23	24
221	18	1	24
222	18	24	18
223	18	26	20
224	18	29	26
225	18	31	26
226	18	32	29
227	18	35	29
228	18	39	29
229	18	41	22
230	18	42	24
231	18	44	16
232	18	48	27
233	18	49	24
234	18	54	26
235	17	60	13
236	17	61	15
237	17	62	1
238	17	66	21
239	17	67	15
240	17	68	15
241	17	69	13
242	17	70	16
243	17	73	8
244	17	77	16
245	17	79	13
246	17	82	14
247	17	90	15
248	17	91	16
249	17	95	17
250	17	104	16
251	17	123	15
252	19	13	7
253	20	14	10
254	19	22	7
255	19	34	7
256	20	46	23
257	20	47	38
258	20	48	33
259	20	49	30
260	20	50	21
261	20	51	25
262	20	52	21
263	20	53	25
264	19	69	7
265	19	78	7
266	19	79	7
267	19	89	7
268	19	106	7
269	19	107	7
270	21	7	5
271	22	8	18
272	21	25	5
273	21	30	5
274	21	35	7
275	21	37	7
276	21	38	5
277	21	39	7
278	21	47	7
279	21	48	5
280	22	75	38
281	22	76	40
282	22	77	38
283	22	78	38
284	22	79	35
285	22	80	38
286	22	81	27
287	22	82	36
288	22	83	37
289	22	84	38
290	22	85	17
291	22	86	13
292	21	93	7
293	21	99	7
294	21	114	7
295	23	11	7
296	24	12	13
297	23	20	7
298	23	21	10
299	23	29	7
300	23	31	7
301	23	40	7
302	23	54	7
303	24	57	42
304	24	58	17
305	24	59	17
306	24	60	32
307	24	61	34
308	24	62	20
309	24	63	17
310	24	64	25
311	24	65	10
312	23	87	7
313	23	88	3
314	23	111	7
315	24	125	27
316	23	126	3
317	25	11	8
318	26	12	12
319	25	20	8
320	25	21	11
321	25	29	8
322	25	31	8
323	25	40	8
324	25	54	8
325	26	57	41
326	26	58	16
327	26	59	16
328	26	60	31
329	26	61	33
330	26	62	19
331	26	63	16
332	26	64	24
333	26	65	11
334	25	87	8
335	25	88	4
336	25	111	8
337	26	125	26
338	25	126	2
339	27	15	7
340	28	16	10
341	27	33	7
342	28	38	38
343	28	39	38
344	28	40	42
345	28	41	31
346	28	42	33
347	28	43	23
348	28	44	25
349	28	45	12
350	27	57	7
351	27	70	7
352	27	76	7
353	27	77	7
354	27	91	7
355	27	104	7
356	27	115	7
357	29	15	2
358	30	16	15
359	29	33	2
360	30	38	43
361	30	39	43
362	30	40	47
363	30	41	36
364	30	42	38
365	30	43	28
366	30	44	30
367	30	45	17
368	29	57	2
369	29	70	2
370	29	76	2
371	29	77	2
372	29	91	2
373	29	104	2
374	29	115	2
375	31	11	4
376	32	12	16
377	31	20	4
378	31	21	7
379	31	29	4
380	31	31	4
381	31	40	4
382	31	54	4
383	32	57	45
384	32	58	20
385	32	60	35
386	32	61	37
387	32	62	23
388	32	63	20
389	32	64	28
390	32	65	7
391	31	87	4
392	31	111	4
393	32	125	30
394	31	126	6
395	33	3	7
396	34	4	10
397	34	7	22
398	33	8	1
399	33	26	10
400	33	28	10
401	33	44	8
402	33	74	10
403	33	81	10
404	34	91	26
405	34	94	15
406	34	95	27
407	34	96	23
408	34	97	25
409	34	98	20
410	34	99	24
411	33	100	7
412	34	101	13
413	33	102	10
414	34	116	10
415	34	117	10
416	34	118	11
417	33	121	10
418	36	17	34
419	35	18	1
420	35	35	17
421	35	39	17
422	35	41	10
423	35	48	15
424	35	72	8
425	36	77	28
426	36	79	25
427	36	82	26
428	36	104	28
429	36	105	18
430	36	110	13
431	35	119	4
432	38	11	14
433	37	12	6
434	37	20	14
435	37	21	17
436	37	29	14
437	37	31	14
438	37	40	14
439	38	54	14
440	38	57	35
441	37	58	10
442	38	59	10
443	38	60	25
444	38	61	27
445	37	62	13
446	37	63	10
447	38	64	18
448	38	87	14
449	38	88	10
450	38	90	26
451	38	111	14
452	38	125	20
453	39	3	6
454	40	4	11
455	40	7	21
456	39	8	2
457	39	26	11
458	39	28	11
459	39	44	6
460	39	74	11
461	39	81	11
462	40	91	24
463	40	94	14
464	40	95	26
465	40	96	22
466	40	97	24
467	40	98	19
468	40	99	23
469	39	100	6
470	40	101	12
471	39	102	11
472	40	116	11
473	40	117	11
474	39	118	5
475	39	121	11
476	42	9	19
477	41	10	10
478	42	19	19
479	41	23	19
480	41	1	19
481	41	24	13
482	41	26	15
483	42	29	21
484	42	31	21
485	42	32	24
486	42	35	24
487	42	39	24
488	41	41	17
489	41	42	19
490	41	44	11
491	42	48	22
492	42	49	19
493	42	54	21
494	42	55	24
495	41	60	18
496	41	61	20
497	41	62	6
498	42	66	26
499	42	67	20
500	42	68	20
501	41	69	18
502	42	70	21
503	41	73	13
504	41	77	21
505	41	79	18
506	41	82	19
507	42	90	20
508	42	91	21
509	42	95	22
510	42	104	21
511	41	120	4
512	41	123	20
513	44	3	13
514	43	4	4
515	43	26	4
516	43	28	4
517	43	74	4
518	43	81	4
519	44	94	21
520	44	95	33
521	44	96	29
522	44	97	31
523	44	98	26
524	44	99	30
525	44	100	13
526	44	101	19
527	43	102	4
528	43	116	4
529	43	117	4
530	43	121	4
531	46	7	13
532	45	8	10
533	46	11	19
534	46	17	32
535	45	18	3
536	45	25	13
537	45	27	9
538	45	30	13
539	45	35	15
540	45	37	15
541	45	38	13
542	45	39	15
543	45	41	8
544	45	47	15
545	45	48	13
546	45	72	6
547	46	75	30
548	46	76	32
549	46	77	30
550	46	78	30
551	46	79	27
552	46	80	30
553	46	81	19
554	46	82	28
555	46	83	29
556	46	84	30
557	45	85	9
558	46	93	15
559	45	99	15
560	46	103	32
561	46	104	30
562	46	105	20
563	46	110	15
564	45	119	2
565	47	3	5
566	48	4	12
567	48	7	20
568	47	8	3
569	48	9	17
570	47	10	12
571	48	19	17
572	47	23	17
573	47	1	17
574	47	24	11
575	47	26	14
576	47	28	12
577	47	29	19
578	47	31	19
579	48	32	22
580	48	35	22
581	47	39	22
582	47	41	15
583	47	42	17
584	47	44	5
585	48	48	20
586	47	49	17
587	48	54	19
588	48	55	22
589	48	60	20
590	48	61	22
591	47	62	8
592	48	66	28
593	48	67	22
594	48	68	22
595	48	69	20
596	48	70	23
597	47	73	15
598	47	74	13
599	48	77	23
600	48	79	20
601	47	81	12
602	47	82	21
603	48	90	22
604	48	91	27
605	48	94	13
606	48	95	25
607	48	96	21
608	48	97	22
609	48	98	17
610	48	99	22
611	47	100	5
612	47	101	11
613	47	102	12
614	48	104	23
615	48	116	12
616	48	117	12
617	47	118	4
618	47	120	6
619	47	121	13
620	48	123	22
621	49	9	8
622	50	10	21
623	49	19	8
624	49	23	8
625	49	1	8
626	49	24	2
627	49	32	13
628	49	42	8
629	49	49	8
630	49	55	13
631	50	56	13
632	50	66	37
633	50	67	31
634	50	68	31
635	50	69	29
636	50	70	32
637	50	72	13
638	50	73	24
639	50	74	22
640	49	97	13
641	49	98	8
642	50	105	13
643	49	110	8
644	49	119	9
645	50	120	15
646	50	121	22
647	50	123	31
648	49	124	9
649	52	9	22
650	51	10	7
651	52	19	22
652	51	23	22
653	52	1	22
654	51	24	16
655	51	26	18
656	52	29	24
657	52	31	24
658	52	32	27
659	52	35	27
660	52	39	27
661	52	41	20
662	52	42	22
663	51	44	14
664	52	48	25
665	52	49	22
666	52	54	24
667	52	55	27
668	51	60	15
669	51	61	17
670	51	62	3
671	52	66	23
672	51	67	17
673	52	68	17
674	51	69	15
675	51	70	18
676	51	73	10
677	51	77	18
678	51	79	15
679	51	82	16
680	51	90	17
681	52	91	18
682	52	95	19
683	51	104	18
684	51	120	1
685	51	123	17
686	54	13	9
687	53	14	8
688	53	22	9
689	53	34	9
690	54	46	21
691	54	47	36
692	54	48	31
693	54	49	28
694	54	50	19
695	54	51	23
696	54	52	19
697	54	53	23
698	53	69	9
699	53	78	9
700	53	79	9
701	53	89	9
702	53	106	9
703	53	107	9
704	55	11	10
705	56	12	10
706	55	20	10
707	55	21	13
708	55	29	10
709	55	31	10
710	55	40	10
711	55	54	10
712	56	57	39
713	56	58	14
714	56	59	14
715	56	60	29
716	56	61	31
717	56	62	17
718	56	63	14
719	56	64	22
720	55	87	10
721	55	88	6
722	55	111	10
723	56	125	24
724	58	9	27
725	57	10	2
726	58	13	14
727	57	14	3
728	58	15	16
729	57	16	1
730	58	19	27
731	58	21	36
732	57	22	14
733	58	23	27
734	58	29	29
735	58	33	16
736	57	34	14
737	58	38	29
738	58	40	33
739	57	43	14
740	57	45	3
741	58	46	16
742	58	47	31
743	58	50	14
744	58	51	18
745	58	52	14
746	58	53	18
747	57	57	16
748	57	60	10
749	57	66	18
750	57	73	5
751	57	76	16
752	57	78	14
753	57	89	14
754	58	106	14
755	57	107	14
756	58	115	16
757	57	125	1
758	60	11	18
759	60	17	33
760	59	18	2
761	59	27	8
762	59	35	16
763	59	39	16
764	59	41	9
765	59	48	14
766	59	72	7
767	60	77	29
768	60	79	26
769	60	82	27
770	60	103	33
771	60	104	29
772	60	105	19
773	60	110	14
774	59	119	3
775	61	3	8
776	62	4	9
777	61	26	9
778	61	28	9
779	61	44	7
780	61	74	9
781	61	81	9
782	62	91	25
783	62	94	16
784	62	95	28
785	62	96	24
786	62	97	26
787	62	98	21
788	62	99	25
789	61	100	8
790	62	101	14
791	61	102	9
792	62	116	9
793	61	117	9
794	62	118	10
795	61	121	9
796	64	3	11
797	63	4	6
798	63	26	6
799	63	28	6
800	63	74	6
801	63	81	6
802	64	94	19
803	64	95	31
804	64	96	27
805	64	97	29
806	64	98	24
807	64	99	28
808	64	100	11
809	64	101	17
810	63	102	6
811	63	116	6
812	63	117	6
813	64	118	7
814	63	121	6
815	66	11	13
816	65	12	7
817	65	20	13
818	65	21	16
819	65	29	13
820	65	31	13
821	65	40	13
822	65	54	13
823	66	57	36
824	65	58	11
825	66	59	11
826	66	60	26
827	66	61	28
828	66	62	14
829	65	63	11
830	66	64	19
831	66	87	13
832	65	88	9
833	66	111	13
834	66	125	21
835	67	32	3
836	67	55	3
837	67	56	3
838	67	71	3
839	67	97	3
840	67	105	3
841	68	119	19
842	68	120	25
843	68	121	32
844	68	122	4
845	68	123	41
846	68	124	19
847	70	9	15
848	69	10	14
849	69	19	15
850	69	23	15
851	69	1	15
852	69	24	9
853	69	29	17
854	69	31	17
855	69	32	20
856	69	35	20
857	69	39	20
858	69	41	13
859	69	42	15
860	69	48	18
861	69	49	15
862	70	54	17
863	70	55	20
864	70	56	20
865	70	60	22
866	70	61	24
867	69	62	10
868	70	66	30
869	70	67	24
870	70	68	24
871	70	69	22
872	70	70	25
873	70	73	17
874	70	74	15
875	70	77	25
876	70	79	22
877	70	82	23
878	70	90	24
879	70	97	20
880	70	98	15
881	70	104	25
882	69	120	8
883	69	121	15
884	70	123	24
885	69	124	2
886	71	13	3
887	72	14	14
888	71	22	3
889	71	34	3
890	72	46	27
891	72	47	42
892	72	48	37
893	72	49	34
894	72	50	25
895	72	51	29
896	72	52	25
897	72	53	29
898	71	69	3
899	71	78	3
900	71	79	3
901	71	89	3
902	71	106	3
903	71	107	3
904	74	3	9
905	73	4	8
906	73	26	8
907	73	28	8
908	73	74	8
909	73	81	8
910	74	94	17
911	74	95	29
912	74	96	25
913	74	97	27
914	74	98	22
915	74	99	26
916	74	100	9
917	74	101	15
918	73	102	8
919	73	116	8
920	73	117	8
921	74	118	9
922	73	121	8
923	75	32	2
924	75	55	2
925	75	56	2
926	75	71	2
927	75	97	2
928	75	105	2
929	76	119	20
930	76	120	26
931	76	121	33
932	76	122	5
933	76	123	42
934	76	124	20
935	78	9	25
936	77	10	4
937	78	13	12
938	77	14	5
939	78	15	15
940	77	16	2
941	78	19	25
942	77	22	12
943	78	23	25
944	78	29	27
945	78	33	15
946	77	34	12
947	78	38	30
948	78	39	30
949	78	40	34
950	78	41	23
951	78	42	25
952	78	43	15
953	78	44	17
954	77	45	4
955	78	46	18
956	78	47	33
957	78	48	28
958	78	49	25
959	78	50	16
960	78	51	20
961	78	52	16
962	78	53	20
963	77	57	15
964	77	60	12
965	77	66	20
966	77	69	12
967	77	70	15
968	77	73	7
969	77	76	15
970	77	77	15
971	77	78	12
972	77	79	12
973	77	89	12
974	77	91	15
975	77	104	15
976	77	106	12
977	77	107	12
978	78	115	15
979	79	11	6
980	80	12	14
981	79	20	6
982	79	21	9
983	79	29	6
984	79	31	6
985	79	40	6
986	79	54	6
987	80	57	43
988	80	58	18
989	80	59	18
990	80	60	33
991	80	61	35
992	80	62	21
993	80	63	18
994	80	64	26
995	80	65	9
996	79	87	6
997	79	88	2
998	79	111	6
999	80	125	28
1000	79	126	4
1001	81	13	4
1002	82	14	13
1003	81	22	4
1004	81	34	4
1005	82	46	26
1006	82	47	41
1007	82	48	36
1008	82	49	33
1009	82	50	24
1010	82	51	28
1011	82	52	24
1012	82	53	28
1013	81	69	4
1014	81	78	4
1015	81	79	4
1016	81	89	4
1017	81	106	4
1018	81	107	4
1019	83	15	3
1020	84	16	14
1021	83	33	3
1022	84	38	42
1023	84	39	42
1024	84	40	46
1025	84	41	35
1026	84	42	37
1027	84	43	27
1028	84	44	29
1029	84	45	16
1030	83	57	3
1031	83	70	3
1032	83	76	3
1033	83	77	3
1034	83	91	3
1035	83	104	3
1036	83	115	3
1037	85	9	14
1038	86	10	15
1039	86	11	15
1040	85	12	5
1041	85	19	14
1042	85	20	15
1043	85	21	18
1044	85	23	14
1045	85	1	14
1046	85	24	8
1047	85	29	15
1048	85	31	15
1049	85	32	19
1050	85	35	19
1051	85	39	19
1052	85	40	15
1053	85	41	12
1054	85	42	14
1055	85	48	17
1056	85	49	14
1057	86	54	15
1058	86	55	19
1059	86	56	19
1060	86	57	34
1061	85	58	9
1062	85	59	9
1063	86	60	23
1064	86	61	25
1065	85	62	11
1066	85	63	9
1067	86	64	17
1068	86	66	31
1069	86	67	25
1070	86	68	25
1071	86	69	23
1072	86	70	26
1073	86	73	18
1074	86	74	16
1075	86	77	26
1076	86	79	23
1077	86	82	24
1078	86	87	15
1079	86	88	11
1080	86	90	27
1081	86	97	19
1082	85	98	14
1083	86	104	26
1084	86	111	15
1085	85	120	9
1086	85	121	16
1087	86	123	25
1088	85	124	3
1089	86	125	19
1090	87	7	8
1091	88	8	15
1092	87	25	8
1093	87	30	8
1094	87	35	10
1095	87	37	10
1096	87	38	8
1097	87	39	10
1098	87	47	10
1099	87	48	8
1100	88	75	35
1101	88	76	37
1102	88	77	35
1103	88	78	35
1104	88	79	32
1105	88	80	35
1106	88	81	24
1107	88	82	33
1108	88	83	34
1109	88	84	35
1110	88	85	14
1111	87	93	10
1112	87	99	10
1113	89	17	10
1114	90	18	25
1115	90	22	22
1116	90	23	35
1117	90	1	31
1118	90	24	25
1119	90	25	35
1120	90	26	27
1121	90	27	31
1122	90	28	31
1123	90	29	37
1124	90	30	35
1125	90	31	33
1126	90	32	36
1127	90	33	24
1128	90	34	22
1129	90	35	36
1130	90	36	20
1131	90	37	37
1132	89	43	6
1133	89	46	8
1134	89	51	10
1135	89	60	2
1136	89	61	8
1137	89	66	10
1138	89	67	8
1139	89	68	8
1140	89	75	8
1141	89	80	8
1142	89	82	7
1143	89	83	7
1144	89	84	8
1145	89	90	8
1146	89	92	8
1147	89	95	10
1148	89	96	2
1149	89	103	10
1150	89	123	8
1151	91	17	1
1152	92	18	34
1153	92	23	44
1154	92	26	36
1155	92	27	40
1156	92	34	31
1157	91	51	1
1158	91	66	1
1159	91	95	1
1160	91	103	1
1161	93	17	15
1162	94	18	20
1163	94	22	17
1164	94	23	30
1165	94	25	30
1166	94	27	26
1167	94	28	26
1168	94	29	32
1169	94	30	30
1170	94	33	19
1171	94	34	17
1172	94	36	15
1173	94	37	32
1174	93	43	11
1175	93	46	13
1176	93	51	15
1177	93	60	7
1178	93	66	15
1179	93	75	13
1180	93	80	13
1181	93	83	12
1182	93	84	13
1183	93	92	13
1184	93	96	7
1185	93	103	15
1186	95	17	4
1187	96	18	31
1188	96	22	28
1189	96	23	41
1190	96	1	37
1191	96	24	31
1192	96	25	41
1193	96	26	33
1194	96	27	37
1195	96	30	41
1196	96	31	39
1197	96	32	42
1198	96	34	28
1199	96	35	42
1200	96	36	26
1201	96	37	43
1202	95	46	2
1203	95	51	4
1204	95	61	2
1205	95	66	4
1206	95	67	2
1207	95	68	2
1208	95	75	2
1209	95	80	2
1210	95	82	1
1211	95	83	1
1212	95	84	2
1213	95	90	2
1214	95	92	2
1215	95	95	4
1216	95	103	4
1217	95	123	2
1218	97	17	12
1219	98	18	23
1220	98	22	20
1221	98	23	33
1222	98	1	29
1223	98	24	23
1224	98	25	33
1225	98	26	25
1226	98	27	29
1227	98	28	29
1228	98	29	35
1229	98	30	33
1230	98	31	31
1231	98	32	34
1232	98	33	22
1233	98	34	20
1234	98	35	34
1235	98	36	18
1236	98	37	35
1237	97	43	8
1238	97	46	10
1239	97	51	12
1240	97	60	4
1241	97	61	10
1242	97	66	12
1243	97	67	10
1244	97	68	10
1245	97	75	10
1246	97	80	10
1247	97	82	9
1248	97	83	9
1249	97	84	10
1250	97	90	10
1251	97	92	10
1252	97	95	12
1253	97	96	4
1254	97	103	12
1255	97	123	10
1256	99	17	14
1257	100	18	21
1258	100	22	18
1259	100	23	31
1260	100	1	27
1261	100	24	21
1262	100	25	31
1263	100	26	23
1264	100	27	27
1265	100	28	27
1266	100	29	33
1267	100	30	31
1268	100	31	29
1269	100	32	32
1270	100	33	20
1271	100	34	18
1272	100	35	32
1273	100	36	16
1274	100	37	33
1275	99	43	10
1276	99	46	12
1277	99	51	14
1278	99	60	6
1279	99	61	12
1280	99	66	14
1281	99	67	12
1282	99	68	12
1283	99	75	12
1284	99	80	12
1285	99	82	11
1286	99	83	11
1287	99	84	12
1288	99	90	12
1289	99	92	12
1290	99	95	14
1291	99	96	6
1292	99	103	14
1293	99	123	12
1294	101	17	8
1295	102	18	27
1296	102	22	24
1297	102	23	37
1298	102	1	33
1299	102	24	27
1300	102	25	37
1301	102	26	29
1302	102	27	33
1303	102	30	37
1304	102	31	35
1305	102	32	38
1306	102	33	26
1307	102	34	24
1308	102	35	38
1309	102	36	22
1310	102	37	39
1311	101	43	4
1312	101	46	6
1313	101	51	8
1314	101	61	6
1315	101	66	8
1316	101	67	6
1317	101	68	6
1318	101	75	6
1319	101	80	6
1320	101	82	5
1321	101	83	5
1322	101	84	6
1323	101	90	6
1324	101	92	6
1325	101	95	8
1326	101	103	8
1327	101	123	6
1328	103	17	3
1329	104	18	32
1330	104	22	29
1331	104	23	42
1332	104	1	38
1333	104	24	32
1334	104	25	42
1335	104	26	34
1336	104	27	38
1337	104	30	42
1338	104	31	40
1339	104	32	43
1340	104	34	29
1341	104	36	27
1342	104	37	44
1343	103	46	1
1344	103	51	3
1345	103	61	1
1346	103	66	3
1347	103	67	1
1348	103	68	1
1349	103	75	1
1350	103	80	1
1351	103	84	1
1352	103	90	1
1353	103	92	1
1354	103	95	3
1355	103	103	3
1356	103	123	1
1357	105	17	2
1358	106	18	33
1359	106	23	43
1360	106	26	35
1361	106	27	39
1362	106	34	30
1363	105	51	2
1364	105	66	2
1365	105	95	2
1366	105	103	2
1367	107	17	9
1368	108	18	26
1369	108	22	23
1370	108	23	36
1371	108	1	32
1372	108	24	26
1373	108	25	36
1374	108	26	28
1375	108	27	32
1376	108	28	32
1377	108	29	38
1378	108	30	36
1379	108	31	34
1380	108	32	37
1381	108	33	25
1382	108	34	23
1383	108	35	37
1384	108	36	21
1385	108	37	38
1386	107	43	5
1387	107	46	7
1388	107	51	9
1389	107	60	1
1390	107	61	7
1391	107	66	9
1392	107	67	7
1393	107	68	7
1394	107	75	7
1395	107	80	7
1396	107	82	6
1397	107	83	6
1398	107	84	7
1399	107	90	7
1400	107	92	7
1401	107	95	9
1402	107	96	1
1403	107	103	9
1404	107	123	7
1405	109	17	7
1406	110	18	28
1407	110	22	25
1408	110	23	38
1409	110	1	34
1410	110	24	28
1411	110	25	38
1412	110	26	30
1413	110	27	34
1414	110	30	38
1415	110	31	36
1416	110	32	39
1417	110	33	27
1418	110	34	25
1419	110	35	39
1420	110	36	23
1421	110	37	40
1422	109	43	3
1423	109	46	5
1424	109	51	7
1425	109	61	5
1426	109	66	7
1427	109	67	5
1428	109	68	5
1429	109	75	5
1430	109	80	5
1431	109	82	4
1432	109	83	4
1433	109	84	5
1434	109	90	5
1435	109	92	5
1436	109	95	7
1437	109	103	7
1438	109	123	5
1439	111	17	11
1440	112	18	24
1441	112	22	21
1442	112	23	34
1443	112	1	30
1444	112	24	24
1445	112	25	34
1446	112	26	26
1447	112	27	30
1448	112	28	30
1449	112	29	36
1450	112	30	34
1451	112	31	32
1452	112	32	35
1453	112	33	23
1454	112	34	21
1455	112	35	35
1456	112	36	19
1457	112	37	36
1458	111	43	7
1459	111	46	9
1460	111	51	11
1461	111	60	3
1462	111	61	9
1463	111	66	11
1464	111	67	9
1465	111	68	9
1466	111	75	9
1467	111	80	9
1468	111	82	8
1469	111	83	8
1470	111	84	9
1471	111	90	9
1472	111	92	9
1473	111	95	11
1474	111	96	3
1475	111	103	11
1476	111	123	9
1477	114	9	28
1478	113	10	1
1479	114	13	15
1480	113	14	2
1481	113	17	17
1482	114	18	18
1483	114	19	28
1484	114	21	35
1485	114	22	15
1486	114	23	28
1487	114	25	28
1488	114	27	24
1489	114	28	24
1490	114	29	30
1491	114	30	28
1492	114	33	17
1493	113	34	15
1494	113	36	13
1495	114	37	30
1496	114	38	28
1497	114	40	32
1498	113	43	13
1499	113	45	2
1500	114	46	15
1501	114	47	30
1502	113	50	13
1503	114	51	17
1504	113	52	13
1505	114	53	17
1506	113	57	17
1507	113	60	9
1508	113	66	17
1509	113	73	4
1510	113	75	15
1511	113	76	17
1512	113	78	15
1513	113	80	15
1514	113	83	14
1515	113	84	15
1516	114	89	15
1517	114	92	15
1518	113	96	9
1519	113	103	17
1520	114	106	15
1521	113	107	15
1522	114	115	17
1523	113	125	2
1524	115	17	5
1525	116	18	30
1526	116	22	27
1527	116	23	40
1528	116	1	36
1529	116	24	30
1530	116	25	40
1531	116	26	32
1532	116	27	36
1533	116	30	40
1534	116	31	38
1535	116	32	41
1536	116	33	29
1537	116	34	27
1538	116	35	41
1539	116	36	25
1540	116	37	42
1541	115	43	1
1542	115	46	3
1543	115	51	5
1544	115	61	3
1545	115	66	5
1546	115	67	3
1547	115	68	3
1548	115	75	3
1549	115	80	3
1550	115	82	2
1551	115	83	2
1552	115	84	3
1553	115	90	3
1554	115	92	3
1555	115	95	5
1556	115	103	5
1557	115	123	3
1558	117	17	13
1559	118	18	22
1560	118	22	19
1561	118	23	32
1562	118	1	28
1563	118	24	22
1564	118	25	32
1565	118	26	24
1566	118	27	28
1567	118	28	28
1568	118	29	34
1569	118	30	32
1570	118	31	30
1571	118	32	33
1572	118	33	21
1573	118	34	19
1574	118	35	33
1575	118	36	17
1576	118	37	34
1577	117	43	9
1578	117	46	11
1579	117	51	13
1580	117	60	5
1581	117	61	11
1582	117	66	13
1583	117	67	11
1584	117	68	11
1585	117	75	11
1586	117	80	11
1587	117	82	10
1588	117	83	10
1589	117	84	11
1590	117	90	11
1591	117	92	11
1592	117	95	13
1593	117	96	5
1594	117	103	13
1595	117	123	11
1596	119	17	6
1597	120	18	29
1598	120	22	26
1599	120	23	39
1600	120	1	35
1601	120	24	29
1602	120	25	39
1603	120	26	31
1604	120	27	35
1605	120	30	39
1606	120	31	37
1607	120	32	40
1608	120	33	28
1609	120	34	26
1610	120	35	40
1611	120	36	24
1612	120	37	41
1613	119	43	2
1614	119	46	4
1615	119	51	6
1616	119	61	4
1617	119	66	6
1618	119	67	4
1619	119	68	4
1620	119	75	4
1621	119	80	4
1622	119	82	3
1623	119	83	3
1624	119	84	4
1625	119	90	4
1626	119	92	4
1627	119	95	6
1628	119	103	6
1629	119	123	4
1630	122	17	24
1631	121	18	11
1632	122	20	25
1633	122	21	28
1634	121	25	21
1635	121	27	17
1636	122	28	17
1637	121	30	21
1638	121	36	6
1639	122	37	23
1640	121	38	21
1641	122	40	25
1642	122	47	23
1643	121	50	6
1644	121	53	15
1645	121	57	24
1646	121	64	7
1647	122	75	22
1648	122	76	24
1649	121	78	22
1650	122	80	22
1651	122	83	21
1652	121	84	22
1653	122	89	22
1654	122	92	22
1655	121	96	16
1656	121	101	5
1657	122	103	24
1658	122	107	21
1659	121	109	5
1660	122	113	14
1661	122	117	18
1662	121	125	9
1663	124	13	10
1664	123	14	7
1665	123	22	10
1666	123	34	10
1667	124	46	20
1668	124	47	35
1669	124	48	30
1670	124	49	27
1671	124	50	18
1672	124	51	22
1673	124	52	18
1674	124	53	22
1675	123	69	10
1676	123	78	10
1677	123	79	10
1678	123	89	10
1679	123	106	10
1680	123	107	10
1681	126	1	26
1682	126	24	20
1683	126	26	22
1684	126	31	28
1685	126	32	31
1686	126	35	31
1687	125	61	13
1688	125	67	13
1689	125	68	13
1690	125	82	12
1691	125	90	13
1692	125	95	15
1693	125	123	13
1694	128	5	9
1695	127	6	3
1696	127	27	3
1697	127	41	3
1698	127	52	3
1699	127	53	3
1700	127	86	9
1701	127	94	3
1702	128	102	22
1703	128	103	38
1704	128	104	35
1705	128	106	25
1706	128	107	31
1707	128	108	9
1708	128	109	15
1709	127	112	3
1710	127	113	3
1711	128	114	11
1712	130	11	17
1713	129	12	3
1714	130	20	17
1715	130	21	20
1716	129	40	17
1717	130	57	32
1718	129	58	7
1719	129	59	7
1720	129	63	7
1721	129	64	15
1722	130	87	17
1723	130	88	13
1724	130	90	29
1725	130	111	17
1726	129	125	17
1727	131	32	4
1728	131	55	4
1729	131	56	4
1730	132	71	4
1731	131	97	4
1732	131	105	4
1733	132	119	18
1734	132	120	24
1735	132	121	31
1736	131	122	3
1737	132	123	40
1738	132	124	18
1739	134	17	19
1740	133	18	16
1741	134	19	30
1742	134	20	30
1743	134	21	33
1744	134	25	26
1745	134	27	22
1746	134	28	22
1747	134	30	26
1748	133	36	11
1749	134	37	28
1750	134	38	26
1751	134	40	30
1752	134	47	28
1753	133	50	11
1754	133	57	19
1755	133	64	2
1756	133	73	2
1757	133	75	17
1758	133	76	19
1759	133	78	17
1760	133	80	17
1761	133	83	16
1762	133	84	17
1763	134	89	17
1764	134	92	17
1765	133	96	11
1766	133	103	19
1767	133	125	4
1768	135	3	4
1769	136	4	13
1770	136	7	19
1771	135	8	4
1772	135	28	13
1773	135	44	4
1774	135	81	13
1775	136	91	28
1776	135	94	12
1777	136	96	20
1778	136	99	21
1779	135	100	4
1780	135	101	10
1781	136	102	13
1782	136	116	13
1783	136	117	13
1784	135	118	3
1785	138	11	12
1786	137	12	8
1787	137	20	12
1788	137	21	15
1789	137	29	12
1790	137	31	12
1791	137	40	12
1792	137	54	12
1793	138	57	37
1794	138	58	12
1795	138	59	12
1796	138	60	27
1797	138	61	29
1798	138	62	15
1799	138	63	12
1800	138	64	20
1801	138	87	12
1802	137	88	8
1803	138	111	12
1804	138	125	22
1805	139	35	4
1806	139	37	4
1807	139	39	4
1808	139	47	4
1809	140	77	41
1810	140	78	41
1811	140	81	30
1812	140	82	39
1813	140	84	41
1814	140	85	20
1815	140	86	16
1816	139	93	4
1817	139	99	4
1818	139	114	4
1819	142	7	14
1820	141	8	9
1821	142	11	20
1822	141	12	2
1823	142	17	31
1824	141	18	4
1825	142	20	18
1826	142	21	21
1827	141	25	14
1828	141	27	10
1829	141	30	14
1830	141	37	16
1831	141	38	14
1832	141	40	18
1833	141	47	16
1834	142	57	31
1835	141	58	6
1836	141	59	6
1837	141	63	6
1838	141	64	14
1839	142	75	29
1840	142	76	31
1841	142	78	29
1842	142	80	29
1843	142	81	18
1844	142	83	28
1845	142	84	29
1846	141	85	8
1847	142	87	18
1848	142	88	14
1849	142	90	30
1850	142	93	16
1851	141	99	16
1852	142	103	31
1853	142	111	18
1854	141	125	16
1855	143	9	12
1856	144	10	17
1857	143	19	12
1858	143	23	12
1859	143	1	12
1860	143	24	6
1861	143	32	17
1862	143	42	12
1863	143	49	12
1864	144	55	17
1865	144	56	17
1866	144	66	33
1867	144	67	27
1868	144	68	27
1869	144	69	25
1870	144	70	28
1871	143	72	9
1872	144	73	20
1873	144	74	18
1874	143	97	17
1875	143	98	12
1876	144	105	17
1877	144	110	12
1878	143	119	5
1879	143	120	11
1880	144	121	18
1881	144	123	27
1882	143	124	5
1883	146	3	12
1884	145	4	5
1885	145	26	5
1886	145	28	5
1887	145	74	5
1888	145	81	5
1889	146	94	20
1890	146	95	32
1891	146	96	28
1892	146	97	30
1893	146	98	25
1894	146	99	29
1895	146	100	12
1896	146	101	18
1897	145	102	5
1898	145	116	5
1899	145	117	5
1900	145	121	5
1901	147	11	3
1902	148	12	17
1903	147	20	3
1904	147	21	6
1905	147	29	3
1906	147	31	3
1907	147	40	3
1908	147	54	3
1909	148	57	46
1910	148	58	21
1911	148	60	36
1912	148	61	38
1913	148	62	24
1914	148	63	21
1915	148	64	29
1916	147	65	6
1917	147	87	3
1918	147	111	3
1919	148	125	31
1920	148	126	7
1921	150	5	8
1922	149	6	4
1923	149	27	4
1924	149	41	4
1925	149	52	4
1926	149	53	4
1927	149	86	8
1928	149	94	4
1929	150	102	21
1930	150	103	37
1931	150	104	34
1932	150	106	24
1933	150	107	30
1934	150	108	8
1935	150	109	14
1936	149	112	4
1937	149	113	4
1938	150	114	12
1939	151	5	5
1940	152	6	7
1941	151	27	7
1942	151	41	7
1943	151	52	7
1944	151	53	7
1945	151	72	5
1946	151	86	5
1947	151	94	7
1948	152	102	18
1949	152	103	34
1950	152	104	31
1951	152	105	21
1952	152	106	21
1953	152	107	27
1954	151	108	5
1955	152	109	11
1956	152	110	16
1957	152	112	7
1958	151	113	7
1959	152	114	15
1960	151	119	1
1961	154	17	22
1962	153	18	13
1963	154	20	27
1964	154	21	30
1965	154	25	23
1966	153	27	19
1967	154	28	19
1968	154	30	23
1969	153	36	8
1970	154	37	25
1971	154	38	23
1972	154	40	27
1973	154	47	25
1974	153	50	8
1975	153	57	22
1976	153	64	5
1977	153	75	20
1978	153	76	22
1979	153	78	20
1980	153	80	20
1981	153	83	19
1982	153	84	20
1983	154	89	20
1984	154	92	20
1985	153	96	14
1986	153	101	3
1987	154	103	22
1988	154	107	19
1989	153	109	3
1990	153	125	7
1991	155	7	3
1992	156	8	20
1993	155	25	3
1994	155	30	3
1995	155	38	3
1996	155	48	3
1997	156	75	40
1998	156	76	42
1999	156	79	37
2000	156	80	40
2001	156	83	39
2002	158	9	18
2003	157	10	11
2004	158	19	18
2005	157	23	18
2006	157	1	18
2007	157	24	12
2008	157	26	12
2009	158	29	20
2010	157	31	20
2011	158	32	23
2012	158	35	23
2013	158	39	23
2014	157	41	16
2015	157	42	18
2016	157	44	9
2017	158	48	21
2018	157	49	18
2019	158	54	20
2020	158	55	23
2021	157	60	19
2022	158	61	21
2023	157	62	7
2024	158	66	27
2025	158	67	21
2026	158	68	21
2027	158	69	19
2028	158	70	22
2029	157	73	14
2030	157	74	12
2031	157	77	22
2032	157	79	19
2033	157	82	20
2034	158	90	21
2035	158	91	22
2036	158	95	23
2037	158	97	23
2038	158	98	18
2039	158	104	22
2040	157	120	5
2041	157	121	12
2042	157	123	21
2043	159	3	3
2044	160	4	14
2045	160	7	18
2046	159	8	5
2047	160	17	27
2048	159	18	8
2049	160	20	22
2050	160	21	25
2051	159	25	18
2052	159	27	14
2053	159	28	14
2054	159	30	18
2055	159	36	3
2056	159	37	20
2057	159	38	18
2058	159	40	22
2059	159	44	3
2060	159	47	20
2061	159	50	3
2062	159	53	12
2063	160	57	27
2064	159	64	10
2065	160	75	25
2066	160	76	27
2067	160	78	25
2068	160	80	25
2069	159	81	14
2070	160	83	24
2071	160	84	25
2072	159	85	4
2073	160	89	25
2074	160	91	29
2075	160	92	25
2076	160	93	20
2077	159	94	11
2078	160	96	19
2079	160	99	20
2080	159	100	3
2081	159	101	9
2082	160	102	14
2083	160	103	27
2084	160	113	11
2085	160	116	14
2086	160	117	15
2087	159	118	2
2088	159	125	12
2089	161	9	6
2090	162	10	23
2091	161	19	6
2092	161	23	6
2093	161	1	6
2094	161	32	11
2095	161	42	6
2096	161	49	6
2097	161	55	11
2098	162	56	11
2099	162	66	39
2100	162	67	33
2101	162	69	31
2102	162	70	34
2103	162	72	15
2104	162	73	26
2105	162	74	24
2106	161	97	11
2107	161	98	6
2108	162	105	11
2109	161	110	6
2110	162	119	11
2111	162	120	17
2112	162	121	24
2113	162	123	33
2114	162	124	11
2115	163	32	5
2116	163	55	5
2117	163	56	5
2118	164	71	5
2119	163	97	5
2120	163	105	5
2121	164	119	17
2122	164	120	23
2123	164	121	30
2124	163	122	2
2125	164	123	39
2126	164	124	17
2127	166	9	16
2128	165	10	13
2129	166	19	16
2130	165	23	16
2131	165	1	16
2132	165	24	10
2133	165	26	13
2134	165	29	18
2135	165	31	18
2136	165	32	21
2137	165	35	21
2138	165	39	21
2139	165	41	14
2140	165	42	16
2141	165	44	10
2142	165	48	19
2143	165	49	16
2144	166	54	18
2145	166	55	21
2146	166	56	21
2147	166	60	21
2148	166	61	23
2149	165	62	9
2150	166	66	29
2151	166	67	23
2152	166	68	23
2153	166	69	21
2154	166	70	24
2155	166	73	16
2156	165	74	14
2157	166	77	24
2158	166	79	21
2159	166	82	22
2160	166	90	23
2161	166	91	23
2162	166	95	24
2163	166	97	21
2164	166	98	16
2165	166	104	24
2166	165	120	7
2167	165	121	14
2168	166	123	23
2169	165	124	1
2170	167	11	5
2171	168	12	15
2172	167	20	5
2173	167	21	8
2174	167	29	5
2175	167	31	5
2176	167	40	5
2177	167	54	5
2178	168	57	44
2179	168	58	19
2180	168	59	19
2181	168	60	34
2182	168	61	36
2183	168	62	22
2184	168	63	19
2185	168	64	27
2186	168	65	8
2187	167	87	5
2188	167	88	1
2189	167	111	5
2190	168	125	29
2191	167	126	5
2192	170	7	16
2193	169	8	7
2194	170	17	29
2195	169	18	6
2196	170	20	20
2197	170	21	23
2198	169	25	16
2199	169	27	12
2200	169	30	16
2201	169	37	18
2202	169	38	16
2203	169	40	20
2204	169	47	18
2205	170	57	29
2206	169	64	12
2207	170	75	27
2208	170	76	29
2209	170	78	27
2210	170	80	27
2211	169	81	16
2212	170	83	26
2213	170	84	27
2214	169	85	6
2215	170	93	18
2216	170	99	18
2217	170	103	29
2218	169	125	14
2219	172	7	15
2220	171	8	8
2221	172	11	22
2222	171	12	1
2223	172	17	30
2224	171	18	5
2225	172	20	19
2226	172	21	22
2227	171	25	15
2228	171	27	11
2229	171	30	15
2230	171	37	17
2231	171	38	15
2232	171	40	19
2233	171	47	17
2234	172	57	30
2235	171	58	5
2236	171	59	5
2237	171	63	5
2238	171	64	13
2239	172	75	28
2240	172	76	30
2241	172	78	28
2242	172	80	28
2243	172	81	17
2244	172	83	27
2245	172	84	28
2246	171	85	7
2247	172	87	19
2248	172	88	15
2249	172	90	31
2250	172	93	17
2251	172	99	17
2252	172	103	30
2253	172	111	19
2254	171	125	15
2255	174	9	21
2256	173	10	8
2257	174	19	21
2258	173	23	21
2259	174	1	21
2260	173	24	15
2261	173	26	17
2262	174	29	23
2263	174	31	23
2264	174	32	26
2265	174	35	26
2266	174	39	26
2267	174	41	19
2268	174	42	21
2269	173	44	13
2270	174	48	24
2271	174	49	21
2272	174	54	23
2273	174	55	26
2274	173	60	16
2275	173	61	18
2276	173	62	4
2277	174	66	24
2278	173	67	18
2279	174	68	18
2280	173	69	16
2281	173	70	19
2282	173	73	11
2283	173	77	19
2284	173	79	16
2285	173	82	17
2286	174	90	18
2287	174	91	19
2288	174	95	20
2289	174	104	19
2290	173	120	2
2291	173	123	18
2292	176	13	16
2293	175	14	1
2294	176	17	18
2295	175	18	17
2296	176	19	29
2297	176	20	31
2298	176	21	34
2299	176	25	27
2300	176	27	23
2301	176	28	23
2302	176	30	27
2303	175	36	12
2304	176	37	29
2305	176	38	27
2306	176	40	31
2307	175	45	1
2308	176	47	29
2309	175	50	12
2310	175	52	12
2311	176	53	16
2312	175	57	18
2313	175	64	1
2314	175	73	3
2315	175	75	16
2316	175	76	18
2317	175	78	16
2318	175	80	16
2319	175	83	15
2320	175	84	16
2321	176	89	16
2322	176	92	16
2323	175	96	10
2324	175	103	18
2325	175	125	3
2326	178	17	21
2327	177	18	14
2328	178	20	28
2329	178	21	31
2330	178	25	24
2331	177	27	20
2332	178	28	20
2333	178	30	24
2334	177	36	9
2335	178	37	26
2336	178	38	24
2337	178	40	28
2338	178	47	26
2339	177	50	9
2340	177	57	21
2341	177	64	4
2342	177	75	19
2343	177	76	21
2344	177	78	19
2345	177	80	19
2346	177	83	18
2347	177	84	19
2348	178	89	19
2349	178	92	19
2350	177	96	13
2351	177	101	2
2352	178	103	21
2353	178	107	18
2354	177	109	2
2355	177	125	6
2356	179	17	16
2357	180	18	19
2358	180	22	16
2359	180	23	29
2360	180	25	29
2361	180	27	25
2362	180	28	25
2363	180	29	31
2364	180	30	29
2365	180	33	18
2366	180	34	16
2367	180	36	14
2368	180	37	31
2369	179	43	12
2370	179	46	14
2371	180	51	16
2372	179	60	8
2373	179	66	16
2374	179	75	14
2375	179	80	14
2376	179	83	13
2377	179	84	14
2378	179	92	14
2379	179	96	8
2380	179	103	16
2381	180	106	16
2382	179	107	16
2383	180	115	18
2384	181	9	9
2385	182	10	20
2386	181	19	9
2387	181	23	9
2388	181	1	9
2389	181	24	3
2390	181	32	14
2391	181	42	9
2392	181	49	9
2393	182	55	14
2394	182	56	14
2395	182	66	36
2396	182	67	30
2397	182	68	30
2398	182	69	28
2399	182	70	31
2400	182	72	12
2401	182	73	23
2402	182	74	21
2403	181	97	14
2404	181	98	9
2405	182	105	14
2406	181	110	9
2407	181	119	8
2408	182	120	14
2409	182	121	21
2410	182	123	30
2411	181	124	8
2412	184	5	10
2413	183	6	2
2414	183	27	2
2415	183	41	2
2416	183	52	2
2417	183	53	2
2418	184	86	10
2419	183	94	2
2420	184	102	23
2421	184	103	39
2422	184	104	36
2423	184	106	26
2424	184	107	32
2425	184	108	10
2426	184	109	16
2427	183	112	2
2428	183	113	2
2429	184	114	10
2430	186	13	11
2431	185	14	6
2432	185	22	11
2433	185	34	11
2434	186	46	19
2435	186	47	34
2436	186	48	29
2437	186	49	26
2438	186	50	17
2439	186	51	21
2440	186	52	17
2441	186	53	21
2442	185	69	11
2443	185	78	11
2444	185	79	11
2445	185	89	11
2446	185	106	11
2447	185	107	11
2448	187	13	1
2449	188	14	16
2450	187	22	1
2451	187	34	1
2452	188	46	29
2453	188	47	44
2454	188	48	39
2455	188	49	36
2456	188	50	27
2457	188	51	31
2458	188	52	27
2459	188	53	31
2460	187	69	1
2461	187	78	1
2462	187	79	1
2463	187	89	1
2464	187	106	1
2465	187	107	1
2466	189	7	7
2467	190	8	16
2468	189	25	7
2469	189	30	7
2470	189	35	9
2471	189	37	9
2472	189	38	7
2473	189	39	9
2474	189	47	9
2475	189	48	7
2476	190	75	36
2477	190	76	38
2478	190	77	36
2479	190	78	36
2480	190	79	33
2481	190	80	36
2482	190	81	25
2483	190	82	34
2484	190	83	35
2485	190	84	36
2486	190	85	15
2487	190	86	11
2488	189	93	9
2489	189	99	9
2490	189	114	9
2491	191	35	3
2492	191	37	3
2493	191	39	3
2494	191	47	3
2495	192	77	42
2496	192	78	42
2497	192	81	31
2498	192	82	40
2499	192	84	42
2500	192	85	21
2501	192	86	17
2502	191	93	3
2503	191	99	3
2504	191	114	3
2505	193	7	10
2506	194	8	13
2507	193	25	10
2508	193	30	10
2509	193	35	12
2510	193	37	12
2511	193	38	10
2512	193	39	12
2513	193	47	12
2514	193	48	10
2515	194	75	33
2516	194	76	35
2517	194	77	33
2518	194	78	33
2519	194	79	30
2520	194	80	33
2521	194	81	22
2522	194	82	31
2523	194	83	32
2524	194	84	33
2525	194	85	12
2526	194	93	12
2527	193	99	12
2528	195	15	5
2529	196	16	12
2530	195	33	5
2531	196	38	40
2532	196	39	40
2533	196	40	44
2534	196	41	33
2535	196	42	35
2536	196	43	25
2537	196	44	27
2538	196	45	14
2539	195	57	5
2540	195	70	5
2541	195	76	5
2542	195	77	5
2543	195	91	5
2544	195	104	5
2545	195	115	5
2546	197	11	9
2547	198	12	11
2548	197	20	9
2549	197	21	12
2550	197	29	9
2551	197	31	9
2552	197	40	9
2553	197	54	9
2554	198	57	40
2555	198	58	15
2556	198	59	15
2557	198	60	30
2558	198	61	32
2559	198	62	18
2560	198	63	15
2561	198	64	23
2562	198	65	12
2563	197	87	9
2564	197	88	5
2565	197	111	9
2566	198	118	8
2567	198	125	25
2568	197	126	1
2569	199	5	3
2570	200	6	9
2571	199	52	9
2572	199	53	9
2573	199	63	3
2574	199	72	3
2575	199	86	3
2576	199	94	9
2577	200	102	16
2578	200	106	19
2579	200	107	25
2580	199	108	3
2581	200	109	9
2582	200	110	18
2583	200	111	21
2584	200	112	9
2585	200	113	9
2586	200	114	17
2587	202	3	15
2588	201	4	2
2589	201	26	2
2590	201	28	2
2591	201	74	2
2592	201	81	2
2593	202	94	23
2594	202	95	35
2595	202	96	31
2596	202	97	33
2597	202	98	28
2598	202	99	32
2599	202	100	15
2600	202	101	21
2601	201	102	2
2602	201	116	2
2603	201	117	2
2604	201	121	2
2605	204	3	16
2606	203	4	1
2607	203	26	1
2608	203	28	1
2609	203	74	1
2610	203	81	1
2611	204	94	24
2612	204	95	36
2613	204	96	32
2614	204	97	34
2615	204	98	29
2616	204	99	33
2617	204	100	16
2618	204	101	22
2619	203	102	1
2620	203	116	1
2621	203	117	1
2622	203	121	1
2623	205	58	3
2624	205	59	3
2625	206	87	21
2626	206	88	17
2627	206	90	33
2628	207	9	7
2629	208	10	22
2630	207	19	7
2631	207	23	7
2632	207	1	7
2633	207	24	1
2634	207	32	12
2635	207	42	7
2636	207	49	7
2637	207	55	12
2638	208	56	12
2639	208	66	38
2640	208	67	32
2641	208	68	32
2642	208	69	30
2643	208	70	33
2644	208	72	14
2645	208	73	25
2646	208	74	23
2647	207	97	12
2648	207	98	7
2649	208	105	12
2650	207	110	7
2651	207	119	10
2652	208	120	16
2653	208	121	23
2654	208	123	32
2655	207	124	10
2656	210	5	11
2657	209	6	1
2658	209	27	1
2659	209	41	1
2660	209	52	1
2661	209	53	1
2662	209	94	1
2663	210	102	24
2664	210	103	40
2665	210	104	37
2666	210	106	27
2667	210	107	33
2668	210	108	11
2669	210	109	17
2670	209	112	1
2671	209	113	1
2672	211	15	8
2673	212	16	9
2674	211	33	8
2675	212	38	37
2676	212	39	37
2677	212	40	41
2678	212	41	30
2679	212	42	32
2680	212	43	22
2681	212	44	24
2682	212	45	11
2683	211	57	8
2684	211	70	8
2685	211	76	8
2686	211	77	8
2687	211	91	8
2688	211	104	8
2689	211	115	8
2690	213	7	2
2691	214	8	21
2692	213	25	2
2693	213	30	2
2694	213	38	2
2695	213	48	2
2696	214	75	41
2697	214	76	43
2698	214	79	38
2699	214	80	41
2700	214	83	40
2701	216	5	7
2702	215	6	5
2703	215	27	5
2704	215	41	5
2705	215	52	5
2706	215	53	5
2707	215	86	7
2708	215	94	5
2709	216	102	20
2710	216	103	36
2711	216	104	33
2712	216	106	23
2713	216	107	29
2714	216	108	7
2715	216	109	13
2716	215	112	5
2717	215	113	5
2718	216	114	13
2719	217	5	1
2720	218	6	11
2721	217	52	11
2722	217	53	11
2723	217	63	1
2724	217	72	1
2725	217	86	1
2726	217	100	1
2727	217	101	7
2728	218	106	17
2729	218	107	23
2730	217	108	1
2731	217	109	7
2732	218	110	20
2733	218	111	23
2734	218	112	11
2735	218	114	19
2736	218	116	16
2737	217	118	1
2738	220	7	12
2739	219	8	11
2740	219	25	12
2741	219	30	12
2742	219	35	14
2743	219	37	14
2744	219	38	12
2745	219	39	14
2746	219	47	14
2747	219	48	12
2748	220	75	31
2749	220	76	33
2750	220	77	31
2751	220	78	31
2752	220	79	28
2753	220	80	31
2754	220	81	20
2755	220	82	29
2756	220	83	30
2757	220	84	31
2758	219	85	10
2759	220	93	14
2760	219	99	14
2761	222	3	14
2762	221	4	3
2763	221	26	3
2764	221	28	3
2765	221	74	3
2766	221	81	3
2767	222	94	22
2768	222	95	34
2769	222	96	30
2770	222	97	32
2771	222	98	27
2772	222	99	31
2773	222	100	14
2774	222	101	20
2775	221	102	3
2776	221	116	3
2777	221	117	3
2778	221	121	3
2779	223	9	2
2780	224	10	27
2781	223	19	2
2782	223	23	2
2783	223	1	2
2784	223	32	7
2785	223	42	2
2786	223	49	2
2787	223	55	7
2788	223	56	7
2789	224	66	43
2790	224	67	37
2791	224	69	35
2792	224	70	38
2793	224	72	19
2794	224	73	30
2795	224	74	28
2796	223	97	7
2797	223	98	2
2798	223	105	7
2799	223	110	2
2800	224	119	15
2801	224	120	21
2802	224	121	28
2803	224	123	37
2804	224	124	15
2805	225	7	11
2806	226	8	12
2807	225	25	11
2808	225	30	11
2809	225	35	13
2810	225	37	13
2811	225	38	11
2812	225	39	13
2813	225	47	13
2814	225	48	11
2815	226	75	32
2816	226	76	34
2817	226	77	32
2818	226	78	32
2819	226	79	29
2820	226	80	32
2821	226	81	21
2822	226	82	30
2823	226	83	31
2824	226	84	32
2825	225	85	11
2826	226	93	13
2827	225	99	13
2828	227	35	1
2829	227	37	1
2830	227	39	1
2831	227	47	1
2832	228	77	44
2833	228	78	44
2834	228	81	33
2835	228	82	42
2836	228	84	44
2837	228	85	23
2838	228	86	19
2839	227	93	1
2840	227	99	1
2841	227	114	1
2842	229	13	8
2843	230	14	9
2844	229	22	8
2845	229	34	8
2846	230	46	22
2847	230	47	37
2848	230	48	32
2849	230	49	29
2850	230	50	20
2851	230	51	24
2852	230	52	20
2853	230	53	24
2854	229	69	8
2855	229	78	8
2856	229	79	8
2857	229	89	8
2858	229	106	8
2859	229	107	8
2860	232	17	23
2861	231	18	12
2862	232	20	26
2863	232	21	29
2864	232	25	22
2865	231	27	18
2866	232	28	18
2867	232	30	22
2868	231	36	7
2869	232	37	24
2870	231	38	22
2871	232	40	26
2872	232	47	24
2873	231	50	7
2874	231	57	23
2875	231	64	6
2876	231	75	21
2877	232	76	23
2878	231	78	21
2879	231	80	21
2880	231	83	20
2881	231	84	21
2882	232	89	21
2883	232	92	21
2884	231	96	15
2885	231	101	4
2886	232	103	23
2887	232	107	20
2888	231	109	4
2889	232	113	15
2890	231	125	8
2891	233	11	2
2892	234	12	18
2893	233	20	2
2894	233	21	5
2895	233	29	2
2896	233	31	2
2897	233	40	2
2898	233	54	2
2899	234	57	47
2900	234	58	22
2901	234	60	37
2902	234	61	39
2903	234	62	25
2904	234	63	22
2905	234	64	30
2906	233	65	5
2907	233	87	2
2908	233	111	2
2909	234	125	32
2910	234	126	8
2911	235	7	1
2912	236	8	22
2913	235	25	1
2914	235	30	1
2915	235	38	1
2916	235	48	1
2917	236	75	42
2918	236	76	44
2919	236	79	39
2920	236	80	42
2921	236	83	41
2922	237	7	9
2923	238	8	14
2924	237	25	9
2925	237	30	9
2926	237	35	11
2927	237	37	11
2928	237	38	9
2929	237	39	11
2930	237	47	11
2931	237	48	9
2932	238	75	34
2933	238	76	36
2934	238	77	34
2935	238	78	34
2936	238	79	31
2937	238	80	34
2938	238	81	23
2939	238	82	32
2940	238	83	33
2941	238	84	34
2942	238	85	13
2943	237	93	11
2944	237	99	11
2945	239	13	6
2946	240	14	11
2947	239	22	6
2948	239	34	6
2949	240	46	24
2950	240	47	39
2951	240	48	34
2952	240	49	31
2953	240	50	22
2954	240	51	26
2955	240	52	22
2956	240	53	26
2957	239	69	6
2958	239	78	6
2959	239	79	6
2960	239	89	6
2961	239	106	6
2962	239	107	6
2963	241	11	1
2964	242	12	19
2965	241	20	1
2966	241	21	4
2967	241	29	1
2968	241	31	1
2969	241	40	1
2970	241	54	1
2971	242	57	48
2972	242	58	23
2973	242	60	38
2974	242	61	40
2975	242	62	26
2976	242	63	23
2977	242	64	31
2978	241	65	4
2979	241	87	1
2980	241	111	1
2981	242	125	33
2982	242	126	9
2983	243	58	1
2984	243	59	1
2985	243	85	2
2986	244	87	22
2987	244	88	18
2988	244	89	28
2989	244	90	34
2990	244	91	32
2991	244	92	28
2992	245	15	1
2993	246	16	16
2994	245	33	1
2995	246	38	44
2996	246	39	44
2997	246	40	48
2998	246	41	37
2999	246	42	39
3000	246	43	29
3001	246	44	31
3002	246	45	18
3003	245	57	1
3004	245	70	1
3005	245	76	1
3006	245	77	1
3007	245	91	1
3008	245	104	1
3009	245	115	1
3010	247	15	6
3011	248	16	11
3012	247	33	6
3013	248	38	39
3014	248	39	39
3015	248	40	43
3016	248	41	32
3017	248	42	34
3018	248	43	24
3019	248	44	26
3020	248	45	13
3021	247	57	6
3022	247	70	6
3023	247	76	6
3024	247	77	6
3025	247	91	6
3026	247	104	6
3027	247	115	6
3028	249	7	4
3029	250	8	19
3030	249	25	4
3031	249	30	4
3032	249	35	6
3033	249	37	6
3034	249	38	4
3035	249	39	6
3036	249	47	6
3037	249	48	4
3038	250	75	39
3039	250	76	41
3040	250	77	39
3041	250	78	39
3042	250	79	36
3043	250	80	39
3044	250	81	28
3045	250	82	37
3046	250	83	38
3047	250	84	39
3048	250	85	18
3049	250	86	14
3050	249	93	6
3051	249	99	6
3052	249	114	6
3053	252	9	26
3054	251	10	3
3055	252	13	13
3056	251	14	4
3057	252	15	14
3058	251	16	3
3059	252	19	26
3060	251	22	13
3061	252	23	26
3062	252	1	25
3063	252	24	19
3064	252	26	21
3065	252	29	28
3066	252	31	27
3067	252	32	30
3068	251	33	14
3069	251	34	13
3070	252	35	30
3071	252	38	31
3072	252	39	31
3073	252	40	35
3074	252	41	24
3075	252	42	26
3076	252	43	16
3077	252	44	18
3078	251	45	5
3079	252	46	17
3080	252	47	32
3081	252	50	15
3082	252	51	19
3083	252	52	15
3084	252	53	19
3085	251	57	14
3086	251	60	11
3087	251	61	14
3088	251	66	19
3089	251	67	14
3090	251	68	14
3091	251	70	14
3092	251	73	6
3093	251	76	14
3094	251	77	14
3095	251	78	13
3096	251	82	13
3097	251	89	13
3098	251	90	14
3099	251	91	14
3100	251	95	16
3101	251	104	14
3102	251	106	13
3103	251	107	13
3104	252	115	14
3105	251	123	14
3106	253	3	1
3107	254	4	16
3108	253	36	1
3109	253	44	1
3110	253	50	1
3111	253	58	2
3112	253	59	2
3113	253	85	1
3114	254	87	23
3115	254	88	19
3116	254	89	27
3117	254	91	31
3118	254	92	27
3119	254	93	22
3120	255	9	11
3121	256	10	18
3122	255	19	11
3123	255	23	11
3124	255	1	11
3125	255	24	5
3126	255	32	16
3127	255	42	11
3128	255	49	11
3129	256	55	16
3130	256	56	16
3131	256	66	34
3132	256	67	28
3133	256	68	28
3134	256	69	26
3135	256	70	29
3136	255	72	10
3137	256	73	21
3138	256	74	19
3139	255	97	16
3140	255	98	11
3141	256	105	16
3142	256	110	11
3143	255	119	6
3144	255	120	12
3145	256	121	19
3146	256	123	28
3147	255	124	6
3148	258	15	12
3149	257	16	5
3150	257	33	12
3151	258	38	33
3152	258	39	33
3153	258	40	37
3154	258	41	26
3155	258	42	28
3156	258	43	18
3157	258	44	20
3158	257	45	7
3159	257	57	12
3160	257	70	12
3161	257	76	12
3162	257	77	12
3163	257	91	12
3164	257	104	12
3165	258	115	12
3166	259	11	11
3167	259	12	9
3168	259	20	11
3169	259	21	14
3170	259	29	11
3171	259	31	11
3172	259	40	11
3173	259	54	11
3174	260	57	38
3175	260	58	13
3176	260	59	13
3177	260	60	28
3178	260	61	30
3179	260	62	16
3180	260	63	13
3181	260	64	21
3182	259	87	11
3183	259	88	7
3184	259	111	11
3185	260	125	23
3186	261	7	6
3187	262	8	17
3188	261	25	6
3189	261	30	6
3190	261	35	8
3191	261	37	8
3192	261	38	6
3193	261	39	8
3194	261	47	8
3195	261	48	6
3196	262	75	37
3197	262	76	39
3198	262	77	37
3199	262	78	37
3200	262	79	34
3201	262	80	37
3202	262	81	26
3203	262	82	35
3204	262	83	36
3205	262	84	37
3206	262	85	16
3207	262	86	12
3208	261	93	8
3209	261	99	8
3210	261	114	8
3211	264	15	10
3212	263	16	7
3213	263	33	10
3214	264	38	35
3215	264	39	35
3216	264	40	39
3217	264	41	28
3218	264	42	30
3219	264	43	20
3220	264	44	22
3221	263	45	9
3222	263	57	10
3223	263	70	10
3224	263	76	10
3225	263	77	10
3226	263	91	10
3227	263	104	10
3228	264	115	10
3229	265	5	4
3230	266	6	8
3231	266	11	21
3232	265	52	8
3233	265	53	8
3234	265	58	4
3235	265	59	4
3236	265	63	4
3237	265	72	4
3238	265	86	4
3239	266	87	20
3240	266	88	16
3241	266	90	32
3242	265	94	8
3243	266	102	17
3244	266	106	20
3245	266	107	26
3246	265	108	4
3247	266	109	10
3248	266	110	17
3249	266	111	20
3250	266	112	8
3251	266	113	8
3252	266	114	16
3253	267	9	3
3254	268	10	26
3255	267	19	3
3256	267	23	3
3257	267	1	3
3258	267	32	8
3259	267	42	3
3260	267	49	3
3261	267	55	8
3262	267	56	8
3263	268	66	42
3264	268	67	36
3265	268	69	34
3266	268	70	37
3267	268	72	18
3268	268	73	29
3269	268	74	27
3270	267	97	8
3271	267	98	3
3272	267	105	8
3273	267	110	3
3274	268	119	14
3275	268	120	20
3276	268	121	27
3277	268	123	36
3278	268	124	14
3279	269	32	1
3280	269	55	1
3281	269	56	1
3282	269	71	1
3283	269	97	1
3284	269	105	1
3285	270	119	21
3286	270	120	27
3287	270	121	34
3288	270	122	6
3289	270	123	43
3290	270	124	21
3291	271	9	4
3292	272	10	25
3293	271	19	4
3294	271	23	4
3295	271	1	4
3296	271	32	9
3297	271	42	4
3298	271	49	4
3299	271	55	9
3300	271	56	9
3301	272	66	41
3302	272	67	35
3303	272	69	33
3304	272	70	36
3305	272	72	17
3306	272	73	28
3307	272	74	26
3308	271	97	9
3309	271	98	4
3310	271	105	9
3311	271	110	4
3312	272	119	13
3313	272	120	19
3314	272	121	26
3315	272	123	35
3316	272	124	13
3317	274	15	13
3318	273	16	4
3319	273	33	13
3320	274	38	32
3321	274	39	32
3322	274	40	36
3323	274	41	25
3324	274	42	27
3325	274	43	17
3326	274	44	19
3327	273	45	6
3328	273	57	13
3329	273	70	13
3330	273	76	13
3331	273	77	13
3332	273	91	13
3333	273	104	13
3334	274	115	13
3335	276	15	9
3336	275	16	8
3337	275	33	9
3338	276	38	36
3339	276	39	36
3340	276	40	40
3341	276	41	29
3342	276	42	31
3343	276	43	21
3344	276	44	23
3345	276	45	10
3346	275	57	9
3347	275	70	9
3348	275	76	9
3349	275	77	9
3350	275	91	9
3351	275	104	9
3352	275	115	9
3353	278	5	6
3354	278	6	6
3355	277	27	6
3356	277	41	6
3357	277	52	6
3358	277	53	6
3359	277	86	6
3360	277	94	6
3361	278	102	19
3362	278	103	35
3363	278	104	32
3364	278	106	22
3365	278	107	28
3366	278	108	6
3367	278	109	12
3368	278	112	6
3369	277	113	6
3370	278	114	14
3371	279	9	10
3372	280	10	19
3373	279	19	10
3374	279	23	10
3375	279	1	10
3376	279	24	4
3377	279	32	15
3378	279	42	10
3379	279	49	10
3380	280	55	15
3381	280	56	15
3382	280	66	35
3383	280	67	29
3384	280	68	29
3385	280	69	27
3386	280	70	30
3387	280	72	11
3388	280	73	22
3389	280	74	20
3390	279	97	15
3391	279	98	10
3392	280	105	15
3393	279	110	10
3394	279	119	7
3395	279	120	13
3396	280	121	20
3397	280	123	29
3398	279	124	7
3399	282	11	16
3400	281	12	4
3401	282	20	16
3402	282	21	19
3403	281	40	16
3404	282	57	33
3405	281	58	8
3406	281	59	8
3407	281	63	8
3408	282	64	16
3409	282	87	16
3410	282	88	12
3411	282	90	28
3412	282	111	16
3413	281	125	18
3414	283	35	5
3415	283	37	5
3416	283	39	5
3417	283	47	5
3418	284	77	40
3419	284	78	40
3420	284	81	29
3421	284	82	38
3422	284	84	40
3423	284	85	19
3424	284	86	15
3425	283	93	5
3426	283	99	5
3427	283	114	5
3428	285	15	4
3429	286	16	13
3430	285	33	4
3431	286	38	41
3432	286	39	41
3433	286	40	45
3434	286	41	34
3435	286	42	36
3436	286	43	26
3437	286	44	28
3438	286	45	15
3439	285	57	4
3440	285	70	4
3441	285	76	4
3442	285	77	4
3443	285	91	4
3444	285	104	4
3445	285	115	4
3446	288	17	26
3447	287	18	9
3448	288	20	23
3449	288	21	26
3450	287	25	19
3451	287	27	15
3452	287	28	15
3453	287	30	19
3454	287	36	4
3455	287	37	21
3456	287	38	19
3457	287	40	23
3458	287	47	21
3459	287	50	4
3460	287	53	13
3461	288	57	26
3462	287	64	9
3463	288	75	24
3464	288	76	26
3465	288	78	24
3466	288	80	24
3467	288	83	23
3468	288	84	24
3469	288	89	24
3470	288	92	24
3471	288	96	18
3472	288	103	26
3473	288	113	12
3474	288	117	16
3475	287	125	11
3476	289	9	5
3477	290	10	24
3478	289	19	5
3479	289	23	5
3480	289	1	5
3481	289	32	10
3482	289	42	5
3483	289	49	5
3484	289	55	10
3485	289	56	10
3486	290	66	40
3487	290	67	34
3488	290	69	32
3489	290	70	35
3490	290	72	16
3491	290	73	27
3492	290	74	25
3493	289	97	10
3494	289	98	5
3495	289	105	10
3496	289	110	5
3497	290	119	12
3498	290	120	18
3499	290	121	25
3500	290	123	34
3501	290	124	12
3502	291	35	2
3503	291	37	2
3504	291	39	2
3505	291	47	2
3506	292	77	43
3507	292	78	43
3508	292	81	32
3509	292	82	41
3510	292	84	43
3511	292	85	22
3512	292	86	18
3513	291	93	2
3514	291	99	2
3515	291	114	2
3516	293	9	1
3517	294	10	28
3518	293	19	1
3519	293	23	1
3520	293	1	1
3521	293	32	6
3522	293	42	1
3523	293	49	1
3524	293	55	6
3525	293	56	6
3526	294	66	44
3527	294	67	38
3528	294	69	36
3529	294	70	39
3530	294	71	6
3531	294	72	20
3532	294	73	31
3533	294	74	29
3534	293	97	6
3535	293	98	1
3536	293	105	6
3537	293	110	1
3538	294	119	16
3539	294	120	22
3540	294	121	29
3541	293	122	1
3542	294	123	38
3543	294	124	16
3544	296	7	17
3545	295	8	6
3546	296	17	28
3547	295	18	7
3548	296	20	21
3549	296	21	24
3550	295	25	17
3551	295	27	13
3552	295	30	17
3553	295	37	19
3554	295	38	17
3555	295	40	21
3556	295	47	19
3557	296	57	28
3558	295	64	11
3559	296	75	26
3560	296	76	28
3561	296	78	26
3562	296	80	26
3563	295	81	15
3564	296	83	25
3565	296	84	26
3566	295	85	5
3567	296	93	19
3568	296	99	19
3569	296	103	28
3570	296	117	14
3571	295	125	13
3572	298	17	25
3573	297	18	10
3574	298	20	24
3575	298	21	27
3576	297	25	20
3577	297	27	16
3578	297	28	16
3579	297	30	20
3580	297	36	5
3581	297	37	22
3582	297	38	20
3583	297	40	24
3584	297	47	22
3585	297	50	5
3586	297	53	14
3587	298	57	25
3588	297	64	8
3589	298	75	23
3590	298	76	25
3591	298	78	23
3592	298	80	23
3593	298	83	22
3594	298	84	23
3595	298	89	23
3596	298	92	23
3597	298	96	17
3598	297	101	6
3599	298	103	25
3600	298	107	22
3601	297	109	6
3602	298	113	13
3603	298	117	17
3604	297	125	10
3605	300	17	20
3606	299	18	15
3607	300	19	31
3608	300	20	29
3609	300	21	32
3610	300	25	25
3611	300	27	21
3612	300	28	21
3613	300	30	25
3614	299	36	10
3615	300	37	27
3616	300	38	25
3617	300	40	29
3618	300	47	27
3619	299	50	10
3620	299	57	20
3621	299	64	3
3622	299	73	1
3623	299	75	18
3624	299	76	20
3625	299	78	18
3626	299	80	18
3627	299	83	17
3628	299	84	18
3629	300	89	18
3630	300	92	18
3631	299	96	12
3632	299	101	1
3633	299	103	20
3634	300	107	17
3635	299	109	1
3636	299	125	5
3637	301	21	1
3638	301	65	1
3639	302	125	36
3640	302	126	12
3641	303	21	2
3642	303	65	2
3643	304	125	35
3644	304	126	11
3645	305	21	3
3646	305	65	3
3647	306	125	34
3648	306	126	10
\.


--
-- Data for Name: vagones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vagones (id, estacion_id, nombre, sentido, activo) FROM stdin;
1	309	Vagón 1 · Ida	Ida	t
2	309	Vagón 2 · Vuelta	Vuelta	t
3	310	Vagón 1 · Ida	Ida	t
4	310	Vagón 2 · Vuelta	Vuelta	t
5	311	Vagón 1 · Ida	Ida	t
6	311	Vagón 2 · Vuelta	Vuelta	t
7	312	Vagón 1 · Ida	Ida	t
8	312	Vagón 2 · Vuelta	Vuelta	t
9	313	Vagón 1 · Ida	Ida	t
10	313	Vagón 2 · Vuelta	Vuelta	t
11	314	Vagón 1 · Ida	Ida	t
12	314	Vagón 2 · Vuelta	Vuelta	t
13	315	Vagón 1 · Ida	Ida	t
14	315	Vagón 2 · Vuelta	Vuelta	t
15	316	Vagón 1 · Ida	Ida	t
16	316	Vagón 2 · Vuelta	Vuelta	t
17	317	Vagón 1 · Ida	Ida	t
18	317	Vagón 2 · Vuelta	Vuelta	t
19	318	Vagón 1 · Ida	Ida	t
20	318	Vagón 2 · Vuelta	Vuelta	t
21	319	Vagón 1 · Ida	Ida	t
22	319	Vagón 2 · Vuelta	Vuelta	t
23	320	Vagón 1 · Ida	Ida	t
24	320	Vagón 2 · Vuelta	Vuelta	t
25	321	Vagón 1 · Ida	Ida	t
26	321	Vagón 2 · Vuelta	Vuelta	t
27	322	Vagón 1 · Ida	Ida	t
28	322	Vagón 2 · Vuelta	Vuelta	t
29	323	Vagón 1 · Ida	Ida	t
30	323	Vagón 2 · Vuelta	Vuelta	t
31	324	Vagón 1 · Ida	Ida	t
32	324	Vagón 2 · Vuelta	Vuelta	t
33	325	Vagón 1 · Ida	Ida	t
34	325	Vagón 2 · Vuelta	Vuelta	t
35	326	Vagón 1 · Ida	Ida	t
36	326	Vagón 2 · Vuelta	Vuelta	t
37	327	Vagón 1 · Ida	Ida	t
38	327	Vagón 2 · Vuelta	Vuelta	t
39	328	Vagón 1 · Ida	Ida	t
40	328	Vagón 2 · Vuelta	Vuelta	t
41	329	Vagón 1 · Ida	Ida	t
42	329	Vagón 2 · Vuelta	Vuelta	t
43	330	Vagón 1 · Ida	Ida	t
44	330	Vagón 2 · Vuelta	Vuelta	t
45	331	Vagón 1 · Ida	Ida	t
46	331	Vagón 2 · Vuelta	Vuelta	t
47	332	Vagón 1 · Ida	Ida	t
48	332	Vagón 2 · Vuelta	Vuelta	t
49	333	Vagón 1 · Ida	Ida	t
50	333	Vagón 2 · Vuelta	Vuelta	t
51	334	Vagón 1 · Ida	Ida	t
52	334	Vagón 2 · Vuelta	Vuelta	t
53	335	Vagón 1 · Ida	Ida	t
54	335	Vagón 2 · Vuelta	Vuelta	t
55	336	Vagón 1 · Ida	Ida	t
56	336	Vagón 2 · Vuelta	Vuelta	t
57	337	Vagón 1 · Ida	Ida	t
58	337	Vagón 2 · Vuelta	Vuelta	t
59	338	Vagón 1 · Ida	Ida	t
60	338	Vagón 2 · Vuelta	Vuelta	t
61	339	Vagón 1 · Ida	Ida	t
62	339	Vagón 2 · Vuelta	Vuelta	t
63	340	Vagón 1 · Ida	Ida	t
64	340	Vagón 2 · Vuelta	Vuelta	t
65	341	Vagón 1 · Ida	Ida	t
66	341	Vagón 2 · Vuelta	Vuelta	t
67	342	Vagón 1 · Ida	Ida	t
68	342	Vagón 2 · Vuelta	Vuelta	t
69	343	Vagón 1 · Ida	Ida	t
70	343	Vagón 2 · Vuelta	Vuelta	t
71	344	Vagón 1 · Ida	Ida	t
72	344	Vagón 2 · Vuelta	Vuelta	t
73	345	Vagón 1 · Ida	Ida	t
74	345	Vagón 2 · Vuelta	Vuelta	t
75	346	Vagón 1 · Ida	Ida	t
76	346	Vagón 2 · Vuelta	Vuelta	t
77	347	Vagón 1 · Ida	Ida	t
78	347	Vagón 2 · Vuelta	Vuelta	t
79	348	Vagón 1 · Ida	Ida	t
80	348	Vagón 2 · Vuelta	Vuelta	t
81	349	Vagón 1 · Ida	Ida	t
82	349	Vagón 2 · Vuelta	Vuelta	t
83	350	Vagón 1 · Ida	Ida	t
84	350	Vagón 2 · Vuelta	Vuelta	t
85	351	Vagón 1 · Ida	Ida	t
86	351	Vagón 2 · Vuelta	Vuelta	t
87	352	Vagón 1 · Ida	Ida	t
88	352	Vagón 2 · Vuelta	Vuelta	t
89	353	Vagón 1 · Ida	Ida	t
90	353	Vagón 2 · Vuelta	Vuelta	t
91	354	Vagón 1 · Ida	Ida	t
92	354	Vagón 2 · Vuelta	Vuelta	t
93	355	Vagón 1 · Ida	Ida	t
94	355	Vagón 2 · Vuelta	Vuelta	t
95	356	Vagón 1 · Ida	Ida	t
96	356	Vagón 2 · Vuelta	Vuelta	t
97	357	Vagón 1 · Ida	Ida	t
98	357	Vagón 2 · Vuelta	Vuelta	t
99	358	Vagón 1 · Ida	Ida	t
100	358	Vagón 2 · Vuelta	Vuelta	t
101	359	Vagón 1 · Ida	Ida	t
102	359	Vagón 2 · Vuelta	Vuelta	t
103	360	Vagón 1 · Ida	Ida	t
104	360	Vagón 2 · Vuelta	Vuelta	t
105	361	Vagón 1 · Ida	Ida	t
106	361	Vagón 2 · Vuelta	Vuelta	t
107	362	Vagón 1 · Ida	Ida	t
108	362	Vagón 2 · Vuelta	Vuelta	t
109	363	Vagón 1 · Ida	Ida	t
110	363	Vagón 2 · Vuelta	Vuelta	t
111	364	Vagón 1 · Ida	Ida	t
112	364	Vagón 2 · Vuelta	Vuelta	t
113	365	Vagón 1 · Ida	Ida	t
114	365	Vagón 2 · Vuelta	Vuelta	t
115	366	Vagón 1 · Ida	Ida	t
116	366	Vagón 2 · Vuelta	Vuelta	t
117	367	Vagón 1 · Ida	Ida	t
118	367	Vagón 2 · Vuelta	Vuelta	t
119	368	Vagón 1 · Ida	Ida	t
120	368	Vagón 2 · Vuelta	Vuelta	t
121	369	Vagón 1 · Ida	Ida	t
122	369	Vagón 2 · Vuelta	Vuelta	t
123	370	Vagón 1 · Ida	Ida	t
124	370	Vagón 2 · Vuelta	Vuelta	t
125	371	Vagón 1 · Ida	Ida	t
126	371	Vagón 2 · Vuelta	Vuelta	t
127	372	Vagón 1 · Ida	Ida	t
128	372	Vagón 2 · Vuelta	Vuelta	t
129	373	Vagón 1 · Ida	Ida	t
130	373	Vagón 2 · Vuelta	Vuelta	t
131	374	Vagón 1 · Ida	Ida	t
132	374	Vagón 2 · Vuelta	Vuelta	t
133	375	Vagón 1 · Ida	Ida	t
134	375	Vagón 2 · Vuelta	Vuelta	t
135	376	Vagón 1 · Ida	Ida	t
136	376	Vagón 2 · Vuelta	Vuelta	t
137	377	Vagón 1 · Ida	Ida	t
138	377	Vagón 2 · Vuelta	Vuelta	t
139	378	Vagón 1 · Ida	Ida	t
140	378	Vagón 2 · Vuelta	Vuelta	t
141	379	Vagón 1 · Ida	Ida	t
142	379	Vagón 2 · Vuelta	Vuelta	t
143	380	Vagón 1 · Ida	Ida	t
144	380	Vagón 2 · Vuelta	Vuelta	t
145	381	Vagón 1 · Ida	Ida	t
146	381	Vagón 2 · Vuelta	Vuelta	t
147	382	Vagón 1 · Ida	Ida	t
148	382	Vagón 2 · Vuelta	Vuelta	t
149	383	Vagón 1 · Ida	Ida	t
150	383	Vagón 2 · Vuelta	Vuelta	t
151	384	Vagón 1 · Ida	Ida	t
152	384	Vagón 2 · Vuelta	Vuelta	t
153	385	Vagón 1 · Ida	Ida	t
154	385	Vagón 2 · Vuelta	Vuelta	t
155	386	Vagón 1 · Ida	Ida	t
156	386	Vagón 2 · Vuelta	Vuelta	t
157	387	Vagón 1 · Ida	Ida	t
158	387	Vagón 2 · Vuelta	Vuelta	t
159	388	Vagón 1 · Ida	Ida	t
160	388	Vagón 2 · Vuelta	Vuelta	t
161	389	Vagón 1 · Ida	Ida	t
162	389	Vagón 2 · Vuelta	Vuelta	t
163	390	Vagón 1 · Ida	Ida	t
164	390	Vagón 2 · Vuelta	Vuelta	t
165	391	Vagón 1 · Ida	Ida	t
166	391	Vagón 2 · Vuelta	Vuelta	t
167	392	Vagón 1 · Ida	Ida	t
168	392	Vagón 2 · Vuelta	Vuelta	t
169	393	Vagón 1 · Ida	Ida	t
170	393	Vagón 2 · Vuelta	Vuelta	t
171	394	Vagón 1 · Ida	Ida	t
172	394	Vagón 2 · Vuelta	Vuelta	t
173	395	Vagón 1 · Ida	Ida	t
174	395	Vagón 2 · Vuelta	Vuelta	t
175	396	Vagón 1 · Ida	Ida	t
176	396	Vagón 2 · Vuelta	Vuelta	t
177	397	Vagón 1 · Ida	Ida	t
178	397	Vagón 2 · Vuelta	Vuelta	t
179	398	Vagón 1 · Ida	Ida	t
180	398	Vagón 2 · Vuelta	Vuelta	t
181	399	Vagón 1 · Ida	Ida	t
182	399	Vagón 2 · Vuelta	Vuelta	t
183	400	Vagón 1 · Ida	Ida	t
184	400	Vagón 2 · Vuelta	Vuelta	t
185	401	Vagón 1 · Ida	Ida	t
186	401	Vagón 2 · Vuelta	Vuelta	t
187	402	Vagón 1 · Ida	Ida	t
188	402	Vagón 2 · Vuelta	Vuelta	t
189	403	Vagón 1 · Ida	Ida	t
190	403	Vagón 2 · Vuelta	Vuelta	t
191	404	Vagón 1 · Ida	Ida	t
192	404	Vagón 2 · Vuelta	Vuelta	t
193	405	Vagón 1 · Ida	Ida	t
194	405	Vagón 2 · Vuelta	Vuelta	t
195	406	Vagón 1 · Ida	Ida	t
196	406	Vagón 2 · Vuelta	Vuelta	t
197	407	Vagón 1 · Ida	Ida	t
198	407	Vagón 2 · Vuelta	Vuelta	t
199	408	Vagón 1 · Ida	Ida	t
200	408	Vagón 2 · Vuelta	Vuelta	t
201	409	Vagón 1 · Ida	Ida	t
202	409	Vagón 2 · Vuelta	Vuelta	t
203	410	Vagón 1 · Ida	Ida	t
204	410	Vagón 2 · Vuelta	Vuelta	t
205	411	Vagón 1 · Ida	Ida	t
206	411	Vagón 2 · Vuelta	Vuelta	t
207	412	Vagón 1 · Ida	Ida	t
208	412	Vagón 2 · Vuelta	Vuelta	t
209	413	Vagón 1 · Ida	Ida	t
210	413	Vagón 2 · Vuelta	Vuelta	t
211	414	Vagón 1 · Ida	Ida	t
212	414	Vagón 2 · Vuelta	Vuelta	t
213	415	Vagón 1 · Ida	Ida	t
214	415	Vagón 2 · Vuelta	Vuelta	t
215	416	Vagón 1 · Ida	Ida	t
216	416	Vagón 2 · Vuelta	Vuelta	t
217	417	Vagón 1 · Ida	Ida	t
218	417	Vagón 2 · Vuelta	Vuelta	t
219	418	Vagón 1 · Ida	Ida	t
220	418	Vagón 2 · Vuelta	Vuelta	t
221	419	Vagón 1 · Ida	Ida	t
222	419	Vagón 2 · Vuelta	Vuelta	t
223	420	Vagón 1 · Ida	Ida	t
224	420	Vagón 2 · Vuelta	Vuelta	t
225	421	Vagón 1 · Ida	Ida	t
226	421	Vagón 2 · Vuelta	Vuelta	t
227	422	Vagón 1 · Ida	Ida	t
228	422	Vagón 2 · Vuelta	Vuelta	t
229	423	Vagón 1 · Ida	Ida	t
230	423	Vagón 2 · Vuelta	Vuelta	t
231	424	Vagón 1 · Ida	Ida	t
232	424	Vagón 2 · Vuelta	Vuelta	t
233	425	Vagón 1 · Ida	Ida	t
234	425	Vagón 2 · Vuelta	Vuelta	t
235	426	Vagón 1 · Ida	Ida	t
236	426	Vagón 2 · Vuelta	Vuelta	t
237	427	Vagón 1 · Ida	Ida	t
238	427	Vagón 2 · Vuelta	Vuelta	t
239	428	Vagón 1 · Ida	Ida	t
240	428	Vagón 2 · Vuelta	Vuelta	t
241	429	Vagón 1 · Ida	Ida	t
242	429	Vagón 2 · Vuelta	Vuelta	t
243	430	Vagón 1 · Ida	Ida	t
244	430	Vagón 2 · Vuelta	Vuelta	t
245	431	Vagón 1 · Ida	Ida	t
246	431	Vagón 2 · Vuelta	Vuelta	t
247	432	Vagón 1 · Ida	Ida	t
248	432	Vagón 2 · Vuelta	Vuelta	t
249	433	Vagón 1 · Ida	Ida	t
250	433	Vagón 2 · Vuelta	Vuelta	t
251	434	Vagón 1 · Ida	Ida	t
252	434	Vagón 2 · Vuelta	Vuelta	t
253	435	Vagón 1 · Ida	Ida	t
254	435	Vagón 2 · Vuelta	Vuelta	t
255	436	Vagón 1 · Ida	Ida	t
256	436	Vagón 2 · Vuelta	Vuelta	t
257	437	Vagón 1 · Ida	Ida	t
258	437	Vagón 2 · Vuelta	Vuelta	t
259	438	Vagón 1 · Ida	Ida	t
260	438	Vagón 2 · Vuelta	Vuelta	t
261	439	Vagón 1 · Ida	Ida	t
262	439	Vagón 2 · Vuelta	Vuelta	t
263	440	Vagón 1 · Ida	Ida	t
264	440	Vagón 2 · Vuelta	Vuelta	t
265	441	Vagón 1 · Ida	Ida	t
266	441	Vagón 2 · Vuelta	Vuelta	t
267	442	Vagón 1 · Ida	Ida	t
268	442	Vagón 2 · Vuelta	Vuelta	t
269	443	Vagón 1 · Ida	Ida	t
270	443	Vagón 2 · Vuelta	Vuelta	t
271	444	Vagón 1 · Ida	Ida	t
272	444	Vagón 2 · Vuelta	Vuelta	t
273	445	Vagón 1 · Ida	Ida	t
274	445	Vagón 2 · Vuelta	Vuelta	t
275	446	Vagón 1 · Ida	Ida	t
276	446	Vagón 2 · Vuelta	Vuelta	t
277	447	Vagón 1 · Ida	Ida	t
278	447	Vagón 2 · Vuelta	Vuelta	t
279	448	Vagón 1 · Ida	Ida	t
280	448	Vagón 2 · Vuelta	Vuelta	t
281	449	Vagón 1 · Ida	Ida	t
282	449	Vagón 2 · Vuelta	Vuelta	t
283	450	Vagón 1 · Ida	Ida	t
284	450	Vagón 2 · Vuelta	Vuelta	t
285	451	Vagón 1 · Ida	Ida	t
286	451	Vagón 2 · Vuelta	Vuelta	t
287	452	Vagón 1 · Ida	Ida	t
288	452	Vagón 2 · Vuelta	Vuelta	t
289	453	Vagón 1 · Ida	Ida	t
290	453	Vagón 2 · Vuelta	Vuelta	t
291	454	Vagón 1 · Ida	Ida	t
292	454	Vagón 2 · Vuelta	Vuelta	t
293	455	Vagón 1 · Ida	Ida	t
294	455	Vagón 2 · Vuelta	Vuelta	t
295	456	Vagón 1 · Ida	Ida	t
296	456	Vagón 2 · Vuelta	Vuelta	t
297	457	Vagón 1 · Ida	Ida	t
298	457	Vagón 2 · Vuelta	Vuelta	t
299	458	Vagón 1 · Ida	Ida	t
300	458	Vagón 2 · Vuelta	Vuelta	t
301	459	Vagón 1 · Ida	Ida	t
302	459	Vagón 2 · Vuelta	Vuelta	t
303	460	Vagón 1 · Ida	Ida	t
304	460	Vagón 2 · Vuelta	Vuelta	t
305	461	Vagón 1 · Ida	Ida	t
306	461	Vagón 2 · Vuelta	Vuelta	t
\.


--
-- Name: buses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.buses_id_seq', 13, true);


--
-- Name: camaras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.camaras_id_seq', 6, true);


--
-- Name: conductores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.conductores_id_seq', 6, true);


--
-- Name: despachos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.despachos_id_seq', 13, true);


--
-- Name: estaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.estaciones_id_seq', 461, true);


--
-- Name: notificaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notificaciones_id_seq', 8, true);


--
-- Name: reportes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reportes_id_seq', 55, true);


--
-- Name: ruta_estaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ruta_estaciones_id_seq', 14647, true);


--
-- Name: rutas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.rutas_id_seq', 126, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 56, true);


--
-- Name: vagon_rutas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vagon_rutas_id_seq', 7296, true);


--
-- Name: vagones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vagones_id_seq', 612, true);


--
-- Name: buses buses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buses
    ADD CONSTRAINT buses_pkey PRIMARY KEY (id);


--
-- Name: buses buses_placa_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buses
    ADD CONSTRAINT buses_placa_key UNIQUE (placa);


--
-- Name: camaras camaras_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.camaras
    ADD CONSTRAINT camaras_pkey PRIMARY KEY (id);


--
-- Name: conductores conductores_cedula_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conductores
    ADD CONSTRAINT conductores_cedula_key UNIQUE (cedula);


--
-- Name: conductores conductores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conductores
    ADD CONSTRAINT conductores_pkey PRIMARY KEY (id);


--
-- Name: despachos despachos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.despachos
    ADD CONSTRAINT despachos_pkey PRIMARY KEY (id);


--
-- Name: estaciones estaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estaciones
    ADD CONSTRAINT estaciones_pkey PRIMARY KEY (id);


--
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (id);


--
-- Name: reportes reportes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes
    ADD CONSTRAINT reportes_pkey PRIMARY KEY (id);


--
-- Name: ruta_estaciones ruta_estaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ruta_estaciones
    ADD CONSTRAINT ruta_estaciones_pkey PRIMARY KEY (id);


--
-- Name: rutas rutas_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutas
    ADD CONSTRAINT rutas_codigo_key UNIQUE (codigo);


--
-- Name: rutas rutas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutas
    ADD CONSTRAINT rutas_pkey PRIMARY KEY (id);


--
-- Name: buses uq_buses_placa; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.buses
    ADD CONSTRAINT uq_buses_placa UNIQUE (placa);


--
-- Name: conductores uq_cond_cedula; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conductores
    ADD CONSTRAINT uq_cond_cedula UNIQUE (cedula);


--
-- Name: rutas uq_rutas_codigo; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rutas
    ADD CONSTRAINT uq_rutas_codigo UNIQUE (codigo);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: vagon_rutas vagon_rutas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vagon_rutas
    ADD CONSTRAINT vagon_rutas_pkey PRIMARY KEY (id);


--
-- Name: vagones vagones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vagones
    ADD CONSTRAINT vagones_pkey PRIMARY KEY (id);


--
-- Name: idx_camaras_estacion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_camaras_estacion ON public.camaras USING btree (estacion);


--
-- Name: idx_des_est_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_des_est_id ON public.despachos USING btree (estacion_id);


--
-- Name: idx_des_ruta_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_des_ruta_id ON public.despachos USING btree (ruta_id);


--
-- Name: idx_despachos_estacion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_despachos_estacion ON public.despachos USING btree (estacion);


--
-- Name: idx_estaciones_nombre; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_estaciones_nombre ON public.estaciones USING btree (nombre);


--
-- Name: idx_estaciones_troncal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_estaciones_troncal ON public.estaciones USING btree (troncal);


--
-- Name: idx_not_usu_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_not_usu_id ON public.notificaciones USING btree (usuario_id);


--
-- Name: idx_notificaciones_usuario; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notificaciones_usuario ON public.notificaciones USING btree (usuario);


--
-- Name: idx_rep_est_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rep_est_id ON public.reportes USING btree (estacion_id);


--
-- Name: idx_rep_ruta_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rep_ruta_id ON public.reportes USING btree (ruta_id);


--
-- Name: idx_reportes_estacion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reportes_estacion ON public.reportes USING btree (estacion);


--
-- Name: idx_ruta_estaciones_estacion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ruta_estaciones_estacion ON public.ruta_estaciones USING btree (estacion_id);


--
-- Name: idx_ruta_estaciones_ruta; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ruta_estaciones_ruta ON public.ruta_estaciones USING btree (ruta_id);


--
-- Name: idx_rutas_codigo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rutas_codigo ON public.rutas USING btree (codigo);


--
-- Name: idx_usuarios_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_email ON public.usuarios USING btree (email);


--
-- Name: camaras fk_cam_est; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.camaras
    ADD CONSTRAINT fk_cam_est FOREIGN KEY (estacion_id) REFERENCES public.estaciones(id) ON DELETE SET NULL;


--
-- Name: camaras fk_cam_vagon; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.camaras
    ADD CONSTRAINT fk_cam_vagon FOREIGN KEY (vagon_id) REFERENCES public.vagones(id) ON DELETE SET NULL;


--
-- Name: despachos fk_des_bus; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.despachos
    ADD CONSTRAINT fk_des_bus FOREIGN KEY (bus_id) REFERENCES public.buses(id) ON DELETE SET NULL;


--
-- Name: despachos fk_des_cond; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.despachos
    ADD CONSTRAINT fk_des_cond FOREIGN KEY (conductor_id) REFERENCES public.conductores(id) ON DELETE SET NULL;


--
-- Name: despachos fk_des_est; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.despachos
    ADD CONSTRAINT fk_des_est FOREIGN KEY (estacion_id) REFERENCES public.estaciones(id) ON DELETE SET NULL;


--
-- Name: despachos fk_des_op; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.despachos
    ADD CONSTRAINT fk_des_op FOREIGN KEY (operador_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: despachos fk_des_ruta; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.despachos
    ADD CONSTRAINT fk_des_ruta FOREIGN KEY (ruta_id) REFERENCES public.rutas(id) ON DELETE SET NULL;


--
-- Name: notificaciones fk_not_rep; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT fk_not_rep FOREIGN KEY (reporte_id) REFERENCES public.reportes(id) ON DELETE CASCADE;


--
-- Name: notificaciones fk_not_usu; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT fk_not_usu FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: reportes fk_rep_est; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes
    ADD CONSTRAINT fk_rep_est FOREIGN KEY (estacion_id) REFERENCES public.estaciones(id) ON DELETE SET NULL;


--
-- Name: reportes fk_rep_ruta; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes
    ADD CONSTRAINT fk_rep_ruta FOREIGN KEY (ruta_id) REFERENCES public.rutas(id) ON DELETE SET NULL;


--
-- Name: reportes fk_rep_usu; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes
    ADD CONSTRAINT fk_rep_usu FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: reportes fk_rep_vagon; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reportes
    ADD CONSTRAINT fk_rep_vagon FOREIGN KEY (vagon_id) REFERENCES public.vagones(id) ON DELETE SET NULL;


--
-- Name: ruta_estaciones ruta_estaciones_estacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ruta_estaciones
    ADD CONSTRAINT ruta_estaciones_estacion_id_fkey FOREIGN KEY (estacion_id) REFERENCES public.estaciones(id) ON DELETE CASCADE;


--
-- Name: ruta_estaciones ruta_estaciones_ruta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ruta_estaciones
    ADD CONSTRAINT ruta_estaciones_ruta_id_fkey FOREIGN KEY (ruta_id) REFERENCES public.rutas(id) ON DELETE CASCADE;


--
-- Name: vagon_rutas vagon_rutas_ruta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vagon_rutas
    ADD CONSTRAINT vagon_rutas_ruta_id_fkey FOREIGN KEY (ruta_id) REFERENCES public.rutas(id) ON DELETE CASCADE;


--
-- Name: vagon_rutas vagon_rutas_vagon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vagon_rutas
    ADD CONSTRAINT vagon_rutas_vagon_id_fkey FOREIGN KEY (vagon_id) REFERENCES public.vagones(id) ON DELETE CASCADE;


--
-- Name: vagones vagones_estacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vagones
    ADD CONSTRAINT vagones_estacion_id_fkey FOREIGN KEY (estacion_id) REFERENCES public.estaciones(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict U4zzv8AlOTdaCTmlhZWlUdHb6OH8523qRvesJGFIel2jIK7KslVFsqdABot8QJL

