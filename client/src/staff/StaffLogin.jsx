import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../services/authService';
import { useAuthContext } from '../context/AuthContext';
import { STAFF_ROLES } from './api';
import { useS } from './strings';
import './staff.css';
import { logoSrc } from '../utils/themes';

export default function StaffLogin() {
  const { s, isAr, i18n } = useS();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, isLoading } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isLoading && isAuthenticated && STAFF_ROLES.includes(user?.role)) {
    return <Navigate to={location.state?.from || '/staff'} replace />;
  }

  const toggleLang = () => i18n.changeLanguage(isAr ? 'en' : 'ar');
  const customerNotice = isAuthenticated && !STAFF_ROLES.includes(user?.role);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) return setError(s('fill_all'));
    setBusy(true);
    try {
      const data = await loginRequest({ email: email.trim(), password });
      if (!STAFF_ROLES.includes(data.user?.role)) {
        setError(s('not_staff'));
        setBusy(false);
        return; // never store a customer session from the staff page
      }
      login(data.token, data.user);
      navigate(location.state?.from || '/staff', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="staff-login-page" data-role="admin">
      <button type="button" className="staff-login-lang" onClick={toggleLang}>{s('language')}</button>
      <form className="staff-login-card" onSubmit={submit} noValidate>
        <img src={logoSrc()} alt="" className="staff-login-logo" />
        <span className="staff-login-tag">{s('panel')}</span>
        <h1>{s('login_title')}</h1>
        <p className="staff-login-sub">{s('login_sub')}</p>

        {(customerNotice || location.state?.denied) && <div className="staff-alert staff-alert--warn">{s('signed_in_customer')}</div>}
        {error && <div className="staff-alert staff-alert--error" role="alert">{error}</div>}

        <label htmlFor="sl-email">{s('email')}</label>
        <input id="sl-email" type="email" dir="ltr" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="sl-pass">{s('password')}</label>
        <div className="staff-pass">
          <input id="sl-pass" type={show ? 'text' : 'password'} dir="ltr" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" onClick={() => setShow((v) => !v)}>{show ? s('hide') : s('show')}</button>
        </div>

        <button type="submit" className="staff-btn staff-btn--primary staff-login-submit" disabled={busy}>
          {busy ? s('signing_in') : s('sign_in')}
        </button>
        <Link to="/" className="staff-login-back">{s('back_to_site')}</Link>
      </form>
    </div>
  );
}
