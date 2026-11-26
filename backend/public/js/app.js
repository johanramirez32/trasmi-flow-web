    // ==========================================================
    // NAVEGACION
    // ==========================================================
    function cambiarSeccion(id) {
      ['estaciones', 'alertas', 'reportes', 'operadores'].forEach(function (s) {
        document.getElementById('sec-' + s).classList.toggle('hidden', s !== id);
      });
      if (id === 'estaciones') setTimeout(initMap, 80);
      if (id === 'reportes')  cargarReportes();
      if (id === 'alertas')   { cargarAlertas(); cargarNotificaciones(); }
      if (id === 'operadores') { cargarOperadorSelects(); }

      // Resaltar en rojo solo la pestaña activa (escritorio y movil)
      var pestañas = {
        estaciones: ['nav-estaciones', 'mnav-estaciones'],
        alertas:    ['nav-alertas', 'mnav-alertas'],
        reportes:   ['nav-reportes', 'mnav-reportes'],
        operadores: ['nav-operadores', 'mnav-operadores']
      };
      Object.keys(pestañas).forEach(function (sec) {
        pestañas[sec].forEach(function (bid) {
          var b = document.getElementById(bid);
          if (!b) { return; }
          var activo = sec === id;
          if (bid.indexOf('mnav-') === 0) {
            b.className = 'flex flex-col items-center gap-0.5 px-4 py-1 min-w-[64px] ' +
              (activo ? 'text-brand-red' : 'text-slate-400');
            var sp = b.querySelector('span');
            if (sp) { sp.className = 'text-[10px] ' + (activo ? 'font-bold' : 'font-semibold'); }
          } else {
            b.className = 'px-4 py-2 text-xs rounded-lg flex items-center gap-2 ' +
              (activo
                ? 'font-bold text-white bg-brand-red'
                : 'font-semibold text-slate-400 hover:text-white');
          }
        });
      });
      actualizarIconos();
    }
    function irAMapa()      { cambiarSeccion('estaciones'); }
    function irAAertas()    { cambiarSeccion('alertas'); }
    function irAReportes()  { cambiarSeccion('reportes'); }
    function irAOperadores() { cambiarSeccion('operadores'); }

    // ==========================================================
    // REPORTES  (enviar, listar y refrescar)
    // ==========================================================
    var COLOR_NIVEL = { 'Baja': '#22c55e', 'Media': '#f59e0b', 'Alta': '#ef4444' };

    function mostrarMensajeReporte(texto, tipo) {
      var caja = document.getElementById('repMensaje');
      if (!caja) return;
      var colores = {
        ok:     'text-emerald-400',
        error:  'text-red-400',
        espera: 'text-slate-400'
      };
      caja.className = 'text-center text-xs font-medium py-1 ' + (colores[tipo] || colores.espera);
      caja.textContent = texto;
      caja.classList.remove('hidden');
    }

    /** Pinta la lista de reportes */
    function pintarReportes(lista) {
      var cont = document.getElementById('listaReportes');
      var num  = document.getElementById('repContador');
      if (!cont) return;

      window.__reportesCache = lista;

      if (num) num.textContent = lista.length;

      if (!lista.length) {
        cont.innerHTML =
          '<p class="text-xs text-slate-400 text-center py-6">' +
          'Todavia no hay reportes.<br>Envia el primero desde el formulario.</p>';
        return;
      }

      cont.innerHTML = lista.map(function (r) {
        var color = COLOR_NIVEL[r.nivel] || '#94a3b8';
        var cuando = tiempoRelativo(r.creado_en);
        var quien = r.usuario ? escHtml(r.usuario.split('@')[0]) : 'anonimo';
        return '<div class="flex items-center gap-3 p-3 bg-brand-card border border-brand-border ' +
               'rounded-xl hover:border-brand-red/50 transition-colors">' +
                 '<span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:' + color + '"></span>' +
                 '<div class="min-w-0 flex-grow">' +
                   '<p class="text-white font-semibold text-xs sm:text-sm truncate">' + escHtml(r.estacion) + '</p>' +
                   '<p class="text-[11px] text-slate-400 truncate">' + 'Ruta ' + escHtml(r.ruta || 'NO INDICADA') + ' &middot; ' + quien + ' &middot; ' + cuando +
                      (r.atendido ? ' &middot; <span class="text-emerald-400">ATENDIDO</span>' : ' &middot; <span class="text-amber-400">PENDIENTE</span>') + '</p>' +
                 '</div>' +
                 '<span class="text-[10px] font-black px-2 py-0.5 rounded-md shrink-0" ' +
                       'style="background:' + color + '22;color:' + color + '">' + escHtml(r.nivel) + '</span>' +
               '</div>';
      }).join('');
    }

    /** Carga los reportes desde el servidor */
    function cargarReportes() {
      return fetch(API_URL + '/reportes?limite=25')
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(pintarReportes)
        .catch(function (err) {
          var cont = document.getElementById('listaReportes');
          if (cont) {
            cont.innerHTML = '<p class="text-xs text-red-400 text-center py-6">' +
              'No se pudieron cargar los reportes.<br>' +
              '<span class="text-slate-500">' + escHtml(err.message) + '</span></p>';
          }
        });
    }

    /** Envia un reporte y refresca la lista al instante */
    function enviarReporte() {
      var campo   = document.getElementById('repEstacion');
      var nivel   = document.getElementById('repNivel');
      var boton   = document.getElementById('btnEnviarReporte');
      var sug     = document.getElementById('repSugerencias');

      var est = campo.value.trim();
      var rutaSel = document.getElementById('repRuta');
      var ruta = rutaSel ? rutaSel.value.trim() : '';
      if (!est) {
        mostrarMensajeReporte('Escribe el nombre de la estacion', 'error');
        campo.focus();
        return;
      }
      if (!ruta) {
        mostrarMensajeReporte('Selecciona la ruta que genera la aglomeracion', 'error');
        if (rutaSel) { rutaSel.focus(); }
        return;
      }

      boton.disabled = true;
      boton.textContent = 'Enviando...';
      mostrarMensajeReporte('Enviando reporte...', 'espera');

      var usuario = {};
      try { usuario = JSON.parse(localStorage.getItem('usuarioTransmiFlowReal') || '{}'); }
      catch (e) { usuario = {}; }

      fetch(API_URL + '/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estacion: est,
          ruta: ruta,
          nivel: nivel.value,
          usuario: usuario.email || 'anonimo'
        })
      })
        .then(function (r) {
          if (!r.ok) throw new Error('El servidor respondio ' + r.status);
          return r.json();
        })
        .then(function (respuesta) {
          // El servidor devuelve el reporte recien creado: lo mostramos al instante
          var cache = (window.__reportesCache || []).filter(function (r) {
            return r.id !== respuesta.reporte.id;
          });
          pintarReportes([respuesta.reporte].concat(cache).slice(0, 25));

          campo.value = '';
          if (rutaSel) { rutaSel.value = ''; }
          if (sug) sug.classList.add('hidden');
          mostrarMensajeReporte('Reporte enviado. Gracias por tu aporte.', 'ok');
          actualizarIconos();

          // Confirmamos contra el servidor (orden real y estado guardado)
          cargarReportes();
        })
        .catch(function (err) {
          mostrarMensajeReporte('No se pudo enviar: ' + err.message, 'error');
        })
        .finally(function () {
          boton.disabled = false;
          boton.textContent = 'Enviar Reporte';
        });
    }

    /** Al escribir/seleccionar estacion, cargar SOLO sus rutas */
    function alCambiarEstacionReporte() {
      var campo = document.getElementById('repEstacion');
      var sel = document.getElementById('repRuta');
      if (!campo || !sel) { return; }
      var nombre = campo.value.trim();
      if (!nombre) {
        sel.innerHTML = '<option value="">Primero elige la estacion</option>';
        return;
      }
      var n = nombre.toLowerCase();
      var exacta = (estaciones || []).find(function (e) { return e.nombre.toLowerCase() === n; });
      if (exacta) { cargarRutasDelReporte(exacta.nombre); return; }

      // Si no es exacta, esperar a que elija una sugerencia
      sel.innerHTML = '<option value="">Elige una estacion de la lista</option>';
    }

    /** Autocompletado de estaciones al escribir */
    function sugerirEstaciones() {
      var texto = document.getElementById('repEstacion').value.trim();
      var caja  = document.getElementById('repSugerencias');
      if (!caja) return;

      if (texto.length < 2) { caja.classList.add('hidden'); alCambiarEstacionReporte(); return; }

      alCambiarEstacionReporte();
      var coincidencias = estaciones.filter(function (e) {
        return e.nombre.toLowerCase().indexOf(texto.toLowerCase()) !== -1;
      }).slice(0, 6);

      if (!coincidencias.length) { caja.classList.add('hidden'); return; }

      caja.innerHTML = coincidencias.map(function (e) {
        return '<button type="button" onclick="elegirSugerencia(\'' +
          e.nombre.replace(/'/g, "\\'") + '\')" ' +
          'class="w-full text-left px-3 py-2.5 text-xs text-white hover:bg-brand-red/20 border-b border-brand-border last:border-0">' +
          escHtml(e.nombre) + ' <span class="text-slate-500">- ' + escHtml(e.troncal) + '</span></button>';
      }).join('');
      caja.classList.remove('hidden');
    }

    function elegirSugerencia(nombre) {
      document.getElementById('repEstacion').value = nombre;
      document.getElementById('repSugerencias').classList.add('hidden');
      cargarRutasDelReporte(nombre);
    }

    /** Carga en el selector las rutas que paran en la estacion reportada */
    /** Carga las rutas de la estacion (por vagon) con respaldo oficial en Render */
    function cargarRutasDelReporte(nombre) {
      var sel = document.getElementById('repRuta');
      var info = document.getElementById('repRutaInfo');
      if (!sel) { return Promise.resolve([]); }
      if (sel) { sel.innerHTML = '<option value="">Selecciona la ruta</option>'; }
      if (info) { info.textContent = ''; }
      if (!nombre) { return Promise.resolve([]); }

      var est = (estaciones || []).find(function (e) { return e.nombre === nombre; });

      function pintar(opciones, detalle) {
        if (sel) {
          sel.innerHTML = '<option value="">Selecciona la ruta</option>' + opciones.map(function (o) {
            return '<option value="' + escHtml(o.codigo) + '">' +
              escHtml((o.vagon ? o.vagon + ' · ' : '') + (o.origen || '') + ' → ' + (o.destino || '')) +
              '</option>';
          }).join('');
        }
        if (info) { info.textContent = detalle; }
        return opciones;
      }

      function respaldoOficial() {
        var url = API_URL + '/rutas/estacion/' + encodeURIComponent(nombre) +
                  (est ? '?id=' + encodeURIComponent(est.id) : '');
        return fetch(url)
          .then(function (r) { return r.ok ? r.json() : { rutas: [] }; })
          .then(function (data) {
            var codigos = (data.rutas || []).map(function (x) {
              return typeof x === 'string' ? x : (x.codigo || x.linea || '');
            }).filter(Boolean);
            var vistos = {}, opciones = [];
            codigos.forEach(function (c) {
              if (!vistos[c]) { vistos[c] = 1; opciones.push({ codigo: c, origen: '', destino: '' }); }
            });
            return pintar(opciones, opciones.length
              ? (data.estacion_cercana ? 'Rutas de ' + data.estacion_cercana + ' (estación oficial más cercana): ' : 'Rutas oficiales de la estación: ') + opciones.map(function (o) { return o.codigo; }).join(', ')
              : 'Esta estación no tiene rutas registradas.');
          })
          .catch(function () { return pintar([], 'No se pudieron cargar las rutas.'); });
      }

      if (!est) { return respaldoOficial(); }

      return fetch(API_URL + '/vagones/' + encodeURIComponent(est.id))
        .then(function (r) { return r.ok ? r.json() : { vagones: [] }; })
        .then(function (data) {
          var vagones = data.vagones || [];
          var opciones = [], resumen = [];
          vagones.forEach(function (v) {
            var rutas = v.rutas || [];
            resumen.push(v.nombre + ': ' + (rutas.length ? rutas.map(function (x) { return x.codigo; }).join(', ') : 'sin rutas'));
            rutas.forEach(function (x) {
              opciones.push({ codigo: x.codigo, vagon: v.nombre, origen: x.origen, destino: x.destino });
            });
          });
          if (!opciones.length) { return respaldoOficial(); }
          return pintar(opciones, resumen.join(' | '));
        })
        .catch(function () { return respaldoOficial(); });
    }

    // ==========================================================
    // ALERTAS (se construyen con los reportes de las ultimas 24h)
    // ==========================================================
    function cargarAlertas() {
      var cont = document.getElementById('listaAlertas');
      if (!cont) return;

      return fetch(API_URL + '/alertas/aglomeracion?horas=168')
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (datos) {
          var rutas = datos.rutas || [];
          var estaciones = datos.estaciones || [];
          var portales = datos.portales || [];
          var criticas = rutas.filter(function (x) { return x.porcentaje > 50; });
          var criticasEst = estaciones.filter(function (x) { return x.porcentaje > 50; });

          if (!criticas.length && !criticasEst.length) {
            cont.innerHTML =
              '<div class="p-5 bg-brand-card border border-emerald-500/30 rounded-2xl flex gap-3 items-start">' +
              '<i data-lucide="check-circle" class="w-6 h-6 text-emerald-400 shrink-0"></i>' +
              '<div><h4 class="text-white font-bold text-sm">Sin alertas de aglomeración</h4>' +
              '<p class="text-xs text-slate-400 mt-1">Ninguna ruta ni estación supera el 50% según los reportes de los usuarios.</p></div></div>';
            actualizarIconos();
            return;
          }

          function tarjeta(n, titulo, subtitulo) {
            var color = n.nivel === 'Alta' ? '#ef4444' : '#f59e0b';
            var icono = n.nivel === 'Alta' ? 'alert-triangle' : 'alert-circle';
            return '<div class="p-4 bg-brand-card border rounded-2xl flex gap-3 items-start" style="border-color:' + color + '55">' +
              '<i data-lucide="' + icono + '" class="w-6 h-6 shrink-0" style="color:' + color + '"></i>' +
              '<div class="min-w-0 flex-grow">' +
                '<h4 class="text-white font-bold text-sm break-words">' + titulo + '</h4>' +
                '<p class="text-xs text-slate-400 mt-1 break-words">' + subtitulo + '</p>' +
              '</div>' +
              '<span class="text-[10px] font-black px-2 py-1 rounded-md shrink-0" style="background:' + color + '22;color:' + color + '">' +
                escHtml(n.nivel) + ' ' + n.porcentaje + '%</span>' +
            '</div>';
          }

          var html = '';
          if (portales.length) {
            html += '<p class="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-1">Portales</p>';
            html += portales.slice(0, 4).map(function (p) {
              return tarjeta(p, escHtml(p.portal), p.reportes + ' reporte(s) · ' + p.estaciones.length + ' estación(es)');
            }).join('');
          }
          if (criticasEst.length) {
            html += '<p class="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-3">Estaciones</p>';
            html += criticasEst.slice(0, 8).map(function (e) {
              return tarjeta(e, escHtml(e.estacion), escHtml(e.portal) + ' · ' + e.reportes + ' reporte(s)');
            }).join('');
          }
          if (criticas.length) {
            html += '<p class="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-3">Rutas</p>';
            html += criticas.slice(0, 8).map(function (x) {
              return tarjeta(x, 'Ruta ' + escHtml(x.ruta), escHtml(x.estacion) + ' · ' + x.reportes + ' reporte(s)');
            }).join('');
          }
          cont.innerHTML = html;
          actualizarIconos();
        })
        .catch(function (err) {
          cont.innerHTML = '<p class="text-xs text-red-400 text-center py-6">No se pudieron cargar las alertas.<br>' +
            '<span class="text-slate-500">' + escHtml(err.message) + '</span></p>';
        });
    }

    /** HTML de alertas: rutas con aglomeracion > 50% y niveles por estacion */
    function htmlAlertasAglomeracion(datos) {
      var rutas = datos.rutas || [];
      var estaciones = (datos.estaciones || []).slice(0, 8);
      var html = '';

      html += '<div class="p-2.5 rounded-xl border ' + (rutas.length ? 'border-red-500/40 bg-red-500/10' : 'border-brand-border bg-brand-dark/60') + '">' +
        '<p class="text-[10px] font-black uppercase tracking-wider ' + (rutas.length ? 'text-red-400' : 'text-slate-400') + '">' +
          'Aglomeracion por ruta (' + rutas.length + ')</p>';
      if (!rutas.length) {
        html += '<p class="text-[10px] text-slate-400 mt-1">Ninguna ruta supera el 50%.</p>';
      } else {
        rutas.slice(0, 6).forEach(function (x) {
          var color = x.nivel === 'Alta' ? '#ef4444' : '#f59e0b';
          html += '<div class="mt-1.5 pl-2 border-l-2" style="border-color:' + color + '">' +
            '<p class="text-[11px] text-white font-bold">Ruta ' + escHtml(x.ruta) + ' · ' + escHtml(x.estacion) + '</p>' +
            '<p class="text-[10px]" style="color:' + color + '">' + escHtml(x.nivel) + ' ' + x.porcentaje + '% · ' + x.reportes + ' reporte(s)</p>' +
          '</div>';
        });
      }
      html += '</div>';

      var portales = datos.portales || [];
      if (portales.length) {
        html += '<p class="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-2 mb-1">Portales</p>';
        portales.slice(0, 4).forEach(function (p) {
          var color = p.nivel === 'Alta' ? '#ef4444' : (p.nivel === 'Media' ? '#f59e0b' : '#22c55e');
          html += '<div class="flex items-center justify-between gap-2 p-2 rounded-lg bg-brand-dark/60 border border-brand-border mb-1">' +
            '<span class="text-[10px] text-white truncate">' + escHtml(p.portal) + '</span>' +
            '<span class="text-[10px] font-black shrink-0" style="color:' + color + '">' + escHtml(p.nivel) + ' ' + p.porcentaje + '%</span>' +
          '</div>';
        });
      }

      if (estaciones.length) {
        html += '<p class="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-2 mb-1">Niveles por estacion</p>';
        estaciones.forEach(function (e) {
          var color = e.nivel === 'Alta' ? '#ef4444' : (e.nivel === 'Media' ? '#f59e0b' : '#22c55e');
          html += '<div class="flex items-center justify-between gap-2 p-2 rounded-lg bg-brand-dark/60 border border-brand-border mb-1">' +
            '<span class="text-[10px] text-white truncate">' + escHtml(e.estacion) + '</span>' +
            '<span class="text-[10px] font-black shrink-0" style="color:' + color + '">' + escHtml(e.nivel) + ' ' + e.porcentaje + '%</span>' +
          '</div>';
        });
      }
      return html;
    }

    /** Notificaciones y alertas de aglomeracion */
    function cargarNotificaciones() {
      var cont = document.getElementById('listaNotificaciones');
      if (!cont) { return Promise.resolve(); }
      return Promise.all([
        fetch(API_URL + '/alertas/aglomeracion').then(function (r) { return r.ok ? r.json() : { rutas: [], estaciones: [] }; }),
        fetch(API_URL + '/notificaciones').then(function (r) { return r.ok ? r.json() : { notificaciones: [] }; })
      ]).then(function (res) {
        var alertas = res[0];
        var notis = res[1].notificaciones || [];
        var html = htmlAlertasAglomeracion(alertas);
        if (notis.length) {
          html += '<p class="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-2 mb-1">Reportes atendidos</p>';
          notis.slice(0, 5).forEach(function (n) {
            html += '<div class="p-3 bg-brand-card border border-brand-border rounded-xl">' +
              '<p class="text-white font-semibold text-xs">' + escHtml(n.mensaje) + '</p>' +
              '<p class="text-[10px] text-slate-400 mt-0.5">' + escHtml(n.tipo || '') + '</p></div>';
          });
        }
        cont.innerHTML = html;
      }).catch(function () {
        cont.innerHTML = '<p class="text-xs text-red-400 text-center py-6">No se pudieron cargar las alertas.</p>';
      });
    }

    /** Refresca la campana con las alertas de aglomeracion */
    function actualizarNotifBadge(contexto) {
      var badge = document.getElementById('notifBadge');
      var cont = document.getElementById('listaNotifPanel');
      contexto = contexto || {};
      fetch(API_URL + '/alertas/aglomeracion')
        .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (datos) {
          var rutas = datos.rutas || [];
          var estaciones = datos.estaciones || [];
          var portales = datos.portales || [];
          var etiqueta = '';
          if (contexto.estacion) {
            rutas = rutas.filter(function (x) { return x.estacion === contexto.estacion; });
            estaciones = estaciones.filter(function (x) { return x.estacion === contexto.estacion; });
            portales = portales.filter(function (x) {
              return (x.estaciones || []).indexOf(contexto.estacion) !== -1;
            });
            etiqueta = contexto.estacion;
          }
          if (contexto.ruta) {
            rutas = rutas.filter(function (x) { return x.ruta === contexto.ruta; });
            etiqueta = (etiqueta ? etiqueta + ' · ' : '') + 'Ruta ' + contexto.ruta;
          }
          var n = rutas.length;
          if (badge) {
            if (n > 0) { badge.textContent = n; badge.classList.remove('hidden'); }
            else { badge.textContent = '0'; badge.classList.add('hidden'); }
          }
          if (cont) {
            cont.innerHTML = (etiqueta
              ? '<p class="text-[10px] font-black text-brand-red uppercase tracking-wider mb-1">Contexto: ' + escHtml(etiqueta) + '</p>'
              : '') + htmlAlertasAglomeracion({ rutas: rutas, estaciones: estaciones, portales: portales });
          }
        })
        .catch(function () {
          if (cont) { cont.innerHTML = '<p class="text-[11px] text-slate-400 text-center py-4">Sin alertas.</p>'; }
        });
    }

    /** Alterna el panel de notificaciones */
    function togglePanelNotificaciones() {
      var panel = document.getElementById('panelNotificaciones');
      if (!panel) { return; }
      var estabaAbierto = !panel.classList.contains('hidden');
      // toggle(token, force): force=true añade la clase. Queremos lo contrario
      panel.classList.toggle('hidden', estabaAbierto);
      if (!estabaAbierto) { actualizarNotifBadge(); }
    }

    /** Marca todas las notificaciones del usuario como leidas */
    function marcarNotificacionesLeidas() {
      var usuario = {};
      try { usuario = JSON.parse(localStorage.getItem('usuarioTransmiFlowReal') || '{}'); } catch (e) { usuario = {}; }
      fetch(API_URL + '/notificaciones/leer?usuario=' + encodeURIComponent(usuario.email || ''), { method: 'POST' })
        .then(function (r) { return r.json(); })
        .catch(function (err) { /* noop */ });
      var badge = document.getElementById('notifBadge');
      if (badge) { badge.textContent = '0'; badge.classList.add('hidden'); }
    }

    /** Abre una notificacion: la marca como leida y va a la seccion de alertas */
    function abrirNotificacion(id) {
      marcarNotificacionesLeidas();
      var panel = document.getElementById('panelNotificaciones');
      if (panel) { panel.classList.add('hidden'); }
      cambiarSeccion('alertas');
    }

    // ==========================================================
    // AUTENTICACION
    // ==========================================================
    var esRegistro = false;

    function alternarModoAuth() {
      esRegistro = !esRegistro;
      document.getElementById('campoNombre').classList.toggle('hidden', !esRegistro);
      document.getElementById('authTitulo').textContent = esRegistro ? 'Crear Cuenta' : 'Iniciar Sesion';
      document.getElementById('txtBtnAuth').textContent = esRegistro ? 'Registrarme' : 'Ingresar a la Plataforma';
      document.getElementById('txtPreguntaAuth').textContent = esRegistro ? 'Ya tienes cuenta?' : 'No tienes cuenta?';
      document.getElementById('btnAlternarAuth').textContent = esRegistro ? 'Inicia sesion' : 'Registrate aqui';
      document.getElementById('authMensajeError').classList.add('hidden');
      var passMsg = document.getElementById('authMensajePassword');
      if (passMsg) { passMsg.classList.add('hidden'); passMsg.textContent = ''; }
      var reglas = document.getElementById('reglasPassword');
      if (reglas) { reglas.classList.toggle('hidden', !esRegistro); }
    }

    /** Muestra u oculta la contrasena */
    function togglePassword() {
      var input = document.getElementById('inputPassword');
      if (!input) { return; }
      input.type = input.type === 'password' ? 'text' : 'password';
    }

    /** Reglas de contrasena que se validan tambien en el servidor */
    function validarPasswordLocal(password) {
      var errores = [];
      if (password.length < 8) { errores.push('8 caracteres'); }
      if ((password.match(/[A-Za-z]/g) || []).length < 4) { errores.push('4 letras'); }
      if (!/[A-Z]/.test(password)) { errores.push('1 mayuscula'); }
      if (!/[0-9]/.test(password)) { errores.push('1 numero'); }
      if (!/[^A-Za-z0-9]/.test(password)) { errores.push('1 caracter especial'); }
      return errores;
    }

    /** Bombillito de estado de la base de datos */
    function verificarConexion() {
      fetch(API_URL + '/health')
        .then(function (r) {
          if (!r.ok) { throw new Error('HTTP ' + r.status); }
          return r.json();
        })
        .then(function (data) {
          var dot = document.getElementById('dotConexion');
          var txt = document.getElementById('txtConexion');
          if (dot) { dot.className = 'w-2 h-2 rounded-full bg-emerald-500'; }
          if (txt) { txt.textContent = 'Base de datos conectada'; }
        })
        .catch(function () {
          var dot = document.getElementById('dotConexion');
          var txt = document.getElementById('txtConexion');
          if (dot) { dot.className = 'w-2 h-2 rounded-full bg-red-500'; }
          if (txt) { txt.textContent = 'Sin conexion con la base de datos'; }
        });
    }

    /** Abre el cuadro de Google al pulsar el boton Gmail de la fila */
    function iniciarGoogle() {
      var cont = document.getElementById('btnGoogleOficial');
      var msg = document.getElementById('authMensajeError');
      if (!cont) { return; }
      var boton = cont.querySelector('[role="button"]') || cont.firstElementChild;
      if (boton) { boton.click(); return; }
      if (window.google && google.accounts) {
        google.accounts.id.prompt(function (notificacion) {
          if (notificacion && notificacion.isNotDisplayed && notificacion.isNotDisplayed()) {
            if (msg) {
              msg.textContent = 'No se pudo abrir Google. Verifica el origen autorizado del cliente OAuth.';
              msg.classList.remove('hidden');
            }
          }
        });
        return;
      }
      cargarGoogle();
      if (msg) {
        msg.textContent = 'Cargando acceso con Google, intenta de nuevo en un momento.';
        msg.classList.remove('hidden');
      }
    }

    var googleCargado = false;
    /** Carga Google Identity Services y dibuja el boton oficial de Gmail */
    function cargarGoogle() {
      var cont = document.getElementById('btnGoogleOficial');
      if (!cont || googleCargado) { return; }

      function dibujar() {
        if (!window.google || !google.accounts) { return; }
        fetch(API_URL + '/config')
          .then(function (r) { return r.json(); })
          .then(function (cfg) {
            if (!cfg.googleClientId) { return; }
            google.accounts.id.initialize({
              client_id: cfg.googleClientId,
              callback: respuestaGoogle,
              ux_mode: 'popup'
            });
            cont.innerHTML = '';
            google.accounts.id.renderButton(cont, {
              theme: 'filled_blue', size: 'large', shape: 'pill',
              text: 'signin_with', width: 280
            });
            googleCargado = true;
          })
          .catch(function () { cont.textContent = 'No se pudo cargar el acceso con Gmail.'; });
      }

      if (window.google && window.google.accounts) { dibujar(); return; }
      var s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = dibujar;
      s.onerror = function () { cont.textContent = 'No se pudo cargar el acceso con Gmail.'; };
      document.head.appendChild(s);
    }

    /** Envia el ID token de Google al backend para obtener nuestro token */
    function respuestaGoogle(respuesta) {
      var msg = document.getElementById('authMensajeError');
      if (msg) { msg.classList.add('hidden'); }
      fetch(API_URL + '/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: respuesta.credential })
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok) {
            if (msg) {
              msg.textContent = res.d.error || 'No se pudo ingresar con Google.';
              msg.classList.remove('hidden');
            }
            return;
          }
          localStorage.setItem('usuarioTransmiFlowReal', JSON.stringify(res.d.usuario));
          localStorage.setItem(TOKEN_KEY, res.d.token || '');
          verificarAcceso();
          actualizarNotifBadge();
        })
        .catch(function () {
          if (msg) {
            msg.textContent = 'No se pudo conectar con el servidor.';
            msg.classList.remove('hidden');
          }
        });
    }

    /** Acceso social: Facebook y Outlook aun no implementados */
    function accesoSocial(proveedor) {
      var msg = document.getElementById('authMensajeError');
      if (msg) {
        msg.textContent = 'El ingreso con ' + proveedor + ' requiere configuracion OAuth. Usa tu correo y contrasena.';
        msg.classList.remove('hidden');
      }
    }

    function procesarAuth(event) {
      event.preventDefault();
      var email    = document.getElementById('inputEmail').value.trim();
      var password = document.getElementById('inputPassword').value.trim();
      var nombre   = document.getElementById('inputNombre').value.trim();
      var msg      = document.getElementById('authMensajeError');

      var passMsg = document.getElementById('authMensajePassword');
      if (esRegistro) {
        var errores = validarPasswordLocal(password);
        if (errores.length) {
          if (passMsg) {
            passMsg.textContent = 'Falta: ' + errores.join(', ') + '.';
            passMsg.classList.remove('hidden');
          }
          document.getElementById('inputPassword').focus();
          return;
        }
        if (passMsg) { passMsg.classList.add('hidden'); }
      }

      var endpoint = esRegistro ? '/registro' : '/login';
      var payload  = esRegistro ? { nombre: nombre, email: email, password: password }
                              : { email: email, password: password };

      fetch(API_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok) {
            msg.textContent = res.d.error || 'Error en la autenticacion';
            msg.classList.remove('hidden');
            return;
          }
          localStorage.setItem('usuarioTransmiFlowReal', JSON.stringify(res.d.usuario));
          localStorage.setItem(TOKEN_KEY, res.d.token || '');
          // Volver al modo ingreso: si se queda en registro, un nuevo
          // intento de entrada vuelve a registrar el correo
          if (esRegistro) { alternarModoAuth(); }
          verificarAcceso();
          actualizarNotifBadge();
        })
        .catch(function () {
          msg.textContent = 'No se pudo conectar con el servidor';
          msg.classList.remove('hidden');
        });
    }

    /** Ingreso del operador: credenciales propias + codigo */
    function procesarAuthOperador(event) {
      event.preventDefault();
      var email    = document.getElementById('opInputEmail').value.trim();
      var password = document.getElementById('opInputPassword').value.trim();
      var codigo   = document.getElementById('opInputCodigo').value.trim();
      var msg      = document.getElementById('authMensajeErrorOperador');

      if (!email || !password || !codigo) {
        msg.textContent = 'Completa correo, contrasena y codigo de autenticacion.';
        msg.classList.remove('hidden');
        return;
      }

      fetch(API_URL + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password, codigo: codigo })
      })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (!res.ok) {
            msg.textContent = res.d.error || 'Error en la autenticacion';
            msg.classList.remove('hidden');
            return;
          }
          localStorage.setItem('usuarioTransmiFlowReal', JSON.stringify(res.d.usuario));
          localStorage.setItem(TOKEN_KEY, res.d.token || '');
          verificarAcceso();
          actualizarNotifBadge();
        })
        .catch(function () {
          msg.textContent = 'No se pudo conectar con el servidor';
          msg.classList.remove('hidden');
        });
    }

    function verificarAcceso() {
      var usuario = localStorage.getItem('usuarioTransmiFlowReal');
      document.getElementById('vistaAuth').classList.toggle('hidden', !!usuario);
      document.getElementById('appContenido').classList.toggle('hidden', !usuario);
      if (!usuario) { cargarGoogle(); }
      document.getElementById('navPrincipal').classList.toggle('sin-sesion', !usuario);
      document.getElementById('navMovil').classList.toggle('sin-sesion', !usuario);

      if (usuario) {
        var u = JSON.parse(usuario);
        document.getElementById('headerAcciones').innerHTML =
          '<div class="flex items-center gap-2 sm:gap-3">' +
            '<div class="relative shrink-0">' +
              '<button id="btnNotificaciones" onclick="togglePanelNotificaciones()" class="relative p-2.5 bg-brand-dark border border-brand-border text-slate-300 text-xs font-bold rounded-xl hover:border-brand-red">' +
                '<i data-lucide="bell" class="w-4 h-4"></i>' +
                '<span id="notifBadge" class="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-0.5 flex items-center justify-center bg-brand-red text-white text-[10px] font-black rounded-full hidden">0</span>' +
              '</button>' +
              '<div id="panelNotificaciones" class="hidden absolute right-0 mt-2 w-80 bg-brand-card border border-brand-border rounded-xl shadow-2xl z-[600] max-h-80 overflow-y-auto">' +
                '<div class="flex items-center justify-between px-3 py-2.5 border-b border-brand-border">' +
                  '<p class="text-xs font-black text-white">Notificaciones</p>' +
                  '<button onclick="marcarNotificacionesLeidas()" class="text-[10px] text-brand-red font-bold">Marcar leidas</button>' +
                '</div>' +
                '<div id="listaNotifPanel" class="p-2 max-h-64 overflow-y-auto"><p class="text-[11px] text-slate-400 text-center py-4">Sin notificaciones.</p></div>' +
              '</div>' +
            '</div>' +
            '<span class="hidden sm:block text-xs text-white font-bold truncate max-w-[120px] lg:max-w-none">' + escHtml(u.nombre) + '</span>' +
            '<span class="px-2.5 sm:px-3 py-1.5 bg-brand-dark border border-brand-border text-slate-300 text-[10px] font-bold rounded-xl uppercase">' + escHtml(u.rol || 'usuario') + '</span>' +
            '<button onclick="cerrarSesion()" class="px-2.5 sm:px-3 py-2 bg-brand-dark border border-brand-border text-slate-300 text-xs font-bold rounded-xl">Salir</button>' +
          '</div>';
        var esOperario = (u.rol === 'operario');
        if (esOperario) { cambiarSeccion('operadores'); }
        else { cambiarSeccion('estaciones'); }

        var btnOpDesktop = document.getElementById('nav-operadores');
        var btnOpMovil = document.getElementById('mnav-operadores');
        var btnMapa = document.getElementById('nav-estaciones');
        var btnAlertas = document.getElementById('nav-alertas');
        var btnReportes = document.getElementById('nav-reportes');
        var btnMapaMovil = document.getElementById('mnav-estaciones');
        var btnAlertasMovil = document.getElementById('mnav-alertas');
        var btnReportesMovil = document.getElementById('mnav-reportes');

        // Solo el operario tiene acceso al apartado de Operario
        if (btnOpDesktop) { btnOpDesktop.classList.toggle('hidden', !esOperario); }
        if (btnOpMovil) { btnOpMovil.classList.toggle('hidden', !esOperario); }

        // El usuario ciudadano solo ve sus apartados
        if (btnMapa) { btnMapa.classList.toggle('hidden', esOperario); }
        if (btnAlertas) { btnAlertas.classList.toggle('hidden', esOperario); }
        if (btnReportes) { btnReportes.classList.toggle('hidden', esOperario); }
        if (btnMapaMovil) { btnMapaMovil.classList.toggle('hidden', esOperario); }
        if (btnAlertasMovil) { btnAlertasMovil.classList.toggle('hidden', esOperario); }
        if (btnReportesMovil) { btnReportesMovil.classList.toggle('hidden', esOperario); }

        cargarEstaciones();
        if (!esOperario) { iniciarGPS(); }
      }
      actualizarIconos();
    }

    function cerrarSesion() {
      localStorage.removeItem('usuarioTransmiFlowReal');
      localStorage.removeItem(TOKEN_KEY);
      // Limpiar el nombre y los botones del encabezado al salir
      var header = document.getElementById('headerAcciones');
      if (header) { header.innerHTML = ''; }
      var panel = document.getElementById('panelNotificaciones');
      if (panel) { panel.classList.add('hidden'); }
      if (idWatch !== null) { navigator.geolocation.clearWatch(idWatch); idWatch = null; }
      verificarAcceso();
    }

    // ==========================================================
    // ARRANQUE
    // ==========================================================
    window.addEventListener('load', function () {
      verificarConexion();
      var usuario = localStorage.getItem('usuarioTransmiFlowReal');
      var token = localStorage.getItem(TOKEN_KEY) || '';

      function iniciar() {
        verificarAcceso();
        if (localStorage.getItem('usuarioTransmiFlowReal')) { actualizarNotifBadge(); }
      }

      if (usuario && token) {
        // Validar token contra el servidor; si no sirve, limpiar sesion
        fetch(API_URL + '/notificaciones', { headers: { Authorization: 'Bearer ' + token } })
          .then(function (r) {
            if (!r.ok) { throw new Error('Sesion vencida'); }
            iniciar();
          })
          .catch(function () {
            localStorage.removeItem('usuarioTransmiFlowReal');
            localStorage.removeItem(TOKEN_KEY);
            iniciar();
          });
      } else {
        iniciar();
      }

      if (window.__timerConexion) { clearInterval(window.__timerConexion); }
      window.__timerConexion = setInterval(verificarConexion, 30000);
      if (window.__timerAlertas) { clearInterval(window.__timerAlertas); }
      window.__timerAlertas = setInterval(function () {
        if (localStorage.getItem('usuarioTransmiFlowReal')) { actualizarNotifBadge(); }
      }, 60000);
    });
