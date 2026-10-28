/**
 * Coreografía de movimiento con GSAP + ScrollTrigger.
 *
 * Cada animación tiene un motivo:
 * - [data-iluminar] el texto se enciende palabra por palabra al leerlo.
 * - [data-linea]    titulares que suben por línea: marcan jerarquía.
 * - [data-reveal]   bloques que entran al llegar al viewport.
 * - [data-zoom]     fotos que se asientan / se desplazan con profundidad.
 * - [data-paneo]    galería horizontal fijada en escritorio, con el fondo
 *                   de color fluyendo.
 * - [data-semana]   fines de semana: ruta por los días de la semana; al
 *                   llegar al sábado se entra al día (clip-path desde su
 *                   ventana) y luego se cambia al domingo.
 *
 * Con `prefers-reduced-motion` no se carga GSAP y todo queda visible.
 */

let iniciado = false;

function mostrarTodo(): void {
  document.documentElement.classList.remove('js');
}

export async function iniciarAnimaciones(): Promise<void> {
  if (iniciado) return;
  iniciado = true;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    mostrarTodo();
    return;
  }

  // Páginas sin coreografía (p. ej. /menu): no se descarga GSAP (~46 KB gz).
  const ganchos =
    '[data-reveal],[data-titular],[data-iluminar],[data-zoom],[data-hero],[data-carrusel-escena],[data-semana],[data-paneo]';
  if (!document.querySelector(ganchos)) {
    mostrarTodo();
    return;
  }

  let gsap: typeof import('gsap').gsap;
  let ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
  try {
    [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
  } catch {
    mostrarTodo();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  // En móvil la barra del navegador cambia la altura: no recalcular por eso.
  ScrollTrigger.config({ ignoreMobileResize: true });
  const suave = 'expo.out';
  const enHero = (el: Element) => el.closest('#inicio') !== null;
  // Llegada desde otra página del sitio: el hero no repite su entrada (el
  // CSS ya lo muestra armado; ver BaseLayout.astro).
  const sinEntrada = document.documentElement.classList.contains('sin-entrada');

  // Texto que se ilumina con el scroll (scrub: avanza y retrocede con el lector).
  gsap.utils.toArray<HTMLElement>('[data-iluminar]').forEach((bloque) => {
    gsap.to(bloque.querySelectorAll('.palabra'), {
      opacity: 1,
      ease: 'none',
      stagger: 0.06,
      scrollTrigger: { trigger: bloque, start: 'top 80%', end: 'bottom 50%', scrub: 0.4 },
    });
  });

  // Entradas de una sola vez (titulares y bloques): IntersectionObserver en
  // lugar de ScrollTrigger. Son ~40 elementos; así ScrollTrigger no tiene que
  // medirlos en cada refresh (era la tarea larga principal en móvil).
  // rootMargin -12/-15 % ≈ los antiguos start "top 88%" / "top 85%".
  const alEntrar = (margen: string) => {
    const acciones = new Map<Element, () => void>();
    const io = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((e) => {
          // Entra al cruzar la línea o si ya quedó arriba (recarga a media página).
          if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
          io.unobserve(e.target);
          acciones.get(e.target)?.();
          acciones.delete(e.target);
        }),
      { rootMargin: `0px 0px ${margen} 0px` },
    );
    return (el: Element, accion: () => void) => {
      acciones.set(el, accion);
      io.observe(el);
    };
  };
  const alEntrarTitular = alEntrar('-15%');
  const alEntrarBloque = alEntrar('-12%');

  // Titulares por línea.
  gsap.utils.toArray<HTMLElement>('[data-titular]').forEach((titular) => {
    if (sinEntrada && enHero(titular)) return;
    const lineas = titular.querySelectorAll('[data-linea]');
    const animar = () =>
      gsap.to(lineas, {
        yPercent: 0,
        y: 0,
        duration: 1.3,
        ease: suave,
        stagger: 0.11,
        delay: enHero(titular) ? 0.2 : 0,
      });
    if (enHero(titular)) animar();
    else alEntrarTitular(titular, animar);
  });

  // Bloques que entran.
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    // Los del hero entran por CSS (global.css), sin esperar a GSAP.
    if (enHero(el)) return;
    const orden = Number(el.dataset.reveal || 0) * 0.1;
    alEntrarBloque(el, () =>
      gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: suave, delay: orden }),
    );
  });

  // Fotos con profundidad: se asientan al entrar y flotan con el scroll.
  gsap.utils.toArray<HTMLElement>('[data-zoom]').forEach((foto) => {
    const marco = foto.parentElement ?? foto;
    if (enHero(foto)) {
      if (!sinEntrada) gsap.fromTo(foto, { scale: 1.18 }, { scale: 1.1, duration: 2.4, ease: suave });
      gsap.to(foto, {
        yPercent: 4,
        ease: 'none',
        scrollTrigger: { trigger: marco, start: 'top top', end: 'bottom top', scrub: true },
      });
    } else {
      gsap.fromTo(
        foto,
        { scale: 1.18, yPercent: -6 },
        {
          scale: 1.05,
          yPercent: 6,
          ease: 'none',
          scrollTrigger: { trigger: marco, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    }
  });

  const mm = gsap.matchMedia();

  // Hero (todas las pantallas): la frase entra pieza por pieza y, al bajar,
  // la ventana del jardín crece hasta llenar la pantalla. Va antes que las
  // demás escenas fijadas porque es la primera en la página.
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const portal = hero?.querySelector<HTMLElement>('[data-hero-portal]');
  const ventana = hero?.querySelector<HTMLElement>('[data-hero-ventana]');
  const marco = ventana?.querySelector<HTMLElement>('.ventana-marco');
  const contenido = hero?.querySelector<HTMLElement>('[data-hero-contenido]');
  // La entrada de la frase (pieza por pieza) es CSS: ver global.css.
  if (hero && portal && ventana && marco && contenido) {
    // Recorte del patio a la medida de la ventana (la máscara exterior no se
    // transforma, así que mide bien aunque la pieza esté entrando).
    const desdeVentana = () => {
      const h = hero.getBoundingClientRect();
      const r = ventana.getBoundingClientRect();
      const estilo = getComputedStyle(ventana);
      const ancho = marco.offsetWidth;
      const alto = marco.offsetHeight;
      const arriba = r.top - h.top + parseFloat(estilo.paddingTop);
      const izquierda = r.left - h.left + parseFloat(estilo.paddingLeft);
      const radio = parseFloat(getComputedStyle(marco).borderTopLeftRadius) || 0;
      return `inset(${arriba}px ${h.width - izquierda - ancho}px ${h.height - arriba - alto}px ${izquierda}px round ${radio}px)`;
    };
    const foto = portal.querySelector<HTMLElement>('[data-hero-portal-foto]');
    const info = portal.querySelector<HTMLElement>('[data-hero-portal-info]');
    const marca = hero.querySelector<HTMLElement>('[data-hero-marca]');
    const logo = marca?.querySelector('.hero-marca-logo') ?? null;

    gsap
      .timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
      .fromTo(portal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0)
      .fromTo(portal, { clipPath: desdeVentana }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 1, ease: 'power2.inOut' }, 0)
      .fromTo(foto, { scale: 1.3 }, { scale: 1, duration: 1, ease: 'power1.out' }, 0)
      .to(contenido, { autoAlpha: 0, y: -40, duration: 0.45 }, 0.12)
      // La marca se queda: nombre y logotipo pasan a blanco sobre el patio.
      .to(marca, { color: '#ffffff', duration: 0.25 }, 0.55)
      .fromTo(logo, { filter: 'brightness(1) invert(0)' }, { filter: 'brightness(0) invert(1)', duration: 0.25 }, 0.55)
      .fromTo(info, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.85)
      .to({}, { duration: 0.35 }, 1.2);
  }

  // Carta (móvil): carrusel vertical. La lista se fija y los platillos pasan
  // por el centro; el del centro crece, se aclara y gana sombra, los demás
  // esperan pequeños detrás. Se ajusta (snap) a un platillo por parada.
  mm.add('(max-width: 767px)', () => {
    const escena = document.querySelector<HTMLElement>('[data-carrusel-escena]');
    const carrusel = escena?.querySelector<HTMLElement>('[data-carrusel]');
    const tarjetas = carrusel ? Array.from(carrusel.querySelectorAll<HTMLElement>('[data-plato]')) : [];
    const n = tarjetas.length;
    if (!escena || !carrusel || n < 2) return;
    escena.dataset.modo = 'carrusel';
    carrusel.dataset.modo = 'carrusel';

    // Separación entre el centro y la siguiente tarjeta (la que asoma): se
    // ajusta al alto disponible y al de la tarjeta. Se mide solo al
    // refrescar (no en cada frame) para no forzar layout durante el scroll.
    // offsetHeight ignora el transform, así que medir tras pintar es seguro.
    let s = 0;
    const medir = () => {
      s = Math.min(carrusel.clientHeight * 0.4, tarjetas[0].offsetHeight * 0.74);
    };
    medir();
    // Piezas de cada tarjeta y lo último escrito: solo se toca el DOM cuando
    // un valor cambia, y solo transform/opacity (compositor, sin repintar).
    const piezas = tarjetas.map((t) => ({
      t,
      sombra: t.querySelector<HTMLElement>('.carrusel-sombra'),
      velo: t.querySelector<HTMLElement>('.carrusel-velo'),
      foto: t.querySelector<HTMLElement>('.carrusel-foto img'),
      numero: t.querySelector<HTMLElement>('.carrusel-numero'),
      previo: '',
    }));
    const pintar = (p: number) => {
      piezas.forEach((pz, i) => {
        const d = i - p;
        const a = Math.abs(d);
        const cerca = Math.min(a, 1);
        const lejos = Math.min(Math.max(a - 1, 0), 1.5);
        const y = Math.sign(d) * (cerca * s + lejos * s * 0.3);
        const escala = 1 - 0.32 * cerca - 0.1 * lejos;
        // Las vecinas son opacas (el velo las apaga): así no se transparenta
        // la de atrás. Solo se desvanecen las que ya salen.
        const opacidad = Math.max(0, 1 - lejos / 1.1);
        const foco = 1 - cerca;
        const clave = `${y.toFixed(1)}|${escala.toFixed(3)}|${opacidad.toFixed(2)}|${foco.toFixed(3)}`;
        if (clave === pz.previo) return;
        pz.previo = clave;
        pz.t.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(${escala.toFixed(4)})`;
        pz.t.style.opacity = opacidad.toFixed(2);
        const z = String(100 - Math.round(a * 10));
        if (pz.t.style.zIndex !== z) pz.t.style.zIndex = z;
        if (pz.sombra) pz.sombra.style.opacity = foco.toFixed(3);
        if (pz.velo) pz.velo.style.opacity = (0.5 * (1 - foco)).toFixed(3);
        if (pz.foto) pz.foto.style.transform = `scale(${(1.14 - 0.14 * foco).toFixed(4)})`;
        if (pz.numero) pz.numero.style.opacity = (foco * foco).toFixed(3);
      });
    };

    const estado = { p: 0 };
    pintar(0);
    gsap.to(estado, {
      p: n - 1,
      ease: 'none',
      onUpdate: () => pintar(estado.p),
      scrollTrigger: {
        trigger: escena,
        start: 'top top',
        end: () => `+=${(n - 1) * window.innerHeight * 0.5}`,
        pin: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
        onRefresh: () => {
          medir();
          pintar(estado.p);
        },
        snap: { snapTo: 1 / (n - 1), duration: { min: 0.2, max: 0.5 }, ease: 'power2.out', delay: 0.05 },
      },
    });

    return () => {
      delete escena.dataset.modo;
      delete carrusel.dataset.modo;
      piezas.forEach((pz) => {
        pz.t.style.transform = '';
        pz.t.style.opacity = '';
        pz.t.style.zIndex = '';
        [pz.sombra, pz.velo, pz.numero].forEach((el) => el?.style.removeProperty('opacity'));
        pz.foto?.style.removeProperty('transform');
        pz.previo = '';
      });
    };
  });

  // Fines de semana (todas las pantallas): la ruta recorre la semana, se entra al
  // sábado desde su ventana del calendario y después se cambia al domingo.
  // Se crea antes que la galería porque va antes en la página (orden de pins).
  mm.add('(min-width: 0px)', () => {
    const semana = document.querySelector<HTMLElement>('[data-semana]');
    const escenario = semana?.querySelector<HTMLElement>('[data-escenario]');
    const relleno = semana?.querySelector<HTMLElement>('[data-ruta-relleno]');
    if (!semana || !escenario || !relleno) return;

    const dias = Array.from(semana.querySelectorAll<HTMLElement>('[data-ruta-dia]'));
    const celdas = Array.from(semana.querySelectorAll<HTMLElement>('[data-dia-celda]'));
    const dia = (id: string) => {
      const panel = semana.querySelector<HTMLElement>(`[data-panel="${id}"]`)!;
      return {
        panel,
        foto: panel.querySelector<HTMLElement>('[data-panel-foto]')!,
        texto: [panel.querySelector('[data-panel-texto]'), panel.querySelector('[data-panel-nav]')],
        relleno: panel.querySelector<HTMLElement>('[data-dia-relleno]')!,
        ventana: semana.querySelector<HTMLElement>(`[data-ventana="${id}"]`)!,
      };
    };
    const sabado = dia('buffet');
    const domingo = dia('brunch');
    semana.dataset.modo = 'escenario';

    // Recorte que coincide con la ventana del día en el calendario.
    const desdeVentana = (ventana: HTMLElement) => () => {
      const e = escenario.getBoundingClientRect();
      const r = ventana.getBoundingClientRect();
      return `inset(${r.top - e.top}px ${e.right - r.right}px ${e.bottom - r.bottom}px ${r.left - e.left}px round 4px)`;
    };
    const abierto = 'inset(0px 0px 0px 0px round 0px)';

    // Tiempos de la línea (segundos de timeline, no reales).
    const T = { entraSabado: 1.3, enSabado: 2.6, entraDomingo: 3.3, enDomingo: 4.6, fin: 5.2 };

    let linea: gsap.core.Timeline | undefined;
    // Solo se toca el DOM cuando cambia algo (días alcanzados o qué panel
    // recibe toques), no en cada frame del scrub.
    let alcanzadosPrevio = -1;
    let toquesPrevio = '';
    const marcar = () => {
      if (!linea) return;
      const s = Number(gsap.getProperty(relleno, 'scaleX'));
      const alcanzados = Math.floor((s + 0.01) * 6) + 1;
      if (alcanzados !== alcanzadosPrevio) {
        alcanzadosPrevio = alcanzados;
        dias.forEach((d, k) => d.toggleAttribute('data-alcanzado', k < alcanzados));
        celdas.forEach((c, k) => c.toggleAttribute('data-alcanzado', k < alcanzados));
      }
      // Un día solo recibe clics cuando ya está abierto; antes, los recibe el calendario.
      const t = linea.time();
      const toques = `${t >= T.enSabado - 0.3}|${t >= T.enDomingo - 0.3}`;
      if (toques !== toquesPrevio) {
        toquesPrevio = toques;
        sabado.panel.style.pointerEvents = t >= T.enSabado - 0.3 ? 'auto' : 'none';
        domingo.panel.style.pointerEvents = t >= T.enDomingo - 0.3 ? 'auto' : 'none';
      }
    };

    linea = gsap.timeline({
      defaults: { ease: 'none' },
      // Se marca en cada cuadro del timeline (con scrub va detrás del scroll).
      onUpdate: () => marcar(),
      scrollTrigger: {
        trigger: escenario,
        start: 'top top',
        end: '+=360%',
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onRefresh: () => marcar(),
      },
    });

    linea
      // 1. La ruta avanza de lunes a sábado.
      .fromTo(relleno, { scaleX: 0 }, { scaleX: 5 / 6, duration: 1.2 }, 0)
      // 2. Entramos al sábado: la foto del día aparece sobre su miniatura y
      //    la ventana se abre a pantalla completa.
      .fromTo(sabado.panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, T.entraSabado)
      .fromTo(sabado.panel, { clipPath: desdeVentana(sabado.ventana) }, { clipPath: abierto, duration: 1.1, ease: 'power2.inOut' }, T.entraSabado)
      .fromTo(sabado.foto, { scale: 1.45 }, { scale: 1.05, duration: 1.3, ease: 'power1.out' }, T.entraSabado)
      .fromTo(sabado.texto, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, T.entraSabado + 0.8)
      // 3. Cambiamos de día: el sábado se retira y el domingo se abre encima.
      .to(sabado.foto, { scale: 1.2, duration: 1.1 }, T.entraDomingo)
      .to(sabado.texto, { autoAlpha: 0, y: -40, duration: 0.5 }, T.entraDomingo)
      .to(relleno, { scaleX: 1, duration: 0.8 }, T.entraDomingo)
      .fromTo(domingo.panel, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, T.entraDomingo)
      .fromTo(domingo.panel, { clipPath: desdeVentana(domingo.ventana) }, { clipPath: abierto, duration: 1.1, ease: 'power2.inOut' }, T.entraDomingo)
      .fromTo(domingo.foto, { scale: 1.45 }, { scale: 1.05, duration: 1.3, ease: 'power1.out' }, T.entraDomingo)
      .fromTo(domingo.relleno, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' }, T.entraDomingo + 0.6)
      .fromTo(domingo.texto, { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, T.entraDomingo + 0.8)
      // 4. Pausa para leer antes de soltar la sección.
      .to({}, { duration: T.fin - T.enDomingo }, T.enDomingo);

    // Clic en un día (calendario o ruta interna): lleva el scroll a ese momento.
    const ir = (evento: Event) => {
      const st = linea?.scrollTrigger;
      if (!st) return;
      const t = (evento as CustomEvent<string>).detail === 'brunch' ? T.enDomingo : T.enSabado;
      window.scrollTo({ top: st.start + (st.end - st.start) * (t / linea!.duration()), behavior: 'smooth' });
    };
    window.addEventListener('semana:ir', ir);

    return () => {
      window.removeEventListener('semana:ir', ir);
      semana.dataset.modo = 'pestanas';
      [sabado.panel, domingo.panel].forEach((p) => (p.style.pointerEvents = ''));
    };
  });

  // Galería (todas las pantallas): paneo horizontal fijado + fotos que flotan.
  mm.add('(min-width: 0px)', () => {
    const seccion = document.querySelector<HTMLElement>('[data-paneo]');
    const pista = seccion?.querySelector<HTMLElement>('[data-pista]');
    if (!seccion || !pista) return;
    // Sin carrusel nativo: el scroll vertical mueve la pista.
    seccion.dataset.modo = 'paneo';
    pista.scrollLeft = 0;
    const distancia = () => pista.scrollWidth - window.innerWidth;

    const linea = gsap.timeline({
      scrollTrigger: {
        trigger: seccion,
        start: 'top top',
        end: () => `+=${distancia()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
    linea
      .to(pista, { x: () => -distancia(), ease: 'none' }, 0);
    pista.querySelectorAll<HTMLElement>('[data-flota]').forEach((pieza, i) => {
      linea.fromTo(pieza, { y: i % 2 ? 18 : -18 }, { y: i % 2 ? -18 : 18, ease: 'none' }, 0);
    });

    return () => {
      delete seccion.dataset.modo;
    };
  });

  // GSAP arranca con la primera interacción (BaseLayout.astro), cuando
  // "load" ya pasó y ScrollTrigger no recalcula solo. Se ordenan los
  // disparadores por su posición en la página (los creados antes que el pin
  // del hero quedaban medidos sin su espacio) y se recalcula una vez.
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
}
