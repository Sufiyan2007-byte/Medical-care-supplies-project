import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { SpecialtyIcon } from '../components/SpecialtyIcons';
import './Home.css';
import { priceOnRequest } from '../utils/pricing';
import { loadXelpovProducts } from '../utils/xelpovData';

const IconCatalogue = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IconCertified = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);
const IconHeadset = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0118 0v6"/>
    <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>
  </svg>
);

const CATEGORIES = [
  {
    img: '/hero_slide_surgical.png',
    iconImg: '/icon_surgical_instruments.png',
    titleKey: 'products.title_surgical_instruments',
    descKey: 'products.cat_instruments_desc',
    slug: 'surgical-instruments',
  },
  {
    img: '/hero_slide_consumables.png',
    iconImg: '/icon_medical_consumables.png',
    titleKey: 'products.title_medical_consumables',
    descKey: 'products.cat_consumables_desc',
    slug: 'medical-consumables',
  },
  {
    img: '/hero_slide_sets.png',
    iconImg: '/icon_surgical_sets.png',
    titleKey: 'products.title_surgical_sets',
    descKey: 'products.cat_sets_desc',
    slug: 'surgical-sets',
  },
];

const TRUST_STRIP = [
  { Icon: IconShield, titleKey: 'home.trust1_title', textKey: 'home.trust1_text' },
  { Icon: IconCertified, titleKey: 'home.trust2_title', textKey: 'home.trust2_text' },
  { Icon: IconHeadset, titleKey: 'home.trust3_title', textKey: 'home.trust3_text' },
];

const HOME_SPECIALTIES = [
  { slug: 'microsurgery', label: 'Microsurgery', labelAr: 'الجراحة الدقيقة', count: '235+', color: '#2196F3' },
  { slug: 'plastic-surgery', label: 'Plastic Surgery', labelAr: 'جراحة التجميل', count: '240+', color: '#E91E63' },
  { slug: 'urology', label: 'Urology', labelAr: 'المسالك البولية', count: '430+', color: '#9C27B0' },
  { slug: 'ophthalmic', label: 'Ophthalmic', labelAr: 'طب العيون', count: '456+', color: '#00BCD4' },
  { slug: 'general-surgery', label: 'General Surgery', labelAr: 'الجراحة العامة', count: '723+', color: '#4CAF50' },
  { slug: 'ent', label: 'ENT', labelAr: 'الأنف والأذن والحنجرة', count: '824+', color: '#3F51B5' },
  { slug: 'cardiovascular', label: 'Cardiovascular', labelAr: 'أمراض القلب', count: '641+', color: '#F44336' },
  { slug: 'orthopedic', label: 'Orthopedic', labelAr: 'العظام والمفاصل', count: '902+', color: '#795548' },
];

// Real Xelpov-style instrument categories — the tile image and item count are
// pulled live from the actual product catalogue (xelpov_products.json), so this
// section always reflects real inventory rather than placeholder photos.
const INSTRUMENT_TYPES = [
  { cats: ['Forceps'], label: 'Forceps' },
  { cats: ['Scissors'], label: 'Scissors' },
  { cats: ['Retractors', 'Hooks & Spatulas'], label: 'Retractors, Hooks & Spatulas' },
  { cats: ['Needle Holders & Passers'], label: 'Needle Holders & Passers' },
  { cats: ['Curettes & Adenotomes'], label: 'Curettes & Adenotomes' },
  { cats: ['Dissectors', 'Elevators & Levers'], label: 'Dissectors & Elevators' },
  { cats: ['Probes & Dilators'], label: 'Probes & Dilators' },
  { cats: ['Sterilization & Containers'], label: 'Sterilization & Containers' },
];

const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
);

