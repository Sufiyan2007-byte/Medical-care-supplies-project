import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useS } from '../strings';
import { api, useLoad } from '../api';
import { statusLabel, fmtDate, money } from '../../utils/orderStatus';

export default function Overview() {
  const { token, user } = useAuthContext();
  const { s, isAr } = useS();
  const orders = useLoad(() => api('/api/orders', { token }), [token]);
  const messages = useLoad(() => api('/api/contact/messages', { token }), [token]);
  const lowStock = useLoad(() => api('/api/products/low-stock', { token }), [token]);

  const list = orders.data?.orders || [];
  const lowStockProducts = lowStock.data?.products || [];
  const today = new Date().toDateString();
  const stats = [
    [s('ov_pending'), list.filter((o) => o.status === 'pending').length, '/staff/orders'],
    [s('ov_today'), list.filter((o) => new Date(o.created_at).toDateString() === today).length, '/staff/orders'],
    [s('ov_needs_quote'), list.filter((o) => o.needs_quote && o.status !== 'cancelled').length, '/staff/orders'],
    [s('ov_low_stock'), lowStock.loading ? '…' : lowStockProducts.length, '/staff/products'],
    [s('ov_messages'), messages.data?.messages?.length ?? '—', '/staff/messages'],
  ];

  return (
    <>
      <div className="staff-page-head">
        <div>
          <h1>{s('ov_title')}</h1>
          <p>{s('ov_hello')}, {user?.name || user?.email}</p>
        </div>
      </div>

      <div className="staff-stats">
        {stats.map(([label, value, to]) => (
          <Link key={label} to={to} className="staff-stat">
            <span className="staff-stat-value">{orders.loading && typeof value === 'number' ? '…' : value}</span>
            <span className="staff-stat-label">{label}</span>
          </Link>
        ))}
      </div>

      <section className="staff-card">
        <div className="staff-card-head">
          <h2>{s('ov_recent')}</h2>
          <Link to="/staff/orders" className="staff-link">{s('ov_open_orders')}</Link>
        </div>
        {orders.error && <div className="staff-alert staff-alert--error">{orders.error}</div>}
        {!orders.loading && !orders.error && list.length === 0 && <p className="staff-empty">{s('none')}</p>}
        {list.length > 0 && (
          <div className="staff-table-wrap">
            <table className="staff-table">
              <thead><tr><th>#</th><th>{s('or_customer')}</th><th>{s('or_date')}</th><th>{s('or_total')}</th><th>{s('or_status')}</th></tr></thead>
              <tbody>
                {list.slice(0, 6).map((o) => (
                  <tr key={o.id}>
                    <td dir="ltr" className="staff-mono">{o.order_number}</td>
                    <td>{o.customer_name}</td>
                    <td>{fmtDate(isAr, o.created_at)}</td>
                    <td>{o.total != null ? money(isAr, o.total) : <span className="staff-muted">{s('or_needs_quote')}</span>}</td>
                    <td><span className={`status-pill status-pill--${o.status}`}>{statusLabel(isAr, o.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="staff-card">
        <div className="staff-card-head">
          <h2>{s('ov_low_stock')}</h2>
          <Link to="/staff/products" className="staff-link">{s('ov_manage_products')}</Link>
        </div>
        <p className="staff-card-sub">{s('ov_low_stock_sub')}</p>
        {lowStock.error && <div className="staff-alert staff-alert--error">{lowStock.error}</div>}
        {!lowStock.loading && !lowStock.error && lowStockProducts.length === 0 && (
          <p className="staff-empty">{s('ov_low_stock_empty')}</p>
        )}
        {lowStockProducts.length > 0 && (
          <div className="staff-table-wrap">
            <table className="staff-table">
              <thead><tr><th>{s('pr_name')}</th><th>{s('pr_sku')}</th><th>{s('pr_category')}</th><th>{s('pr_stock')}</th></tr></thead>
              <tbody>
                {lowStockProducts.slice(0, 10).map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td dir="ltr" className="staff-mono">{p.sku || '—'}</td>
                    <td>{p.category?.name || '—'}</td>
                    <td>
                      <span className={`staff-stock-pill${p.stock === 0 ? ' staff-stock-pill--out' : ''}`}>
                        {p.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
