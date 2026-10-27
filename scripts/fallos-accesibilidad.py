# -*- coding: utf-8 -*-
"""Lista los fallos de accesibilidad de un reporte de Lighthouse."""
import json
import pathlib
import sys

archivo = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "qa/lh-home.json")
lh = json.loads(archivo.read_text(encoding="utf-8"))
ids_a11y = {
    ref["id"]
    for ref in lh["categories"]["accessibility"]["auditRefs"]
}

for aid, a in lh["audits"].items():
    s = a.get("score")
    if aid in ids_a11y and s is not None and s < 1:
        print(f"{aid}: score {s} | {a.get('title')}")
        for it in (a.get("details") or {}).get("items", [])[:5]:
            n = it.get("node") or {}
            sel = (n.get("selector") or "")[:110]
            etiqueta = (n.get("nodeLabel") or "")[:60]
            expl = (n.get("explanation") or "")[:140]
            print(f"   - {sel} | {etiqueta} | {expl}")
            sub = (it.get("subItems") or {}).get("items") or []
            for x in sub[:3]:
                print("       ·", str(x)[:160])
