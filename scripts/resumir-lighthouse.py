"""Resume un reporte de Lighthouse (JSON): métricas y auditorías fallidas.

Uso:  python scripts/resumir-lighthouse.py qa/lh-movil.json
"""

import json
import sys


def main() -> None:
    ruta = sys.argv[1] if len(sys.argv) > 1 else "qa/lh-movil.json"
    reporte = json.load(open(ruta, encoding="utf-8"))
    auditorias = reporte["audits"]

    print("CATEGORÍAS")
    for nombre, cat in reporte["categories"].items():
        print(f"  {nombre}: {round((cat.get('score') or 0) * 100)}")

    print("\nMÉTRICAS (móvil simulado)")
    for clave in (
        "first-contentful-paint",
        "largest-contentful-paint",
        "cumulative-layout-shift",
        "total-blocking-time",
        "speed-index",
        "server-response-time",
        "total-byte-weight",
    ):
        aud = auditorias.get(clave, {})
        if "numericValue" in aud:
            unidad = aud.get("numericUnit", "")
            valor = round(aud["numericValue"], 1)
            extra = f" ({round(aud['numericValue'] / 1000, 1)} s)" if unidad == "millisecond" and aud["numericValue"] > 1000 else ""
            print(f"  {clave}: {valor} {unidad}{extra}")

    lcp = auditorias.get("largest-contentful-paint-element", {}).get("details", {}).get("items", [])
    if lcp:
        for item in lcp[0].get("items", [])[:2]:
            nodo = item.get("node", {})
            print(f"\n  LCP → {nodo.get('selector')}")

    print("\nAUDITORÍAS FALLIDAS")
    for clave, aud in sorted(auditorias.items()):
        if aud.get("score") not in (None, 1):
            if clave in ("bootup-time", "mainthread-work-breakdown", "network-dependency-tree",
                         "font-display", "layout-shifts", "unsized-images", "dom-size",
                         "legacy-javascript", "third-party-facades", "lcp-lazy-loaded",
                         "preload-lcp-image", "prioritize-image-lcp"):
                continue
            print(f"\n  [{aud.get('score')}] {aud.get('title')}")
            for item in (aud.get("details") or {}).get("items", [])[:6]:
                if "node" in item:
                    print(f"      nodo: {item['node'].get('selector')}")
                    if item["node"].get("explanation"):
                        print(f"      {item['node']['explanation'][:200]}")
                elif "url" in item:
                    nombre = item["url"].split("/")[-1][:70]
                    extra = {k: item[k] for k in ("wastedBytes", "totalBytes", "wastedMs") if k in item}
                    print(f"      {nombre} {extra}")


if __name__ == "__main__":
    main()
