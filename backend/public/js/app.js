    // ==========================================================
    // NAVEGACION
    // ==========================================================
    function cambiarSeccion(id) {
      ['estaciones', 'alertas', 'reportes'].forEach(function (s) {
        document.getElementById('sec-' + s).classList.toggle('hidden', s !== id);
      });
      if (id === 'estaciones') setTimeout(initMap, 80);
      if (id === 'reportes')  cargarReportes();
      if (id === 'alertas')   cargarAlertas();
      actualizarIconos();
    }
    function irAMapa()      { cambiarSeccion('estaciones'); }
    function irAAertas()    { cambiarSeccion('alertas'); }
    function irAReportes()  { cambiarSeccion('reportes'); }

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
                   '<p class="text-[11px] text-slate-400 truncate">' + quien + ' &middot; ' + cuando + '</p>' +
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
      if (!est) {
        mostrarMensajeReporte('Escribe el nombre de la estacion', 'error');
        campo.focus();
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

    /** Autocompletado de estaciones al escribir */
    function sugerirEstaciones() {
      var texto = document.getElementById('repEstacion').value.trim();
      var caja  = document.getElementById('repSugerencias');
      if (!caja) return;

      if (texto.length < 2) { caja.classList.add('hidden'); return; }

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
    }

    // ==========================================================
    // ALERTAS (se construyen con los reportes de las ultimas 24h)
    // ==========================================================
    function cargarAlertas() {
      var cont = document.getElementById('listaAlertas');
      if (!cont) return;

      return fetch(API_URL + '/niveles?horas=24')
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (niveles) {
          var altas = niveles.filter(function (n) { return n.nivel === 'Alta'; });
          var medias = niveles.filter(function (n) { return n.nivel === 'Media'; });

          if (!altas.length && !medias.length) {
            cont.innerHTML =
              '<div class="p-5 bg-brand-card border border-emerald-500/30 rounded-2xl flex gap-3 items-start">' +
              '<i data-lucide="check-circle" class="w-6 h-6 text-emerald-400 shrink-0"></i>' +
              '<div><h4 class="text-white font-bold text-sm">Sin alertas en este momento</h4>' +
              '<p class="text-xs text-slate-400 mt-1">Ninguna estacion reporta ocupacion alta en las ultimas 24 horas.</p></div></div>';
            actualizarIconos();
            return;
          }

          function tarjeta(n, color, icono, titulo) {
            return '<div class="p-4 bg-brand-card border rounded-2xl flex gap-3 items-start" style="border-color:' + color + '55">' +
              '<i data-lucide="' + icono + '" class="w-6 h-6 shrink-0" style="color:' + color + '"></i>' +
              '<div class="min-w-0">' +
                '<h4 class="text-white font-bold text-sm break-words">' + titulo + '</h4>' +
                '<p class="text-xs text-slate-400 mt-1 break-words">' +
                  escHtml(n.estacion) + ' - ' + tiempoRelativo(n.creado_en) +
                  (n.usuario ? ' por ' + escHtml(n.usuario.split('@')[0]) : '') +
                '</p>' +
              '</div></div>';
          }

          var html = altas.map(function (n) {
            return tarjeta(n, '#ef4444', 'alert-triangle', 'Alta afluencia');
          }).join('') + medias.map(function (n) {
            return tarjeta(n, '#f59e0b', 'alert-circle', 'Ocupacion moderada');
          }).join('');

          cont.innerHTML = html;
          actualizarIconos();
        })
        .catch(function (err) {
          cont.innerHTML = '<p class="text-xs text-red-400 text-center py-6">' +
            'No se pudieron cargar las alertas.<br>' +
            '<span class="text-slate-500">' + escHtml(err.message) + '</span></p>';
        });
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
    }

    function procesarAuth(event) {
      event.preventDefault();
      var email    = document.getElementById('inputEmail').value.trim();
      var password = document.getElementById('inputPassword').value.trim();
      var nombre   = document.getElementById('inputNombre').value.trim();
      var msg      = document.getElementById('authMensajeError');

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
          verificarAcceso();
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
      document.getElementById('navPrincipal').classList.toggle('sin-sesion', !usuario);
      document.getElementById('navMovil').classList.toggle('sin-sesion', !usuario);

      if (usuario) {
        var u = JSON.parse(usuario);
        document.getElementById('headerAcciones').innerHTML =
          '<div class="flex items-center gap-2 sm:gap-3">' +
            '<span class="hidden sm:block text-xs text-white font-bold truncate max-w-[120px] lg:max-w-none">' + escHtml(u.nombre) + '</span>' +
            '<button onclick="cerrarSesion()" class="px-2.5 sm:px-3 py-2 bg-brand-dark border border-brand-border text-slate-300 text-xs font-bold rounded-xl">Salir</button>' +
          '</div>';
        cambiarSeccion('estaciones');
        cargarEstaciones();
        iniciarGPS();
      }
      actualizarIconos();
    }

    function cerrarSesion() {
      localStorage.removeItem('usuarioTransmiFlowReal');
      if (idWatch !== null) { navigator.geolocation.clearWatch(idWatch); idWatch = null; }
      verificarAcceso();
    }

    // ==========================================================
    // ARRANQUE
    // ==========================================================
    window.addEventListener('load', verificarAcceso);
