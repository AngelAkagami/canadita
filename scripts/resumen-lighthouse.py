# -*- coding: utf-8 -*-
"""Resumen de un reporte de Lighthouse (qa/lh-*.json): métricas y hallazgos."""
import json
import pathlib
import sys

archivo = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "qa/lh-home.json")
lh = json.loads(archivo.read_text(encoding="utf-8"))
audits = lh["audits"]

print(archivo.name)
cats = ", ".join(
    f"{k}: {round(v['score'] * 100)}" for k, v in lh["categories"].items()
)
print("categorías:", cats)

for aid in (
    "first-contentful-paint",
    "largest-contentful-paint",
    "total-blocking-time",
    "cumulative-layout-shift",
    "speed-index",
    "interactive",
):
    a = audits.get(aid)
    if a:
        print(f"  {aid}: {a.get('displayValue', '-')} (score {a.get('score')})")

print("--- hallazgos con score < 0.9:")
for aid, a in audits.items():
    if a.get("score") is not None and a["score"] < 0.9 and a.get("displayValue"):
        det = a.get("details", {})
        if det.get("type") in ("opportunity", "table", "list"):
            print(f"  {aid}: score {a['score']} | {a.get('displayValue')}")
            for item in det.get("items", [])[:4]:
                if isinstance(item, dict):
                    claves = [
                        k
                        for k in (
                            "url",
                            "totalBytes",
                            "wastedBytes",
                            "wastedMs",
                            "node",
                        )
                        if k in item
                    ]
                    vals = []
                    for k in claves:
                        v = item[k]
                        if k == "node" and isinstance(v, dict):
                            v = v.get("selector", "")[:80]
                        vals.append(f"{k}={v}")
                    if vals:
                        print("      -", " ".join(str(x) for x in vals))

lcp = audits.get("largest-contentful-paint-element", {})
items = lcp.get("details", {}).get("items", [])
for grupo in items:
    for nodo in grupo.get("items", []):
        print("LCP element:", nodo.get("node", {}).get("selector", "?")[:120])