function Home() {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const isAr = i18n.language.startsWith('ar');

  const [catalogProducts, setCatalogProducts] = useState([]);
  useEffect(() => {
    loadXelpovProducts()
      .then(setCatalogProducts)
      .catch(() => {});
  }, []);

  // Build the "Shop by Instrument Type" tiles from real catalogue data:
  // for each curated category, find a matching product with a photo and
  // count how many products fall under it.
  const instrumentTiles = useMemo(() => {
    if (catalogProducts.length === 0) return [];
    return INSTRUMENT_TYPES.map(({ cats, label }) => {
      const matches = catalogProducts.filter(p => p.mainCategory?.some(c => cats.includes(c)));
      const withImage = matches.find(p => p.image);
      return {
        label,
        cats,
        count: matches.length,
        image: withImage?.image || null,
      };
    }).filter(tile => tile.count > 0);
  }, [catalogProducts]);

  return (
    <div className="home-page">

      {/* ── Navy gradient hero ──────────────────────────────────── */}
      <section className="home-hero">
        <div className="home-hero__glow" aria-hidden="true" />
        <div className="home-hero__inner">
          <span className="home-hero__badge">
            <IconShield />
            {t('home.stat2_val')} · {t('home.stat2_label')}
          </span>
          <h1 className="home-hero__title">{t('home.hero_title')}</h1>
          <p className="home-hero__subtitle">{t('home.hero_subtitle')}</p>
          <div className="home-hero__ctas">
            <Link to="/catalogue" className="home-hero__btn home-hero__btn--primary">
              <IconCatalogue /> {t('nav.catalogue', 'Surgical Catalogue')} (3,150+)
            </Link>
            <Link to="/products" className="home-hero__btn home-hero__btn--ghost">
              {t('home.cta_products')}
            </Link>
            <Link to="/contact" className="home-hero__btn home-hero__btn--ghost">
              {t('home.cta_contact')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust numbers (remove this block to go back to the old look) ── */}
      <section className="home-stats" aria-label={t('home.stat2_label')}>
        {[1, 2, 3, 4].map((n) => (
          <div className="home-stats__item" key={n}>
            <strong>{t(`home.stat${n}_val`)}</strong>
            <span>{t(`home.stat${n}_label`)}</span>
          </div>
        ))}
      </section>

      {/* ── 3 category cards ──────────────────────────────────── */}
      <section className="home-categories">
        <div className="home-section-header">
          <h2 className="home-section-title">{t('products.range_title')}</h2>
          <p className="home-section-sub">{t('products.range_subtitle')}</p>
        </div>
        <div className="home-cat-grid home-cat-grid--three">
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} to={`/products/${cat.slug}`} className="home-cat-card">
              <div className="home-cat-img" style={{ backgroundImage: `url(${cat.img})` }}>
                <div className="home-cat-img-overlay" />
              </div>
              <div className="home-cat-body">
                <div className="cat-icon-circle">
                  <img src={cat.iconImg} alt="" className="home-cat-icon-img" />
                </div>
                <h3>{t(cat.titleKey)}</h3>
                <p>{t(cat.descKey)}</p>
                <span className="home-cat-link">
                  {t('products.browse')}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Shop by Instrument Type (data-driven from the real catalogue) ── */}
      {instrumentTiles.length > 0 && (
        <section className="home-instruments-section">
          <div className="home-section-header">
            <h2 className="home-section-title">{isAr ? 'تسوق حسب نوع الأداة' : 'Shop by Instrument Type'}</h2>
            <p className="home-section-sub">
              {isAr
                ? 'انتقل مباشرة إلى فئة الأدوات الجراحية التي تحتاجها.'
                : 'Jump straight into the surgical instrument category you need — pulled live from our full catalogue.'}
            </p>
          </div>
          <div className="home-instruments-grid">
            {instrumentTiles.map(tile => (
              <Link
                key={tile.label}
                to={`/catalogue/all?cat=${encodeURIComponent(tile.cats.join(','))}`}
                className="home-instrument-tile"
              >
                <div className="home-instrument-img">
                  {tile.image ? (
                    <img src={tile.image} alt={tile.label} loading="lazy" />
                  ) : (
                    <IconCatalogue />
                  )}
                </div>
                <div className="home-instrument-body">
                  <span className="home-instrument-name">{tile.label}</span>
                  <span className="home-instrument-count">{tile.count}+ {isAr ? 'أداة' : 'items'}</span>
                </div>
                <span className="home-instrument-arrow" aria-hidden="true"><IconArrowRight /></span>
              </Link>
            ))}
          </div>
          <div className="home-specialties-footer">
            <Link to="/catalogue/all" className="home-specialties-all-btn">
              {isAr ? 'عرض كل الأدوات الجراحية' : 'View All Surgical Instruments'} →
            </Link>
          </div>
        </section>
      )}

      {/* ── Surgical Specialties Showcase ───────────────────────── */}
      <section className="home-specialties-section">
        <div className="home-section-header">
          <div className="home-specialties-badge">
            <IconCatalogue /> {t('xelpov.specialties_title', 'Surgical Specialties')}
          </div>
          <h2 className="home-section-title">{t('xelpov.specialties_title', 'Surgical Specialties Catalogue')}</h2>
          <p className="home-section-sub">
            {t('xelpov.specialties_subtitle', 'Browse 3,150+ high-precision instruments organized across 21 medical specialties — sourced from Xelpov Surgical.')}
          </p>
        </div>
        <div className="home-specialties-grid">
          {HOME_SPECIALTIES.map(sp => (
            <Link
              key={sp.slug}
              to={`/catalogue/${sp.slug}`}
              className="home-specialty-card"
              style={{ '--sp-accent': 'var(--c-accent)' }}
            >
              <div className="home-sp-icon"><SpecialtyIcon slug={sp.slug} size={24} /></div>
              <div className="home-sp-content">
                <span className="home-sp-name">{i18n.language.startsWith('ar') ? sp.labelAr : sp.label}</span>
                <span className="home-sp-count">{sp.count} {i18n.language.startsWith('ar') ? 'أداة' : 'tools'}</span>
              </div>
              <span className="home-sp-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
        <div className="home-specialties-footer">
          <Link to="/catalogue" className="home-specialties-all-btn">
            {t('xelpov.view_all', 'View All 21 Specialties & 3,150+ Instruments')} →
          </Link>
        </div>
      </section>

      {/* ── Trust strip ─────────────────────────────────────────── */}
      <section className="home-trust-strip" aria-label={t('home.trust1_title')}>
        {TRUST_STRIP.map((item, i) => (
          <div className="home-trust-strip__item" key={i}>
            <div className="home-trust-strip__icon">
              <item.Icon />
            </div>
            <div>
              <strong>{t(item.titleKey)}</strong>
              <span>{t(item.textKey)}</span>
            </div>
          </div>
        ))}
      </section>

      {/* ── Featured Products Preview ───────────────────────────── */}
      <section className="home-featured">
        <div className="home-section-header">
          <h2 className="home-section-title">{t('home.featured_title')}</h2>
        </div>
        <div className="home-featured-grid">
          {[
            { img: '/product_img_forceps.png',  nameKey: 'home.prod1', priceKey: 'home.prod1_price', catSlug: 'surgical-instruments' },
            { img: '/product_img_scissors.png', nameKey: 'home.prod2', priceKey: 'home.prod2_price', catSlug: 'surgical-instruments' },
            { img: '/product_img_syringe.png',  nameKey: 'home.prod3', priceKey: 'home.prod3_price', catSlug: 'medical-consumables' },
            { img: '/product_img_gloves.png',   nameKey: 'home.prod4', priceKey: 'home.prod4_price', catSlug: 'medical-consumables' },
          ].map((p, i) => (
            <Link key={i} to={`/products/${p.catSlug}`} className="home-prod-card">
              <div className="home-prod-img-wrap">
                <img src={p.img} alt={t(p.nameKey)} className="home-prod-img" />
                <span className="home-prod-badge">SFDA</span>
              </div>
              <div className="home-prod-info">
                <h4>{t(p.nameKey)}</h4>
                <div className="home-prod-row">
                  <div className="home-prod-price">{priceOnRequest(i18n.language.startsWith('ar'))}</div>
                  <button
                    type="button"
                    className="home-prod-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart({
                        id: i + 1000,
                        name: t(p.nameKey),
                        price: null,
                        image: p.img,
                      });
                    }}
                    title={t('cart.add', 'Add to Cart')}
                  >
                    {t('cart.add', 'Add')}
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Home;
