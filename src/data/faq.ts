/**
 * Preguntas frecuentes. Se muestran en la sección "Visítanos" y se publican
 * también como datos estructurados FAQPage (index.astro), que es el formato
 * que leen buscadores y asistentes de IA para responder sobre el restaurante.
 * Todas las respuestas salen de datos confirmados (site.ts / horarios.json).
 */
import { contacto } from './site';
import { horarios, pesos } from './horarios';

const { entreSemana, finDeSemana, buffetSabatino: buffet, brunchDominical: brunch } = horarios;

export const preguntas = [
  {
    pregunta: '¿Dónde está La Cañadita?',
    respuesta: `En ${contacto.direccion.completa}.`,
  },
  {
    pregunta: '¿Cuál es el horario?',
    respuesta: `${entreSemana.etiqueta} de ${entreSemana.apertura} a ${entreSemana.cierre} h y ${finDeSemana.etiqueta.toLowerCase()} de ${finDeSemana.apertura} a ${finDeSemana.cierre} h.`,
  },
  {
    pregunta: '¿Cuánto cuesta el buffet del sábado?',
    respuesta: `${pesos(buffet.precioAdultos)} por adulto y ${pesos(buffet.precioNinos)} por niño. Se sirve los sábados de ${buffet.apertura} a ${buffet.cierre} h.`,
  },
  {
    pregunta: '¿Hay brunch los domingos?',
    respuesta: `Sí, los domingos de ${brunch.apertura} a ${brunch.cierre} h: ${pesos(brunch.precioAdultos)} por adulto y ${pesos(brunch.precioNinos)} por niño.`,
  },
  {
    pregunta: '¿Cómo reservo una mesa?',
    respuesta: `Por WhatsApp o por teléfono al ${contacto.telefono.visible}.`,
  },
  {
    pregunta: '¿Qué tipo de comida sirven?',
    respuesta:
      'Cocina mexicana contemporánea: desayunos, chilaquiles y tostados, entradas, sopas, pastas, pescados y mariscos, carnes y postres.',
  },
];
