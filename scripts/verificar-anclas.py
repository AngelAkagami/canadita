# -*- coding: utf-8 -*-
"""Comprueba que todos los enlaces de ancla del sitio apunten a secciones
existentes, en ambos sentidos:

  - dist/index.html:      href="#x"     → id "x" en la misma página
  - dist/menu/index.html: href="#x"     → id "x" en /menu (chips)
  - dist/menu/index.html: href="/#x"    → id "x" en la home

Uso:  python scripts/verificar-anclas.py  (requiere `npm run build` previo)
"""

import pathlib
import re
import sys

raiz = pathlib.Path(__file__).resolve().parents[1]
home = (raiz / "dist" / "index.html").read_text(encoding="utf-8")
carta = (raiz / "dist" / "menu" / "index.html").read_text(encoding="utf-8")

ids_home = set(re.findall(r'id="([^"]+)"', home))
ids_carta = set(re.findall(r'id="([^"]+)"', carta))

fallas = []


def revisar(nombre, html, ids_propios, ids_externos):
    anclas = set(re.findall(r'href="#([^"]+)"', html))
    externas = set(re.findall(r'href="/#([^"]+)"', html))
    for ancla in sorted(anclas):
        if ancla not in ids_propios:
            fallas.append(f"{nombre}: #{ancla} no existe en la página")
    for ancla in sorted(externas):
        if ancla not in ids_externos:
            fallas.append(f"{nombre}: /#{ancla} no existe en la home")
    print(f"{nombre}: {len(anclas)} anclas locales, {len(externas)} anclas a la home")


revisar("home", home, ids_home, ids_home)
revisar("/menu/", carta, ids_carta, ids_home)

# Destinos de navegación entre páginas
if 'href="/menu/"' not in home and 'href="/menu/"' not in carta:
    fallas.append("ninguna página enlaza a /menu/")

if fallas:
    print("FALLA anclas rotas:")
    for fallo in fallas:
        print(" -", fallo)
    sys.exit(1)

print("Resultado: todas las anclas funcionan")
