/**
 * Configuración central de la marca y datos de contacto oficiales de
 * La Cañadita Restaurant.
 *
 * Todo dato comercial de la página debe editarse desde este archivo.
 * Los valores marcados como "pendiente" NO están confirmados en los
 * recursos oficiales y no deben publicarse como datos definitivos.
 */

export const sitio = {
  nombre: 'La Cañadita',
  nombreCompleto: 'La Cañadita Restaurant',
  tagline: 'Cocina contemporánea en el corazón de Cuernavaca',
  descripcion:
    'La Cañadita es un espacio en Cuernavaca para compartir la mesa, disfrutar buenos sabores y convertir cada visita en una experiencia especial.',
  url: 'https://lacanadita.com',
  web: 'https://lacanadita.com',
} as const;

export const contacto = {
  direccion: {
    linea1: 'Av. Compositores 202',
    linea2: 'Col. Analco',
    ciudad: 'Cuernavaca',
    estado: 'Morelos',
    completa: 'Av. Compositores 202, Col. Analco, Cuernavaca, Morelos',
  },
  telefono: {
    visible: '777 781 00 03',
    href: 'tel:+527777810003',
  },
  whatsapp: {
    visible: '777 781 00 03',
    numeroInternacional: '527777810003',
    mensajeReserva:
      'Hola, me gustaría obtener información sobre La Cañadita y realizar una reservación.',
    mensajeBuffet:
      'Hola, me gustaría consultar la disponibilidad del buffet del sábado en La Cañadita.',
    mensajeBrunch:
      'Hola, me gustaría reservar el brunch del domingo en La Cañadita.',
    mensajeDesayuno:
      'Hola, me gustaría conocer la carta de desayunos de La Cañadita.',
    mensajeCarta:
      'Hola, me gustaría conocer la carta completa de La Cañadita.',
  },
  maps: {
    // Búsqueda oficial del restaurante en Google Maps
    url: 'https://www.google.com/maps/search/?api=1&query=La+Ca%C3%B1adita+Restaurant+Av.+Compositores+202+Col.+Analco+Cuernavaca+Morelos',
    embed: 'https://maps.google.com/maps?q=La%20Ca%C3%B1adita%20Restaurant%20Av.%20Compositores%20202%20Col.%20Analco%20Cuernavaca%20Morelos&t=&z=15&ie=UTF8&iwloc=&output=embed',
  },
  redes: {
    facebook: 'https://www.facebook.com/p/La-Ca%C3%B1adita-Restaurant-61587730833846/',
    instagram: 'https://www.instagram.com/lacanadita.restaurante',
    // TODO: confirmar el usuario oficial de TikTok con el cliente.
    tiktok: 'https://www.tiktok.com/@lacanadita.restaurante',
  },
} as const;

/**
 * Videos de TikTok destacados que se incrustan en la sección "En TikTok".
 *
 * Cada `url` debe ser el enlace completo a un video público:
 *   https://www.tiktok.com/@usuario/video/1234567890123456789
 * De ahí se extrae el ID numérico para el reproductor oficial
 * (tiktok.com/player/v1/{id}).
 *
 * TODO: reemplazar estos marcadores por los videos reales de La Cañadita
 * que indique el cliente. Mientras tanto, la sección se oculta sola si la
 * lista está vacía (ver componente TikTok.astro).
 */
export const tiktoks: { url: string; titulo: string }[] = [
  {
    url: 'https://www.tiktok.com/@lacanadita.restaurante/video/7646937477302717716',
    titulo: 'Sabores de La Cañadita',
  },
  {
    url: 'https://www.tiktok.com/@lacanadita.restaurante/video/7699315580049853716',
    titulo: 'Desayunos entre jardines',
  },
  {
    url: 'https://www.tiktok.com/@lacanadita.restaurante/video/7646937652897385748',
    titulo: 'Momentos en la mesa',
  },
  {
    url: 'https://www.tiktok.com/@lacanadita.restaurante/video/7653625140671941909',
    titulo: 'El ambiente del restaurante',
  },
];

/** Extrae el ID numérico de un enlace de video de TikTok. */
export function idTikTok(url: string): string | null {
  const coincidencia = url.match(/\/video\/(\d+)/);
  return coincidencia ? coincidencia[1] : null;
}

/**
 * Los horarios oficiales viven en `horarios.json` y se exportan desde
 * `horarios.ts` (con los resúmenes de texto derivados). Se eliminó el
 * export anterior porque decía "Lunes a Domingo de 10:00 a 06:00 P.M.",
 * que ya no coincide con los horarios confirmados por el cliente.
 */

/**
 * Enlaces de navegación de la página.
 * `esencial` = se muestra también en tablet (barra superior compacta);
 * el resto aparece solo en escritorio.
 */
export const navegacion = [
  { href: '#inicio', etiqueta: 'Inicio', esencial: true },
  { href: '/menu/', etiqueta: 'Menú', esencial: true },
  { href: '#fines-de-semana', etiqueta: 'Buffet y brunch', esencial: true },
  { href: '#galeria', etiqueta: 'Galería', esencial: false },
  { href: '#tiktok', etiqueta: 'TikTok', esencial: false },
  { href: '#ubicacion', etiqueta: 'Visítanos', esencial: true },
] as const;

/**
 * TODO: definir la variable de entorno PUBLIC_WHATSAPP_NUMBER en Netlify
 * (formato internacional, p. ej. 527777810003). El número oficial se mantiene
 * como respaldo para que el enlace funcione mientras se configura.
 */
const numeroWhatsApp =
  import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? contacto.whatsapp.numeroInternacional;

/** Construye un enlace de WhatsApp con mensaje predefinido. */
export function enlaceWhatsApp(mensaje: string): string {
  return `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Convierte un ancla de la home (`#seccion`) en un enlace válido desde
 * cualquier página: en la home queda igual; desde /menu apunta a
 * `/#seccion` para volver y hacer el scroll.
 */
export function ancla(href: string, pathname: string): string {
  if (!href.startsWith('#')) return href;
  return pathname === '/' ? href : `/${href}`;
}

/**
 * Acciones rápidas del overlay "Más" de la navegación móvil.
 * `externo` abre en pestaña nueva (WhatsApp).
 */
export const accionesRapidas = [
  {
    id: 'reservar',
    etiqueta: 'Reservar mesa',
    href: enlaceWhatsApp(contacto.whatsapp.mensajeReserva),
    externo: true,
  },
  { id: 'menu', etiqueta: 'Ver menú', href: '/menu/', externo: false },
  { id: 'horarios', etiqueta: 'Horarios', href: '#horarios', externo: false },
  { id: 'buffet', etiqueta: 'Buffet y brunch', href: '#buffet', externo: false },
  { id: 'ubicacion', etiqueta: 'Ubicación', href: '#ubicacion', externo: false },
  {
    id: 'whatsapp',
    etiqueta: 'Escribir por WhatsApp',
    href: enlaceWhatsApp(contacto.whatsapp.mensajeReserva),
    externo: true,
  },
] as const;
