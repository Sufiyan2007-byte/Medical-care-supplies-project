import { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useS } from '../strings';
import { api, useLoad } from '../api';
import { fmtDate } from '../../utils/orderStatus';

const ROLES = ['user', 'admin', 'developer'];

export default function Users() {
  const { token, user: me } = useAuthContext();
  const { addToast } = useToast();
  const { s, isAr } = useS();
  const [q, setQ] = useState('');
  const [term, setTerm] = useState('');
  const { data, loading, error, reload, setData } = useLoad(
    () => api(`/api/staff/users${term ? `?q=${encodeURIComponent(term)}` : ''}`, { token }),
    [token, term]
  );
  const [saving, setSaving] = useState(null);
  const users = data?.users || [];

  const changeRole = async (u, role) => {
    if (role === u.role) return;
    setSaving(u.id);
    try {
      const res = await api(`/api/staff/users/${u.id}/role`, { token, method: 'PATCH', body: { role } });
      setData({ users: users.map((x) => (x.id === u.id ? res.user : x)) });
      addToast(s('us_role_updated'), 'success');
    } catch (e) {
      addToast(e.message || s('failed'), 'error');
    } finally {
      setSaving(null);
    }
  };

  return (
    <>
      <div className="staff-page-head">
        <div><h1>{s('us_title')}</h1><p>{s('us_sub')}</p></div>
        <form className="staff-search" onSubmit={(e) => { e.preventDefault(); setTerm(q.trim()); }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={s('search')} aria-label={s('search')} />
        </form>
      </div>
      {loading && <p className="staff-empty">{s('loading')}</p>}
      {error && <div className="staff-alert staff-alert--error">{error} <button type="button" className="staff-link" onClick={reload}>{s('retry')}</button></div>}
      {!loading && !error && users.length === 0 && <p className="staff-empty">{s('none')}</p>}
      {users.length > 0 && (
        <section className="staff-card staff-table-wrap">
          <table className="staff-table">
            <thead><tr><th>{s('us_name')}</th><th>{s('us_email')}</th><th>{s('us_verified')}</th><th>{s('us_joined')}</th><th>{s('us_role')}</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}{u.id === me?.id && <span className="staff-you">{s('us_you')}</span>}</td>
                  <td dir="ltr" className="staff-mono">{u.email}</td>
                  <td>{u.is_verified ? s('us_verified_yes') : <span className="staff-muted">{s('us_verified_no')}</span>}</td>
                  <td>{fmtDate(isAr, u.created_at)}</td>
                  <td>
                    <select value={u.role} disabled={u.id === me?.id || saving === u.id} onChange={(e) => changeRole(u, e.target.value)} aria-label={s('us_role')}>
                      {ROLES.map((r) => <option key={r} value={r}>{s(`role_${r}`)}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
