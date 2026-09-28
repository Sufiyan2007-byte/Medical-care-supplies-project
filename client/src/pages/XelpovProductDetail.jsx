import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatXelpovPrice } from '../utils/pricing';
import { IconRuler, IconFinish, IconMaterial } from '../components/SpecTagIcons';
import { useToast } from '../context/ToastContext';
import { useQuoteCart } from '../context/QuoteCartContext';
import { useWishlist } from '../context/WishlistContext';
import { loadXelpovProducts } from '../utils/xelpovData';
import './XelpovProductDetail.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Same metadata as catalog
const SPECIALTY_META = {
  'microsurgery':               { label: 'Microsurgery',               color: '#2196F3' },
  'plastic-surgery':            { label: 'Plastic Surgery',            color: '#E91E63' },
  'urology':                    { label: 'Urology',                    color: '#9C27B0' },
  'ophthalmic':                 { label: 'Ophthalmic',                 color: '#00BCD4' },
  'stomach-intestine-rectum':   { label: 'Stomach, Intestine & Rectum', color: '#FF5722' },
  'neurosurgery-spine':         { label: 'Neurosurgery / Spine',       color: '#607D8B' },
  'gynecology-obstetrics':      { label: 'Gynecology & Obstetrics',    color: '#FF4081' },
  'oral-maxillofacial':         { label: 'Oral & Maxillofacial',       color: '#FF9800' },
  'cardiovascular':             { label: 'Cardiovascular',             color: '#F44336' },
  'general-surgery':            { label: 'General Surgery',            color: '#4CAF50' },
  'ent':                        { label: 'ENT',                        color: '#3F51B5' },
  'dental':                     { label: 'Dental',                     color: '#009688' },
  'orthopedic':                 { label: 'Orthopedic',                 color: '#795548' },
};

// Human-readable spec key labels
const SPEC_LABELS = {
  authorName: 'Author / Name',
  workingEndDetails: 'Working End Details',
  workingEndProfile: 'Working End Profile',
  workingEndSize: 'Working End Size',
  workingEndMaterial: 'Working End Material',
  handleType: 'Handle Type',
  overallLength: 'Overall Length',
  shaftLength: 'Shaft Length',
  finish: 'Finish',
  material: 'Material',
  ceMarking: 'CE Marking',
  reusable: 'Reusable',
  jointType: 'Joint Type',
  ratchetLock: 'Ratchet Lock',
  instrumentProfile: 'Instrument Profile',
  lightSource: 'Light Source',
  measuringRange: 'Measuring Range',
  package: 'Package',
};

