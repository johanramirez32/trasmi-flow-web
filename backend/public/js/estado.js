    const API_URL = '/api';

    // Diagnostico visible
    window.onerror = function (msg, archivo, linea) {
      var caja = document.getElementById('errorBox');
      var texto = document.getElementById('errorText');
      if (caja && texto) {
        texto.textContent = msg + '  (linea ' + linea + ')';
        caja.classList.remove('hidden');
      }
      return false;
    };

    // ==========================================================
    // ESTADO
    // ==========================================================
    var estaciones = [];      // catalogo completo desde PostgreSQL
    var userPos = null;       // {lat, lng}
    var seleccion = null;     // estacion seleccionada en la busqueda
    var map = null, capaMarcadores = null, marcadorUsuario = null;
    var circuloCerca = null, lineaRuta = null, idWatch = null;
    var CANTIDAD_CERCANAS = 5;
    var COLOR_AGLOMERACION = { 'Baja': '#22c55e', 'Media': '#f59e0b', 'Alta': '#ef4444' };

    // ==========================================================
    // UTILIDADES
    // ==========================================================
    /** Escapa texto para insertarlo con innerHTML sin romper el HTML */
    function escHtml(texto) {
      return String(texto == null ? '' : texto)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    /** "hace 3 min", "hace 2 h", "ayer" */
    function tiempoRelativo(fecha) {
      if (!fecha) return 'hace un momento';
      var d = new Date(fecha);
      if (isNaN(d.getTime())) return 'hace un momento';

      var segundos = Math.floor((Date.now() - d.getTime()) / 1000);
      if (segundos < 60)    return 'hace un momento';
      if (segundos < 3600)  return 'hace ' + Math.floor(segundos / 60) + ' min';
      if (segundos < 86400) return 'hace ' + Math.floor(segundos / 3600) + ' h';
      if (segundos < 172800) return 'ayer';

      return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) +
             ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    // ==========================================================
    // UTILIDADES
    // ==========================================================
    function distanciaKM(lat1, lon1, lat2, lon2) {
      var R = 6371, rad = Math.PI / 180;
      var dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad;
      var a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function nivelTexto(n) { return n || 'Media'; }

    function iconoEstacion(est) {
      var color = COLOR_AGLOMERACION[nivelTexto(est.aglomeracion)] || COLOR_AGLOMERACION['Media'];
      return L.divIcon({
        className: '',
        html: '<div style="width:16px;height:16px;border-radius:50%;background:' + color +
              ';border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.6)"></div>',
        iconSize: [16, 16], iconAnchor: [8, 8]
      });
    }

    function iconoUsuario() {
      return L.divIcon({
        className: 'user-pulse-marker',
        html: '<div style="width:18px;height:18px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.6)"></div>',
        iconSize: [18, 18], iconAnchor: [9, 9]
      });
    }
