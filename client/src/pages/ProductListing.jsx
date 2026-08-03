import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProductCardSkeleton } from '../components/Skeleton';
import { useCart } from '../context/CartContext';
import './ProductListing.css';

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
  if (n.includes('scissors'))                                  return '/product_img_scissors.png';
  if (n.includes('forceps') || n.includes('clamp'))            return '/product_img_forceps.png';
  if (n.includes('syringe'))                                   return '/product_img_syringe.png';
  if (n.includes('glove'))                                     return '/icon_medical_consumables.png';
  if (n.includes('set') || n.includes('tray'))                 return '/icon_surgical_sets.png';
  if (n.includes('needle') || n.includes('holder') ||
      n.includes('retractor') || n.includes('scalpel') ||
      n.includes('blade') || n.includes('instrument'))         return '/icon_surgical_instruments.png';
  return '/icon_surgical_instruments.png';
}

const PAGE_SIZE = 9;

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
        page,
        limit: PAGE_SIZE,
        ...(!isSets && slug && { category: slug }),
        ...(debouncedSearch && { search: debouncedSearch }),
      });
      const res = await fetch(`${BASE_URL}${endpoint}?${params}`);
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data.products || data.sets || []);
      setTotal(data.pagination?.total ?? 0);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, slug, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page when search changes
  useEffect(() => { setPage(1); }, [debouncedSearch]);

  /* ── Render ───────────────────────────────────────────────────────────── */

  const isSets = slug === 'surgical-sets';

  return (
    <div className="listing-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/products">{t('products.title_products')}</Link>
        <span>›</span>
        <span>{localizedLabel}</span>
      </nav>

      {/* Header */}
      <header className="listing-header">
        <h1>
          <span className="listing-header-accent">{meta.icon} </span>
          {localizedLabel}
        </h1>
        <p>
          {t('products.desc_default')}
        </p>
      </header>

      {/* Search */}
      <div className="listing-controls">
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
      ) : products.length === 0 ? (
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
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${slug}/${product.id}`}
                className={`product-card ${isSets ? 'set-card' : ''}`}
              >
                <div className="product-card-img-wrap">
                  <img
                    src={getProductImage(product.name)}
                    alt={product.name}
                    className="product-card-img"
                    loading="lazy"
                  />
                  <span className="product-card-sfda-badge">SFDA ✓</span>
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

                <div className="product-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="product-price" style={{ fontWeight: '700', color: '#FF6600', fontSize: '1.1rem' }}>
                    {product.price
                      ? `${product.price} ${i18n.language.startsWith('ar') ? 'ر.س' : 'SAR'}`
                      : `${(product.id * 37 + 85).toFixed(2)} ${i18n.language.startsWith('ar') ? 'ر.س' : 'SAR'}`}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className="view-details-btn">{t('products.view_details', 'View')}</span>
                    <button 
                      className="add-to-cart-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                      }}
                      style={{
                        background: '#FF6600',
                        color: 'white',
                        border: 'none',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}
                    >
                      {t('cart.add', 'Add')}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t('products.prev')}
              </button>
              <span className="page-info">
                {t('products.page_info', { page, totalPages, total })}
              </span>
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {t('products.next')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProductListing;
