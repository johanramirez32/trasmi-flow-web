    function buscarEstaciones() {
      var q = document.getElementById('inputBuscar').value.trim().toLowerCase();
      var caja = document.getElementById('resultadosBusqueda');

      if (q.length < 2) { caja.classList.add('hidden'); caja.innerHTML = ''; return; }

      var res = estaciones.filter(function (e) {
        return e.nombre.toLowerCase().indexOf(q) !== -1 ||
               e.troncal.toLowerCase().indexOf(q) !== -1;
      }).slice(0, 20);

      if (res.length === 0) {
        caja.innerHTML = '<p class="p-3 text-xs text-slate-400 text-center">Sin resultados para "' + q + '"</p>';
      } else {
        caja.innerHTML = res.map(function (e) {
          var color = COLOR_AGLOMERACION[nivelTexto(e.aglomeracion)] || '#f59e0b';
          return '<div onclick="seleccionarEstacion(' + e.id + ')" ' +
            'class="p-2.5 hover:bg-slate-800/60 cursor-pointer flex items-center justify-between gap-2 border-b border-brand-border last:border-0">' +
              '<div class="min-w-0">' +
                '<p class="text-white font-bold text-xs truncate">' + e.nombre + '</p>' +
                '<p class="text-[11px] text-slate-400">Troncal ' + e.troncal + '</p>' +
              '</div>' +
              '<span class="text-[10px] font-bold px-2 py-0.5 rounded shrink-0" style="color:' + color + ';background:' + color + '22">' +
                nivelTexto(e.aglomeracion) +
              '</span>' +
            '</div>';
        }).join('');
      }
      caja.classList.remove('hidden');
    }

    function seleccionarEstacion(id) {
      var e = estaciones.find(function (x) { return x.id === id; });
      if (!e) return;
      if (typeof salirModoViaje === 'function') { salirModoViaje(); }
      seleccion = e;
      document.getElementById('resultadosBusqueda').classList.add('hidden');
      document.getElementById('inputBuscar').value = e.nombre;
      pintar();
    }

    function volverACerca() {
      seleccion = null;
      document.getElementById('inputBuscar').value = '';
      pintar();
    }

    // ==========================================================
    // GPS EN TIEMPO REAL
    // ==========================================================
    /** Pinta el estado de la ubicacion en la barra superior */
    function ponerEstadoGPS(texto, color) {
      var txt = document.getElementById('txtEstado');
      var dot = document.getElementById('dotEstado');
      if (txt) { txt.textContent = texto; }
      if (dot) { dot.className = 'w-2.5 h-2.5 rounded-full shrink-0 bg-' + (color || 'amber') + '-500'; }
    }

    function iniciarGPS() {
      if (!navigator.geolocation) {
        ponerEstadoGPS('Este navegador no tiene GPS. Marca tu ubicación en el mapa.', 'red');
        return;
      }
      var opciones = { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 };
      ponerEstadoGPS('Obteniendo tu ubicación real...', 'amber');

      // Solucion rapida
      navigator.geolocation.getCurrentPosition(aplicarPosicion, errorGPS, opciones);

      // Seguimiento continuo en tiempo real
      if (idWatch === null) {
        idWatch = navigator.geolocation.watchPosition(aplicarPosicion, errorGPS, opciones);
      }
    }

    function aplicarPosicion(pos) {
      var nueva = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      var cambio = !userPos || distanciaKM(userPos.lat, userPos.lng, nueva.lat, nueva.lng) > 0.01;
      userPos = nueva;
      gpsActivo = true;

      var coords = document.getElementById('txtCoordenadas');
      if (coords) { coords.textContent = userPos.lat.toFixed(5) + ', ' + userPos.lng.toFixed(5); }
      ponerEstadoGPS('Ubicación en vivo (precisión ' + Math.round(pos.coords.accuracy) + ' m)', 'emerald');

      if (typeof alCambiarUbicacion === 'function') { alCambiarUbicacion(); }
      if (cambio) { pintar(); }
    }

    function errorGPS(err) {
      var msg = err && err.code === 1
        ? 'Permiso de ubicación denegado. Marca tu punto en el mapa.'
        : 'No se pudo obtener tu ubicación. Marca tu punto en el mapa.';
      ponerEstadoGPS(msg, 'red');
    }

    /** El siguiente clic sobre el mapa fija la ubicacion del usuario */
    function activarModoUbicacion() {
      modoUbicacionManual = true;
      ponerEstadoGPS('Haz clic en el mapa para marcar dónde estás.', 'amber');
      if (map) {
        map.getContainer().style.cursor = 'crosshair';
      }
    }

    function seguirMiUbicacion() {
      seleccion = null;
      document.getElementById('inputBuscar').value = '';
      if (typeof salirModoViaje === 'function') { salirModoViaje(); }
      if (userPos && map) {
        map.setView([userPos.lat, userPos.lng], 15);
      } else {
        iniciarGPS();
      }
      pintar();
    }

    function seguirMiUbicacion() {
      seleccion = null;
      document.getElementById('inputBuscar').value = '';
      if (userPos && map) {
        map.setView([userPos.lat, userPos.lng], 14);
      } else {
        iniciarGPS();
      }
      pintar();
    }
