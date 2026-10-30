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
          pintar();
        })
        .catch(function (err) {
          document.getElementById('listaResultado').innerHTML =
            '<p class="text-xs text-red-400 text-center py-6">No se pudieron cargar las estaciones.<br>' +
            '<span class="text-slate-500">Revisa que el servidor este corriendo (npm start)</span></p>';
          console.error('Error cargando estaciones:', err);
        });
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

    // Vista de busqueda: detalle de la estacion + stations cercanas a ELLA
    function pintarDetalle() {
      var ref = seleccion;
      var centro = [ref.lat, ref.lng];

      L.marker([ref.lat, ref.lng], { icon: iconoEstacion(ref), zIndexOffset: 900 })
        .bindPopup(popupEstacion(ref))
        .addTo(capaMarcadores);

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
          .addTo(capaMarcadores);
      });

      circuloCerca = L.circle(centro, {
        radius: 1000, color: '#ef4444', weight: 1.5, opacity: .5,
        fillColor: '#ef4444', fillOpacity: .06, dashArray: '5, 5'
      }).addTo(map);

      document.getElementById('tituloPanel').textContent = 'Estacion seleccionada';
      document.getElementById('contador').textContent = cercanas.length + ' cercanas';

      document.getElementById('listaResultado').innerHTML =
        tarjetaDetalle(ref) +
        '<p class="text-[11px] uppercase tracking-wider text-slate-400 font-bold mt-4 mb-1">' +
        'Estaciones cercanas a esta</p>' +
        cercanas.map(tarjetaFila).join('');

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

    /** Va a la estacion mas cercana al usuario y la muestra como seleccionada */
    function irANearesta() {
      if (!estaciones || !estaciones.length) return;
      var centro = userPos || [4.6097, -74.0817];
      var ref = estaciones
        .map(function (e) { return Object.assign({}, e, { dist: distanciaKM(centro[0], centro[1], e.lat, e.lng) }); })
        .sort(function (a, b) { return a.dist - b.dist; })[0];
      if (!ref) return;
      seleccion = ref;
      pintar();
    }
