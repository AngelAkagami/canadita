/**
 * Captura de pantalla a un ancho dado (full page opcional).
 * Uso: node scripts/captura.mjs <url> <ancho> <salida> [full]
 */
import { chromium } from 'playwright-core';

const [url, ancho, salida, full] = process.argv.slice(2);
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const navegador = await chromium.launch({ executablePath: EDGE, headless: true });
const pagina = await navegador.newPage({ viewport: { width: Number(ancho) || 1440, height: 900 } });
await pagina.goto(url, { waitUntil: 'domcontentloaded' });
await pagina.waitForTimeout(900);
// Recorre la página para disparar cargas diferidas y luego vuelve al inicio
if (full) {
  await pagina.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await pagina.waitForTimeout(700);
}
await pagina.screenshot({ path: salida, fullPage: full === 'full' });
await navegador.close();
console.log('captura:', salida);
