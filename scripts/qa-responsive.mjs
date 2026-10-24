/**
 * Prueba responsive y de enlaces para la landing de La Cañadita.
 *
 * Sirve ./dist con un servidor estático mínimo y recorre la página con el
 * Microsoft Edge del sistema (sin descargar navegadores) en las resoluciones
 * requeridas: 320, 375, 480, 768, 1024 y 1440 px.
 *
 * Para cada resolución verifica:
 *  - que no exista desplazamiento horizontal
 *  - errores de consola y peticiones fallidas
 *  - captura de pantalla de página completa
 *
 * Uso:  node scripts/qa-responsive.mjs   (requiere npm run build previo)
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const RAIZ = resolve(process.cwd());
const DIST = join(RAIZ, 'dist');
const SALIDA = join(RAIZ, 'qa');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
};

const ANCHOS = [320, 375, 480, 768, 1024, 1440];

const servidor = createServer(async (peticion, respuesta) => {
  let ruta = decodeURIComponent(new URL(peticion.url, 'http://localhost').pathname);
  if (ruta === '/') ruta = '/index.html';
  try {
    const cuerpo = await readFile(join(DIST, ruta));
    respuesta.writeHead(200, { 'content-type': MIME[extname(ruta)] ?? 'application/octet-stream' });
    respuesta.end(cuerpo);
  } catch {
    respuesta.writeHead(404).end('No encontrado');
  }
});

await new Promise((ok) => servidor.listen(4321, ok));
await mkdir(SALIDA, { recursive: true });

const navegador = await chromium.launch({ executablePath: EDGE, headless: true });
let fallos = 0;

for (const ancho of ANCHOS) {
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: 900 } });
  const errores = [];
  const recursosFallidos = [];

  pagina.on('console', (mensaje) => {
    if (mensaje.type() === 'error') errores.push(mensaje.text());
  });
  pagina.on('requestfailed', (peticion) => {
    recursosFallidos.push(`${peticion.url()} — ${peticion.failure()?.errorText}`);
  });

  await pagina.goto('http://localhost:4321/', { waitUntil: 'load' });

  // Recorre la página como un usuario real para activar el lazy loading
  await pagina.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach((imagen) => {
      imagen.loading = 'eager';
    });
    const alto = document.body.scrollHeight;
    for (let y = 0; y < alto; y += 400) {
      window.scrollTo(0, y);
      await new Promise((ok) => setTimeout(ok, 200));
    }
  });
  await pagina
    .waitForFunction(() => Array.from(document.images).every((imagen) => imagen.complete), null, {
      timeout: 30000,
    })
    .catch(() => console.log('  (algunas imágenes no confirmaron carga)'));
  await pagina.evaluate(() => window.scrollTo(0, 0));
  // El iframe de Google Maps mantiene actividad de red, por lo que no se usa
  // 'networkidle' como condición de espera.
  await pagina.waitForTimeout(1500);

  const medidas = await pagina.evaluate(() => ({
    anchoVentana: window.innerWidth,
    anchoDocumento: document.documentElement.scrollWidth,
    altoDocumento: document.documentElement.scrollHeight,
  }));

  const desborda = medidas.anchoDocumento > medidas.anchoVentana + 1;
  await pagina.screenshot({ path: join(SALIDA, `pantalla-${ancho}.png`), fullPage: true });

  const estado = desborda || errores.length || recursosFallidos.length ? 'REVISAR' : 'OK';
  if (estado === 'REVISAR') fallos++;

  console.log(
    `\n[${ancho}px] ${estado} — documento ${medidas.anchoDocumento}px, alto ${medidas.altoDocumento}px`,
  );
  if (desborda) console.log(`  ⚠ desplazamiento horizontal: ${medidas.anchoDocumento} > ${medidas.anchoVentana}`);
  if (errores.length) console.log(`  ⚠ errores de consola:\n    ${errores.join('\n    ')}`);
  if (recursosFallidos.length) console.log(`  ⚠ recursos fallidos:\n    ${recursosFallidos.join('\n    ')}`);

  await pagina.close();
}

await navegador.close();
servidor.close();

console.log(`\nCapturas guardadas en ${SALIDA}`);
process.exit(fallos ? 1 : 0);
