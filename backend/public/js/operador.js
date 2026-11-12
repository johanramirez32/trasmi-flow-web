    // ==========================================================
    // OPERADOR (PANEL ADMINISTRATIVO) - apartado de Operario
    // ==========================================================
    function idPanelOperador(vista) {
      return 'opPanel' + vista.charAt(0).toUpperCase() + vista.slice(1);
    }

    function idBotonOperador(vista) {
      return 'opBtn' + vista.charAt(0).toUpperCase() + vista.slice(1);
    }

    function cambiarVistaOperador(vista) {
      vista = vista || 'reportes';
      ['reportes', 'aglom', 'despacho', 'rutas', 'camaras'].forEach(function (v) {
        var p = document.getElementById(idPanelOperador(v));
        if (p) p.classList.toggle('hidden', v !== vista);

        var b = document.getElementById(idBotonOperador(v));
        if (b) {
          b.className = 'px-4 py-2 text-xs font-bold rounded-xl ' + (v === vista
            ? 'text-white bg-brand-red'
            : 'text-slate-400 hover:text-white bg-brand-card border border-brand-border');
        }
      });

      if (vista === 'reportes') { cargarOperadorReportes(); }
      if (vista === 'aglom')   { cargarOperadorAglomeraciones(); }
      if (vista === 'rutas') {
        var selRutas = document.getElementById('opSelectRutas');
        if (selRutas) { cargarOperadorRutas(selRutas.value); }
        cargarOperadorEstacionesPanel();
        cargarOperadorBuses();
      }
      if (vista === 'camaras') {
        var selCamaras = document.getElementById('opSelectCamaras');
        if (selCamaras) { cargarOperadorCamaras(selCamaras.value); }
      }
      if (vista === 'despacho') { cargarOperadorSelects(); }
    }

    function cargarOperadorSelects() {
      return fetch(API_URL + '/estaciones')
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (lista) {
          ['opSelectEstacion', 'opSelectRutas', 'opSelectCamaras'].forEach(function (id) {
            var select = document.getElementById(id);
            if (!select) return;
            var valorPrevio = select.value;
            select.innerHTML = '<option value="">Selecciona estacion</option>';
            (lista || []).forEach(function (e) {
              var opt = document.createElement('option');
              opt.value = e.nombre;
              opt.textContent = e.nombre + (e.troncal ? ' (' + e.troncal + ')' : '');
              select.appendChild(opt);
            });
            var existe = false;
            for (var i = 0; i < select.options.length; i++) {
              if (select.options[i].value === valorPrevio) { existe = true; break; }
            }
            if (!existe) { select.value = ''; }
          });
        })
        .catch(function () { /* se mantiene el estado actual del select */ });
    }

    function cargarOperadorReportes() {
      var cont = document.getElementById('opListaReportes');
      if (!cont) { return Promise.resolve(); }

      return fetch(API_URL + '/reportes?limite=50')
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (lista) {
          if (!lista || !lista.length) {
            cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">Sin reportes activos por ahora.</p>';
            return;
          }

          var grupos = {};
          lista.forEach(function (r) {
            if (!grupos[r.estacion]) { grupos[r.estacion] = []; }
            grupos[r.estacion].push(r);
          });

          var html = Object.keys(grupos).map(function (estacion) {
            var rs = grupos[estacion];
            var ultima = rs[rs.length - 1];
            var color = COLOR_NIVEL[ultima.nivel] || '#94a3b8';
            var conteo = { Baja: 0, Media: 0, Alta: 0 };
            rs.forEach(function (r) { conteo[r.nivel] = (conteo[r.nivel] || 0) + 1; });

            return '<div class="p-3 bg-brand-card border border-brand-border rounded-xl">' +
              '<div class="flex items-center justify-between gap-2">' +
                '<p class="text-white font-semibold text-xs sm:text-sm">' + escHtml(estacion) + '</p>' +
                '<span class="text-[10px] font-black px-2 py-0.5 rounded-md" style="background:' + color + '22;color:' + color + '">' + escHtml(ultima.nivel) + '</span>' +
              '</div>' +
              '<p class="text-[11px] text-slate-400 mt-1">' +
                (conteo.Alta || 0) + ' Alta &middot; ' + (conteo.Media || 0) + ' Media &middot; ' + (conteo.Baja || 0) + ' Baja &middot; ' + rs.length + ' reportes</p>' +
            '</div>';
          }).join('');

          cont.innerHTML = html;
        })
        .catch(function (err) {
          if (cont) {
            cont.innerHTML = '<p class="text-xs text-red-400 text-center py-6">No se pudieron cargar los reportes.<br>' +
              '<span class="text-slate-500">' + escHtml(err.message) + '</span></p>';
          }
        });
    }

    function cargarOperadorAglomeraciones() {
      var cont = document.getElementById('opListaAglomeracion');
      if (!cont) { return Promise.resolve(); }

      return fetch(API_URL + '/niveles?horas=24')
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (niveles) {
          return fetch(API_URL + '/estaciones')
            .then(function (r2) { if (!r2.ok) throw new Error('HTTP ' + r2.status); return r2.json(); })
            .then(function (estaciones) {
              var html = (estaciones || []).map(function (e) {
                var color = COLOR_AGLOMERACION[e.aglomeracion] || '#94a3b8';
                return '<div class="flex items-center justify-between gap-2 p-3 bg-brand-card border border-brand-border rounded-xl">' +
                  '<div class="min-w-0">' +
                    '<p class="text-white font-semibold text-xs sm:text-sm truncate">' + escHtml(e.nombre) + '</p>' +
                    '<p class="text-[11px] text-slate-400 truncate">' + escHtml(e.troncal || '') + '</p>' +
                  '</div>' +
                  '<span class="text-[10px] font-black px-2 py-0.5 rounded-md shrink-0" style="background:' + color + '22;color:' + color + '">' + escHtml(e.aglomeracion || 'Media') + '</span>' +
                '</div>';
              }).join('');
              cont.innerHTML = html;
            })
            .catch(function (err) { cont.innerHTML = '<p class="text-xs text-red-400 text-center py-6">No se pudieron cargar los niveles.</p>'; });
        })
        .catch(function (err) { cont.innerHTML = '<p class="text-xs text-red-400 text-center py-6">No se pudieron cargar los niveles.<br>' + escHtml(err.message) + '</p>'; });
    }

    function enviarDespacho() {
      var estacion = document.getElementById('opSelectEstacion').value;
      var bus = document.getElementById('opInputBus').value.trim();
      var msg = document.getElementById('opMensajeDespacho');

      if (!estacion || !bus) {
        if (msg) { msg.textContent = 'Selecciona una estacion y escribe el numero de bus.'; msg.classList.remove('hidden'); }
        return;
      }

      var usuario = {};
      try { usuario = JSON.parse(localStorage.getItem('usuarioTransmiFlowReal') || '{}'); } catch (e) { usuario = {}; }

      fetch(API_URL + '/despacho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estacion: estacion,
          bus: bus,
          operador: usuario.email || usuario.nombre || 'operario'
        })
      })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (res) {
          if (msg) { msg.textContent = res.mensaje || 'Despacho registrado con exito'; msg.classList.remove('hidden'); }
        })
        .catch(function (err) {
          if (msg) { msg.textContent = 'No se pudo registrar el despacho: ' + err.message; msg.classList.remove('hidden'); }
        });
    }

    /** Carga el panel de estaciones del apartado Rutas (aglom + reportes) */
    function cargarOperadorEstacionesPanel() {
      var cont = document.getElementById('opListaEstacionesPanel');
      var buscar = document.getElementById('opInputBuscarEstacion');
      if (!cont) { return Promise.resolve(); }

      return fetch(API_URL + '/estaciones')
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (estaciones) {
          return Promise.all([
            fetch(API_URL + '/niveles?horas=24').then(function (r2) { if (!r2.ok) throw new Error('HTTP ' + r2.status); return r2.json(); }),
            Promise.resolve(estaciones)
          ]);
        })
        .then(function (res) {
          var niveles = res[0] || [];
          var ests = res[1] || [];

          if (buscar) {
            var previo = buscar.value;
            buscar.innerHTML = '<option value="">Buscar estacion...</option>';
            (ests || []).forEach(function (e) {
              var opt = document.createElement('option');
              opt.value = e.nombre;
              opt.textContent = e.nombre + (e.troncal ? ' (' + e.troncal + ')' : '');
              buscar.appendChild(opt);
            });
            var existe = false;
            for (var i = 0; i < buscar.options.length; i++) { if (buscar.options[i].value === previo) { existe = true; break; } }
            if (!existe) { buscar.value = ''; }
          }

          cont.innerHTML = (ests || []).map(function (e) {
            var color = COLOR_AGLOMERACION[e.aglomeracion] || '#94a3b8';
            var nivel = 'Baja';
            var reportado = false;
            (niveles || []).forEach(function (n) {
              if (n.estacion && n.estacion.toLowerCase() === (e.nombre || '').toLowerCase()) {
                nivel = n.nivel || 'Baja';
                reportado = true;
              }
            });
            var pct = pctAglomeracion(nivel);
            return '<button onclick="seleccionarEstacionOperador(' + JSON.stringify(e.nombre) + ')" class="w-full text-left p-2 rounded-lg bg-brand-card border border-brand-border hover:border-brand-red">' +
              '<div class="flex items-center justify-between gap-2">' +
                '<div class="min-w-0">' +
                  '<p class="text-white font-semibold text-xs sm:text-sm truncate">' + escHtml(e.nombre) + '</p>' +
                  '<p class="text-[11px] text-slate-400 truncate">' + escHtml(e.troncal || '') + '</p>' +
                '</div>' +
                '<span class="text-[10px] font-black px-2 py-0.5 rounded-md shrink-0" style="background:' + color + '22;color:' + color + '">' + escHtml(e.aglomeracion || 'Media') + '</span>' +
              '</div>' +
              '<div class="flex items-center justify-between gap-2 mt-1">' +
                '<span class="text-[10px] text-slate-400">Nivel reportes: ' + escHtml(nivel) + '</span>' +
                '<span class="text-[10px] text-white font-bold">' + pct + '% acom.</span>' +
              '</div>' +
            '</button>';
          }).join('');
        })
        .catch(function (err) {
          cont.innerHTML = '<p class="text-xs text-red-400 text-center py-6">No se pudieron cargar las estaciones.<br>' + escHtml(err.message) + '</p>';
        });
    }

    /** Devuelve el porcentaje representativo de aglomeracion segun el nivel */
    function pctAglomeracion(nivel) {
      var n = (nivel || 'Baja').toLowerCase();
      if (n === 'alta') { return 85; }
      if (n === 'media') { return 55; }
      return 30;
    }

    /** Carga la lista de buses disponibles para despacho */
    function cargarOperadorBuses() {
      var cont = document.getElementById('opListaBusesPanel');
      if (!cont) { return Promise.resolve(); }

      return fetch(API_URL + '/despachos')
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
          var despachos = data.despachos || [];
          var buses = [];
          (despachos || []).forEach(function (d) { if (d.bus && buses.indexOf(d.bus) === -1) { buses.push(d.bus); } });
          var defaultBuses = ['B1','B2','B3','B4','B5','B6','B7','B8','B9','B10','B11','B12'];
          buses.forEach(function (b) { if (defaultBuses.indexOf(b) === -1) { defaultBuses.push(b); } });
          buses = defaultBuses;

          cont.innerHTML = buses.map(function (b) {
            return '<div class="flex items-center justify-between gap-2 p-3 bg-brand-card border border-brand-border rounded-xl">' +
              '<div class="min-w-0">' +
                '<p class="text-white font-semibold text-xs sm:text-sm">Bus ' + escHtml(b) + '</p>' +
                '<p class="text-[11px] text-slate-400 truncate">Disponible para despacho</p>' +
              '</div>' +
              '<button onclick="enviarDespachoBus(' + JSON.stringify(b) + ')" class="px-3 py-2 bg-brand-dark border border-brand-border text-slate-300 text-[11px] font-bold rounded-lg hover:border-brand-red shrink-0">Despachar</button>' +
            '</div>';
          }).join('');
        })
        .catch(function (err) {
          cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">No se pudieron cargar los buses.</p>';
        });
    }

    /** Despacha el bus seleccionado hacia la estacion elegida */
    function enviarDespachoBus(bus) {
      var input = document.getElementById('opInputBus');
      if (input) { input.value = bus; }
      enviarDespacho();
    }

    function cargarOperadorRutas(estacion) {
      var cont = document.getElementById('opListaRutas');
      if (!cont) { return Promise.resolve(); }
      if (!estacion) {
        cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">Selecciona una estacion para ver sus rutas.</p>';
        return Promise.resolve();
      }

      var selEst = document.getElementById('opSelectEstacion');
      if (selEst && estacion) { selEst.value = estacion; }

      return fetch(API_URL + '/rutas/estacion/' + encodeURIComponent(estacion))
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
          var rutas = data.rutas || [];
          window.__rutasOperador = rutas;
          if (!rutas.length) {
            cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">No hay rutas registradas para esta estacion.</p>';
            return;
          }
          cont.innerHTML = rutas.map(function (r) {
            var color = r.color_hex || '#3b82f6';
            var ests = r.estaciones || [];
            var inicio = ests.length ? ests[0].nombre : '-';
            var fin = ests.length ? ests[ests.length - 1].nombre : '-';
            var paradas = ests.map(function (e) { return e.nombre; });
            return '<div class="p-3 bg-brand-card border border-brand-border rounded-xl">' +
              '<div class="flex items-center justify-between gap-2">' +
                '<p class="text-white font-semibold text-xs sm:text-sm">' + escHtml(r.codigo) + ' - ' + escHtml(r.nombre) + '</p>' +
                '<span class="text-[10px] font-black px-2 py-0.5 rounded-md" style="background:' + color + '22;color:' + color + '">' + escHtml(r.codigo) + '</span>' +
              '</div>' +
              '<p class="text-[11px] text-slate-400 mt-1">Inicio: ' + escHtml(inicio) + ' &nbsp;|&nbsp; Fin: ' + escHtml(fin) + '</p>' +
              '<p class="text-[11px] text-slate-400 mt-0.5">Paradas: ' + escHtml(paradas.join(', ') || '-') + '</p>' +
              '<button onclick="verRutaEnMapa(' + r.id + ')" class="mt-2 w-full px-3 py-2 bg-brand-dark border border-brand-border text-slate-300 text-[11px] font-bold rounded-lg hover:border-brand-red">Ver ruta en el mapa</button>' +
            '</div>';
          }).join('');
        })
        .catch(function (err) {
          cont.innerHTML = '<p class="text-xs text-red-400 text-center py-6">No se pudieron cargar las rutas.<br>' + escHtml(err.message) + '</p>';
        });
    }

    function cargarOperadorCamaras(estacion) {
      var cont = document.getElementById('opListaCamaras');
      if (!cont) { return Promise.resolve(); }
      if (!estacion) {
        cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">Selecciona una estacion para ver sus camaras.</p>';
        return Promise.resolve();
      }

      return fetch(API_URL + '/camaras/estacion/' + encodeURIComponent(estacion))
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
          var camaras = data.camaras || [];
          if (!camaras.length) {
            cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">No hay camaras registradas para esta estacion.</p>';
            return;
          }
          cont.innerHTML = camaras.map(function (c) {
            return '<div class="p-3 bg-brand-card border border-brand-border rounded-xl">' +
              '<p class="text-white font-semibold text-xs sm:text-sm">' + escHtml(c.nombre) + '</p>' +
              '<p class="text-[11px] text-slate-400 mt-1">Camara registrada en ' + escHtml(c.estacion) + '</p>' +
            '</div>';
          }).join('');
        })
        .catch(function (err) {
          cont.innerHTML = '<p class="text-xs text-red-400 text-center py-6">No se pudieron cargar las camaras.<br>' + escHtml(err.message) + '</p>';
        });
    }

    /** Dibuja en el mapa la ruta seleccionada (inicio -> fin con paradas) */
    function verRutaEnMapa(rutaId) {
      if (!map) { return; }
      var rutas = window.__rutasOperador || [];
      var ruta = null;
      for (var i = 0; i < rutas.length; i++) { if (rutas[i].id === rutaId) { ruta = rutas[i]; break; } }
      if (!ruta || !ruta.estaciones || !ruta.estaciones.length) { return; }

      var coords = [];
      ruta.estaciones.forEach(function (e) {
        if (e.lat != null && e.lng != null) { coords.push([e.lat, e.lng]); }
      });

      if (coords.length < 2) { return; }

      if (lineaRuta) { map.removeLayer(lineaRuta); lineaRuta = null; }
      lineaRuta = L.polyline(coords, { color: '#8b5cf6', weight: 5, opacity: 0.8 }).addTo(map);
      map.fitBounds(coords, { padding: [40, 40] });
    }
