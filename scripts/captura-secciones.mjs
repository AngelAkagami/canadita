/**
 * Capturas por sección para revisión visual.
 * Uso: node scripts/captura-secciones.mjs <url> <salidaPrefijo> <selector...>
 */
import { chromium } from 'playwright-core';

const [url, prefijo, ancho, ...selectores] = process.argv.slice(2);
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const navegador = await chromium.launch({ executablePath: EDGE, headless: true });
const pagina = await navegador.newPage({ viewport: { width: Number(ancho) || 1440, height: 900 } });
await pagina.goto(url, { waitUntil: 'domcontentloaded' });

for (const selector of selectores) {
  const elemento = pagina.locator(selector).first();
  await elemento.scrollIntoViewIfNeeded();
  await pagina.waitForTimeout(1200); // deja cargar imágenes diferidas
  const nombre = selector.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  await elemento.screenshot({ path: `${prefijo}-${nombre}.png` });
  console.log('captura:', `${prefijo}-${nombre}.png`);
}

await navegador.close();
