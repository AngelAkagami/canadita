/** Diagnóstico: estado de carga de cada imagen tras desplazarse por la página. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { chromium } from 'playwright-core';

const DIST = join(resolve(process.cwd()), 'dist');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.pdf': 'application/pdf' };

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
await new Promise((ok) => servidor.listen(4322, ok));

const navegador = await chromium.launch({ executablePath: EDGE, headless: true });
const pagina = await navegador.newPage({ viewport: { width: 1440, height: 900 } });

const respuestas404 = [];
pagina.on('response', (r) => { if (r.status() >= 400) respuestas404.push(`${r.status()} ${r.url()}`); });

await pagina.goto('http://localhost:4322/', { waitUntil: 'networkidle' });

// recorrido lento, como un usuario real
await pagina.evaluate(async () => {
  const alto = document.body.scrollHeight;
  for (let y = 0; y < alto; y += 400) {
    window.scrollTo(0, y);
    await new Promise((ok) => setTimeout(ok, 200));
  }
});
await pagina.waitForTimeout(1500);

const estado = await pagina.evaluate(() =>
  Array.from(document.images).map((i) => ({
    src: (i.currentSrc || i.src).split('/').pop(),
    completa: i.complete,
    anchoNatural: i.naturalWidth,
    visible: i.getBoundingClientRect().width > 0,
  })),
);

console.table(estado);
if (respuestas404.length) console.log('Respuestas con error:\n' + respuestas404.join('\n'));

await navegador.close();
servidor.close();
