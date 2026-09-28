import { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useS } from '../strings';
import { api, useLoad } from '../api';
import { ORDER_STATUSES, statusLabel, fmtDate, money } from '../../utils/orderStatus';

export default function Orders() {
  const { token } = useAuthContext();
  const { addToast } = useToast();
  const { s, isAr } = useS();
  const { data, loading, error, reload, setData } = useLoad(() => api('/api/orders', { token }), [token]);
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [saving, setSaving] = useState(null);

  const orders = data?.orders || [];
  const shown = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  const count = (st) => orders.filter((o) => o.status === st).length;

  const changeStatus = async (order, status) => {
    if (status === order.status) return;
    const before = orders;
    setSaving(order.id);
    setData({ orders: orders.map((o) => (o.id === order.id ? { ...o, status } : o)) });
    try {
      await api(`/api/orders/${order.id}/status`, { token, method: 'PATCH', body: { status } });
      addToast(s('or_status_updated'), 'success');
    } catch (e) {
      setData({ orders: before });
      addToast(e.message || s('failed'), 'error');
    } finally {
      setSaving(null);
    }
  };

  return (
    <>
      <div className="staff-page-head">
        <div><h1>{s('or_title')}</h1><p>{s('or_sub')}</p></div>
        <button type="button" className="staff-btn" onClick={reload}>{s('refresh')}</button>
      </div>

      <div className="staff-chips">
        {['all', ...ORDER_STATUSES].map((st) => (
          <button key={st} type="button" className={`staff-chip${filter === st ? ' is-active' : ''}`} onClick={() => setFilter(st)}>
            {st === 'all' ? s('all') : statusLabel(isAr, st)}
            <em>{st === 'all' ? orders.length : count(st)}</em>
          </button>
        ))}
      </div>

      {loading && <p className="staff-empty">{s('loading')}</p>}
      {error && <div className="staff-alert staff-alert--error">{error} <button type="button" className="staff-link" onClick={reload}>{s('retry')}</button></div>}
      {!loading && !error && shown.length === 0 && <p className="staff-empty">{s('none')}</p>}

      <div className="staff-orders">
        {shown.map((o) => {
          const open = openId === o.id;
          return (
            <article key={o.id} className={`staff-order${open ? ' is-open' : ''}`}>
              <div className="staff-order-row">
                <div className="staff-order-main">
                  <strong dir="ltr" className="staff-mono">{o.order_number}</strong>
                  <span>{o.customer_name}</span>
                  <span className="staff-muted">{fmtDate(isAr, o.created_at)}</span>
                </div>
                <div className="staff-order-meta">
                  <span className="staff-muted">{o.payment_method === 'cod' ? s('or_cod') : s('or_bank')}</span>
                  <span className="staff-order-total">
                    {o.total != null ? money(isAr, o.total) : s('or_needs_quote')}
                    {o.total != null && o.needs_quote && <small className="staff-warn"> · {s('or_needs_quote')}</small>}
                  </span>
                </div>
                <div className="staff-order-actions">
                  <span className={`status-pill status-pill--${o.status}`}>{statusLabel(isAr, o.status)}</span>
                  <select value={o.status} disabled={saving === o.id} onChange={(e) => changeStatus(o, e.target.value)} aria-label={s('or_status')}>
                    {ORDER_STATUSES.map((st) => <option key={st} value={st}>{statusLabel(isAr, st)}</option>)}
                  </select>
                  <button type="button" className="staff-btn staff-btn--ghost" onClick={() => setOpenId(open ? null : o.id)}>
                    {open ? s('hide_details') : s('details')}
                  </button>
                </div>
              </div>

              {open && (
                <div className="staff-order-detail">
                  <dl className="staff-dl">
                    <div><dt>{s('or_phone')}</dt><dd dir="ltr"><a href={`tel:${o.customer_phone}`}>{o.customer_phone}</a></dd></div>
                    <div><dt>{s('or_email')}</dt><dd dir="ltr"><a href={`mailto:${o.customer_email}`}>{o.customer_email}</a></dd></div>
                    <div><dt>{s('or_address')}</dt><dd>{o.city}، {o.address}</dd></div>
                    {o.notes && <div><dt>{s('or_notes')}</dt><dd className="staff-pre">{o.notes}</dd></div>}
                  </dl>
                  <table className="staff-table staff-table--sm">
                    <thead><tr><th>{s('or_items')}</th><th>{s('or_qty')}</th><th>{s('or_total')}</th></tr></thead>
                    <tbody>
                      {o.items.map((i) => (
                        <tr key={i.id}>
                          <td>{i.name}{i.sku && <small className="staff-muted staff-mono" dir="ltr"> {i.sku}</small>}</td>
                          <td>{i.quantity}</td>
                          <td>{i.line_total != null ? money(isAr, i.line_total) : <span className="staff-muted">{s('or_on_request')}</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {o.total != null && (
                    <div className="staff-totals">
                      <span>{s('or_subtotal')}: {money(isAr, o.subtotal)}</span>
                      <span>{s('or_vat')}: {money(isAr, o.vat)}</span>
                      <strong>{s('or_grand')}: {money(isAr, o.total)}</strong>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
