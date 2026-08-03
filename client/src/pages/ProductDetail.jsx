import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ProductDetail.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function ProductDetail() {
  const { category, id } = useParams();
  const { t, i18n } = useTranslation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${BASE_URL}/api/products/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Product not found');
          throw new Error('Failed to load product details');
        }
        const data = await res.json();
        setProduct(data.product);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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
          <Link to={`/products/${category}`} style={{ color: '#3b82f6' }}>
            {t('products.back_to_products')}
          </Link>
        </div>
      </div>
    );
  }

  const isSet = !!product.surgical_set;
  const setSpecs = product.surgical_set;
  const setItems = product.set_items || [];

  const categoryKeyMap = {
    'surgical-instruments': 'products.title_surgical_instruments',
    'medical-consumables': 'products.title_medical_consumables',
    'surgical-sets': 'products.title_surgical_sets',
  };
  const categoryLabel = categoryKeyMap[category] ? t(categoryKeyMap[category]) : category;

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

      {/* Header */}
      <header className="detail-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          {product.sku && <div className="detail-sku">SKU: {product.sku}</div>}
          <div
            style={{
              background: '#e0f2fe',
              color: '#0369a1',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.825rem',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            🇸🇦 {i18n.language.startsWith('ar') ? 'التوصيل الفوري بالمملكة' : 'Immediate KSA Delivery'}
          </div>
        </div>

        <h1 className="detail-title">{product.name}</h1>

        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0ea5e9', margin: '0.5rem 0 1rem' }}>
          {product.price
            ? `${product.price} ${i18n.language.startsWith('ar') ? 'ر.س' : 'SAR'}`
            : `${(product.id * 37 + 85).toFixed(2)} ${i18n.language.startsWith('ar') ? 'ر.س' : 'SAR'}`}
          <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#64748b', margin: '0 0.5rem' }}>
            ({i18n.language.startsWith('ar') ? 'شامل الضريبة' : 'VAT Included'})
          </span>
        </div>

        {product.description && (
          <p className="detail-description">{product.description}</p>
        )}
      </header>

      {/* Specs Section (Only for Surgical Sets currently) */}
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
              {setSpecs.piece_count && (
                <tr>
                  <th>{t('products.total_pieces')}</th>
                  <td>{setSpecs.piece_count}</td>
                </tr>
              )}
              {setSpecs.material && (
                <tr>
                  <th>{t('products.material')}</th>
                  <td>{setSpecs.material}</td>
                </tr>
              )}
              {setSpecs.finish && (
                <tr>
                  <th>{t('products.finish')}</th>
                  <td>{setSpecs.finish}</td>
                </tr>
              )}
              {setSpecs.sterilization && (
                <tr>
                  <th>{t('products.sterilization')}</th>
                  <td>{setSpecs.sterilization}</td>
                </tr>
              )}
              {setSpecs.standard && (
                <tr>
                  <th>{t('products.standard')}</th>
                  <td>{setSpecs.standard}</td>
                </tr>
              )}
              {setSpecs.tray_case && (
                <tr>
                  <th>{t('products.tray_case')}</th>
                  <td>{setSpecs.tray_case}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {/* Set Contents List */}
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
                  {item.product.sku && (
                    <span className="item-sku">{item.product.sku}</span>
                  )}
                  {item.product.description && (
                    <p className="item-desc">{item.product.description}</p>
                  )}
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
