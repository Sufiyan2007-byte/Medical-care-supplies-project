import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProductCardSkeleton } from '../components/Skeleton';
import { useCart } from '../context/CartContext';
import './ProductListing.css';
import { priceOf, priceOnRequest } from '../utils/pricing';
import { CONSUMABLES_FILTER_KEYS, getConsumableGroup } from '../utils/consumablesFilters';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Map a URL slug → translation key suffix + hero image for display.
 */
const SLUG_META = {
  'surgical-instruments': { keySuffix: 'surgical_instruments', heroImg: '/hero_slide_surgical.png', accentClass: 'instruments' },
  'medical-consumables':  { keySuffix: 'medical_consumables',  heroImg: '/hero_slide_consumables.png', accentClass: 'consumables'  },
  'surgical-sets':        { keySuffix: 'surgical_sets',         heroImg: '/hero_slide_sets.png',      accentClass: 'surgical-sets' },
};

/**
 * Pick a product image based on product name keywords.
 */
function getProductImage(name = '') {
  const n = name.toLowerCase();
  if (n.includes('set') || n.includes('tray') || n.includes('box')) return '/icon_surgical_sets.png';
  if (n.includes('scissors'))                                  return '/product_img_scissors.png';
  if (n.includes('forceps') || n.includes('clamp'))            return '/product_img_forceps.png';
  if (n.includes('needle') || n.includes('holder'))            return '/product_img_needle_holder.png';
  if (n.includes('retractor'))                                 return '/product_img_retractor.png';
  if (n.includes('scalpel'))                                   return '/product_img_scalpel.png';
  if (n.includes('syringe'))                                   return '/product_img_syringe.png';
  if (n.includes('glove'))                                     return '/product_img_gloves.png';
  if (n.includes('mask'))                                      return '/product_img_mask.png';
  if (n.includes('gauze') || n.includes('swab') || n.includes('dressing') || n.includes('mepilex') || n.includes('mepore') || n.includes('tape') || n.includes('sponge')) return '/product_img_gauze.png';
  if (n.includes('catheter') || n.includes('drainage') || n.includes('urine') || n.includes('tube') || n.includes('feeding')) return '/product_img_catheter.png';
  if (n.includes('disposable') || n.includes('bulb') || n.includes('specula') || n.includes('alcohol') || n.includes('filter') || n.includes('nebulizer')) return '/icon_medical_consumables.png';
  return '/icon_surgical_instruments.png';
}

/**
 * Categories from xelpov_products.json that represent reusable surgical instruments/tools.
 * These must NEVER be classified as medical consumables, even if words like "dressing"
 * or "gauze" appear in their name or subcategory (e.g., Dressing Forceps, Gauze Packers).
 */
const REUSABLE_INSTRUMENT_MAIN_CATEGORIES = new Set([
  'Forceps',
  'Scissors',
  'Retractors',
  'Hooks & Spatulas',
  'Haemostats & Clamps',
  'Needle Holders & Passers',
  'Dissectors',
  'Elevators & Levers',
  'Dissectors, Elevators & Levers',
  'Knives',
  'Knives, Needles & Picks',
  'Needles & Picks',
  'Osteotomes',
  'Chisels & Gouges',
  'Rongeurs',
  'Punches & Cutters',
  'Pliers & Wire Cutters',
  'Files',
  'Saws & Rasps',
  'Files, Saws & Rasps',
  'Cannulas & Trocars',
  'Suction Tubes',
  'Curettes & Adenotomes',
  'Impactors',
  'Manipulators',
  'Probes & Dilators',
  'Speculums',
  'Electrosurgical Instruments',
  'Lightening & Visualization',
  'Bougies & Sounds',
  'Dental Scalers',
  'Excavators',
  'Pluggers & Burnishers',
  'Scalers',
  'Hospital Receptacles',
  'Indicators & Measurement',
  'Syringes',
]);

/**
 * Reusable surgical instrument keyword terms to block in product names and subcategories.
 * Prevents tools under general categories (like "Ancillary Products and Accessories")
 * from being misidentified as consumables due to words like "dressing", "gauze", or "sponge".
 */
