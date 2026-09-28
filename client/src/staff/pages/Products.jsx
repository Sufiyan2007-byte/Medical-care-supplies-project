import { useEffect, useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useS } from '../strings';
import { api, useLoad } from '../api';

const PAGE = 20;
const EMPTY = { name: '', category_id: '', sku: '', price: '', stock: '', description: '' };
const EMPTY_SET = { piece_count: '', material: '', sterilization: '', tray_case: '' };

export default function Products() {
  const { token } = useAuthContext();
  const { addToast } = useToast();
  const { s, isAr } = useS();

  const [q, setQ] = useState('');
  const [term, setTerm] = useState('');
  const [page, setPage] = useState(1);
  const cats = useLoad(() => api('/api/categories'), []);
  const list = useLoad(
    () => api(`/api/products?limit=${PAGE}&page=${page}${term ? `&search=${encodeURIComponent(term)}` : ''}`),
    [page, term]
  );

  const [modal, setModal] = useState(null); // null | { mode:'add'|'edit', id? }
  const [form, setForm] = useState(EMPTY);
  const [isSet, setIsSet] = useState(false);
  const [setData, setSetData] = useState(EMPTY_SET);
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const categories = cats.data?.categories || [];
  const products = list.data?.products || [];
  const pages = list.data?.pagination?.totalPages || 1;

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setModal(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openAdd = () => {
    setForm({ ...EMPTY, category_id: categories[0]?.id || '' });
    setIsSet(false); setSetData(EMPTY_SET); setFormError(''); setModal({ mode: 'add' });
  };
  const openEdit = (p) => {
    setForm({
      name: p.name, category_id: p.category_id, sku: p.sku || '', description: p.description || '',
      price: p.price != null ? String(Number(p.price)) : '', stock: p.stock != null ? String(p.stock) : '',
    });
    setIsSet(Boolean(p.surgical_set));
    setSetData(p.surgical_set ? {
      piece_count: p.surgical_set.piece_count ?? '', material: p.surgical_set.material || '',
      sterilization: p.surgical_set.sterilization || '', tray_case: p.surgical_set.tray_case || '',
    } : EMPTY_SET);
    setFormError(''); setModal({ mode: 'edit', id: p.id });
  };

  const change = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category_id) return setFormError(s('pr_required'));
    setBusy(true); setFormError('');
    const body = {
      name: form.name.trim(), category_id: Number(form.category_id), sku: form.sku.trim(),
      description: form.description.trim(),
      price: form.price === '' ? null : form.price,
      stock: form.stock === '' ? null : form.stock,
    };
    if (isSet) body.surgical_set = { ...setData };
    try {
      if (modal.mode === 'add') await api('/api/products', { token, method: 'POST', body });
      else await api(`/api/products/${modal.id}`, { token, method: 'PUT', body });
      addToast(modal.mode === 'add' ? s('pr_created') : s('pr_updated'), 'success');
      setModal(null);
      list.reload();
    } catch (err) {
      setFormError(err.message || s('failed'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    try {
      await api(`/api/products/${id}`, { token, method: 'DELETE' });
      addToast(s('pr_deleted'), 'success');
      setConfirmId(null);
      list.reload();
    } catch (err) {
      addToast(err.message || s('failed'), 'error');
    }
  };

  return (
    <>
      <div className="staff-page-head">
        <div><h1>{s('pr_title')}</h1><p>{s('pr_sub')}</p></div>
        <button type="button" className="staff-btn staff-btn--primary" onClick={openAdd} disabled={!categories.length}>+ {s('pr_add')}</button>
      </div>

      <div className="staff-alert staff-alert--info">{s('pr_prices_hidden')}</div>

      <form className="staff-search staff-search--wide" onSubmit={(e) => { e.preventDefault(); setPage(1); setTerm(q.trim()); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={s('search')} aria-label={s('search')} />
      </form>

      {list.loading && <p className="staff-empty">{s('loading')}</p>}
      {list.error && <div className="staff-alert staff-alert--error">{list.error} <button type="button" className="staff-link" onClick={list.reload}>{s('retry')}</button></div>}
      {!list.loading && !list.error && products.length === 0 && <p className="staff-empty">{s('none')}</p>}

      {products.length > 0 && (
        <section className="staff-card staff-table-wrap">
          <table className="staff-table">
            <thead><tr><th>{s('pr_name')}</th><th>{s('pr_sku')}</th><th>{s('pr_category')}</th><th>{s('pr_price')}</th><th>{s('pr_stock')}</th><th /></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}{p.surgical_set && <span className="staff-tag">SET</span>}</td>
                  <td dir="ltr" className="staff-mono">{p.sku || '—'}</td>
                  <td>{p.category?.name || '—'}</td>
                  <td>{p.price != null ? Number(p.price).toFixed(2) : <span className="staff-muted">{s('pr_on_request')}</span>}</td>
                  <td>
                    {p.stock != null ? (
                      p.stock <= 10 ? (
                        <span className={`staff-stock-pill${p.stock === 0 ? ' staff-stock-pill--out' : ''}`}>{p.stock}</span>
                      ) : p.stock
                    ) : (
                      <span className="staff-muted">{s('pr_untracked')}</span>
                    )}
                  </td>
                  <td className="staff-row-actions">
                    <button type="button" className="staff-btn staff-btn--ghost" onClick={() => openEdit(p)}>{s('edit')}</button>
                    {confirmId === p.id ? (
                      <>
                        <button type="button" className="staff-btn staff-btn--danger" onClick={() => remove(p.id)}>{s('yes')}</button>
                        <button type="button" className="staff-btn staff-btn--ghost" onClick={() => setConfirmId(null)}>{s('cancel')}</button>
                      </>
                    ) : (
                      <button type="button" className="staff-btn staff-btn--ghost staff-btn--dangertext" onClick={() => setConfirmId(p.id)}>{s('delete')}</button>
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
            <h2>{modal.mode === 'add' ? s('pr_add_title') : s('pr_edit_title')}</h2>
            {formError && <div className="staff-alert staff-alert--error" role="alert">{formError}</div>}

            <div className="staff-form-grid">
              <div className="staff-field staff-field--wide">
                <label htmlFor="pf-name">{s('pr_name')}</label>
                <input id="pf-name" value={form.name} onChange={change('name')} autoFocus />
              </div>
              <div className="staff-field">
                <label htmlFor="pf-cat">{s('pr_category')}</label>
                <select id="pf-cat" value={form.category_id} onChange={change('category_id')}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="staff-field">
                <label htmlFor="pf-sku">{s('pr_sku')}</label>
                <input id="pf-sku" dir="ltr" value={form.sku} onChange={change('sku')} />
              </div>
              <div className="staff-field">
                <label htmlFor="pf-price">{s('pr_price')}</label>
                <input id="pf-price" dir="ltr" inputMode="decimal" value={form.price} onChange={change('price')} />
                <small>{s('pr_price_hint')}</small>
              </div>
              <div className="staff-field">
                <label htmlFor="pf-stock">{s('pr_stock')}</label>
                <input id="pf-stock" dir="ltr" inputMode="numeric" value={form.stock} onChange={change('stock')} />
                <small>{s('pr_stock_hint')}</small>
              </div>
              <div className="staff-field staff-field--wide">
                <label htmlFor="pf-desc">{s('pr_desc')}</label>
                <textarea id="pf-desc" rows={3} value={form.description} onChange={change('description')} />
              </div>
            </div>

            <label className="staff-check">
              <input type="checkbox" checked={isSet} onChange={(e) => setIsSet(e.target.checked)} />
              <span>{s('pr_is_set')}</span>
            </label>
            {isSet && (
              <div className="staff-form-grid">
                {[['piece_count', 'pr_pieces'], ['material', 'pr_material'], ['sterilization', 'pr_steril'], ['tray_case', 'pr_tray']].map(([k, l]) => (
                  <div className="staff-field" key={k}>
                    <label htmlFor={`ps-${k}`}>{s(l)}</label>
                    <input id={`ps-${k}`} value={setData[k]} onChange={(e) => setSetData((d) => ({ ...d, [k]: e.target.value }))} />
                  </div>
                ))}
              </div>
            )}

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
