// Seeds the "Medical Consumables" category with real consumable products —
// gloves, masks, wound care & dressings, urinary supplies, enteral feeding,
// disinfectant, oral/incontinence care and tracheostomy/respiratory
// disposables.
//
// Product names, SKUs and prices are sourced from a Saudi medical-supplies
// distributor's public catalogue (medicalsupplies.sa) as a starting point —
// review prices/stock before relying on them. Durable equipment (nebulizer
// compressors, oxygen concentrators, spirometer devices, etc) is deliberately
// left out — this file covers single-use / disposable consumables only.
// Descriptions below are written from scratch, not copied from the source
// site.
//
// Run with:  cd server && npx prisma db seed
// (safe to re-run — every product is upserted by its unique `sku`)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CATEGORY_NAME = 'Medical Consumables';

// price is in SAR, excluding VAT — null means "price on request".
// Where a source listing showed a size/price range, `price` is the lowest
// price in that range and the range is noted in the description.
const PRODUCTS = [
  // ── Gloves & masks ──────────────────────────────────────────────
  {
    sku: 'MC-GLV-LTX-PF',
    name: 'Latex Examination Gloves, Powder-Free',
    description: 'Disposable latex examination gloves, powder-free. Available in Small, Medium and Large. Priced from SAR 56 per box depending on size.',
    price: 56.0,
    image: '/consumables_images/latex-examination-gloves-powder-free.jpg',
  },
  {
    sku: '10001217',
    name: 'Sterile Surgical Gloves, Powder-Free, Size 7.0',
    description: 'Sterile powder-free surgical gloves, size 7.0, packed per pair for operating-room use.',
    price: 100.0,
    image: '/consumables_images/sterile-surgical-gloves-powder-free-size-7.jpg',
  },
  {
    sku: 'MC-GLV-VNL-PF',
    name: 'Vinyl Examination Gloves, Powder-Free',
    description: 'Disposable vinyl examination gloves, powder-free. Available in Small, Medium, Large and X-Large. Priced from SAR 29 per box depending on size.',
    price: 29.0,
    image: '/consumables_images/vinyl-examination-gloves-powder-free.jpg',
  },
  {
    sku: '10001200',
    name: 'Face Mask, Ear-Loop, 3-Ply (Box of 50)',
    description: 'Three-layer disposable ear-loop face mask for general clinical and patient use. Box of 50.',
    price: 590.0,
    image: '/consumables_images/face-mask-ear-loop-3-ply.jpg',
  },

  // ── Wound care: swabs, prep & tape ──────────────────────────────
  {
    sku: '10001187',
    name: 'Avant Gauze (Tracheostomy Gauze)',
    description: 'Pre-slit gauze dressing sized for use around a tracheostomy stoma.',
    price: 85.0,
    image: '/consumables_images/avant-gauze-tracheostomy.jpg',
  },
  {
    sku: 'MC-TAPE-3M-5CM',
    name: '3M Micropore Paper Tape, 5cm x 9.1m (Box of 6)',
    description: 'Hypoallergenic paper surgical tape, 5cm width, for securing dressings and tubing. Box of 6 rolls.',
    price: null,
    image: '/consumables_images/3m-micropore-paper-tape-5cm.jpg',
  },
  {
    sku: 'MC-SWAB-ALC-200',
    name: 'Alcohol Prep Swabs (Box of 200)',
    description: 'Individually wrapped 70% isopropyl alcohol prep swabs for skin cleansing before injections or minor procedures. Box of 200.',
    price: null,
    image: '/consumables_images/alcohol-prep-swabs-box-200.jpg',
  },
  {
    sku: 'MC-GAUZE-SWAB-4X4',
    name: 'Sterile Gauze Swabs, 4x4in, 12-Ply (Box of 100)',
    description: 'Sterile 12-ply woven gauze swabs, 4x4 inch, for wound dressing and general clinical use. Box of 5 packs of 100.',
    price: null,
    image: '/consumables_images/sterile-gauze-swabs-4x4-12ply.jpg',
  },
  {
    sku: '10001201',
    name: 'Cotton-Tipped Applicators (Pack of 100)',
    description: 'Sterile cotton-tipped wooden applicators for wound cleaning and topical application. Pack of 100.',
    price: 25.0,
    image: '/consumables_images/cotton-tipped-applicators-pack.jpg',
  },
  {
    sku: '10001208',
    name: 'Iodine Swab Sticks (Box of 100)',
    description: 'Single-use povidone-iodine swab sticks for skin antisepsis. Box of 100.',
    price: 1.0,
    image: '/consumables_images/iodine-swab-sticks-box-100.jpg',
  },
  {
    sku: '10001202',
    name: '3M Micropore Paper Tape, 2.5cm x 9.1m (Box of 12)',
    description: 'Hypoallergenic paper surgical tape, 2.5cm (1 inch) width, for securing dressings and tubing. Box of 12 rolls.',
    price: 1.0,
    image: '/consumables_images/3m-micropore-paper-tape-2-5cm.jpg',
  },
  {
    sku: 'MC-TAPE-FIX',
    name: 'Mefix Self-Adhesive Fixation Tape',
    description: 'Non-woven self-adhesive fixation tape for securing dressings, available in a range of roll widths and lengths. Priced from SAR 8.8 depending on size.',
    price: 8.8,
    image: '/consumables_images/mefix-self-adhesive-fixation-tape.jpg',
  },
  {
    sku: 'M23FT',
    name: 'Mepitac Silicone Fixation Tape, 2cm x 3m',
    description: 'Soft silicone adhesive fixation tape for sensitive or fragile skin, 2cm x 3m roll.',
    price: 763.4,
    image: '/consumables_images/mepitac-silicone-fixation-tape-2cm.jpg',
  },
  {
    sku: 'M415FT',
    name: 'Mepitac Silicone Fixation Tape, 4cm x 1.5m',
    description: 'Soft silicone adhesive fixation tape for sensitive or fragile skin, 4cm x 1.5m roll.',
    price: 441.3,
    image: '/consumables_images/mepitac-silicone-fixation-tape-4cm.jpg',
  },

  // ── Wound care: advanced dressings ──────────────────────────────
  {
    sku: 'MC-DRSG-ALGINATE',
    name: 'Melgisorb Plus Alginate Wound Dressing',
    description: 'Highly absorbent calcium-alginate dressing for moderately to heavily exuding wounds. Available in multiple sizes, priced from SAR 128.2.',
    price: 128.2,
    image: '/consumables_images/melgisorb-plus-alginate-dressing.jpg',
  },
  {
    sku: 'MC-DRSG-SILICONE',
    name: 'Mepiform Soft Silicone Scar Dressing',
    description: 'Self-adherent soft silicone sheet for scar management and post-surgical scarring. Available in multiple sizes, priced from SAR 264.2.',
    price: 264.2,
    image: '/consumables_images/mepiform-soft-silicone-scar-dressing.jpg',
  },
  {
    sku: 'MC-DRSG-CONTACTMESH',
    name: 'Mepitel Silicone Wound Contact Layer',
    description: 'Flexible, non-adherent silicone mesh wound contact layer, placed under secondary dressings. Available in multiple sizes, priced from SAR 202.4.',
    price: 202.4,
    image: '/consumables_images/mepitel-silicone-wound-contact-layer.jpg',
  },
  {
    sku: 'MC-DRSG-CONTACTFILM',
    name: 'Mepitel Film Silicone Wound Contact Film',
    description: 'Transparent, waterproof silicone-adhesive film for securing wounds or as a protective barrier. Available in multiple sizes, priced from SAR 320.4.',
    price: 320.4,
    image: '/consumables_images/mepitel-film-silicone-contact-film.jpg',
  },
  {
    sku: 'MC-DRSG-CONTACTONE',
    name: 'Mepitel One Silicone Wound Contact Layer',
    description: 'One-piece atraumatic silicone wound contact layer with an absorbent core. Available in multiple sizes, priced from SAR 241.7.',
    price: 241.7,
    image: '/consumables_images/mepitel-one-silicone-contact-layer.jpg',
  },
  {
    sku: 'MC-DRSG-FILM',
    name: 'Mepore Adhesive Absorbent Dressing',
    description: 'Self-adhesive absorbent dressing with a soft, breathable backing for low-to-moderately exuding wounds. Available in multiple sizes, priced from SAR 49.9.',
    price: 49.9,
    image: '/consumables_images/mepore-adhesive-absorbent-dressing.jpg',
  },
  {
    sku: 'MC-DRSG-WPFILM',
    name: 'Mepore Film Waterproof Dressing',
    description: 'Transparent, waterproof adhesive film dressing that lets patients shower without exposing the wound. Available in multiple sizes, priced from SAR 313.7.',
    price: 313.7,
    image: '/consumables_images/mepore-film-waterproof-dressing.jpg',
  },
  {
    sku: 'MC-DRSG-POSTOP',
    name: 'Mepore Pro Post-Operative Dressing',
    description: 'Absorbent, waterproof post-operative dressing designed to stay in place through showering. Available in multiple sizes, priced from SAR 81.0.',
    price: 81.0,
    image: '/consumables_images/mepore-pro-post-operative-dressing.jpg',
  },
  {
    sku: 'MC-DRSG-NACLGAUZE',
    name: 'Mesalt Sodium Chloride-Impregnated Gauze',
    description: 'Hypertonic sodium-chloride-impregnated gauze dressing for exuding and sloughy wounds. Available in multiple sizes, priced from SAR 138.3.',
    price: 138.3,
    image: '/consumables_images/mesalt-sodium-chloride-impregnated-gauze.jpg',
  },
  {
    sku: '285280',
    name: 'Mesalt Sodium Chloride Gauze Ribbon, 2cm x 100cm',
    description: 'Hypertonic sodium-chloride-impregnated gauze ribbon for packing deep or cavity wounds, 2cm x 100cm.',
    price: 253.0,
    image: '/consumables_images/mesalt-sodium-chloride-gauze-ribbon.jpg',
  },
  {
    sku: 'MC-DRSG-AGFOAM',
    name: 'Mepilex Ag Antimicrobial Silver Foam Dressing',
    description: 'Soft silicone foam dressing with an antimicrobial silver layer for exuding or infected wounds. Available in multiple sizes, priced from SAR 258.6.',
    price: 258.6,
    image: '/consumables_images/mepilex-ag-antimicrobial-silver-foam.jpg',
  },
  {
    sku: 'MC-DRSG-BORDER',
    name: 'Mepilex Border Silicone Foam Dressing',
    description: 'Self-adherent silicone foam dressing with an absorbent border for moderately exuding wounds. Available in multiple sizes, priced from SAR 154.6.',
    price: 154.6,
    image: '/consumables_images/mepilex-border-silicone-foam-dressing.jpg',
  },
  {
    sku: 'MC-DRSG-BORDERAG',
    name: 'Mepilex Border Ag Antimicrobial Foam Dressing',
    description: 'Silicone foam border dressing with antimicrobial silver for infected or at-risk exuding wounds. Available in multiple sizes, priced from SAR 435.7.',
    price: 435.7,
    image: '/consumables_images/mepilex-border-ag-antimicrobial-foam.jpg',
  },
  {
    sku: 'MC-DRSG-BORDERFLEX',
    name: 'Mepilex Border Flex Silicone Foam Dressing',
    description: 'Flexible silicone foam border dressing shaped to move with the body on joints and curved areas. Available in multiple sizes, priced from SAR 449.7.',
    price: 449.7,
    image: '/consumables_images/mepilex-border-flex-silicone-foam.jpg',
  },
  {
    sku: 'MC-DRSG-BORDERLITE',
    name: 'Mepilex Border Lite Silicone Foam Dressing',
    description: 'Thin, flexible silicone foam border dressing for low-to-moderately exuding wounds. Available in multiple sizes, priced from SAR 149.0.',
    price: 149.0,
    image: '/consumables_images/mepilex-border-lite-silicone-foam.jpg',
  },
  {
    sku: 'MC-DRSG-POSTOPBORDER',
    name: 'Mepilex Border Post-Op Silicone Foam Dressing',
    description: 'Elongated silicone foam dressing shaped for surgical incision lines. Available in multiple sizes, priced from SAR 422.7.',
    price: 422.7,
    image: '/consumables_images/mepilex-border-post-op-silicone-foam.jpg',
  },
  {
    sku: 'MC-DRSG-POSTOPBORDERAG',
    name: 'Mepilex Border Post-Op Ag Antimicrobial Dressing',
    description: 'Post-operative silicone foam dressing with antimicrobial silver for at-risk incision lines. Available in multiple sizes, priced from SAR 505.9.',
    price: 505.9,
    image: '/consumables_images/mepilex-border-post-op-ag-dressing.jpg',
  },
  {
    sku: 'MC-DRSG-SACRUM',
    name: 'Mepilex Border Sacrum Silicone Foam Dressing',
    description: 'Butterfly-shaped silicone foam dressing contoured for the sacral area, for pressure-injury prevention and management. Available in multiple sizes, priced from SAR 514.4.',
    price: 514.4,
    image: '/consumables_images/mepilex-border-sacrum-silicone-foam.jpg',
  },
  {
    sku: 'MC-DRSG-SACRUMAG',
    name: 'Mepilex Border Sacrum Ag Antimicrobial Dressing',
    description: 'Sacrum-shaped silicone foam dressing with antimicrobial silver for infected or at-risk pressure injuries. Available in multiple sizes, priced from SAR 860.1.',
    price: 860.1,
    image: '/consumables_images/mepilex-border-sacrum-ag-dressing.jpg',
  },
  {
    sku: 'MC-DRSG-HEEL',
    name: 'Mepilex Heel Silicone Foam Dressing',
    description: 'Boot-shaped silicone foam dressing contoured to the heel, for pressure-injury prevention and management. Available in multiple sizes, priced from SAR 354.1.',
    price: 354.1,
    image: '/consumables_images/mepilex-heel-silicone-foam-dressing.jpg',
  },
  {
    sku: 'MC-DRSG-HEELAG',
    name: 'Mepilex Heel Ag Antimicrobial Dressing',
    description: 'Heel-shaped silicone foam dressing with antimicrobial silver for infected or at-risk heel wounds. Available in multiple sizes, priced from SAR 1,118.6.',
    price: 1118.6,
    image: '/consumables_images/mepilex-heel-ag-antimicrobial-dressing.jpg',
  },
  {
    sku: 'MC-DRSG-LITE',
    name: 'Mepilex Lite Silicone Foam Dressing',
    description: 'Thin, flexible silicone foam dressing for lightly exuding wounds. Available in multiple sizes, priced from SAR 188.3.',
    price: 188.3,
    image: '/consumables_images/mepilex-lite-silicone-foam-dressing.jpg',
  },
  {
    sku: 'MC-DRSG-TRANSFER',
    name: 'Mepilex Transfer Silicone Wound Contact Dressing',
    description: 'Thin silicone dressing that transfers exudate into a secondary absorbent dressing while staying atraumatic on removal. Available in multiple sizes, priced from SAR 1,101.8.',
    price: 1101.8,
    image: '/consumables_images/mepilex-transfer-silicone-contact.jpg',
  },
  {
    sku: 'MC-DRSG-TRANSFERAG',
    name: 'Mepilex Transfer Ag Antimicrobial Dressing',
    description: 'Silicone wound contact dressing with antimicrobial silver that transfers exudate into a secondary dressing. Available in multiple sizes, priced from SAR 579.6.',
    price: 579.6,
    image: '/consumables_images/mepilex-transfer-ag-antimicrobial.jpg',
  },

  // ── Urinary supplies ─────────────────────────────────────────────
  {
    sku: '10001223',
    name: 'Foley Catheter, 18FR',
    description: '2-way Foley urinary catheter, 18FR, for short- or long-term bladder drainage.',
    price: 14.0,
    image: '/consumables_images/foley-catheter-18fr.jpg',
  },
  {
    sku: '10001221',
    name: 'Flexi-Trak Catheter Anchoring Device',
    description: 'Adhesive anchoring device that secures a urinary catheter to the skin to reduce tension and accidental dislodgement.',
    price: 14.0,
    image: '/consumables_images/flexi-trak-catheter-anchoring-device.jpg',
  },
  {
    sku: '10001222',
    name: 'Urine Drainage Bag with Hanger, 2000ml',
    description: '2000ml urinary drainage bag with a bed/chair hanger, for use with an indwelling catheter.',
    price: 12.0,
    image: '/consumables_images/urine-drainage-bag-2000ml.jpg',
  },
  {
    sku: '10001218',
    name: 'Sterile Urine Specimen Container, 120ml',
    description: 'Sterile 120ml container for urine sample collection.',
    price: 0.3,
    image: '/consumables_images/sterile-urine-specimen-container-120ml.jpg',
  },

  // ── Patient care: disinfectant, oral, incontinence, hospital supplies ──
  {
    sku: '10001219',
    name: 'Isopropyl Alcohol 70% Disinfectant, 5L',
    description: '70% isopropyl alcohol solution in a 5-litre container, for surface and skin disinfection in clinical settings.',
    price: 100.0,
    image: '/consumables_images/isopropyl-alcohol-70-disinfectant-5l.jpg',
  },
  {
    sku: '10001184',
    name: 'Disposable Underpad, 60 x 90cm',
    description: 'Absorbent disposable underpad for bed and incontinence protection, 60 x 90cm.',
    price: 20.0,
    image: '/consumables_images/disposable-underpad-60x90.jpg',
  },
  {
    sku: '10001185',
    name: 'Disposable Wash Cloths (Pack)',
    description: 'Soft disposable wash cloths for patient hygiene and bed baths.',
    price: 65.0,
    image: '/consumables_images/disposable-wash-cloths-pack.jpg',
  },
  {
    sku: '10001186',
    name: 'Dentips Oral Care Swabs',
    description: 'Foam-tipped oral care swabs for cleaning and moistening the mouth of patients unable to brush normally.',
    price: 0.7,
    image: '/consumables_images/dentips-oral-care-swabs.jpg',
  },
  {
    sku: 'MC-STOPCOCK',
    name: '3-Way Stop Cock',
    description: 'Single-use 3-way stopcock for IV line fluid/medication administration and sampling.',
    price: 25.0,
    image: '/consumables_images/3-way-stopcock.jpg',
  },

  // ── Enteral feeding ──────────────────────────────────────────────
  {
    sku: '10001147',
    name: 'Enteral Feeding Set (JP2-2-001)',
    description: 'Gravity enteral feeding administration set for tube-fed patients.',
    price: 30.0,
    image: '/consumables_images/enteral-feeding-set-jp2-001.jpg',
  },
  {
    sku: '10001148',
    name: 'Enteral Feeding Set (JP2-2-101)',
    description: 'Gravity enteral feeding administration set for tube-fed patients.',
    price: 30.0,
    image: '/consumables_images/enteral-feeding-set-jp2-101.jpg',
  },
  {
    sku: '10001149',
    name: 'Enteral Feeding Set (JP2-2-105)',
    description: 'Gravity enteral feeding administration set for tube-fed patients.',
    price: 23.0,
    image: '/consumables_images/enteral-feeding-set-jp2-105.jpg',
  },
  {
    sku: '10001188',
    name: 'Compat Ella Enteral Feeding Bag, 1L',
    description: '1-litre enteral feeding bag compatible with Compat Ella pump sets.',
    price: 37.0,
    image: '/consumables_images/compat-ella-enteral-feeding-bag-1l.jpg',
  },
  {
    sku: '10001190',
    name: 'Flocare Enteral Feeding Container, 1L with Cap',
    description: '1-litre enteral feeding container with pack cap, for use with Flocare feeding sets.',
    price: 21.5,
    image: '/consumables_images/flocare-enteral-feeding-container-1l.jpg',
  },
  {
    sku: '10001189',
    name: 'Flocare Infinity Enteral Feeding Pack Set',
    description: 'Enteral feeding pack set for use with the Flocare Infinity pump.',
    price: 21.0,
    image: '/consumables_images/flocare-infinity-feeding-pack-set.jpg',
  },
  {
    sku: '10001191',
    name: 'Enteral Feeding Transition Connector (ENlock/Funnel)',
    description: 'Transition connector for adapting an enteral feeding tube between ENlock and funnel/catheter-tip fittings.',
    price: 3.0,
    image: '/consumables_images/enteral-feeding-transition-connector.jpg',
  },

  // ── Respiratory / tracheostomy disposables ──────────────────────
  {
    sku: '10001225',
    name: 'Bacterial/Viral Breathing Circuit Filter',
    description: 'Bacterial and viral filter fitted in-line on a breathing circuit to protect against cross-contamination.',
    price: 500.0,
    image: '/consumables_images/bacterial-viral-breathing-circuit-filter.jpg',
  },
  {
    sku: '10001209',
    name: 'Closed Suction Catheter, 12FR',
    description: 'Closed-system suction catheter with a double-swivel elbow connector, 12FR, for tracheal suctioning without breaking the ventilator circuit.',
    price: 55.0,
    image: '/consumables_images/closed-suction-catheter-12fr.jpg',
  },
  {
    sku: '10001226',
    name: 'HME (Heat & Moisture Exchanger) Filter',
    description: 'Heat and moisture exchanger filter for airway humidification in ventilated or tracheostomy patients.',
    price: 18.0,
    image: '/consumables_images/hme-filter-heat-moisture-exchanger.jpg',
  },
  {
    sku: '10001227',
    name: 'Sterile Tracheostomy Care Tray',
    description: 'Sterile tracheostomy clean-and-care tray with a moisture-proof drape, for routine stoma care.',
    price: 240.0,
    image: '/consumables_images/sterile-tracheostomy-care-tray.jpg',
  },
  {
    sku: '10001205',
    name: 'Suction Catheter, 12FR',
    description: 'Single-use open suction catheter, 12FR.',
    price: 148.0,
    image: '/consumables_images/suction-catheter-12fr.jpg',
  },
  {
    sku: '10001206',
    name: 'Suction Catheter, 14FR',
    description: 'Single-use open suction catheter, 14FR.',
    price: 11.5,
    image: '/consumables_images/suction-catheter-14fr.jpg',
  },
  {
    sku: '10001224',
    name: 'Tracheostomy Tube Holder, Adult',
    description: 'Adjustable adult tracheostomy tube holder for securing the tube in place.',
    price: 400.0,
    image: '/consumables_images/tracheostomy-tube-holder-adult.jpg',
  },
  {
    sku: '10001005',
    name: 'Bacterial/Viral Filter for Spirometer (MIR)',
    description: 'Single-use bacterial/viral filter fitted between the patient mouthpiece and a MIR spirometer.',
    price: 15.0,
    image: '/consumables_images/spirometer-bacterial-viral-filter-mir.jpg',
  },
  {
    sku: '10001069',
    name: 'Sidestream Nebulizer Disposable Kit',
    description: 'Disposable nebulizer medication cup and mask assembly compatible with Sidestream nebulizer compressors.',
    price: 16.0,
    image: '/consumables_images/sidestream-nebulizer-disposable-kit.jpg',
  },
  {
    sku: '10001070',
    name: 'Sidestream Nebulizer Disposable Kit, Angled Mouthpiece',
    description: 'Disposable Sidestream-compatible nebulizer kit with an angled mouthpiece for medication delivery.',
    price: 16.0,
    image: '/consumables_images/sidestream-nebulizer-angled-mouthpiece.jpg',
  },
  {
    sku: '10001071',
    name: 'Sidestream Nebulizer Disposable Kit, Child Mask',
    description: 'Disposable Sidestream-compatible nebulizer kit fitted with a paediatric mask.',
    price: 16.0,
    image: '/consumables_images/sidestream-nebulizer-child-mask.jpg',
  },
  {
    sku: 'MC-SPACER',
    name: 'Optichamber Diamond Spacer Chamber',
    description: 'Valved holding chamber (spacer) used with a metered-dose inhaler, available in Small, Medium and Large masks. Priced from SAR 20.8.',
    price: 20.8,
    image: '/consumables_images/optichamber-diamond-spacer-chamber.jpg',
  },
  {
    sku: '10001055',
    name: 'Humidifier Connector Tube (Everflo)',
    description: 'Connector tubing linking an oxygen humidifier bottle to an Everflo oxygen concentrator.',
    price: 100.0,
    image: '/consumables_images/humidifier-connector-tube-everflo.jpg',
  },
];

async function main() {
  const category = await prisma.category.upsert({
    where: { name: CATEGORY_NAME },
    update: {},
    create: {
      name: CATEGORY_NAME,
      description: 'Single-use and consumable medical supplies — gloves, masks, wound dressings, catheters, enteral feeding, disinfectant and more.',
    },
  });

  console.log(`Category "${category.name}" ready (id ${category.id}).`);

  for (const p of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image,
        category_id: category.id,
      },
      create: {
        sku: p.sku,
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image,
        category_id: category.id,
      },
    });
    console.log(`  ✓ ${product.name} (${product.sku})`);
  }

  console.log(`\nSeeded ${PRODUCTS.length} consumable products.`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
