/** Captura rápida de la sección del menú para revisión visual.
 *  Uso:  node scripts/captura-menu.mjs (requiere node scripts/serve.mjs 4330)
 */

import { chromium } from 'playwright-core';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const navegador = await chromium.launch({ executablePath: EDGE, headless: true });
const pagina = await navegador.newPage({ viewport: { width: 1440, height: 1000 } });
await pagina.goto('http://localhost:4330/', { waitUntil: 'domcontentloaded' });

const seccion = pagina.locator('#menu');
await seccion.scrollIntoViewIfNeeded();
await pagina.waitForTimeout(1200);
await seccion.screenshot({ path: 'qa/menu-desktop.png' });

// clic en el botón "Entradas" y comprobar que salta a la categoría
const antes = await pagina.evaluate(() => window.scrollY);
await pagina.click('nav[aria-label*="ategor"] a[href="#entradas"]');
await pagina.waitForTimeout(800);
const despues = await pagina.evaluate(() => window.scrollY);
const destinoTop = await pagina.evaluate(() => Math.round(document.getElementById('entradas').getBoundingClientRect().top));
console.log(`clic en #entradas -> scrollY ${antes} → ${despues} | top de la sección destino: ${destinoTop}px del viewport`);

await navegador.close();
