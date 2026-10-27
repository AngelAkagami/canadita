/** Verifica desbordes horizontales y errores de consola en varios anchos.
 *  Uso: node scripts/probar-anchos.mjs (requiere serve.mjs en 4330) */
import { chromium } from 'playwright-core';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const navegador = await chromium.launch({ executablePath: EDGE, headless: true });

const ANCHOS = [320, 375, 480, 768, 1024, 1440];
let fallas = 0;

for (const ancho of ANCHOS) {
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: 800 } });
  const errores = [];
  pagina.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  pagina.on('pageerror', (e) => errores.push(String(e)));
  await pagina.goto('http://localhost:4330/', { waitUntil: 'domcontentloaded' });
  await pagina.waitForTimeout(500);
  const overflow = await pagina.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const ok = overflow <= 0 && errores.length === 0;
  if (!ok) fallas++;
  console.log(
    `${ok ? 'OK  ' : 'FALLA'} ${String(ancho).padStart(4)}px -> overflow: ${overflow}px | errores: ${errores.length}` +
      (errores.length ? ` (${errores[0].slice(0, 80)})` : ''),
  );
  await pagina.close();
}

await navegador.close();
process.exit(fallas ? 1 : 0);
