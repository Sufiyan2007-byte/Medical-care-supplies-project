import { Link } from 'react-router-dom';
import { useVerifyEmail } from '../hooks/useVerifyEmail';
import './VerifyEmailCard.css';

/**
 * VerifyEmailCard — Renders loading, success, or error card based on verification state.
 */
function VerifyEmailCard() {
  const { status, message } = useVerifyEmail();

  /* ── 1. Loading State ── */
  if (status === 'loading') {
    return (
      <div className="vec" id="verify-email-loading">
        <div className="vec__spinner-box">
          <div className="vec__spinner" role="status" aria-label="Loading" />
          <p className="vec__loading-text">Verifying your email address…</p>
        </div>
      </div>
    );
  }

  /* ── 2. Success State ── */
  if (status === 'success') {
    return (
      <div className="vec" id="verify-email-success">
        <span className="vec__success-icon" aria-hidden="true">✅</span>

        <div>
          <h1 className="vec__success-title">Email Verified!</h1>
          <p className="vec__success-msg">
            {message || 'Your email address has been verified successfully. You can now log in.'}
          </p>
        </div>

        <Link to="/auth/login" id="verify-email-login-btn" className="vec__cta">
          Go to Login →
        </Link>
      </div>
    );
  }

  /* ── 3. Error State ── */
  return (
    <div className="vec" id="verify-email-error">
      <span className="vec__error-icon" aria-hidden="true">⚠️</span>

      <div>
        <h1 className="vec__error-title">Verification Failed</h1>
        <p className="vec__error-msg">
          {message || 'Verification token is invalid or has expired.'}
        </p>
      </div>

      <Link
        to="/auth/resend-verification"
        id="verify-email-resend-btn"
        className="vec__cta"
      >
        Request New Verification Link
      </Link>

      <Link to="/auth/login" id="verify-email-back-login" className="vec__back-link">
        ← Back to login
      </Link>
    </div>
  );
}

export default VerifyEmailCard;
