import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartPanel from '../components/CartPanel';
import './MainLayout.css';

function MainLayout() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, logout } = useAuthContext();
  const { cartCount, setIsCartOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('en') ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="site-wrapper">
      <header className="site-header">
        <Link to="/" className="site-logo" onClick={closeMenu}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0ea5e9', flexShrink: 0 }}>
            <path d="M12 2v20M2 12h20"/>
          </svg>
          MedPortal
        </Link>

        {/* ── Desktop Navigation ─────────────────────────────────── */}
        <nav className="desktop-nav">
          <Link to="/" className="nav-link">{t('nav.home')}</Link>
          <Link to="/about" className="nav-link">{t('nav.about')}</Link>
          
          <div className="nav-dropdown-wrapper">
            <Link to="/products" className="nav-link nav-link-dropdown">
              {t('nav.products')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', verticalAlign: 'middle' }}>
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </Link>
            <div className="nav-dropdown-menu">
              <Link to="/products/surgical-instruments" className="dropdown-item">
                {t('products.title_surgical_instruments', 'Surgical Instruments')}
              </Link>
              <Link to="/products/medical-consumables" className="dropdown-item">
                {t('products.title_medical_consumables', 'Medical Consumables')}
              </Link>
              <Link to="/products/surgical-sets" className="dropdown-item">
                {t('products.title_surgical_sets', 'Surgical Sets')}
              </Link>
            </div>
          </div>

          <Link to="/contact" className="nav-link">{t('nav.contact')}</Link>
          
          {user?.role === 'admin' && (
            <Link to="/admin" className="nav-link-admin">{t('nav.admin_dashboard')}</Link>
          )}

          <button onClick={toggleLanguage} className="lang-switcher">
            {i18n.language.startsWith('en') ? 'العربية' : 'English'}
          </button>

          <button onClick={() => setIsCartOpen(true)} className="nav-cart-btn" aria-label="Open Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="nav-user-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginEnd: '0.3rem' }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {user?.name || user?.email}
              </span>
              <button className="nav-logout-btn" onClick={logout}>{t('nav.logout')}</button>
            </div>
          ) : (
            <Link to="/auth/login" className="nav-signin-btn">{t('nav.sign_in')}</Link>
          )}
        </nav>

        {/* ── Hamburger Toggle (mobile) ──────────────────────────── */}
        <div className="mobile-header-controls">
          <button onClick={() => setIsCartOpen(true)} className="nav-cart-btn mobile-cart-btn" aria-label="Open Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          <button onClick={toggleLanguage} className="lang-switcher mobile-lang">
            {i18n.language.startsWith('en') ? 'ع' : 'EN'}
          </button>
          
          <button
            className={`hamburger-btn ${menuOpen ? 'open' : ''}`}
            aria-label="Toggle mobile menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>

        {/* ── Mobile Navigation Drawer ───────────────────────────── */}
        <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>{t('nav.home')}</Link>
          <Link to="/about" className="nav-link" onClick={closeMenu}>{t('nav.about')}</Link>
          
          <div className="mobile-nav-group">
            <Link to="/products" className="nav-link" onClick={closeMenu}>{t('nav.products')}</Link>
            <div className="mobile-nav-subitems">
              <Link to="/products/surgical-instruments" className="nav-sublink" onClick={closeMenu}>
                {t('products.title_surgical_instruments', 'Surgical Instruments')}
              </Link>
              <Link to="/products/medical-consumables" className="nav-sublink" onClick={closeMenu}>
                {t('products.title_medical_consumables', 'Medical Consumables')}
              </Link>
              <Link to="/products/surgical-sets" className="nav-sublink" onClick={closeMenu}>
                {t('products.title_surgical_sets', 'Surgical Sets')}
              </Link>
            </div>
          </div>

          <Link to="/contact" className="nav-link" onClick={closeMenu}>{t('nav.contact')}</Link>

          {user?.role === 'admin' && (
            <Link to="/admin" className="nav-link-admin" onClick={closeMenu}>{t('nav.admin_dashboard')}</Link>
          )}

          <div className="mobile-nav-auth">
            {isAuthenticated ? (
              <>
                <span className="mobile-user-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginEnd: '0.3rem' }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  {user?.name || user?.email}
                </span>
                <button
                  className="mobile-logout-btn"
                  onClick={() => { logout(); closeMenu(); }}
                >
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <Link to="/auth/login" className="mobile-signin-btn" onClick={closeMenu}>
                {t('nav.sign_in')}
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        {t('footer.rights_reserved', { year: new Date().getFullYear() })}
      </footer>

      <CartPanel />
    </div>
  );
}

export default MainLayout;
