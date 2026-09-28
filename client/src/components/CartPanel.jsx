import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import './CartPanel.css';

/** Reuse the same image-picker logic as ProductListing */
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
  if (n.includes('gauze'))                                     return '/product_img_gauze.png';
  if (n.includes('catheter'))                                  return '/product_img_catheter.png';
  if (n.includes('disposable') || n.includes('bulb') || n.includes('specula')) return '/icon_medical_consumables.png';
  return '/icon_surgical_instruments.png';
}

const VAT_LABEL = '15%';

function CartPanel() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    isCartOpen, setIsCartOpen,
    cartItems, removeFromCart, updateQuantity,
    subtotal, vat, grandTotal,
  } = useCart();

  if (!isCartOpen) return null;

  const isRTL = i18n.language.startsWith('ar');
  const currency = isRTL ? 'ر.س' : 'SAR';
  const fmt = (n) => Number(n).toFixed(2);

  return (
    <div className="cart-overlay">
      <div className="cart-backdrop" onClick={() => setIsCartOpen(false)} />

      <div className={`cart-panel ${isRTL ? 'cart-panel--rtl' : ''}`}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="cart-header">
          <h2>
            {t('cart.title', 'Shopping Cart')}
            {cartItems.length > 0 && <span className="cart-count">{cartItems.reduce((n, i) => n + i.quantity, 0)}</span>}
          </h2>
          <button className="cart-close-btn" onClick={() => setIsCartOpen(false)} aria-label="Close cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        {/* ── Items ──────────────────────────────────────────────── */}
        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p>{t('cart.empty', 'Your cart is empty.')}</p>
              <button className="cart-btn cart-btn--secondary" onClick={() => setIsCartOpen(false)}>
                {t('cart.continue_shopping', 'Continue Shopping')}
              </button>
            </div>
          ) : (
            <div className="cart-items">
              {cartItems.map((item) => {
                const price = Number(item.price) || 0;
                const lineTotal = price * item.quantity;
                return (
                  <div key={item.id} className="cart-item">
                    {/* Thumbnail */}
                    <div className="cart-item-thumb">
                      <img
                        src={getProductImage(item.name)}
                        alt={item.name}
                        loading="lazy"
                      />
                    </div>

                    {/* Info + controls */}
                    <div className="cart-item-body">
                      <div className="cart-item-top">
                        <h4 className="cart-item-name">{item.name}</h4>
                        <button
                          className="cart-item-remove"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>

                      <p className="cart-item-unit-price">
                        {price > 0
                          ? `${fmt(price)} ${currency} ${t('cart.per_unit', '/ unit')}`
                          : t('checkout.on_request', 'Price on request')}
                      </p>

                      <div className="cart-item-bottom">
                        {/* Quantity stepper */}
                        <div className="cart-qty-ctrl">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >−</button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >+</button>
                        </div>

                        {/* Line total */}
                        <span className="cart-item-line-total">
                          {price > 0 ? `${fmt(lineTotal)} ${currency}` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer — subtotal / VAT / total ────────────────────── */}
        {cartItems.length > 0 && (
          <footer className="cart-footer">
            {subtotal > 0 ? (
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>{t('cart.subtotal', 'Subtotal')}</span>
                <span>{fmt(subtotal)} {currency}</span>
              </div>
              <div className="cart-summary-row cart-summary-vat">
                <span>{t('cart.vat', 'VAT')} ({VAT_LABEL})</span>
                <span>{fmt(vat)} {currency}</span>
              </div>
              <div className="cart-summary-row cart-summary-total">
                <span>{t('cart.total', 'Total')}</span>
                <span className="cart-total-price">{fmt(grandTotal)} {currency}</span>
              </div>
            </div>
            ) : (
              <p className="cart-price-note">{t('checkout.price_note', 'Final prices and 15% VAT are confirmed by our team before delivery.')}</p>
            )}

            <button
              className="cart-btn cart-btn--primary"
              onClick={() => {
                setIsCartOpen(false);
                navigate('/checkout');
              }}
            >
              {t('cart.checkout', 'Proceed to Checkout')}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

export default CartPanel;



