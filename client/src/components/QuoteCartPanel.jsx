import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuoteCart } from '../context/QuoteCartContext';
import { useToast } from '../context/ToastContext';
import './QuoteCartPanel.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function QuoteCartPanel() {
  const { t, i18n } = useTranslation();
  const { addToast } = useToast();
  const isRTL = i18n.language.startsWith('ar');

  const {
    isQuoteOpen, setIsQuoteOpen,
    quoteItems, removeFromQuote, updateQuoteQuantity, clearQuote,
  } = useQuoteCart();

  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', facility: '', message: '', website: '' });

  if (!isQuoteOpen) return null;

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const close = () => {
    setIsQuoteOpen(false);
    setShowForm(false);
    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      addToast(t('contact.error_generic', 'Please fill in your name and email.'), 'error');
      return;
    }
    setSubmitting(true);
    try {
      const itemLines = quoteItems
        .map((item, i) => `${i + 1}. ${item.name} — qty ${item.quantity} (${window.location.origin}/catalogue/${item.specialty || 'all'}/${item.slug})`)
        .join('\n');
      const composedMessage =
        `Bulk quote request for ${quoteItems.length} product${quoteItems.length > 1 ? 's' : ''}:\n\n${itemLines}` +
        (form.message ? `\n\nAdditional notes: ${form.message}` : '');

      const res = await fetch(`${BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          facility: form.facility,
          department: 'sales',
          message: composedMessage,
          website: form.website,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong. Please try again.');

      setSubmitted(true);
      clearQuote();
      addToast(t('contact.success', 'Thank you! Your quote request has been sent successfully.'), 'success');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="qcart-overlay">
      <div className="qcart-backdrop" onClick={close} />

      <div className={`qcart-panel ${isRTL ? 'qcart-panel--rtl' : ''}`}>
        <header className="qcart-header">
          <h2>
            {isAr(isRTL, 'قائمة طلب عرض السعر', 'Quote List')}
            {quoteItems.length > 0 && (
              <span className="qcart-count">{quoteItems.reduce((n, i) => n + i.quantity, 0)}</span>
            )}
          </h2>
          <button className="qcart-close-btn" onClick={close} aria-label="Close quote list">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="qcart-content">
          {submitted ? (
            <div className="qcart-success">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
              <p>{isAr(isRTL, 'شكراً لك! تم إرسال طلب عرض السعر بنجاح. سيتواصل معك فريق المبيعات قريباً.', 'Thank you! Your quote request has been sent. Our sales team will get back to you shortly.')}</p>
              <button className="qcart-btn qcart-btn--secondary" onClick={close}>
                {isAr(isRTL, 'إغلاق', 'Done')}
              </button>
            </div>
          ) : quoteItems.length === 0 ? (
            <div className="qcart-empty">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
                <line x1="9" y1="11" x2="12" y2="11"/>
              </svg>
              <p>{isAr(isRTL, 'قائمة عروض الأسعار فارغة. تصفح الكتالوج وأضف المنتجات التي تحتاجها.', "Your quote list is empty. Browse the catalogue and add the products you need.")}</p>
              <button className="qcart-btn qcart-btn--secondary" onClick={close}>
                {isAr(isRTL, 'متابعة التصفح', 'Continue Browsing')}
              </button>
            </div>
          ) : showForm ? (
            <form className="qcart-form" onSubmit={handleSubmit}>
              <p className="qcart-form-sub">
                {isAr(isRTL,
                  `سيتم إرسال طلب عرض سعر واحد يضم ${quoteItems.length} منتجاً. أدخل بياناتك وسنرد عليك بالتسعير والتوفر.`,
                  `One combined quote request for ${quoteItems.length} product${quoteItems.length > 1 ? 's' : ''} will be sent. Share your details and we'll reply with pricing and availability.`)}
              </p>
              <input
                type="text" name="website" value={form.website} onChange={handleChange}
                autoComplete="off" tabIndex="-1" className="qcart-honeypot" aria-hidden="true"
              />
              <label>
                <span>{isAr(isRTL, 'الاسم الكامل *', 'Full Name *')}</span>
                <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Dr. Jane Doe" />
              </label>
              <label>
                <span>{isAr(isRTL, 'البريد الإلكتروني *', 'Email *')}</span>
                <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@hospital.com" />
              </label>
              <label>
                <span>{isAr(isRTL, 'رقم الهاتف', 'Phone')}</span>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+966 5x xxx xxxx" />
              </label>
              <label>
                <span>{isAr(isRTL, 'المنشأة / المستشفى', 'Facility / Hospital')}</span>
                <input type="text" name="facility" value={form.facility} onChange={handleChange} placeholder="King Faisal Hospital" />
              </label>
              <label>
                <span>{isAr(isRTL, 'ملاحظات إضافية', 'Additional Notes')}</span>
                <textarea name="message" rows={3} value={form.message} onChange={handleChange}
                  placeholder={isAr(isRTL, 'الكميات، الجدول الزمني للتسليم...', 'Quantities, delivery timeline...')} />
              </label>
              <div className="qcart-form-actions">
                <button type="button" className="qcart-btn qcart-btn--secondary" onClick={() => setShowForm(false)}>
                  {isAr(isRTL, 'رجوع', 'Back')}
                </button>
                <button type="submit" className="qcart-btn qcart-btn--primary" disabled={submitting}>
                  {submitting ? (isAr(isRTL, 'جارٍ الإرسال…', 'Sending…')) : (isAr(isRTL, 'إرسال طلب عرض السعر', 'Send Quote Request'))}
                </button>
              </div>
            </form>
          ) : (
            <div className="qcart-items">
              {quoteItems.map((item) => (
                <div key={item.slug} className="qcart-item">
                  <div className="qcart-item-thumb">
                    {item.image ? (
                      <img src={item.image} alt={item.name} loading="lazy" />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      </svg>
                    )}
                  </div>
                  <div className="qcart-item-body">
                    <div className="qcart-item-top">
                      <h4 className="qcart-item-name">{item.name}</h4>
                      <button className="qcart-item-remove" onClick={() => removeFromQuote(item.slug)} aria-label="Remove item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                    {item.mainCategory?.[0] && <p className="qcart-item-cat">{item.mainCategory[0]}</p>}
                    <div className="qcart-qty-ctrl">
                      <button onClick={() => updateQuoteQuantity(item.slug, item.quantity - 1)} aria-label="Decrease quantity">−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuoteQuantity(item.slug, item.quantity + 1)} aria-label="Increase quantity">+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!submitted && quoteItems.length > 0 && !showForm && (
          <footer className="qcart-footer">
            <p className="qcart-footer-note">
              {isAr(isRTL, 'سيتم تجميع كل هذه المنتجات في طلب عرض سعر واحد.', 'All these products will be bundled into one quote request.')}
            </p>
            <button className="qcart-btn qcart-btn--primary" onClick={() => setShowForm(true)}>
              {isAr(isRTL, 'طلب عرض سعر لـ', 'Request Quote for')} {quoteItems.length} {isAr(isRTL, 'منتج', 'item' + (quoteItems.length > 1 ? 's' : ''))}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

function isAr(isRTL, arText, enText) {
  return isRTL ? arText : enText;
}

export default QuoteCartPanel;
