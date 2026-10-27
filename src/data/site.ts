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
    visible: '777 620 59 12',
    numeroInternacional: '527776205912',
    mensajeReserva:
      'Hola, me gustaría obtener información sobre La Cañadita y realizar una reservación.',
    mensajeBuffet:
      'Hola, me gustaría consultar la disponibilidad del buffet del sábado en La Cañadita.',
    mensajeBrunch:
      'Hola, me gustaría reservar el brunch del domingo en La Cañadita.',
    mensajeDesayuno:
      'Hola, me gustaría conocer la carta de desayunos de La Cañadita.',
  },
  maps: {
    // Búsqueda oficial del restaurante en Google Maps
    url: 'https://www.google.com/maps/search/?api=1&query=La+Ca%C3%B1adita+Restaurant+Av.+Compositores+202+Col.+Analco+Cuernavaca+Morelos',
    embed: 'https://maps.google.com/maps?q=La%20Ca%C3%B1adita%20Restaurant%20Av.%20Compositores%20202%20Col.%20Analco%20Cuernavaca%20Morelos&t=&z=15&ie=UTF8&iwloc=&output=embed',
  },
  redes: {
    facebook: 'https://www.facebook.com/p/La-Ca%C3%B1adita-Restaurant-61587730833846/',
    instagram: 'https://www.instagram.com/lacanadita.restaurante',
  },
} as const;

/** Datos oficiales encontrados en los recursos gráficos del restaurante. */
export const horarios = {
  general: 'Lunes a Domingo de 10:00 a 06:00 P.M.',
  brunch: 'Domingos de 9:00 a.m. a 1:00 p.m.',
  buffet: 'Los sábados hay buffet en La Cañadita',
} as const;

/**
 * Enlaces de navegación de la página.
 * `esencial` = se muestra también en tablet (barra superior compacta);
 * el resto aparece solo en escritorio.
 */
export const navegacion = [
  { href: '#inicio', etiqueta: 'Inicio', esencial: true },
  { href: '#experiencia', etiqueta: 'Nuestra experiencia', esencial: false },
  { href: '#menu', etiqueta: 'Menú', esencial: true },
  { href: '#buffet', etiqueta: 'Buffet y brunch', esencial: true },
  { href: '#galeria', etiqueta: 'Galería', esencial: false },
  { href: '#ubicacion', etiqueta: 'Ubicación', esencial: true },
] as const;

/**
 * TODO: definir la variable de entorno PUBLIC_WHATSAPP_NUMBER en Netlify
 * (formato internacional, p. ej. 527776205912). El número oficial se mantiene
 * como respaldo para que el enlace funcione mientras se configura.
 */
const numeroWhatsApp =
  import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? contacto.whatsapp.numeroInternacional;

/** Construye un enlace de WhatsApp con mensaje predefinido. */
export function enlaceWhatsApp(mensaje: string): string {
  return `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
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
  // TODO (Fase 4): cambiar a '/menu' cuando exista la vista de carta completa.
  { id: 'menu', etiqueta: 'Ver menú', href: '#menu', externo: false },
  // TODO (Fase 3): apuntar a '#horarios' cuando exista la sección de horarios.
  { id: 'horarios', etiqueta: 'Horarios', href: '#ubicacion', externo: false },
  { id: 'buffet', etiqueta: 'Buffet y brunch', href: '#buffet', externo: false },
  { id: 'ubicacion', etiqueta: 'Ubicación', href: '#ubicacion', externo: false },
  {
    id: 'whatsapp',
    etiqueta: 'Escribir por WhatsApp',
    href: enlaceWhatsApp(contacto.whatsapp.mensajeReserva),
    externo: true,
  },
] as const;
