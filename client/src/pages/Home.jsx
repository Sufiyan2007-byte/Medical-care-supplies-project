import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import './Home.css';

/* ── Professional SVG icon components ────────────────────── */
const IconHospital = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconCertified = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6"/>
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);
const IconDelivery = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 5v3h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconStar = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IconShield = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IconTruck = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/>
    <path d="M16 8h4l3 5v3h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconHeadset = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0118 0v6"/>
    <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/>
  </svg>
);

const SLIDES = [
  {
    img: '/hero_slide_surgical.png',
    titleKey: 'home.slide1_title',
    subtitleKey: 'home.slide1_subtitle',
    linkTo: '/products/surgical-instruments',
    linkKey: 'home.slide1_cta',
  },
  {
    img: '/hero_slide_consumables.png',
    titleKey: 'home.slide2_title',
    subtitleKey: 'home.slide2_subtitle',
    linkTo: '/products/medical-consumables',
    linkKey: 'home.slide2_cta',
  },
  {
    img: '/hero_slide_sets.png',
    titleKey: 'home.slide3_title',
    subtitleKey: 'home.slide3_subtitle',
    linkTo: '/products/surgical-sets',
    linkKey: 'home.slide3_cta',
  },
];

const STATS = [
  { valueKey: 'home.stat1_val', labelKey: 'home.stat1_label', Icon: IconHospital },
  { valueKey: 'home.stat2_val', labelKey: 'home.stat2_label', Icon: IconCertified },
  { valueKey: 'home.stat3_val', labelKey: 'home.stat3_label', Icon: IconDelivery },
  { valueKey: 'home.stat4_val', labelKey: 'home.stat4_label', Icon: IconStar },
];

const TRUST = [
  { Icon: IconShield, titleKey: 'home.trust1_title', textKey: 'home.trust1_text' },
  { Icon: IconTruck,  titleKey: 'home.trust2_title', textKey: 'home.trust2_text' },
  { Icon: IconHeadset, titleKey: 'home.trust3_title', textKey: 'home.trust3_text' },
];

function Home() {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => setActive(a => (a + 1) % SLIDES.length), []);
  const prev = useCallback(() => setActive(a => (a - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [isPaused, next]);

  const slide = SLIDES[active];

  return (
    <div className="home-page">

      {/* ── Hero Slider ───────────────────────────────────────── */}
      <section
        className="hero-slider"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        aria-label="Product showcase"
      >
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className={`hero-slide ${i === active ? 'hero-slide--active' : ''}`}
            style={{ backgroundImage: `url(${s.img})` }}
            aria-hidden={i !== active}
          />
        ))}

        <div className="hero-overlay" />

        <div className="hero-content" key={active}>
          <span className="hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
            SFDA Approved
          </span>
          <h1 className="hero-title">{t(slide.titleKey)}</h1>
          <p className="hero-subtitle">{t(slide.subtitleKey)}</p>
          <div className="hero-cta-group">
            <Link to={slide.linkTo} className="hero-btn hero-btn--primary">
              {t(slide.linkKey)}
            </Link>
            <Link to="/contact" className="hero-btn hero-btn--ghost">
              {t('home.cta_contact')}
            </Link>
          </div>
        </div>

        <button className="hero-arrow hero-arrow--prev" onClick={prev} aria-label="Previous slide">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button className="hero-arrow hero-arrow--next" onClick={next} aria-label="Next slide">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>

        <div className="hero-dots" role="tablist">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === active ? 'hero-dot--active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Slide ${i + 1}`}
              role="tab"
              aria-selected={i === active}
            />
          ))}
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────────── */}
      <section className="stats-bar">
        {STATS.map((s, i) => (
          <div className="stat-item" key={i}>
            <div className="stat-icon-wrap">
              <s.Icon />
            </div>
            <div>
              <div className="stat-val">{t(s.valueKey)}</div>
              <div className="stat-label">{t(s.labelKey)}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Category Cards ──────────────────────────────────── */}
      <section className="home-categories">
        <div className="home-section-header">
          <h2 className="home-section-title">{t('products.range_title')}</h2>
          <p className="home-section-sub">{t('products.range_subtitle')}</p>
        </div>
        <div className="home-cat-grid">
          {[
            {
              img: '/hero_slide_surgical.png',
              iconImg: '/icon_surgical_instruments.png',
              titleKey: 'products.title_surgical_instruments',
              descKey: 'products.cat_instruments_desc',
              slug: 'surgical-instruments',
              accent: '#FF6600',
            },
            {
              img: '/hero_slide_consumables.png',
              iconImg: '/icon_medical_consumables.png',
              titleKey: 'products.title_medical_consumables',
              descKey: 'products.cat_consumables_desc',
              slug: 'medical-consumables',
              accent: '#E65C00',
            },
            {
              img: '/hero_slide_sets.png',
              iconImg: '/icon_surgical_sets.png',
              titleKey: 'products.title_surgical_sets',
              descKey: 'products.cat_sets_desc',
              slug: 'surgical-sets',
              accent: '#CC5200',
            },
          ].map(cat => (
            <Link key={cat.slug} to={`/products/${cat.slug}`} className="home-cat-card">
              <div
                className="home-cat-img"
                style={{ backgroundImage: `url(${cat.img})` }}
              >
                <div className="home-cat-img-overlay" />
                <img src={cat.iconImg} alt="" className="home-cat-icon-img" />
              </div>
              <div className="home-cat-body">
                <h3>{t(cat.titleKey)}</h3>
                <p>{t(cat.descKey)}</p>
                <span className="home-cat-link">
                  {t('products.browse')}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products Preview ─────────────────────── */}
      <section className="home-featured">
        <div className="home-section-header">
          <h2 className="home-section-title">{t('home.featured_title')}</h2>
        </div>
        <div className="home-featured-grid">
          {[
            { img: '/product_img_forceps.png',   nameKey: 'home.prod1', priceKey: 'home.prod1_price', catSlug: 'surgical-instruments' },
            { img: '/product_img_scissors.png',  nameKey: 'home.prod2', priceKey: 'home.prod2_price', catSlug: 'surgical-instruments' },
            { img: '/product_img_syringe.png',   nameKey: 'home.prod3', priceKey: 'home.prod3_price', catSlug: 'medical-consumables' },
            { img: '/icon_medical_consumables.png', nameKey: 'home.prod4', priceKey: 'home.prod4_price', catSlug: 'medical-consumables' },
          ].map((p, i) => (
            <Link key={i} to={`/products/${p.catSlug}`} className="home-prod-card">
              <div className="home-prod-img-wrap">
                <img src={p.img} alt={t(p.nameKey)} className="home-prod-img" />
                <span className="home-prod-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  SFDA
                </span>
              </div>
              <div className="home-prod-info">
                <h4>{t(p.nameKey)}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <div className="home-prod-price">{t(p.priceKey)}</div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart({
                        id: i + 1000, // mock ID for featured
                        name: t(p.nameKey),
                        price: parseFloat(t(p.priceKey).replace(/[^\d.]/g, '') || 99.00),
                        image: p.img
                      });
                    }}
                    style={{
                      background: '#FF6600',
                      color: 'white',
                      border: 'none',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {t('cart.add', 'Add')}
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Trust Badges ────────────────────────────────────── */}
      <section className="trust-section">
        <div className="trust-inner">
          {TRUST.map((item, i) => (
            <div key={i} className="trust-card">
              <div className="trust-icon-wrap">
                <item.Icon />
              </div>
              <h4>{t(item.titleKey)}</h4>
              <p>{t(item.textKey)}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Home;
