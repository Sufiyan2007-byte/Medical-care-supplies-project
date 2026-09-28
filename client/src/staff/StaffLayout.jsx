import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useS } from './strings';
import './staff.css';
import { logoSrc } from '../utils/themes';

const I = (d) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const ICON = {
  overview: I(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>),
  orders: I(<><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></>),
  products: I(<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>),
  catalogue: I(<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>),
  messages: I(<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>),
  users: I(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
  system: I(<><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></>),
  site: I(<><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>),
  out: I(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>),
  menu: I(<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>),
};

export default function StaffLayout() {
  const { user, logout } = useAuthContext();
  const { s, isAr, i18n } = useS();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const role = user?.role === 'developer' ? 'developer' : 'admin';

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [isAr, i18n.language]);

  const items = [
    ['/staff', 'overview', 'nav_overview', true],
    ['/staff/orders', 'orders', 'nav_orders'],
    ['/staff/products', 'products', 'nav_products'],
    ['/staff/catalogue', 'catalogue', 'nav_xelpov'],
    ['/staff/messages', 'messages', 'nav_messages'],
    ...(role === 'developer'
      ? [['/staff/users', 'users', 'nav_users'], ['/staff/system', 'system', 'nav_system']]
      : []),
  ];

  return (
    <div className="staff-app" data-role={role}>
      {open && <div className="staff-backdrop" onClick={() => setOpen(false)} />}

      <aside className={`staff-side${open ? ' is-open' : ''}`}>
        <div className="staff-brand">
          <img src={logoSrc()} alt="Medical Care Supplies" />
          <span className={`staff-badge staff-badge--${role}`}>{s(role)}</span>
        </div>
        <nav className="staff-nav" aria-label={s('panel')}>
          {items.map(([to, icon, label, end]) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `staff-nav-link${isActive ? ' is-active' : ''}`}>
              {ICON[icon]}<span>{s(label)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="staff-side-foot">
          <Link to="/" className="staff-nav-link">{ICON.site}<span>{s('view_site')}</span></Link>
          <button type="button" className="staff-nav-link" onClick={() => i18n.changeLanguage(isAr ? 'en' : 'ar')}>
            {ICON.site}<span>{s('language')}</span>
          </button>
          <button type="button" className="staff-nav-link" onClick={logout}>{ICON.out}<span>{s('sign_out')}</span></button>
        </div>
      </aside>

      <div className="staff-main">
        <header className="staff-top">
          <button type="button" className="staff-menu-btn" onClick={() => setOpen(true)} aria-label={s('menu')}>{ICON.menu}</button>
          <span className="staff-top-title">{s('panel')}</span>
          <div className="staff-user">
            <span className="staff-user-name">{user?.name || user?.email}</span>
            <span className={`staff-badge staff-badge--${role}`}>{s(role)}</span>
          </div>
        </header>
        <main className="staff-content"><Outlet /></main>
      </div>
    </div>
  );
}
