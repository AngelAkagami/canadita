/** Hora local de Cuernavaca (America/Mexico_City), sin depender del reloj del visitante. */

/** "09:30" → 570 */
export const minutos = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Día de la semana (0 = domingo) y minuto del día en Cuernavaca. dia = -1 si no se pudo leer. */
export function ahoraEnCuernavaca(): { dia: number; min: number } {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const valor = (t: string) => partes.find((p) => p.type === t)?.value ?? '';
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(valor('weekday'));
  return { dia, min: Number(valor('hour')) * 60 + Number(valor('minute')) };
}
