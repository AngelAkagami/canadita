"""
Descarga y auto-aloja las tipografías de la landing (Google Fonts).

Genera:
  - public/fonts/*.woff2        (subconjuntos latin y latin-ext)
  - src/styles/fuentes.css      (reglas @font-face locales con font-display: swap)

La página deja de depender de fonts.googleapis.com: se elimina una petición
externa bloqueante y mejora el rendimiento.

Uso:  python scripts/descargar-tipografias.py
"""

from __future__ import annotations

import re
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
Fuentes = RAIZ / "public" / "fonts"
CSS_DESTINO = RAIZ / "src" / "styles" / "fuentes.css"

UA_CHROME = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

URL_CSS = (
    "https://fonts.googleapis.com/css2"
    "?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500"
    "&family=Inter:wght@400;500;600"
    "&display=swap"
)

SUBCONJUNTOS = ("latin", "latin-ext")


def obtener(url: str) -> bytes:
    peticion = urllib.request.Request(url, headers={"User-Agent": UA_CHROME})
    with urllib.request.urlopen(peticion, timeout=30) as respuesta:
        return respuesta.read()


def main() -> None:
    Fuentes.mkdir(parents=True, exist_ok=True)
    css = obtener(URL_CSS).decode("utf-8")

    # Cada bloque: /* latin */ @font-face { ... }
    bloques = re.findall(r"/\* (?P<sub>[\w-]+) \*/\s*(?P<bloque>@font-face \{.*?\})", css, re.S)
    salida: list[str] = [
        "/* Tipografías auto-alojadas (generado por scripts/descargar-tipografias.py).",
        "   Fuentes: Cormorant Garamond e Inter — licencia SIL Open Font License. */",
        "",
    ]
    descargadas = 0

    for subconjunto, bloque in bloques:
        if subconjunto not in SUBCONJUNTOS:
            continue
        familia = re.search(r"font-family: '([^']+)'", bloque).group(1)
        estilo = re.search(r"font-style: (\w+)", bloque).group(1)
        peso = re.search(r"font-weight: (\d+)", bloque).group(1)
        url_woff2 = re.search(r"url\((https://[^)]+\.woff2)\)", bloque)
        if not url_woff2:
            continue

        slug = f"{familia.lower().replace(' ', '-')}-{peso}-{estilo}-{subconjunto}.woff2"
        destino = Fuentes / slug
        if not destino.exists():
            destino.write_bytes(obtener(url_woff2.group(1)))
        descargadas += 1

        bloque_local = bloque.replace(url_woff2.group(1), f"/fonts/{slug}")
        # Asegura font-display: swap
        if "font-display" not in bloque_local:
            bloque_local = bloque_local.replace("@font-face {", "@font-face {\n  font-display: swap;")
        salida.append(f"/* {familia} {peso} {estilo} — {subconjunto} */")
        salida.append(bloque_local)
        salida.append("")

    CSS_DESTINO.write_text("\n".join(salida), encoding="utf-8")
    print(f"[ok] {descargadas} variantes descargadas en /public/fonts")
    print(f"[ok] reglas @font-face en {CSS_DESTINO.relative_to(RAIZ)}")


if __name__ == "__main__":
    main()
