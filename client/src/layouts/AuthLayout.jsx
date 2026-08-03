import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AuthLayout.css';

/**
 * AuthLayout — Split-screen wrapper for all authentication pages.
 *
 * Left panel  : Brand panel with logo, tagline, SFDA accreditation, & stat badges.
 * Right panel : Form panel that renders child routes via <Outlet />.
 */
function AuthLayout() {
  const { t } = useTranslation();

  return (
    <div className="auth-layout">
      {/* ── Left: Brand Panel ──────────────────────────────────── */}
      <aside className="auth-layout__brand">
        {/* Logo */}
        <Link to="/" className="auth-layout__logo" aria-label="MedPortal home">
          <div className="auth-layout__logo-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#fff' }}>
              <path d="M12 2v20M2 12h20"/>
            </svg>
          </div>
          <span className="auth-layout__logo-name">MedPortal</span>
        </Link>

        {/* Hero + headline */}
        <div className="auth-layout__brand-body">
          <div className="auth-layout__hero">
            <div className="auth-layout__hero-circle">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#38bdf8' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
              <div className="auth-layout__hero-orbit" aria-hidden="true" />
            </div>
          </div>

          <div className="auth-layout__headline">
            <h1 className="auth-layout__title">
              {t('auth_layout.brand_title')}
            </h1>
            <p className="auth-layout__subtitle">
              {t('auth_layout.brand_subtitle')}
            </p>
          </div>

          {/* SFDA & Saudi Medical Store Feature Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              padding: '0.5rem 1rem',
              borderRadius: '30px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: '600',
              margin: '0.75rem 0',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </span>
            <span>معتمد لدى الهيئة العامة للغذاء والدواء (SFDA)</span>
          </div>

          {/* Glassmorphism stat badges */}
          <div className="auth-layout__stats" role="list" aria-label="Company highlights">
            <div className="auth-layout__stat" role="listitem">
              <span className="auth-layout__stat-value">{t('auth_layout.stat_products')}</span>
              <span className="auth-layout__stat-label">المستلزمات الطبية</span>
            </div>
            <div className="auth-layout__stat" role="listitem">
              <span className="auth-layout__stat-value">{t('auth_layout.stat_certified')}</span>
              <span className="auth-layout__stat-label">جودة معتمدة</span>
            </div>
            <div className="auth-layout__stat" role="listitem">
              <span className="auth-layout__stat-value">{t('auth_layout.stat_delivery')}</span>
              <span className="auth-layout__stat-label">تجهيز المستشفيات</span>
            </div>
          </div>
        </div>

        {/* Footer credit */}
        <p
          style={{
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.6)',
            margin: 0,
            zIndex: 1,
          }}
        >
          © {new Date().getFullYear()} MedPortal. جميع الحقوق محفوظة.
        </p>
      </aside>

      {/* ── Right: Form Panel ──────────────────────────────────── */}
      <div className="auth-layout__form-panel">
        {/* Top bar */}
        <div className="auth-layout__topbar">
          <Link to="/" className="auth-layout__back-link" aria-label="Back to homepage">
            <span className="auth-layout__back-arrow">←</span>
            {t('auth_layout.back_to_home')}
          </Link>
          <span className="auth-layout__topbar-brand">
            {t('auth_layout.powered_by')} <span>MedPortal</span>
          </span>
        </div>

        {/* Child route renders here */}
        <div className="auth-layout__form-area">
          <div className="auth-layout__form-box">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
