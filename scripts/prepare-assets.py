"""
Preparación de assets para La Cañadita Restaurant.

Toma los recursos originales de ./recursos (que NUNCA se modifican) y genera:
  - public/img/originales/        → (ya no se usa: los originales permanecen en ./recursos)
  - public/img/*.webp             → versiones optimizadas para web
  - public/logo-*.png             → variantes del logotipo oficial (claro / oscuro)
  - public/ornamento-*.webp       → ornamento del logo para uso decorativo
  - public/favicon.png            → ornamento del logo como favicon
  - public/apple-touch-icon.png
  - public/og-image.jpg           → imagen para Open Graph (logotipo sobre verde olivo)

Los archivos originales permanecen intactos en ./recursos (fuente de verdad)
y no se publican en el sitio para no duplicar peso en el despliegue.

Uso:  python scripts/prepare-assets.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from PIL import Image, ImageOps

# ---------------------------------------------------------------- configuración
RAIZ = Path(__file__).resolve().parent.parent
RECursos = RAIZ / "recursos"
PUBLIC = RAIZ / "public"
IMG = PUBLIC / "img"

# Verde olivo oficial tomado del logotipo original (RGB 66, 80, 31)
VERDE_OFICIAL = (66, 80, 31)

# Recortes "limpios" de los pósters: nombre destino -> (archivo origen, caja x0,y0,x1,y1 en fracción)
RECORTES = {
    # póster "Te esperamos" → fachada y jardín del restaurante
    "exterior": ("vista.jpg", (0.03, 0.41, 0.97, 0.74)),
    # póster "Sabores del menú" → pulpo ahumado
    "pulpo": ("platillo1.jpg", (0.02, 0.34, 0.98, 0.93)),
    # póster "Lo mejor de la cocina mexicana contemporánea" → ceviche
    "ceviche": ("plt2.jpg", (0.0, 0.36, 1.0, 0.94)),
    # póster "Descubre nuestro sabor único" → mesa de desayuno
    "desayuno-mesa": ("plt3.jpg", (0.0, 0.50, 0.93, 0.94)),
    # póster "Cocina contemporánea" → medallón de res
    "medallon": ("plt4.jpg", (0.0, 0.52, 0.93, 0.855)),
    # póster "Cada platillo es una historia" → churros de mesa
    "churros": ("plt5.jpg", (0.0, 0.53, 0.93, 0.935)),
    # póster "Y de postre" → peras al vino tinto
    "peras": ("postre.jpg", (0.05, 0.27, 0.95, 0.80)),
    # póster "Buenos días" → omelette
    "omelette": ("desayuno.jpg", (0.06, 0.26, 0.94, 0.80)),
    # póster "Brunch Dominical" → fuentes de buffet
    "buffet-copas": ("brunch3.jpg", (0.0, 0.02, 1.0, 0.50)),
    # póster "Buffet sabatino" → fuente de buffet
    "buffet-plato": ("brunch2.jpg", (0.0, 0.0, 1.0, 0.60)),
}

# Ancho máximo de salida por archivo (evita imágenes pesadas sin necesidad)
ANCHOS_MAX = {
    "buffet-copas": 1800,
    "exterior": 1600,
    "buffet-plato": 1440,
    "ceviche": 1080,
}

# Fotografías limpias (sin texto) que solo se reescalan
LIMPIAS = {
    "hero-patio": ("vista2.jpg", 1920),
    "barra": ("bar.jpg", 1600),
    "buffet-sopas": ("brunch.jpg", 1600),
    "panaderia": ("buffet-pan2.jpg", 1800),
    "croissants": ("buffet-pan.jpg", 1600),
    "capirotada": ("postre2.jpg", 1600),
}

ANCHOS_WEB = (768, 1280)  # anchos adicionales para srcset

# Calidad por archivo para mantener el peso bajo sin perder calidad perceptible
CALIDADES = {
    "hero-patio": 68,
    "buffet-copas": 78,
    "panaderia": 78,
    "exterior": 80,
}

# Calidad de las variantes pequeñas (768/1280) cuando la imagen es el LCP.
# El hero se sirve en q44 como máximo para que móvil pinte antes; el velo
# oscuro del hero oculta la pérdida percibida.
CALIDADES_VARIANTE = {
    "hero-patio": 38,
}


def preparar_carpetas() -> None:
    IMG.mkdir(parents=True, exist_ok=True)


def guardar_webp(imagen: Image.Image, nombre: str, calidad: int = 82) -> None:
    """Guarda la imagen principal y sus versiones para srcset."""
    imagen = ImageOps.exif_transpose(imagen).convert("RGB")
    ancho, alto = imagen.size
    principal = IMG / f"{nombre}.webp"
    imagen.save(principal, "WEBP", quality=calidad, method=6)
    srcset = []
    for ancho_web in ANCHOS_WEB:
        if ancho_web < ancho:
            ratio = ancho_web / ancho
            versión = imagen.resize((ancho_web, round(alto * ratio)), Image.LANCZOS)
            # Las versiones pequeñas se comprimen más: se ven en pantallas chicas
            # El hero en 768 px (LCP en móvil) baja a q38: es lo que pinta el
            # primer golpe de vista y el velo oscuro oculta la pérdida.
            calidad_variante = max(44, calidad - 28)
            if ancho_web == 768 and nombre in CALIDADES_VARIANTE:
                calidad_variante = CALIDADES_VARIANTE[nombre]
            versión.save(IMG / f"{nombre}-{ancho_web}.webp", "WEBP", quality=calidad_variante, method=6)
            srcset.append(ancho_web)
    print(f"[ok] {nombre}.webp {ancho}x{alto} ({principal.stat().st_size // 1024} KB)")


def procesar_fotos() -> None:
    for nombre, (archivo, caja) in RECORTES.items():
        ruta = RECursos / archivo
        if not ruta.exists():
            print(f"[warn] falta {archivo}, se omite {nombre}")
            continue
        imagen = ImageOps.exif_transpose(Image.open(ruta)).convert("RGB")
        ancho, alto = imagen.size
        x0, y0, x1, y1 = caja
        recorte = imagen.crop((round(x0 * ancho), round(y0 * alto), round(x1 * ancho), round(y1 * alto)))
        ancho_max = ANCHOS_MAX.get(nombre)
        if ancho_max and recorte.size[0] > ancho_max:
            ratio = ancho_max / recorte.size[0]
            recorte = recorte.resize((ancho_max, round(recorte.size[1] * ratio)), Image.LANCZOS)
        guardar_webp(recorte, nombre, calidad=CALIDADES.get(nombre, 84))

    for nombre, (archivo, ancho_max) in LIMPIAS.items():
        ruta = RECursos / archivo
        if not ruta.exists():
            print(f"[warn] falta {archivo}, se omite {nombre}")
            continue
        imagen = ImageOps.exif_transpose(Image.open(ruta)).convert("RGB")
        ancho, alto = imagen.size
        if ancho > ancho_max:
            ratio = ancho_max / ancho
            imagen = imagen.resize((ancho_max, round(alto * ratio)), Image.LANCZOS)
        guardar_webp(imagen, nombre, calidad=CALIDADES.get(nombre, 82))


def variantes_logo() -> None:
    """Deriva versiones claro/oscuro del logotipo oficial SIN redibujarlo.

    El logotipo original es arte blanco sobre verde olivo. Se extrae la silueta
    a partir del brillo y se recolorea, conservando la forma original.
    """
    ruta = RECursos / "logo.png"
    if not ruta.exists():
        print("[warn] no se encontró recursos/logo.png")
        return

    original = ImageOps.exif_transpose(Image.open(ruta)).convert("RGB")
    gris = original.convert("L")
    fondo_luminosidad = sum(c * w for c, w in zip(VERDE_OFICIAL, (0.299, 0.587, 0.114)))
    # máscara de opacidad: fondo (≈70) → 0 ; arte blanco (255) → 255
    alfa = gris.point(lambda p: 0 if p <= fondo_luminosidad + 6 else min(255, round((p - fondo_luminosidad - 6) / (255 - fondo_luminosidad - 6) * 255)))

    for nombre, color in (("logo-claro", (255, 255, 255)), ("logo-oscuro", VERDE_OFICIAL)):
        capa = Image.new("RGBA", original.size, color + (0,))
        capa.putalpha(alfa)
        capa.save(PUBLIC / f"{nombre}.png", optimize=True)
        print(f"[ok] {nombre}.png")

    # ornamento (marco cuadrado) recortado del logotipo oficial
    ancho, alto = original.size
    ornamento = capa_recorte_ornamento(original, alfa, ancho, alto)
    ornamento.save(PUBLIC / "ornamento-claro.png", optimize=True)
    oscuro = Image.new("RGBA", ornamento.size, VERDE_OFICIAL + (0,))
    oscuro.putalpha(ornamento.getchannel("A"))
    oscuro.save(PUBLIC / "ornamento-oscuro.png", optimize=True)
    print("[ok] ornamento-claro.png / ornamento-oscuro.png")

    # favicon: ornamento blanco sobre el verde oficial, cuadrado
    lado = min(ornamento.size)
    favicon = Image.new("RGB", (lado, lado), VERDE_OFICIAL)
    fondo_blanco = Image.new("RGBA", (lado, lado), (255, 255, 255, 0))
    fondo_blanco.paste(ornamento, ((lado - ornamento.size[0]) // 2, 0), ornamento)
    favicon.paste(fondo_blanco, (0, 0), fondo_blanco)
    favicon.resize((512, 512), Image.LANCZOS).save(PUBLIC / "og-image-square.png", optimize=True)
    favicon.resize((180, 180), Image.LANCZOS).save(PUBLIC / "apple-touch-icon.png", optimize=True)
    favicon.resize((64, 64), Image.LANCZOS).save(PUBLIC / "favicon.png", optimize=True)
    print("[ok] favicon.png / apple-touch-icon.png")

    # imagen Open Graph: logotipo oficial centrado sobre verde olivo (1200x630)
    og = Image.new("RGB", (1200, 630), VERDE_OFICIAL)
    marca = original.copy()
    marca_alto = 460
    marca = marca.resize((round(marca.size[0] * marca_alto / marca.size[1]), marca_alto), Image.LANCZOS)
    marca_rgba = marca.convert("RGBA")
    marca_rgba.putalpha(alfa.resize(marca.size, Image.LANCZOS))
    og.paste(marca_rgba, ((1200 - marca.size[0]) // 2, (630 - marca_alto) // 2), marca_rgba)
    og.save(PUBLIC / "og-image.jpg", quality=88, optimize=True)
    print("[ok] og-image.jpg")

    # Versiones pequeñas del logotipo para el encabezado y el pie
    for nombre, ancho in (("logo-claro-160", 160), ("logo-claro-240", 240), ("logo-claro-360", 360)):
        variante = capa.resize((ancho, round(capa.size[1] * ancho / capa.size[0])), Image.LANCZOS)
        variante.save(PUBLIC / f"{nombre}.png", optimize=True)
        print(f"[ok] {nombre}.png")

    # Ornamento en tamaño reducido para uso decorativo en la página.
    # WebP con alfa: ~12 KB menos que el PNG equivalente.
    for nombre, base in (("ornamento-claro-160", ornamento), ("ornamento-oscuro-160", oscuro)):
        ancho_mini = 160
        mini = base.resize((ancho_mini, round(base.size[1] * ancho_mini / base.size[0])), Image.LANCZOS)
        mini.save(PUBLIC / f"{nombre}.webp", "WEBP", quality=80, method=6, exact=False)
        print(f"[ok] {nombre}.webp")


def capa_recorte_ornamento(original: Image.Image, alfa: Image.Image, ancho: int, alto: int) -> Image.Image:
    """Recorta el marco cuadrado con el ornamento interior del logotipo oficial."""
    marca = Image.new("RGBA", original.size, VERDE_OFICIAL + (0,))
    marca.putalpha(alfa)
    # el marco exterior ocupa aproximadamente x: 0.155–0.825 / y: 0.095–0.715 del logo
    caja = (round(0.150 * ancho), round(0.085 * alto), round(0.830 * ancho), round(0.725 * alto))
    return marca.crop(caja)


def main() -> None:
    if not RECursos.exists():
        sys.exit("No se encontró la carpeta 'recursos' junto al proyecto.")
    preparar_carpetas()
    procesar_fotos()
    variantes_logo()
    print("\nListo. Assets generados en /public")


if __name__ == "__main__":
    main()
