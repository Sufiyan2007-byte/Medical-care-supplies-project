"""Remove non-instrument / trademark / equipment rows from B&B merge."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "client" / "public" / "xelpov_products.json"

REMOVE = re.compile(
    r"residents program|free gift|power strip|hospital grade power|light source|lamp replacement|"
    r"onyx-lite|xs-300|xenon light|led light source w/|zoom coupler|camera coupler|"
    r"mobile stand|pressure cuff infiltration|squeeze bulb|manometer|"
    r"toomey aspiration|stylette|wolf screw|medical grade a/c|monopolar cable.*bovie|"
    r"silicone suction tube|emesis basin|sterilizing pan|sponge basin|strainer, stainless|"
    r"autoclavable eye shield|bipolar cables|delrin|luer to luer|"
    r"nobletouch|sofdtouch|vitruvian|liposaber|microaire|tebbetts|black diamond|"
    r"cannula|power hub|harvester|residents|gift|endoscopic plastic retractor for 10mm",
    re.I,
)

NOTE = "No clean unbranded photo found online — needs a professional photo taken."


def main() -> None:
    products = json.loads(CATALOG.read_text(encoding="utf-8"))
    kept = []
    removed = []
    for p in products:
        src = p.get("sourceUrl") or ""
        if "blackandblack" in src.lower() and REMOVE.search(p.get("name", "")):
            removed.append(p["name"])
            continue
        kept.append(p)

    for p in kept:
        if not p.get("image"):
            p["note"] = NOTE

    CATALOG.write_text(json.dumps(kept, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("removed", len(removed), "remaining", len(kept))
    for n in removed:
        print("-", n)


if __name__ == "__main__":
    main()
