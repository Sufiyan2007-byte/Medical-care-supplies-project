"""One-off: download Medical Consumables product images from medicalsupplies.sa."""
from __future__ import annotations

import io
import re
import sys
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "client" / "public" / "consumables_images"
SEED = ROOT / "server" / "prisma" / "seed.js"

DOWNLOADS: dict[str, str] = {
    "compat-ella-enteral-feeding-bag-1l.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001188.png",
    "flocare-enteral-feeding-container-1l.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001190.png",
    "flocare-infinity-feeding-pack-set.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001189.png",
    "enteral-feeding-transition-connector.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001191.png",
    "bacterial-viral-breathing-circuit-filter.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001225.png",
    "closed-suction-catheter-12fr.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001209-1.png",
    "hme-filter-heat-moisture-exchanger.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001226.png",
    "sterile-tracheostomy-care-tray.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001227.png",
    "suction-catheter-12fr.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001205-2.png",
    "suction-catheter-14fr.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001206-2.png",
    "tracheostomy-tube-holder-adult.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001224-2.png",
    "spirometer-bacterial-viral-filter-mir.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/10/2.jpg",
    "sidestream-nebulizer-disposable-kit.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001069.png",
    "sidestream-nebulizer-angled-mouthpiece.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001070.png",
    "sidestream-nebulizer-child-mask.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001071.png",
    "optichamber-diamond-spacer-chamber.jpg": "https://medicalsupplies.sa/wp-content/uploads/2026/08/1680501000003537797-9.jpg",
    "humidifier-connector-tube-everflo.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001055.png",
    "latex-examination-gloves-powder-free.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001196.png",
    "sterile-surgical-gloves-powder-free-size-7.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001199.png",
    "vinyl-examination-gloves-powder-free.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001192.png",
    "face-mask-ear-loop-3-ply.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001206.png",
    "avant-gauze-tracheostomy.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001200.png",
    "3m-micropore-paper-tape-5cm.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001203-1.png",
    "alcohol-prep-swabs-box-200.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001199-2.png",
    "sterile-gauze-swabs-4x4-12ply.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001204.webp",
    "cotton-tipped-applicators-pack.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001201-2.png",
    "iodine-swab-sticks-box-100.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001208-1.png",
    "3m-micropore-paper-tape-2-5cm.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001202-2.png",
    "mefix-self-adhesive-fixation-tape.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/2.jpg",
    "mepitac-silicone-fixation-tape-2cm.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/1.jpg",
    "mepitac-silicone-fixation-tape-4cm.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/1.jpg",
    "melgisorb-plus-alginate-dressing.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/3.png",
    "mepiform-soft-silicone-scar-dressing.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/23.jpg",
    "mepitel-silicone-wound-contact-layer.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/26.png",
    "mepitel-film-silicone-contact-film.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/25.jpg",
    "mepitel-one-silicone-contact-layer.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/24.jpg",
    "mepore-adhesive-absorbent-dressing.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/29.jpg",
    "mepore-film-waterproof-dressing.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/32.jpg",
    "mepore-pro-post-operative-dressing.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/30.jpg",
    "mesalt-sodium-chloride-impregnated-gauze.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/27.jpg",
    "mesalt-sodium-chloride-gauze-ribbon.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/28.png",
    "mepilex-ag-antimicrobial-silver-foam.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/10.png",
    "mepilex-border-silicone-foam-dressing.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/13.jpg",
    "mepilex-border-ag-antimicrobial-foam.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/20.jpg",
    "mepilex-border-flex-silicone-foam.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/16.png",
    "mepilex-border-lite-silicone-foam.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/19.jpg",
    "mepilex-border-post-op-silicone-foam.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/14.png",
    "mepilex-border-post-op-ag-dressing.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/15.jpg",
    "mepilex-border-sacrum-silicone-foam.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/18.jpg",
    "mepilex-border-sacrum-ag-dressing.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/21.jpg",
    "mepilex-heel-silicone-foam-dressing.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/8.jpg",
    "mepilex-heel-ag-antimicrobial-dressing.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/12.jpg",
    "mepilex-lite-silicone-foam-dressing.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/9.jpg",
    "mepilex-transfer-silicone-contact.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/22.png",
    "mepilex-transfer-ag-antimicrobial.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/12/11.png",
    "foley-catheter-18fr.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001186.png",
    "flexi-trak-catheter-anchoring-device.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001221-2.png",
    "urine-drainage-bag-2000ml.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001222-2.png",
    "sterile-urine-specimen-container-120ml.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001202.png",
    "isopropyl-alcohol-70-disinfectant-5l.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001187.png",
    "disposable-underpad-60x90.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001204.png",
    "disposable-wash-cloths-pack.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001201.png",
    "dentips-oral-care-swabs.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001208.png",
    "3-way-stopcock.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001209.png",
    "enteral-feeding-set-jp2-001.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001147.png",
    "enteral-feeding-set-jp2-101.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001148.png",
    "enteral-feeding-set-jp2-105.jpg": "https://medicalsupplies.sa/wp-content/uploads/2022/07/10001149.png",
}

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


def expected_from_seed() -> list[str]:
    text = SEED.read_text(encoding="utf-8")
    return re.findall(r"image: '/consumables_images/([^']+)'", text)


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read()


def save_as_jpg(data: bytes, url: str, dest: Path) -> None:
    url_lower = url.split("?")[0].lower()
    if url_lower.endswith((".jpg", ".jpeg")):
        dest.write_bytes(data)
        return
    img = Image.open(io.BytesIO(data))
    if img.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        bg.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")
    img.save(dest, format="JPEG", quality=95, subsampling=0, optimize=False)


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    expected = expected_from_seed()
    missing_map = set(expected) - set(DOWNLOADS)
    extra_map = set(DOWNLOADS) - set(expected)
    if missing_map:
        print("ERROR: seed images missing from DOWNLOADS:", sorted(missing_map), file=sys.stderr)
        return 1
    if extra_map:
        print("WARN: extra DOWNLOADS not in seed:", sorted(extra_map))

    failed: list[str] = []
    for name in expected:
        url = DOWNLOADS[name]
        dest = OUT_DIR / name
        try:
            data = fetch(url)
            if len(data) < 500:
                print(f"WARN {name}: suspiciously small ({len(data)} bytes)")
            save_as_jpg(data, url, dest)
            print(f"OK  {name}  ({len(dest.read_bytes())} bytes)")
        except Exception as exc:
            print(f"FAIL {name}: {exc}", file=sys.stderr)
            failed.append(name)

    on_disk = sorted(p.name for p in OUT_DIR.glob("*.jpg"))
    missing_files = sorted(set(expected) - set(on_disk))
    print("\n--- Summary ---")
    print(f"Expected from seed: {len(expected)}")
    print(f"On disk (*.jpg):    {len(on_disk)}")
    if missing_files:
        print("Missing files:", missing_files)
    if failed:
        print("Failed downloads:", failed)
        return 1
    if missing_files:
        return 1
    print("All seed consumables images present.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
