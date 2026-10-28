/*
 * Service worker de La Cañadita: caché en el dispositivo para que las
 * visitas repetidas no vuelvan a pedir fotos, tipografías ni estilos.
 *
 * - /_astro/* y /fonts/*  → cache-first (archivos con hash o que no cambian).
 * - fotos, logos, svg     → stale-while-revalidate: se sirven al instante
 *                           desde caché y se actualizan en segundo plano.
 * - páginas (HTML)        → network-first: siempre la versión nueva; si no
 *                           hay red se muestra la última guardada.
 * Solo peticiones GET del mismo origen; Maps, TikTok y WhatsApp no se tocan.
 * Para invalidar todo, sube VERSION.
 */
const VERSION = 'v1';
const ESTATICOS = `canadita-estaticos-${VERSION}`;
const MEDIOS = `canadita-medios-${VERSION}`;
const PAGINAS = `canadita-paginas-${VERSION}`;
const VIGENTES = [ESTATICOS, MEDIOS, PAGINAS];
const MAX_MEDIOS = 80;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    (async () => {
      const nombres = await caches.keys();
      await Promise.all(
        nombres.filter((n) => n.startsWith('canadita-') && !VIGENTES.includes(n)).map((n) => caches.delete(n)),
      );
      if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
      await self.clients.claim();
    })(),
  );
});

/** Guarda solo respuestas completas y válidas (nada de 206 parciales ni errores). */
const guardable = (r) => r && r.ok && r.status === 200 && r.type === 'basic';

async function recortar(nombre, maximo) {
  const cache = await caches.open(nombre);
  const claves = await cache.keys();
  for (let i = 0; i < claves.length - maximo; i++) await cache.delete(claves[i]);
}

async function primeroCache(peticion) {
  const cache = await caches.open(ESTATICOS);
  const guardada = await cache.match(peticion);
  if (guardada) return guardada;
  const respuesta = await fetch(peticion);
  if (guardable(respuesta)) cache.put(peticion, respuesta.clone());
  return respuesta;
}

async function revalidar(peticion, evento) {
  const cache = await caches.open(MEDIOS);
  const guardada = await cache.match(peticion);
  const red = fetch(peticion)
    .then(async (respuesta) => {
      if (guardable(respuesta)) {
        await cache.put(peticion, respuesta.clone());
        await recortar(MEDIOS, MAX_MEDIOS);
      }
      return respuesta;
    })
    .catch(() => guardada);
  if (guardada) {
    evento.waitUntil(red);
    return guardada;
  }
  return red;
}

async function primeroRed(evento) {
  const cache = await caches.open(PAGINAS);
  try {
    const precargada = await evento.preloadResponse;
    const respuesta = precargada || (await fetch(evento.request));
    if (guardable(respuesta)) cache.put(evento.request, respuesta.clone());
    return respuesta;
  } catch (error) {
    const guardada = await cache.match(evento.request, { ignoreSearch: true });
    if (guardada) return guardada;
    throw error;
  }
}

self.addEventListener('fetch', (evento) => {
  const { request } = evento;
  if (request.method !== 'GET' || request.headers.has('range')) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    evento.respondWith(primeroRed(evento));
    return;
  }
  if (url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/fonts/')) {
    evento.respondWith(primeroCache(request));
    return;
  }
  if (/\.(webp|avif|png|jpe?g|svg)$/.test(url.pathname)) {
    evento.respondWith(revalidar(request, evento));
  }
});
