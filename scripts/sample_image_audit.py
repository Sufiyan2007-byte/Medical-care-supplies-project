"""Sample product images across category folders for manual/vision audit tracking."""
from __future__ import annotations

import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "client" / "public" / "xelpov_products.json"
PUBLIC = ROOT / "client" / "public"
OUT = ROOT / "scripts" / "reports" / "image_audit_sample.json"

SAMPLES_PER_FOLDER = 2
SEED = 20260328


def main() -> None:
    products = json.loads(CATALOG.read_text(encoding="utf-8"))
    by_folder: dict[str, list] = {}
    for p in products:
        img = p.get("image") or ""
        if not img.startswith("/xelpov_images/"):
            continue
        rel = img[len("/xelpov_images/") :]
        folder = rel.split("/")[0] if "/" in rel else "_root"
        by_folder.setdefault(folder, []).append(p)

    random.seed(SEED)
    sample = []
    for folder in sorted(by_folder):
        picks = random.sample(by_folder[folder], min(SAMPLES_PER_FOLDER, len(by_folder[folder])))
        for p in picks:
            path = PUBLIC / p["image"].lstrip("/")
            sample.append(
                {
                    "slug": p["slug"],
                    "name": p["name"],
                    "folder": folder,
                    "image": p["image"],
                    "file_exists": path.is_file(),
                    "sourceUrl": p.get("sourceUrl") or "",
                }
            )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(sample, indent=2), encoding="utf-8")
    print(f"Folders: {len(by_folder)}")
    print(f"Sample size: {len(sample)}")
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
