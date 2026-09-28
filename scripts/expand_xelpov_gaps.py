"""Add targeted catalogue gaps to xelpov_products.json (run once)."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "client" / "public" / "xelpov_products.json"

DEFAULT_PRICE = {"amount": None, "currency": "USD", "onRequest": True}


def norm_name(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", (s or "").lower()).strip()


def slugify(name: str) -> str:
    s = name.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:80]


def base_specs(**extra):
    d = {
        "material": "Stainless Steel",
        "finish": "Satin",
        "ceMarking": True,
        "reusable": True,
    }
    d.update(extra)
    return d


def entry(
    name,
    specialty,
    main_category,
    sub_category,
    description,
    image,
    specs=None,
    slug=None,
):
    return {
        "slug": slug or slugify(name),
        "name": name,
        "specialty": specialty,
        "mainCategory": main_category if isinstance(main_category, list) else [main_category],
        "subCategory": sub_category if isinstance(sub_category, list) else [sub_category],
        "specs": specs or base_specs(),
        "description": description,
        "image": image,
        "sourceUrl": "",
        "price": dict(DEFAULT_PRICE),
    }


NEW_PRODUCTS = [
    # ── Speculums (0 existing) ───────────────────────────────────────────
    entry(
        "Graves Vaginal Speculum, Small",
        ["Gynecology & Obstetrics", "General Surgery"],
        "Speculums",
        "Vaginal Speculums",
        "A bivalve vaginal speculum with a curved bill and side screw, sized for smaller anatomy. Used for pelvic examination and minor gynecologic procedures. Stainless steel, reusable after standard sterilization.",
        "/icon_surgical_instruments.png",
        base_specs(workingEndDetails="Bivalve, side screw", length="Small"),
    ),
    entry(
        "Graves Vaginal Speculum, Medium",
        ["Gynecology & Obstetrics", "General Surgery"],
        "Speculums",
        "Vaginal Speculums",
        "Standard medium Graves-pattern vaginal speculum for routine pelvic exams. Side screw permits gradual opening; satin finish reduces glare under exam lights.",
        "/icon_surgical_instruments.png",
        base_specs(workingEndDetails="Bivalve, side screw", length="Medium"),
    ),
    entry(
        "Graves Vaginal Speculum, Large",
        ["Gynecology & Obstetrics"],
        "Speculums",
        "Vaginal Speculums",
        "Large Graves-pattern vaginal speculum for patients requiring a wider blade spread. Locking thumb screw holds the blades at the chosen opening.",
        "/icon_surgical_instruments.png",
        base_specs(workingEndDetails="Bivalve, side screw", length="Large"),
    ),
    entry(
        "Pederson Vaginal Speculum, Medium",
        ["Gynecology & Obstetrics"],
        "Speculums",
        "Vaginal Speculums",
        "Narrower-blade Pederson vaginal speculum suited to nulliparous patients or tighter introitus. Same side-screw mechanism as standard Graves patterns.",
        "/icon_surgical_instruments.png",
        base_specs(workingEndDetails="Narrow bivalve", length="Medium"),
    ),
    entry(
        "Pederson Vaginal Speculum, Small",
        ["Gynecology & Obstetrics"],
        "Speculums",
        "Vaginal Speculums",
        "Small Pederson vaginal speculum with slim blades for adolescent or narrow-anatomy examinations.",
        "/icon_surgical_instruments.png",
        base_specs(workingEndDetails="Narrow bivalve", length="Small"),
    ),
    entry(
        "Sims Vaginal Speculum, Double Ended",
        ["Gynecology & Obstetrics"],
        "Speculums",
        "Vaginal Speculums",
        "Double-ended duckbill speculum for vaginal wall retraction during perineal or rectovaginal procedures. One end is typically narrower than the other for stepwise exposure.",
        "/icon_surgical_instruments.png",
        base_specs(workingEndDetails="Double-ended duckbill"),
    ),
    entry(
        "Killian Nasal Speculum, Medium",
        ["ENT", "General Surgery"],
        "Speculums",
        "Nasal Speculums",
        "Self-retaining nasal speculum with adjustable screw spread for septoplasty, rhinoplasty, and general nasal examination.",
        "/icon_surgical_instruments.png",
        base_specs(workingEndDetails="Self-retaining, screw spread"),
    ),
    entry(
        "Vienna Nasal Speculum, Standard",
        ["ENT"],
        "Speculums",
        "Nasal Speculums",
        "Hand-held Vienna-pattern nasal speculum for anterior rhinoscopy and packing placement. Spring or manual spread depending on tray configuration.",
        "/icon_surgical_instruments.png",
        base_specs(workingEndDetails="Hand-held bivalve"),
    ),
    entry(
        "Cottle Nasal Speculum, 6 in",
        ["ENT", "Plastic Surgery"],
        "Speculums",
        "Nasal Speculums",
        "Slender Cottle-type nasal speculum for precise alar and vestibular exposure during cosmetic and functional nasal surgery.",
        "/icon_surgical_instruments.png",
        base_specs(length="6 in"),
    ),
    entry(
        "Hartmann Nasal Speculum, Adult",
        ["ENT"],
        "Speculums",
        "Nasal Speculums",
        "Adult-size Hartmann-pattern nasal speculum for routine ENT examination. Rounded tips help protect mucosa during insertion.",
        "/icon_surgical_instruments.png",
        base_specs(workingEndDetails="Adult bivalve"),
    ),
    entry(
        "Ear Speculum, Set of 5 Sizes",
        ["ENT", "Diagnostic"],
        "Speculums",
        "Ear Speculums",
        "Reusable ear specula in graduated diameters for otoscopic examination. Compatible with standard otoscope handles used in clinic trays.",
        "/icon_surgical_instruments.png",
        base_specs(workingEndDetails="Graduated set of 5"),
    ),
    entry(
        "Buck Ear Speculum, 4 mm",
        ["ENT"],
        "Speculums",
        "Ear Speculums",
        "Single reusable 4 mm ear speculum for pediatric and narrow canal otoscopy.",
        "/icon_surgical_instruments.png",
        base_specs(workingEndDetails="4 mm"),
    ),
    entry(
        "Buck Ear Speculum, 6 mm",
        ["ENT"],
        "Speculums",
        "Ear Speculums",
        "Single reusable 6 mm ear speculum for routine adult otoscopy.",
        "/icon_surgical_instruments.png",
        base_specs(workingEndDetails="6 mm"),
    ),
    entry(
        "Ferguson Anal Speculum, Medium",
        ["General Surgery", "Stomach, Intestine & Rectum"],
        "Speculums",
        "Anal Speculums",
        "Ferguson-pattern anal speculum for anorectal examination and hemorrhoidal procedures. Side screw controls blade separation.",
        "/icon_surgical_instruments.png",
        base_specs(length="Medium"),
    ),
    entry(
        "Hirschman Anal Speculum, Small",
        ["General Surgery"],
        "Speculums",
        "Anal Speculums",
        "Compact Hirschman anal speculum for limited anorectal exposure in clinic settings.",
        "/icon_surgical_instruments.png",
        base_specs(length="Small"),
    ),
    entry(
        "Pratt Rectal Speculum, 1-1/4 in",
        ["General Surgery"],
        "Speculums",
        "Anal Speculums",
        "Pratt rectal speculum for rectal examination and low anterior procedures. Locking mechanism maintains retraction without constant hand pressure.",
        "/icon_surgical_instruments.png",
        base_specs(workingEndDetails="1-1/4 in blade"),
    ),
    entry(
        "Disposable-Style Vaginal Speculum, Medium (Reusable Steel)",
        ["Gynecology & Obstetrics"],
        "Speculums",
        "Vaginal Speculums",
        "Medium bivalve vaginal speculum with a streamlined profile similar to disposable clinic specula, manufactured in reusable stainless steel for sterilizable trays.",
        "/icon_surgical_instruments.png",
        base_specs(length="Medium"),
    ),
    # ── Electrosurgical (0 existing) ─────────────────────────────────────
    entry(
        "Monopolar Electrosurgical Pencil, Standard",
        ["General Surgery", "Gynecology & Obstetrics"],
        "Electrosurgical Instruments",
        "Monopolar Handpieces",
        "Reusable monopolar handpiece for cutting and coagulation when connected to a compatible electrosurgical generator. Accepts standard detachable electrodes.",
        "/icon_medical_consumables.png",
        base_specs(handleType="Pencil grip", insulation="Standard"),
    ),
    entry(
        "Monopolar Electrosurgical Pencil, Push-Button",
        ["General Surgery"],
        "Electrosurgical Instruments",
        "Monopolar Handpieces",
        "Monopolar pencil with finger push-button activation for cut/coag modes. Designed for single-hand control in open procedures.",
        "/icon_medical_consumables.png",
        base_specs(handleType="Push-button pencil"),
    ),
    entry(
        "Monopolar Active Electrode, Needle Tip",
        ["General Surgery", "Plastic Surgery"],
        "Electrosurgical Instruments",
        "Active Electrodes",
        "Replaceable needle-tip monopolar electrode for precise cutting and spot coagulation. Fits standard universal pencil connectors.",
        "/icon_medical_consumables.png",
        base_specs(workingEndDetails="Needle tip"),
    ),
    entry(
        "Monopolar Active Electrode, Ball Tip",
        ["General Surgery"],
        "Electrosurgical Instruments",
        "Active Electrodes",
        "Ball-tip monopolar electrode for broad coagulation and gentle tissue desiccation.",
        "/icon_medical_consumables.png",
        base_specs(workingEndDetails="Ball tip"),
    ),
    entry(
        "Monopolar Active Electrode, Loop",
        ["Gynecology & Obstetrics", "General Surgery"],
        "Electrosurgical Instruments",
        "Active Electrodes",
        "Wire-loop monopolar electrode for excision of superficial lesions and polypectomy-style resections when used with compatible generators.",
        "/icon_medical_consumables.png",
        base_specs(workingEndDetails="Loop"),
    ),
    entry(
        "Reusable Bipolar Forceps, 16 cm",
        ["Neurosurgery / Spine", "ENT", "General Surgery"],
        "Electrosurgical Instruments",
        "Bipolar Forceps",
        "Insulated bipolar forceps for coagulation in wet fields. 16 cm length suited to head, neck, and superficial open cases.",
        "/product_img_forceps.png",
        base_specs(length="16 cm", insulation="Bipolar insulated"),
    ),
    entry(
        "Reusable Bipolar Forceps, 20 cm",
        ["General Surgery", "Gynecology & Obstetrics"],
        "Electrosurgical Instruments",
        "Bipolar Forceps",
        "Longer insulated bipolar forceps for deep pelvic and abdominal access while connected to a bipolar generator output.",
        "/product_img_forceps.png",
        base_specs(length="20 cm", insulation="Bipolar insulated"),
    ),
    entry(
        "Bipolar Forceps, Bayonet Pattern, 18 cm",
        ["Neurosurgery / Spine", "ENT"],
        "Electrosurgical Instruments",
        "Bipolar Forceps",
        "Bayonet bipolar forceps that keep hands off the visual axis during microscopic or endoscopic-assisted coagulation.",
        "/product_img_forceps.png",
        base_specs(length="18 cm", handleType="Bayonet"),
    ),
    entry(
        "Bipolar Generator Connecting Cable, Reusable",
        ["General Surgery"],
        "Electrosurgical Instruments",
        "Cables & Accessories",
        "Reusable cable assembly for connecting bipolar instruments to a generator bipolar output. Check connector compatibility with your unit before ordering.",
        "/icon_medical_consumables.png",
        base_specs(material="Insulated cable"),
    ),
    entry(
        "Patient Return Electrode Cable, Reusable",
        ["General Surgery"],
        "Electrosurgical Instruments",
        "Cables & Accessories",
        "Reusable patient return cable for monopolar circuits when used with compatible dispersive electrodes and generators.",
        "/icon_medical_consumables.png",
    ),
    entry(
        "Dispersive Patient Plate, Adult, Reusable",
        ["General Surgery"],
        "Electrosurgical Instruments",
        "Dispersive Electrodes",
        "Reusable adult dispersive electrode pad for monopolar electrosurgery when paired with a validated generator and return cable.",
        "/icon_medical_consumables.png",
        base_specs(workingEndDetails="Adult surface pad"),
    ),
    entry(
        "Dispersive Patient Plate, Pediatric, Reusable",
        ["General Surgery", "Pediatric Surgery"],
        "Electrosurgical Instruments",
        "Dispersive Electrodes",
        "Smaller-surface reusable dispersive electrode intended for pediatric monopolar applications with appropriate generator settings.",
        "/icon_medical_consumables.png",
        base_specs(workingEndDetails="Pediatric surface pad"),
    ),
    entry(
        "Foot Switch, Dual Pedal, Electrosurgical",
        ["General Surgery"],
        "Electrosurgical Instruments",
        "Cables & Accessories",
        "Dual-pedal foot switch for hands-free activation of cut and coagulation modes on compatible electrosurgical generators.",
        "/icon_medical_consumables.png",
        base_specs(handleType="Foot switch"),
    ),
    entry(
        "Holster Clip for Electrosurgical Pencil",
        ["General Surgery"],
        "Electrosurgical Instruments",
        "Cables & Accessories",
        "Sterilizable holster clip that mounts to the drape or field for parking an electrosurgical pencil between activations.",
        "/icon_medical_consumables.png",
    ),
    # ── Headlights & light sources (only laryngoscopes existed) ───────────
    entry(
        "LED Surgical Headlight, Headband Mount",
        ["General Surgery", "ENT", "Plastic Surgery"],
        "Lightening & Visualization",
        "Surgical Headlights",
        "Adjustable headband-mounted LED headlight for shadow reduction during open procedures. Powered by rechargeable battery pack or corded supply depending on configuration.",
        "/icon_surgical_instruments.png",
        base_specs(powerSource="LED", mountType="Headband"),
    ),
    entry(
        "LED Surgical Headlight, Clip-On Loupe Adapter",
        ["Microsurgery", "Ophthalmic"],
        "Lightening & Visualization",
        "Surgical Headlights",
        "Compact LED light module that clips to loupe frames or spectacle carriers for targeted illumination in microsurgical work.",
        "/icon_surgical_instruments.png",
        base_specs(mountType="Clip-on"),
    ),
    entry(
        "Fiber Optic Light Cable, 2.5 m, Universal Ferrule",
        ["General Surgery", "ENT"],
        "Lightening & Visualization",
        "Light Cables",
        "Reusable fiber optic light cable for connecting a cold light source to headlight or retractor light guides. Verify ferrule compatibility with your source.",
        "/icon_surgical_instruments.png",
        base_specs(length="2.5 m"),
    ),
    entry(
        "Fiber Optic Light Cable, 3.5 m, Universal Ferrule",
        ["General Surgery"],
        "Lightening & Visualization",
        "Light Cables",
        "Longer fiber optic light cable offering additional reach from ceiling-mounted or cart-based light sources.",
        "/icon_surgical_instruments.png",
        base_specs(length="3.5 m"),
    ),
    entry(
        "Portable Xenon Cold Light Source, 180 W",
        ["General Surgery", "ENT"],
        "Lightening & Visualization",
        "Light Sources",
        "Cart-mountable xenon cold light source for powering fiber optic headlight and retractor systems in operating rooms without integrated overhead lighting.",
        "/icon_surgical_instruments.png",
        base_specs(powerSource="Xenon 180 W"),
    ),
    entry(
        "LED Cold Light Source, 100 W",
        ["General Surgery"],
        "Lightening & Visualization",
        "Light Sources",
        "LED-based cold light source with lower heat output at the cable interface, suitable for outpatient and clinic procedure rooms.",
        "/icon_surgical_instruments.png",
        base_specs(powerSource="LED 100 W"),
    ),
    entry(
        "Headlight Coupling Adapter for Fiber Cable",
        ["General Surgery"],
        "Lightening & Visualization",
        "Light Cables",
        "Adapter that joins a standard light cable to a headlight bundle, allowing quick swap between retractor and headlight light guides on the same source.",
        "/icon_surgical_instruments.png",
    ),
    entry(
        "Replacement Headlight Bulb Module, Xenon",
        ["General Surgery"],
        "Lightening & Visualization",
        "Light Sources",
        "Service replacement bulb module for compatible xenon cold light sources. Install only in units specified by the light source manufacturer manual.",
        "/icon_surgical_instruments.png",
        base_specs(workingEndDetails="Xenon module"),
    ),
    entry(
        "Headband Padding Set for Surgical Headlight",
        ["General Surgery"],
        "Lightening & Visualization",
        "Surgical Headlights",
        "Replaceable forehead padding and strap sleeves for surgical headlight headbands to improve comfort during long cases.",
        "/icon_surgical_instruments.png",
    ),
    entry(
        "Battery Pack for Portable Surgical Headlight",
        ["General Surgery", "ENT"],
        "Lightening & Visualization",
        "Surgical Headlights",
        "Rechargeable battery pack with belt clip for cordless LED headlight systems used in field clinics or backup lighting.",
        "/icon_surgical_instruments.png",
        base_specs(powerSource="Rechargeable battery"),
    ),
    entry(
        "Light Guide for Self-Retaining Retractor, Fiber Optic",
        ["General Surgery", "Plastic Surgery"],
        "Lightening & Visualization",
        "Light Cables",
        "Fiber optic light guide clip that attaches to a self-retaining retractor frame to illuminate deep cavities when fed from a cold light source.",
        "/icon_surgical_instruments.png",
    ),
    # ── Explicit Thumb Forceps (0 'thumb' in name) ────────────────────────
    entry(
        "Thumb Tissue Forceps, Standard Pattern, 4.75 in, 1x2 Teeth",
        ["General Surgery"],
        "Forceps",
        "Thumb Forceps",
        "General-purpose thumb tissue forceps with 1x2 teeth for grasping skin and fascia. Non-ratchet spring handle.",
        "/product_img_forceps.png",
        base_specs(length="4.75 in", workingEndDetails="1x2 teeth"),
    ),
    entry(
        "Thumb Tissue Forceps, Standard Pattern, 4.75 in, Smooth",
        ["General Surgery"],
        "Forceps",
        "Thumb Forceps",
        "Smooth-jaw standard thumb tissue forceps for atraumatic handling of delicate membranes and serosa.",
        "/product_img_forceps.png",
        base_specs(length="4.75 in", workingEndDetails="Smooth jaws"),
    ),
    entry(
        "Thumb Tissue Forceps, Standard Pattern, 6 in, 1x2 Teeth",
        ["General Surgery"],
        "Forceps",
        "Thumb Forceps",
        "Longer standard thumb tissue forceps for deeper soft-tissue planes in open abdominal surgery.",
        "/product_img_forceps.png",
        base_specs(length="6 in", workingEndDetails="1x2 teeth"),
    ),
    entry(
        "Thumb Tissue Forceps, Adson Pattern, 1x2 Teeth, 4.75 in",
        ["Plastic Surgery", "General Surgery"],
        "Forceps",
        "Thumb Forceps",
        "Fine Adson-pattern thumb tissue forceps with narrow tips for skin closure and delicate soft tissue. Explicit thumb-forceps catalog grouping.",
        "/product_img_forceps.png",
        base_specs(length="4.75 in", workingEndDetails="Fine 1x2 teeth"),
    ),
    entry(
        "Thumb Tissue Forceps, Adson Pattern, Smooth, 4.75 in",
        ["Plastic Surgery"],
        "Forceps",
        "Thumb Forceps",
        "Smooth Adson-pattern thumb forceps for holding fine suture and friable tissue during cosmetic closures.",
        "/product_img_forceps.png",
        base_specs(length="4.75 in", workingEndDetails="Fine smooth"),
    ),
    entry(
        "Thumb Tissue Forceps, Brown-Adson Pattern, 7 in, 7x7 Teeth",
        ["General Surgery"],
        "Forceps",
        "Thumb Forceps",
        "Brown-Adson thumb tissue forceps with multiple fine teeth for secure grasp of dense fascia without a ratchet handle.",
        "/product_img_forceps.png",
        base_specs(length="7 in", workingEndDetails="7x7 teeth"),
    ),
    entry(
        "Thumb Tissue Forceps, Russian Pattern, 6 in",
        ["General Surgery", "Plastic Surgery"],
        "Forceps",
        "Thumb Forceps",
        "Russian-pattern thumb forceps with longitudinal serrations for areolar dissection and soft-tissue elevation.",
        "/product_img_forceps.png",
        base_specs(length="6 in", workingEndDetails="Longitudinal serrations"),
    ),
    entry(
        "Thumb Tissue Forceps, DeBakey Pattern, 7.75 in",
        ["Cardiovascular", "General Surgery"],
        "Forceps",
        "Thumb Forceps",
        "Atraumatic DeBakey-pattern thumb forceps for vessel and graft handling. Non-ratchet design for pulsatile tissue work.",
        "/product_img_forceps.png",
        base_specs(length="7.75 in", workingEndDetails="Atraumatic serrations"),
    ),
    entry(
        "Thumb Tissue Forceps, Iris Pattern, 4 in, 1x2 Teeth",
        ["Ophthalmic", "Plastic Surgery"],
        "Forceps",
        "Thumb Forceps",
        "Short iris-pattern thumb forceps for periorbital and microsurgical skin work.",
        "/product_img_forceps.png",
        base_specs(length="4 in", workingEndDetails="1x2 teeth"),
    ),
    entry(
        "Thumb Tissue Forceps, Foerster Pattern, 9.5 in, Serrated",
        ["General Surgery"],
        "Forceps",
        "Thumb Forceps",
        "Foerster-type thumb sponge forceps with serrated oval cups for grasping gauze and sponges. Listed under thumb forceps for tray taxonomy.",
        "/product_img_forceps.png",
        base_specs(length="9.5 in", workingEndDetails="Sponge cups"),
    ),
    # ── Explicit Ring Forceps (few literal 'ring' names; artery forceps exist) ─
    entry(
        "Ring Forceps, Mosquito Hemostatic, 5 in, Curved",
        ["General Surgery"],
        "Forceps",
        "Ring Forceps",
        "Classic ring-handled mosquito hemostatic forceps for fine vessel control. Catalogued explicitly as ring forceps for teaching trays.",
        "/product_img_forceps.png",
        base_specs(length="5 in", workingEndDetails="Curved jaw"),
    ),
    entry(
        "Ring Forceps, Kelly Hemostatic, 5.5 in, Curved",
        ["General Surgery"],
        "Forceps",
        "Ring Forceps",
        "Kelly-pattern ring forceps with transverse serrations and curved tip for medium-caliber vessel clamping.",
        "/product_img_forceps.png",
        base_specs(length="5.5 in", workingEndDetails="Curved jaw"),
    ),
    entry(
        "Ring Forceps, Crile Hemostatic, 5.5 in, Straight",
        ["General Surgery"],
        "Forceps",
        "Ring Forceps",
        "Straight Crile-pattern ring hemostatic forceps with full-length serrations for secure clamping of small to medium vessels.",
        "/product_img_forceps.png",
        base_specs(length="5.5 in", workingEndDetails="Straight jaw"),
    ),
    entry(
        "Ring Forceps, Rochester-Carmalt, 6.25 in, Straight",
        ["General Surgery"],
        "Forceps",
        "Ring Forceps",
        "Heavy Rochester-Carmalt ring forceps with cross-serrated jaws for thick pedicles and tissue bundles.",
        "/product_img_forceps.png",
        base_specs(length="6.25 in", workingEndDetails="Cross serrations"),
    ),
    entry(
        "Ring Forceps, Pean Hemostatic, 6 in, Curved",
        ["General Surgery"],
        "Forceps",
        "Ring Forceps",
        "Pean-pattern curved ring forceps for deep clamping where longer reach is required.",
        "/product_img_forceps.png",
        base_specs(length="6 in", workingEndDetails="Curved jaw"),
    ),
    entry(
        "Ring Forceps, Ochsner-Kocher, 8 in, Straight",
        ["General Surgery"],
        "Forceps",
        "Ring Forceps",
        "Ochsner-Kocher ring forceps with heavy teeth at the tip for gripping tough tissue or tagged suture ends.",
        "/product_img_forceps.png",
        base_specs(length="8 in", workingEndDetails="Tip teeth"),
    ),
    entry(
        "Ring Forceps, Allis Tissue, 6 in, 4x5 Teeth",
        ["General Surgery", "Gynecology & Obstetrics"],
        "Forceps",
        "Ring Forceps",
        "Allis-pattern ring tissue forceps with teeth along the jaw for grasping fascia, bowel wall, or tagged structures.",
        "/product_img_forceps.png",
        base_specs(length="6 in", workingEndDetails="4x5 teeth"),
    ),
    entry(
        "Ring Forceps, Babcock Tissue, 6.5 in",
        ["General Surgery"],
        "Forceps",
        "Ring Forceps",
        "Babcock ring forceps with fenestrated atraumatic jaws for holding tubular structures without crushing.",
        "/product_img_forceps.png",
        base_specs(length="6.5 in", workingEndDetails="Fenestrated jaw"),
    ),
]


def main() -> None:
    products = json.loads(CATALOG.read_text(encoding="utf-8"))
    if not isinstance(products, list):
        raise SystemExit("Expected top-level JSON array")

    existing_norm = {norm_name(p["name"]) for p in products}
    existing_slugs = {p["slug"] for p in products}

    added = []
    skipped = []
    for p in NEW_PRODUCTS:
        nn = norm_name(p["name"])
        if nn in existing_norm:
            skipped.append(("duplicate name", p["name"]))
            continue
        slug = p["slug"]
        base = slug
        n = 2
        while slug in existing_slugs:
            slug = f"{base}-{n}"
            n += 1
        p["slug"] = slug
        existing_slugs.add(slug)
        existing_norm.add(nn)
        products.append(p)
        added.append(p)

    CATALOG.write_text(json.dumps(products, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    from collections import Counter

    cat = Counter()
    for p in added:
        cat[p["mainCategory"][0]] += 1

    print(f"Previous count: {len(products) - len(added)}")
    print(f"Added: {len(added)}")
    print(f"New total: {len(products)}")
    print("By mainCategory:", dict(cat))
    if skipped:
        print("Skipped:", skipped)
    print("\nSample new entries:")
    for p in added[:5]:
        print(f"  - {p['name']} [{p['mainCategory'][0]}]")


if __name__ == "__main__":
    main()
