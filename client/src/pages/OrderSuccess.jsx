import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import './Checkout.css';

function OrderSuccess() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const { isAuthenticated } = useAuthContext();

  let data = location.state;
  if (!data?.order) {
    try { data = JSON.parse(sessionStorage.getItem('medportal_last_order') || 'null'); } catch { data = null; }
  }
  if (!data?.order) return <Navigate to="/" replace />;

  const { order, bank } = data;
  const isAr = i18n.language.startsWith('ar');
  const cur = isAr ? 'ر.س' : 'SAR';
  const fmt = (n) => `${Number(n).toFixed(2)} ${cur}`;
  const isBank = order.payment_method === 'bank_transfer';

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked */ }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-success">
        <div className="checkout-success-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h1>{t('checkout.success_title', 'Order received')}</h1>
        <p className="checkout-success-sub">
          {t('checkout.success_text', 'Thank you. We sent a confirmation to')} <strong dir="ltr">{order.customer_email}</strong>
        </p>

        <div className="checkout-order-no">
          <span>{t('checkout.order_number', 'Order number')}</span>
          <strong dir="ltr">{order.order_number}</strong>
        </div>

        {isBank && bank && (
          <div className="checkout-bank">
            <h2>{t('checkout.bank_details', 'Bank transfer details')}</h2>
            {bank.bank_name && <div><span>{t('checkout.bank_name', 'Bank')}</span><strong>{bank.bank_name}</strong></div>}
            {bank.account_name && <div><span>{t('checkout.account_name', 'Account name')}</span><strong>{bank.account_name}</strong></div>}
            {bank.iban && (
              <div>
                <span>IBAN</span>
                <strong dir="ltr">{bank.iban}</strong>
                <button type="button" className="checkout-copy" onClick={() => copy(bank.iban)}>
                  {copied ? t('checkout.copied', 'Copied') : t('checkout.copy', 'Copy')}
                </button>
              </div>
            )}
            <p>{t('checkout.bank_hint', 'Include the order number in the transfer and send us the receipt.')}</p>
          </div>
        )}

        <div className="checkout-receipt">
          <h2>{t('checkout.your_items', 'Your items')}</h2>
          <ul>
            {order.items.map((i) => (
              <li key={i.id}>
                <span>{i.name} <em>× {i.quantity}</em></span>
                <span>{i.line_total != null ? fmt(i.line_total) : t('checkout.on_request', 'Price on request')}</span>
              </li>
            ))}
          </ul>
          {order.total != null && (
            <div className="checkout-totals">
              <div><span>{t('checkout.subtotal', 'Subtotal')}</span><span>{fmt(order.subtotal)}</span></div>
              <div><span>{t('checkout.vat', 'VAT (15%)')}</span><span>{fmt(order.vat)}</span></div>
              <div className="is-total"><span>{t('checkout.total', 'Total')}</span><span>{fmt(order.total)}</span></div>
            </div>
          )}
          {order.needs_quote && (
            <p className="checkout-note">{t('checkout.quote_note', 'Some items are priced on request. Our team will confirm the final price with you.')}</p>
          )}
        </div>

        <div className="checkout-actions">
          <Link to="/products" className="checkout-btn checkout-btn--primary">{t('checkout.continue', 'Continue shopping')}</Link>
          {isAuthenticated && (
            <Link to="/account/orders" className="checkout-btn checkout-btn--ghost">{isAr ? 'طلباتي' : 'My orders'}</Link>
          )}
          <Link to="/contact" className="checkout-btn checkout-btn--ghost">{t('checkout.need_help', 'Need help?')}</Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
