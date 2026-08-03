import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForgotPassword } from '../hooks/useForgotPassword';
import './ForgotPasswordForm.css';

/**
 * ForgotPasswordForm — Two-state component:
 *   1. Form state  — email input + submit button
 *   2. Success state — generic confirmation message (email-enumeration safe)
 */
function ForgotPasswordForm() {
  const { t } = useTranslation();
  const { email, error, isLoading, isSubmitted, handleChange, handleSubmit } =
    useForgotPassword();

  // Shake on new validation error
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
  if (isSubmitted) {
    return (
      <div className="fpf__success" id="forgot-password-success">
        <span className="fpf__success-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </span>

        <div>
          <h1 className="fpf__success-title">{t('auth.forgot_success_title')}</h1>
          <p className="fpf__success-msg">
            {t('auth.forgot_success_msg', { email })}
          </p>
        </div>

        <div className="fpf__success-note" role="note">
          <strong>Didn&apos;t receive an email?</strong>
          <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.25rem' }}>
            <li>Double-check the email address you entered.</li>
            <li>Check your spam or junk folder.</li>
            <li>
              The link expires in <strong>1 hour</strong> — request a new one
              if needed.
            </li>
          </ul>
        </div>

        <Link
          to="/auth/login"
          id="forgot-password-back-link-success"
          className="fpf__back-link"
        >
          {t('auth.reset_back_login')}
        </Link>
      </div>
    );
  }

  /* ── Form state ────────────────────────────────────────────────────── */
  return (
    <div
      className={`fpf ${isShaking ? 'fpf--shake' : ''}`}
      id="forgot-password-form-root"
    >
      {/* Header */}
      <div className="fpf__header">
        <p className="fpf__eyebrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#FF6600', marginEnd: '0.3rem', verticalAlign: 'middle' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          {t('auth.forgot_eyebrow')}
        </p>
        <h1 className="fpf__title">{t('auth.forgot_title')}</h1>
        <p className="fpf__subtitle">
          {t('auth.forgot_subtitle')}
        </p>
      </div>

      {/* Server error banner */}
      {error && !error.includes('required') && !error.includes('valid email') && (
        <div
          className="fpf__banner"
          role="alert"
          aria-live="assertive"
          id="forgot-password-server-error"
        >
          <span className="fpf__banner-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </span>
          <span>{error}</span>
        </div>
      )}

      <form
        className="fpf__form"
        onSubmit={handleSubmit}
        noValidate
        aria-label="Forgot password form"
      >
        {/* Email field */}
        <div className="fpf__field">
          <label htmlFor="forgot-email" className="fpf__label">
            {t('auth.email_label')}
          </label>
          <div className="fpf__input-wrap">
            <input
              id="forgot-email"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder={t('auth.email_placeholder')}
              autoComplete="email"
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? 'forgot-email-error' : undefined}
              className={`fpf__input ${error ? 'fpf__input--error' : ''}`}
              disabled={isLoading}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
            <span className="fpf__input-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </span>
          </div>
          {error && (
            <span
              className="fpf__field-error"
              id="forgot-email-error"
              role="alert"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginEnd: '0.2rem' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          id="forgot-password-submit-btn"
          className="fpf__submit"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <span className="fpf__spinner" aria-hidden="true" />
              {t('auth.forgot_sending')}
            </>
          ) : (
            t('auth.forgot_btn')
          )}
        </button>

        {/* Back to login */}
        <Link
          to="/auth/login"
          id="forgot-password-back-link"
          className="fpf__back-link"
        >
          {t('auth.reset_back_login')}
        </Link>
      </form>
    </div>
  );
}

export default ForgotPasswordForm;
