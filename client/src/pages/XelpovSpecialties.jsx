import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SpecialtyIcon } from '../components/SpecialtyIcons';
import { loadXelpovProducts } from '../utils/xelpovData';
import './XelpovSpecialties.css';

const IconSearch = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

// ── All 21 specialties — label must match exactly what is stored in catalogue ──
const SPECIALTIES = [
  {
    slug: 'orthopedic',
    label: 'Orthopedic',
    labelAr: 'العظام والمفاصل',
    desc: 'Bone hooks, chisels, rasps, gouges, retractors, and instruments for orthopaedic procedures.',
    descAr: 'خطافات العظام والأزاميل والمبارد والمكاشط والمباعد وأدوات جراحة العظام والمفاصل.',
    count: 898,
    color: '#795548',
  },
  {
    slug: 'ent',
    label: 'ENT',
    labelAr: 'الأنف والأذن والحنجرة',
    desc: 'Ear instruments, nasal forceps, laryngoscopes, speculums, and rhinology surgical tools.',
    descAr: 'أدوات الأذن وملاقط الأنف ومناظير الحنجرة والمناظير وأدوات جراحة الأنف.',
    count: 814,
    color: '#3F51B5',
  },
  {
    slug: 'dental',
    label: 'Dental',
    labelAr: 'طب الأسنان',
    desc: 'Extraction forceps, elevators, scalers, chisels, and a full range of dental surgical instruments.',
    descAr: 'ملاقط الخلع والرافعات والمكاشط والأزاميل ومجموعة كاملة من الأدوات الجراحية لطب الأسنان.',
    count: 809,
    color: '#009688',
  },
  {
    slug: 'general-surgery',
    label: 'General Surgery',
    labelAr: 'الجراحة العامة',
    desc: 'Scissors, forceps, clamps, retractors, scalpels, needle holders, and general surgical instruments.',
    descAr: 'مقصات وملاقط ومشابك ومباعد ومشارط وحاملات إبر وأدوات جراحة عامة.',
    count: 719,
    color: '#4CAF50',
  },
  {
    slug: 'cardiovascular',
    label: 'Cardiovascular',
    labelAr: 'أمراض القلب والأوعية الدموية',
    desc: 'Vascular clamps, needle holders, scissors, forceps, and instruments for cardiac and vascular surgery.',
    descAr: 'مشابك الأوعية وحاملات الإبر والمقصات والملاقط وأدوات جراحة القلب والأوعية الدموية.',
    count: 639,
    color: '#F44336',
  },
  {
    slug: 'oral-maxillofacial',
    label: 'Oral & Maxillofacial',
    labelAr: 'الفم والوجه والفكين',
    desc: 'Osteotomes, elevators, retractors, chisels, and instruments for oral and maxillofacial surgery.',
    descAr: 'أدوات قطع العظام والرافعات والمباعد والأزاميل وأدوات جراحة الفم والوجه والفكين.',
    count: 623,
    color: '#FF9800',
  },
  {
    slug: 'gynecology-obstetrics',
    label: 'Gynecology & Obstetrics',
    labelAr: 'النساء والتوليد',
    desc: 'Speculums, forceps, scissors, retractors, and instruments for gynaecological and obstetric procedures.',
    descAr: 'المناظير والملاقط والمقصات والمباعد وأدوات أمراض النساء والتوليد.',
    count: 526,
    color: '#FF4081',
  },
  {
    slug: 'neurosurgery-spine',
    label: 'Neurosurgery / Spine',
    labelAr: 'جراحة الأعصاب والعمود الفقري',
    desc: 'Micro dissectors, hooks, curettes, raspators, and instruments for neurosurgery and spinal procedures.',
    descAr: 'أدوات التشريح الدقيقة والخطافات والمكاشط وأدوات جراحة الأعصاب والعمود الفقري.',
    count: 517,
    color: '#607D8B',
  },
  {
    slug: 'stomach-intestine-rectum',
    label: 'Stomach, Intestine & Rectum',
    labelAr: 'المعدة والأمعاء والمستقيم',
    desc: 'Intestinal clamps, gall duct instruments, bowel retractors, and gastrointestinal surgery tools.',
    descAr: 'مشابك الأمعاء وأدوات القناة الصفراوية ومباعد الأمعاء وأدوات الجراحة المعدية المعوية.',
    count: 486,
    color: '#FF5722',
  },
  {
    slug: 'ophthalmic',
    label: 'Ophthalmic',
    labelAr: 'طب العيون',
    desc: 'Corneal forceps, iris hooks, capsulorhexis forceps, and instruments for ophthalmic surgery.',
    descAr: 'ملاقط القرنية وخطافات القزحية وملاقط قطع المحفظة والأدوات الجراحية للعين.',
    count: 454,
    color: '#00BCD4',
  },
  {
    slug: 'urology',
    label: 'Urology',
    labelAr: 'المسالك البولية',
    desc: 'Dilators, retractors, forceps, and specialised urological instruments for the urinary tract.',
    descAr: 'أدوات التوسيع والمباعد والملاقط والأدوات البولية المتخصصة للجهاز البولي.',
    count: 428,
    color: '#9C27B0',
  },
  {
    slug: 'microsurgery',
    label: 'Microsurgery',
    labelAr: 'الجراحة الدقيقة',
    desc: 'Micro needle holders, scissors, forceps, vessel clamps, and all precision microsurgical instruments.',
    descAr: 'حاملات الإبر الدقيقة والمقصات والملاقط ومشابك الأوعية وجميع الأدوات الجراحية الدقيقة.',
    count: 230,
    color: '#2196F3',
  },
  {
    slug: 'plastic-surgery',
    label: 'Plastic Surgery',
    labelAr: 'جراحة التجميل',
    desc: 'Retractors, dissecting forceps, scissors, osteotomes, and instruments for reconstructive and aesthetic surgery.',
    descAr: 'مباعد وملاقط تشريح ومقصات وأدوات التقطيع وأدوات الجراحة الترميمية والتجميلية.',
    count: 237,
    color: '#E91E63',
  },
  {
    slug: 'post-mortem',
    label: 'Post Mortem',
    labelAr: 'الطب الشرعي وما بعد الوفاة',
    desc: 'Autopsy knives, saws, chisels, and specialised instruments for post-mortem examination procedures.',
    descAr: 'سكاكين التشريح والمناشير والأزاميل والأدوات المتخصصة لإجراءات فحص ما بعد الوفاة.',
    count: 52,
    color: '#455A64',
  },
  {
    slug: 'podiatry-instruments',
    label: 'Podiatry Instruments',
    labelAr: 'أدوات طب القدم',
    desc: 'Nail clippers, rasps, chisels, and specialised instruments for podiatric and foot surgery.',
    descAr: 'قصاصات الأظافر والمبارد والأزاميل والأدوات المتخصصة لجراحة القدم.',
    count: 26,
    color: '#8BC34A',
  },
  {
    slug: 'dressing-instruments',
    label: 'Dressing Instruments',
    labelAr: 'أدوات الضماد والتضميد',
    desc: 'Dressing forceps, scissors, bowls, and instruments used in wound care and dressing procedures.',
    descAr: 'ملاقط الضماد والمقصات والأوعية والأدوات المستخدمة في رعاية الجروح وإجراءات التضميد.',
    count: 17,
    color: '#26C6DA',
  },
  {
    slug: 'dermatology',
    label: 'Dermatology',
    labelAr: 'الأمراض الجلدية',
    desc: 'Curettes, punches, comedo extractors, and instruments for dermatological and skin procedures.',
    descAr: 'المكاشط وأدوات القطع ومستخرجات الكوميدو والأدوات الجراحية لإجراءات الجلدية.',
    count: 15,
    color: '#AB47BC',
  },
  {
    slug: 'diagnostic',
    label: 'Diagnostic',
    labelAr: 'الأدوات التشخيصية',
    desc: 'Diagnostic hammers, stethoscopes, otoscopes, and instruments for clinical examination and diagnosis.',
    descAr: 'مطارق التشخيص والسماعات والأوتوسكوبات والأدوات الطبية للفحص السريري والتشخيص.',
    count: 14,
    color: '#FFA726',
  },
  {
    slug: 'skin-grafting',
    label: 'Skin Grafting',
    labelAr: 'زراعة الجلد',
    desc: 'Dermatomes, skin graft knives, and specialised instruments for skin harvesting and grafting procedures.',
    descAr: 'أجهزة نشر الجلد وسكاكين طعوم الجلد والأدوات المتخصصة لإجراءات زراعة الجلد.',
    count: 5,
    color: '#EF5350',
  },
  {
    slug: 'anaesthesia',
    label: 'Anaesthesia Instruments',
    labelAr: 'أدوات التخدير',
    desc: 'Laryngoscopes, airways, and specialised instruments used in anaesthesia and airway management.',
    descAr: 'مناظير الحنجرة والمجاري الهوائية والأدوات المتخصصة في إدارة التخدير والمسالك الهوائية.',
    count: 6,
    color: '#29B6F6',
  },
  {
    slug: 'mammaplasty',
    label: 'Mammaplasty',
    labelAr: 'جراحة الثدي التجميلية',
    desc: 'Specialised retractors, dissectors, and instruments for breast augmentation and reconstruction surgery.',
    descAr: 'مباعد ومشارط متخصصة وأدوات لجراحات تكبير الثدي وإعادة البناء.',
    count: 3,
    color: '#EC407A',
  },
];

