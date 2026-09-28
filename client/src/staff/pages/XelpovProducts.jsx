import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useS } from '../strings';
import { api, useLoad } from '../api';

const PAGE = 20;
const EMPTY = {
  name: '', description: '', image: '',
  specialty: '', mainCategory: '', subCategory: '',
  onRequest: true, amount: '',
};

// Small helper: comma-separated text field <-> string[] the JSON file stores.
const toList = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);
const toText = (arr) => (Array.isArray(arr) ? arr.join(', ') : '');

/** Admin panel for the Xelpov surgical-instrument catalogue (client/public/xelpov_products.json). */
export default function XelpovProducts() {
  const { token } = useAuthContext();
  const { addToast } = useToast();
  const { s, isAr } = useS();
  const t = (en, ar) => (isAr ? ar : en);

  const [q, setQ] = useState('');
  const [term, setTerm] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [mainCategory, setMainCategory] = useState('');
  const [page, setPage] = useState(1);

  const meta = useLoad(() => api('/api/xelpov/meta', { token }), []);
  const list = useLoad(
    () => api(
      `/api/xelpov/products?limit=${PAGE}&page=${page}` +
      `${term ? `&search=${encodeURIComponent(term)}` : ''}` +
      `${specialty ? `&specialty=${encodeURIComponent(specialty)}` : ''}` +
      `${mainCategory ? `&mainCategory=${encodeURIComponent(mainCategory)}` : ''}`,
      { token }
    ),
    [page, term, specialty, mainCategory]
  );

  const [modal, setModal] = useState(null); // null | { mode:'add'|'edit', slug? }
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmSlug, setConfirmSlug] = useState(null);

  const products = list.data?.products || [];
  const pages = list.data?.pagination?.totalPages || 1;
  const total = list.data?.pagination?.total ?? meta.data?.total ?? 0;
  const specialties = meta.data?.specialties || [];
  const mainCategories = meta.data?.mainCategories || [];

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setModal(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openAdd = () => { setForm(EMPTY); setFormError(''); setModal({ mode: 'add' }); };
  const openEdit = (p) => {
    setForm({
      name: p.name || '', description: p.description || '', image: p.image || '',
      specialty: toText(p.specialty), mainCategory: toText(p.mainCategory), subCategory: toText(p.subCategory),
      onRequest: p.price?.onRequest !== false, amount: p.price?.amount != null ? String(p.price.amount) : '',
    });
    setFormError(''); setModal({ mode: 'edit', slug: p.slug });
  };

  const change = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setFormError(t('Product name is required.', 'اسم المنتج مطلوب.'));
    setBusy(true); setFormError('');
    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      specialty: toList(form.specialty),
      mainCategory: toList(form.mainCategory),
      subCategory: toList(form.subCategory),
      onRequest: form.onRequest,
      amount: form.onRequest ? null : (form.amount === '' ? null : Number(form.amount)),
    };
    try {
      if (modal.mode === 'add') await api('/api/xelpov/products', { token, method: 'POST', body });
      else await api(`/api/xelpov/products/${modal.slug}`, { token, method: 'PUT', body });
      addToast(modal.mode === 'add' ? t('Product added', 'تمت إضافة المنتج') : t('Product updated', 'تم تحديث المنتج'), 'success');
      setModal(null);
      list.reload();
      meta.reload();
    } catch (err) {
      setFormError(err.message || s('failed'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (slug) => {
    try {
      await api(`/api/xelpov/products/${slug}`, { token, method: 'DELETE' });
      addToast(t('Product deleted', 'تم حذف المنتج'), 'success');
      setConfirmSlug(null);
      list.reload();
    } catch (err) {
      addToast(err.message || s('failed'), 'error');
    }
  };

  return (
    <>
      <div className="staff-page-head">
        <div>
          <h1>{t('Surgical Catalogue', 'كتالوج الأدوات الجراحية')}</h1>
          <p>{t(`${total.toLocaleString()} instruments across the full Xelpov catalogue.`, `${total.toLocaleString()} أداة في كتالوج xelpov الكامل.`)}</p>
        </div>
        <button type="button" className="staff-btn staff-btn--primary" onClick={openAdd}>
          + {t('Add product', 'إضافة منتج')}
        </button>
      </div>

      <form className="staff-search staff-search--wide" onSubmit={(e) => { e.preventDefault(); setPage(1); setTerm(q.trim()); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={s('search')} aria-label={s('search')} />
      </form>

      <div className="staff-form-grid" style={{ marginBottom: '1rem' }}>
        <div className="staff-field">
          <label htmlFor="xc-specialty">{t('Specialty', 'التخصص')}</label>
          <select id="xc-specialty" value={specialty} onChange={(e) => { setPage(1); setSpecialty(e.target.value); }}>
            <option value="">{s('all')}</option>
            {specialties.map((sp) => <option key={sp} value={sp}>{sp}</option>)}
          </select>
        </div>
        <div className="staff-field">
          <label htmlFor="xc-category">{t('Instrument type', 'نوع الأداة')}</label>
          <select id="xc-category" value={mainCategory} onChange={(e) => { setPage(1); setMainCategory(e.target.value); }}>
            <option value="">{s('all')}</option>
            {mainCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {list.loading && <p className="staff-empty">{s('loading')}</p>}
      {list.error && <div className="staff-alert staff-alert--error">{list.error} <button type="button" className="staff-link" onClick={list.reload}>{s('retry')}</button></div>}
      {!list.loading && !list.error && products.length === 0 && <p className="staff-empty">{s('none')}</p>}

      {products.length > 0 && (
        <section className="staff-card staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th></th>
                <th>{t('Name', 'الاسم')}</th>
                <th>{t('Specialty', 'التخصص')}</th>
                <th>{t('Instrument type', 'نوع الأداة')}</th>
                <th>{t('Price', 'السعر')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.slug}>
                  <td>
                    {p.image
                      ? <img src={p.image} alt="" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 6, background: 'rgba(255,255,255,.06)' }} />
                      : <span className="staff-muted">—</span>}
                  </td>
                  <td>{p.name}</td>
                  <td className="staff-muted">{toText(p.specialty) || '—'}</td>
                  <td className="staff-muted">{toText(p.mainCategory) || '—'}</td>
                  <td>{p.price?.onRequest === false && p.price?.amount != null ? p.price.amount : <span className="staff-muted">{t('On request', 'عند الطلب')}</span>}</td>
                  <td className="staff-row-actions">
                    <button type="button" className="staff-btn staff-btn--ghost" onClick={() => openEdit(p)}>{s('edit')}</button>
                    {confirmSlug === p.slug ? (
                      <>
                        <button type="button" className="staff-btn staff-btn--danger" onClick={() => remove(p.slug)}>{s('yes')}</button>
                        <button type="button" className="staff-btn staff-btn--ghost" onClick={() => setConfirmSlug(null)}>{s('cancel')}</button>
                      </>
                    ) : (
                      <button type="button" className="staff-btn staff-btn--ghost staff-btn--dangertext" onClick={() => setConfirmSlug(p.slug)}>{s('delete')}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {pages > 1 && (
        <div className="staff-pager">
          <button type="button" className="staff-btn" disabled={page <= 1} onClick={() => setPage((n) => n - 1)}>{s('pr_prev')}</button>
          <span>{page} / {pages}</span>
          <button type="button" className="staff-btn" disabled={page >= pages} onClick={() => setPage((n) => n + 1)}>{s('pr_next')}</button>
        </div>
      )}

      {modal && (
        <div className="staff-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModal(null)}>
          <form className="staff-modal" onSubmit={submit} noValidate role="dialog" aria-modal="true">
            <h2>{modal.mode === 'add' ? t('Add product', 'إضافة منتج') : t('Edit product', 'تعديل المنتج')}</h2>
            {formError && <div className="staff-alert staff-alert--error" role="alert">{formError}</div>}

            <div className="staff-form-grid">
              <div className="staff-field staff-field--wide">
                <label htmlFor="xf-name">{t('Name', 'الاسم')}</label>
                <input id="xf-name" value={form.name} onChange={change('name')} autoFocus />
              </div>
              <div className="staff-field staff-field--wide">
                <label htmlFor="xf-image">{t('Image path', 'مسار الصورة')}</label>
                <input id="xf-image" dir="ltr" value={form.image} onChange={change('image')} placeholder="/xelpov_images/…" />
              </div>
              <div className="staff-field staff-field--wide">
                <label htmlFor="xf-desc">{t('Description', 'الوصف')}</label>
                <textarea id="xf-desc" rows={3} value={form.description} onChange={change('description')} />
              </div>
              <div className="staff-field">
                <label htmlFor="xf-specialty">{t('Specialty (comma-separated)', 'التخصص (مفصول بفواصل)')}</label>
                <input id="xf-specialty" value={form.specialty} onChange={change('specialty')} placeholder="Cardiovascular, ENT" />
              </div>
              <div className="staff-field">
                <label htmlFor="xf-maincat">{t('Instrument type (comma-separated)', 'نوع الأداة (مفصول بفواصل)')}</label>
                <input id="xf-maincat" value={form.mainCategory} onChange={change('mainCategory')} placeholder="Forceps, Retractors" />
              </div>
              <div className="staff-field staff-field--wide">
                <label htmlFor="xf-subcat">{t('Sub-category (comma-separated)', 'الفئة الفرعية (مفصول بفواصل)')}</label>
                <input id="xf-subcat" value={form.subCategory} onChange={change('subCategory')} />
              </div>
              <div className="staff-field">
                <label htmlFor="xf-amount">{t('Price', 'السعر')}</label>
                <input id="xf-amount" dir="ltr" inputMode="decimal" value={form.amount} onChange={change('amount')} disabled={form.onRequest} />
                <small>{t('Only used when "Price on request" is off.', 'يُستخدم فقط عند إيقاف "السعر عند الطلب".')}</small>
              </div>
            </div>

            <label className="staff-check">
              <input type="checkbox" checked={form.onRequest} onChange={(e) => setForm((f) => ({ ...f, onRequest: e.target.checked }))} />
              <span>{t('Price on request', 'السعر عند الطلب')}</span>
            </label>

            <div className="staff-modal-actions">
              <button type="button" className="staff-btn" onClick={() => setModal(null)}>{s('cancel')}</button>
              <button type="submit" className="staff-btn staff-btn--primary" disabled={busy}>{busy ? s('loading') : s('save')}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