const REUSABLE_INSTRUMENT_TERMS = [
  'forceps',
  'scissors',
  'clamp',
  'retractor',
  'needle holder',
  'scalpel',
  'knife',
  'curette',
  'rongeur',
  'packer',
  'elevator',
  'dissector',
  'chisel',
  'osteotome',
  'punch',
  'plier',
  'cutter',
  'speculum',
  'dilator',
  'probe',
  'spatula',
  'hook',
  'trocar',
  'cannula',
  'applicator',
  'extractor',
  'snare',
  'chopper',
  'rotator',
  'splitter',
  'carrier',
  'jar',
  'tray',
  'box',
  'handle',
];

function isReusableInstrumentProduct(inst) {
  const mainCategories = inst.mainCategory || [];
  if (mainCategories.some((cat) => REUSABLE_INSTRUMENT_MAIN_CATEGORIES.has(cat))) {
    return true;
  }
  const subList = (inst.subCategory || []).join(' ').toLowerCase();
  const name = (inst.name || '').toLowerCase();
  return REUSABLE_INSTRUMENT_TERMS.some(
    (term) => subList.includes(term) || name.includes(term),
  );
}

const PAGE_SIZE = 9;
const CONSUMABLES_FETCH_LIMIT = 100;

function ProductListing() {
  const { category: slug } = useParams();
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();

  const meta = SLUG_META[slug] || { keySuffix: 'products', heroImg: '/icon_surgical_instruments.png', accentClass: 'instruments' };
  const localizedLabel = t(`products.title_${meta.keySuffix}`);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [consumablesFilter, setConsumablesFilter] = useState('all');

  const isConsumablesSlug = slug === 'medical-consumables';

  /* ── Debounce search input ───────────────────────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  /* ── Fetch products page ─────────────────────────────────────────────── */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const isSets = slug === 'surgical-sets';
      const endpoint = isSets ? '/api/sets' : '/api/products';
      const params = new URLSearchParams({
        page: isConsumablesSlug ? '1' : String(page),
        limit: isConsumablesSlug ? String(CONSUMABLES_FETCH_LIMIT) : String(PAGE_SIZE),
        ...(!isSets && slug && { category: slug }),
        ...(!isConsumablesSlug && debouncedSearch && { search: debouncedSearch }),
      });
      const res = await fetch(`${BASE_URL}${endpoint}?${params}`);
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      const rows = data.products || data.sets || [];
      setProducts(rows);
      if (isConsumablesSlug) {
        setTotal(rows.length);
        setTotalPages(Math.ceil(rows.length / PAGE_SIZE) || 1);
      } else {
        setTotal(data.pagination?.total ?? 0);
        setTotalPages(data.pagination?.totalPages ?? 1);
      }
    } catch (err) {
      console.warn('[ProductListing] API unavailable, using catalog fallback:', err.message);
      try {
        const fallbackRes = await fetch('/xelpov_products.json');
        const fallbackData = await fallbackRes.json();
        const items = Array.isArray(fallbackData) ? fallbackData : (fallbackData.products || []);
        const isSets = slug === 'surgical-sets';
        const filtered = items.filter(inst => {
          const specList = (inst.specialty || []).join(' ').toLowerCase();
          const catList = [...(inst.mainCategory || []), ...(inst.subCategory || [])].join(' ').toLowerCase();
          const name = (inst.name || '').toLowerCase();
          if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            if (!name.includes(q) && !catList.includes(q) && !specList.includes(q)) return false;
          }
          if (isSets) return catList.includes('set') || name.includes('set');

          const isInstrument = isReusableInstrumentProduct(inst);

          if (slug === 'medical-consumables') {
            // Reusable surgical tools must never be treated as consumables
            if (isInstrument) return false;

            const nameAndCats = `${name} ${catList}`;
            return (
              nameAndCats.includes('single use') ||
              nameAndCats.includes('single-use') ||
              (nameAndCats.includes('disposable') && !nameAndCats.includes('reusable')) ||
              (nameAndCats.includes('consumable') && !nameAndCats.includes('reusable'))
            );
          }

          if (slug === 'surgical-instruments') {
            if (isInstrument) return true;
            const nameAndCats = `${name} ${catList}`;
            const isConsumable =
              nameAndCats.includes('single use') ||
              nameAndCats.includes('single-use') ||
              nameAndCats.includes('disposable') ||
              nameAndCats.includes('consumable');
            return !isConsumable;
          }

          return true;
        }).map((inst, idx) => ({
          id: inst.slug || idx + 100,
          name: inst.name,
          sku: inst.specs?.catalogNumber || inst.slug,
          description: inst.description || '',
          price: null,
          image: inst.image,
          category: { name: inst.specialty?.[0] || inst.mainCategory?.[0] || 'Surgical Instruments' },
        }));
        if (isConsumablesSlug) {
          setProducts(filtered);
          setTotal(filtered.length);
          setTotalPages(Math.ceil(filtered.length / PAGE_SIZE) || 1);
        } else {
          setProducts(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
          setTotal(filtered.length);
          setTotalPages(Math.ceil(filtered.length / PAGE_SIZE) || 1);
        }
      } catch (fallbackErr) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [isConsumablesSlug ? 1 : page, slug, debouncedSearch, isConsumablesSlug]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page when search or consumables filter changes
  useEffect(() => { setPage(1); }, [debouncedSearch, consumablesFilter]);

  const filteredConsumables = useMemo(() => {
    if (!isConsumablesSlug) return products;
    let list = products;
    if (consumablesFilter !== 'all') {
      list = list.filter(
        (p) => getConsumableGroup(p.sku, p.name) === consumablesFilter,
      );
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      list = list.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q)
          || (p.sku || '').toLowerCase().includes(q)
          || (p.description || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [products, isConsumablesSlug, consumablesFilter, debouncedSearch]);

  const displayProducts = isConsumablesSlug
    ? filteredConsumables.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : products;

  const displayTotal = isConsumablesSlug ? filteredConsumables.length : total;
  const displayTotalPages = isConsumablesSlug
    ? Math.ceil(filteredConsumables.length / PAGE_SIZE) || 1
    : totalPages;

  /* ── Render ───────────────────────────────────────────────────────────── */

  const isSets = slug === 'surgical-sets';
  const isConsumables = slug === 'medical-consumables';
  const heroDescription = isConsumables
    ? t('products.cat_consumables_desc')
    : t('products.desc_default');

  return (
    <div className={`listing-container${isConsumables ? ' listing-container--consumables' : ''}`}>
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/products">{t('products.title_products')}</Link>
        <span>›</span>
        <span>{localizedLabel}</span>
      </nav>

      {/* Category hero */}
      {meta.heroImg ? (
        <header
          className={`listing-hero listing-hero--${meta.accentClass}`}
          style={{ backgroundImage: `url(${meta.heroImg})` }}
        >
          <div className="listing-hero-overlay" aria-hidden="true" />
          <div className="listing-hero-content">
            <h1>{localizedLabel}</h1>
            <p>{heroDescription}</p>
          </div>
        </header>
      ) : (
        <header className="listing-header">
          <h1>{localizedLabel}</h1>
          <p>{heroDescription}</p>
        </header>
      )}

      {/* Search */}
      <div className="listing-controls">
        {isConsumables && (
          <div className="consumables-filters" role="tablist" aria-label={t('products.title_medical_consumables')}>
            {CONSUMABLES_FILTER_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={consumablesFilter === key}
                className={`consumables-filter-btn${consumablesFilter === key ? ' active' : ''}`}
                onClick={() => setConsumablesFilter(key)}
              >
                {key === 'all' ? (
                  t('products.consumables_filter_all')
                ) : (
                  <>
                    <span className="consumables-filter-num" aria-hidden="true">{key}</span>
                    <span className="consumables-filter-label">{t(`products.consumables_filter_${key}`)}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        )}
        <div className="search-box">
          <span className="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            id="product-search"
            type="text"
            placeholder={t('products.search_placeholder', { category: localizedLabel })}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="products-grid">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="listing-status">
          <h2>{t('products.unable_to_load')}</h2>
          <p>{error}</p>
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="listing-status">
          <h2>{t('products.no_products')}</h2>
          <p>
            {debouncedSearch
              ? t('products.no_results_search', { query: debouncedSearch })
              : t('products.no_products_category')}
          </p>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {displayProducts.map((product) => {
              const isOutOfStock = product.stock === 0;
              const isTrackedInStock = product.stock != null && product.stock > 0;
              return (
              <Link
                key={product.id}
                to={`/products/${slug}/${product.id}`}
                className={`product-card ${isSets ? 'set-card' : ''}${isOutOfStock ? ' product-card--oos' : ''}`}
              >
                <div className="product-card-img-wrap">
                  {product.image || product.imageUrl ? (
                    <img
                      src={product.image || product.imageUrl}
                      alt={product.name}
                      className="product-card-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getProductImage(product.name);
                      }}
                    />
                  ) : (
                    <div className="product-card-placeholder">
                      <img
                        src={getProductImage(product.name)}
                        alt={product.name}
                        className="product-card-img placeholder-img"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <span className="product-card-sfda-badge">SFDA ✓</span>
                  {isOutOfStock && (
                    <span className="product-card-stock-badge product-card-stock-badge--out">
                      {i18n.language.startsWith('ar') ? 'نفدت الكمية' : 'Out of Stock'}
                    </span>
                  )}
                  {!isOutOfStock && isTrackedInStock && (
                    <span className="product-card-stock-badge product-card-stock-badge--in">
                      {i18n.language.startsWith('ar') ? 'متوفر' : 'In Stock'}
                    </span>
                  )}
                </div>

                {product.sku && (
                  <span className="product-card-sku">{product.sku}</span>
                )}

                <h2 className="product-card-name">{product.name}</h2>

                {isSets && product.surgical_set && (
                  <div className="set-meta">
                    <span className="set-piece-count">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginEnd: '0.25rem' }}>
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      </svg>
                      {product.surgical_set.piece_count} {t('products.pieces')}
                    </span>
                    {product.surgical_set.material && (
                      <span className="set-material">
                        • {product.surgical_set.material}
                      </span>
                    )}
                  </div>
                )}

                {product.description && (
                  <p className="product-card-desc">{product.description}</p>
                )}

                <div className="product-card-footer">
                  <span className="product-price">
                    {priceOf(product.price)
                      ? `${Number(product.price).toFixed(2)} ${i18n.language.startsWith('ar') ? 'ر.س' : 'SAR'}`
                      : priceOnRequest(i18n.language.startsWith('ar'))}
                  </span>
                  <div className="product-card-actions">
                    <span className="view-details-btn">{t('products.view_details', 'View')}</span>
                    <button
                      className="add-to-cart-btn"
                      disabled={isOutOfStock}
                      onClick={(e) => {
                        e.preventDefault();
                        if (isOutOfStock) return;
                        addToCart({ ...product, price: priceOf(product.price) });
                      }}
                    >
                      {isOutOfStock
                        ? (i18n.language.startsWith('ar') ? 'نفدت الكمية' : 'Out of Stock')
                        : t('cart.add', 'Add to Cart')}
                    </button>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {displayTotalPages > 1 && (
            <nav className="pagination" aria-label={t('products.pagination_label', 'Product pages')}>
              <button
                type="button"
                className="page-btn page-btn--nav"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t('products.prev')}
              </button>
              <div className="pagination-pages" role="group" aria-label={t('products.pagination_pages', 'Page numbers')}>
                {Array.from({ length: displayTotalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`page-num-btn${page === n ? ' active' : ''}`}
                    onClick={() => setPage(n)}
                    aria-current={page === n ? 'page' : undefined}
                    aria-label={t('products.page_go', { page: n, defaultValue: `Page ${n}` })}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="page-btn page-btn--nav"
                onClick={() => setPage((p) => Math.min(displayTotalPages, p + 1))}
                disabled={page === displayTotalPages}
              >
                {t('products.next')}
              </button>
              <p className="page-info">
                {t('products.page_info', { page, totalPages: displayTotalPages, total: displayTotal })}
              </p>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

export default ProductListing;

