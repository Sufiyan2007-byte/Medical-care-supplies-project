import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useResetPassword } from '../hooks/useResetPassword';
import './ResetPasswordForm.css';
import { logoSrc } from '../utils/themes';

/**
 * ResetPasswordForm — Three conditional states:
 *  1. Invalid / missing token  → error card
 *  2. Form                     → password + confirm + strength meter
 *  3. Success                  → confirmation + Go to login
 */
function ResetPasswordForm() {
  const { t } = useTranslation();
  const {
    hasToken,
    formData,
    errors,
    isLoading,
    isSuccess,
    showPassword,
    showConfirm,
    passwordStrength,
    handleChange,
    handleSubmit,
    togglePassword,
    toggleConfirm,
  } = useResetPassword();

  // Shake on new field-level errors
  const [isShaking, setIsShaking] = useState(false);
  const prevErrors = useRef({});

  useEffect(() => {
    const keys = ['newPassword', 'confirmPassword'];
    const hasNew = keys.some((k) => errors[k] && !prevErrors.current[k]);
    if (hasNew) {
      setIsShaking(true);
      const t = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(t);
    }
    prevErrors.current = errors;
  }, [errors]);

  /* ── State 1: Missing / invalid token ─────────────────────────────── */
  if (!hasToken) {
    return (
      <div className="rpf__invalid" id="reset-password-invalid">
        <span className="rpf__invalid-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </span>
        <div>
          <h1 className="rpf__invalid-title">{t('auth.reset_invalid_title')}</h1>
          <p className="rpf__invalid-msg">
            {t('auth.reset_invalid_msg')}
          </p>
        </div>
        <Link
          to="/auth/forgot-password"
          id="reset-password-request-new-link"
          className="rpf__cta"
        >
          {t('auth.reset_request_new')}
        </Link>
        <Link
          to="/auth/login"
          id="reset-password-invalid-back-link"
          className="rpf__back-link"
        >
          {t('auth.reset_back_login')}
        </Link>
      </div>
    );
  }

  /* ── State 3: Success ──────────────────────────────────────────────── */
  if (isSuccess) {
    return (
      <div className="rpf__success" id="reset-password-success">
        <span className="rpf__success-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
        <div>
          <h1 className="rpf__success-title">{t('auth.reset_success_title')}</h1>
          <p className="rpf__success-msg">
            {t('auth.reset_success_msg')}
          </p>
        </div>
        <Link
          to="/auth/login"
          id="reset-password-go-to-login"
          className="rpf__cta"
        >
          {t('auth.reset_go_login')}
        </Link>
      </div>
    );
  }

  /* ── State 2: Form ────────────────────────────────────────────────── */
  return (
    <div
      className={`rpf ${isShaking ? 'rpf--shake' : ''}`}
      id="reset-password-form-root"
    >
      {/* Header */}
      {/* ── Mobile Logo ── */}
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

      <div className="rpf__header">
        <div className="rpf__eyebrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>{t('auth.reset_eyebrow')}</span>
        </div>
        <h1 className="rpf__title">{t('auth.reset_title')}</h1>
        <p className="rpf__subtitle">
          {t('auth.reset_subtitle')}
        </p>
      </div>

      {/* Server error banner */}
      {errors.server && (
        <div
          className="rpf__banner rpf__banner--error"
          role="alert"
          aria-live="assertive"
          id="reset-password-server-error"
        >
          <span className="rpf__banner-icon" aria-hidden="true">⚠️</span>
          <span>{errors.server}</span>
        </div>
      )}

      <form
        className="rpf__form"
        onSubmit={handleSubmit}
        noValidate
        aria-label="Reset password form"
      >
        {/* New password */}
        <div className="rpf__field">
          <label htmlFor="reset-new-password" className="rpf__label">
            {t('auth.reset_new_password_label')}
          </label>
          <div className="rpf__input-wrap">
            <input
              id="reset-new-password"
              type={showPassword ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder={t('auth.password_placeholder')}
              autoComplete="new-password"
              aria-required="true"
              aria-invalid={!!errors.newPassword}
              aria-describedby={
                errors.newPassword
                  ? 'reset-new-password-error'
                  : formData.newPassword
                  ? 'reset-strength-label'
                  : undefined
              }
              className={`rpf__input rpf__input--password ${
                errors.newPassword ? 'rpf__input--error' : ''
              }`}
              disabled={isLoading}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
            <span className="rpf__input-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
            <button
              type="button"
              className="rpf__toggle-btn"
              onClick={togglePassword}
              aria-label={showPassword ? t('auth.hide_password') : t('auth.show_password')}
              id="reset-toggle-password"
            >
              {showPassword ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>

          {/* Strength meter */}
          {formData.newPassword && (
            <div className="rpf__strength" aria-live="polite">
              <div className="rpf__strength-track">
                <div
                  className="rpf__strength-fill"
                  style={{
                    width: passwordStrength.width,
                    backgroundColor: passwordStrength.color,
                  }}
                />
              </div>
              <p
                className="rpf__strength-label"
                id="reset-strength-label"
                style={{ color: passwordStrength.color }}
              >
                {passwordStrength.label}
              </p>
            </div>
          )}

          {errors.newPassword && (
            <span className="rpf__field-error" id="reset-new-password-error" role="alert">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginEnd: "0.2rem" }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> {errors.newPassword}
            </span>
          )}
        </div>

        {/* Confirm password */}
        <div className="rpf__field">
          <label htmlFor="reset-confirm-password" className="rpf__label">
            {t('auth.reset_confirm_password_label')}
          </label>
          <div className="rpf__input-wrap">
            <input
              id="reset-confirm-password"
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={t('auth.reset_confirm_placeholder')}
              autoComplete="new-password"
              aria-required="true"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword ? 'reset-confirm-error' : undefined
              }
              className={`rpf__input rpf__input--password ${
                errors.confirmPassword ? 'rpf__input--error' : ''
              }`}
              disabled={isLoading}
            />
            <span className="rpf__input-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
            <button
              type="button"
              className="rpf__toggle-btn"
              onClick={toggleConfirm}
              aria-label={showConfirm ? t('auth.hide_password') : t('auth.show_password')}
              id="reset-toggle-confirm"
            >
              {showConfirm ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="rpf__field-error" id="reset-confirm-error" role="alert">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginEnd: "0.2rem" }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> {errors.confirmPassword}
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="reset-password-submit-btn"
          className="rpf__submit"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <span className="rpf__spinner" aria-hidden="true" />
              <span>{t('auth.resetting_password')}</span>
            </>
          ) : (
            <>
              <span>{t('auth.reset_password')}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rpf__submit-arrow">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </>
          )}
        </button>

        <Link
          to="/auth/login"
          id="reset-password-back-link"
          className="rpf__back-link"
        >
          {t('auth.reset_back_login')}
        </Link>
      </form>
    </div>
  );
}

export default ResetPasswordForm;

