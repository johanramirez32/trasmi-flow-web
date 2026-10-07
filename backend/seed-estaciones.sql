-- ============================================================
-- TransMiFlow - Catalogo OFICIAL de estaciones TransMilenio
--
-- *** OBSOLETO - NO LO EJECUTES EN pgADMIN ***
-- Este archivo esta desactualizado. Usa el cargador automatico:
--     node cargar-estaciones.js
-- (genera el esquema, crea indices y carga las 153 estaciones
--  directamente del CSV oficial, de forma idempotente)
--
-- Fuente: Archivo oficial "Estaciones_Troncales_de_TRANSMILENIO.csv"
--         (153 estaciones, coordenadas en WGS84)
--
--glomeracion: derivada de la capacidad real de buses por estacion
--   (cap_art + cap_biart), dividida en terciles:
--   Alta  = capacidad alta      Media = capacidad media
--   Baja  = capacidad baja
--
-- Ejecutar DESPUES de init-db.sql
-- ============================================================

DELETE FROM estaciones;   -- limpia la carga de referencia anterior

INSERT INTO estaciones (nombre, troncal, lat, lng, aglomeracion, capacidad) VALUES
  ('AV. Chile', 'E - NQS Central', 4.6663526, -74.0745745, 'Alta', 344),
  ('CAN', 'K - Calle 26', 4.6468764, -74.0990465, 'Media', 260),
  ('Campín - UAN', 'E - NQS Central', 4.6453976, -74.0787101, 'Media', 272),
  ('San Diego', 'L - Carrera Decima', 4.6108991, -74.0715001, 'Alta', 288),
  ('Granja - Kr 77', 'D - Calle 80', 4.6991510, -74.0960177, 'Alta', 392),
  ('Ricaurte - NQS', 'E - NQS Central', 4.6116838, -74.0938659, 'Alta', 392),
  ('Quirigua', 'D - Calle 80', 4.7067252, -74.1087393, 'Baja', 152),
  ('Suba - Calle 100', 'C - Suba', 4.6869683, -74.0644428, 'Alta', 304),
  ('Calle 75 - Zona M', 'E - NQS Central', 4.6701510, -74.0713049, 'Media', 272),
  ('AV. Boyacá', 'D - Calle 80', 4.6939327, -74.0871319, 'Alta', 304),
  ('Calle 40 Sur', 'H - Caracas Sur', 4.5757942, -74.1200792, 'Alta', 392),
  ('AV. Américas - AV. Boyacá', 'F - Americas', 4.6301178, -74.1342246, 'Media', 272),
  ('Marsella', 'F - Americas', 4.6296772, -74.1301639, 'Alta', 320),
  ('Niza - Calle 127', 'C - Suba', 4.7120012, -74.0723072, 'Baja', 200),
  ('La Campiña', 'C - Suba', 4.7426543, -74.0912005, 'Alta', 352),
  ('Transversal 86', 'F - Americas', 4.6341947, -74.1520678, 'Media', 240),
  ('Corferias', 'K - Calle 26', 4.6343065, -74.0897008, 'Media', 252),
  ('Guatoque - Veraguas', 'G - NQS Sur (Ramal)', 4.6041710, -74.0949331, 'Media', 240),
  ('CDS - Carrera 32', 'F - Americas', 4.6161362, -74.0939495, 'Baja', 168),
  ('Ciudad Universitaria - Lotería de Bogotá', 'K - Calle 26', 4.6308754, -74.0835272, 'Media', 260),
  ('Universidad Nacional', 'E - NQS Central', 4.6371211, -74.0793262, 'Alta', 412),
  ('Avenida Rojas - UNISALESIANA', 'K - Calle 26', 4.6619444, -74.1087720, 'Alta', 320),
  ('Tercer Milenio', 'A - Caracas', 4.5981350, -74.0838363, 'Alta', 320),
  ('Concejo de Bogotá', 'K - Calle 26', 4.6259874, -74.0802897, 'Media', 260),
  ('Cl38A sur - CENTRO MAYOR', 'G - NQS Sur', 4.5938094, -74.1237551, 'Media', 212),
  ('7 de Agosto', 'E - NQS Central', 4.6572953, -74.0776865, 'Media', 260),
  ('AV. 68', 'D - Calle 80', 4.6861009, -74.0807690, 'Alta', 296),
  ('Distrito Grafiti', 'F - Americas', 4.6278501, -74.1115841, 'Media', 272),
  ('Polo - FINCOMERCIO', 'D - Calle 80', 4.6701626, -74.0643387, 'Alta', 360),
  ('Tygua - San José', 'G - NQS Sur (Ramal)', 4.5997872, -74.0887614, 'Media', 228),
  ('Quinta Paredes', 'K - Calle 26', 4.6375035, -74.0931323, 'Media', 260),
  ('Salitre - El Greco', 'K - Calle 26', 4.6508648, -74.1016488, 'Media', 260),
  ('Zona Industrial', 'F - Americas', 4.6203253, -74.0986861, 'Baja', 168),
  ('León XIII', 'Zona Leon XIII', 4.5921728, -74.1931353, 'Media', 224),
  ('Paloquemao', 'E - NQS Central', 4.6169219, -74.0895534, 'Media', 272),
  ('Carrera 90', 'D - Calle 80', 4.7046665, -74.1045703, 'Alta', 304),
  ('Gobernación', 'K - Calle 26', 4.6428300, -74.0965377, 'Media', 260),
  ('Terreros - Hospital Cardio Vascular', 'Zona Leon XIII', 4.5889627, -74.1995226, 'Alta', 356),
  ('Escuela Militar', 'D - Calle 80', 4.6755350, -74.0698022, 'Media', 272),
  ('Mandalay', 'F - Americas', 4.6308637, -74.1412982, 'Media', 240),
  ('AV. Cali', 'D - Calle 80', 4.7024828, -74.1002896, 'Alta', 304),
  ('Suba - TV. 91', 'C - Suba', 4.7389368, -74.0869923, 'Media', 264),
  ('Ricaurte - CL 13', 'F - Americas', 4.6130180, -74.0904765, 'Alta', 312),
  ('Restrepo', 'H - Caracas Sur', 4.5818491, -74.1014288, 'Baja', 200),
  ('Prado', 'B - Autopista Norte', 4.7145584, -74.0525583, 'Media', 248),
  ('Terminal', 'B - Autopista Norte', 4.7688188, -74.0435725, 'Baja', 152),
  ('Virrey', 'B - Autopista Norte', 4.6759974, -74.0590195, 'Alta', 352),
  ('Toberin - Foundever', 'B - Autopista Norte', 4.7461850, -74.0472549, 'Alta', 552),
  ('Pepe Sierra Universidad UTEL', 'B - Autopista Norte', 4.6981269, -74.0553088, 'Baja', 200),
  ('Calle 100 - Marketmedios', 'B - Autopista Norte', 4.6839494, -74.0577123, 'Alta', 392),
  ('Calle 142', 'B - Autopista Norte', 4.7268501, -74.0505033, 'Baja', 180),
  ('Portal Norte – Unicervantes', 'B - Autopista Norte', 4.7546229, -74.0460446, 'Baja', 210),
  ('Calle 187', 'B - Autopista Norte', 4.7633366, -74.0444437, 'Baja', 152),
  ('Alcalá – Colegio S. Tomás Dominicos', 'B - Autopista Norte', 4.7211582, -74.0514592, 'Alta', 392),
  ('Calle 146', 'B - Autopista Norte', 4.7308911, -74.0498112, 'Media', 248),
  ('Calle 127', 'B - Autopista Norte', 4.7046396, -74.0542252, 'Baja', 200),
  ('Héroes - Colmena Seguros', 'B - Autopista Norte', 4.6681360, -74.0603100, 'Media', 264),
  ('Calle 161', 'B - Autopista Norte', 4.7419153, -74.0480003, 'Baja', 96),
  ('Calle 106 - Maletas Explora', 'B - Autopista Norte', 4.6929826, -74.0561824, 'Media', 248),
  ('Mazurén', 'B - Autopista Norte', 4.7345885, -74.0492262, 'Media', 248),
  ('Calle 45 - American School Way', 'A - Caracas', 4.6314524, -74.0678787, 'Alta', 320),
  ('Carrera 53', 'D - Calle 80', 4.6818048, -74.0774214, 'Baja', 152),
  ('La Castellana', 'E - NQS Central', 4.6756112, -74.0644432, 'Media', 232),
  ('AV. 1 Mayo', 'L - Carrera Decima', 4.5769393, -74.0937094, 'Alta', 384),
  ('De La Sabana', 'F - Americas', 4.6054211, -74.0818943, 'Baja', 168),
  ('La Despensa', 'Zona Leon XIII', 4.5945938, -74.1881122, 'Media', 224),
  ('Calle 72 - Areandina', 'A - Caracas', 4.6582375, -74.0620679, 'Baja', 0),
  ('Centro Memoria', 'K - Calle 26', 4.6204650, -74.0763206, 'Media', 260),
  ('Carrera 43 - Comapan', 'F - Americas', 4.6227815, -74.1014379, 'Baja', 168),
  ('Consuelo', 'H - Caracas Sur', 4.5602273, -74.1238743, 'Baja', 192),
  ('Temporal AV. Jiménez - Inter Eléctricas', 'A - Caracas', 4.6028669, -74.0804100, 'Alta', 288),
  ('Comuneros', 'G - NQS Sur', 4.6042500, -74.0998614, 'Media', 252),
  ('El Tiempo – Cámara de Comercio de Bogotá', 'K - Calle 26', 4.6570671, -74.1056467, 'Media', 240),
  ('Biblioteca Tintal', 'F - Americas', 4.6379078, -74.1593525, 'Alta', 304),
  ('Ciudad Jardín - UAN', 'L - Carrera Decima', 4.5815425, -74.0903516, 'Media', 264),
  ('Bicentenario', 'L - Carrera Decima', 4.5940208, -74.0818354, 'Alta', 384),
  ('Temporal Calle 57', 'A - Caracas', 4.6429816, -74.0658283, 'Alta', 320),
  ('Biblioteca', 'Portal Tunal', 4.5703035, -74.1303887, 'Baja', 60),
  ('AV. ElDorado', 'E - NQS Central', 4.6306684, -74.0798786, 'Media', 260),
  ('Calle 26 - Atrio', 'A - Caracas', 4.6166516, -74.0721585, 'Baja', 0),
  ('Alquería', 'G - NQS Sur', 4.5942699, -74.1342699, 'Baja', 204),
  ('Bosa', 'G - NQS Sur', 4.5968880, -74.1812250, 'Media', 272),
  ('CAD', 'E - NQS Central', 4.6234157, -74.0841812, 'Media', 272),
  ('Banderas', 'F - Americas', 4.6312945, -74.1457700, 'Alta', 608),
  ('Calle 19', 'A - Caracas', 4.6078646, -74.0768697, 'Alta', 320),
  ('Temporal AV. Jiménez - Inter Eléctricas', 'J - Eje Ambiental', 4.6030533, -74.0790928, 'Media', 272),
  ('Movistar Arena', 'E - NQS Central', 4.6500398, -74.0783625, 'Media', 272),
  ('Calle 76 - San Felipe', 'A - Caracas', 4.6630294, -74.0612613, 'Alta', 320),
  ('Calle 63', 'A - Caracas', 4.6484040, -74.0648705, 'Baja', 0),
  ('Calle 85', 'B - Autopista Norte', 4.6723128, -74.0596436, 'Alta', 320),
  ('NQS - Calle 30 S', 'G - NQS Sur', 4.5947985, -74.1178807, 'Media', 232),
  ('Country Sur', 'L - Carrera Decima', 4.5714167, -74.0986341, 'Media', 264),
  ('Carrera 47', 'D - Calle 80', 4.6777558, -74.0732548, 'Alta', 304),
  ('Portal 80', 'D - Calle 80', 4.7098295, -74.1105063, 'Baja', 165),
  ('Olaya', 'H - Caracas Sur', 4.5789152, -74.1073638, 'Alta', 296),
  ('Molinos', 'H - Caracas Sur', 4.5570646, -74.1218278, 'Alta', 304),
  ('Nariño', 'H - Caracas Sur', 4.5862847, -74.0939254, 'Baja', 144),
  ('Gratamira', 'C - Suba', 4.7274558, -74.0747233, 'Baja', 144),
  ('Pradera - Plaza Central', 'F - Americas', 4.6285065, -74.1186771, 'Baja', 200),
  ('Las Nieves', 'L - Carrera Decima', 4.6060653, -74.0743267, 'Media', 264),
  ('Modelia', 'K - Calle 26', 4.6750247, -74.1171471, 'Media', 260),
  ('Portal El Dorado – C.C. Nuestro Bogotá', 'K - Calle 26', 4.6816220, -74.1213980, 'Media', 216),
  ('Museo del Oro', 'J - Eje Ambiental', 4.6011530, -74.0729084, 'Baja', 144),
  ('General Santander', 'G - NQS Sur', 4.5935511, -74.1295450, 'Alta', 404),
  ('Portal 20 de Julio', 'L - Carrera Decima', 4.5657181, -74.0970084, 'Alta', 350),
  ('Humedal Córdoba', 'C - Suba', 4.7066898, -74.0711743, 'Baja', 156),
  ('Parque', 'Portal Tunal', 4.5683266, -74.1354145, 'Baja', 60),
  ('Policarpa', 'L - Carrera Decima', 4.5861158, -74.0870165, 'Media', 264),
  ('Museo Nacional', 'M - Carrera Septima', 4.6152449, -74.0692197, 'Media', 240),
  ('Hospital', 'H - Caracas Sur', 4.5950505, -74.0862263, 'Baja', 96),
  ('Normandía', 'K - Calle 26', 4.6690087, -74.1132800, 'Media', 260),
  ('Perdomo', 'G - NQS Sur', 4.5957878, -74.1649697, 'Baja', 200),
  ('Hortúa', 'H - Caracas Sur', 4.5908473, -74.0902460, 'Baja', 192),
  ('Portal Usme', 'Portal Usme', 4.5317146, -74.1193910, 'Baja', 210),
  ('Ferias', 'D - Calle 80', 4.6908859, -74.0846013, 'Baja', 152),
  ('Temporal Marly', 'A - Caracas', 4.6375591, -74.0667880, 'Alta', 320),
  ('Patio Bonito', 'F - Americas', 4.6331803, -74.1646143, 'Alta', 304),
  ('Portal Tunal', 'Portal Tunal', 4.5695715, -74.1392402, 'Baja', 152),
  ('Fucha', 'H - Caracas Sur', 4.5829726, -74.0994017, 'Baja', 144),
  ('Minuto de Dios', 'D - Calle 80', 4.6968816, -74.0919329, 'Alta', 296),
  ('Portal Américas', 'F - Americas', 4.6293813, -74.1730585, 'Alta', 342),
  ('Las Aguas - Centro Colombo Americano', 'J - Eje Ambiental', 4.6025798, -74.0684014, 'Baja', 120),
  ('Portal Suba', 'C - Suba', 4.7468151, -74.0942789, 'Alta', 304),
  ('Suba - AV. Boyacá', 'C - Suba', 4.7212672, -74.0747116, 'Baja', 144),
  ('Santa Lucía', 'H - Caracas Sur', 4.5709685, -74.1247087, 'Media', 272),
  ('San Martín', 'C - Suba', 4.6763897, -74.0671767, 'Baja', 192),
  ('Universidades – CityU', 'K - Calle 26', 4.6046462, -74.0673158, 'Media', 260),
  ('Santa Isabel', 'G - NQS Sur', 4.6016750, -74.1026176, 'Media', 240),
  ('Suba - Calle 95', 'C - Suba', 4.6846946, -74.0632183, 'Baja', 144),
  ('Puente Aranda', 'F - Americas', 4.6256697, -74.1046394, 'Baja', 168),
  ('Quiroga', 'H - Caracas Sur', 4.5768097, -74.1143805, 'Baja', 144),
  ('Puentelargo', 'C - Suba', 4.6934008, -74.0672087, 'Baja', 200),
  ('San Victorino', 'L - Carrera Decima', 4.6010294, -74.0774224, 'Alta', 384),
  ('CC Paseo Villa del Río - Madelena', 'G - NQS Sur', 4.5962809, -74.1568810, 'Baja', 204),
  ('San Mateo - CC Unisur', 'Zona Leon XIII', 4.5859606, -74.2054497, 'Alta', 424),
  ('Sevillana', 'G - NQS Sur', 4.5951073, -74.1474103, 'Baja', 204),
  ('Rionegro', 'C - Suba', 4.6803511, -74.0648166, 'Baja', 144),
  ('Suba - Calle 116', 'C - Suba', 4.6992411, -74.0698439, 'Baja', 200),
  ('San Bernardo', 'L - Carrera Decima', 4.5901956, -74.0843273, 'Media', 264),
  ('SENA', 'G - NQS Sur', 4.5973705, -74.1106425, 'Alta', 304),
  ('San Facon Carrera 22', 'F - Americas', 4.6097352, -74.0867948, 'Media', 272),
  ('Socorro', 'H - Caracas Sur', 4.5646533, -74.1255839, 'Baja', 200),
  ('21 Ángeles', 'C - Suba', 4.7355081, -74.0809865, 'Baja', 144),
  ('Temporal Calle 34', 'A - Caracas', 4.6215755, -74.0697192, 'Alta', 320),
  ('Venecia', 'G - NQS Sur', 4.5955628, -74.1426492, 'Baja', 204),
  ('Danubio', 'Portal Usme', 4.5436543, -74.1208516, 'Alta', 304),
  ('Portal Sur - JFK Coop. Financiera', 'G - NQS Sur', 4.5969400, -74.1692978, 'Media', 228),
  ('Temporal Calle 22', 'A - Caracas', 4.6100199, -74.0755414, 'Alta', 320),
  ('Temporal AV. 39', 'A - Caracas', 4.6268972, -74.0686968, 'Alta', 312),
  ('Temporal Flores – Areandina', 'A - Caracas', 4.6549030, -74.0630091, 'Baja', 192),
  ('Tibanica - Primavera', 'Zona Tibanica', 4.6067270, -74.2060530, 'Alta', 304),
  ('Los Laureles', 'Zona Tibanica', 4.6110914, -74.2023284, 'Alta', 304),
  ('Islandia', 'Zona Tibanica', 4.6143476, -74.1937437, 'Alta', 304)
ON CONFLICT (nombre, troncal) DO NOTHING;

-- ============ VERIFICACION ============
SELECT COUNT(*) AS total_estaciones FROM estaciones;

SELECT aglomeracion, COUNT(*) AS estaciones
FROM estaciones GROUP BY aglomeracion ORDER BY 2 DESC;

SELECT REPLACE(SUBSTRING(troncal FROM '^(.)'), '', '') AS letra, troncal, COUNT(*) AS estaciones
FROM estaciones GROUP BY letra, troncal ORDER BY letra;

-- Las 15 estaciones de mayor capacidad (mayor demanda)
SELECT nombre, troncal, aglomeracion, capacidad
FROM estaciones ORDER BY capacidad DESC LIMIT 15;
