import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useResetPassword } from '../hooks/useResetPassword';
import './ResetPasswordForm.css';

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
        <span className="rpf__invalid-icon" aria-hidden="true">⚠️</span>
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
        <span className="rpf__success-icon" aria-hidden="true">✅</span>
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
      <div className="rpf__header">
        <p className="rpf__eyebrow">
          <span>🔑</span> {t('auth.reset_eyebrow')}
        </p>
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
            <span className="rpf__input-icon" aria-hidden="true">🔒</span>
            <button
              type="button"
              className="rpf__toggle-btn"
              onClick={togglePassword}
              aria-label={showPassword ? t('auth.hide_password') : t('auth.show_password')}
              id="reset-toggle-password"
            >
              {showPassword ? '🙈' : '👁'}
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
              <span aria-hidden="true">⚠</span> {errors.newPassword}
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
            <span className="rpf__input-icon" aria-hidden="true">🔒</span>
            <button
              type="button"
              className="rpf__toggle-btn"
              onClick={toggleConfirm}
              aria-label={showConfirm ? t('auth.hide_password') : t('auth.show_password')}
              id="reset-toggle-confirm"
            >
              {showConfirm ? '🙈' : '👁'}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="rpf__field-error" id="reset-confirm-error" role="alert">
              <span aria-hidden="true">⚠</span> {errors.confirmPassword}
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
              {t('auth.resetting_password')}
            </>
          ) : (
            t('auth.reset_password')
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
