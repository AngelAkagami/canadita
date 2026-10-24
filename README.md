# La Cañadita Restaurant — Landing Page Oficial

Landing page estática para **La Cañadita Restaurant** (Av. Compositores 202, Col. Analco,
Cuernavaca, Morelos). Construida con **Astro + Tailwind CSS + TypeScript** y lista para
desplegarse en **Netlify**.

## Requisitos

- Node.js 20 o superior
- Python 3.10+ (solo para regenerar las imágenes optimizadas)

## Comandos

```bash
npm install          # instalar dependencias
npm run dev          # desarrollo en http://localhost:4321
npm run build        # generar sitio estático en /dist
npm run preview      # previsualizar el build
npm run assets       # regenerar imágenes optimizadas desde /recursos
```

## Estructura

```
recursos/                  ← archivos originales del cliente (NO se modifican)
scripts/prepare-assets.py  ← genera imágenes optimizadas, logo y favicon
public/
  img/                     ← versiones WebP optimizadas para web
  img/originales/          ← copia exacta de los archivos originales
  logo-claro.png           ← logotipo oficial (blanco, transparente)
  logo-oscuro.png          ← logotipo oficial (verde olivo, transparente)
  ornamento-*.png          ← ornamento del logo para detalles decorativos
  favicon.png / apple-touch-icon.png / og-image.jpg
src/
  data/site.ts             ← marca, teléfonos, WhatsApp, Maps, redes, horarios
  data/menu.ts             ← carta de "Sugerencias del chef" (8 categorías)
  layouts/BaseLayout.astro ← HTML base, meta tags, Open Graph, tipografías
  components/              ← una pieza por sección de la landing
  pages/index.astro        ← página principal
```

## Cómo cambiar el contenido

| Qué cambiar | Dónde |
|---|---|
| Teléfono, WhatsApp, dirección, Maps, redes | `src/data/site.ts` |
| Horarios | `src/data/site.ts` → `horarios` |
| Platillos, descripciones y precios | `src/data/menu.ts` |
| Textos de las secciones | `src/components/*.astro` |
| Colores de marca | `src/styles/global.css` → bloque `@theme` |

> **Importante:** el menú en `src/data/menu.ts` se transcribió del PDF oficial
> `recursos/sugerencias-chef.pdf`, que **no se publica en la página** (decisión del
> cliente: la carta no es descargable). Si la carta cambia, actualiza `menu.ts` y el
> PDF original en `recursos/`, y ejecuta `npm run assets` si agregas fotos nuevas.

## Regenerar imágenes

Coloca o reemplaza fotografías en `recursos/` y ejecuta:

```bash
npm run assets
```

El script copia los originales a `public/img/originales/`, genera versiones WebP
optimizadas y las variantes del logotipo oficial (sin redibujarlo).

## Paleta oficial

| Color | Hex | Uso |
|---|---|---|
| Verde olivo | `#42501F` | Color principal (tomado del logotipo oficial) |
| Verde oscuro | `#333D18` | Hover y pie de página |
| Verde complementario | `#556031` | Detalles, precios y antetítulos (versión oscurecida del `#657044` original para cumplir contraste WCAG AA sobre beige) |
| Marfil | `#F7F4EA` | Fondos cálidos y texto sobre verde |
| Beige suave | `#E7DFC9` | Secciones alternas |

## Datos pendientes de confirmación con el cliente

- Carta de desayunos (no hay documento; se muestra un botón de consulta por WhatsApp).
- Precio y horario del buffet de los sábados (se consulta por WhatsApp).
- Coordenadas exactas del punto en Google Maps (por ahora se usa búsqueda por dirección).

## Despliegue en Netlify

El archivo `netlify.toml` ya está configurado (`npm run build` → `dist`).
Conecta el repositorio a Netlify o despliega con:

```bash
npx netlify deploy --prod --dir=dist
```

## QA y mediciones

```bash
node scripts/serve.mjs 4330                         # sirve /dist con gzip y cachés (como Netlify)
node scripts/qa-responsive.mjs                      # capturas en 320/375/480/768/1024/1440 px → /qa
npx lighthouse http://localhost:4330                # móvil (por defecto)
npx lighthouse http://localhost:4330 --preset=desktop
python scripts/resumir-lighthouse.py qa/lh-movil.json
```

**Resultados medidos (Lighthouse v13, 23/oct/2026):**

| Dispositivo | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| Móvil (Slow 4G simulada) | **90** | **100** | **100** | **100** |
| Escritorio | **99** | **100** | **100** | **100** |

Móvil: FCP 2.0 s · LCP 3.5 s · CLS 0 · TBT 0 ms. Las tipografías están auto-alojadas
en `/fonts` (sin dependencia de Google Fonts) y las hojas de estilos se insertan en el
HTML para eliminar peticiones bloqueantes.
