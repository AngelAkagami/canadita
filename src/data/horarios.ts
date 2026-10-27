/**
 * Horarios oficiales de La Cañadita Restaurant.
 *
 * Los datos viven en horarios.json (fuente única). Aquí se derivan las
 * cadenas que muestran la página y el pie de página.
 *
 * ESTE ARCHIVO SUSTITUYE al antiguo export `horarios` de site.ts, que
 * decía "Lunes a Domingo de 10:00 a 06:00 P.M." (ya no coincide con los
 * horarios confirmados por el cliente).
 */
import datos from './horarios.json';

export const horarios = datos;

/** Resumen completo: "Lunes a viernes de 08:00 a 18:00 h · Sábado y domingo de 09:00 a 18:00 h". */
export const resumenHorarios = `${datos.entreSemana.etiqueta} de ${datos.entreSemana.apertura} a ${datos.entreSemana.cierre} h · ${datos.finDeSemana.etiqueta} de ${datos.finDeSemana.apertura} a ${datos.finDeSemana.cierre} h`;

/** Resumen compacto para el pie de página. */
export const resumenHorariosCorto = `Lun–Vie ${datos.entreSemana.apertura}–${datos.entreSemana.cierre} h · Sáb–Dom ${datos.finDeSemana.apertura}–${datos.finDeSemana.cierre} h`;

/** Precio en pesos mexicanos con formato "$450". */
export function pesos(cantidad: number): string {
  return `$${cantidad.toLocaleString('es-MX')}`;
}
