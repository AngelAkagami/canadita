/** Prueba funcional de la navegación móvil: barra inferior, overlay y FAB.
 *  Uso: node scripts/probar-nav-movil.mjs (requiere serve.mjs en 4330) */
import { chromium } from 'playwright-core';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const navegador = await chromium.launch({ executablePath: EDGE, headless: true });
const pagina = await navegador.newPage({ viewport: { width: 375, height: 740 } });
await pagina.goto('http://localhost:4330/', { waitUntil: 'domcontentloaded' });
await pagina.waitForTimeout(600);

const resultados = [];
const comprobar = (nombre, ok) => resultados.push(`${ok ? 'OK  ' : 'FALLA'} ${nombre}`);

comprobar('barra inferior visible', await pagina.locator('#barra-inferior').isVisible());
comprobar('FAB visible', await pagina.locator('#fab-reserva').isVisible());
comprobar('header superior oculto en móvil', !(await pagina.locator('header').isVisible()));
comprobar('sin scroll horizontal', await pagina.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

await pagina.screenshot({ path: 'qa/nav-movil-inicio.png' });

// Abrir overlay
await pagina.click('#boton-mas');
await pagina.waitForTimeout(400);
const overlay = pagina.locator('#menu-rapido');
comprobar('overlay abierto', await overlay.isVisible());
comprobar('aria-expanded=true', (await pagina.getAttribute('#boton-mas', 'aria-expanded')) === 'true');
comprobar('FAB oculto con overlay', !(await pagina.locator('#fab-reserva').isVisible()));
comprobar('scroll body bloqueado', await pagina.evaluate(() => document.body.classList.contains('sin-scroll')));
const focoEnOverlay = await pagina.evaluate(() => document.getElementById('menu-rapido').contains(document.activeElement));
comprobar('foco dentro del overlay al abrir', focoEnOverlay);
comprobar('acciones: 6 enlaces', (await overlay.locator('a.menu-rapido-enlace').count()) === 6);

// Área táctil mínima 44 px
const alturas = await overlay.locator('a.menu-rapido-enlace').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
comprobar(`acciones >= 44px (${Math.min(...alturas).toFixed(0)}px mín)`, Math.min(...alturas) >= 44);

await pagina.screenshot({ path: 'qa/nav-movil-overlay.png' });

// Escape cierra
await pagina.keyboard.press('Escape');
await pagina.waitForTimeout(400);
comprobar('Escape cierra el overlay', !(await overlay.isVisible()));
comprobar('aria-expanded=false', (await pagina.getAttribute('#boton-mas', 'aria-expanded')) === 'false');
comprobar('FAB visible otra vez', await pagina.locator('#fab-reserva').isVisible());
const focoDevuelto = await pagina.evaluate(() => document.activeElement?.id === 'boton-mas');
comprobar('foco devuelto al botón', focoDevuelto);
comprobar('scroll desbloqueado', await pagina.evaluate(() => !document.body.classList.contains('sin-scroll')));

// Reabrir y cerrar con el botón X
await pagina.click('#boton-mas');
await pagina.waitForTimeout(350);
await pagina.click('#boton-cerrar-mas');
await pagina.waitForTimeout(350);
comprobar('botón X cierra el overlay', !(await overlay.isVisible()));

// Barra "Menú" abre la vista /menu/
await Promise.all([
  pagina.waitForURL('**/menu/', { timeout: 6000 }),
  pagina.click('#barra-inferior a[href="/menu/"]'),
]);
comprobar('clic en Menú abre /menu/', new URL(pagina.url()).pathname === '/menu/');
comprobar('/menu/: h1 presente', (await pagina.locator('h1').count()) > 0);
comprobar(
  '/menu/: sin scroll horizontal',
  await pagina.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
);
await pagina.screenshot({ path: 'qa/nav-movil-menu.png' });

// En /menu los destinos de ancla se resuelven como /#seccion
await pagina.click('#boton-mas');
await pagina.waitForTimeout(400);
const hrefs = await pagina
  .locator('#menu-rapido a.menu-rapido-enlace')
  .evaluateAll((els) => els.map((e) => e.getAttribute('href')));
comprobar(
  'overlay en /menu: anclas → /#seccion',
  hrefs.includes('/#horarios') && hrefs.includes('/#buffet') && hrefs.includes('/#ubicacion'),
);
comprobar('overlay en /menu: Ver menú → /menu/', hrefs.includes('/menu/'));
await pagina.keyboard.press('Escape');
await pagina.waitForTimeout(400);

// Volver a la home con "Inicio" desde la barra
await Promise.all([
  pagina.waitForFunction(() => location.pathname === '/' && location.hash === '#inicio', {
    timeout: 6000,
  }),
  pagina.click('#barra-inferior a[href="/#inicio"]'),
]);
comprobar('Inicio desde /menu/ vuelve a la home', true);
await pagina.waitForTimeout(400);

// Tablet: header visible, barra inferior oculta
await pagina.setViewportSize({ width: 768, height: 1024 });
await pagina.waitForTimeout(400);
comprobar('tablet: header visible', await pagina.locator('header').isVisible());
comprobar('tablet: barra inferior oculta', !(await pagina.locator('#barra-inferior').isVisible()));
comprobar('tablet: sin scroll horizontal', await pagina.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
await pagina.screenshot({ path: 'qa/nav-tablet.png' });

console.log(resultados.join('\n'));
await navegador.close();
process.exit(resultados.some((r) => r.startsWith('FALLA')) ? 1 : 0);
