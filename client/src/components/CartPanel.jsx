import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import './CartPanel.css';

function CartPanel() {
  const { t, i18n } = useTranslation();
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (!isCartOpen) return null;

  const isRTL = i18n.language.startsWith('ar');

  return (
    <div className="cart-overlay">
      <div className="cart-backdrop" onClick={() => setIsCartOpen(false)} />
      
      <div className={`cart-panel ${isRTL ? 'cart-panel--rtl' : ''}`}>
        <header className="cart-header">
          <h2>{t('cart.title', 'Shopping Cart')}</h2>
          <button className="cart-close-btn" onClick={() => setIsCartOpen(false)} aria-label="Close cart">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <p>{t('cart.empty', 'Your cart is empty.')}</p>
              <button className="cart-btn cart-btn--secondary" onClick={() => setIsCartOpen(false)}>
                {t('cart.continue_shopping', 'Continue Shopping')}
              </button>
            </div>
          ) : (
            <div className="cart-items">
              {cartItems.map((item) => {
                const price = item.price || (item.id * 37 + 85);
                return (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p className="cart-item-price">
                        {price.toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
                      </p>
                    </div>
                    
                    <div className="cart-item-actions">
                      <div className="cart-qty-ctrl">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <button className="cart-item-remove" onClick={() => removeFromCart(item.id)} aria-label="Remove item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <footer className="cart-footer">
            <div className="cart-summary">
              <span>{t('cart.total', 'Total')}:</span>
              <span className="cart-total-price">
                {cartTotal.toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
              </span>
            </div>
            <button className="cart-btn cart-btn--primary" onClick={() => {
              alert(t('cart.checkout_msg', 'Checkout functionality coming soon!'));
              setIsCartOpen(false);
            }}>
              {t('cart.checkout', 'Proceed to Checkout')}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

export default CartPanel;
