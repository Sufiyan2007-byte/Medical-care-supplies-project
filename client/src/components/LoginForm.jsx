import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import './LoginForm.css';
import { logoSrc } from '../utils/themes';

/**
 * LoginForm — Fully functional login form component.
 *
 * Features:
 *  - Email + password fields with inline validation
 *  - Server error / unverified-account (amber) banners
 *  - Show / hide password toggle
 *  - Animated submit button with spinner
 *  - Shake animation on validation failure
 *  - Links to forgot-password and signup pages
 */
function LoginForm() {
  const { t } = useTranslation();
  const {
    formData,
    errors,
    isLoading,
    showPassword,
    handleChange,
    handleSubmit,
    togglePassword,
  } = useAuth();

  // Trigger shake on the form box whenever a new validation error appears
  const [isShaking, setIsShaking] = useState(false);
  const prevErrors = useRef({});

  useEffect(() => {
    const hasNewFieldError =
      (errors.email && !prevErrors.current.email) ||
      (errors.password && !prevErrors.current.password);

    if (hasNewFieldError) {
      setIsShaking(true);
      const t = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(t);
    }
    prevErrors.current = errors;
  }, [errors]);

  const bannerVariant = errors.serverVariant || 'error';

  return (
    <div className={`lf ${isShaking ? 'lf--shake' : ''}`} id="login-form-root">
      {/* ── Brand Logo Badge (Shown on Mobile screens where sidebar is hidden) ── */}
      <div className="auth-mobile-logo">
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
          <div className="auth-highlight-logo">
            <img 
              src={logoSrc()} 
              alt="Medical Care Supplies Logo" 
              className="auth-highlight-logo-img" 
            />
            <span className="auth-logo-name">Medical Care Supplies</span>
          </div>
        </Link>
      </div>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="lf__header">
        <div className="lf__eyebrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>{t('auth.login_eyebrow')}</span>
        </div>
        <h1 className="lf__title">{t('auth.login_title')}</h1>
        <p className="lf__subtitle">
          {t('auth.login_subtitle')}
        </p>
      </div>

      {/* ── Server Error / Unverified Banner ───────────────── */}
      {errors.server && (
        <div
          className={`lf__banner lf__banner--${bannerVariant}`}
          role="alert"
          aria-live="assertive"
          id="login-server-error"
        >
          <span className="lf__banner-icon" aria-hidden="true">
            {bannerVariant === 'warning' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            )}
          </span>
          <div className="lf__banner-text">
            <span>{errors.server}</span>
            {bannerVariant === 'warning' && (
              <Link
                to="/auth/resend-verification"
                className="lf__banner-resend"
              >
                {t('auth.resend_verification')}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Form ───────────────────────────────────────────── */}
      <form
        className="lf__form"
        onSubmit={handleSubmit}
        noValidate
        aria-label="Login form"
      >
        {/* Email */}
        <div className="lf__field">
          <label htmlFor="login-email" className="lf__label">
            {t('auth.email_label')}
          </label>
          <div className="lf__input-wrap">
            <input
              id="login-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('auth.email_placeholder')}
              autoComplete="email"
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
              className={`lf__input ${errors.email ? 'lf__input--error' : ''}`}
              disabled={isLoading}
            />
            <span className="lf__input-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </span>
          </div>
          {errors.email && (
            <span
              className="lf__field-error"
              id="login-email-error"
              role="alert"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginEnd: '0.2rem' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {errors.email}
            </span>
          )}
        </div>

        {/* Password */}
        <div className="lf__field">
          <div className="lf__password-row">
            <label htmlFor="login-password" className="lf__label">
              {t('auth.password_label')}
            </label>
            <Link
              to="/auth/forgot-password"
              className="lf__forgot-link"
              id="login-forgot-password-link"
              tabIndex={0}
            >
              {t('auth.forgot_password_link')}
            </Link>
          </div>
          <div className="lf__input-wrap">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('auth.password_placeholder')}
              autoComplete="current-password"
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? 'login-password-error' : undefined
              }
              className={`lf__input lf__input--password ${
                errors.password ? 'lf__input--error' : ''
              }`}
              disabled={isLoading}
            />
            <span className="lf__input-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <button
              type="button"
              className="lf__toggle-btn"
              onClick={togglePassword}
              aria-label={showPassword ? t('auth.hide_password') : t('auth.show_password')}
              id="login-toggle-password"
              tabIndex={0}
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
          {errors.password && (
            <span
              className="lf__field-error"
              id="login-password-error"
              role="alert"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginEnd: '0.2rem' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {errors.password}
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="login-submit-btn"
          className="lf__submit"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <span className="lf__spinner" aria-hidden="true" />
              <span>{t('auth.signing_in')}</span>
            </>
          ) : (
            <>
              <span>{t('auth.sign_in')}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lf__submit-arrow">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </>
          )}
        </button>
      </form>

      {/* ── Footer — sign-up nudge ──────────────────────────── */}
      <p className="lf__footer">
        {t('auth.no_account')}{' '}
        <Link to="/auth/signup" id="login-signup-link">
          {t('auth.create_account')}
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;

