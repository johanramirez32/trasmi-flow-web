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
    function iniciarGPS() {
      if (!navigator.geolocation) {
        document.getElementById('txtEstado').textContent = 'GPS no disponible en este navegador';
        return;
      }
      if (idWatch !== null) return;

      document.getElementById('txtEstado').textContent = 'Obteniendo ubicacion...';

      idWatch = navigator.geolocation.watchPosition(
        function (pos) {
          var nueva = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          var cambio = !userPos || distanciaKM(userPos.lat, userPos.lng, nueva.lat, nueva.lng) > 0.02;
          userPos = nueva;

          document.getElementById('txtCoordenadas').textContent =
            userPos.lat.toFixed(5) + ', ' + userPos.lng.toFixed(5);
          document.getElementById('txtEstado').textContent =
            'Ubicacion en vivo (precision ' + Math.round(pos.coords.accuracy) + ' m)';
          document.getElementById('dotEstado').className = 'w-2.5 h-2.5 rounded-full bg-emerald-500';

          if (cambio) pintar();
        },
        function (err) {
          document.getElementById('txtEstado').textContent =
            err.code === 1 ? 'Permiso de ubicacion denegado' : 'No se pudo obtener la ubicacion';
          document.getElementById('dotEstado').className = 'w-2.5 h-2.5 rounded-full bg-red-500';
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
      );
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
