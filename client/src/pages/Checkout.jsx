import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAuthContext } from '../context/AuthContext';
import { placeOrder } from '../services/orderService';
import { api } from '../staff/api';
import './Checkout.css';

const ORDER_KEY = 'medportal_last_order';

function Checkout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { cartItems, clearCart, updateQuantity, removeFromCart, setIsCartOpen } = useCart();
  const { user, token } = useAuthContext();
  const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    city: '',
    address: '',
    notes: '',
    website: '', // honeypot — real customers never see or fill this
  });
  const [payment, setPayment] = useState('cod');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fill saved delivery details from the customer's account (only into empty fields)
  useEffect(() => {
    if (!token) return undefined;
    let alive = true;
    api('/api/account', { token })
      .then(({ user: u }) => {
        if (!alive) return;
        setForm((f) => ({
          ...f,
          name: f.name || u.name || '',
          phone: f.phone || u.phone || '',
          city: f.city || u.city || '',
          address: f.address || u.address || '',
        }));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [token]);

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    const req = t('checkout.required', 'This field is required');
    if (form.name.trim().length < 2) e.name = req;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = t('checkout.bad_email', 'Enter a valid email');
    if (!/^[+\d][\d\s-]{6,}$/.test(form.phone.trim())) e.phone = t('checkout.bad_phone', 'Enter a valid phone number');
    if (!form.city.trim()) e.city = req;
    if (form.address.trim().length < 5) e.address = req;
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setServerError('');
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setSubmitting(true);
    try {
      const res = await placeOrder(
        {
          ...form,
          payment_method: payment,
          lang,
          items: cartItems.map((i) => ({ sku: i.sku, name: i.name, quantity: i.quantity })),
        },
        token
      );
      try {
        sessionStorage.setItem(ORDER_KEY, JSON.stringify({ order: res.order, bank: res.bank }));
      } catch { /* storage unavailable — success page still works from router state */ }
      clearCart();
      setIsCartOpen(false);
      navigate('/checkout/success', { replace: true, state: { order: res.order, bank: res.bank } });
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h1>{t('checkout.empty_title', 'Your cart is empty')}</h1>
          <p>{t('checkout.empty_text', 'Add some products before checking out.')}</p>
          <Link to="/products" className="checkout-btn checkout-btn--primary">
            {t('checkout.browse', 'Browse products')}
          </Link>
        </div>
      </div>
    );
  }

  const field = (key, label, props = {}) => (
    <div className={`checkout-field ${errors[key] ? 'has-error' : ''} ${props.wide ? 'checkout-field--wide' : ''}`}>
      <label htmlFor={`co-${key}`}>{label}</label>
      {props.textarea ? (
        <textarea id={`co-${key}`} rows={props.rows || 3} value={form[key]} onChange={set(key)} placeholder={props.placeholder} />
      ) : (
        <input
          id={`co-${key}`}
          type={props.type || 'text'}
          value={form[key]}
          onChange={set(key)}
          autoComplete={props.autoComplete}
          inputMode={props.inputMode}
          dir={props.dir}
        />
      )}
      {errors[key] && <span className="checkout-error">{errors[key]}</span>}
    </div>
  );

  return (
    <div className="checkout-page">
      <header className="checkout-head">
        <h1>{t('checkout.title', 'Checkout')}</h1>
        <p>{t('checkout.subtitle', 'Tell us where to deliver. Our team confirms every order.')}</p>
      </header>

      <form className="checkout-grid" onSubmit={onSubmit} noValidate>
        <div className="checkout-main">
          <section className="checkout-card">
            <h2>{t('checkout.delivery', 'Delivery details')}</h2>
            <div className="checkout-fields">
              {field('name', t('checkout.name', 'Full name / facility'), { autoComplete: 'name' })}
              {field('phone', t('checkout.phone', 'Phone'), { type: 'tel', autoComplete: 'tel', inputMode: 'tel', dir: 'ltr' })}
              {field('email', t('checkout.email', 'Email'), { type: 'email', autoComplete: 'email', dir: 'ltr' })}
              {field('city', t('checkout.city', 'City'), { autoComplete: 'address-level2' })}
              {field('address', t('checkout.address', 'Street address / building / district'), { wide: true, autoComplete: 'street-address' })}
              {field('notes', t('checkout.notes', 'Order notes (optional)'), { wide: true, textarea: true })}
            </div>
            {/* Honeypot */}
            <input
              type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
              className="checkout-hp" value={form.website} onChange={set('website')}
            />
          </section>

          <section className="checkout-card">
            <h2>{t('checkout.payment', 'Payment method')}</h2>
            <div className="checkout-pay">
              {[
                ['cod', t('checkout.cod', 'Cash on delivery'), t('checkout.cod_desc', 'Pay when your order arrives.')],
                ['bank_transfer', t('checkout.bank', 'Bank transfer'), t('checkout.bank_desc', 'We show you our bank details after you place the order.')],
              ].map(([id, title, desc]) => (
                <label key={id} className={`checkout-pay-option ${payment === id ? 'is-selected' : ''}`}>
                  <input type="radio" name="payment" value={id} checked={payment === id} onChange={() => setPayment(id)} />
                  <span className="checkout-pay-dot" />
                  <span>
                    <strong>{title}</strong>
                    <small>{desc}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="checkout-summary">
          <h2>{t('checkout.summary', 'Order summary')}</h2>
          <ul className="checkout-lines">
            {cartItems.map((item) => (
              <li key={item.id}>
                <div className="checkout-line-info">
                  <span className="checkout-line-name">{item.name}</span>
                  {item.sku && <span className="checkout-line-sku">{item.sku}</span>}
                </div>
                <div className="checkout-qty">
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="−">−</button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="+">+</button>
                </div>
                <button type="button" className="checkout-remove" onClick={() => removeFromCart(item.id)} aria-label={t('checkout.remove', 'Remove')}>×</button>
              </li>
            ))}
          </ul>

          <p className="checkout-note">
            {t('checkout.price_note', 'Final prices and 15% VAT are confirmed by our team before delivery.')}
          </p>

          {serverError && <div className="checkout-server-error" role="alert">{serverError}</div>}

          <button type="submit" className="checkout-btn checkout-btn--primary checkout-submit" disabled={submitting}>
            {submitting ? t('checkout.placing', 'Placing order…') : t('checkout.place', 'Place order')}
          </button>
        </aside>
      </form>
    </div>
  );
}

export default Checkout;
