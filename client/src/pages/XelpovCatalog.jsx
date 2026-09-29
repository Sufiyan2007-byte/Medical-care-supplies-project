import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../context/WishlistContext';
import { loadXelpovProducts } from '../utils/xelpovData';
import './XelpovCatalog.css';

// ── Specialty display metadata ────────────────────────────────────────────────
const SPECIALTY_META = {
  'microsurgery':               { label: 'Microsurgery',               labelAr: 'الجراحة الدقيقة',                   color: '#2196F3' },
  'plastic-surgery':            { label: 'Plastic Surgery',            labelAr: 'جراحة التجميل',                      color: '#E91E63' },
  'urology':                    { label: 'Urology',                    labelAr: 'المسالك البولية',                    color: '#9C27B0' },
  'ophthalmic':                 { label: 'Ophthalmic',                 labelAr: 'طب العيون',                         color: '#00BCD4' },
  'stomach-intestine-rectum':   { label: 'Stomach, Intestine & Rectum', labelAr: 'المعدة والأمعاء والمستقيم',         color: '#FF5722' },
  'neurosurgery-spine':         { label: 'Neurosurgery / Spine',       labelAr: 'جراحة الأعصاب والعمود الفقري',      color: '#607D8B' },
  'gynecology-obstetrics':      { label: 'Gynecology & Obstetrics',    labelAr: 'النساء والتوليد',                   color: '#FF4081' },
  'oral-maxillofacial':         { label: 'Oral & Maxillofacial',       labelAr: 'الفم والوجه والفكين',               color: '#FF9800' },
  'cardiovascular':             { label: 'Cardiovascular',             labelAr: 'أمراض القلب والأوعية الدموية',     color: '#F44336' },
  'general-surgery':            { label: 'General Surgery',            labelAr: 'الجراحة العامة',                    color: '#4CAF50' },
  'ent':                        { label: 'ENT',                        labelAr: 'الأنف والأذن والحنجرة',             color: '#3F51B5' },
  'dental':                     { label: 'Dental',                     labelAr: 'طب الأسنان',                        color: '#009688' },
  'orthopedic':                 { label: 'Orthopedic',                 labelAr: 'العظام والمفاصل',                   color: '#795548' },
};

const PAGE_SIZE = 24;

