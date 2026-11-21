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
    // Hoja de estilos externa (~60 KB, con hash en /_astro): se descarga una
    // vez y queda en caché para todas las páginas y visitas, en lugar de ir
    // repetida dentro de cada HTML. 'auto' solo inlinea hojas < 4 KB.
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
