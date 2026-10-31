// gustavoquintero.dev: menú, barra adaptable, mapa del sistema, pestañas,
// filtros del stack y revelado de secciones.
(() => {
  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menú móvil ---------- */
  const menu = document.getElementById('menu');
  const menuBoton = document.getElementById('menuBoton');
  const cerrarMenu = () => {
    menu.classList.remove('abierto');
    menuBoton.setAttribute('aria-expanded', 'false');
  };
  menuBoton.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    menuBoton.setAttribute('aria-expanded', String(abierto));
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', cerrarMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarMenu(); });

  /* ---------- Barra: oscura sobre secciones noche, clara sobre el resto ---------- */
  const barra = document.getElementById('barra');
  const oscuras = document.querySelectorAll('.portada, .seccion--noche, .contacto');
  const actualizarBarra = () => {
    const y = 40;
    const sobreOscura = [...oscuras].some((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= y && r.bottom >= y;
    });
    barra.classList.toggle('clara', !sobreOscura);
  };

  /* ---------- Enlace del menú de la sección actual ---------- */
  const enlaces = [...menu.querySelectorAll('a[href^="#"]')];
  const secciones = enlaces.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const actualizarActual = () => {
    let actual = null;
    secciones.forEach((s) => { if (s.getBoundingClientRect().top <= 140) actual = s; });
    enlaces.forEach((a) => a.classList.toggle('actual', actual && a.getAttribute('href') === '#' + actual.id));
  };

  let pendiente = false;
  const alDesplazar = () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => { actualizarBarra(); actualizarActual(); pendiente = false; });
  };
  window.addEventListener('scroll', alDesplazar, { passive: true });
  actualizarBarra();
  actualizarActual();

  /* ---------- Mapa del sistema ---------- */
  const detalle = document.querySelector('.sistema__detalle');
  const capa = document.getElementById('sistemaCapa');
  const texto = document.getElementById('sistemaTexto');
  const nodos = document.querySelectorAll('.nodo');
  const mostrarNodo = (nodo) => {
    if (nodo.classList.contains('activo')) return;
    nodos.forEach((n) => n.classList.toggle('activo', n === nodo));
    capa.textContent = nodo.dataset.capa;
    texto.textContent = nodo.dataset.detalle;
    detalle.classList.remove('cambio');
    void detalle.offsetWidth;
    detalle.classList.add('cambio');
  };
  nodos.forEach((nodo) => {
    nodo.addEventListener('mouseenter', () => mostrarNodo(nodo));
    nodo.addEventListener('focus', () => mostrarNodo(nodo));
    nodo.addEventListener('click', () => mostrarNodo(nodo));
  });

  /* ---------- Pestañas accesibles (qué hago y productos) ---------- */
  document.querySelectorAll('[data-pestanas]').forEach((grupo) => {
    const tabs = [...grupo.querySelectorAll('[role="tab"]')];
    const activar = (tab, enfocar) => {
      tabs.forEach((t) => {
        const elegido = t === tab;
        t.setAttribute('aria-selected', String(elegido));
        t.tabIndex = elegido ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !elegido;
      });
      if (enfocar) tab.focus();
    };
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => activar(tab, false));
      tab.addEventListener('keydown', (e) => {
        const teclas = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        if (e.key in teclas) {
          e.preventDefault();
          activar(tabs[(i + teclas[e.key] + tabs.length) % tabs.length], true);
        } else if (e.key === 'Home') { e.preventDefault(); activar(tabs[0], true); }
        else if (e.key === 'End') { e.preventDefault(); activar(tabs[tabs.length - 1], true); }
      });
    });
  });

  /* ---------- Filtros del stack ---------- */
  const filtros = document.querySelectorAll('[data-filtro]');
  const chips = document.querySelectorAll('#chips li');
  filtros.forEach((boton) => {
    boton.addEventListener('click', () => {
      const area = boton.dataset.filtro;
      filtros.forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
      chips.forEach((chip) => chip.classList.toggle('atenuado', area !== 'todo' && chip.dataset.area !== area));
    });
  });

  /* ---------- Revelado al entrar en pantalla ---------- */
  const revelables = document.querySelectorAll('.revelar');
  if (reducirMovimiento || !('IntersectionObserver' in window)) {
    revelables.forEach((el) => el.classList.add('visible'));
  } else {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visible');
          observador.unobserve(entrada.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revelables.forEach((el) => observador.observe(el));
  }

  /* ---------- Visor de certificados ---------- */
  const visor = document.getElementById('visorPdf');
  if (visor) {
    const marco = visor.querySelector('iframe');
    const cerrarVisor = () => { visor.close(); marco.src = 'about:blank'; };
    document.querySelectorAll('.cert-card__pdf').forEach((boton) => {
      boton.addEventListener('click', () => {
        marco.src = boton.dataset.pdf;
        visor.showModal();
      });
    });
    visor.querySelector('.visor-pdf__cerrar').addEventListener('click', cerrarVisor);
    visor.addEventListener('click', (e) => { if (e.target === visor) cerrarVisor(); });
    visor.addEventListener('close', () => { marco.src = 'about:blank'; });
  }

  document.getElementById('anio').textContent = new Date().getFullYear();
})();
