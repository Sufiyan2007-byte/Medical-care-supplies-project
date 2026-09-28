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
  const { t, i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');

  const toggleLanguage = () => {
    const nextLang = isAr ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  return (
    <div className="auth-layout" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ── Left: Brand Panel ──────────────────────────────────── */}
      <aside className="auth-layout__brand">
        <div className="auth-layout__brand-glow" aria-hidden="true" />

        {/* Hero + headline */}
        <div className="auth-layout__brand-body">
          <div className="auth-layout__hero">
            <div className="auth-layout__hero-ring" aria-hidden="true" />
            <img
              src="/logo.png"
              alt="Medical Care Supplies"
              className="auth-layout__hero-logo"
            />
          </div>

          <div className="auth-layout__headline">
            <h1 className="auth-layout__title">
              {t('auth_layout.brand_title')}
            </h1>
            <p className="auth-layout__subtitle">
              {t('auth_layout.brand_subtitle')}
            </p>
          </div>

          {/* SFDA & Medical Certification Pill */}
          <div className="auth-sfda-pill">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            <span>{isAr ? 'معتمد ومسجل لدى الهيئة العامة للغذاء والدواء (SFDA)' : 'SFDA Registered & CE Medical Certified'}</span>
          </div>

          {/* Glassmorphism stat badges */}
          <div className="auth-layout__stats" role="list" aria-label="Highlights">
            <div className="auth-layout__stat" role="listitem">
              <span className="auth-layout__stat-value">+500</span>
              <span className="auth-layout__stat-label">{isAr ? 'صنف جراحي وطبي' : 'Medical Products'}</span>
            </div>
            <div className="auth-layout__stat" role="listitem">
              <span className="auth-layout__stat-value">ISO 13485</span>
              <span className="auth-layout__stat-label">{isAr ? 'جودة المستشفيات' : 'Hospital Grade'}</span>
            </div>
            <div className="auth-layout__stat" role="listitem">
              <span className="auth-layout__stat-value">24/48h</span>
              <span className="auth-layout__stat-label">{isAr ? 'توريد سريع بالمملكة' : 'Fast KSA Delivery'}</span>
            </div>
          </div>
        </div>

        {/* Footer credit */}
        <p className="auth-brand-footer">
          © {new Date().getFullYear()} Medical Care Supplies. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
        </p>
      </aside>

      {/* ── Right: Form Panel ──────────────────────────────────── */}
      <div className="auth-layout__form-panel">
        {/* Top bar */}
        <div className="auth-layout__topbar">
          <Link to="/" className="auth-layout__back-link" aria-label="Back to homepage">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="auth-layout__back-arrow"
            >
              {isAr ? (
                <polyline points="9 18 15 12 9 6" />
              ) : (
                <polyline points="15 18 9 12 15 6" />
              )}
            </svg>
            <span>{t('auth_layout.back_to_home')}</span>
          </Link>

          <div className="auth-topbar-actions">
            <button
              type="button"
              className="auth-lang-btn"
              onClick={toggleLanguage}
              title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span>{isAr ? 'English' : 'عربي'}</span>
            </button>
          </div>
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



