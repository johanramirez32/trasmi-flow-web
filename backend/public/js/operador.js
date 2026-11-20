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
      ['reportes', 'rutas', 'camaras'].forEach(function (v) {
        var p = document.getElementById(idPanelOperador(v));
        if (p) p.classList.toggle('hidden', v !== vista);

        var b = document.getElementById(idBotonOperador(v));
        if (b) {
          b.className = 'px-4 py-2 text-xs font-bold rounded-xl ' + (v === vista
            ? 'text-white bg-brand-red'
            : 'text-slate-400 hover:text-white bg-brand-card border border-brand-border');
        }
      });

      if (vista === 'reportes') { cargarOperadorReportes(); cargarFrecuenciaBuses(); }
      if (vista === 'rutas') {
        var selRutas = document.getElementById('opSelectRutas');
        if (selRutas) { cargarOperadorRutas(selRutas.value); }
        cargarOperadorEstacionesPanel();
        cargarOperadorBuses();
        cargarRutasReportadas();
        cargarBagones();
      }
      if (vista === 'camaras') {
        var selCamaras = document.getElementById('opSelectCamaras');
        if (selCamaras) { cargarOperadorCamaras(selCamaras.value); }
      }
    }

    /** Estacion clickeada en el mapa (marcador): carga sus rutas y muestra el apartado de planificacion */
    function seleccionarEstacionMapa(e) {
      e = e || {};
      var nombre = e.nombre || '';
      window.__estacionMapaSeleccionada = nombre;

      var opSec = document.getElementById('sec-operadores');
      var esOperador = !!(opSec && !opSec.classList.contains('hidden'));

      if (esOperador) {
        var est = estacionPorValor(e.id) || estacionPorValor(nombre);
        var sel = document.getElementById('opSelectRutas');
        if (sel && est) { sel.value = est.id; }
        if (typeof cargarOperadorRutas === 'function' && est) { cargarOperadorRutas(est.id); }
        if (typeof cambiarVistaOperador === 'function') { cambiarVistaOperador('rutas'); }
        return;
      }

      // Vista ciudadana: usar el ID del marcador para no confundir
      // estaciones que tienen el mismo nombre
      if (typeof seleccionarEstacion === 'function') {
        if (e.id != null) { seleccionarEstacion(e.id); return; }
        var est = (estaciones || []).filter(function (x) { return x.nombre === nombre; })[0];
        if (est) { seleccionarEstacion(est.id); }
      }
    }

    /** Resuelve una estacion por ID o por nombre (compatibilidad) */
    function estacionPorValor(valor) {
      if (valor == null || valor === '') { return null; }
      var lista = estaciones || [];
      return lista.find(function (e) { return String(e.id) === String(valor); }) ||
             lista.find(function (e) { return e.nombre === valor; }) || null;
    }

    /** Estacion elegida en el panel operativo: carga sus rutas */
    function seleccionarEstacionOperador(valor) {
      var est = estacionPorValor(valor);
      if (!est) { return; }
      var sel = document.getElementById('opSelectRutas');
      if (sel) { sel.value = est.id; }
      var selBuscar = document.getElementById('opInputBuscarEstacion');
      if (selBuscar) { selBuscar.value = est.id; }
      if (typeof cargarOperadorRutas === 'function') { cargarOperadorRutas(est.id); }
      if (typeof cargarOperadorBuses === 'function') { cargarOperadorBuses(est.id); }
    }

    /** Busca una estacion por nombre tolerando acentos y mayusculas */
    function buscarEstacionPorNombre(lista, nombre) {
      var n = typeof normTexto === 'function' ? normTexto(nombre) : String(nombre || '').toLowerCase();
      if (!n) return null;
      var exacto = null, prefijo = null, contiene = null;
      (lista || []).forEach(function (e) {
        var m = typeof normTexto === 'function' ? normTexto(e.nombre) : String(e.nombre || '').toLowerCase();
        if (m === n) { exacto = e; return; }
        if (!prefijo && (m.indexOf(n) === 0 || n.indexOf(m) === 0)) { prefijo = e; }
        if (!contiene && (m.indexOf(n) !== -1 || n.indexOf(m) !== -1)) { contiene = e; }
      });
      return exacto || prefijo || contiene;
    }

    /** Dibuja la ruta (origen -> destino) elegida por el operativo */
    function verRutaOperador() {
      var cont = document.getElementById('opMensajeRuta');
      var origenEl = document.getElementById('opSelectRutas');
      var origenEst = estacionPorValor(origenEl ? origenEl.value : '');
      var origen = origenEst ? origenEst.nombre : '';
      var destinoEl = document.getElementById('opInputDestino');
      var destino = destinoEl ? (destinoEl.value || '').trim() : '';

      if (!origen) { if (cont) { cont.textContent = 'Selecciona una estacion de origen.'; cont.classList.remove('hidden'); } return; }
      if (!destino) { if (cont) { cont.textContent = 'Escribe o selecciona el destino de la ruta.'; cont.classList.remove('hidden'); } return; }

      fetch(API_URL + '/estaciones')
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (lista) {
          var o = buscarEstacionPorNombre(lista, origen);
          var d = buscarEstacionPorNombre(lista, destino);
          if (!o || !d) {
            if (cont) { cont.textContent = 'No se encontraron coordenadas para la estacion de origen o destino.'; cont.classList.remove('hidden'); }
            return;
          }
          if (typeof dibujarRuta === 'function') { dibujarRuta(o.lat, o.lng, d.lat, d.lng); }

          // Lineas de Transmilenio que conectan las dos estaciones
          var url = API_URL + '/rutas/plan?origen=' + encodeURIComponent(o.nombre) +
                    '&destino=' + encodeURIComponent(d.nombre);
          return fetch(url)
            .then(function (r2) { return r2.ok ? r2.json() : Promise.resolve(null); })
            .then(function (p) {
              var texto = 'Ruta dibujada: ' + o.nombre + ' -> ' + d.nombre;
              if (p && p.rutas && p.rutas.length) {
                texto += '. Lineas directas: ' + p.rutas.map(function (x) { return x.codigo; }).join(', ') + '.';
              } else if (p && p.otras && p.otras.length) {
                texto +='. Lineas que llegan al destino: ' + p.otras.map(function (x) { return x.codigo; }).join(', ') + '.';
              }
              if (cont) { cont.textContent = texto; cont.classList.remove('hidden'); }
            })
            .catch(function () {
              if (cont) { cont.textContent = 'Ruta dibujada: ' + o.nombre + ' -> ' + d.nombre; cont.classList.remove('hidden'); }
            });
        })
        .catch(function (err) {
          if (cont) { cont.textContent = 'No se pudo dibujar la ruta: ' + err.message; cont.classList.remove('hidden'); }
        });
    }

    function cargarOperadorSelects() {
      return fetch(API_URL + '/estaciones')
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (lista) {
          ['opSelectEstacion', 'opSelectRutas', 'opSelectCamaras', 'opDespachoEstacion'].forEach(function (id) {
            var select = document.getElementById(id);
            if (!select) return;
            var valorPrevio = select.value;
            select.innerHTML = '<option value="">Selecciona estacion</option>';
            (lista || []).forEach(function (e) {
              var opt = document.createElement('option');
              opt.value = e.id;
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

      return fetch(API_URL + '/reportes?limite=100')
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (lista) {
          lista = lista || [];

          // Llenar filtro de rutas con las rutas reportadas
          var filtroRuta = document.getElementById('opFiltroRuta');
          if (filtroRuta) {
            var actual = filtroRuta.value;
            var rutasUnicas = [];
            lista.forEach(function (x) {
              if (x.ruta && rutasUnicas.indexOf(x.ruta) === -1) { rutasUnicas.push(x.ruta); }
            });
            rutasUnicas.sort();
            filtroRuta.innerHTML = '<option value="">Todas las rutas</option>' + rutasUnicas.map(function (r) {
              return '<option value="' + escHtml(r) + '">' + escHtml(r) + '</option>';
            }).join('');
            filtroRuta.value = actual;
          }

          // Aplicar filtros
          var nivelF = filtroRuta ? document.getElementById('opFiltroNivel').value : '';
          var rutaF = filtroRuta ? filtroRuta.value : '';
          var textoF = (document.getElementById('opBuscarReporte') || {}).value || '';
          textoF = textoF.toLowerCase().trim();
          lista = lista.filter(function (x) {
            if (nivelF && x.nivel !== nivelF) { return false; }
            if (rutaF && x.ruta !== rutaF) { return false; }
            if (textoF && (x.estacion || '').toLowerCase().indexOf(textoF) === -1) { return false; }
            return true;
          });

          // Ordenar
          var orden = (document.getElementById('opOrdenReportes') || {}).value || 'fecha';
          var peso = { Alta: 3, Media: 2, Baja: 1 };
          lista.sort(function (a, b) {
            if (orden === 'nivel') { return (peso[b.nivel] || 0) - (peso[a.nivel] || 0); }
            if (orden === 'estacion') { return String(a.estacion).localeCompare(String(b.estacion)); }
            if (orden === 'ruta') { return String(a.ruta || '').localeCompare(String(b.ruta || '')); }
            return new Date(b.creado_en) - new Date(a.creado_en);
          });

          if (!lista.length) {
            cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">No hay reportes con esos filtros.</p>';
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

            var porRuta = {};
            rs.forEach(function (x) {
              var k = x.ruta || 'SIN RUTA';
              if (!porRuta[k]) { porRuta[k] = { nivel: x.nivel, n: 0, atendido: x.atendido }; }
              porRuta[k].n++;
              if (x.atendido) { porRuta[k].atendido = true; }
            });
            var detalleRutas = Object.keys(porRuta).map(function (k) {
              var d = porRuta[k];
              var c = COLOR_NIVEL[d.nivel] || '#94a3b8';
              var pct = d.nivel === 'Alta' ? 85 : (d.nivel === 'Media' ? 55 : 30);
              return '<div class="flex items-center justify-between gap-2 mt-1.5 pl-2 border-l-2" style="border-color:' + c + '">' +
                '<span class="text-[11px] text-white font-bold">Ruta ' + escHtml(k) + ' <span class="text-slate-500">(' + d.n + ')</span></span>' +
                '<span class="text-[10px] font-black" style="color:' + c + '">' + escHtml(d.nivel) + ' ' + pct + '%</span>' +
                '<span class="text-[9px] ' + (d.atendido ? 'text-emerald-400' : 'text-amber-400') + '">' +
                  (d.atendido ? 'ATENDIDA' : 'PENDIENTE') + '</span>' +
              '</div>';
            }).join('');

            return '<div class="p-3 bg-brand-card border border-brand-border rounded-xl">' +
              '<div class="flex items-center justify-between gap-2">' +
                '<p class="text-white font-semibold text-xs sm:text-sm">' + escHtml(estacion) + '</p>' +
                '<span class="text-[10px] font-black px-2 py-0.5 rounded-md" style="background:' + color + '22;color:' + color + '">' + escHtml(ultima.nivel) + '</span>' +
              '</div>' +
              '<p class="text-[11px] text-slate-400 mt-1">' +
                (conteo.Alta || 0) + ' Alta &middot; ' + (conteo.Media || 0) + ' Media &middot; ' + (conteo.Baja || 0) + ' Baja &middot; ' + rs.length + ' reportes</p>' +
              detalleRutas +
            '</div>';
          }).join('');

          cont.innerHTML = html;
        })
        .catch(function (err) {
          cont.innerHTML = '<p class="text-xs text-red-400 text-center py-6">No se pudieron cargar los reportes.<br>' + escHtml(err.message) + '</p>';
        });
    }

    /** Frecuencia de buses: hace cuanto paso el ultimo y cada cuanto pasan */
    function cargarFrecuenciaBuses() {
      var cont = document.getElementById('opListaFrecuencia');
      if (!cont) { return; }
      fetch(API_URL + '/despachos/estadisticas')
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
          var lista = data.estadisticas || [];
          if (!lista.length) {
            cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-4 col-span-full">Aun no hay despachos registrados.</p>';
            return;
          }
          cont.innerHTML = lista.map(function (x) {
            return '<div class="p-2.5 rounded-xl border border-brand-border bg-brand-dark/70">' +
              '<p class="text-[11px] font-black text-white">' + escHtml(x.estacion) + ' · Ruta ' + escHtml(x.ruta) + '</p>' +
              '<p class="text-[10px] text-slate-400 mt-1">Ultimo bus: hace ' + x.minutos_sin_bus + ' min' +
              (x.intervalo_promedio_min != null ? ' · cada ' + x.intervalo_promedio_min + ' min en promedio' : '') + '</p>' +
              '<p class="text-[10px] text-slate-500">' + x.total + ' despacho(s) · ' + escHtml(x.ultimo_despacho || '') + '</p>' +
            '</div>';
          }).join('');
        })
        .catch(function () {
          cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-4 col-span-full">No se pudo cargar la frecuencia.</p>';
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
      var sel1 = document.getElementById('opSelectEstacion') || document.getElementById('opInputBuscarEstacion');
      var estSel = sel1 ? sel1.value : '';
      var estRes = estacionPorValor(estSel);
      var estacion = estRes ? estRes.nombre : estSel;
      var placa = document.getElementById('opPlacaBus');
      var bus = placa ? placa.value.trim() : '';
      var tipo = (document.getElementById('opTipoBus') || {}).value || 'Bus normal';
      var ruta = window.__rutaDespacho || '';
      if (!ruta) {
        var selR = document.getElementById('opSelectRutas');
        if (selR && estRes) {
          var rr = (window.__rutasOperador || [])[0];
          if (rr) { ruta = rr.codigo; }
        }
      }
      var msg = document.getElementById('opMensajeDespacho');

      if (!estacion || !ruta || !bus) {
        if (msg) { msg.textContent = 'Selecciona estacion, ruta y escribe el numero de placa.'; msg.classList.remove('hidden'); }
        return;
      }

      var usuario = {};
      try { usuario = JSON.parse(localStorage.getItem('usuarioTransmiFlowReal') || '{}'); } catch (e) { usuario = {}; }

      fetch(API_URL + '/despacho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estacion: estacion,
          ruta: ruta,
          bus: bus,
          tipo_bus: tipo,
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
              opt.value = e.id;opt.value = e.id;xtContent = e.nombre + (e.troncal ? ' (' + e.troncal + ')' : '');
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
            return '<button onclick="seleccionarEstacionOperador(' + e.id + ')" class="w-full text-left p-2 rounded-lg bg-brand-card border border-brand-border hover:border-brand-red">' +
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

    /** Carga las rutas de la estacion elegida en el formulario de despacho */
    function cargarRutasDespacho() {
      var selEst = document.getElementById('opDespachoEstacion');
      var selRuta = document.getElementById('opDespachoRuta');
      if (!selEst || !selRuta) { return; }
      var est = estacionPorValor(selEst.value);
      if (!est) { selRuta.innerHTML = '<option value="">Selecciona ruta</option>'; return; }
      fetch(API_URL + '/rutas/estacion/' + encodeURIComponent(est.nombre) + '?id=' + encodeURIComponent(est.id))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var rutas = (data.rutas || []).slice(0, 200);
          selRuta.innerHTML = '<option value="">Selecciona ruta</option>' + rutas.map(function (r) {
            return '<option value="' + escHtml(r.codigo) + '">' + escHtml(r.codigo) + ' · ' +
                   escHtml(r.origen || '') + ' → ' + escHtml(r.destino || '') + '</option>';
          }).join('');
        })
        .catch(function () { selRuta.innerHTML = '<option value="">No se pudieron cargar</option>'; });
    }

    /** Confirma el despacho con placa, cedula, estacion de inicio y ruta */
    function confirmarDespacho() {
      var msg = document.getElementById('opMensajeConfirmar');
      function avisar(texto, color) {
        if (!msg) { return; }
        msg.textContent = texto;
        msg.className = 'text-center text-xs font-medium py-1 ' + (color === 'ok' ? 'text-emerald-400' : 'text-red-400');
        msg.classList.remove('hidden');
      }
      var placa = (document.getElementById('opDespachoPlaca') || {}).value || '';
      var cedula = (document.getElementById('opDespachoConductor') || {}).value || '';
      var estSel = (document.getElementById('opDespachoEstacion') || {}).value || '';
      var ruta = (document.getElementById('opDespachoRuta') || {}).value || '';
      var tipo = (document.getElementById('opDespachoTipo') || {}).value || 'Bus normal';
      var est = estacionPorValor(estSel);
      if (!placa.trim() || !cedula.trim() || !est || !ruta) {
        avisar('Completa placa, cedula, estacion de inicio y ruta.', 'error');
        return;
      }
      var usuario = {};
      try { usuario = JSON.parse(localStorage.getItem('usuarioTransmiFlowReal') || '{}'); } catch (e) { usuario = {}; }

      fetch(API_URL + '/despacho', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estacion: est.nombre, ruta: ruta, bus: placa.trim(),
          tipo_bus: tipo, conductor: cedula.trim(),
          operador: usuario.email || 'operario'
        })
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok) { throw new Error(res.d.error || 'No se pudo despachar'); }
          avisar('Bus ' + placa + ' despachado a ' + est.nombre + ' por la ruta ' + ruta + '.', 'ok');
          window.__rutaDespacho = ruta;
          cargarBagones();
          cargarFrecuenciaBuses();
          cargarOperadorReportes();
          cargarOperadorBuses(est.id);
        })
        .catch(function (err) { avisar('No se pudo despachar: ' + err.message, 'error'); });
    }

    /** Agrupa los despachos por bus (bagón) con sus estaciones y rutas */
    /** Organiza por bus (bagón): estaciones y rutas de cada bus, con nivel de aglomeración */
    function cargarBagones() {
      var cont = document.getElementById('opListaBagones');
      if (!cont) { return; }
      cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-4 col-span-full">Cargando bagones...</p>';

      Promise.all([
        fetch(API_URL + '/despachos').then(function (r) { return r.json(); }),
        fetch(API_URL + '/reportes?limite=100').then(function (r) { return r.json(); })
      ]).then(function (res) {
        var despachos = (res[0] && res[0].despachos) || [];
        var reportes = res[1] || [];

        function nivelDe(estacion, ruta) {
          var reps = reportes.filter(function (x) {
            return String(x.estacion).toLowerCase() === String(estacion).toLowerCase() &&
                   (x.ruta || '') === (ruta || '');
          });
          if (reps.some(function (x) { return x.nivel === 'Alta'; })) { return { nivel: 'Alta', pct: 85, n: reps.length }; }
          if (reps.some(function (x) { return x.nivel === 'Media'; })) { return { nivel: 'Media', pct: 55, n: reps.length }; }
          return { nivel: 'Baja', pct: 30, n: reps.length };
        }

        // Buses disponibles + los que ya tiene historial
        var buses = [];
        ['B1','B2','B3','B4','B5','B6','B7','B8','B9','B10','B11','B12'].forEach(function (b) { buses.push(b); });
        despachos.forEach(function (d) { if (d.bus && buses.indexOf(d.bus) === -1) { buses.push(d.bus); } });

        if (!buses.length) {
          cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-4 col-span-full">No hay buses.</p>';
          return;
        }

        cont.innerHTML = buses.map(function (bus) {
          var items = despachos.filter(function (d) { return d.bus === bus; });
          var ultimo = items[0] || {};
          var porEstacion = {};
          items.forEach(function (d) {
            if (!porEstacion[d.estacion]) { porEstacion[d.estacion] = []; }
            if (porEstacion[d.estacion].indexOf(d.ruta) === -1) {
              porEstacion[d.estacion].push(d.ruta || 'SIN RUTA');
            }
          });

          var estacionesHtml = Object.keys(porEstacion).length
            ? Object.keys(porEstacion).map(function (estacion) {
                var rutasHtml = porEstacion[estacion].map(function (ruta) {
                  var info = nivelDe(estacion, ruta);
                  var color = COLOR_NIVEL[info.nivel];
                  return '<div class="flex items-center justify-between gap-2 pl-2 border-l-2 mt-1" style="border-color:' + color + ';background:' + color + '12">' +
                    '<span class="text-[10px] font-bold text-white">Ruta ' + escHtml(ruta) + '</span>' +
                    '<span class="text-[9px] font-black" style="color:' + color + '">' + info.nivel + ' ' + info.pct + '%</span>' +
                  '</div>';
                }).join('');
                return '<div class="mt-2">' +
                  '<p class="text-[10px] text-slate-300 font-bold">📍 ' + escHtml(estacion) + '</p>' + rutasHtml +
                '</div>';
              }).join('')
            : '<p class="text-[10px] text-slate-500 mt-2">Sin estaciones asignadas</p>';

          return '<div class="p-3 bg-brand-card border border-brand-border rounded-xl">' +
            '<div class="flex items-center justify-between gap-2">' +
              '<p class="text-white font-black text-xs">🚌 ' + escHtml(bus) +
                ' <span class="text-slate-500 text-[10px]">' + escHtml(ultimo.tipo_bus || 'Bus normal') + '</span></p>' +
              '<span class="text-[10px] text-slate-400">' + items.length + ' despacho(s)</span>' +
            '</div>' +
            '<p class="text-[10px] text-slate-500 mt-0.5">Conductor: ' + escHtml(ultimo.conductor || 'NO INDICADO') + '</p>' +
            estacionesHtml +
          '</div>';
        }).join('');
      }).catch(function () {
        cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-4 col-span-full">No se pudieron cargar los bagones.</p>';
      });
    }

    /** Carga las rutas que los usuarios reportaron como problematicas */
    function cargarRutasReportadas() {
      var cont = document.getElementById('opListaRutasReportadas');
      if (!cont) { return Promise.resolve(); }
      cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">Cargando reportes...</p>';

      return fetch(API_URL + '/reportes/rutas')
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
          var rutas = data.rutas || [];
          if (!rutas.length) {
            cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">No hay rutas reportadas.</p>';
            return;
          }
          cont.innerHTML = rutas.map(function (x) {
            var color = COLOR_NIVEL[x.nivel] || '#94a3b8';
            var estado = x.atendido
              ? '<span class="text-emerald-400">ATENDIDA</span>'
              : '<span class="text-amber-400">PENDIENTE</span>';
            return '<div class="p-3 bg-brand-card border border-brand-border rounded-xl">' +
              '<div class="flex items-center justify-between gap-2">' +
                '<p class="text-white font-bold text-xs">Ruta ' + escHtml(x.ruta) + '</p>' +
                '<span class="text-[10px] font-black px-2 py-0.5 rounded-md" style="background:' + color + '22;color:' + color + '">' + escHtml(x.nivel) + '</span>' +
              '</div>' +
              '<p class="text-[11px] text-slate-400 mt-1">' + escHtml(x.estacion) + ' &middot; ' + x.total + ' reporte(s) &middot; ' + estado + '</p>' +
              '<p class="text-[10px] text-slate-500 mt-0.5">Ultimo: ' + tiempoRelativo(x.creado_en) + '</p>' +
            '</div>';
          }).join('');
        })
        .catch(function (err) {
          cont.innerHTML = '<p class="text-xs text-red-400 text-center py-4">' + escHtml(err.message) + '</p>';
        });
    }

    /** Carga las rutas de la estacion elegida en el analizador de camara */
    function cargarRutasCamara(est) {
      var sel = document.getElementById('opCamaraRuta');
      if (!sel) { return; }
      sel.innerHTML = '<option value="">Cargando rutas...</option>';
      if (!est) { sel.innerHTML = '<option value="">Selecciona la ruta a analizar</option>'; return; }
      fetch(API_URL + '/rutas/estacion/' + encodeURIComponent(est.nombre) + '?id=' + encodeURIComponent(est.id))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var rutas = data.rutas || [];
          sel.innerHTML = '<option value="">Selecciona la ruta a analizar</option>' + rutas.map(function (r) {
            return '<option value="' + escHtml(r.codigo) + '">' + escHtml(r.codigo) + ' · ' + escHtml(r.origen || '') + ' → ' + escHtml(r.destino || '') + '</option>';
          }).join('');
        })
        .catch(function () { sel.innerHTML = '<option value="">No se pudieron cargar</option>'; });
    }

    var streamCamara = null;
    var frameCamaraAnterior = null;
    var estimacionCamara = null;

    /** Activa la camara del dispositivo para tomar el espacio de la estacion */
    function iniciarCamara() {
      var video = document.getElementById('opVideoCamara');
      if (!video) { return; }
      if (streamCamara) {
        video.classList.remove('hidden');
        return;
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Este navegador no permite acceder a la camara.');
        return;
      }
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        .then(function (stream) {
          streamCamara = stream;
          video.srcObject = stream;
          video.classList.remove('hidden');
        })
        .catch(function (err) { alert('No se pudo activar la camara: ' + err.message); });
    }

    function imagenAGris(canvas) {
      var ctx = canvas.getContext('2d');
      var w = canvas.width, h = canvas.height;
      var datos = ctx.getImageData(0, 0, w, h).data;
      var gris = new Float32Array(w * h);
      for (var i = 0; i < w * h; i++) {
        gris[i] = (datos[i*4] * 0.299 + datos[i*4+1] * 0.587 + datos[i*4+2] * 0.114) / 255;
      }
      return { gris: gris, w: w, h: h };
    }

    /** Captura un cuadro y estima aglomeracion por densidad de bordes y movimiento */
    function capturarYEstimar() {
      var video = document.getElementById('opVideoCamara');
      var canvas = document.getElementById('opCanvasCamara');
      var caja = document.getElementById('opResultadoCamara');
      if (!video || !canvas || !caja) { return; }
      if (!streamCamara || video.videoWidth === 0) {
        caja.classList.remove('hidden');
        document.getElementById('opNivelCamara').textContent = 'Camara no activa';
        document.getElementById('opDetalleCamara').textContent = 'Activa la camara antes de capturar.';
        return;
      }

      canvas.width = 160;
      canvas.height = 120;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      var actual = imagenAGris(canvas);

      // Densidad de bordes (mas personas = mas bordes)
      var bordes = 0, total = 0;
      for (var y = 1; y < actual.h - 1; y++) {
        for (var x = 1; x < actual.w - 1; x++) {
          var i = y * actual.w + x;
          var gx = actual.gris[i + 1] - actual.gris[i - 1];
          var gy = actual.gris[i + actual.w] - actual.gris[i - actual.w];
          if (Math.sqrt(gx * gx + gy * gy) > 0.12) { bordes++; }
          total++;
        }
      }
      var densidad = total ? bordes / total : 0;

      // Movimiento entre cuadros (personas en movimiento)
      var movimiento = 0;
      if (frameCamaraAnterior && frameCamaraAnterior.length === actual.gris.length) {
        for (var k = 0; k < actual.gris.length; k++) {
          movimiento += Math.abs(actual.gris[k] - frameCamaraAnterior[k]);
        }
        movimiento = movimiento / actual.gris.length;
      }
      frameCamaraAnterior = actual.gris;

      var puntaje = Math.round(Math.min(100, (densidad * 260 + movimiento * 320)));
      var nivel = puntaje < 25 ? 'Baja' : (puntaje < 55 ? 'Media' : 'Alta');
      var est = estacionPorValor(document.getElementById('opSelectCamaras').value);
      var ruta = document.getElementById('opCamaraRuta').value;
      estimacionCamara = {
        estacion: est ? est.nombre : '', ruta: ruta, nivel: nivel,
        nivelTexto: nivel, puntaje: puntaje,
        detalle: 'Densidad de bordes ' + Math.round(densidad * 100) + '% · movimiento ' + Math.round(movimiento * 100) + '%'
      };

      var color = COLOR_NIVEL[nivel];
      caja.classList.remove('hidden');
      document.getElementById('opNivelCamara').innerHTML =
        '<span style="color:' + color + '">Nivel estimado: ' + nivel + ' (' + puntaje + '%)</span>';
      document.getElementById('opDetalleCamara').textContent =
        (est ? est.nombre : 'Sin estacion') + (ruta ? ' · Ruta ' + ruta : '') + ' · ' + estimacionCamara.detalle;
    }

    /** Guarda la estimacion de la camara como reporte del sistema */
    function guardarReporteCamara() {
      if (!estimacionCamara) {
        alert('Primero captura y estima el nivel.');
        return;
      }
      if (!estimacionCamara.estacion || !estimacionCamara.ruta) {
        alert('Selecciona la estacion y la ruta antes de guardar.');
        return;
      }
      fetch(API_URL + '/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estacion: estimacionCamara.estacion,
          ruta: estimacionCamara.ruta,
          nivel: estimacionCamara.nivel
        })
      })
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function () {
          alert('Reporte guardado con el nivel estimado.');
          cargarOperadorReportes();
          cargarRutasReportadas();
        })
        .catch(function (err) { alert('No se pudo guardar: ' + err.message); });
    }

    /** Muestra las pruebas de disponibilidad, seguridad e integridad */
    function cargarDiagnostico() {
      var cont = document.getElementById('opListaDiagnostico');
      if (!cont) { return Promise.resolve(); }
      cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">Ejecutando pruebas...</p>';

      return fetch(API_URL + '/diagnostico')
        .then(function (r) {
          return r.json().then(function (d) { return { ok: r.ok, d: d }; });
        })
        .then(function (res) {
          if (!res.ok) { throw new Error(res.d.error || 'No se pudo verificar'); }
          var d = res.d;
          var html = '<div class="p-3 rounded-xl border mb-3 ' +
            (d.fallos === 0 ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-red-500/40 bg-red-500/10') + '">' +
            '<p class="text-xs font-black ' + (d.fallos === 0 ? 'text-emerald-400' : 'text-red-400') + '">' +
            escHtml(d.estado) + ' · ' + (d.total - d.fallos) + '/' + d.total + ' pruebas superadas</p>' +
            '<p class="text-[10px] text-slate-400 mt-1">Actualizado: ' + escHtml(d.fecha) + '</p></div>';

          var categoria = '';
          (d.resultados || []).forEach(function (x) {
            if (x.categoria !== categoria) {
              categoria = x.categoria;
              html += '<p class="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-3 mb-1">' +
                escHtml(categoria) + '</p>';
            }
            html += '<div class="flex items-start gap-2 p-2.5 bg-brand-dark/70 rounded-lg border border-brand-border">' +
              '<span class="text-[11px] font-black shrink-0 ' + (x.ok ? 'text-emerald-400' : 'text-red-400') + '">' +
              (x.ok ? '[OK]' : '[FALLO]') + '</span>' +
              '<div class="min-w-0"><p class="text-white text-[11px] font-bold">' + escHtml(x.nombre) + '</p>' +
              '<p class="text-[10px] text-slate-400 break-words">' + escHtml(x.detalle) + '</p></div></div>';
          });
          cont.innerHTML = html;
        })
        .catch(function (err) {
          cont.innerHTML = '<p class="text-xs text-red-400 text-center py-6">' + escHtml(err.message) + '</p>';
        });
    }

    /** Carga la lista de buses disponibles para despacho */
    /** Rutas de la estacion elegida con su nivel, % de reportes y buses para despachar */
    function cargarOperadorBuses(valor) {
      var cont = document.getElementById('opListaBusesPanel');
      if (!cont) { return Promise.resolve(); }
      var entre = document.getElementById('opInputBuscarEstacion');
      var est = estacionPorValor(valor || (entre ? entre.value : ''));
      if (!est) {
        cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">Elige una estacion en el panel de estaciones para ver sus rutas y buses.</p>';
        return Promise.resolve();
      }

      return Promise.all([
        fetch(API_URL + '/rutas/estacion/' + encodeURIComponent(est.nombre) + '?id=' + encodeURIComponent(est.id)).then(function (r) { return r.json(); }),
        fetch(API_URL + '/reportes?limite=100').then(function (r) { return r.json(); }),
        fetch(API_URL + '/despachos').then(function (r) { return r.json(); })
      ]).then(function (res) {
        var rutas = (res[0] && res[0].rutas) || [];
        var reportes = res[1] || [];
        var despachos = (res[2] && res[2].despachos) || [];

        var buses = [];
        ['B1','B2','B3','B4','B5','B6','B7','B8','B9','B10','B11','B12'].forEach(function (b) { buses.push(b); });
        despachos.forEach(function (d) { if (d.bus && buses.indexOf(d.bus) === -1) { buses.push(d.bus); } });

        var selBus = document.getElementById('opInputBuscarBus');
        if (selBus) {
          var antes = selBus.value;
          selBus.innerHTML = '<option value="">Buscar bus (despachar)...</option>' + buses.map(function (b) {
            return '<option value="' + escHtml(b) + '">' + escHtml(b) + '</option>';
          }).join('');
          selBus.value = antes;
        }

        if (!rutas.length) {
          cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">No hay rutas en esta estacion.</p>';
          return;
        }

        cont.innerHTML = rutas.map(function (r) {
          var reps = reportes.filter(function (x) {
            return String(x.estacion).toLowerCase() === String(est.nombre).toLowerCase() && (x.ruta || '') === (r.codigo || '');
          });
          var nivel = 'Baja';
          if (reps.some(function (x) { return x.nivel === 'Alta'; })) { nivel = 'Alta'; }
          else if (reps.some(function (x) { return x.nivel === 'Media'; })) { nivel = 'Media'; }
          var color = COLOR_NIVEL[nivel];
          var pct = nivel === 'Alta' ? 85 : (nivel === 'Media' ? 55 : 30);
          var atendidos = reps.filter(function (x) { return x.atendido; }).length;

          return '<div class="p-3 border border-brand-border rounded-xl mb-2" style="border-left:4px solid ' + color + ';background:' + color + '14">' +
            '<div class="flex items-center justify-between gap-2">' +
              '<p class="text-white font-black text-xs">Ruta ' + escHtml(r.codigo) + '</p>' +
              '<span class="text-[10px] font-black px-2 py-0.5 rounded-md" style="background:' + color + '22;color:' + color + '">' + nivel + ' ' + pct + '%</span>' +
            '</div>' +
            '<p class="text-[10px] text-slate-400 mt-1 truncate">' + escHtml(r.origen || '') + ' → ' + escHtml(r.destino || '') + '</p>' +
            '<p class="text-[10px] text-slate-400 mt-0.5">' + reps.length + ' reporte(s) · ' + atendidos + ' atendido(s) · ' + (r.estaciones || []).length + ' paradas</p>' +
            '<div class="grid grid-cols-3 gap-1 mt-2">' + buses.map(function (b) {
              var args = (JSON.stringify(b) + ', ' + JSON.stringify(r.codigo)).replace(/"/g, '&quot;');
              return '<button onclick="enviarDespachoBus(' + args + ')" ' +
                'class="px-1 py-1.5 bg-brand-dark border border-brand-border text-slate-300 text-[10px] font-bold rounded-lg hover:border-brand-red">' + escHtml(b) + '</button>';
            }).join('') + '</div>' +
          '</div>';
        }).join('');
      }).catch(function () {
        cont.innerHTML = '<p class="text-xs text-red-400 text-center py-6">No se pudieron cargar las rutas y buses.</p>';
      });
    }

    /** Despacha el bus con placa y tipo hacia la ruta indicada */
    function enviarDespachoBus(bus, ruta) {
      var placa = document.getElementById('opPlacaBus');
      if (placa) { placa.value = bus; }
      var selRuta = document.getElementById('opSelectRutas');
      if (ruta && selRuta) {
        var est = estaciones.find(function (e) { return String(e.id) === String(selRuta.value); });
        if (est) {
          fetch(API_URL + '/rutas/estacion/' + encodeURIComponent(est.nombre) + '?id=' + encodeURIComponent(est.id))
            .then(function (r) { return r.json(); })
            .then(function (data) {
              var found = (data.rutas || []).find(function (x) { return x.codigo === ruta; });
              if (found) {
                window.__rutaDespacho = ruta;
              }
            });
        }
      }
      if (ruta) { window.__rutaDespacho = ruta; }
      var msg = document.getElementById('opMensajeDespacho');
      if (msg) { msg.textContent = 'Bus ' + bus + ' listo. Confirma placa y tipo, luego despacha.'; msg.classList.remove('hidden'); }
    }

    function cargarOperadorRutas(valor) {
      var cont = document.getElementById('opListaRutas');
      if (!cont) { return Promise.resolve(); }
      var est = estacionPorValor(valor);
      if (!est) {
        cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">Selecciona una estacion para ver sus rutas.</p>';
        return Promise.resolve();
      }

      var selEst = document.getElementById('opSelectEstacion');
      if (selEst) { selEst.value = est.id; }
      var selRutas = document.getElementById('opSelectRutas');
      if (selRutas) { selRutas.value = est.id; }

      return fetch(API_URL + '/rutas/estacion/' + encodeURIComponent(est.nombre) + '?id=' + encodeURIComponent(est.id))
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
          var rutas = data.rutas || [];
          window.__rutasOperador = rutas;
          var tituloRutas = document.getElementById('opTituloRutas');
          if (tituloRutas) {
            tituloRutas.textContent = 'Rutas que paran en ' + est.nombre + ' (' + rutas.length + ')';
          }
          if (!rutas.length) {
            cont.innerHTML = '<p class="text-xs text-slate-400 text-center py-6">No hay rutas registradas para esta estacion.</p>';
            return;
          }
          if (rutas.length) {
            cont.innerHTML = rutas.map(function (r) {
              var color = r.color_hex || '#3b82f6';
              var ests = r.estaciones || [];
              var inicio = r.origen || (ests.length ? ests[0].nombre : '-');
              var fin = r.destino || (ests.length ? ests[ests.length - 1].nombre : '-');
              return '<div class="p-3 bg-brand-card border border-brand-border rounded-xl">' +
              '<div class="flex items-center justify-between gap-2">' +
                '<p class="text-white font-semibold text-xs sm:text-sm">' + escHtml(r.codigo) + '</p>' +
                '<span class="text-[10px] font-black px-2 py-0.5 rounded-md" style="background:' + color + '22;color:' + color + '">' +
                  escHtml(r.nombre || r.codigo) + '</span>' +
              '</div>' +
              '<p class="text-[11px] text-slate-400 mt-1">Inicio: ' + escHtml(inicio) + ' &nbsp;|&nbsp; Fin: ' + escHtml(fin) + '</p>' +
              '<p class="text-[11px] text-slate-400 mt-0.5">Paradas: ' + ests.length + '</p>' +
              '<div class="flex gap-2 mt-2">' +
                '<button onclick="verRutaEnMapa(' + r.id + ')" class="flex-1 px-3 py-2 bg-brand-dark border border-brand-border text-slate-300 text-[11px] font-bold rounded-lg hover:border-brand-red">Ver ruta en el mapa</button>' +
                '<button onclick="toggleParadasOperador(' + r.id + ')" class="px-3 py-2 bg-brand-dark border border-brand-border text-slate-300 text-[11px] font-bold rounded-lg hover:border-brand-red">Paradas</button>' +
              '</div>' +
              '<div id="opParadas-' + r.id + '" class="hidden mt-2 text-[11px] text-slate-400 space-y-0.5"></div>' +
            '</div>';
            }).join('');
          }
        })
        .catch(function (err) {
          cont.innerHTML = '<p class="text-xs text-red-400 text-center py-6">No se pudieron cargar las rutas.<br>' + escHtml(err.message) + '</p>';
        });
    }

    function cargarOperadorCamaras(valor) {
      var cont = document.getElementById('opListaCamaras');
      if (!cont) { return Promise.resolve(); }
      var estCam = estacionPorValor(valor);
      var estacion = estCam ? estCam.nombre : valor;
      cargarRutasCamara(estCam);
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

    /** Muestra u oculta las paradas de una ruta en el panel operativo */
    function toggleParadasOperador(rutaId) {
      var caja = document.getElementById('opParadas-' + rutaId);
      if (!caja) { return; }
      if (!caja.classList.contains('hidden')) { caja.classList.add('hidden'); return; }
      var rutas = window.__rutasOperador || [];
      var ruta = rutas.find(function (r) { return r.id === rutaId; });
      if (!ruta) { return; }
      var ests = ruta.estaciones || [];
      caja.innerHTML = ests.length
        ? ests.map(function (e, i) {
            return '<p class="flex gap-2"><span class="text-brand-red font-black">' + (i+1) + '.</span><span>' + escHtml(e.nombre) + '</span></p>';
          }).join('')
        : '<p class="text-slate-500">Sin paradas registradas.</p>';
      caja.classList.remove('hidden');
    }

    /** Dibuja en el mapa la ruta seleccionada (inicio -> fin con paradas) */
    function verRutaEnMapa(rutaId) {
      if (!map) { return; }
      var rutas = window.__rutasOperador || [];
      var ruta = null;
      for (var i = 0; i < rutas.length; i++) { if (rutas[i].id === rutaId) { ruta = rutas[i]; break; } }
      if (!ruta) { return; }

      // El corredor oficial de la ruta (con sus paradas) es lo que se dibuja
      if (typeof dibujarCorredorTransmilenio === 'function') {
        dibujarCorredorTransmilenio(ruta);
        return;
      }

      var coords = [];
      (ruta.estaciones || []).forEach(function (e) {
        var la = e.lat != null ? e.lat : e.latitud;
        var lo = e.lng != null ? e.lng : e.longitud;
        if (la != null && lo != null) { coords.push([la, lo]); }
      });
      if (coords.length < 2) { return; }

      if (lineaRuta) { map.removeLayer(lineaRuta); lineaRuta = null; }
      lineaRuta = L.polyline(coords, { color: '#8b5cf6', weight: 5, opacity: 0.8 }).addTo(map);
      map.fitBounds(coords, { padding: [40, 40] });
    }

    /** Dibuja en el mapa la ruta oficial de Transmilenio seleccionada */
    function verRutaEnMapaOficial(linea) {
      if (!map) { return; }
      if (!linea || !linea.coordenadas || !linea.coordenadas.length) { return; }
      if (typeof dibujarCorredorTransmilenio === 'function') {
        dibujarCorredorTransmilenio(linea);
        return;
      }
      var coords = linea.coordenadas.filter(function (c) { return c && c[0] != null && c[1] != null; });
      if (coords.length < 2) { return; }
      if (lineaRuta) { map.removeLayer(lineaRuta); lineaRuta = null; }
      lineaRuta = L.polyline(coords, { color: '#8b5cf6', weight: 5, opacity: 0.8 }).addTo(map);
      map.fitBounds(coords, { padding: [40, 40] });
    }