function formatSpecValue(key, value) {
  if (value === true) return '✓ Yes';
  if (value === false) return '✗ No';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function XelpovProductDetail() {
  const { specialty, slug } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { addToQuote, isInQuote } = useQuoteCart();
  const { toggleWishlist, isSaved } = useWishlist();
  const isAr = i18n.language.startsWith('ar');

  const [allProducts, setAllProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [imgError, setImgError] = useState(false);

  const [showInquiry, setShowInquiry] = useState(false);
  const [inquiryData, setInquiryData] = useState({
    name: '', email: '', phone: '', facility: '', message: '', website: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const meta = specialty ? SPECIALTY_META[specialty] : null;
  // Use the site's live theme accent everywhere instead of a different hardcoded
  // hex per specialty, so colors stay consistent across the whole site.
  const accentColor = 'var(--c-accent)';

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    setImgError(false);
    setShowInquiry(false);
    setSubmitted(false);
    loadXelpovProducts()
      .then(data => {
        setAllProducts(data);
        const found = data.find(p => p.slug === slug);
        setProduct(found || null);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
      })
      .catch(() => setLoading(false));
  }, [slug]);

  // Related products: prefer shared mainCategory, then shared specialty, excluding this item
  const relatedProducts = useMemo(() => {
    if (!product || allProducts.length === 0) return [];
    const cats = new Set(product.mainCategory || []);
    const specs = new Set(product.specialty || []);

    const scored = allProducts
      .filter(p => p.slug !== product.slug)
      .map(p => {
        let score = 0;
        if (cats.size && p.mainCategory?.some(c => cats.has(c))) score += 2;
        if (specs.size && p.specialty?.some(s => specs.has(s))) score += 1;
        return { p, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, 8).map(({ p }) => p);
  }, [product, allProducts]);

  if (loading) {
    return (
      <div className="xpd-loading">
        <div className="xpd-spinner" style={{ borderTopColor: accentColor }} />
        <p>{t('products.loading_detail')}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="xpd-not-found">
        <h1>404</h1>
        <p>{t('products.product_not_found')}</p>
        <Link to={specialty ? `/catalogue/${specialty}` : '/catalogue'} className="xpd-back-link">
          {t('products.back_to_products')}
        </Link>
      </div>
    );
  }

  // Build image gallery list
  const images = product.images?.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : [];

  const visibleSpecs = Object.entries(product.specs || {})
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([key, val]) => ({
      key,
      label: SPEC_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
      value: formatSpecValue(key, val),
    }));

  // Build a fuller, more informative narrative from whatever data the product carries,
  // so every product reads as a proper detailed description even when the scraped
  // description text alone is short.
  const detailParagraphs = [];
  if (product.description) detailParagraphs.push(product.description);
  const categoryBits = [
    product.mainCategory?.length ? `Category: ${product.mainCategory.join(', ')}` : null,
    product.subCategory?.length ? `Sub-category: ${product.subCategory.join(', ')}` : null,
    product.specialty?.length ? `Recommended for: ${product.specialty.join(', ')}` : null,
  ].filter(Boolean);
  if (categoryBits.length) detailParagraphs.push(categoryBits.join('. ') + '.');
  const specBits = [];
  if (product.specs?.material) specBits.push(`crafted from ${product.specs.material}`);
  if (product.specs?.finish) specBits.push(`finished in ${product.specs.finish}`);
  if (product.specs?.overallLength) specBits.push(`an overall length of ${product.specs.overallLength}`);
  if (product.specs?.workingEndDetails) specBits.push(`a working end profile of ${product.specs.workingEndDetails}`);
  if (specBits.length) {
    detailParagraphs.push(
      `This instrument is ${specBits.join(', ')}${product.specs?.reusable ? ', designed for repeated sterilization and reuse' : ''}${product.specs?.ceMarking ? ', and carries CE marking for regulatory compliance' : ''}.`
    );
  }
  if (product.sourceUrl) {
    detailParagraphs.push(
      'Sourced from a trusted surgical-instrument manufacturing line, this product is built to the precision and durability standards expected in professional operating-room environments.'
    );
  }

  const handleInquiryChange = (e) => {
    setInquiryData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryData.name || !inquiryData.email) {
      addToast(t('contact.error_generic', 'Please fill in your name and email.'), 'error');
      return;
    }
    setSubmitting(true);
    try {
      const composedMessage =
        `Product inquiry: "${product.name}" (${window.location.origin}/catalogue/${specialty || 'all'}/${product.slug})\n\n` +
        (inquiryData.message ? inquiryData.message : 'I would like more information / a quotation for this product.');

      const res = await fetch(`${BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inquiryData.name,
          email: inquiryData.email,
          phone: inquiryData.phone,
          facility: inquiryData.facility,
          department: 'sales',
          message: composedMessage,
          website: inquiryData.website,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong. Please try again.');

      setSubmitted(true);
      addToast(t('contact.success', 'Thank you! Your inquiry has been sent successfully.'), 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="xpd-container" style={{ '--accent': accentColor }}>
      {/* Breadcrumb + spec-sheet download (hidden when printing) */}
      <nav className="xpd-breadcrumb no-print">
        <Link to="/products">{t('products.title_products')}</Link>
        {specialty && (
          <>
            <span>›</span>
            <Link to={`/catalogue/${specialty}`}>{meta?.label || specialty}</Link>
          </>
        )}
        <span>›</span>
        <span>{product.name}</span>
        <button type="button" className="xpd-spec-pdf-btn" onClick={() => window.print()}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {isAr ? 'تحميل ورقة المواصفات (PDF)' : 'Download Spec Sheet (PDF)'}
        </button>
      </nav>

      {/* Print-only header — the site header/footer are hidden while printing,
          so this stands in as the sheet's letterhead. */}
      <div className="xpd-print-header">
        <div className="xpd-print-header-brand">Medical Care Supplies</div>
        <div className="xpd-print-header-meta">
          {isAr ? 'ورقة مواصفات المنتج' : 'Product Spec Sheet'} · {new Date().toLocaleDateString(isAr ? 'ar' : 'en-US')}
        </div>
      </div>

      <div className="xpd-layout">
        {/* ── Image gallery ── */}
        <div className="xpd-gallery">
          <div className="xpd-main-img-wrap">
            {images.length > 0 && !imgError ? (
              <img
                src={images[activeImg]}
                alt={product.name}
                className="xpd-main-img"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="xpd-img-placeholder">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                </svg>
                <p>{product.name}</p>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="xpd-thumbnails no-print">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`xpd-thumb ${i === activeImg ? 'active' : ''}`}
                  onClick={() => { setActiveImg(i); setImgError(false); }}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product info ── */}
        <div className="xpd-info">
          <div className="xpd-info-header">
            <div className="xpd-tags">
              {product.specialty?.slice(0, 3).map(s => (
                <span key={s} className="xpd-tag" style={{ '--accent': accentColor }}>{s}</span>
              ))}
            </div>
            <h1 className="xpd-name">{product.name}</h1>
            {product.mainCategory?.length > 0 && (
              <p className="xpd-category">{product.mainCategory.join(' · ')}</p>
            )}
          </div>

          {/* Badges */}
          <div className="xpd-badges">
            {product.specs?.ceMarking === true && (
              <div className="xpd-badge xpd-badge-ce">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
                CE Marked
              </div>
            )}
            {product.specs?.reusable === true && (
              <div className="xpd-badge xpd-badge-reusable">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                Reusable
              </div>
            )}
            {product.specs?.material && (
              <div className="xpd-badge xpd-badge-material">
                <IconMaterial size={14} /> {product.specs.material}
              </div>
            )}
          </div>

          {/* Quick spec strip — same visual language as the catalogue cards,
              so browsing and detail feel like one consistent interface */}
          {(product.specs?.overallLength || product.specs?.finish) && (
            <div className="xpd-spec-strip">
              {product.specs?.overallLength && (
                <span className="xpd-spec-chip"><IconRuler /> {product.specs.overallLength}</span>
              )}
              {product.specs?.finish && (
                <span className="xpd-spec-chip"><IconFinish /> {product.specs.finish}</span>
              )}
            </div>
          )}

          {/* Description */}
          {detailParagraphs.length > 0 && (
            <div className="xpd-description">
              <h2>Detailed Description</h2>
              {detailParagraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}

          {/* Price + actions */}
          <div className="xpd-price-row">
            {formatXelpovPrice(product.price, isAr) ? (
              <span className="xpd-price-label xpd-price-value">{formatXelpovPrice(product.price, isAr)}</span>
            ) : (
              <span className="xpd-price-label">Price on Request</span>
            )}
            <div className="xpd-price-actions no-print">
              <button
                type="button"
                className="xpd-quote-btn"
                style={{ borderColor: accentColor, color: isInQuote(product.slug) ? '#fff' : accentColor, background: isInQuote(product.slug) ? accentColor : 'transparent' }}
                onClick={() => addToQuote({
                  slug: product.slug,
                  name: product.name,
                  image: product.image,
                  mainCategory: product.mainCategory,
                  specialty: specialty || 'all',
                })}
              >
                {isInQuote(product.slug) ? '✓ Added to Quote List' : '+ Add to Quote List'}
              </button>
              <button
                type="button"
                className="xpd-enquire-btn"
                style={{ background: accentColor }}
                onClick={() => setShowInquiry(v => !v)}
              >
                {showInquiry ? 'Close Inquiry Form' : 'Add to Inquiry'}
              </button>
              <button
                type="button"
                className={`xpd-wish-btn ${isSaved(product.slug) ? 'saved' : ''}`}
                style={{ borderColor: accentColor, color: isSaved(product.slug) ? '#e0245e' : accentColor }}
                onClick={() => toggleWishlist({
                  slug: product.slug,
                  name: product.name,
                  image: product.image,
                  mainCategory: product.mainCategory,
                  specialty: specialty || 'all',
                })}
                title={isAr ? 'حفظ في المفضلة' : 'Save to wishlist'}
                aria-label={isAr ? 'حفظ في المفضلة' : 'Save to wishlist'}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill={isSaved(product.slug) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Inquiry form */}
          {showInquiry && (
            <div className="xpd-inquiry no-print" style={{ '--accent': accentColor }}>
              {submitted ? (
                <div className="xpd-inquiry-success">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                  <p>Thank you — your inquiry about <strong>{product.name}</strong> has been sent. Our sales team will contact you shortly.</p>
                  <button type="button" className="xpd-inquiry-again" onClick={() => { setSubmitted(false); setShowInquiry(false); }}>
                    Done
                  </button>
                </div>
              ) : (
                <form className="xpd-inquiry-form" onSubmit={handleInquirySubmit}>
                  <h3>Enquire about this product</h3>
                  <p className="xpd-inquiry-sub">Share your details and we'll get back to you with pricing and availability for <strong>{product.name}</strong>.</p>

                  {/* honeypot */}
                  <input
                    type="text"
                    name="website"
                    value={inquiryData.website}
                    onChange={handleInquiryChange}
                    autoComplete="off"
                    tabIndex="-1"
                    className="xpd-inquiry-honeypot"
                    aria-hidden="true"
                  />

                  <div className="xpd-inquiry-grid">
                    <label>
                      <span>Full Name *</span>
                      <input type="text" name="name" required value={inquiryData.name} onChange={handleInquiryChange} placeholder="Dr. Jane Doe" />
                    </label>
                    <label>
                      <span>Email *</span>
                      <input type="email" name="email" required value={inquiryData.email} onChange={handleInquiryChange} placeholder="you@hospital.com" />
                    </label>
                    <label>
                      <span>Phone</span>
                      <input type="tel" name="phone" value={inquiryData.phone} onChange={handleInquiryChange} placeholder="+966 5x xxx xxxx" />
                    </label>
                    <label>
                      <span>Facility / Hospital</span>
                      <input type="text" name="facility" value={inquiryData.facility} onChange={handleInquiryChange} placeholder="King Faisal Hospital" />
                    </label>
                  </div>
                  <label className="xpd-inquiry-message">
                    <span>Message</span>
                    <textarea
                      name="message"
                      rows={3}
                      value={inquiryData.message}
                      onChange={handleInquiryChange}
                      placeholder="Quantity needed, delivery timeline, or any specific requirements..."
                    />
                  </label>
                  <button type="submit" className="xpd-inquiry-submit" style={{ background: accentColor }} disabled={submitting}>
                    {submitting ? 'Sending…' : 'Submit Inquiry'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Sub-categories */}
          {product.subCategory?.length > 0 && (
            <div className="xpd-subcats">
              <span className="xpd-subcats-label">Sub-categories:</span>
              {product.subCategory.map(s => (
                <span key={s} className="xpd-subcat-tag">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Specifications table ── */}
      {visibleSpecs.length > 0 && (
        <section className="xpd-specs-section">
          <h2 className="xpd-specs-title">{t('products.specifications')}</h2>
          <div className="xpd-specs-table">
            {visibleSpecs.map(({ key, label, value }) => (
              <div key={key} className="xpd-spec-row">
                <dt className="xpd-spec-label">{label}</dt>
                <dd className="xpd-spec-value">{value}</dd>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Related products ── */}
      {relatedProducts.length > 0 && (
        <section className="xpd-related-section no-print">
          <h2 className="xpd-specs-title">You May Also Need</h2>
          <div className="xpd-related-grid">
            {relatedProducts.map(rp => (
              <Link
                key={rp.slug}
                to={`/catalogue/${specialty || 'all'}/${rp.slug}`}
                className="xpd-related-card"
              >
                <div className="xpd-related-img">
                  {rp.image ? (
                    <img src={rp.image} alt={rp.name} loading="lazy" />
                  ) : (
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                  )}
                </div>
                <p className="xpd-related-name">{rp.name}</p>
                {rp.mainCategory?.length > 0 && (
                  <p className="xpd-related-cat">{rp.mainCategory[0]}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Source link ── */}
      {product.sourceUrl && (
        <div className="xpd-source no-print">
          <a href={product.sourceUrl} target="_blank" rel="noopener noreferrer">
            View on Xelpov Surgical ↗
          </a>
        </div>
      )}

      {/* ── Back link ── */}
      <div className="xpd-back no-print">
        <Link to={specialty ? `/catalogue/${specialty}` : '/catalogue'} className="xpd-back-link">
          ← {t('products.back_to_products')}
        </Link>
      </div>
    </div>
  );
}

export default XelpovProductDetail;
