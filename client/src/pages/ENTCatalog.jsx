import { useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import { priceOf, priceOnRequest } from '../utils/pricing';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './ENTCatalog.css';

/* ── Arabic Category Translations ─────────────────────────────────────────── */
const CATEGORY_TRANSLATIONS_AR = {
  'All': 'جميع المنتجات',
  'Ear Forceps': 'ملاقط الأذن',
  'Ear Specula': 'مناظير الأذن',
  'Ear Curettes': 'تجريفات الأذن',
  'Micro Ear Forceps': 'ملاقط الأذن الدقيقة',
  'Micro Ear Scissors': 'مقصات الأذن الدقيقة',
  'Micro Ear Knives': 'سكاكين الأذن الدقيقة',
  'Micro Ear Curettes': 'تجريفات الأذن الدقيقة',
  'Micro Ear Dissectors': 'مشرط الأذن الدقيق',
  'Tuning Forks': 'شوكات رنانة طبية',
  'Ear Syringes': 'حقن غسيل الأذن',
  'Tympanum Needles': 'إبر غشاء الطبل',
  'Foreign Body Instruments': 'أدوات الأجسام الغريبة',
  'Mastoid Rongeurs': 'قواطع الخشاء',
  'Tonsil & Adenoid Instruments': 'أدوات اللوزتين واللحمية',
  'Tracheotomy Instruments': 'أدوات فتح الرغامي',
  'Rhinology Instruments': 'أدوات جراحة الأنف والجيوب الأنفية',
  'Nasal Specula': 'مناظير الأنف',
  'Nasal Forceps': 'ملاقط الأنف',
  'Sinus Forceps': 'ملاقط الجيوب الأنفية',
  'Snares': 'فخاخ ومنازع الأنسجة',
  'General ENT Instruments': 'أدوات الأنف والأذن العامة',
  'General & Micro Forceps': 'ملاقط جراحية دقيقة وعامة',
  'Laryngoscopes - Flexible Tip': 'مناظير الحنجرة - رأس مرن',
  'Laryngoscopes - Fiber Optic': 'مناظير الحنجرة - ألياف بصرية',
  'Laryngoscopes - Conventional': 'مناظير الحنجرة - تقليدية',
  'Laryngoscopes - Disposable': 'مناظير الحنجرة - استخدام واحد',
  'Laryngoscope Handles': 'قبضات مناظير الحنجرة',
  'Otoscopes & Diagnostics': 'مناظير فحص الأذن والتشخيص',
  'Ophthalmoscopes': 'مناظير فحص قاع العين',
  'Dermatoscopes': 'مناظير فحص الجلد والآفات',
  'ENT Diagnostic Sets': 'أطقم تشخيص الأنف والأذن والحنجرة',
  'Diagnostic Hammers & Stethoscopes': 'مطارق الفحص العصبي وسماعات الجنين',
  'Diagnostic Accessories': 'ملحقات ومستلزمات التشخيص',
  // General surgery catalogue
  'Scissors': 'المقصات الجراحية',
  'Forceps': 'الملاقط الجراحية',
  'Retractors': 'المباعد الجراحية',
  'Artery Forceps & Clamps': 'ملاقط ومشابك الشرايين',
  'Suture Instruments': 'أدوات الخياطة الجراحية',
  'Scalpels & Knives': 'المشارط والسكاكين',
  'Dressing Forceps & Instruments': 'ملاقط وأدوات الضماد',
  'Holloware': 'الأواني الجراحية',
  'Applicators & Spatulas': 'الأدوات التطبيقية والملاعق',
  'Podiatry Instruments': 'أدوات علاج القدم'
};

/* ── Arabic Name Translation Dictionary ───────────────────────────────────── */
const NAME_KEYWORD_MAP_AR = [
  ['laryngoscope', 'منظار الحنجرة الجراحي'],
  ['otoscope', 'منظار الأذن التشخيصي'],
  ['ophthalmoscope', 'منظار فحص العين'],
  ['dermatoscope', 'منظار فحص الجلد'],
  ['percussion hammer', 'مطرقة الفحص العصبي'],
  ['pinard stethoscope', 'سماعة بينارد لنبض الجنين'],
  ['diagnostic set', 'طقم تشخيصي متكامل'],
  ['alligator forcep', 'ملقط تمساحي للأذن'],
  ['ear polypus forcep', 'ملقط لحمية الأذن'],
  ['nasal speculum', 'منظار الأنف الجراحي'],
  ['nasal specula', 'منظار الأنف الجراحي'],
  ['ear speculum', 'منظار الأذن الجراحي'],
  ['ear specula', 'منظار الأذن الجراحي'],
  ['tuning fork', 'شوكة رنانة طبية'],
  ['tonsil snare', 'منزعة اللوزتين الجراحية'],
  ['polypus snare', 'منزعة اللحمية الجراحية'],
  ['tracheal dilator', 'موسع القصبة الهوائية'],
  ['tracheal hook', 'خطاف القصبة الهوائية'],
  ['tracheal retractor', 'مبعد القصبة الهوائية'],
  ['ear curette', 'مجرفة الأذن الجراحية'],
  ['ear scoop', 'مكرفة الأذن الجراحية'],
  ['ear hook', 'خطاف الأذن الجراحي'],
  ['micro ear scissor', 'مقص الأذن الدقيق'],
  ['micro ear knife', 'سكين الأذن الدقيق'],
  ['micro ear needle', 'إبرة الأذن الدقيقة'],
  ['needle holder', 'ماسك إبر جراحي'],
  ['ligature needle', 'إبرة ربط جراحية'],
  ['scalpel handle', 'مقبض مشرط جراحي'],
  ['scalpel blade', 'شفرة مشرط جراحي'],
  ['scalpel', 'مشرط جراحي'],
  ['wound spreader', 'موسع جروح جراحي'],
  ['towel clamp', 'مشبك مناشف جراحي'],
  ['sponge holding', 'ملقط ماسك للإسفنج'],
  ['bulldog clamp', 'مشبك بولدوغ'],
  ['clamp', 'مشبك جراحي'],
  ['clip', 'مشبك جراحي'],
  ['tenaculum', 'ملقط عنق الرحم'],
  ['spatula', 'ملعقة جراحية'],
  ['applicator', 'أداة تطبيق جراحية'],
  ['spreader', 'موسع جراحي'],
  ['shear', 'مقص عظام'],
  ['nipper', 'قاطع أظافر'],
  ['approximator', 'مقرّب أنسجة جراحي'],
  ['probe', 'مسبار جراحي'],
  ['dilator', 'موسع جراحي'],
  ['cutter', 'قاطع جراحي'],
  ['director', 'موجه جراحي'],
  ['punch', 'ثاقب جراحي'],
  ['dermatome', 'مبضع جلدي'],
  ['handle', 'مقبض جراحي'],
  ['blade', 'شفرة جراحية'],
  ['holder', 'ماسك جراحي'],
  ['dish', 'طبق جراحي'],
  ['cup', 'كوب جراحي'],
  ['jar', 'وعاء زجاجي'],
  ['box', 'علبة جراحية'],
  ['bowl', 'وعاء جراحي'],
  ['basin', 'وعاء جراحي'],
  ['tray', 'صينية جراحية'],
  ['forcep', 'ملقط جراحي'],
  ['forceps', 'ملقط جراحي'],
  ['speculum', 'منظار جراحي'],
  ['scissor', 'مقص جراحي'],
  ['scissors', 'مقص جراحي'],
  ['curette', 'مجرفة جراحية'],
  ['snare', 'منزعة جراحية'],
  ['retractor', 'مبعد جراحي'],
  ['elevator', 'رافع جراحي'],
  ['dissector', 'مشرط فاصل أنسجة'],
  ['trocar', 'مبزل جراحي'],
  ['chisel', 'إزميل جراحي'],
  ['osteotome', 'مبضع العظام'],
  ['rasp', 'مبرد الأنف الجراحي'],
  ['needle', 'إبرة جراحية'],
  ['hook', 'خطاف جراحي'],
  ['knife', 'سكين جراحي'],
];

function getLocalizedCategory(catName, isAr) {
  if (!isAr) return catName;
  return CATEGORY_TRANSLATIONS_AR[catName] || catName;
}

function getLocalizedName(instName, isAr) {
  if (!isAr) return instName;
  const nameLower = instName.toLowerCase();
  for (const [enKw, arTranslation] of NAME_KEYWORD_MAP_AR) {
    if (nameLower.includes(enKw)) {
      // Return Arabic translation with English medical name in parentheses
      return `${arTranslation} (${instName})`;
    }
  }
  return instName;
}

function getLocalizedDescription(catName, isAr) {
  if (!isAr) {
    return `Premium grade ${catName} designed for clinical and surgical operating room use. SFDA and CE registered.`;
  }
  return `أداة جراحية فائقة الدقة مخصصة لاستخدامات جراحة الأنف والأذن والحنجرة وغرف العمليات. مسجلة ومعتمدة من هيئة الغذاء والدواء وحاصلة على شهادة الجودة الأوروبية.`;
}


/* ── Catalogue configurations (same page component, different data/text) ── */
const CATALOGS = {
  ent: {
    dataUrl: '/ent_instruments.json',
    breadcrumb: ['كتالوج الأنف والأذن ومناظير الحنجرة والتشخيص', 'ENT, Laryngoscopes & Diagnostics Catalog'],
    eyebrow: ['كتالوج الأدوات الجراحية ومناظير التشخيص', 'Surgical & Diagnostic Instruments Catalog'],
    heroTitle: 'ent',
    heroText: [
      'كتالوج جراحي وتشخيصي متكامل يضم أحدث مناظير الحنجرة (Laryngoscopes)، مناظير الأذن (Otoscopes)، فحص العين والجلد، وأدوات الجراحة الدقيقة وفق معايير ISO 7376 وهيئة الغذاء والدواء SFDA.',
      'Comprehensive certified catalog featuring precision Laryngoscopes (Flexible Tip, Fiber Optic, Disposable), Otoscopes, Ophthalmoscopes, Dermatoscopes, and Surgical ENT Instruments complying with ISO 7376 and SFDA standards.'
    ],
    placeholder: [
      'ابحث برقم الموديل، كود الكتالوج (مثل OT-261-20)، اسم الأداة أو القياس...',
      'Search catalog by instrument name, SKU, catalog code (e.g. OT-261-20), or size…'
    ],
    ownDescription: false,
    pageSize: 1000,
  },
  surgical: {
    dataUrl: '/surgical_instruments.json',
    breadcrumb: ['كتالوج الأدوات الجراحية العامة', 'General Surgical Instruments Catalog'],
    eyebrow: ['كتالوج الأدوات الجراحية العامة', 'General Surgical Instruments Catalog'],
    heroTitle: 'surgical',
    heroText: [
      'مجموعة واسعة من الأدوات الجراحية العامة: المقصات، الملاقط، المباعد، مشابك الشرايين، أدوات الخياطة، المشارط والمزيد — بمقاسات وأكواد كتالوج واضحة لكل أداة.',
      'A complete range of general surgical instruments: scissors, forceps, retractors, artery clamps, suture instruments, scalpels and more — each with clear catalog codes and sizes.'
    ],
    placeholder: [
      'ابحث باسم الأداة أو كود الكتالوج (مثل SS-005-13) أو القياس...',
      'Search by instrument name, catalog code (e.g. SS-005-13), or size…'
    ],
    ownDescription: true,
    hidePage: true,
    hideClaims: true,
    materialLabel: ['فولاذ جراحي مقاوم للصدأ', 'Surgical Stainless Steel'],
    pageSize: 48,
  },
};

const DESC_WORDS_AR = [
  ['Sharp/Blunt','حاد/كليل'],['Blunt/Blunt','كليل/كليل'],['Sharp/Sharp','حاد/حاد'],
  ['Straight','مستقيم'],['Curved','منحني'],['Angled','زاوي'],['Sharp','حاد'],['Blunt','كليل'],['Delicate','دقيق'],
  ['Serrated','مسنن'],['Toothed','مسنن'],['Smooth','أملس'],['Titanium','تيتانيوم'],['With Lock','مع قفل'],['Without Lock','بدون قفل'],
  ['Slender Pattern','نمط نحيف'],['Heavy Pattern','نمط ثقيل'],['Heavy','ثقيل'],['Round Handle','مقبض دائري'],['Flat Handle','مقبض مسطح'],
  ['Jaws','فكوك'],['Teeth','أسنان'],['Handle','مقبض'],['Blades','شفرات'],['Blade','شفرة'],['Tips','رؤوس'],['Short','قصير'],['Long','طويل'],
  ['Fine','ناعم'],['Small','صغير'],['Medium','متوسط'],['Large','كبير'],['Left','يسار'],['Right','يمين'],['Pack of','عبوة من'],
  ['Standard','قياسي'],['Universal','عام'],['Extra','إضافي'],['With','مع'],['Without','بدون'],['For','لـ'],
];
const SUBCATEGORY_AR = {
  'Abdominal Retractors': 'مباعد البطن',
  'Abdominal Spatulas': 'ملاعق البطن',
  'Amputation Knives': 'سكاكين البتر',
  'Approximators': 'مقرّبات الأنسجة',
  'Bandage Scissors': 'مقصات الضماد',
  'Bed Pans': 'أوعية السرير',
  'Bile Duct Clamps': 'مشابك القناة الصفراوية',
  'Brain Knives': 'سكاكين الدماغ',
  'Bulldog Clamps': 'مشابك بولدوغ',
  'Clip Applying Forceps': 'ملاقط تركيب المشابك',
  'Clip Applying Forceps & Clips': 'ملاقط ومشابك الأنسجة',
  'Cotton Applicators': 'مطبّقات القطن',
  'Cups': 'أكواب جراحية',
  'Delicate Dissecting Scissors': 'مقصات تشريح دقيقة',
  'Dermatomes': 'مشارط الجلد',
  'Dissecting & Ligature Forceps': 'ملاقط التشريح والربط',
  'Dissecting Forceps': 'ملاقط التشريح',
  'Dissecting Scissors': 'مقصات التشريح',
  'Dressing Forceps': 'ملاقط الضماد',
  'Eye Surgery Forceps': 'ملاقط جراحة العيون',
  'Eye Surgery Scissors': 'مقصات جراحة العيون',
  'Face-Lift Scissors': 'مقصات شد الوجه',
  'Fistula Knives': 'سكاكين الناسور',
  'Fistula Probes': 'مجسات الناسور',
  'Foot Dressers & Nail Filers': 'مبارد وأدوات تنظيف القدم',
  'Grasping Forceps': 'ملاقط الإمساك',
  'Gum Scissors': 'مقصات اللثة',
  'Gynecological Scissors': 'مقصات النساء',
  'Haemostatic Forceps': 'ملاقط إيقاف النزف',
  'Hooklets': 'خطاطيف صغيرة',
  'Hysterectomy Forceps': 'ملاقط استئصال الرحم',
  'Instrument Boxes': 'علب الأدوات',
  'Iris Scissors': 'مقصات القزحية',
  'Jeweler Type Forceps': 'ملاقط نوع الصاغة',
  'Laminectomy Retractors': 'مباعد استئصال الصفيحة',
  'Ligature Conductors & Accessories': 'موصلات الربط وملحقاتها',
  'Ligature Needles': 'إبر الربط',
  'Micro Forceps': 'ملاقط دقيقة',
  'Micro Hooklets': 'خطاطيف دقيقة',
  'Micro Needle Holders': 'ماسكات إبر دقيقة',
  'Micro Scissors': 'مقصات دقيقة',
  'Mini Vessel Clips': 'مشابك أوعية صغيرة',
  'Nail Instruments': 'أدوات الأظافر',
  'Nail Nippers & Nail Cutters': 'قواطع وقصافات الأظافر',
  'Needle Holders': 'ماسكات الإبر',
  'Nerve Hooks': 'خطاطيف الأعصاب',
  'Operating Knives': 'سكاكين العمليات',
  'Operating Scissors': 'مقصات العمليات',
  'Other': 'أخرى',
  'Peritoneum Forceps': 'ملاقط الصفاق',
  'Plaster Knives': 'سكاكين الجبس',
  'Plaster Shears': 'مقصات الجبس',
  'Plaster Spreaders': 'موسعات الجبس',
  'Probes': 'مجسات',
  'Retractors': 'مباعد',
  'Ribbon Scissors': 'مقصات ريبون',
  'Ring Strippers': 'أدوات نزع الحلقات',
  'Round Bowls': 'أوعية مستديرة',
  'Saddle Hooks': 'خطاطيف سرجية',
  'Scalpel Blades': 'شفرات المشارط',
  'Scalpel Handles': 'مقابض المشارط',
  'Skin Hooks': 'خطاطيف الجلد',
  'Spirit Lamps': 'مصابيح كحولية',
  'Splinter Forceps': 'ملاقط الشظايا',
  'Stainless Steel Bowls': 'أوعية ستانلس ستيل',
  'Tissue Forceps': 'ملاقط الأنسجة',
  'Tonsil & Nasal Scissors': 'مقصات اللوزتين والأنف',
  'Tonsil Knives': 'سكاكين اللوزتين',
  'Towel Clamps': 'مشابك المناشف',
  'Tubing Clamps': 'مشابك الأنابيب',
  'Tungsten Carbide (TC) Scissors': 'مقصات كربيد التنجستن (TC)',
  'Universal Trays': 'صواني عامة',
  'Varix Instruments': 'أدوات الدوالي',
  'Vascular Forceps': 'ملاقط الأوعية',
  'Vascular Scissors': 'مقصات الأوعية',
  'Vessel Clips': 'مشابك الأوعية',
  'Wound Spreaders': 'موسعات الجروح',
};
function getLocalizedSub(name, isAr) { return isAr ? (SUBCATEGORY_AR[name] || name) : name; }
function getLocalizedSubtitle(text, isAr) {
  if (!isAr || !text) return text;
  let out = text;
  for (const [en, ar] of DESC_WORDS_AR) out = out.replace(new RegExp(`(?<![A-Za-z])${en}(?![A-Za-z])`, 'g'), ar);
  return out;
}

/* ── Category-specific Line-Art SVG Icons ─────────────────────────────────── */
function CategoryLineArtIcon({ category = '', name = '', className = '' }) {
  const cat = (category + ' ' + name).toLowerCase();

  if (cat.includes('specul')) {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M30 75 C30 55 45 40 45 20 L55 20 C55 40 70 55 70 75" />
        <path d="M40 75 L60 75" />
        <path d="M45 20 L40 10 M55 20 L60 10" />
        <circle cx="50" cy="82" r="4" fill="currentColor" opacity="0.3" />
      </svg>
    );
  }

  if (cat.includes('forcep') || cat.includes('alligator') || cat.includes('clamp')) {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M25 85 L45 45 L45 15 L40 10" />
        <path d="M75 85 L55 45 L55 15 L60 10" />
        <circle cx="28" cy="85" r="7" />
        <circle cx="72" cy="85" r="7" />
        <circle cx="50" cy="45" r="3" fill="currentColor" />
        <line x1="45" y1="25" x2="55" y2="25" />
      </svg>
    );
  }

  if (cat.includes('scissor')) {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="28" cy="80" r="9" />
        <circle cx="72" cy="80" r="9" />
        <path d="M34 73 L62 25 L68 15" />
        <path d="M66 73 L38 25 L32 15" />
        <circle cx="50" cy="48" r="3" fill="currentColor" />
      </svg>
    );
  }

  if (cat.includes('curette') || cat.includes('scoop') || cat.includes('spoon')) {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="47" y="30" width="6" height="55" rx="3" fill="currentColor" opacity="0.2" />
        <path d="M50 30 L50 15" />
        <ellipse cx="50" cy="15" rx="8" ry="5" />
      </svg>
    );
  }

  if (cat.includes('tuning') || cat.includes('fork') || cat.includes('stimmgabel')) {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M38 15 L38 50 C38 60 62 60 62 50 L62 15" />
        <path d="M50 56 L50 88" />
        <circle cx="50" cy="88" r="4" fill="currentColor" />
      </svg>
    );
  }

  if (cat.includes('laryngo') || cat.includes('blade')) {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Handle */}
        <rect x="42" y="38" width="16" height="52" rx="3" fill="currentColor" opacity="0.15" />
        <line x1="42" y1="46" x2="58" y2="46" strokeWidth="1.5" />
        <line x1="42" y1="54" x2="58" y2="54" strokeWidth="1.5" />
        <line x1="42" y1="62" x2="58" y2="62" strokeWidth="1.5" />
        {/* Hook on top */}
        <path d="M46 38 L46 28 L54 28 L54 38" />
        {/* Curved blade extending left */}
        <path d="M46 28 C30 25 15 35 12 50 C18 42 32 38 46 38" fill="currentColor" opacity="0.25" />
        <circle cx="22" cy="38" r="2.5" fill="currentColor" />
      </svg>
    );
  }

  if (cat.includes('oto') || cat.includes('ear diagnostic')) {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Knurled handle */}
        <rect x="43" y="44" width="14" height="46" rx="3" fill="currentColor" opacity="0.15" />
        {/* Bayonet collar */}
        <rect x="41" y="38" width="18" height="6" rx="1" />
        {/* Otoscope head */}
        <path d="M44 38 L44 26 L56 22 L56 38 Z" fill="currentColor" opacity="0.2" />
        {/* Speculum tip pointing left */}
        <path d="M44 28 L24 24 L24 30 L44 34 Z" fill="currentColor" opacity="0.3" />
        {/* Magnifying lens rim */}
        <ellipse cx="56" cy="30" rx="4" ry="7" />
      </svg>
    );
  }

  if (cat.includes('ophthalmo') || cat.includes('eye')) {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Handle */}
        <rect x="44" y="48" width="12" height="42" rx="3" fill="currentColor" opacity="0.15" />
        {/* Ophthalmoscope head with lens dial */}
        <rect x="36" y="16" width="28" height="32" rx="6" fill="currentColor" opacity="0.2" />
        <circle cx="50" cy="30" r="7" />
        <circle cx="50" cy="30" r="3" fill="currentColor" />
        {/* Brow rest */}
        <path d="M40 16 C46 12 54 12 60 16" strokeWidth="2.5" />
      </svg>
    );
  }

  if (cat.includes('dermato') || cat.includes('skin')) {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Handle */}
        <rect x="43" y="44" width="14" height="46" rx="3" fill="currentColor" opacity="0.15" />
        {/* Dermatoscope circular head with measuring contact plate */}
        <circle cx="50" cy="26" r="16" fill="currentColor" opacity="0.15" />
        <circle cx="50" cy="26" r="11" strokeWidth="1.8" />
        <line x1="42" y1="26" x2="58" y2="26" strokeWidth="1.2" />
        <line x1="50" y1="20" x2="50" y2="32" strokeWidth="1.2" />
      </svg>
    );
  }

  if (cat.includes('hammer') || cat.includes('percussion')) {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Shaft */}
        <rect x="48" y="24" width="4" height="66" rx="2" fill="currentColor" />
        {/* Tomahawk / triangular head */}
        <path d="M30 24 L70 24 L60 12 L40 12 Z" fill="currentColor" opacity="0.3" />
        {/* Rubber bumpers */}
        <circle cx="32" cy="18" r="4" fill="currentColor" />
        <circle cx="68" cy="18" r="4" fill="currentColor" />
      </svg>
    );
  }

  if (cat.includes('set') || cat.includes('box') || cat.includes('packing') || cat.includes('case')) {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Case outline */}
        <rect x="18" y="32" width="64" height="48" rx="6" fill="currentColor" opacity="0.15" />
        <line x1="18" y1="46" x2="82" y2="46" />
        {/* Latches */}
        <rect x="34" y="43" width="6" height="7" rx="1" fill="currentColor" />
        <rect x="60" y="43" width="6" height="7" rx="1" fill="currentColor" />
        {/* Top handle */}
        <path d="M40 32 L40 22 C40 20 60 20 60 22 L60 32" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="47" y="15" width="6" height="60" rx="3" fill="currentColor" opacity="0.2" />
      <path d="M47 15 L43 30 L57 30 L53 15Z" fill="currentColor" opacity="0.4" />
      <circle cx="50" cy="82" r="6" />
    </svg>
  );
}

