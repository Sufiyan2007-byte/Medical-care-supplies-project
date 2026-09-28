import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api, useLoad } from '../staff/api';
import { statusLabel, fmtDate, money } from '../utils/orderStatus';
import { AccountTabs } from './Account';
import './Account.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function MyOrders() {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');
  const tx = (ar, en) => (isAr ? ar : en);
  const { token } = useAuthContext();
  const { addToCart } = useCart();
  const { data, loading, error, reload } = useLoad(() => api('/api/orders/mine', { token }), [token]);
  const orders = data?.orders || [];

  const [reorderingId, setReorderingId] = useState(null);
  const [reorderNotice, setReorderNotice] = useState(null); // { orderId, added, skipped: [{name, reason}] }

  /**
   * Re-checks each line against the live catalog (price/stock can have changed
   * since the order was placed) before adding it to the cart, instead of blindly
   * re-adding stale data. Unavailable lines are skipped and reported, not silently dropped.
   */
  const reorder = async (order) => {
    setReorderingId(order.id);
    setReorderNotice(null);
    const skipped = [];
    let added = 0;

    await Promise.all(order.items.map(async (i) => {
      if (!i.product_id) {
        skipped.push({ name: i.name, reason: tx('لم يعد هذا المنتج متوفراً', 'no longer available') });
        return;
      }
      try {
        const res = await fetch(`${BASE_URL}/api/products/${i.product_id}`);
        if (!res.ok) {
          skipped.push({ name: i.name, reason: tx('لم يعد هذا المنتج متوفراً', 'no longer available') });
          return;
        }
        const { product: p } = await res.json();
        if (p.stock === 0) {
          skipped.push({ name: p.name, reason: tx('نفدت الكمية', 'out of stock') });
          return;
        }
        const qty = typeof p.stock === 'number' ? Math.min(i.quantity, p.stock) : i.quantity;
        addToCart({ id: p.id, sku: p.sku, name: p.name, price: p.price, image: p.image, quantity: qty });
        added += 1;
        if (qty < i.quantity) {
          skipped.push({
            name: p.name,
            reason: isAr ? `أُضيف ${qty} فقط (الكمية المتاحة)` : `only ${qty} added (limited stock)`,
          });
        }
      } catch {
        skipped.push({ name: i.name, reason: tx('تعذر التحقق من هذا المنتج', 'could not be checked') });
      }
    }));

    setReorderingId(null);
    setReorderNotice({ orderId: order.id, added, skipped });
  };

  return (
    <div className="account-page">
      <header className="account-head">
        <h1>{tx('طلباتي', 'My orders')}</h1>
        <p>{tx('تابع حالة طلباتك وأعد الطلب بضغطة واحدة.', 'Follow your orders and reorder in one tap.')}</p>
      </header>
      <AccountTabs />

      {loading && <p className="account-empty">{tx('جارٍ التحميل…', 'Loading…')}</p>}
      {error && <div className="account-error">{error} <button type="button" className="account-link" onClick={reload}>{tx('حاول مرة أخرى', 'Try again')}</button></div>}
      {!loading && !error && orders.length === 0 && (
        <div className="account-empty">
          <p>{tx('لا توجد طلبات بعد.', 'No orders yet.')}</p>
          <Link to="/products" className="account-btn">{tx('تصفح المنتجات', 'Browse products')}</Link>
        </div>
      )}

      <div className="orders-list">
        {orders.map((o) => (
          <article key={o.id} className="account-card order-card">
            <header>
              <div>
                <strong dir="ltr" className="order-no">{o.order_number}</strong>
                <span className="order-date">{fmtDate(isAr, o.created_at)}</span>
              </div>
              <span className={`status-pill status-pill--${o.status}`}>{statusLabel(isAr, o.status)}</span>
            </header>
            <ul>
              {o.items.map((i) => (
                <li key={i.id}><span>{i.name} <em>× {i.quantity}</em></span><span>{i.line_total != null ? money(isAr, i.line_total) : tx('السعر عند الطلب', 'Price on request')}</span></li>
              ))}
            </ul>
            <footer>
              <span className="order-total">
                {o.total != null ? `${tx('الإجمالي', 'Total')}: ${money(isAr, o.total)}` : tx('سيؤكد فريقنا السعر', 'Our team will confirm the price')}
              </span>
              <button
                type="button"
                className="account-btn account-btn--ghost"
                onClick={() => reorder(o)}
                disabled={reorderingId === o.id}
              >
                {reorderingId === o.id ? tx('جارٍ التحقق…', 'Checking…') : tx('إعادة الطلب', 'Reorder')}
              </button>
            </footer>
            {reorderNotice && reorderNotice.orderId === o.id && (
              <div className="reorder-notice">
                {reorderNotice.added > 0 && (
                  <p className="reorder-notice-ok">
                    {isAr
                      ? `تمت إضافة ${reorderNotice.added} منتج للسلة.`
                      : `${reorderNotice.added} item(s) added to your cart.`}
                  </p>
                )}
                {reorderNotice.skipped.length > 0 && (
                  <ul className="reorder-notice-skipped">
                    {reorderNotice.skipped.map((s, idx) => (
                      <li key={idx}>{s.name} — {s.reason}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
