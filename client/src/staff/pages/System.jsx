import { useAuthContext } from '../../context/AuthContext';
import { useS } from '../strings';
import { api, useLoad } from '../api';

function Row({ label, ok, text, warn }) {
  const tone = ok ? 'ok' : warn ? 'warn' : 'bad';
  return (
    <div className="staff-sys-row">
      <span>{label}</span>
      <span className={`staff-sys-val staff-sys-val--${tone}`}>{text}</span>
    </div>
  );
}

export default function System() {
  const { token } = useAuthContext();
  const { s } = useS();
  const { data: d, loading, error, reload } = useLoad(() => api('/api/staff/system/status', { token }), [token]);

  const up = (sec) => (sec >= 3600 ? `${Math.floor(sec / 3600)} ${s('sy_hours')}` : `${Math.max(1, Math.round(sec / 60))} ${s('sy_min')}`);
  const flag = (v) => (v ? s('sy_set') : s('sy_missing'));

  return (
    <>
      <div className="staff-page-head">
        <div><h1>{s('sy_title')}</h1><p>{s('sy_sub')}</p></div>
        <button type="button" className="staff-btn" onClick={reload}>{s('refresh')}</button>
      </div>
      {loading && <p className="staff-empty">{s('loading')}</p>}
      {error && <div className="staff-alert staff-alert--error">{error}</div>}
      {d && (
        <div className="staff-sys-grid">
          <section className="staff-card">
            <h2>{s('sy_server')}</h2>
            <Row label={s('sy_server')} ok text={s('sy_ok')} />
            <Row label={s('sy_env')} ok text={d.server.environment} />
            <Row label="Node" ok text={d.server.node} />
            <Row label={s('sy_uptime')} ok text={up(d.server.uptime_seconds)} />
          </section>
          <section className="staff-card">
            <h2>{s('sy_database')}</h2>
            <Row label={s('sy_database')} ok={d.database.ok} text={d.database.ok ? s('sy_connected') : s('sy_down')} />
            {d.database.ok && <Row label={s('sy_latency')} ok text={`${d.database.latency_ms} ms`} />}
            {d.database.error && <p className="staff-sys-err" dir="ltr">{d.database.error}</p>}
          </section>
          <section className="staff-card">
            <h2>{s('sy_email')}</h2>
            <Row label={s('sy_brevo')} ok={d.email.brevo_api_key} text={flag(d.email.brevo_api_key)} />
            <Row label={s('sy_admin_email')} ok={d.email.admin_email} warn text={flag(d.email.admin_email)} />
            <Row label={s('sy_order_email')} ok={d.email.order_notify_email} warn text={flag(d.email.order_notify_email)} />
          </section>
          <section className="staff-card">
            <h2>{s('sy_payments')} / {s('sy_security')}</h2>
            <Row label={s('sy_bank')} ok={d.payments.bank_details} warn text={flag(d.payments.bank_details)} />
            <Row label={s('sy_jwt')} ok={d.security.jwt_secret_custom} text={flag(d.security.jwt_secret_custom)} />
          </section>
          <section className="staff-card staff-sys-wide">
            <h2>{s('sy_data')}</h2>
            <div className="staff-sys-counts">
              {[['sy_users', 'users'], ['sy_staff', 'staff'], ['sy_products', 'products'], ['sy_orders', 'orders'], ['sy_pending', 'pending_orders'], ['sy_messages', 'messages']].map(([l, k]) => (
                <div key={k}><strong>{d.counts[k] ?? '—'}</strong><span>{s(l)}</span></div>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
