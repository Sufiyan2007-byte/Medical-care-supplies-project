import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ─── 1. Company Info ───────────────────────────────────────────────────────
  const companyInfo = await prisma.companyInfo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      vision:
        'To be the leading provider of high-quality medical supplies and surgical equipment.',
      mission:
        'Delivering innovative healthcare solutions and exceptional medical instruments to healthcare professionals.',
      cr_number: 'CR-1234567890',
      vat_number: 'VAT-9876543210',
      address: '123 Medical Center Blvd, Suite 400, Healthcare City',
      email: 'info@medportal.com',
      phone: '+1 (800) 555-MEDS',
    },
  });
  console.log('✔ Seeded company info:', companyInfo.id);

  // ─── 2. Categories ─────────────────────────────────────────────────────────
  const catInstruments = await prisma.category.upsert({
    where: { name: 'Surgical Instruments' },
    update: {},
    create: {
      name: 'Surgical Instruments',
      description: 'Precision surgical instruments used in operating rooms.',
    },
  });

  const catConsumables = await prisma.category.upsert({
    where: { name: 'Medical Consumables' },
    update: {},
    create: {
      name: 'Medical Consumables',
      description: 'Single-use medical supplies for clinical procedures.',
    },
  });

  const catSets = await prisma.category.upsert({
    where: { name: 'Surgical Sets' },
    update: {},
    create: {
      name: 'Surgical Sets',
      description:
        'Pre-packaged sets of surgical instruments for specific procedures.',
    },
  });

  console.log(
    '✔ Seeded categories:',
    catInstruments.name,
    catConsumables.name,
    catSets.name
  );

  // ─── 3. Sample Instruments ─────────────────────────────────────────────────
  const instruments = [
    {
      name: 'Mayo Scissors',
      sku: 'INST-001',
      description: 'Heavy-duty scissors for cutting tough tissue and sutures.',
    },
    {
      name: 'Kelly Forceps',
      sku: 'INST-002',
      description: 'Hemostatic forceps used for clamping blood vessels.',
    },
    {
      name: 'Needle Holder',
      sku: 'INST-003',
      description: 'Instrument used to hold suturing needles during surgery.',
    },
    {
      name: 'Retractor',
      sku: 'INST-004',
      description:
        'Used to hold back tissue edges to expose the operative site.',
    },
    {
      name: 'Scalpel',
      sku: 'INST-005',
      description: 'Small, precise surgical knife for making incisions.',
    },
  ];

  for (const inst of instruments) {
    await prisma.product.upsert({
      where: { sku: inst.sku },
      update: {},
      create: {
        name: inst.name,
        sku: inst.sku,
        description: inst.description,
        category_id: catInstruments.id,
      },
    });
  }
  console.log(`✔ Seeded ${instruments.length} surgical instruments`);

  // ─── 4. Sample Consumables ─────────────────────────────────────────────────
  const consumables = [
    {
      name: 'Exam Gloves',
      sku: 'CONS-001',
      description: 'Latex-free disposable gloves for examination procedures.',
    },
    {
      name: 'Surgical Mask',
      sku: 'CONS-002',
      description: 'Three-layer fluid-resistant surgical mask.',
    },
    {
      name: 'Syringe',
      sku: 'CONS-003',
      description:
        '10ml Luer-lock sterile syringe for medication administration.',
    },
    {
      name: 'Sterile Gauze',
      sku: 'CONS-004',
      description: 'Non-woven sterile gauze swabs for wound care.',
    },
    {
      name: 'Foley Catheter',
      sku: 'CONS-005',
      description: 'Indwelling urinary catheter for bladder drainage.',
    },
  ];

  for (const item of consumables) {
    await prisma.product.upsert({
      where: { sku: item.sku },
      update: {},
      create: {
        name: item.name,
        sku: item.sku,
        description: item.description,
        category_id: catConsumables.id,
      },
    });
  }
  console.log(`✔ Seeded ${consumables.length} medical consumables`);

  // ─── 5. Surgical Sets ──────────────────────────────────────────────────────
  const surgicalSets = [
    {
      sku: 'SET-001',
      name: 'Basic Surgical Set',
      piece_count: 12,
      description: 'Standard set for general minor surgical procedures.',
      material: 'Stainless Steel 304',
      finish: 'Satin',
      sterilization: 'Autoclave',
      standard: 'ISO 13485',
      tray_case: 'Perforated Stainless Steel Tray',
    },
    {
      sku: 'SET-002',
      name: 'Abdominal Set',
      piece_count: 25,
      description: 'Comprehensive set for abdominal and laparotomy procedures.',
      material: 'Stainless Steel 316L',
      finish: 'Mirror',
      sterilization: 'Autoclave / EtO',
      standard: 'ISO 13485',
      tray_case: 'Stainless Steel Container',
    },
    {
      sku: 'SET-003',
      name: 'Cardiothoracic Set',
      piece_count: 30,
      description: 'Specialized instruments for heart and chest surgeries.',
      material: 'Titanium / SS 316L',
      finish: 'Matte',
      sterilization: 'Autoclave',
      standard: 'CE / FDA',
      tray_case: 'Rigid Sterilization Container',
    },
    {
      sku: 'SET-004',
      name: 'Orthopedic Set',
      piece_count: 28,
      description: 'Instruments for bone and joint surgeries.',
      material: 'Stainless Steel 410',
      finish: 'Satin',
      sterilization: 'Autoclave',
      standard: 'ISO 13485',
      tray_case: 'Aluminum Tray',
    },
    {
      sku: 'SET-005',
      name: 'Laparoscopic Set',
      piece_count: 18,
      description: 'Minimally invasive instruments for laparoscopic surgery.',
      material: 'Stainless Steel 304',
      finish: 'Matte Black Anodized',
      sterilization: 'Autoclave / EtO',
      standard: 'ISO 13485 / CE',
      tray_case: 'Foam-lined Rigid Case',
    },
    {
      sku: 'SET-006',
      name: 'ENT Set',
      piece_count: 20,
      description: 'Instruments for ear, nose, and throat procedures.',
      material: 'Stainless Steel 304',
      finish: 'Satin',
      sterilization: 'Autoclave',
      standard: 'ISO 13485',
      tray_case: 'Perforated Tray',
    },
    {
      sku: 'SET-007',
      name: 'Neurosurgery Set',
      piece_count: 32,
      description: 'Precision instruments for brain and spinal cord surgeries.',
      material: 'Titanium Grade 5',
      finish: 'Matte',
      sterilization: 'Autoclave',
      standard: 'CE / ISO 13485',
      tray_case: 'Rigid Sterilization Container',
    },
    {
      sku: 'SET-008',
      name: 'Gynecology Set',
      piece_count: 22,
      description: 'Instruments for gynecological examinations and surgeries.',
      material: 'Stainless Steel 304',
      finish: 'Satin',
      sterilization: 'Autoclave / EtO',
      standard: 'ISO 13485',
      tray_case: 'Stainless Steel Tray',
    },
    {
      sku: 'SET-009',
      name: 'Urology Set',
      piece_count: 18,
      description: 'Instruments for urological procedures and surgeries.',
      material: 'Stainless Steel 304',
      finish: 'Mirror',
      sterilization: 'Autoclave',
      standard: 'ISO 13485',
      tray_case: 'Perforated Stainless Steel Tray',
    },
    {
      sku: 'SET-010',
      name: 'Eye/Ophthalmic Set',
      piece_count: 15,
      description: 'Micro-precision instruments for eye surgeries.',
      material: 'Titanium / SS 304',
      finish: 'Matte',
      sterilization: 'Autoclave / EtO',
      standard: 'CE / ISO 13485',
      tray_case: 'Foam-lined Rigid Case',
    },
    {
      sku: 'SET-011',
      name: 'Cesarean Section Set',
      piece_count: 24,
      description: 'Complete set for C-section delivery procedures.',
      material: 'Stainless Steel 304',
      finish: 'Satin',
      sterilization: 'Autoclave',
      standard: 'ISO 13485',
      tray_case: 'Stainless Steel Container',
    },
    {
      sku: 'SET-012',
      name: 'Vascular Set',
      piece_count: 26,
      description: 'Instruments for vascular and blood vessel surgeries.',
      material: 'Stainless Steel 316L',
      finish: 'Mirror',
      sterilization: 'Autoclave / EtO',
      standard: 'CE / ISO 13485',
      tray_case: 'Rigid Sterilization Container',
    },
    {
      sku: 'SET-013',
      name: 'Plastic Surgery Set',
      piece_count: 20,
      description:
        'Delicate instruments for reconstructive and cosmetic procedures.',
      material: 'Stainless Steel 304',
      finish: 'Matte',
      sterilization: 'Autoclave',
      standard: 'ISO 13485',
      tray_case: 'Foam-lined Tray',
    },
    {
      sku: 'SET-014',
      name: 'Pediatric Set',
      piece_count: 16,
      description:
        'Scaled-down instruments for surgical procedures in children.',
      material: 'Stainless Steel 304',
      finish: 'Satin',
      sterilization: 'Autoclave / EtO',
      standard: 'ISO 13485',
      tray_case: 'Perforated Tray',
    },
    {
      sku: 'SET-015',
      name: 'Emergency/Trauma Set',
      piece_count: 22,
      description:
        'Essential instruments for emergency and trauma surgical care.',
      material: 'Stainless Steel 304',
      finish: 'Satin',
      sterilization: 'Autoclave',
      standard: 'ISO 13485',
      tray_case: 'Portable Rigid Case',
    },
    {
      sku: 'SET-016',
      name: 'Endoscopy Set',
      piece_count: 14,
      description: 'Instruments for endoscopic examinations and procedures.',
      material: 'Stainless Steel 304 / PTFE',
      finish: 'Matte',
      sterilization: 'EtO / Low-Temperature Plasma',
      standard: 'CE / ISO 13485',
      tray_case: 'Foam-lined Rigid Case',
    },
  ];

  for (const setData of surgicalSets) {
    // Create the parent Product entry
    const product = await prisma.product.upsert({
      where: { sku: setData.sku },
      update: {},
      create: {
        name: setData.name,
        sku: setData.sku,
        description: setData.description,
        category_id: catSets.id,
      },
    });

    // Create the SurgicalSet specs entry
    await prisma.surgicalSet.upsert({
      where: { product_id: product.id },
      update: {},
      create: {
        product_id: product.id,
        name: setData.name,
        piece_count: setData.piece_count,
        description: setData.description,
        material: setData.material,
        finish: setData.finish,
        sterilization: setData.sterilization,
        standard: setData.standard,
        tray_case: setData.tray_case,
      },
    });
  }

  console.log(`✔ Seeded ${surgicalSets.length} surgical sets`);
  console.log('✅ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
