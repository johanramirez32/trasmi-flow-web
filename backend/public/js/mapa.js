    // ==========================================================
    // MAPA
    // ==========================================================
    function initMap() {
      if (map) { map.invalidateSize(); return; }
      map = L.map('mapa', { zoomControl: false }).setView([4.6097, -74.0817], 12);
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Esri World Street Map: funciona sin API key (OSM bloquea y CARTO pide llave)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/' +
        'World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri, &copy; OpenStreetMap'
      }).addTo(map);

      capaMarcadores = L.layerGroup().addTo(map);

      // Si el GPS no funciona, el usuario puede marcar su punto con un clic
      map.on('click', function (ev) {
        if (!modoUbicacionManual) { return; }
        modoUbicacionManual = false;
        userPos = { lat: ev.latlng.lat, lng: ev.latlng.lng };
        gpsActivo = true;
        if (map.getContainer()) { map.getContainer().style.cursor = ''; }
        var coords = document.getElementById('txtCoordenadas');
        if (coords) { coords.textContent = userPos.lat.toFixed(5) + ', ' + userPos.lng.toFixed(5); }
        ponerEstadoGPS('Ubicación marcada en el mapa', 'emerald');
        if (typeof alCambiarUbicacion === 'function') { alCambiarUbicacion(); }
        pintar();
      });

      // Los datos pueden haber llegado antes que el mapa: repintar
      if (estaciones.length > 0) pintar();

      // Boton dentro del mapa: ir a la estacion mas cercana al usuario
      agregarBotonMapa();
    }

    // ==========================================================
    // DATOS
    // ==========================================================
    function cargarEstaciones() {
      return Promise.all([
        fetch(API_URL + '/estaciones').then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        }),
        // Los niveles son complementarios: si fallan, las estaciones igual se cargan
        fetch(API_URL + '/niveles?horas=168')
          .then(function (r) { return r.ok ? r.json() : []; })
          .catch(function () { return []; })
      ])
        .then(function (res) {
          var data = res[0] || [];
          var niveles = res[1] || [];
          window.__nivelesUsuario = niveles;
          estaciones = data.map(function (e) {
            var niv = niveles.find(function (n) { return (n.estacion || '').toLowerCase() === (e.nombre || '').toLowerCase(); });
            return {
              id: e.id, nombre: e.nombre, troncal: e.troncal,
              lat: parseFloat(e.lat), lng: parseFloat(e.lng),
              // El nivel depende de los reportes de los usuarios
              aglomeracion: niv ? niv.nivel : nivelTexto(e.aglomeracion),
              porcentaje: niv ? niv.porcentaje : 0,
              portal: (niv && niv.portal) || e.portal || '',
              capacidad: e.capacidad != null ? e.capacidad : 0
            };
          });
          llenarDestinos();
          pintar();
        })
        .catch(function (err) {
          document.getElementById('listaResultado').innerHTML =
            '<div class="text-center py-6 space-y-2">' +
            '<p class="text-xs text-red-400">No se pudieron cargar las estaciones.</p>' +
            '<p class="text-[10px] text-slate-500">' + escHtml(err.message) + '</p>' +
            '<button onclick="cargarEstaciones()" class="px-3 py-2 bg-brand-dark border border-brand-border text-slate-300 text-[11px] font-bold rounded-lg hover:border-brand-red">Reintentar</button>' +
            '</div>';
          console.error('Error cargando estaciones:', err);
        });
    }

    /** Llena las sugerencias del campo destino con las estaciones disponibles */
    function llenarDestinos() {
      var lista = document.getElementById('listaDestinos');
      if (!lista) { return; }
      lista.innerHTML = (estaciones || []).map(function (e) {
        return '<option value="' + escHtml(e.nombre) + '">' + escHtml(e.troncal || '') + '</option>';
      }).join('');
    }

    // ==========================================================
    // PINTADO
    // ==========================================================
    function pintar() {
      if (!map || estaciones.length === 0) return;

      // Durante el viaje no se repintan las estaciones cercanas:
      // solo se actualiza la caminata si el GPS se ha movido
      if (modoViaje) { actualizarRutaPeatonal(); return; }

      capaMarcadores.clearLayers();
      if (circuloCerca) { map.removeLayer(circuloCerca); circuloCerca = null; }
      if (lineaRuta)    { map.removeLayer(lineaRuta);    lineaRuta = null; }

      if (seleccion) {
        pintarDetalle();
      } else {
        pintarCercanas();
      }
      actualizarIconos();
    }

    // Vista por defecto: ubicacion del usuario + 5 mas cercanas
    function pintarCercanas() {
      var lista, titulo, centro;

      if (userPos) {
        if (marcadorUsuario) map.removeLayer(marcadorUsuario);
        marcadorUsuario = L.marker([userPos.lat, userPos.lng], {
          icon: iconoUsuario(), draggable: true, zIndexOffset: 1000
        }).addTo(map);
        marcadorUsuario.on('dragend', function (e) {
          var ll = e.target.getLatLng();
          userPos = { lat: ll.lat, lng: ll.lng };
          pintar();
        });

        centro = [userPos.lat, userPos.lng];
        lista = estaciones
          .map(function (e) {
            return Object.assign({}, e, { dist: distanciaKM(centro[0], centro[1], e.lat, e.lng) });
          })
          .sort(function (a, b) { return a.dist - b.dist; })
          .slice(0, CANTIDAD_CERCANAS);

        titulo = userPos ? 'Estaciones cercanas a tu ubicación' : 'Estaciones cercanas (marca tu ubicación)';
      } else {
        centro = [4.6097, -74.0817];
        lista = estaciones
          .map(function (e) {
            return Object.assign({}, e, { dist: distanciaKM(centro[0], centro[1], e.lat, e.lng) });
          })
          .sort(function (a, b) { return a.dist - b.dist; })
          .slice(0, CANTIDAD_CERCANAS);
        titulo = 'Estaciones (marca tu ubicación en el mapa)';
      }

      document.getElementById('tituloPanel').textContent = titulo;
      document.getElementById('contador').textContent = lista.length;
      document.getElementById('listaResultado').innerHTML = lista.map(tarjetaCercana).join('');

      lista.forEach(function (e) {
        L.marker([e.lat, e.lng], { icon: iconoEstacion(e), title: e.nombre })
          .bindPopup(popupEstacion(e))
          .bindTooltip(e.nombre + ' · ' + (e.troncal || ''), { direction: 'top', offset: [0, -10], className: 'tooltip-estacion' })
          .on('click', function () { if (typeof seleccionarEstacionMapa === 'function') { seleccionarEstacionMapa(e); } })
          .addTo(capaMarcadores);
      });

      circuloCerca = L.circle(centro, {
        radius: 900, color: '#3b82f6', weight: 1.5, opacity: .5,
        fillColor: '#3b82f6', fillOpacity: .06, dashArray: '5, 5'
      }).addTo(map);

      var grupo = L.latLngBounds([[centro[0], centro[1]]]);
      lista.forEach(function (e) { grupo.extend([e.lat, e.lng]); });
      map.fitBounds(grupo.pad(0.25), { maxZoom: 15 });
    }

    // Trae la ruta por OSRM y la dibuja en el mapa como linea azul
    function dibujarRuta(lat1, lng1, lat2, lng2) {
      if (!map) return;
      return fetch('https://router.project-osrm.org/route/v1/driving/' + lng1 + ',' + lat1 + ';' + lng2 + ',' + lat2 + '?overview=full&geometries=geojson')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data || !data.routes || !data.routes.length) return;
          var coords = data.routes[0].geometry.coordinates.map(function (c) { return [c[1], c[0]]; });
          if (lineaRuta) { map.removeLayer(lineaRuta); lineaRuta = null; }
          lineaRuta = L.polyline(coords, { color: '#3b82f6', weight: 5, opacity: 0.8 }).addTo(map);
        })
        .catch(function (err) { console.error('Error dibujando ruta:', err); });
    }

    // ==========================================================
    // RUTAS DE TRANSMILENIO (VISTA USUARIO)
    // ==========================================================
    /** Normaliza texto para comparar nombres de estaciones */
    function normTexto(s) {
      return String(s == null ? '' : s)
        .toLowerCase()
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
    }

    /** La estacion mas cercana a una posicion (o a la ubicacion del usuario) */
    function estacionCercanaA(lat, lng) {
      if (!estaciones || !estaciones.length) return null;
      var mejor = null, mejorDist = Infinity;
      estaciones.forEach(function (e) {
        var d = distanciaKM(lat, lng, e.lat, e.lng);
        if (d < mejorDist) { mejorDist = d; mejor = e; }
      });
      return mejor;
    }

    /**
     * Estacion de inicio del viaje: SIEMPRE la mas cercana a la ubicacion real
     * del usuario (GPS). Si aun no hay GPS se usa la estacion elegida en el mapa.
     */
    function estacionMasCercana() {
      if (!estaciones || !estaciones.length) return null;
      if (userPos) { return estacionCercanaA(userPos.lat, userPos.lng); }
      return seleccion || estacionCercanaA(4.6097, -74.0817);
    }

    /** Proyeccion de una parada sobre el corredor (segmento + posicion) */
    function proyectoEnCorredor(coords, parada) {
      var KX = 111320 * Math.cos(4.6097 * Math.PI / 180);
      var KY = 110540;
      var la = parada.lat != null ? parada.lat : parada.latitud;
      var lo = parada.lng != null ? parada.lng : parada.longitud;
      var mejor = { i: 0, t: 0, dist: Infinity };
      if (la == null || lo == null) { return mejor; }
      var px = lo * KX, py = la * KY;

      for (var i = 0; i < coords.length - 1; i++) {
        var a = coords[i], b = coords[i + 1];
        var ax = a[1] * KX, ay = a[0] * KY;
        var bx = b[1] * KX, by = b[0] * KY;
        var dx = bx - ax, dy = by - ay;
        var l2 = dx * dx + dy * dy;
        var t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
        if (t < 0) { t = 0; } else if (t > 1) { t = 1; }
        var cx = ax + t * dx, cy = ay + t * dy;
        var d = Math.sqrt((px - cx) * (px - cx) + (py - cy) * (py - cy));
        if (d < mejor.dist) { mejor = { i: i, t: t, dist: d }; }
      }
      return mejor;
    }

    function coordsDeParada(p) {
      return [p.lat != null ? p.lat : p.latitud, p.lng != null ? p.lng : p.longitud];
    }

    /** Indice de la parada mas cercana a una estacion (cuando la ruta no la trae) */
    function indiceParadaCercana(paradas, est) {
      if (!est || !paradas || !paradas.length) return -1;
      var la = est.lat != null ? est.lat : est.latitud;
      var lo = est.lng != null ? est.lng : est.longitud;
      if (la == null || lo == null) return -1;
      var mejor = -1, mejorDist = Infinity;
      for (var i = 0; i < paradas.length; i++) {
        var p = paradas[i];
        var pla = p.lat != null ? p.lat : p.latitud;
        var plo = p.lng != null ? p.lng : p.longitud;
        if (pla == null || plo == null) continue;
        var d = distanciaKM(la, lo, pla, plo);
        if (d < mejorDist) { mejorDist = d; mejor = i; }
      }
      return mejor;
    }

    /**
     * Recorta el corredor de la linea para dibujar SOLO el tramo entre la
     * estacion de inicio y la estacion de destino del usuario.
     */
    function recortarCorredor(ruta, origen, destino) {
      var coords = (ruta && ruta.coordenadas) ? ruta.coordenadas : [];
      if (coords.length < 2) { return coords; }

      var paradas = ruta.estaciones || [];
      var iO = ruta.indice_origen;
      var iD = ruta.indice_destino;
      if (iO == null || iO < 0) { iO = indiceParadaCercana(paradas, origen); }
      if (iD == null || iD < 0) { iD = indiceParadaCercana(paradas, destino); }
      if (iO < 0 || iD < 0 || iO >= paradas.length || iD >= paradas.length) { return coords; }

      var pa = proyectoEnCorredor(coords, paradas[iO]);
      var pb = proyectoEnCorredor(coords, paradas[iD]);
      var adelante = (pa.i < pb.i) || (pa.i === pb.i && pa.t <= pb.t);

      var ini = adelante ? pa.i : pb.i;
      var fin = adelante ? pb.i : pa.i;
      var pIni = adelante ? paradas[iO] : paradas[iD];
      var pFin = adelante ? paradas[iD] : paradas[iO];

      // El trazo empieza y termina exactamente en las dos estaciones marcadas
      var tramo = [coordsDeParada(pIni)];
      for (var k = ini + 1; k <= fin; k++) { tramo.push(coords[k]); }
      tramo.push(coordsDeParada(pFin));
      return tramo;
    }

    /** Deja el mapa limpio: solo el viaje que se va a trazar */
    function limpiarMapaParaViaje() {
      if (!map) { return; }
      if (capaMarcadores) { capaMarcadores.clearLayers(); }
      if (marcadorUsuario) { map.removeLayer(marcadorUsuario); marcadorUsuario = null; }
      if (circuloCerca) { map.removeLayer(circuloCerca); circuloCerca = null; }
      if (lineaRuta) { map.removeLayer(lineaRuta); lineaRuta = null; }
      if (lineaRutaTM) { map.removeLayer(lineaRutaTM); lineaRutaTM = null; }
      if (capaParadasTM) { map.removeLayer(capaParadasTM); capaParadasTM = null; }
      if (capaPlan) { map.removeLayer(capaPlan); capaPlan = null; }
    }

    /** Traza SOLO la ruta entre el inicio y el destino, con dos marcadores */
    function trazarViaje(ruta, origen, destino) {
      if (!map || !ruta) { return false; }
      var coords = recortarCorredor(ruta, origen, destino);
      if (coords.length < 2) { return false; }

      limpiarMapaParaViaje();
      lineaRutaTM = L.polyline(coords, { color: '#8b5cf6', weight: 6, opacity: 0.9 }).addTo(map);
      marcarPlan(origen, destino);
      map.fitBounds(coords, { padding: [50, 50] });
      return true;
    }

    /**
     * Dibuja el corredor real de la ruta de Transmilenio sobre el mapa
     * y marca cada una de sus paradas.
     */
    function dibujarCorredorTransmilenio(ruta) {
      if (!map || !ruta) return false;

      var coords = [];
      if (ruta.coordenadas && ruta.coordenadas.length) {
        coords = ruta.coordenadas.filter(function (c) { return c && c[0] != null && c[1] != null; });
      } else {
        (ruta.estaciones || []).forEach(function (e) {
          var la = e.lat != null ? e.lat : e.latitud;
          var lo = e.lng != null ? e.lng : e.longitud;
          if (la != null && lo != null) { coords.push([la, lo]); }
        });
      }
      if (coords.length < 2) { return false; }

      if (lineaRutaTM) { map.removeLayer(lineaRutaTM); lineaRutaTM = null; }
      if (capaParadasTM) { map.removeLayer(capaParadasTM); capaParadasTM = null; }

      var color = ruta.color_hex || '#8b5cf6';
      lineaRutaTM = L.polyline(coords, { color: color, weight: 5, opacity: 0.85 }).addTo(map);

      capaParadasTM = L.layerGroup().addTo(map);
      (ruta.estaciones || []).forEach(function (e) {
        var la = e.lat != null ? e.lat : e.latitud;
        var lo = e.lng != null ? e.lng : e.longitud;
        if (la == null || lo == null) { return; }
        L.circleMarker([la, lo], { radius: 4, color: color, weight: 2, fillColor: '#ffffff', fillOpacity: 1 })
          .bindPopup('<b>' + escHtml(e.nombre) + '</b>')
          .addTo(capaParadasTM);
      });

      map.fitBounds(coords, { padding: [40, 40] });
      return true;
    }

    /** Marca en el mapa la estacion de origen y la de destino */
    function marcarPlan(o, d) {
      if (!map) return;
      if (capaPlan) { map.removeLayer(capaPlan); capaPlan = null; }
      capaPlan = L.layerGroup().addTo(map);
      if (o && o.latitud != null) {
        L.marker([o.latitud, o.longitud], {
          icon: L.divIcon({
            className: '',
            html: '<div style="width:18px;height:18px;border-radius:50%;background:#22c55e;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.6)"></div>',
            iconSize: [18, 18], iconAnchor: [9, 9]
          })
        }).bindPopup('<b>Origen: ' + escHtml(o.nombre) + '</b>').addTo(capaPlan);
      }
      if (d && d.latitud != null) {
        L.marker([d.latitud, d.longitud], {
          icon: L.divIcon({
            className: '',
            html: '<div style="width:18px;height:18px;border-radius:50%;background:#ef4444;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.6)"></div>',
            iconSize: [18, 18], iconAnchor: [9, 9]
          })
        }).bindPopup('<b>Destino: ' + escHtml(d.nombre) + '</b>').addTo(capaPlan);
      }
    }

    // ==========================================================
    // VIAJE: GPS -> ESTACION DE INICIO -> ESTACION DE DESTINO
    // ==========================================================
    /** Al moverse el GPS se recalcula la caminata hasta la estacion elegida */
    function alCambiarUbicacion() {
      if (viajeOrigen && userPos) { actualizarRutaPeatonal(); }
    }

    /** Quita todas las capas del viaje */
    function limpiarViaje() {
      if (!map) { return; }
      if (rutaPeatonal)    { map.removeLayer(rutaPeatonal); rutaPeatonal = null; }
      if (capaItinerario)  { map.removeLayer(capaItinerario); capaItinerario = null; }
      if (lineaRutaTM)     { map.removeLayer(lineaRutaTM); lineaRutaTM = null; }
      if (capaParadasTM)   { map.removeLayer(capaParadasTM); capaParadasTM = null; }
      if (capaPlan)        { map.removeLayer(capaPlan); capaPlan = null; }
      if (lineaRuta)       { map.removeLayer(lineaRuta); lineaRuta = null; }
      if (circuloCerca)    { map.removeLayer(circuloCerca); circuloCerca = null; }
    }

    /** Sale del modo viaje (por ejemplo, al buscar otra estacion) */
    function salirModoViaje() {
      viajeOrigen = null;
      viajeDestino = null;
      modoViaje = false;
      limpiarViaje();
      var it = document.getElementById('userItinerario');
      if (it) { it.classList.add('hidden'); it.innerHTML = ''; }
      var c = document.getElementById('userMensajeRuta');
      if (c) { c.classList.add('hidden'); c.textContent = ''; }
    }

    /** Ruta a pie por las calles (perfil peatonal OSRM), con respaldo */
    function dibujarRutaPeatonal(lat1, lng1, lat2, lng2) {
      if (!map) { return Promise.resolve(null); }
      var servicios = [
        'https://routing.openstreetmap.de/routed-foot/route/v1/driving/',
        'https://router.project-osrm.org/route/v1/foot/'
      ];
      function pedir(i) {
        if (i >= servicios.length) { return Promise.resolve(null); }
        return fetch(servicios[i] + lng1 + ',' + lat1 + ';' + lng2 + ',' + lat2 +
                     '?overview=full&geometries=geojson')
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (!data || !data.routes || !data.routes.length) { return pedir(i + 1); }
            var r = data.routes[0];
            var coords = (r.geometry.coordinates || []).map(function (c) { return [c[1], c[0]]; });
            if (rutaPeatonal) { map.removeLayer(rutaPeatonal); rutaPeatonal = null; }
            rutaPeatonal = L.polyline(coords, {
              color: '#22c55e', weight: 4, opacity: 0.9, dashArray: '8, 6'
            }).addTo(map);
            return { coords: coords, distancia: r.distance, duracion: r.duration };
          })
          .catch(function () { return pedir(i + 1); });
      }
      return pedir(0);
    }

    function actualizarRutaPeatonal() {
      if (viajeOrigen && userPos) {
        return dibujarRutaPeatonal(userPos.lat, userPos.lng, viajeOrigen.lat, viajeOrigen.lng);
      }
      return Promise.resolve(null);
    }

    /** Pone un marcador verde (inicio) o rojo (destino) */
    function marcarPunto(e, color, etiqueta, letra) {
      if (!map || !e) { return; }
      if (!capaItinerario) { capaItinerario = L.featureGroup().addTo(map); }
      var la = e.lat != null ? e.lat : e.latitud;
      var lo = e.lng != null ? e.lng : e.longitud;
      if (la == null || lo == null) { return; }
      L.marker([la, lo], {
        icon: L.divIcon({
          className: '',
          html: '<div style="width:22px;height:22px;border-radius:50%;background:' + color +
                ';border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.6);color:#fff;' +
                'font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center">' +
                (letra || '') + '</div>',
          iconSize: [18, 18], iconAnchor: [9, 9]
        })
      }).bindPopup('<b>' + escHtml(etiqueta) + '</b>')
        .bindTooltip(escHtml(etiqueta), { permanent: true, direction: 'top', offset: [0, -14], className: 'tooltip-viaje' })
        .addTo(capaItinerario);
    }

    /** El usuario elige la estacion de PARTIDA en la lista de cercanas */
    function elegirInicio(id) {
      var est = estaciones.find(function (e) { return e.id === id; });
      if (!est) { return; }
      salirModoViaje();
      viajeOrigen = est;
      window.__origenAuto = false;
      modoViaje = true;
      if (typeof actualizarNotifBadge === 'function') { actualizarNotifBadge({ estacion: est.nombre }); }

      var tit = document.getElementById('tituloPanel');
      if (tit) {
        tit.innerHTML = '<span class="text-emerald-400">INICIO: ' + escHtml(est.nombre) +
                        '</span> <span class="text-slate-500">→ elige tu destino</span>';
      }
      var cont = document.getElementById('userMensajeRuta');
      if (cont) {
        cont.textContent = 'Inicio: ' + est.nombre + '. Elige ahora tu estación de destino en la lista.';
        cont.classList.remove('hidden');
      }
      if (userPos) { actualizarRutaPeatonal(); }
      else { ponerEstadoGPS('Marca tu ubicación en el mapa para trazar la caminata.', 'amber'); }

      marcarPunto(est, '#22c55e', 'Inicio: ' + est.nombre, 'A');
      document.getElementById('listaResultado').innerHTML = listaCercanasHtml();
      cargarRutasDeEstacion(est);
      var panel = document.getElementById('panelRutasLateral');
      if (panel) { panel.classList.remove('hidden'); }
    }

    /** El usuario elige la estacion de LLEGADA: se calculan rutas y transbordos */
    function elegirDestino(id) {
      var est = estaciones.find(function (e) { return e.id === id; });
      if (!est) { return; }

      if (!viajeOrigen) {
        var cerca = (userPos || gpsActivo) ? estacionMasCercana() : null;
        if (cerca && cerca.id !== est.id) {
          viajeOrigen = cerca;
          window.__origenAuto = true;
        } else {
          var aviso = document.getElementById('userMensajeRuta');
          if (aviso) { aviso.textContent = 'Primero elige una estación de inicio (botón Inicio).'; aviso.classList.remove('hidden'); }
          return;
        }
      }
      if (viajeOrigen.id === est.id) {
        var aviso2 = document.getElementById('userMensajeRuta');
        if (aviso2) { aviso2.textContent = 'El destino es la misma estación de inicio.'; aviso2.classList.remove('hidden'); }
        return;
      }

      viajeDestino = est;
      modoViaje = true;
      if (typeof actualizarNotifBadge === 'function') { actualizarNotifBadge({ estacion: est.nombre }); }

      var tit2 = document.getElementById('tituloPanel');
      if (tit2) {
        tit2.innerHTML = '<span class="text-emerald-400">INICIO' +
                         (window.__origenAuto ? ' (GPS)' : '') + ': ' + escHtml(viajeOrigen.nombre) +
                         '</span> <span class="text-white">→</span> ' +
                         '<span class="text-red-400">DESTINO: ' + escHtml(est.nombre) + '</span>';
      }

      var cont = document.getElementById('userMensajeRuta');
      if (cont) { cont.textContent = 'Calculando tu itinerario...'; cont.classList.remove('hidden'); }

      var url = API_URL + '/rutas/itinerario?origen=' + encodeURIComponent(viajeOrigen.nombre) +
                '&destino=' + encodeURIComponent(est.nombre) +
                '&origen_id=' + encodeURIComponent(viajeOrigen.id) +
                '&destino_id=' + encodeURIComponent(est.id);

      fetch(url)
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok) { throw new Error(res.d.error || 'No se pudo calcular el itinerario'); }
          var datos = res.d;
          window.__itinerarioCache = datos;
          window.__opcionActiva = 0;
          dibujarItinerario(datos);
          renderItinerario(datos);
          renderRutasLateral();
          if (cont) {
            var nb = datos.transbordos || 0;
            cont.textContent = (window.__origenAuto ? 'Inicio automático (más cercana a tu GPS): ' : '') +
              viajeOrigen.nombre + ' → ' + est.nombre +
              (nb === 0 ? ' · sin transbordos'
                : ' · ' + nb + (nb === 1 ? ' transbordo' : ' transbordos')) +
              (window.__origenAuto ? '. Cambia el origen con «Inicio».' : '');
            cont.classList.remove('hidden');
          }
        })
        .catch(function (err) {
          if (cont) { cont.textContent = 'No se pudo calcular el itinerario: ' + err.message; cont.classList.remove('hidden'); }
        });
    }

    /** Dibuja todos los tramos del viaje (caminata + lineas + marcadores) */
    function dibujarItinerario(datos) {
      limpiarViaje();
      capaItinerario = L.featureGroup().addTo(map);

      (datos.tramos || []).forEach(function (tramo) {
        var ests = tramo.estaciones || [];
        if (!ests.length) { return; }
        var coords = recortarCorredor(tramo, ests[0], ests[ests.length - 1])
          .filter(function (c) { return c && c[0] != null && c[1] != null; });
        if (coords.length >= 2) {
          L.polyline(coords, { color: tramo.color || '#8b5cf6', weight: 5, opacity: 0.9 }).addTo(capaItinerario);
        }
        ests.forEach(function (p) {
          if (p.lat == null || p.lng == null) { return; }
          L.circleMarker([p.lat, p.lng], {
            radius: 3, color: '#ffffff', weight: 1,
            fillColor: tramo.color || '#8b5cf6', fillOpacity: 1
          }).bindPopup(escHtml(p.nombre)).addTo(capaItinerario);
        });
      });

      marcarPunto(datos.origen, '#22c55e', 'Inicio: ' + (datos.origen ? datos.origen.nombre : ''), 'A');
      marcarPunto(datos.destino, '#ef4444', 'Destino: ' + (datos.destino ? datos.destino.nombre : ''), 'B');

      if (userPos && viajeOrigen) { actualizarRutaPeatonal(); }
      if (capaItinerario.getLayers().length) {
        map.fitBounds(capaItinerario.getBounds(), { padding: [40, 40] });
      }
    }

    /** Panel lateral: pasos del viaje y transbordos */
    function renderItinerario(datos) {
      var panel = document.getElementById('userItinerario');
      if (!panel) { return; }
      var html = '<div class="p-3 bg-brand-dark/70 rounded-xl border border-brand-border mb-3">' +
        '<p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Tu viaje</p>' +
        '<p class="text-xs font-black"><span class="text-emerald-400">A · ' +
          escHtml(viajeOrigen ? viajeOrigen.nombre : (datos.origen ? datos.origen.nombre : '')) +
        '</span> <span class="text-white">→</span> <span class="text-red-400">' +
          escHtml(datos.destino ? datos.destino.nombre : '') + ' · B</span></p>' +
        '<p class="text-[11px] text-slate-400 mt-1">' +
          (datos.transbordos ? datos.transbordos + (datos.transbordos === 1 ? ' transbordo' : ' transbordos') : 'Sin transbordos') +
          ' · ' + datos.total_paradas + ' estaciones · ~' + (datos.minutos_estimados || 0) + ' min</p>' +
      '</div>';

      if (userPos && viajeOrigen) {
        var metros = Math.round(distanciaKM(userPos.lat, userPos.lng, viajeOrigen.lat, viajeOrigen.lng) * 1000);
        html += '<div class="p-3 bg-brand-dark/70 rounded-xl border border-brand-border mb-2">' +
          '<p class="text-white font-bold text-xs">1. Camina hasta ' + escHtml(viajeOrigen.nombre) + '</p>' +
          '<p class="text-[11px] text-slate-400 mt-1">' + metros + ' m · ruta peatonal por calles</p>' +
          '</div>';
      }

      (datos.tramos || []).forEach(function (t, i) {
        var numero = (userPos && viajeOrigen ? i + 2 : i + 1);
        var ultimo = i === (datos.tramos.length - 1);
        html += '<div class="p-3 bg-brand-dark/70 rounded-xl border border-brand-border mb-2" style="border-left:3px solid ' + t.color + '">' +
          '<p class="text-white font-bold text-xs">' + numero + '. Línea ' + escHtml(t.codigo) + '</p>' +
          '<p class="text-[11px] text-slate-400 mt-1">' + escHtml(t.desde) + ' → ' + escHtml(t.hasta) + '</p>' +
          '<p class="text-[11px] text-slate-400 mt-0.5">' + t.numero_paradas + ' estaciones · ~' +
            (t.minutos_estimados || 0) + ' min' +
            (t.tipo_transbordo ? ' · transbordo en ' + escHtml(t.transbordo_en || t.hasta) : '') + '</p>' +
          (ultimo
            ? '<p class="text-[10px] font-black text-emerald-400 mt-1">Llegada a ' + escHtml(datos.destino ? datos.destino.nombre : '') + '</p>'
            : '<p class="text-[10px] font-black text-amber-400 mt-1">TRANSBORDO en ' + escHtml(t.hasta) + '</p>') +
          '</div>';
      });

      panel.innerHTML = html;
      panel.classList.remove('hidden');
    }

    // ==========================================================
    // VENTANA LATERAL DE RUTAS
    // ==========================================================
    /** Muestra u oculta la ventana de rutas sobre el mapa */
    function togglePanelRutas() {
      var panel = document.getElementById('panelRutasLateral');
      if (!panel) { return; }
      var vaMostrar = panel.classList.contains('hidden');
      panel.classList.toggle('hidden', !vaMostrar);
      if (vaMostrar) { renderRutasLateral(); }
    }

    /** Trae las rutas que pasan por la estacion de inicio */
    function cargarRutasDeEstacion(est) {
      window.__rutasEstacionOrigen = [];
      var nombre = document.getElementById('rutasLateralEstacion');
      if (nombre) { nombre.textContent = est.nombre; }
      renderRutasLateral();

      fetch(API_URL + '/rutas/estacion/' + encodeURIComponent(est.nombre) + '?id=' + encodeURIComponent(est.id))
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok) { throw new Error(res.d.error || 'No se pudieron cargar'); }
          window.__rutasEstacionOrigen = res.d.rutas || [];
          renderRutasLateral();
        })
        .catch(function () {
          window.__rutasEstacionOrigen = [];
          renderRutasLateral();
        });
    }

    /** Dibuja una ruta completa de la estacion de inicio */
    function verRutaLateral(id) {
      var rutas = window.__rutasEstacionOrigen || [];
      var ruta = rutas.find(function (r) { return r.id === id; });
      if (!ruta) { return; }
      dibujarCorredorTransmilenio(ruta);
    }

    /** Dibuja una opcion concreta del itinerario (recomendada o alternativa) */
    function dibujarOpcionLateral(indice) {
      var datos = window.__itinerarioCache;
      if (!datos || !datos.opciones) { return; }
      var op = datos.opciones[indice];
      if (!op) { return; }

      window.__opcionActiva = indice;
      limpiarViaje();
      capaItinerario = L.featureGroup().addTo(map);
      (op.tramos || []).forEach(function (tramo) {
        var ests = tramo.estaciones || [];
        if (!ests.length) { return; }
        var coords = recortarCorredor(tramo, ests[0], ests[ests.length - 1])
          .filter(function (c) { return c && c[0] != null && c[1] != null; });
        if (coords.length >= 2) {
          L.polyline(coords, { color: tramo.color || '#8b5cf6', weight: 5, opacity: 0.9 }).addTo(capaItinerario);
        }
      });
      marcarPunto(datos.origen, '#22c55e', 'Inicio: ' + (datos.origen ? datos.origen.nombre : ''), 'A');
      marcarPunto(datos.destino, '#ef4444', 'Destino: ' + (datos.destino ? datos.destino.nombre : ''), 'B');
      if (userPos && viajeOrigen) { actualizarRutaPeatonal(); }
      if (capaItinerario.getLayers().length) {
        map.fitBounds(capaItinerario.getBounds(), { padding: [40, 40] });
      }
      renderRutasLateral();
    }

    /** Pinta el contenido de la ventana lateral */
    function renderRutasLateral() {
      var cont = document.getElementById('rutasLateralContenido');
      if (!cont) { return; }

      var rutas = window.__rutasEstacionOrigen || [];
      var datos = window.__itinerarioCache;
      var html = '';

      if (!viajeOrigen) {
        cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">Elige una estación de inicio para ver sus rutas.</p>';
        return;
      }

      // Opciones de viaje (rutas que pueden llevar al destino)
      if (datos && datos.opciones && datos.opciones.length) {
        html += '<p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Opciones hacia el destino</p>';
        datos.opciones.forEach(function (op, i) {
          var activa = (window.__opcionActiva || 0) === i;
          html += '<div class="p-2.5 rounded-xl border ' + (activa ? 'border-brand-red' : 'border-brand-border') + ' bg-brand-dark/70 mb-2">' +
            '<div class="flex items-center justify-between gap-2">' +
              '<p class="text-[11px] font-black ' + (activa ? 'text-brand-red' : 'text-white') + '">' + escHtml(op.etiqueta) + '</p>' +
              '<span class="text-[10px] font-black text-emerald-400">' + op.minutos_estimados + ' min</span>' +
            '</div>' +
            '<p class="text-[10px] text-slate-400 mt-1">' +
              (op.transbordos ? op.transbordos + (op.transbordos === 1 ? ' transbordo' : ' transbordos') : 'Sin transbordos') +
              ' · ' + op.total_paradas + ' estaciones</p>' +
            '<p class="text-[10px] text-slate-300 mt-1 font-bold">' + escHtml(op.lineas.join(' → ')) + '</p>';
          op.tramos.forEach(function (tr, k) {
            if (tr.tipo_transbordo) {
              html += '<p class="text-[9px] text-amber-400 mt-1">↳ Transbordo: ' + escHtml(tr.tipo_transbordo) +
                      ' en ' + escHtml(tr.transbordo_en || tr.hasta) + ' (+4 min)</p>';
            }
            html += '<p class="text-[9px] text-slate-500 mt-0.5">' + escHtml(tr.codigo) + ': ' +
                    escHtml(tr.desde) + ' → ' + escHtml(tr.hasta) + ' · ' + tr.minutos_estimados + ' min</p>';
          });
          html += '<button onclick="dibujarOpcionLateral(' + i + ')" class="mt-2 w-full px-2 py-1.5 bg-brand-dark border border-brand-border text-slate-300 text-[10px] font-bold rounded-lg hover:border-brand-red">Ver esta opción en el mapa</button>' +
            '</div>';
        });
      }

      // Rutas que pasan por la estacion de inicio
      html += '<p class="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-3 mb-1">Rutas en ' + escHtml(viajeOrigen.nombre) + ' (' + rutas.length + ')</p>';
      if (!rutas.length) {
        html += '<p class="text-[11px] text-slate-500 text-center py-3">Cargando rutas de la estación...</p>';
      }
      var usadas = datos && datos.opciones && datos.opciones[0] ? datos.opciones[0].lineas : [];
      rutas.forEach(function (r) {
        var ests = r.estaciones || [];
        var sirve = usadas.indexOf(r.codigo) !== -1;
        html += '<div class="p-2 rounded-lg bg-brand-dark/70 border border-brand-border mb-1.5">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<p class="text-[11px] font-black text-white">' + escHtml(r.codigo) +
              (sirve ? ' <span class="text-[9px] text-emerald-400">TE SIRVE</span>' : '') + '</p>' +
            '<span class="text-[9px] text-slate-400">' + ests.length + ' paradas</span>' +
          '</div>' +
          '<p class="text-[9px] text-slate-400 mt-0.5 truncate">' + escHtml(r.origen || '') + ' → ' + escHtml(r.destino || '') + '</p>' +
          '<button onclick="verRutaLateral(' + r.id + ')" class="mt-1 text-[9px] font-bold text-brand-red hover:underline">Ver ruta completa</button>' +
        '</div>';
      });

      cont.innerHTML = html;
    }

    function listaCercanasHtml() {
      if (!estaciones.length) { return ''; }
      var centro = userPos ? [userPos.lat, userPos.lng] : [4.6097, -74.0817];
      var lista = estaciones.map(function (e) {
        return Object.assign({}, e, { dist: distanciaKM(centro[0], centro[1], e.lat, e.lng) });
      }).sort(function (a, b) { return a.dist - b.dist; }).slice(0, CANTIDAD_CERCANAS);
      return lista.map(tarjetaCercana).join('');
    }

    /** Normaliza con espacios para comparar nombres de estaciones */
    function normNombre(s) {
      return String(s == null ? '' : s)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
    }

    /** Devuelve { exactos, candidatos } para el texto escrito */
    function resolverEstaciones(texto) {
      var n = normNombre(texto);
      if (!n) { return { exactos: [], candidatos: [] }; }
      var exactos = [];
      var prefijos = [];
      var contienen = [];

      (estaciones || []).forEach(function (e) {
        var m = normNombre(e.nombre);
        if (m === n) { exactos.push(e); return; }
        if (m.indexOf(n) === 0) { prefijos.push(e); return; }
        if (m.indexOf(n) !== -1) { contienen.push(e); }
      });

      if (exactos.length) { return { exactos: exactos, candidatos: exactos }; }
      if (prefijos.length) { return { exactos: [], candidatos: prefijos }; }
      return { exactos: [], candidatos: contienen };
    }

    /** El usuario elige una coincidencia del selector */
    function elegirSugerenciaDestino(id) {
      var est = estaciones.find(function (e) { return e.id === id; });
      var caja = document.getElementById('userSugerenciasDestino');
      if (caja) { caja.classList.add('hidden'); caja.innerHTML = ''; }
      if (!est) { return; }
      var input = document.getElementById('userInputDestino');
      if (input) { input.value = est.nombre; }
      elegirDestino(est.id);
    }

    /** El campo de destino resuelve el nombre y pide confirmacion si es ambiguo */
    function verRutaUsuario() {
      var texto = ((document.getElementById('userInputDestino') || {}).value || '').trim();
      var cont = document.getElementById('userMensajeRuta');
      var caja = document.getElementById('userSugerenciasDestino');
      if (caja) { caja.classList.add('hidden'); caja.innerHTML = ''; }

      if (!texto) {
        if (cont) { cont.textContent = 'Busca y elige una estación de destino.'; cont.classList.remove('hidden'); }
        return;
      }

      var res = resolverEstaciones(texto);
      if (!res.candidatos.length) {
        if (cont) { cont.textContent = 'No se encontró la estación: ' + texto; cont.classList.remove('hidden'); }
        return;
      }

      // Coincidencia exacta: se usa directamente
      if (res.exactos.length) {
        elegirDestino(res.exactos[0].id);
        return;
      }

      // Varias coincidencias: el usuario elige la correcta
      if (caja) {
        var html = '<p class="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-brand-border">' +
                   res.candidatos.length + ' estaciones coinciden con "' + escHtml(texto) + '"</p>';
        res.candidatos.slice(0, 20).forEach(function (e) {
          html += '<button onclick="elegirSugerenciaDestino(' + e.id + ')" class="w-full text-left px-3 py-2 text-xs text-white hover:bg-brand-red/20 border-b border-brand-border last:border-0">' +
                  escHtml(e.nombre) + ' <span class="text-slate-500">· ' + escHtml(e.troncal || '') + '</span></button>';
        });
        caja.innerHTML = html;
        caja.classList.remove('hidden');
      }
      if (cont) {
        cont.textContent = 'Hay varias estaciones con ese nombre. Elige una de la lista.';
        cont.classList.remove('hidden');
      }
    }

    /** Usuario: dibuja en el mapa la ruta de Transmilenio elegida */
    function verRutaUsuarioEnEstacion(rutaId) {
      if (!map) { return; }
      var rutas = window.__rutasUsuarioCache || [];
      var ruta = null;
      for (var i = 0; i < rutas.length; i++) { if (rutas[i].id === rutaId) { ruta = rutas[i]; break; } }
      if (!ruta) { return; }

      var ok = dibujarCorredorTransmilenio(ruta);
      if (!ok) {
        var cont = document.getElementById('userMensajeRuta');
        if (cont) { cont.textContent = 'Esta ruta no tiene geometria disponible en el mapa.'; cont.classList.remove('hidden'); }
      }
    }

    /** Muestra u oculta las paradas de una ruta */
    function toggleParadasRuta(rutaId) {
      var caja = document.getElementById('paradas-' + rutaId);
      if (!caja) { return; }
      if (!caja.classList.contains('hidden')) { caja.classList.add('hidden'); return; }

      var rutas = window.__rutasUsuarioCache || [];
      for (var i = 0; i < rutas.length; i++) {
        if (rutas[i].id !== rutaId) { continue; }
        var ests = rutas[i].estaciones || [];
        if (!ests.length) {
          caja.innerHTML = '<p class="text-slate-500">Sin paradas registradas.</p>';
          break;
        }
        caja.innerHTML = ests.map(function (e, k) {
          return '<p class="flex gap-2"><span class="text-brand-red font-black">' + (k + 1) + '.</span>' +
                 '<span>' + escHtml(e.nombre) + '</span></p>';
        }).join('');
        break;
      }
      caja.classList.remove('hidden');
    }

    // ==========================================================
    // RUTAS DE LA ESTACION SELECCIONADA (VISTA USUARIO)
    // ==========================================================
    /** Renderiza la lista de rutas que sirven a una estacion seleccionada */
    function htmlRutasEstacion(rutas, nombre) {
      var arr = rutas || [];
      var html = '<div class="mt-4 pt-3 border-t border-brand-border">' +
        '<p class="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-2">' +
        'Rutas de Transmilenio que sirven a esta estacion (' + arr.length + ')</p>';
      if (!arr.length) {
        html += '<p class="text-xs text-slate-400 text-center py-4">No hay rutas registradas para esta estacion.</p>';
      }
      arr.forEach(function (r) {
        var color = r.color_hex || '#8b5cf6';
        var ests = r.estaciones || [];
        var inicio = r.origen || (ests.length ? ests[0].nombre : '-');
        var fin = r.destino || (ests.length ? ests[ests.length - 1].nombre : '-');
        html += '<div class="p-3 bg-brand-dark/70 rounded-xl border border-brand-border mb-2">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<p class="text-white font-semibold text-xs sm:text-sm">' + escHtml(r.codigo) + '</p>' +
            '<span class="text-[10px] font-black px-2 py-0.5 rounded-md shrink-0" style="background:' + color + '22;color:' + color + '">' +
              escHtml(r.nombre || r.codigo) + '</span>' +
          '</div>' +
          '<p class="text-[11px] text-slate-400 mt-1">Inicio: ' + escHtml(inicio) + ' &nbsp;|&nbsp; Fin: ' + escHtml(fin) + '</p>' +
          '<p class="text-[11px] text-slate-400 mt-0.5">Paradas: ' + ests.length + '</p>' +
          '<div class="flex gap-2 mt-2">' +
            '<button onclick="verRutaUsuarioEnEstacion(' + r.id + ')" class="flex-1 px-3 py-2 bg-brand-dark border border-brand-border text-slate-300 text-[11px] font-bold rounded-lg hover:border-brand-red">Ver ruta en el mapa</button>' +
            '<button onclick="toggleParadasRuta(' + r.id + ')" class="px-3 py-2 bg-brand-dark border border-brand-border text-slate-300 text-[11px] font-bold rounded-lg hover:border-brand-red">Paradas</button>' +
          '</div>' +
          '<div id="paradas-' + r.id + '" class="hidden mt-2 text-[11px] text-slate-400 space-y-0.5"></div>' +
        '</div>';
      });
      html += '</div>';
      return html;
    }

    // ==========================================================
    // VISTA DE BUSQUEDA: detalle de la estacion + stations cercanas a ELLA
    // ==========================================================
    function pintarDetalle() {
      var ref = seleccion;
      var centro = [ref.lat, ref.lng];

      L.marker([ref.lat, ref.lng], { icon: iconoEstacion(ref), zIndexOffset: 900 })
        .bindPopup(popupEstacion(ref))
        .bindTooltip(ref.nombre + ' · ' + (ref.troncal || ''), { permanent: true, direction: 'top', offset: [0, -12], className: 'tooltip-estacion tooltip-seleccionada' })
        .on('click', function () { if (typeof seleccionarEstacionMapa === 'function') { seleccionarEstacionMapa(ref); } })
        .addTo(capaMarcadores);

      // Ruta en linea azul desde la ubicacion del usuario hasta la estacion
      if (userPos) { dibujarRutaPeatonal(userPos.lat, userPos.lng, ref.lat, ref.lng); }

      var cercanas = estaciones
        .filter(function (e) { return e.id !== ref.id; })
        .map(function (e) {
          return Object.assign({}, e, { dist: distanciaKM(centro[0], centro[1], e.lat, e.lng) });
        })
        .sort(function (a, b) { return a.dist - b.dist; })
        .slice(0, 6);

      cercanas.forEach(function (e) {
        L.marker([e.lat, e.lng], { icon: iconoEstacion(e), title: e.nombre })
          .bindPopup(popupEstacion(e))
          .bindTooltip(e.nombre + ' · ' + (e.troncal || ''), { direction: 'top', offset: [0, -10], className: 'tooltip-estacion' })
          .on('click', function () { if (typeof seleccionarEstacionMapa === 'function') { seleccionarEstacionMapa(e); } })
          .addTo(capaMarcadores);
      });

      circuloCerca = L.circle(centro, {
        radius: 1000, color: '#ef4444', weight: 1.5, opacity: .5,
        fillColor: '#ef4444', fillOpacity: .06, dashArray: '5, 5'
      }).addTo(map);

      document.getElementById('tituloPanel').textContent = 'Estacion seleccionada';
      document.getElementById('contador').textContent = cercanas.length + ' cercanas';

      var htmlDetalle = tarjetaDetalle(ref) +
        '<p class="text-[11px] uppercase tracking-wider text-slate-400 font-bold mt-4 mb-1">' +
        'Estaciones cercanas a esta</p>' +
        cercanas.map(tarjetaFila).join('');
      document.getElementById('listaResultado').innerHTML = htmlDetalle;

      // Rutas de Transmilenio que sirven a la estacion seleccionada
      // (el servidor responde con las rutas de la BD y, si no hay, con las oficiales)
      fetch(API_URL + '/rutas/estacion/' + encodeURIComponent(ref.nombre) + '?id=' + encodeURIComponent(ref.id))
        .then(function (r) {
          return r.json().then(function (d) { return { ok: r.ok, d: d }; });
        })
        .then(function (res) {
          if (seleccion !== ref) { return; }
          if (!res.ok) { throw new Error(res.d.error || ('HTTP ' + res.ok)); }
          var rutas = res.d.rutas || [];
          window.__rutasUsuarioCache = rutas;
          document.getElementById('listaResultado').innerHTML = htmlDetalle + htmlRutasEstacion(rutas, ref.nombre);
        })
        .catch(function (err) {
          if (seleccion !== ref) { return; }
          window.__rutasUsuarioCache = [];
          document.getElementById('listaResultado').innerHTML = htmlDetalle +
            '<div class="mt-4 pt-3 border-t border-brand-border">' +
            '<p class="text-xs text-red-400 text-center py-4">No se pudieron cargar las rutas de esta estacion.<br>' +
            '<span class="text-slate-500">' + escHtml(err.message) + '</span></p></div>';
        });

      var grupo = L.latLngBounds([[centro[0], centro[1]]]);
      cercanas.forEach(function (e) { grupo.extend([e.lat, e.lng]); });
      map.fitBounds(grupo.pad(0.3), { maxZoom: 15 });
    }

    function tarjetaDetalle(e) {
      var color = COLOR_AGLOMERACION[nivelTexto(e.aglomeracion)] || '#f59e0b';
      return '' +
        '<div class="p-4 bg-brand-dark/70 rounded-xl border-2" style="border-color:' + color + '">' +
          '<div class="flex items-start justify-between gap-2">' +
            '<div>' +
              '<h4 class="text-white font-black text-sm">' + e.nombre + '</h4>' +
              '<p class="text-[11px] text-slate-400 mt-0.5">Troncal ' + e.troncal + '</p>' +
            '</div>' +
            '<span class="px-2 py-1 rounded-lg text-[10px] font-black text-white shrink-0" style="background:' + color + '">' +
              nivelTexto(e.aglomeracion).toUpperCase() +
            '</span>' +
          '</div>' +
          '<div class="flex items-center gap-2 mt-3 pt-3 border-t border-brand-border">' +
            '<i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-500"></i>' +
            '<span class="text-[11px] text-slate-400 font-mono">' + e.lat.toFixed(6) + ', ' + e.lng.toFixed(6) + '</span>' +
          '</div>' +
          (e.capacidad ? (
            '<div class="flex items-center gap-2 mt-2">' +
              '<i data-lucide="bus" class="w-3.5 h-3.5 text-slate-500"></i>' +
              '<span class="text-[11px] text-slate-400">Capacidad: <b class="text-slate-200">' +
                Number(e.capacidad).toLocaleString("es-CO") + '</b> pasajeros/hora</span>' +
            '</div>'
          ) : '') +
        '</div>';
    }

    function tarjetaFila(e) {
      var color = COLOR_AGLOMERACION[nivelTexto(e.aglomeracion)] || '#f59e0b';
      return '' +
        '<div onclick="seleccionarEstacion(' + e.id + ')" ' +
        '     class="p-3 bg-brand-dark/70 rounded-xl border border-brand-border hover:border-brand-red cursor-pointer flex items-center justify-between gap-3">' +
          '<div class="flex items-center gap-2.5 min-w-0">' +
            '<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:' + color + '"></span>' +
            '<div class="min-w-0">' +
              '<p class="text-white font-bold text-xs truncate">' + e.nombre + '</p>' +
              '<p class="text-[11px] text-slate-400 truncate">' + e.troncal + ' &bull; ' + e.dist.toFixed(2) + ' km</p>' +
            '</div>' +
          '</div>' +
          '<span class="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0" style="color:' + color + ';background:' + color + '22">' +
            nivelTexto(e.aglomeracion) +
          '</span>' +
        '</div>';
    }

    /** Tarjeta de estacion cercana con botones para elegir inicio o destino */
    function tarjetaCercana(e) {
      var color = COLOR_AGLOMERACION[nivelTexto(e.aglomeracion)] || '#f59e0b';
      var borde = viajeOrigen && viajeOrigen.id === e.id ? 'border-emerald-500'
        : (viajeDestino && viajeDestino.id === e.id ? 'border-red-500' : 'border-brand-border');
      return '<div class="p-3 bg-brand-dark/70 rounded-xl border ' + borde + ' mb-2">'
        + (viajeOrigen && viajeOrigen.id === e.id
            ? '<p class="text-[10px] font-black text-emerald-400 mb-1">● PUNTO DE INICIO</p>' : '')
        + (viajeDestino && viajeDestino.id === e.id
            ? '<p class="text-[10px] font-black text-red-400 mb-1">● PUNTO DE DESTINO</p>' : '') +
        '<div class="flex items-center gap-2.5">' +
          '<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:' + color + '"></span>' +
          '<div class="min-w-0 flex-grow">' +
            '<p class="text-white font-bold text-xs truncate">' + escHtml(e.nombre) + '</p>' +
            '<p class="text-[11px] text-slate-400 truncate">' + escHtml(e.troncal || '') + ' &bull; ' + e.dist.toFixed(2) + ' km</p>' +
          '</div>' +
        '</div>' +
        '<div class="flex gap-2 mt-2">' +
          '<button onclick="elegirInicio(' + e.id + ')" class="flex-1 px-2 py-1.5 bg-emerald-600/20 border border-emerald-600/40 text-emerald-300 text-[10px] font-bold rounded-lg hover:bg-emerald-600/40">Inicio</button>' +
          '<button onclick="elegirDestino(' + e.id + ')" class="flex-1 px-2 py-1.5 bg-red-600/20 border border-red-600/40 text-red-300 text-[10px] font-bold rounded-lg hover:bg-red-600/40">Destino</button>' +
        '</div>' +
      '</div>';
    }

    function popupEstacion(e) {
      var color = COLOR_AGLOMERACION[nivelTexto(e.aglomeracion)] || '#f59e0b';
      return '<div style="min-width:150px">' +
        '<strong style="font-size:13px">' + e.nombre + '</strong><br>' +
        '<span style="font-size:11px;color:#666">Troncal ' + e.troncal + '</span><br>' +
        '<span style="display:inline-block;margin-top:4px;padding:2px 8px;border-radius:6px;font-size:10px;' +
        'font-weight:800;color:' + color + ';background:' + color + '22">' +
          nivelTexto(e.aglomeracion).toUpperCase() +
        '</span>' +
        (e.dist !== undefined ? '<br><span style="font-size:11px;color:#666">' + e.dist.toFixed(2) + ' km</span>' : '') +
      '</div>';
    }

    function actualizarIconos() {
      if (window.lucide) lucide.createIcons();
    }

    // ==========================================================
    // BOTON DENTRO DEL MAPA: ir a la estacion mas cercana
    // ==========================================================
    function agregarBotonMapa() {
      var cont = document.getElementById('mapa');
      if (!cont) return;
      if (document.getElementById('btnMapaCerca')) return;
      var btn = document.createElement('button');
      btn.id = 'btnMapaCerca';
      btn.type = 'button';
      btn.innerHTML = '🎯 Mi estación más cercana';
      btn.title = 'Ir a la estación más cercana a tu ubicación';
      btn.style.position = 'absolute';
      btn.style.bottom = '20px';
      btn.style.right = '20px';
      btn.style.zIndex = '1000';
      btn.style.display = 'block';
      btn.style.background = '#dc2626';
      btn.style.color = '#fff';
      btn.style.border = 'none';
      btn.style.borderRadius = '8px';
      btn.style.padding = '8px 10px';
      btn.style.fontSize = '12px';
      btn.style.fontWeight = 'bold';
      btn.style.cursor = 'pointer';
      btn.onclick = function (e) { if (e) { e.preventDefault(); e.stopPropagation(); } irANearesta(); };
      cont.appendChild(btn);
      cont.style.position = 'relative';
    }

    /** Muestra las 3 estaciones mas cercanas al usuario con su distancia y nivel */
    /** El boton "Mi estacion mas cercana" SOLO muestra el GPS, sin cambiar inicio/destino */
    function irANearesta() {
      if (!map) { return; }

      if (!userPos) {
        // Aun no hay posicion: pedirla. Al llegar se centrara el mapa
        iniciarGPS();
        return;
      }

      // No se modifican tituloPanel, listaResultado ni el itinerario del viaje
      if (marcadorUsuario) { map.removeLayer(marcadorUsuario); marcadorUsuario = null; }
      marcadorUsuario = L.marker([userPos.lat, userPos.lng], {
        icon: iconoUsuario(), zIndexOffset: 1000
      }).addTo(map);
      marcadorUsuario.bindPopup('<b>Tu ubicación actual</b>').openPopup();
      map.setView([userPos.lat, userPos.lng], 15);
      ponerEstadoGPS('Ubicación mostrada en el mapa', 'emerald');
    }
