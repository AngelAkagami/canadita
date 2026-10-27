# -*- coding: utf-8 -*-
"""Verifica que la vista /menu muestre exactamente los datos de menu.json
y menu.ts: nombres, precios de desayunos, jugos (2 tamaños), bebidas
calientes y sugerencias del chef. Comprueba también que los campos `todo`
NO se rendericen al visitante.

Uso: python scripts/verificar-menu.py  (requiere `npm run build` previo)
"""
import json
import pathlib
import re
import sys

raiz = pathlib.Path(__file__).resolve().parents[1]
archivo_html = raiz / "dist" / "menu" / "index.html"

if not archivo_html.exists():
    print("FALLA dist/menu/index.html no existe (ejecuta npm run build)")
    sys.exit(1)

html = archivo_html.read_text(encoding="utf-8")
datos = json.loads((raiz / "src" / "data" / "menu.json").read_text(encoding="utf-8"))
ts = (raiz / "src" / "data" / "menu.ts").read_text(encoding="utf-8")

faltan = []

# --- Desayunos (precio entero → "$170") ---
for categoria in datos["desayunos"]:
    for item in categoria["items"]:
        precio = f"${item['precio']}"
        if item["nombre"] not in html:
            faltan.append(f"desayuno ausente: {item['nombre']}")
        if precio not in html:
            faltan.append(f"precio ausente: {item['nombre']} {precio}")

# --- Jugos (precios por tamaño: ["$75", "$95"]) ---
for item in datos["bebidas"]["jugos"]["items"]:
    if item["nombre"] not in html:
        faltan.append(f"jugo ausente: {item['nombre']}")
    for precio in item["precio"]:
        esperado = f"${precio}"
        if esperado not in html:
            faltan.append(f"precio de jugo ausente: {item['nombre']} {esperado}")

# --- Bebidas calientes ---
for item in datos["bebidas"]["calientes"]:
    if item["nombre"] not in html:
        faltan.append(f"bebida caliente ausente: {item['nombre']}")
    if f"${item['precio']}" not in html:
        faltan.append(f"precio ausente: {item['nombre']} ${item['precio']}")

# --- Sugerencias del chef (pares nombre/precio de menu.ts) ---
parejas = re.findall(
    r"nombre: '([^']+)',[^{}]*?precio: '(\$[\d,]+)'", ts, flags=re.S
)
if len(parejas) < 30:
    faltan.append(f"se esperaban >=30 platillos del chef y se hallaron {len(parejas)}")
for nombre, precio in parejas:
    if nombre not in html:
        faltan.append(f"chef ausente: {nombre}")
    if precio not in html:
        faltan.append(f"precio del chef ausente: {nombre} {precio}")

# --- Los campos `todo` no deben renderizarse ---
for coincidencia in re.findall(r'"todo"\s*:\s*"([^"]+)"', json.dumps(datos, ensure_ascii=False)):
    fragmento = coincidencia[:40]
    if fragmento in html:
        faltan.append(f"texto 'todo' renderizado: {fragmento}")

# --- No deben colar marcadores de datos crudos ---
for marcador in ("[object Object]", "undefined", "${"):
    if marcador in html:
        faltan.append(f"marcador crudo en HTML: {marcador}")

# --- Conteos de estructura ---
if len(re.findall(r"<h3", html)) != 15:
    faltan.append(f"se esperaban 15 categorías (h3) y hay {len(re.findall(r'<h3', html))}")
placeholders = len(re.findall(r"TODO: foto", html))
if placeholders != 7:
    faltan.append(f"se esperaban 7 placeholders TODO y hay {placeholders}")

if faltan:
    print("FALLA verificación de /menu:")
    for fallo in faltan:
        print(" -", fallo)
    sys.exit(1)

print(
    f"OK  /menu: {len(parejas)} chef + "
    f"{sum(len(c['items']) for c in datos['desayunos'])} desayunos + "
    f"{len(datos['bebidas']['jugos']['items'])} jugos + "
    f"{len(datos['bebidas']['calientes'])} calientes verificados; "
    f"{placeholders} placeholders TODO"
)
