"""Comprueba que los botones de categorías del menú enlancen a secciones existentes.

Uso:  python scripts/verificar-anclas.py
"""

import re

html = open("dist/index.html", encoding="utf-8").read()

ids = set(re.findall(r'id="([^"]+)"', html))

# Sección de navegación por categorías del menú
m = re.search(r'<nav aria-label="[^"]*ategor[^"]*"(.*?)</nav>', html, re.S)
if not m:
    raise SystemExit("No se encontró la navegación de categorías")

anclas = re.findall(r'href="#([^"]+)"', m.group(1))
print(f"Botones de categoría: {len(anclas)}")
fallas = 0
for a in anclas:
    estado = "OK" if a in ids else "FALLA"
    if a not in ids:
        fallas += 1
    print(f"  #{a} -> {estado}")

print(f"\nResultado: {'todas las anclas funcionan' if fallas == 0 else str(fallas) + ' anclas rotas'}")