// Map slug → exact specialty label as stored in catalogue
const SLUG_TO_LABEL = {
  'orthopedic':              'Orthopedic',
  'ent':                     'ENT',
  'dental':                  'Dental',
  'general-surgery':         'General Surgery',
  'cardiovascular':          'Cardiovascular',
  'oral-maxillofacial':      'Oral & Maxillofacial',
  'gynecology-obstetrics':   'Gynecology & Obstetrics',
  'neurosurgery-spine':      'Neurosurgery / Spine',
  'stomach-intestine-rectum':'Stomach, Intestine & Rectum',
  'ophthalmic':              'Ophthalmic',
  'urology':                 'Urology',
  'microsurgery':            'Microsurgery',
  'plastic-surgery':         'Plastic Surgery',
  'post-mortem':             'Post Mortem',
  'podiatry-instruments':    'Podiatry Instruments',
  'dressing-instruments':    'Dressing Instruments',
  'dermatology':             'Dermatology',
  'diagnostic':              'Diagnostic',
  'skin-grafting':           'Skin Grafting',
  'anaesthesia':             'Anaesthesia Instruments',
  'mammaplasty':             'Mammaplasty',
};

function XelpovSpecialties() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');
  const [liveCounts, setLiveCounts] = useState({});
  const [liveImages, setLiveImages] = useState({});
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'az'

  useEffect(() => {
    loadXelpovProducts()
      .then(data => {
        const counts = {};
        const images = {};
        data.forEach(p => {
          (p.specialty || []).forEach(s => {
            counts[s] = (counts[s] || 0) + 1;
            if (!images[s] && p.image) images[s] = p.image;
          });
        });
        setLiveCounts(counts);
        setLiveImages(images);
      })
      .catch(() => {});
  }, []);

  const visibleSpecialties = useMemo(() => {
    const q = search.trim().toLowerCase();
    const withCounts = SPECIALTIES.map(sp => {
      const exactLabel = SLUG_TO_LABEL[sp.slug] || sp.label;
      return {
        ...sp,
        exactLabel,
        count: liveCounts[exactLabel] ?? sp.count,
        image: liveImages[exactLabel] || null,
      };
    });

    const filtered = q
      ? withCounts.filter(sp =>
          sp.label.toLowerCase().includes(q) ||
          sp.labelAr.includes(q) ||
          sp.desc.toLowerCase().includes(q)
        )
      : withCounts;

    return [...filtered].sort((a, b) =>
      sortBy === 'popular' ? b.count - a.count : a.label.localeCompare(b.label)
    );
  }, [search, sortBy, liveCounts, liveImages]);

  const topSlug = useMemo(() => {
    if (Object.keys(liveCounts).length === 0) return null;
    let best = null, bestCount = -1;
    SPECIALTIES.forEach(sp => {
      const c = liveCounts[SLUG_TO_LABEL[sp.slug] || sp.label] ?? sp.count;
      if (c > bestCount) { bestCount = c; best = sp.slug; }
    });
    return best;
  }, [liveCounts]);

  return (
    <div className="xsp-container">
      <header className="xsp-header">
        <h1 className="xsp-title">{t('xelpov.specialties_title', 'Surgical Specialties')}</h1>
        <p className="xsp-subtitle">
          {t('xelpov.specialties_subtitle', 'Browse our comprehensive catalogue of 3,150+ surgical instruments, organized by medical specialty — sourced from Xelpov Surgical.')}
        </p>

        <div className="xsp-toolbar">
          <div className="xsp-search">
            <IconSearch />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? 'ابحث عن تخصص...' : 'Search specialties...'}
            />
          </div>
          <div className="xsp-sort">
            <button
              type="button"
              className={sortBy === 'popular' ? 'active' : ''}
              onClick={() => setSortBy('popular')}
            >
              {isAr ? 'الأكثر شيوعاً' : 'Most Items'}
            </button>
            <button
              type="button"
              className={sortBy === 'az' ? 'active' : ''}
              onClick={() => setSortBy('az')}
            >
              A–Z
            </button>
          </div>
        </div>
      </header>

      {visibleSpecialties.length === 0 ? (
        <p className="xsp-empty">{isAr ? 'لا توجد تخصصات مطابقة.' : 'No specialties match your search.'}</p>
      ) : (
        <div className="xsp-grid">
          {visibleSpecialties.map(sp => (
            <Link
              key={sp.slug}
              to={`/catalogue/${sp.slug}`}
              className="xsp-card"
            >
              {sp.slug === topSlug && (
                <span className="xsp-popular-badge">{isAr ? 'الأكثر طلباً' : 'Most Popular'}</span>
              )}
              <div className="xsp-card-img">
                {sp.image ? (
                  <img src={sp.image} alt="" loading="lazy" />
                ) : (
                  <span className="xsp-icon-fallback"><SpecialtyIcon slug={sp.slug} size={30} /></span>
                )}
                <span className="xsp-count-badge">{sp.count.toLocaleString()} {isAr ? 'أداة' : 'items'}</span>
              </div>
              <h2 className="xsp-name">{isAr ? sp.labelAr : sp.label}</h2>
              <p className="xsp-desc">{isAr ? sp.descAr : sp.desc}</p>
              <div className="xsp-arrow">
                {t('products.browse')} <span aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default XelpovSpecialties;
