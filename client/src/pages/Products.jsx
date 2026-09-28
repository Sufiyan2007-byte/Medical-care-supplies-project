import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Products.css';

/**
 * Static fallback data shown when the backend is unavailable.
 * Maps category names (case-insensitive includes check) to display config.
 */
const CATEGORY_CONFIG = [
  {
    key: 'instruments',
    slug: 'surgical-instruments',
    to: '/catalogue',
    nameKey: 'products.title_surgical_instruments',
    descKey: 'products.cat_instruments_desc',
    iconImg: '/icon_surgical_instruments.png',
    heroImg: '/hero_slide_surgical.png',
    className: 'instruments',
    count: '3,150+',
    staticCount: true,
  },
  {
    key: 'consumables',
    slug: 'medical-consumables',
    to: '/products/medical-consumables',
    nameKey: 'products.title_medical_consumables',
    descKey: 'products.cat_consumables_desc',
    iconImg: '/icon_medical_consumables.png',
    heroImg: '/hero_slide_consumables.png',
    className: 'consumables',
  },
  {
    key: 'sets',
    slug: 'surgical-sets',
    to: '/products/surgical-sets',
    nameKey: 'products.title_surgical_sets',
    descKey: 'products.cat_sets_desc',
    iconImg: '/icon_surgical_sets.png',
    heroImg: '/hero_slide_sets.png',
    className: 'surgical-sets',
  },
  {
    key: 'ent',
    slug: 'ent',
    to: '/catalogue/ent',
    nameKey: 'products.title_ent_diagnostics',
    descKey: 'products.cat_ent_desc',
    iconImg: '/icon_ent_diagnostics.jpg',
    heroImg: '/hero_slide_ent.jpg',
    className: 'ent-diagnostics',
    count: '824+',
    staticCount: true,
  },
  {
    key: 'general-surgery',
    slug: 'general-surgery',
    to: '/catalogue/general-surgery',
    nameKey: 'products.title_general_surgery',
    descKey: 'products.cat_general_surgery_desc',
    iconImg: '/icon_surgical_instruments.png',
    heroImg: '/hero_slide_surgical.png',
    className: 'instruments',
    count: '723+',
    staticCount: true,
  },
];

/**
 * Match a fetched API category to one of our static config entries
 * so we can merge the icon, slug and className with live data.
 */
function matchConfig(apiCategory) {
  const name = (apiCategory.name || '').toLowerCase();
  return (
    CATEGORY_CONFIG.find((c) => name.includes(c.key)) || {
      slug: name.replace(/\s+/g, '-'),
      iconImg: '/icon_surgical_instruments.png',
      heroImg: '/hero_slide_surgical.png',
      className: 'instruments', // fallback accent
    }
  );
}

function Products() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const res = await fetch(`${baseURL}/api/categories`);
        if (!res.ok) throw new Error('Failed to load categories');
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.warn('[Products] API unavailable, using defaults:', err.message);
        setError('live');          // signal we're using defaults
        setCategories([]);         // will trigger fallback render
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  /* ── Determine what to render ─────────────────────────────────────────── */

  // Use live categories when available, otherwise fall back to static config
  // ENT category is always added from static config (not from API)
  const displayCategories =
    categories.length > 0
      ? [
          ...categories.map((cat) => {
            const cfg = matchConfig(cat);
            return {
              ...cfg,
              name: t(cfg.nameKey) || cat.name,
              description: t(cfg.descKey) || cat.description || cfg.description,
              count: cat._count?.products ?? 0,
            };
          }),
          // Always add ENT catalog at the end
          {
            ...CATEGORY_CONFIG[3],
            to: '/catalogue/ent',
            name: 'ENT, Laryngoscopes & Diagnostics',
            description: 'Complete surgical ENT & diagnostic instruments catalog: Laryngoscopes, Otoscopes, Ophthalmoscopes, Dermatoscopes, Rhinology, and 20+ specialized categories.',
            count: '824+',
          },
          {
            ...CATEGORY_CONFIG[4],
            to: '/catalogue/general-surgery',
            name: t(CATEGORY_CONFIG[4].nameKey),
            description: t(CATEGORY_CONFIG[4].descKey),
            count: '723+',
          },
        ]
      : CATEGORY_CONFIG.map((cfg) => ({
          ...cfg,
          name: cfg.key === 'ent'
            ? t(cfg.nameKey, 'ENT, Laryngoscopes & Diagnostics')
            : t(cfg.nameKey),
          description: cfg.key === 'ent'
            ? t(cfg.descKey, 'Complete surgical ENT & diagnostic instruments catalog: Laryngoscopes, Otoscopes, Ophthalmoscopes, Dermatoscopes, Rhinology, and 20+ specialized categories.')
            : t(cfg.descKey),
          count: cfg.staticCount ? cfg.count : null,
        }));

  /* ── Render ───────────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="products-status">
        <p>{t('products.loading_categories')}</p>
      </div>
    );
  }

  return (
    <div className="products-container">
      <header className="products-header">
        <h1>{t('products.range_title')}</h1>
        <p>{t('products.range_subtitle')}</p>
      </header>

      <div className="category-grid">
        {displayCategories.map((cat) => (
          <Link
            key={cat.slug}
            to={cat.to || `/products/${cat.slug}`}
            className={`category-card ${cat.className}`}
          >
            {/* Hero image with gradient overlay */}
            <div
              className="cat-hero-img"
              style={{ backgroundImage: `url(${cat.heroImg || cat.iconImg})` }}
            >
              <div className="cat-hero-overlay" />
              <img
                src={cat.iconImg}
                alt=""
                className="cat-hero-icon"
              />
            </div>

            <div className="card-body">
              <h2>{cat.name}</h2>
              <p>{cat.description}</p>
            </div>

            <div className="card-footer">
              <span className="product-count">
                {cat.count !== null ? `${cat.count} ${cat.staticCount ? 'Models' : t('products.title_products')}` : t('products.view_catalogue')}
              </span>
              <span className="browse-btn">
                {t('products.browse')} →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Products;

