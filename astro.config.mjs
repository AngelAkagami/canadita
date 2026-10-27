// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://lacanadita.com',
  output: 'static',
  // Prefetch desactivado: la landing es una sola página y el escaneo de
  // enlaces que hace el ClientRouter al cargar penaliza el TBT en móvil.
  prefetch: false,
  build: {
    // Inlining elimina la hoja de estilos como petición bloqueante (mejora FCP/LCP)
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
