import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';
import { priceOf, priceOnRequest } from '../utils/pricing';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/* ── Fallback image based on product name ────────────────────── */
function getProductImage(name = '') {
  const n = name.toLowerCase();
  if (n.includes('scissors'))                                   return '/product_img_scissors.png';
  if (n.includes('forceps') || n.includes('clamp'))             return '/product_img_forceps.png';
  if (n.includes('needle') || n.includes('holder'))             return '/product_img_needle_holder.png';
  if (n.includes('retractor'))                                  return '/product_img_retractor.png';
  if (n.includes('scalpel') || n.includes('blade'))             return '/product_img_scalpel.png';
  if (n.includes('syringe'))                                    return '/product_img_syringe.png';
  if (n.includes('glove'))                                      return '/product_img_gloves.png';
  if (n.includes('mask'))                                       return '/product_img_mask.png';
  if (n.includes('gauze') || n.includes('swab') || n.includes('dressing') || n.includes('mepilex') || n.includes('mepore') || n.includes('tape') || n.includes('sponge')) return '/product_img_gauze.png';
  if (n.includes('catheter') || n.includes('drainage') || n.includes('urine') || n.includes('tube') || n.includes('feeding')) return '/product_img_catheter.png';
  if (n.includes('set') || n.includes('tray'))                  return '/icon_surgical_sets.png';
  if (n.includes('disposable') || n.includes('alcohol') || n.includes('filter') || n.includes('nebulizer') || n.includes('spacer')) return '/icon_medical_consumables.png';
  return '/icon_surgical_instruments.png';
}

const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

