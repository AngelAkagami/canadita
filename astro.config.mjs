// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://lacanadita.com',
  output: 'static',
  build: {
    // Inlining elimina la hoja de estilos como petición bloqueante (mejora FCP/LCP)
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
