import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useResendVerification } from '../hooks/useResendVerification';
import './ResendVerificationForm.css';
import { logoSrc } from '../utils/themes';

/**
 * ResendVerificationForm — Form to request a new email verification token.
 */
function ResendVerificationForm() {
  const { t } = useTranslation();
  const {
    email,
    error,
    errorVariant,
    isLoading,
    isSuccess,
    handleChange,
    handleSubmit,
  } = useResendVerification();

  const [isShaking, setIsShaking] = useState(false);
  const prevError = useRef('');

  useEffect(() => {
    if (error && error !== prevError.current) {
      setIsShaking(true);
      const t = setTimeout(() => setIsShaking(false), 500);
      return () => clearTimeout(t);
    }
    prevError.current = error;
  }, [error]);

  /* ── Success state ─────────────────────────────────────────────────── */
  if (isSuccess) {
    return (
      <div className="rvf__success" id="resend-verification-success">
        <span className="rvf__success-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </span>

        <div>
          <h1 className="rvf__success-title">{t('auth.resend_success_title')}</h1>
          <p className="rvf__success-msg">
            {t('auth.resend_success_msg', { email })}
          </p>
        </div>

        <Link
          to="/auth/login"
          id="resend-verification-login-btn"
          className="rvf__back-link"
        >
          {t('auth.reset_back_login')}
        </Link>
      </div>
    );
  }

  /* ── Form state ────────────────────────────────────────────────────── */
  return (
    <div
      className={`rvf ${isShaking ? 'rvf--shake' : ''}`}
      id="resend-verification-form-root"
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

      <div className="rvf__header">
        <div className="rvf__eyebrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.4"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> <span>{t('auth.resend_eyebrow')}</span>
        </div>
        <h1 className="rvf__title">{t('auth.resend_title')}</h1>
        <p className="rvf__subtitle">
          {t('auth.resend_subtitle')}
        </p>
      </div>

      {/* Server error / warning banner */}
      {error && !error.includes('required') && !error.includes('valid email') && (
        <div
          className={`rvf__banner rvf__banner--${errorVariant}`}
          role="alert"
          aria-live="assertive"
          id="resend-verification-server-error"
        >
          <span className="rvf__banner-icon" aria-hidden="true">
            {errorVariant === 'warning' ? '⏳' : '⚠️'}
          </span>
          <span>{error}</span>
        </div>
      )}

      <form
        className="rvf__form"
        onSubmit={handleSubmit}
        noValidate
        aria-label="Resend verification email form"
      >
        {/* Email field */}
        <div className="rvf__field">
          <label htmlFor="resend-email" className="rvf__label">
            {t('auth.email_label')}
          </label>
          <div className="rvf__input-wrap">
            <input
              id="resend-email"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder={t('auth.email_placeholder')}
              autoComplete="email"
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? 'resend-email-error' : undefined}
              className={`rvf__input ${error ? 'rvf__input--error' : ''}`}
              disabled={isLoading}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
            <span className="rvf__input-icon" aria-hidden="true">✉</span>
          </div>
          {error && (error.includes('required') || error.includes('valid email')) && (
            <span
              className="rvf__field-error"
              id="resend-email-error"
              role="alert"
            >
              <span aria-hidden="true">⚠</span> {error}
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="resend-verification-submit-btn"
          className="rvf__submit"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <span className="rvf__spinner" aria-hidden="true" />
              <span>{t('auth.resend_sending')}</span>
            </>
          ) : (
            <>
              <span>{t('auth.resend_btn')}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rvf__submit-arrow">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </>
          )}
        </button>

        {/* Back to login */}
        <Link
          to="/auth/login"
          id="resend-verification-back-link"
          className="rvf__back-link"
        >
          {t('auth.reset_back_login')}
        </Link>
      </form>
    </div>
  );
}

export default ResendVerificationForm;

