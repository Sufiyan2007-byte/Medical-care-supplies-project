import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../staff/api';
import './Account.css';

export function AccountTabs() {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');
  return (
    <nav className="account-tabs">
      <NavLink to="/account" end>{isAr ? 'بياناتي' : 'My details'}</NavLink>
      <NavLink to="/account/orders">{isAr ? 'طلباتي' : 'My orders'}</NavLink>
    </nav>
  );
}

export default function Account() {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');
  const tx = (ar, en) => (isAr ? ar : en);
  const { token, user, updateUser } = useAuthContext();
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: user?.name || '', phone: '', city: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api('/api/account', { token })
      .then(({ user: u }) => alive && setForm({ name: u.name || '', phone: u.phone || '', city: u.city || '', address: u.address || '' }))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [token]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { user: u } = await api('/api/account', { token, method: 'PATCH', body: form });
      updateUser({ ...user, name: u.name });
      addToast(tx('تم حفظ بياناتك', 'Your details were saved'), 'success');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="account-page">
      <header className="account-head">
        <h1>{tx('حسابي', 'My account')}</h1>
        <p>{tx('احفظ بيانات التوصيل ليتم تعبئتها تلقائياً عند الطلب.', 'Save your delivery details so checkout fills them in for you.')}</p>
      </header>
      <AccountTabs />

      <form className="account-card" onSubmit={save} noValidate>
        {error && <div className="account-error" role="alert">{error}</div>}
        <div className="account-grid">
          <div className="account-field account-field--wide">
            <label htmlFor="ac-email">{tx('البريد الإلكتروني', 'Email')}</label>
            <input id="ac-email" dir="ltr" value={user?.email || ''} disabled />
          </div>
          <div className="account-field">
            <label htmlFor="ac-name">{tx('الاسم الكامل / المنشأة', 'Full name / facility')}</label>
            <input id="ac-name" value={form.name} onChange={set('name')} disabled={loading} />
          </div>
          <div className="account-field">
            <label htmlFor="ac-phone">{tx('رقم الجوال', 'Phone')}</label>
            <input id="ac-phone" dir="ltr" inputMode="tel" value={form.phone} onChange={set('phone')} disabled={loading} />
          </div>
          <div className="account-field">
            <label htmlFor="ac-city">{tx('المدينة', 'City')}</label>
            <input id="ac-city" value={form.city} onChange={set('city')} disabled={loading} />
          </div>
          <div className="account-field account-field--wide">
            <label htmlFor="ac-address">{tx('العنوان / المبنى / الحي', 'Street address / building / district')}</label>
            <input id="ac-address" value={form.address} onChange={set('address')} disabled={loading} />
          </div>
        </div>
        <button type="submit" className="account-btn" disabled={busy || loading}>{busy ? tx('جارٍ الحفظ…', 'Saving…') : tx('حفظ', 'Save')}</button>
      </form>
    </div>
  );
}
