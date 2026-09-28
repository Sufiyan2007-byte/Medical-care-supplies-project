import { useAuthContext } from '../../context/AuthContext';
import { useS } from '../strings';
import { api, useLoad } from '../api';
import { fmtDate } from '../../utils/orderStatus';

export default function Messages() {
  const { token } = useAuthContext();
  const { s, isAr } = useS();
  const { data, loading, error, reload } = useLoad(() => api('/api/contact/messages', { token }), [token]);
  const list = data?.messages || [];

  return (
    <>
      <div className="staff-page-head">
        <div><h1>{s('ms_title')}</h1><p>{s('ms_sub')}</p></div>
        <button type="button" className="staff-btn" onClick={reload}>{s('refresh')}</button>
      </div>
      {loading && <p className="staff-empty">{s('loading')}</p>}
      {error && <div className="staff-alert staff-alert--error">{error}</div>}
      {!loading && !error && list.length === 0 && <p className="staff-empty">{s('none')}</p>}
      <div className="staff-messages">
        {list.map((m) => (
          <article key={m.id} className="staff-card staff-message">
            <header>
              <div>
                <strong>{m.name}</strong>
                <a dir="ltr" href={`mailto:${m.email}`} className="staff-link">{m.email}</a>
              </div>
              <span className="staff-muted">{fmtDate(isAr, m.created_at)}</span>
            </header>
            <p className="staff-pre">{m.message}</p>
            <a className="staff-btn staff-btn--ghost" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: your message to Medical Care Supplies')}`}>{s('ms_reply')}</a>
          </article>
        ))}
      </div>
    </>
  );
}
