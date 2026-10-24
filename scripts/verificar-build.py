"""Verificación final del build: enlaces clave, PDF, JSON-LD y metadatos.

Uso:  python scripts/verificar-build.py
"""

import os
import re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(RAIZ, "dist", "index.html"), encoding="utf-8").read()

links = set(re.findall(r'href="([^"]+)"', html)) | set(re.findall(r'src="([^"]+)"', html))
interes = [
    l
    for l in links
    if any(x in l for x in ("tel:", "wa.me", "maps", "facebook", "instagram", "logo-", "favicon", "og-image"))
]
print("ENLACES CLAVE")
for l in sorted(interes):
    print(" ", l)

print()
pdf_en_dist = os.path.exists(os.path.join(RAIZ, "dist", "carta", "sugerencias-chef.pdf"))
print("PDF no publicado (correcto):", not pdf_en_dist)
print("Referencias al PDF en el HTML (debe ser False):", "sugerencias-chef.pdf" in html)
print("JSON-LD:", "application/ld+json" in html, "| Restaurant:", '"Restaurant"' in html)
print("OG image:", 'property="og:image"' in html)
print("Imágenes decorativas con alt vacío:", html.count('alt=""'))

# Cada imagen debe tener alt atributo
imgs = re.findall(r"<img\b[^>]*>", html)
sin_alt = [i for i in imgs if "alt=" not in i]
print("Total <img>:", len(imgs), "| sin atributo alt:", len(sin_alt))

# Imágenes que declaran width y height (evita CLS)
sin_dim = [i for i in imgs if "width=" not in i or "height=" not in i]
print("Sin width/height declarado:", len(sin_dim))
for i in sin_dim[:5]:
    print("   ", i[:120])
