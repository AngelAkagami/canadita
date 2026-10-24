"""Lista oportunidades de rendimiento de un reporte Lighthouse con ahorro estimado.

Uso:  python scripts/oportunidades-lighthouse.py qa/lh-movil.json
"""

import json
import sys


def main() -> None:
    ruta = sys.argv[1] if len(sys.argv) > 1 else "qa/lh-movil.json"
    reporte = json.load(open(ruta, encoding="utf-8"))
    auditorias = reporte["audits"]

    filas = []
    for clave, aud in auditorias.items():
        if not isinstance(aud, dict) or aud.get("score") in (None, 1, "notApplicable"):
            continue
        detalles = aud.get("details") or {}
        ahorro_ms = detalles.get("overallSavingsMs") or 0
        ahorro_b = detalles.get("overallSavingsBytes") or 0
        if ahorro_ms or ahorro_b:
            filas.append((ahorro_ms, ahorro_b, clave, aud.get("title")))

    filas.sort(reverse=True)
    print(f"{'AHORRO':>10}  {'BYTES':>9}  AUDITORÍA")
    for ms, b, clave, titulo in filas:
        print(f"{ms:>8.0f}ms {b:>9.0f}  {clave} — {titulo}")

    print("\nDetalle de render-blocking / fuentes:")
    for clave in ("render-blocking-resources", "font-display", "unused-css-rules",
                  "unused-javascript", "modern-image-formats", "uses-responsive-images",
                  "preload-lcp-image", "lcp-lazy-loaded", "prioritize-image-lcp"):
        aud = auditorias.get(clave) or {}
        if aud.get("score") in (None, 1, "notApplicable"):
            continue
        print(f"  [{aud.get('score')}] {aud.get('title')}")
        for item in (aud.get("details") or {}).get("items", [])[:5]:
            if "url" in item:
                print(f"      {item['url'][:100]} {item.get('wastedMs', '')} {item.get('wastedBytes', '')}")
            else:
                print(f"      {str(item)[:140]}")


if __name__ == "__main__":
    main()
