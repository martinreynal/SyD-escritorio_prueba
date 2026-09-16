/**
 * MODO REVISIÓN — herramienta interna para mostrarle al cliente qué partes
 * del sistema funcionan de verdad y cuáles siguen siendo la maqueta.
 *
 * NO forma parte del producto. Sólo se carga si la dirección termina en
 * `?revision=1`; en el sitio normal este archivo ni se pide. Para sacarlo el
 * día de la entrega: borrar este archivo y el bloque de tres líneas que lo
 * carga al final de index.html.
 *
 * Cómo se usa: abrir la web con ?revision=1 al final de la dirección. Aparece
 * un cartel arriba de cada pantalla diciendo en qué estado está, y una ficha
 * abajo a la derecha con el resumen completo.
 */
(function () {
  "use strict";

  // ── Qué es qué ────────────────────────────────────────────────────────
  // estado: "real"      → conectado a la base de datos, los datos son ciertos
  //         "mixto"     → una parte funciona y otra sigue siendo maqueta
  //         "maqueta"   → datos inventados, no está conectado
  //         "informativa" → texto fijo, no depende de datos
  var PANTALLAS = [
    {
      sel: "#screen-home",
      estado: "real",
      titulo: "Crear cuenta e iniciar sesión",
      nota: "Con mail y contraseña o con Google. Las cuentas se guardan de verdad y los mails salen de verdad.",
    },
    {
      sel: "#screen-admin",
      estado: "real",
      titulo: "Panel de administración",
      nota: "Sus cinco secciones trabajan contra la base de datos: Sueños, Solicitudes, CRM, Fundaciones y Eventos. Sueños muestra los tres momentos del recorrido: revisar el contenido, esperar el pago del fee y verificar el comprobante. Las pestañas Tablero y Finanzas de la maqueta se sacaron: mostraban cifras inventadas.",
    },
    {
      sel: "#screen-fundaciones",
      estado: "real",
      titulo: "Conocé las fundaciones",
      nota: "Muestra las fundaciones que se cargan en el panel, rama Donaciones. El buscador también busca entre ellas. Donar no pregunta el monto: lleva directo a la forma de cobro de la fundación (su página si es un link, o los datos para transferir si es un alias o un CBU).",
    },
    {
      sel: "#screen-eventos",
      estado: "real",
      titulo: "Actividades y eventos",
      nota: "Los eventos se cargan desde el panel. Anotarse pide confirmar dos veces, como pidió el cliente, y los dos pasos quedan registrados por separado en la base. Si el evento tiene entrada, al confirmar muestra cómo pagarle a la fundación.",
    },
    {
      sel: "#screen-aporte",
      estado: "mixto",
      titulo: "Contar tu sueño",
      nota: "Publicar un sueño es real: queda esperando la revisión del administrador, y lo que escribís no se pierde si tenés que iniciar sesión para publicarlo. Después, desde “Mis sueños” en el perfil, se ve en qué quedó y se paga el fee de $20.000 subiendo el comprobante. Las otras formas de aportar (voluntariado, materiales, servicios) siguen siendo maqueta y no estaban en el pedido.",
    },
    {
      sel: "#screen-registro",
      estado: "mixto",
      titulo: "Registro",
      nota: "Cuando una fundación pide sumarse, queda como solicitud real en el panel. El resto de los formularios de alta es maqueta.",
    },
    {
      sel: "#screen-deseos",
      estado: "maqueta",
      titulo: "Subastas activas",
      nota: "Las subastas que se ven acá y sus ofertas son inventadas. El motor está construido y probado del lado del servidor, incluido el control de que dos ofertas simultáneas nunca se pisen, y el cobro del fee ya funciona de punta a punta. Falta conectar esta pantalla y la de ofertar.",
    },
    {
      sel: "#screen-subastas",
      estado: "maqueta",
      titulo: "Otros sueños / próximos",
      nota: "Datos inventados. Se conecta junto con la pantalla de subastas.",
    },
    {
      sel: "#screen-garantia",
      estado: "maqueta",
      titulo: "Hacer una oferta",
      nota: "Ofertar todavía no está conectado. Es lo último que queda del pedido.",
    },
    {
      sel: "#screen-apoyo",
      estado: "maqueta",
      titulo: "Tu impacto / Mis apoyos",
      nota: "Cifras inventadas. No estaba en el pedido de requerimientos.",
    },
    {
      sel: "#screen-avisos",
      estado: "maqueta",
      titulo: "Novedades",
      nota: "Avisos inventados. No estaba en el pedido de requerimientos.",
    },
    {
      sel: "#screen-comunidad",
      estado: "maqueta",
      titulo: "Comunidad",
      nota: "No estaba en el pedido de requerimientos.",
    },
    {
      sel: "#screen-stats",
      estado: "maqueta",
      titulo: "Estadísticas",
      nota: "No estaba en el pedido de requerimientos.",
    },
    {
      sel: "#screen-fsubastas",
      estado: "maqueta",
      titulo: "Panel de fundación",
      nota: "Modo en el que cada fundación entra con su propia cuenta. No estaba en el pedido de requerimientos.",
    },
    {
      sel: "#screen-nosotros",
      estado: "informativa",
      titulo: "Sobre nosotros",
      nota: "Texto fijo. No depende de ningún dato.",
    },
  ];

  // Datos sueltos dentro de la portada: son números chicos, no pantallas, así
  // que se marcan con una etiqueta al lado en vez de un cartel arriba.
  var DATOS = [
    { sel: "#datoSubastas", estado: "maqueta", nota: "Cuenta sueños inventados." },
    { sel: "#datoLotes", estado: "maqueta", nota: "Cuenta sueños inventados." },
    { sel: "#datoEventos", estado: "maqueta", nota: "Cuenta los eventos de la maqueta, no los reales." },
    { sel: "#datoFund", estado: "maqueta", nota: "Cuenta las fundaciones de la maqueta, no las reales." },
  ];

  var COLORES = {
    real: { fondo: "#0f3d2e", borde: "#34d399", texto: "#a7f3d0", rotulo: "FUNCIONA DE VERDAD" },
    mixto: { fondo: "#3d340f", borde: "#fbbf24", texto: "#fde68a", rotulo: "A MEDIAS" },
    maqueta: { fondo: "#3d1a1a", borde: "#f87171", texto: "#fecaca", rotulo: "MAQUETA — DATOS INVENTADOS" },
    informativa: { fondo: "#1a2a3d", borde: "#60a5fa", texto: "#bfdbfe", rotulo: "INFORMATIVA" },
  };

  function estilos() {
    var css = document.createElement("style");
    css.textContent = [
      ".rev-cartel{position:relative;z-index:60;margin:0;padding:10px 14px;font:600 12.5px/1.45 system-ui,sans-serif;" +
        "border-bottom:2px solid;letter-spacing:.2px}",
      ".rev-cartel b{display:block;font-size:11px;letter-spacing:1.2px;margin-bottom:3px}",
      ".rev-cartel span{font-weight:500;opacity:.92}",
      ".rev-chip{display:inline-block;margin-left:6px;padding:1px 7px;border-radius:99px;" +
        "font:700 9.5px/1.6 system-ui,sans-serif;letter-spacing:.6px;vertical-align:middle;" +
        "background:#3d1a1a;color:#fecaca;border:1px solid #f87171}",
      ".rev-ficha{position:fixed;right:14px;bottom:14px;z-index:99999;width:310px;max-width:calc(100vw - 28px);" +
        "max-height:70vh;overflow:auto;background:#0b1220;color:#e5e7eb;border:1px solid #334155;" +
        "border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.55);font:13px/1.5 system-ui,sans-serif}",
      ".rev-ficha h4{margin:0;padding:12px 14px;font-size:13px;border-bottom:1px solid #1f2937;" +
        "display:flex;align-items:center;justify-content:space-between;gap:8px}",
      ".rev-ficha button{background:#1f2937;color:#e5e7eb;border:0;border-radius:8px;padding:4px 9px;" +
        "font:600 11px system-ui,sans-serif;cursor:pointer}",
      ".rev-ficha ul{list-style:none;margin:0;padding:8px 0}",
      ".rev-ficha li{padding:7px 14px;display:flex;gap:9px;align-items:flex-start}",
      ".rev-ficha i{flex:none;width:9px;height:9px;border-radius:99px;margin-top:5px}",
      ".rev-ficha li div{min-width:0}",
      ".rev-ficha li b{display:block;font-size:12.5px;font-weight:600}",
      ".rev-ficha li em{font-style:normal;font-size:11.5px;color:#94a3b8}",
      ".rev-ficha .rev-pie{padding:10px 14px;border-top:1px solid #1f2937;font-size:11.5px;color:#94a3b8}",
      "body.rev-oculto .rev-cartel,body.rev-oculto .rev-chip{display:none}",
    ].join("\n");
    document.head.appendChild(css);
  }

  function ponerCarteles() {
    PANTALLAS.forEach(function (p) {
      var el = document.querySelector(p.sel);
      if (!el || el.querySelector(":scope > .rev-cartel")) return;
      var c = COLORES[p.estado];
      var cartel = document.createElement("div");
      cartel.className = "rev-cartel";
      cartel.style.background = c.fondo;
      cartel.style.borderColor = c.borde;
      cartel.style.color = c.texto;
      cartel.innerHTML =
        "<b>" + c.rotulo + " · " + p.titulo.toUpperCase() + "</b><span>" + p.nota + "</span>";
      el.insertBefore(cartel, el.firstChild);
    });
  }

  // Los números de la portada se vuelven a dibujar solos, así que las
  // etiquetas se reponen cada tanto en vez de ponerse una sola vez.
  function ponerEtiquetas() {
    DATOS.forEach(function (d) {
      var el = document.querySelector(d.sel);
      if (!el || el.querySelector(".rev-chip")) return;
      var chip = document.createElement("span");
      chip.className = "rev-chip";
      chip.textContent = "MAQUETA";
      chip.title = d.nota;
      el.appendChild(chip);
    });
  }

  function ficha() {
    var caja = document.createElement("div");
    caja.className = "rev-ficha";
    var orden = { real: 0, mixto: 1, maqueta: 2, informativa: 3 };
    var lista = PANTALLAS.slice().sort(function (a, b) {
      return orden[a.estado] - orden[b.estado];
    });
    var cuenta = { real: 0, mixto: 0, maqueta: 0, informativa: 0 };
    lista.forEach(function (p) { cuenta[p.estado]++; });

    caja.innerHTML =
      "<h4><span>Modo revisión</span>" +
      '<button id="revOcultar">Ocultar marcas</button></h4>' +
      "<ul>" +
      lista
        .map(function (p) {
          var c = COLORES[p.estado];
          return (
            '<li><i style="background:' + c.borde + '"></i><div><b>' +
            p.titulo + "</b><em>" + c.rotulo.toLowerCase() + " — " + p.nota + "</em></div></li>"
          );
        })
        .join("") +
      "</ul>" +
      '<div class="rev-pie">' +
      cuenta.real + " pantallas funcionando · " + cuenta.mixto + " a medias · " +
      cuenta.maqueta + " de maqueta · " + cuenta.informativa + " informativa.<br>" +
      "Esta ficha solo aparece con <b>?revision=1</b> en la dirección." +
      "</div>";
    document.body.appendChild(caja);

    document.getElementById("revOcultar").addEventListener("click", function () {
      var oculto = document.body.classList.toggle("rev-oculto");
      this.textContent = oculto ? "Mostrar marcas" : "Ocultar marcas";
    });
  }

  estilos();
  ponerCarteles();
  ponerEtiquetas();
  ficha();
  setInterval(function () {
    ponerCarteles();
    ponerEtiquetas();
  }, 1200);
})();