function ProductDetail() {
  const { category, id } = useParams();
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isAr = i18n.language.startsWith('ar');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      setImgError(false);
      try {
        const res = await fetch(`${BASE_URL}/api/products/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Product not found');
          throw new Error('Failed to load product details');
        }
        const data = await res.json();
        setProduct(data.product);
        if (data.product?.variants?.length > 0) {
          setSelectedVariant(data.product.variants[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Reset the quantity stepper to 1 whenever we land on a new product,
  // and never let it exceed a tracked stock count.
  useEffect(() => {
    setQuantity(1);
  }, [id]);

  useEffect(() => {
    if (typeof product?.stock === 'number' && product.stock > 0) {
      setQuantity((q) => Math.min(q, product.stock));
    }
  }, [product?.stock]);

  if (loading) {
    return (
      <div className="detail-container">
        <div className="detail-status">{t('products.loading_detail')}</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="detail-container">
        <div className="detail-status">
          <h2>{t('products.error_title')}</h2>
          <p>{error || t('products.product_not_found')}</p>
          <Link to={`/products/${category}`} style={{ color: 'var(--accent-color)' }}>
            {t('products.back_to_products')}
          </Link>
        </div>
      </div>
    );
  }

  const isSet = !!product.surgical_set;
  const setSpecs = product.surgical_set;
  const setItems = product.set_items || [];
  const variants = product.variants || [];

  const categoryKeyMap = {
    'surgical-instruments': 'products.title_surgical_instruments',
    'medical-consumables': 'products.title_medical_consumables',
    'surgical-sets': 'products.title_surgical_sets',
  };
  const categoryLabel = categoryKeyMap[category] ? t(categoryKeyMap[category]) : category;

  /* Resolve active image: variant image → product images array → name-based fallback */
  const activeImage =
    selectedVariant?.image ||
    product.images?.[0] ||
    product.image ||
    getProductImage(product.name);

  const activeSku = selectedVariant?.code || product.sku || `MCS-${product.id}`;
  const activePrice = priceOf(selectedVariant?.price || product.price);

  const unitPrice = activePrice
    ? `${activePrice} ${isAr ? 'ر.س' : 'SAR'}`
    : priceOnRequest(isAr);

  // stock === null/undefined → stock isn't tracked for this product, always allow.
  // stock === 0 → out of stock. stock > 0 → limit quantity to what's available.
  const trackedStock = typeof product.stock === 'number' ? product.stock : null;
  const isOutOfStock = trackedStock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({
      id: selectedVariant?.id || product.id,
      sku: activeSku,
      name: product.name + (selectedVariant?.size ? ` (${selectedVariant.size})` : ''),
      price: activePrice,
      image: activeImage,
      quantity,
    });
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  return (
    <div className="detail-container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/products">{t('products.title_products')}</Link>
        <span>›</span>
        <Link to={`/products/${category}`}>{categoryLabel}</Link>
        <span>›</span>
        <span>{product.sku || product.name}</span>
      </nav>

      {/* Main two-column layout */}
      <div className="detail-main-grid">

        {/* ── Left: Product Image Panel ─────────────────── */}
        <div className="detail-image-panel">
          <div className="detail-img-box">
            {!imgError ? (
              <img
                key={activeImage}
                src={activeImage}
                alt={product.name}
                className="detail-product-img"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="detail-img-placeholder">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.3">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            )}
            <div className="detail-img-sfda-badge">
              <IconShield />
              SFDA ✓
            </div>
          </div>

          {/* Thumbnail row for multi-image products or variants with images */}
          {(product.images?.length > 1 || variants.some(v => v.image)) && (
            <div className="detail-thumb-row">
              {(product.images || variants.filter(v => v.image).map(v => v.image)).map((img, idx) => (
                <button
                  key={idx}
                  className={`detail-thumb ${activeImage === img ? 'active' : ''}`}
                  onClick={() => {
                    setImgError(false);
                    const matchingVar = variants.find(v => v.image === img);
                    if (matchingVar) setSelectedVariant(matchingVar);
                  }}
                >
                  <img src={img} alt={`View ${idx + 1}`} loading="lazy" onError={(e) => { e.target.style.display='none'; }} />
                </button>
              ))}
            </div>
          )}

          {/* Certification mini-panel */}
          <div className="detail-cert-panel">
            <div className="cert-row">
              <IconShield />
              <span>{isAr ? 'معتمد من هيئة الغذاء والدواء' : 'SFDA Approved'}</span>
            </div>
            <div className="cert-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
              </svg>
              <span>{isAr ? 'معتمد ISO 13485' : 'ISO 13485 Certified'}</span>
            </div>
            <div className="cert-row">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" rx="1"/>
                <path d="M16 8h4l3 5v3h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <span>{isAr ? 'شحن سريع في السعودية' : 'Express KSA Delivery'}</span>
            </div>
          </div>

          {/* Downloadable spec / certification sheet */}
          <a
            className="detail-spec-sheet-link"
            href={`${BASE_URL}/api/products/${product.id}/spec-sheet.pdf${isAr ? '?lang=ar' : ''}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <polyline points="9 15 12 18 15 15"/>
            </svg>
            {isAr ? 'تحميل بطاقة المواصفات (PDF)' : 'Download Spec Sheet (PDF)'}
          </a>
        </div>

        {/* ── Right: Product Info Panel ─────────────────── */}
        <div className="detail-info-panel">
          <div className="detail-meta-row">
            {activeSku && <div className="detail-sku">REF: {activeSku}</div>}
            {isOutOfStock ? (
              <span className="detail-stock-badge detail-stock-badge--out">
                {isAr ? 'نفدت الكمية' : 'Out of Stock'}
              </span>
            ) : trackedStock != null ? (
              <span className="detail-stock-badge detail-stock-badge--in">
                {isAr ? 'متوفر بالمخزون' : 'In Stock'}
              </span>
            ) : null}
            <div className="detail-delivery-tag">
              🇸🇦 {isAr ? 'التوصيل الفوري بالمملكة' : 'Immediate KSA Delivery'}
            </div>
          </div>

          <h1 className="detail-title">{product.name}</h1>

          <div className="detail-price-block">
            <span className="detail-price-value">{unitPrice}</span>
            {activePrice && <span className="detail-price-vat">({isAr ? 'شامل الضريبة' : 'VAT Included'})</span>}
          </div>

          {product.description && (
            <p className="detail-description">{product.description}</p>
          )}

          {/* Variant Selector */}
          {variants.length > 0 && (
            <div className="detail-variants-block">
              <h3 className="detail-variants-title">
                {isAr
                  ? 'اختر المقاس أو المتغير (تتغير الصورة تلقائياً):'
                  : 'Select Size / Variant — Image Updates Live:'}
              </h3>
              <div className="detail-variant-chips">
                {variants.map((v, i) => (
                  <button
                    key={v.id || v.code || i}
                    className={`detail-variant-chip ${
                      selectedVariant?.code === v.code || selectedVariant?.id === v.id ? 'active' : ''
                    }`}
                    onClick={() => { setSelectedVariant(v); setImgError(false); }}
                  >
                    <span className="chip-code">{v.code || v.size || `#${i + 1}`}</span>
                    {v.size && v.size !== v.code && <span className="chip-size">{v.size}</span>}
                    {priceOf(v.price) && <span className="chip-price">{v.price} {isAr ? 'ر.س' : 'SAR'}</span>}
                  </button>
                ))}
              </div>

              {/* Full variant table for many variants */}
              {variants.length > 3 && (
                <div className="detail-variants-table-wrap">
                  <table className="detail-variants-table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>{isAr ? 'الكود' : 'Code'}</th>
                        <th>{isAr ? 'القياس' : 'Size'}</th>
                        <th>{isAr ? 'الشكل' : 'Profile'}</th>
                        <th>{isAr ? 'السعر' : 'Price'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((v, i) => (
                        <tr
                          key={v.id || v.code || i}
                          className={selectedVariant?.code === v.code || selectedVariant?.id === v.id ? 'selected-row' : ''}
                          onClick={() => { setSelectedVariant(v); setImgError(false); }}
                        >
                          <td>
                            <input
                              type="radio"
                              name="variant-radio"
                              checked={selectedVariant?.code === v.code || selectedVariant?.id === v.id}
                              onChange={() => { setSelectedVariant(v); setImgError(false); }}
                            />
                          </td>
                          <td><strong>{v.code || '—'}</strong></td>
                          <td>{v.size || (isAr ? 'قياسي' : 'Standard')}</td>
                          <td>{v.profile || '—'}</td>
                          <td className="table-price">{priceOf(v.price) ? `${v.price} ${isAr ? 'ر.س' : 'SAR'}` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="detail-purchase-row">
            <div className="detail-qty-control">
              <button
                className="detail-qty-btn"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isOutOfStock}
              >−</button>
              <span className="detail-qty-num">{quantity}</span>
              <button
                className="detail-qty-btn"
                onClick={() => setQuantity(q => (trackedStock != null ? Math.min(trackedStock, q + 1) : q + 1))}
                disabled={isOutOfStock || (trackedStock != null && quantity >= trackedStock)}
              >+</button>
            </div>
            <button
              className={`detail-add-cart-btn ${addedFeedback ? 'success' : ''} ${isOutOfStock ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? (
                isAr ? 'نفدت الكمية' : 'Out of Stock'
              ) : addedFeedback ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {isAr ? 'تمت الإضافة!' : 'Added!'}
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  {isAr ? `إضافة ${quantity} للسلة` : `Add ${quantity} to Cart`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Specifications (Sets only) */}
      {isSet && (
        <section className="detail-section">
          <h2 className="detail-section-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginEnd: '0.5rem' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            {t('products.specifications')}
          </h2>
          <table className="specs-table">
            <tbody>
              {setSpecs.piece_count && (<tr><th>{t('products.total_pieces')}</th><td>{setSpecs.piece_count}</td></tr>)}
              {setSpecs.material && (<tr><th>{t('products.material')}</th><td>{setSpecs.material}</td></tr>)}
              {setSpecs.finish && (<tr><th>{t('products.finish')}</th><td>{setSpecs.finish}</td></tr>)}
              {setSpecs.sterilization && (<tr><th>{t('products.sterilization')}</th><td>{setSpecs.sterilization}</td></tr>)}
              {setSpecs.standard && (<tr><th>{t('products.standard')}</th><td>{setSpecs.standard}</td></tr>)}
              {setSpecs.tray_case && (<tr><th>{t('products.tray_case')}</th><td>{setSpecs.tray_case}</td></tr>)}
            </tbody>
          </table>
        </section>
      )}

      {/* Set Contents */}
      {isSet && setItems.length > 0 && (
        <section className="detail-section">
          <h2 className="detail-section-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginEnd: '0.5rem' }}>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            {t('products.set_contents')}
          </h2>
          <ul className="contents-list">
            {setItems.map((item, index) => (
              <li key={item.product.id || index} className="contents-item">
                <div className="item-quantity">{item.quantity}×</div>
                <div className="item-details">
                  <h3 className="item-name">{item.product.name}</h3>
                  {item.product.sku && <span className="item-sku">{item.product.sku}</span>}
                  {item.product.description && <p className="item-desc">{item.product.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default ProductDetail;