function XelpovCatalog() {
  const { specialty } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language.startsWith('ar');
  const { toggleWishlist, isSaved } = useWishlist();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState({});
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('cat') || '';

  // Load the full catalogue JSON (browser caches this after first load)
  useEffect(() => {
    setLoading(true);
    loadXelpovProducts()
      .then(data => {
        setAllProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const meta = specialty ? SPECIALTY_META[specialty] : null;

  // Filter products for this specialty
  const specialtyProducts = useMemo(() => {
    if (!specialty) return allProducts;
    const label = meta?.label || '';
    return allProducts.filter(p =>
      (p.specialty || []).some(s => {
        const sNorm = s.toLowerCase().replace(/\s*\/\s*/g, '/');
        const lNorm = label.toLowerCase().replace(/\s*\/\s*/g, '/');
        return sNorm === lNorm || sNorm.includes(lNorm) || lNorm.includes(sNorm);
      })
    );
  }, [allProducts, specialty, meta]);

  // All main categories within this specialty
  const availableCategories = useMemo(() => {
    const cats = new Set();
    specialtyProducts.forEach(p => (p.mainCategory || []).forEach(c => cats.add(c)));
    return Array.from(cats).sort();
  }, [specialtyProducts]);

  // Cross-link: which instrument types are most common in this specialty,
  // so a visitor on e.g. the ENT page can jump straight to "Forceps" or
  // "Scissors" within ENT instead of hunting through the full sidebar list.
  const topCategoriesInSpecialty = useMemo(() => {
    if (!specialty) return [];
    const counts = {};
    specialtyProducts.forEach(p => (p.mainCategory || []).forEach(c => {
      counts[c] = (counts[c] || 0) + 1;
    }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([cat, count]) => ({ cat, count }));
  }, [specialtyProducts, specialty]);

  // Apply search + category filters.
  // `cat` may hold several comma-separated mainCategory values (OR match) — used by nav
  // menus that group multiple raw categories under one label (e.g. "Retractors, Hooks & Spatulas").
  // `q` may hold several pipe-separated search terms (OR match) — used for keyword-grouped
  // nav entries (e.g. "Suggested Sets & Trays") whose products aren't reliably tagged.
  const filteredProducts = useMemo(() => {
    let list = specialtyProducts;
    if (selectedCategory) {
      const cats = selectedCategory.split(',').map(c => c.trim()).filter(Boolean);
      list = list.filter(p => (p.mainCategory || []).some(m => cats.includes(m)));
    }
    if (searchQuery) {
      const terms = searchQuery.split('|').map(t => t.trim().toLowerCase()).filter(Boolean);
      list = list.filter(p => terms.some(q =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.mainCategory || []).some(c => c.toLowerCase().includes(q)) ||
        (p.subCategory || []).some(c => c.toLowerCase().includes(q))
      ));
    }
    return list;
  }, [specialtyProducts, selectedCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pageProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Numbered page list with "…" gaps, e.g. 1 … 4 5 [6] 7 8 … 42 — so any
  // page can be jumped to directly instead of only stepping with Prev/Next.
  const pageList = useMemo(() => {
    const windowSize = 2; // pages shown on each side of the current page
    const pages = new Set([1, totalPages]);
    for (let p = currentPage - windowSize; p <= currentPage + windowSize; p++) {
      if (p >= 1 && p <= totalPages) pages.add(p);
    }
    const sorted = [...pages].sort((a, b) => a - b);
    const withGaps = [];
    let prev = 0;
    for (const p of sorted) {
      if (p - prev > 1) withGaps.push('…');
      withGaps.push(p);
      prev = p;
    }
    return withGaps;
  }, [currentPage, totalPages]);

  function setPage(p) {
    setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', p); return n; });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function setSearch(q) {
    setSearchParams(prev => { const n = new URLSearchParams(prev); q ? n.set('q', q) : n.delete('q'); n.set('page', '1'); return n; });
  }
  function setCat(c) {
    setSearchParams(prev => { const n = new URLSearchParams(prev); c ? n.set('cat', c) : n.delete('cat'); n.set('page', '1'); return n; });
  }

  const specialtyLabel = meta
    ? (isAr ? meta.labelAr : meta.label)
    : t('products.title_products');

  // Use the site's live theme accent everywhere instead of a different hardcoded
  // hex per specialty, so colors stay consistent across the whole site.
  const accentColor = 'var(--c-accent)';

  if (loading) {
    return (
      <div className="xcat-loading">
        <div className="xcat-spinner" style={{ borderTopColor: accentColor }} />
        <p>{t('products.loading_categories')}</p>
      </div>
    );
  }

  return (
    <div className="xcat-container">
      {/* ── Hero header ── */}
      <header className="xcat-header" style={{ '--accent': accentColor }}>
        <nav className="xcat-breadcrumb">
          <Link to="/products">{t('products.title_products')}</Link>
          {specialty && (
            <>
              <span className="xcat-breadcrumb-sep">›</span>
              <span>{specialtyLabel}</span>
            </>
          )}
        </nav>
        <h1 className="xcat-title">{specialtyLabel}</h1>
        <p className="xcat-subtitle">
          {filteredProducts.length} {t('products.title_products').toLowerCase()}
          {selectedCategory && ` · ${selectedCategory.split(',').join(' / ')}`}
        </p>
      </header>

      {/* ── Cross-link: most common instrument types in this specialty ── */}
      {topCategoriesInSpecialty.length > 1 && (
        <div className="xcat-crosslinks">
          <span className="xcat-crosslinks-label">
            {isAr ? 'الأنواع الأكثر شيوعاً هنا:' : 'Popular in this specialty:'}
          </span>
          <div className="xcat-crosslinks-row">
            {topCategoriesInSpecialty.map(({ cat, count }) => (
              <button
                key={cat}
                type="button"
                className={`xcat-crosslink-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setCat(cat === selectedCategory ? '' : cat)}
              >
                {cat} <span className="xcat-crosslink-count">{count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="xcat-layout">
        {/* ── Sidebar filters ── */}
        <aside className="xcat-sidebar">
          {/* Search */}
          <div className="xcat-search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="xcat-search"
              type="text"
              placeholder={t('products.search_placeholder', { category: specialtyLabel })}
              value={searchQuery}
              onChange={e => setSearch(e.target.value)}
            />
            {searchQuery && (
              <button className="xcat-search-clear" onClick={() => setSearch('')} aria-label="Clear search">×</button>
            )}
          </div>

          {/* Category filter */}
          {availableCategories.length > 1 && (
            <div className={`xcat-filter-group ${categoriesExpanded ? 'is-expanded' : ''}`}>
              <button
                type="button"
                className="xcat-filter-toggle-btn"
                onClick={() => setCategoriesExpanded(prev => !prev)}
                aria-expanded={categoriesExpanded}
              >
                <span>{isAr ? 'الفئات' : 'Categories'}</span>
                <svg
                  className="xcat-filter-toggle-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className="xcat-filter-list">
                <h3 className="xcat-filter-title">{t('products.specifications')}</h3>
                <button
                  className={`xcat-filter-btn ${!selectedCategory ? 'active' : ''}`}
                  onClick={() => setCat('')}
                  style={!selectedCategory ? { '--accent': accentColor } : {}}
                >
                  All Categories
                </button>
                {availableCategories.map(cat => (
                  <button
                    key={cat}
                    className={`xcat-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setCat(cat === selectedCategory ? '' : cat)}
                    style={selectedCategory === cat ? { '--accent': accentColor } : {}}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── Product grid ── */}
        <main className="xcat-main">
          {pageProducts.length === 0 ? (
            <div className="xcat-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <h2>{t('products.no_products')}</h2>
              <p>{searchQuery ? t('products.no_results_search', { query: searchQuery }) : t('products.no_products_category')}</p>
            </div>
          ) : (
            <>
              <div className="xcat-grid">
                {pageProducts.map(product => (
                  <Link
                    key={product.slug}
                    to={`/catalogue/${specialty || 'all'}/${product.slug}`}
                    className="xcat-card"
                    style={{ '--accent': accentColor }}
                  >
                    <div className="xcat-card-img-wrap">
                      {product.image && !imgErrors[product.slug] ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="xcat-card-img"
                          loading="lazy"
                          onError={() => setImgErrors(prev => ({ ...prev, [product.slug]: true }))}
                        />
                      ) : (
                        <div className="xcat-card-img-placeholder">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                          </svg>
                        </div>
                      )}
                      <div className="xcat-card-badges">
                        {product.specs?.ceMarking === true && <span className="xcat-badge xcat-badge-ce">CE</span>}
                        {product.specs?.reusable === true && <span className="xcat-badge xcat-badge-reusable">Reusable</span>}
                      </div>
                      <button
                        type="button"
                        className={`xcat-wish-btn ${isSaved(product.slug) ? 'saved' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist({
                            slug: product.slug,
                            name: product.name,
                            image: product.image,
                            mainCategory: product.mainCategory,
                            specialty: specialty || 'all',
                          });
                        }}
                        title={isAr ? 'حفظ في المفضلة' : 'Save to wishlist'}
                        aria-label={isAr ? 'حفظ في المفضلة' : 'Save to wishlist'}
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill={isSaved(product.slug) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>
                        </svg>
                      </button>
                    </div>

                    {/* Card intentionally shows only the product name — every other
                        detail (description, specs, price, quote button) lives on
                        the product page and appears once the card is clicked. */}
                    <div className="xcat-card-body xcat-card-body--minimal">
                      <h2 className="xcat-card-name">{product.name}</h2>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="xcat-pagination">
                  <span className="xcat-page-info">
                    {t('products.page_info', { page: currentPage, totalPages, total: filteredProducts.length })}
                  </span>
                  <nav className="xcat-page-nav" aria-label={isAr ? 'ترقيم الصفحات' : 'Pagination'}>
                    <button
                      className="xcat-page-btn xcat-page-btn--step"
                      onClick={() => setPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label={isAr ? 'الصفحة السابقة' : 'Previous page'}
                    >
                      {isAr ? '→' : '←'}
                    </button>

                    {pageList.map((p, i) =>
                      p === '…' ? (
                        <span key={`gap-${i}`} className="xcat-page-ellipsis">…</span>
                      ) : (
                        <button
                          key={p}
                          className={`xcat-page-btn xcat-page-btn--num ${p === currentPage ? 'active' : ''}`}
                          onClick={() => setPage(p)}
                          aria-label={isAr ? `الانتقال إلى الصفحة ${p}` : `Go to page ${p}`}
                          aria-current={p === currentPage ? 'page' : undefined}
                        >
                          {p}
                        </button>
                      )
                    )}

                    <button
                      className="xcat-page-btn xcat-page-btn--step"
                      onClick={() => setPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      aria-label={isAr ? 'الصفحة التالية' : 'Next page'}
                    >
                      {isAr ? '←' : '→'}
                    </button>
                  </nav>

                  {totalPages > 5 && (
                    <form
                      className="xcat-page-jump"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const n = Number(new FormData(e.currentTarget).get('jump'));
                        if (n >= 1 && n <= totalPages) setPage(n);
                        e.currentTarget.reset();
                      }}
                    >
                      <label htmlFor="xcat-jump-input">{isAr ? 'الانتقال إلى صفحة' : 'Go to page'}</label>
                      <input
                        id="xcat-jump-input"
                        name="jump"
                        type="number"
                        min="1"
                        max={totalPages}
                        placeholder={String(currentPage)}
                      />
                      <button type="submit">{isAr ? 'انتقال' : 'Go'}</button>
                    </form>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default XelpovCatalog;