/* ── Image Component with Fallback ────────────────────────────────────────── */
function InstrumentImage({ src, category, name, className }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const isBanner = src && (
    src.includes('518x164') ||
    src.includes('banner') ||
    src.includes('page004_inst3') ||
    src.includes('page006_inst1') ||
    src.includes('page007_inst5') ||
    src.includes('page008_inst2') ||
    src.includes('page009_inst5') ||
    src.includes('page010_inst1')
  );

  if (src && !imgError && !isBanner) {
    return (
      <img
        src={src}
        alt={name}
        className={className}
        loading="lazy"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="ent-lineart-wrapper">
      <CategoryLineArtIcon category={category} name={name} className="ent-card-lineart-icon" />
      <span className="lineart-caption">مخطط جراحي توضيحي</span>
    </div>
  );
}

/* ── Interactive Product Card Component ───────────────────────────────────── */
function InstrumentCard({ instrument, onOpenDetail, isAr, cfg }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const variants = instrument.variants || [];
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || {});

  // Update selected variant when instrument changes
  useEffect(() => {
    if (variants.length > 0) {
      setSelectedVariant(variants[0]);
    }
  }, [instrument, variants]);

  const activeImage = selectedVariant.image || instrument.images?.[0];
  const activeSku = selectedVariant.code || instrument.sku || `ENT-${instrument.id}`;
  const activePrice = priceOf(selectedVariant.price || instrument.price);

  const localizedName = getLocalizedName(instrument.name, isAr);
  const localizedCategory = getLocalizedCategory(instrument.category, isAr);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    const itemToAdd = {
      id: selectedVariant.id || `${instrument.id}-v1`,
      sku: activeSku,
      name: `${instrument.name} ${selectedVariant.size ? `(${selectedVariant.size})` : ''}`,
      price: activePrice,
      image: activeImage || '/icon_surgical_instruments.png',
      category: instrument.category,
      variant: selectedVariant,
    };
    addToCart(itemToAdd);
    if (addToast) {
      addToast(
        isAr ? `تمت إضافة ${localizedName} إلى السلة` : `Added ${instrument.name} to cart`,
        'success'
      );
    }
  };

  const handleVariantSelectChange = (e) => {
    e.stopPropagation();
    const selectedCode = e.target.value;
    const found = variants.find((v) => v.code === selectedCode);
    if (found) {
      setSelectedVariant(found);
    }
  };

  return (
    <article className="ent-card" onClick={() => onOpenDetail(instrument, selectedVariant)}>
      {/* Top Image Container */}
      <div className="ent-card-image-box product-card-img-wrap">
        <InstrumentImage src={activeImage} category={instrument.category} name={instrument.name} className="ent-card-img" />
        
        <div className="ent-card-top-badges">
          <span className="ent-badge sfda-badge">{isAr ? 'مرخص SFDA ✓' : 'SFDA ✓'}</span>
          {!cfg?.hidePage && <span className="ent-badge page-badge">{isAr ? `ص ${instrument.page}` : `p. ${instrument.page}`}</span>}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="ent-card-content">
        <div className="ent-card-meta-row">
          <span className="ent-card-sku">REF: {activeSku}</span>
          <span className="ent-card-category-label">{localizedCategory}</span>
        </div>

        <h3 className="ent-card-title" title={localizedName}>{localizedName}</h3>
        {instrument.subtitle && (
          <p className="ent-card-subtitle" dir={isAr ? 'rtl' : 'ltr'}>{getLocalizedSubtitle(instrument.subtitle, isAr)}</p>
        )}

        {/* Quick Variant Preview & Selector on Card Face */}
        {variants.length > 1 ? (
          <div className="ent-card-variant-picker" onClick={(e) => e.stopPropagation()}>
            <label className="variant-picker-label">
              {isAr ? 'القياسات والمتغيرات:' : 'Select Variant / Size:'}
            </label>
            <select
              className="ent-card-variant-select"
              value={selectedVariant.code}
              onChange={handleVariantSelectChange}
            >
              {variants.map((v, i) => (
                <option key={v.id || i} value={v.code}>
                  {v.code} {v.size ? `(${v.size})` : ''}{priceOf(v.price) ? ` - ${v.price} ${isAr ? 'ر.س' : 'SAR'}` : ''}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="ent-card-tags-row">
            <span className="ent-tag material-tag">
              {cfg?.materialLabel ? (isAr ? cfg.materialLabel[0] : cfg.materialLabel[1]) : (isAr ? 'فولاذ جراحي ألماني' : 'German Stainless')}
            </span>
            <span className="ent-tag variant-tag">
              {variants[0]?.size || (isAr ? 'مقاس قياسي' : 'Standard Size')}
            </span>
          </div>
        )}

        {/* Price Display */}
        <div className="ent-card-price-section">
          <span className="price-title">{isAr ? 'السعر' : 'Price'}</span>
          <div className="price-amount">
            {activePrice ? `${activePrice}.00 ${isAr ? 'ر.س' : 'SAR'}` : priceOnRequest(isAr)}
          </div>
        </div>

        {/* Symmetrical Dual CTAs */}
        <div className="ent-card-actions-grid">
          <button
            className="ent-btn ent-btn-details"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(instrument, selectedVariant);
            }}
            title={isAr ? 'عرض التفاصيل' : 'View Details'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            {isAr ? 'التفاصيل' : 'Details'}
          </button>
          
          <button
            className="ent-btn ent-btn-cart"
            onClick={handleQuickAdd}
            title={isAr ? 'إضافة للسلة' : 'Add to Cart'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {isAr ? 'إضافة' : 'Add Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ── Interactive Product Detail Modal Component ──────────────────────────── */
function ProductDetailModal({ instrument, initialVariant, onClose, isAr, cfg }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const variants = instrument.variants || [];
  const [selectedVariant, setSelectedVariant] = useState(initialVariant || variants[0] || {});
  const [quantity, setQuantity] = useState(1);
  // A thumbnail the shopper picked by hand; cleared again when they choose another variant.
  const [galleryImg, setGalleryImg] = useState(null);
  const pickVariant = (v) => { setSelectedVariant(v); setGalleryImg(null); };

  // Synchronize variant image: when variant changes, image changes!
  const activeImage = galleryImg || selectedVariant?.image || instrument.images?.[0];

  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = origOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!instrument) return null;

  const localizedName = getLocalizedName(instrument.name, isAr);
  const localizedCategory = getLocalizedCategory(instrument.category, isAr);
  const localizedDesc = cfg?.ownDescription
    ? (isAr
        ? `أداة جراحية من فئة «${localizedCategory}»${instrument.subtitle ? ` — ${getLocalizedSubtitle(instrument.subtitle, true)}` : ''}. تتوفر بالمقاسات والأكواد الموضحة في الجدول أدناه.`
        : instrument.description)
    : getLocalizedDescription(instrument.category, isAr);

  const unitPrice = priceOf(selectedVariant?.price || instrument.price);
  const totalPrice = unitPrice ? (unitPrice * quantity).toFixed(2) : null;
  const activeSku = selectedVariant?.code || instrument.sku || `ENT-${instrument.id}`;

  const handleAddToCart = () => {
    const itemToAdd = {
      id: selectedVariant?.id || `${instrument.id}-v1`,
      sku: activeSku,
      name: `${instrument.name} ${selectedVariant?.size ? `(${selectedVariant.size})` : ''}`,
      price: unitPrice,
      image: activeImage || '/icon_surgical_instruments.png',
      category: instrument.category,
      variant: selectedVariant,
    };

    for (let i = 0; i < quantity; i++) {
      addToCart(itemToAdd);
    }

    if (addToast) {
      addToast(
        isAr ? `تمت إضافة ${quantity} × ${localizedName} إلى السلة` : `Added ${quantity}x ${instrument.name} to cart`,
        'success'
      );
    }
    onClose();
  };

  return createPortal(
    <div className="ent-modal-backdrop" onClick={onClose} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="ent-modal-box" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Close Button */}
        <button className="ent-modal-close-btn" onClick={onClose} aria-label="Close modal">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="ent-modal-content-grid">
          {/* Left Column: Image & Certifications */}
          <div className="ent-modal-left-col">
            <div className="ent-modal-img-container">
              <InstrumentImage src={activeImage} category={instrument.category} name={instrument.name} className="ent-modal-img" />
              {!cfg?.hidePage && (
                <span className="ent-modal-page-tag">
                  {isAr ? `صفحة الكتالوج ${instrument.page}` : `Catalogue Page ${instrument.page}`}
                </span>
              )}
            </div>

            {/* Thumbnail switcher for multi-image variants */}
            {instrument.images?.length > 1 && (
              <div className="ent-modal-thumb-row">
                {instrument.images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`thumb-box ${activeImage === img ? 'active' : ''}`}
                    onClick={() => {
                      // Find variant that matches this image, or update image directly
                      setGalleryImg(img);
                    }}
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            {/* Regulatory & Quality Badges */}
            <div className="ent-modal-badges-list">
              <div className="badge-row">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <div>
                  <strong>{isAr ? 'معتمد من هيئة الغذاء والدواء' : 'SFDA Approved'}</strong>
                  <span>{isAr ? 'مسجل ومصرح في المملكة العربية السعودية' : 'Saudi Food & Drug Authority Registered'}</span>
                </div>
              </div>

              <div className="badge-row">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                <div>
                  <strong>{isAr ? 'شهادات CE و ISO 13485' : 'CE & ISO 13485 Certified'}</strong>
                  <span>{isAr ? 'مطابق لأعلى معايير الجودة الطبية الجراحية' : 'Full Operating Room Medical Grade'}</span>
                </div>
              </div>

              <div className="badge-row">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <div>
                  <strong>{isAr ? 'قابل للتعقيم بالأتوكلاف' : 'Autoclavable Sterilization'}</strong>
                  <span>{isAr ? 'تحمل حرارة تعقيم حتى 134° م' : 'Re-sterilizable up to 134°C / 273°F'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Instrument Specifications & Interactive Variants */}
          <div className="ent-modal-right-col">
            <div className="ent-modal-header-block">
              <span className="modal-category-name">{localizedCategory}</span>
              <h2 className="modal-product-title">{localizedName}</h2>
              <div className="modal-sku-row">
                <span className="modal-sku-pill">REF: {activeSku}</span>
                <span className="modal-stock-status">
                  {isAr ? '✓ متوفر • جاهز للتسليم' : '✓ Available • In Stock'}
                </span>
              </div>
            </div>

            <p className="modal-product-desc">{localizedDesc}</p>

            {/* Price Banner */}
            <div className="ent-modal-price-banner">
              {unitPrice ? (
                <>
                  <div className="price-item">
                    <span className="price-item-label">{isAr ? 'سعر الوحدة' : 'Unit Price'}</span>
                    <span className="price-item-value">{unitPrice}.00 {isAr ? 'ر.س' : 'SAR'}</span>
                  </div>
                  <div className="price-item total">
                    <span className="price-item-label">{isAr ? 'المبلغ الإجمالي' : 'Total Amount'}</span>
                    <span className="price-item-value">{totalPrice} {isAr ? 'ر.س' : 'SAR'}</span>
                  </div>
                </>
              ) : (
                <div className="price-item total">
                  <span className="price-item-label">{isAr ? 'السعر' : 'Price'}</span>
                  <span className="price-item-value">{priceOnRequest(isAr)}</span>
                </div>
              )}
            </div>

            {/* Interactive Variants Selector Table */}
            <div className="ent-modal-variants-block">
              <h4 className="variants-heading">
                {isAr ? 'اختر مقاس الأداة وكود الكتالوج (تتغير الصورة والسعر تلقائياً):' : 'Select Instrument Size & Catalog Code (Image Updates Live):'}
              </h4>
              <div className="variants-table-container">
                <table className="modal-variants-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>{isAr ? 'تحديد' : 'Select'}</th>
                      <th>{isAr ? 'كود الكتالوج' : 'Catalog Code'}</th>
                      <th>{isAr ? 'القياس / الطول' : 'Size / Length'}</th>
                      <th>{isAr ? 'الشكل' : 'Profile'}</th>
                      <th>{isAr ? 'السعر' : 'Price'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, i) => (
                      <tr
                        key={v.id || i}
                        className={selectedVariant?.code === v.code ? 'selected-variant-row' : ''}
                        onClick={() => pickVariant(v)}
                      >
                        <td>
                          <input
                            type="radio"
                            name="instrument-variant-radio"
                            checked={selectedVariant?.code === v.code}
                            onChange={() => pickVariant(v)}
                          />
                        </td>
                        <td className="table-code-cell"><strong>{v.code}</strong></td>
                        <td>{v.size || (isAr ? 'قياسي' : 'Standard')}</td>
                        <td>{v.profile || '—'}</td>
                        <td className="table-price-cell">{priceOf(v.price) ? `${v.price}.00 ${isAr ? 'ر.س' : 'SAR'}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Specs Summary Grid */}
            <div className="modal-specs-grid">
              <div className="spec-card">
                <span className="spec-label">{isAr ? 'المادة المصنعة' : 'Material'}</span>
                <span className="spec-value">{cfg?.materialLabel ? (isAr ? cfg.materialLabel[0] : cfg.materialLabel[1]) : (isAr ? 'فولاذ جراحي ألماني مقاوم للصدأ' : 'German Surgical Stainless Steel')}</span>
              </div>
              {!cfg?.hideClaims && (
              <div className="spec-card">
                <span className="spec-label">{isAr ? 'درجة الجودة' : 'Quality Grade'}</span>
                <span className="spec-value">{isAr ? 'درجة غرف العمليات الممتازة' : 'OR Premium Grade'}</span>
              </div>
              )}
              <div className="spec-card">
                <span className="spec-label">{isAr ? 'التعقيم' : 'Sterilization'}</span>
                <span className="spec-value">{isAr ? 'أتوكلاف (134° م)' : 'Autoclavable (134°C)'}</span>
              </div>
              {!cfg?.hideClaims && (
              <div className="spec-card">
                <span className="spec-label">{isAr ? 'الضمان' : 'Warranty'}</span>
                <span className="spec-value">{isAr ? 'ضمان مدى الحياة ضد عيوب التصنيع' : 'Lifetime Warranty'}</span>
              </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="modal-actions-bar">
              <div className="modal-qty-selector">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="modal-qty-btn"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="modal-qty-num">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="modal-qty-btn"
                >
                  +
                </button>
              </div>

              <button className="modal-add-cart-btn" onClick={handleAddToCart}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {isAr
                  ? `إضافة ${quantity} للسلة${totalPrice ? ` • ${totalPrice} ر.س` : ''}`
                  : `Add ${quantity} to Cart${totalPrice ? ` • ${totalPrice} SAR` : ''}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ── Main Catalog Page Component ─────────────────────────────────────────── */
function ENTCatalog({ catalog = 'ent' }) {
  const cfg = CATALOGS[catalog] || CATALOGS.ent;
  const { t, i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');

  const [instrumentData, setInstrumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  // Sidebar search sends ?q=… — keep the box in sync when it changes
  useEffect(() => { setSearch(searchParams.get('q') || ''); }, [searchParams]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSub, setActiveSub] = useState('All');
  const [visibleCount, setVisibleCount] = useState(cfg.pageSize);
  const [selectedDetail, setSelectedDetail] = useState(null); // { instrument, initialVariant }

  // Load JSON data
  useEffect(() => {
    fetch(cfg.dataUrl)
      .then(r => r.json())
      .then(data => { setInstrumentData(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [cfg.dataUrl]);

  const allInstruments = instrumentData?.instruments || [];
  const totalInstruments = instrumentData?.total_instruments || 0;
  const totalCategories = instrumentData?.total_categories || 0;

  const categories = useMemo(() => {
    if (!instrumentData) return ['All'];
    return ['All', ...(instrumentData.categories || [])];
  }, [instrumentData]);

  const categoryCounts = useMemo(() => {
    const counts = { All: allInstruments.length };
    for (const inst of allInstruments) {
      counts[inst.category] = (counts[inst.category] || 0) + 1;
    }
    return counts;
  }, [allInstruments]);

  // Second-level chips (only for catalogues whose entries carry a subcategory)
  const subcategories = useMemo(() => {
    if (activeCategory === 'All') return [];
    const counts = {};
    for (const inst of allInstruments) {
      if (inst.category === activeCategory && inst.subcategory) counts[inst.subcategory] = (counts[inst.subcategory] || 0) + 1;
    }
    const list = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return list.length > 1 ? list : [];
  }, [allInstruments, activeCategory]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allInstruments.filter(inst => {
      if (activeCategory !== 'All' && inst.category !== activeCategory) return false;
      if (activeCategory !== 'All' && activeSub !== 'All' && inst.subcategory !== activeSub) return false;
      if (!q) return true;
      const localizedN = getLocalizedName(inst.name, isAr).toLowerCase();
      const variantText = inst.variants?.map(v => `${v.code} ${v.size} ${v.raw}`).join(' ') || '';
      return (
        inst.name.toLowerCase().includes(q) ||
        (inst.subtitle || '').toLowerCase().includes(q) ||
        (inst.subcategory || '').toLowerCase().includes(q) ||
        localizedN.includes(q) ||
        inst.sku?.toLowerCase().includes(q) ||
        inst.category.toLowerCase().includes(q) ||
        variantText.toLowerCase().includes(q)
      );
    });
  }, [allInstruments, search, activeCategory, activeSub, isAr]);

  // Big catalogues render in pages; restart from the first page when the result set changes
  useEffect(() => { setVisibleCount(cfg.pageSize); }, [search, activeCategory, activeSub, cfg.pageSize]);

  const handleSearch = useCallback(e => setSearch(e.target.value), []);

  const handleOpenDetail = (instrument, variant) => {
    setSelectedDetail({ instrument, initialVariant: variant });
  };

  return (
    <main className="ent-catalog-page" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/products">{t('products.title_products', 'Products')}</Link>
        <span>›</span>
        <span>{isAr ? cfg.breadcrumb[0] : cfg.breadcrumb[1]}</span>
      </nav>

      {/* Hero Banner */}
      <header className="ent-hero">
        <div className="ent-hero-content">
          <span className="ent-hero-eyebrow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {isAr ? cfg.eyebrow[0] : cfg.eyebrow[1]}
          </span>
          <h1>
            {cfg.heroTitle === 'surgical' ? (
              isAr ? (
                <>الأدوات <span>الجراحية العامة</span></>
              ) : (
                <>General <span>Surgical</span> Instruments</>
              )
            ) : isAr ? (
              <>أدوات <span>الأنف والأذن ومناظير الحنجرة والتشخيص</span></>
            ) : (
              <>ENT, Laryngoscopes &amp; <span>Diagnostics</span> Instruments</>
            )}
          </h1>
          <p>
            {isAr ? cfg.heroText[0] : cfg.heroText[1]}
          </p>

          {!loading && (
            <div className="ent-hero-stats">
              <div className="ent-stat">
                <span className="ent-stat-num">{totalInstruments}</span>
                <span className="ent-stat-label">{isAr ? 'موديل جراحي' : 'Surgical Models'}</span>
              </div>
              <div className="ent-stat">
                <span className="ent-stat-num">{totalCategories}</span>
                <span className="ent-stat-label">{cfg.heroTitle === 'surgical' ? (isAr ? 'أقسام' : 'Categories') : (isAr ? 'تخصصات جراحية' : 'Specialties')}</span>
              </div>
              <div className="ent-stat">
                <span className="ent-stat-num">SFDA</span>
                <span className="ent-stat-label">{isAr ? 'معتمد ومسجل' : 'SFDA Certified'}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Catalog Main View */}
      {loading ? (
        <div className="ent-loading">
          <div className="ent-loading-spinner" />
          <p>{isAr ? 'جاري تحميل كتالوج الأدوات الجراحية...' : 'Loading Surgical Instruments Catalog…'}</p>
        </div>
      ) : (
        <>
          {/* Controls Bar: Search */}
          <div className="ent-controls">
            <div className="ent-search-box">
              <span className="ent-search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                id="ent-search-input"
                type="search"
                placeholder={isAr ? cfg.placeholder[0] : cfg.placeholder[1]}
                value={search}
                onChange={handleSearch}
                aria-label="Search ENT instruments"
              />
              {search && (
                <button className="clear-search-btn" onClick={() => setSearch('')}>×</button>
              )}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="ent-category-filters" role="toolbar" aria-label="Filter by category">
            {categories.map(cat => (
              <button
                key={cat}
                className={`ent-cat-chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => { setActiveCategory(cat); setActiveSub('All'); }}
                aria-pressed={activeCategory === cat}
              >
                {getLocalizedCategory(cat, isAr)}
                <span className="ent-cat-chip-count">{categoryCounts[cat] ?? 0}</span>
              </button>
            ))}
          </div>

          {subcategories.length > 0 && (
            <div className="ent-category-filters ent-sub-filters" role="toolbar" aria-label="Filter by type">
              <button
                className={`ent-cat-chip ent-sub-chip ${activeSub === 'All' ? 'active' : ''}`}
                onClick={() => setActiveSub('All')}
                aria-pressed={activeSub === 'All'}
              >
                {isAr ? 'كل الأنواع' : 'All types'}
              </button>
              {subcategories.map(([sub, n]) => (
                <button
                  key={sub}
                  className={`ent-cat-chip ent-sub-chip ${activeSub === sub ? 'active' : ''}`}
                  onClick={() => setActiveSub(sub)}
                  aria-pressed={activeSub === sub}
                >
                  {getLocalizedSub(sub, isAr)}
                  <span className="ent-cat-chip-count">{n}</span>
                </button>
              ))}
            </div>
          )}

          {/* Results Info */}
          <div className="ent-results-bar">
            <span className="ent-results-info">
              {isAr ? (
                <>عرض <strong>{filtered.length}</strong> أداة جراحية{activeCategory !== 'All' && <> في قسم <em>{getLocalizedCategory(activeCategory, true)}</em></>}</>
              ) : (
                <>Showing <strong>{filtered.length}</strong> instruments{activeCategory !== 'All' && <> in <em>{activeCategory}</em></>}</>
              )}
            </span>
          </div>

          {/* Product Cards Grid */}
          {filtered.length === 0 ? (
            <div className="ent-empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <h3>{isAr ? 'لم يتم العثور على أدوات جراحية' : 'No surgical instruments found'}</h3>
              <p>{isAr ? 'يرجى تغيير كلمة البحث أو اختيار قسم آخر.' : 'Try searching for a different term or select another category filter.'}</p>
              <button className="ent-btn ent-btn-details" onClick={() => { setSearch(''); setActiveCategory('All'); }}>
                {isAr ? 'إعادة ضبط البحث' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="ent-instruments-grid">
              {filtered.slice(0, visibleCount).map((inst, index) => (
                <InstrumentCard
                  key={inst.id || inst.sku || index}
                  instrument={inst}
                  onOpenDetail={handleOpenDetail}
                  isAr={isAr}
                  cfg={cfg}
                />
              ))}
            </div>
          )}
          {filtered.length > visibleCount && (
            <div className="ent-show-more">
              <p>
                {isAr
                  ? `تم عرض ${visibleCount} من ${filtered.length}`
                  : `Showing ${visibleCount} of ${filtered.length}`}
              </p>
              <button className="ent-btn ent-btn-details" onClick={() => setVisibleCount(c => c + cfg.pageSize * 2)}>
                {isAr ? 'عرض المزيد' : 'Show more'}
              </button>
            </div>
          )}
        </>
      )}

      {/* React Portal Product Detail Modal */}
      {selectedDetail && (
        <ProductDetailModal
          instrument={selectedDetail.instrument}
          initialVariant={selectedDetail.initialVariant}
          onClose={() => setSelectedDetail(null)}
          isAr={isAr}
          cfg={cfg}
        />
      )}
    </main>
  );
}

export default ENTCatalog;
