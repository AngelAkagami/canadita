/** Servidor estático mínimo para previsualizar ./dist (QA y Lighthouse).
 *  Aplica compresión gzip como hace Netlify en producción. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { createGzip } from 'node:zlib';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const DIST = join(resolve(process.cwd()), 'dist');
const PUERTO = Number(process.argv[2] ?? 4321);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

const COMPRIMIBLES = new Set(['.html', '.css', '.js', '.json', '.svg']);

createServer(async (peticion, respuesta) => {
  let ruta = decodeURIComponent(new URL(peticion.url, 'http://localhost').pathname);
  // Rutas de directorio: /menu y /menu/ → /menu/index.html (como Netlify).
  if (ruta.endsWith('/')) ruta = ruta.slice(0, -1);
  if (ruta === '') ruta = '/index.html';
  else if (!extname(ruta)) ruta = `${ruta}/index.html`;
  const tipo = MIME[extname(ruta)] ?? 'application/octet-stream';

  try {
    const cuerpo = await readFile(join(DIST, ruta));
    const cabeceras = { 'content-type': tipo };
    // Cabeceras equivalentes a las de netlify.toml
    const cacheables = /^\/(img|fonts|_astro)\//.test(ruta) || /^\/(logo|ornamento|favicon|apple-touch-icon|og-image)/.test(ruta);
    cabeceras['cache-control'] = cacheables ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate';
    const comprimir = COMPRIMIBLES.has(extname(ruta)) && /gzip/.test(peticion.headers['accept-encoding'] ?? '');

    if (comprimir) {
      cabeceras['content-encoding'] = 'gzip';
      cabeceras['vary'] = 'accept-encoding';
      respuesta.writeHead(200, cabeceras);
      await pipeline(Readable.from(cuerpo), createGzip({ level: 9 }), respuesta);
    } else {
      respuesta.writeHead(200, cabeceras);
      respuesta.end(cuerpo);
    }
  } catch (error) {
    if (respuesta.headersSent) {
      respuesta.destroy();
      console.error('Error sirviendo archivo:', error);
    } else {
      respuesta.writeHead(404).end('No encontrado');
    }
  }
}).listen(PUERTO, () => console.log(`Sirviendo dist (gzip) en http://localhost:${PUERTO}`));
