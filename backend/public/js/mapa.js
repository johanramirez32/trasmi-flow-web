    // ==========================================================
    // MAPA
    // ==========================================================
    function initMap() {
      if (map) { map.invalidateSize(); return; }
      map = L.map('mapa', { zoomControl: false }).setView([4.6097, -74.0817], 12);
      L.control.zoom({ position: 'topright' }).addTo(map);

      // OpenStreetMap: NO requiere API key
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      capaMarcadores = L.layerGroup().addTo(map);

      // Los datos pueden haber llegado antes que el mapa: repintar
      if (estaciones.length > 0) pintar();

      // Boton dentro del mapa: ir a la estacion mas cercana al usuario
      agregarBotonMapa();
    }

    // ==========================================================
    // DATOS
    // ==========================================================
    function cargarEstaciones() {
      return fetch(API_URL + '/estaciones')
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (data) {
          estaciones = data.map(function (e) {
            return {
              id: e.id, nombre: e.nombre, troncal: e.troncal,
              lat: parseFloat(e.lat), lng: parseFloat(e.lng),
              aglomeracion: nivelTexto(e.aglomeracion),
              capacidad: e.capacidad != null ? e.capacidad : 0
            };
          });
          llenarDestinos();
          pintar();
        })
        .catch(function (err) {
          document.getElementById('listaResultado').innerHTML =
            '<p class="text-xs text-red-400 text-center py-6">No se pudieron cargar las estaciones.<br>' +
            '<span class="text-slate-500">Revisa que el servidor este corriendo (npm start)</span></p>';
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

        titulo = 'Estaciones mas cercanas';
      } else {
        centro = [4.6097, -74.0817];
        lista = estaciones
          .map(function (e) {
            return Object.assign({}, e, { dist: distanciaKM(centro[0], centro[1], e.lat, e.lng) });
          })
          .sort(function (a, b) { return a.dist - b.dist; })
          .slice(0, CANTIDAD_CERCANAS);
        titulo = 'Estaciones (activa tu GPS)';
      }

      document.getElementById('tituloPanel').textContent = titulo;
      document.getElementById('contador').textContent = lista.length;
      document.getElementById('listaResultado').innerHTML = lista.map(tarjetaFila).join('');

      lista.forEach(function (e) {
        L.marker([e.lat, e.lng], { icon: iconoEstacion(e), title: e.nombre })
          .bindPopup(popupEstacion(e))
          .on('click', function () { if (typeof seleccionarEstacionMapa === 'function') { seleccionarEstacionMapa(e); } })
          .addTo(capaMarcadores);
      });

      circuloCerca = L.circle(centro, {
        radius: 900, color: '#3b82f6', weight: 1.5, opacity: .5,
        fillColor: '#3b82f6', fillOpacity: .06, dashArray: '5, 5'
      }).addTo(map);

      var grupo = L.latLngBounds(centro);
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

    /** Usuario: traza el viaje desde la estacion mas cercana hasta su destino */
    function verRutaUsuario() {
      var cont = document.getElementById('userMensajeRuta');
      var destinoEl = document.getElementById('userInputDestino');
      var destino = destinoEl ? (destinoEl.value || '').trim() : '';

      if (!destino) {
        if (cont) { cont.textContent = 'Escribe el destino de tu ruta.'; cont.classList.remove('hidden'); }
        return;
      }

      // Inicio del viaje: la estacion mas cercana a la ubicacion del usuario
      if (!estaciones || !estaciones.length) {
        if (cont) { cont.textContent = 'Cargando estaciones, intenta de nuevo en un momento.'; cont.classList.remove('hidden'); }
        return;
      }
      var origen = estacionMasCercana();
      if (!origen) {
        if (cont) { cont.textContent = 'Activa tu ubicacion para identificar la estacion de inicio.'; cont.classList.remove('hidden'); }
        return;
      }
      if (normTexto(origen.nombre) === normTexto(destino)) {
        if (cont) { cont.textContent = 'El destino es el mismo punto de inicio: ' + origen.nombre + '.'; cont.classList.remove('hidden'); }
        return;
      }

      var url = API_URL + '/rutas/plan?origen=' + encodeURIComponent(origen.nombre) +
                '&destino=' + encodeURIComponent(destino);

      fetch(url)
        .then(function (r) {
          return r.json().then(function (d) { return { ok: r.ok, d: d }; });
        })
        .then(function (res) {
          if (!res.ok) { throw new Error(res.d.error || 'No se pudo planificar la ruta'); }

          var datos = res.d;
          var directas = datos.rutas || [];
          var otras = datos.otras || [];
          var ruta = directas.length ? directas[0] : (otras.length ? otras[0] : null);
          var destinoReal = datos.destino ? datos.destino.nombre : destino;
          var origenReal = datos.origen ? datos.origen : { nombre: origen.nombre, latitud: origen.lat, longitud: origen.lng };

          if (!ruta) {
            limpiarMapaParaViaje();
            if (cont) {
              cont.textContent = 'No se encontro una ruta de Transmilenio desde ' + origen.nombre + ' hasta ' + destinoReal + '.';
              cont.classList.remove('hidden');
            }
            return;
          }

          var ok = trazarViaje(ruta, origenReal, datos.destino);
          if (!ok) {
            if (cont) { cont.textContent = 'La ruta no se pudo trazar en el mapa.'; cont.classList.remove('hidden'); }
            return;
          }

          var mensaje = origen.nombre + ' → ' + destinoReal + ' · Linea ' + ruta.codigo;
          if (!directas.length) { mensaje += ' (sin linea directa)'; }
          if (cont) { cont.textContent = mensaje; cont.classList.remove('hidden'); }
        })
        .catch(function (err) {
          if (cont) { cont.textContent = 'No se pudo trazar la ruta: ' + err.message; cont.classList.remove('hidden'); }
        });
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
        .on('click', function () { if (typeof seleccionarEstacionMapa === 'function') { seleccionarEstacionMapa(ref); } })
        .addTo(capaMarcadores);

      // Ruta en linea azul desde la ubicacion del usuario hasta la estacion
      if (userPos) { dibujarRuta(userPos.lat, userPos.lng, ref.lat, ref.lng); }

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
      fetch(API_URL + '/rutas/estacion/' + encodeURIComponent(ref.nombre))
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

      var grupo = L.latLngBounds(centro);
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
    function irANearesta() {
      if (!estaciones || !estaciones.length) return;
      var centro = userPos ? [userPos.lat, userPos.lng] : [4.6097, -74.0817];
      var lista = estaciones
        .map(function (e) { return Object.assign({}, e, { dist: distanciaKM(centro[0], centro[1], e.lat, e.lng) }); })
        .sort(function (a, b) { return a.dist - b.dist; })
        .slice(0, 3);

      var tarjetas = [];
      for (var i = 0; i < lista.length; i++) {
        var e = lista[i];
        var color = COLOR_AGLOMERACION[nivelTexto(e.aglomeracion)] || '#f59e0b';
        var metros = Math.round(e.dist * 1000);
        tarjetas.push(
          '<div onclick="seleccionarEstacion(' + e.id + ')" class="p-3 bg-brand-dark/70 rounded-xl border border-brand-border hover:border-brand-red cursor-pointer flex items-center justify-between gap-3" style="border-color:' + color + '">' +
            '<div class="min-w-0 flex items-center gap-2.5">' +
              '<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:' + color + '"></span>' +
              '<div class="min-w-0">' +
                '<p class="text-white font-bold text-xs truncate">' + (i + 1) + '. ' + e.nombre + '</p>' +
                '<p class="text-[11px] text-slate-400 truncate">' + e.troncal + ' &bull; ' + metros + ' m</p>' +
              '</div>' +
            '</div>' +
            '<span class="text-[10px] font-bold px-2 py-1 rounded-lg shrink-0" style="color:' + color + ';background:' + color + '22">' + nivelTexto(e.aglomeracion) + '</span>' +
          '</div>'
        );
      }
      var html = tarjetas.join('');

      document.getElementById('tituloPanel').textContent = 'Tus 3 estaciones mas cercanas';
      document.getElementById('contador').textContent = lista.length;
      document.getElementById('listaResultado').innerHTML = html;

      // Ruta en linea azul desde la ubicacion del usuario hasta la estacion final
      if (userPos && map && lista.length) { dibujarRuta(userPos.lat, userPos.lng, lista[0].lat, lista[0].lng); }

      if (userPos && map) { map.setView([userPos.lat, userPos.lng], 14); }
    }
