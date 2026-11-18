/** Mide la fluidez del scroll por sección (cuadros lentos y tareas largas).
 *  Levanta ./dist con serve.mjs, recorre la página con gestos de scroll reales
 *  (rueda; ver nota en PERFILES) y reporta por sección.
 *  Uso: npm run build && node scripts/medir-scroll.mjs [movil|escritorio|ambos]
 *  Móvil: 412x915 @2.625, táctil, CPU x4 más lenta (Android de gama media). */
import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PUERTO = 4337;
const modo = process.argv[2] ?? 'ambos';

const servidor = spawn(process.execPath, ['scripts/serve.mjs', String(PUERTO)], { stdio: 'pipe' });
await new Promise((ok) => servidor.stdout.once('data', ok));

const PERFILES = {
  movil: {
    contexto: { viewport: { width: 412, height: 915 }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36' },
    // Los gestos 'touch' sintéticos no desplazan en headless (ni en una página vacía):
    // se usa rueda, que recorre el mismo camino de scroll + ScrollTrigger.
    cpu: 4, gesto: 'mouse', paso: 500, velocidad: 1400,
  },
  escritorio: {
    contexto: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
    cpu: 1, gesto: 'mouse', paso: 500, velocidad: 1400,
  },
};

async function medir(nombre) {
  const p = PERFILES[nombre];
  const navegador = await chromium.launch({ executablePath: EDGE, headless: true, args: ['--enable-gpu-rasterization'] });
  const contexto = await navegador.newContext({ ...p.contexto, serviceWorkers: 'block' });
  const pagina = await contexto.newPage();
  const cdp = await contexto.newCDPSession(pagina);

  await pagina.addInitScript(() => {
    window.__cuadros = [];
    window.__largas = [];
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__largas.push([e.startTime, e.duration]))).observe({ type: 'longtask', buffered: true });
    const bucle = (t) => {
      window.__cuadros.push([t, window.scrollY]);
      requestAnimationFrame(bucle);
    };
    requestAnimationFrame(bucle);
  });

  await pagina.goto(`http://localhost:${PUERTO}/`, { waitUntil: 'load' });
  await pagina.waitForTimeout(2500); // entrada del hero, fuentes, GSAP
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: p.cpu });
  await pagina.evaluate(() => { window.__cuadros.length = 0; window.__largas.length = 0; window.__inicio = performance.now(); });

  const { width, height } = p.contexto.viewport;
  for (let i = 0; i < 400; i++) {
    const antes = await pagina.evaluate(() => window.scrollY);
    await cdp.send('Input.synthesizeScrollGesture', {
      x: Math.round(width / 2), y: Math.round(height * 0.6), yDistance: -p.paso, speed: p.velocidad,
      gestureSourceType: p.gesto, repeatCount: 1,
    });
    const despues = await pagina.evaluate(() => window.scrollY);
    if (despues <= antes + 2) break; // llegó al final
  }
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });

  const datos = await pagina.evaluate(() => {
    // Rangos de scroll de cada sección (con su pin-spacer, si está fijada).
    const rangos = [...document.querySelectorAll('main section[id], body > section[id], section[id]')]
      .filter((s, i, arr) => arr.indexOf(s) === i)
      .map((s) => {
        const caja = (s.parentElement?.classList.contains('pin-spacer') ? s.parentElement : s).getBoundingClientRect();
        return { id: s.id, top: caja.top + window.scrollY, bottom: caja.bottom + window.scrollY };
      })
      .sort((a, b) => a.top - b.top);
    return { cuadros: window.__cuadros, largas: window.__largas.filter(([t]) => t >= window.__inicio), rangos, alto: innerHeight };
  });
  await navegador.close();

  const seccion = (y) => {
    const centro = y + datos.alto / 2;
    return datos.rangos.find((r) => centro >= r.top && centro < r.bottom)?.id ?? '(entre secciones)';
  };
  const filas = new Map();
  const fila = (id) => filas.get(id) ?? filas.set(id, { cuadros: 0, lentos: 0, peor: 0, perdidos: 0, largas: 0, msLargas: 0 }).get(id);
  for (let i = 1; i < datos.cuadros.length; i++) {
    const [t, y] = datos.cuadros[i];
    const dt = t - datos.cuadros[i - 1][0];
    const f = fila(seccion(y));
    f.cuadros++;
    if (dt > 25) f.lentos++;
    f.perdidos += Math.max(0, Math.round(dt / 16.7) - 1);
    f.peor = Math.max(f.peor, dt);
  }
  for (const [t, d] of datos.largas) {
    const cercano = datos.cuadros.reduce((a, c) => (Math.abs(c[0] - t) < Math.abs(a[0] - t) ? c : a), datos.cuadros[0]);
    const f = fila(seccion(cercano[1]));
    f.largas++;
    f.msLargas += d;
  }

  const total = [...filas.values()].reduce((a, f) => ({ cuadros: a.cuadros + f.cuadros, perdidos: a.perdidos + f.perdidos }), { cuadros: 0, perdidos: 0 });
  const lineas = [`\n== ${nombre} (CPU x${p.cpu}) ==`, 'sección                cuadros  >25ms  perdidos  peor(ms)  tareas>50ms  ms en tareas'];
  for (const [id, f] of [...filas].sort((a, b) => b[1].perdidos - a[1].perdidos)) {
    lineas.push(`${id.padEnd(22)} ${String(f.cuadros).padStart(7)} ${String(f.lentos).padStart(6)} ${String(f.perdidos).padStart(9)} ${f.peor.toFixed(0).padStart(9)} ${String(f.largas).padStart(12)} ${f.msLargas.toFixed(0).padStart(13)}`);
  }
  const fluidez = (100 * total.cuadros) / (total.cuadros + total.perdidos);
  lineas.push(`TOTAL: ${total.cuadros} cuadros, ${total.perdidos} perdidos → ${fluidez.toFixed(1)}% de cuadros a tiempo`);
  return lineas.join('\n');
}

try {
  const salida = [];
  for (const nombre of modo === 'ambos' ? ['movil', 'escritorio'] : [modo]) salida.push(await medir(nombre));
  console.log(salida.join('\n'));
  await mkdir('qa', { recursive: true });
  await writeFile(`qa/scroll-${modo}.txt`, salida.join('\n'));
} finally {
  servidor.kill();
}
