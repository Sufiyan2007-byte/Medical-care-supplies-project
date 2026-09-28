import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../context/WishlistContext';
import { useQuoteCart } from '../context/QuoteCartContext';
import './WishlistPanel.css';

function isAr(isRTL, arText, enText) {
  return isRTL ? arText : enText;
}

function WishlistPanel() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language.startsWith('ar');
  const { isWishlistOpen, setIsWishlistOpen, items, removeFromWishlist } = useWishlist();
  const { addToQuote } = useQuoteCart();

  if (!isWishlistOpen) return null;
  const close = () => setIsWishlistOpen(false);

  return (
    <div className="wl-overlay">
      <div className="wl-backdrop" onClick={close} />
      <div className={`wl-panel ${isRTL ? 'wl-panel--rtl' : ''}`}>
        <header className="wl-header">
          <h2>
            {isAr(isRTL, 'المفضلة', 'Saved Items')}
            {items.length > 0 && <span className="wl-count">{items.length}</span>}
          </h2>
          <button className="wl-close-btn" onClick={close} aria-label="Close saved items">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="wl-content">
          {items.length === 0 ? (
            <div className="wl-empty">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
              <p>{isAr(isRTL, 'لا توجد عناصر محفوظة بعد. اضغط على أيقونة القلب على أي منتج لحفظه هنا.', "You haven't saved anything yet. Tap the heart icon on any product to keep it here.")}</p>
              <button className="wl-btn wl-btn--secondary" onClick={close}>
                {isAr(isRTL, 'متابعة التصفح', 'Continue Browsing')}
              </button>
            </div>
          ) : (
            <div className="wl-items">
              {items.map((item) => (
                <div key={item.slug} className="wl-item">
                  <Link to={`/catalogue/${item.specialty || 'all'}/${item.slug}`} className="wl-item-thumb" onClick={close}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} loading="lazy" />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      </svg>
                    )}
                  </Link>
                  <div className="wl-item-body">
                    <div className="wl-item-top">
                      <Link to={`/catalogue/${item.specialty || 'all'}/${item.slug}`} className="wl-item-name" onClick={close}>{item.name}</Link>
                      <button className="wl-item-remove" onClick={() => removeFromWishlist(item.slug)} aria-label="Remove item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                    {item.mainCategory?.[0] && <p className="wl-item-cat">{item.mainCategory[0]}</p>}
                    <button
                      className="wl-item-quote"
                      onClick={() => addToQuote({ slug: item.slug, name: item.name, image: item.image, mainCategory: item.mainCategory, specialty: item.specialty })}
                    >
                      {isAr(isRTL, '+ أضف لطلب عرض السعر', '+ Add to Quote List')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WishlistPanel;
