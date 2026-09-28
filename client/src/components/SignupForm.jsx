import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSignup } from '../hooks/useSignup';
import './SignupForm.css';
import { logoSrc } from '../utils/themes';

/**
 * SignupForm — Full registration form.
 *
 * Features:
 *  - Name / Email / Password / Confirm Password fields
 *  - Password strength meter (4-segment colour bar)
 *  - Show/hide toggles for both password fields
 *  - Inline field-level validation errors
 *  - Terms & conditions checkbox (required)
 *  - Server error banner
 *  - Animated submit button with spinner
 *  - Shake on validation failure
 */
function SignupForm() {
  const { t } = useTranslation();
  const {
    formData,
    errors,
    isLoading,
    showPassword,
    showConfirm,
    passwordStrength,
    handleChange,
    handleCheckbox,
    handleSubmit,
    togglePassword,
    toggleConfirm,
  } = useSignup();

  // Shake animation on new validation errors
  const [isShaking, setIsShaking] = useState(false);
  const prevErrors = useRef({});

  useEffect(() => {
    const fieldKeys = ['name', 'email', 'password', 'confirmPassword', 'acceptedTerms'];
    const hasNew = fieldKeys.some(
      (k) => errors[k] && !prevErrors.current[k]
    );
    if (hasNew) {
      setIsShaking(true);
      const t = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(t);
    }
    prevErrors.current = errors;
  }, [errors]);

  return (
    <div className={`sf ${isShaking ? 'sf--shake' : ''}`} id="signup-form-root">
      {/* ── Brand Logo Badge (Mobile only) ──────────────────────── */}
      <div className="auth-mobile-logo">
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
          <div className="auth-highlight-logo">
            <img 
              src={logoSrc()} 
              alt="Medical Care Supplies Logo" 
              className="auth-highlight-logo-img" 
            />
          </div>
        </Link>
      </div>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="sf__header">
        <div className="sf__eyebrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          <span>{t('auth.signup_eyebrow')}</span>
        </div>
        <h1 className="sf__title">{t('auth.signup_title')}</h1>
        <p className="sf__subtitle">
          {t('auth.signup_subtitle')}
        </p>
      </div>

      {/* ── Server Error Banner ─────────────────────────────── */}
      {errors.server && (
        <div
          className="sf__banner sf__banner--error"
          role="alert"
          aria-live="assertive"
          id="signup-server-error"
        >
          <span className="sf__banner-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </span>
          <span>{errors.server}</span>
        </div>
      )}

      {/* ── Form ───────────────────────────────────────────── */}
      <form
        className="sf__form"
        onSubmit={handleSubmit}
        noValidate
        aria-label="Signup form"
      >
        {/* Full Name */}
        <div className="sf__field">
          <label htmlFor="signup-name" className="sf__label">
            {t('auth.name_label')}
          </label>
          <div className="sf__input-wrap">
            <input
              id="signup-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('auth.name_placeholder')}
              autoComplete="name"
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'signup-name-error' : undefined}
              className={`sf__input ${errors.name ? 'sf__input--error' : ''}`}
              disabled={isLoading}
            />
            <span className="sf__input-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
          </div>
          {errors.name && (
            <span className="sf__field-error" id="signup-name-error" role="alert">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginEnd: '0.2rem' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {errors.name}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="sf__field">
          <label htmlFor="signup-email" className="sf__label">
            {t('auth.email_label')}
          </label>
          <div className="sf__input-wrap">
            <input
              id="signup-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('auth.email_placeholder')}
              autoComplete="email"
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'signup-email-error' : undefined}
              className={`sf__input ${errors.email ? 'sf__input--error' : ''}`}
              disabled={isLoading}
            />
            <span className="sf__input-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </span>
          </div>
          {errors.email && (
            <span className="sf__field-error" id="signup-email-error" role="alert">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginEnd: '0.2rem' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {errors.email}
            </span>
          )}
        </div>

        {/* Password */}
        <div className="sf__field">
          <label htmlFor="signup-password" className="sf__label">
            {t('auth.password_label')}
          </label>
          <div className="sf__input-wrap">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('auth.password_placeholder')}
              autoComplete="new-password"
              aria-required="true"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'signup-password-error' : 'signup-strength-label'}
              className={`sf__input sf__input--password ${errors.password ? 'sf__input--error' : ''}`}
              disabled={isLoading}
            />
            <span className="sf__input-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <button
              type="button"
              className="sf__toggle-btn"
              onClick={togglePassword}
              aria-label={showPassword ? t('auth.hide_password') : t('auth.show_password')}
              id="signup-toggle-password"
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>

          {/* Strength meter — shown as soon as user types */}
          {formData.password && (
            <div className="sf__strength" aria-live="polite">
              <div className="sf__strength-track">
                <div
                  className="sf__strength-fill"
                  style={{
                    width: passwordStrength.width,
                    backgroundColor: passwordStrength.color,
                  }}
                />
              </div>
              <p
                className="sf__strength-label"
                id="signup-strength-label"
                style={{ color: passwordStrength.color }}
              >
                {passwordStrength.label}
              </p>
            </div>
          )}

          {errors.password && (
            <span className="sf__field-error" id="signup-password-error" role="alert">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginEnd: '0.2rem' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {errors.password}
            </span>
          )}
        </div>

        {/* Confirm Password */}
        <div className="sf__field">
          <label htmlFor="signup-confirm" className="sf__label">
            {t('auth.confirm_password_label')}
          </label>
          <div className="sf__input-wrap">
            <input
              id="signup-confirm"
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={t('auth.confirm_password_placeholder')}
              autoComplete="new-password"
              aria-required="true"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'signup-confirm-error' : undefined}
              className={`sf__input sf__input--password ${errors.confirmPassword ? 'sf__input--error' : ''}`}
              disabled={isLoading}
            />
            <span className="sf__input-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <button
              type="button"
              className="sf__toggle-btn"
              onClick={toggleConfirm}
              aria-label={showConfirm ? t('auth.hide_password') : t('auth.show_password')}
              id="signup-toggle-confirm"
            >
              {showConfirm ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="sf__field-error" id="signup-confirm-error" role="alert">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginEnd: '0.2rem' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {errors.confirmPassword}
            </span>
          )}
          {!errors.confirmPassword && formData.confirmPassword && formData.confirmPassword === formData.password && (
            <span className="sf__field-match" role="status">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.5" style={{ marginEnd: '0.25rem' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t('auth.passwords_match', 'Passwords match')}
            </span>
          )}
        </div>

        {/* Terms checkbox */}
        <div className="sf__field">
          <label className="sf__terms" htmlFor="signup-terms">
            <input
              id="signup-terms"
              type="checkbox"
              name="acceptedTerms"
              checked={formData.acceptedTerms}
              onChange={handleCheckbox}
              className="sf__checkbox"
              aria-required="true"
              aria-describedby={errors.acceptedTerms ? 'signup-terms-error' : undefined}
              disabled={isLoading}
            />
            <span className="sf__terms-text">
              {t('auth.terms_text_prefix', 'I agree to the')}{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                {t('auth.terms_service', 'Terms of Service')}
              </a>{' '}
              {t('auth.and', 'and')}{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                {t('auth.privacy_policy', 'Privacy Policy')}
              </a>
            </span>
          </label>
          {errors.acceptedTerms && (
            <span className="sf__terms-error" id="signup-terms-error" role="alert">
              {errors.acceptedTerms}
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="signup-submit-btn"
          className="sf__submit"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <span className="sf__spinner" aria-hidden="true" />
              <span>{t('auth.creating_account')}</span>
            </>
          ) : (
            <>
              <span>{t('auth.create_account')}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sf__submit-arrow">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </>
          )}
        </button>
      </form>

      {/* ── Footer ───────────────────────────────────────────── */}
      <p className="sf__footer">
        {t('auth.already_have_account')}{' '}
        <Link to="/auth/login" id="signup-login-link">
          {t('auth.sign_in')}
        </Link>
      </p>
    </div>
  );
}

export default SignupForm;

