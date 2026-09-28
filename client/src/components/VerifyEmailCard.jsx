import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useVerifyEmail } from '../hooks/useVerifyEmail';
import './VerifyEmailCard.css';

/**
 * VerifyEmailCard — Renders loading, success, or error card based on verification state.
 */
function VerifyEmailCard() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');
  const { status, message } = useVerifyEmail();

  /* ── 1. Loading State ── */
  if (status === 'loading') {
    return (
      <div className="vec" id="verify-email-loading">
        <div className="vec__spinner-box">
          <div className="vec__spinner" role="status" aria-label="Loading" />
          <p className="vec__loading-text">
            {isAr ? 'جاري التحقق من بريدك الإلكتروني...' : 'Verifying your email address…'}
          </p>
        </div>
      </div>
    );
  }

  /* ── 2. Success State ── */
  if (status === 'success') {
    return (
      <div className="vec" id="verify-email-success">
        <div className="vec__success-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>

        <div>
          <h1 className="vec__success-title">
            {isAr ? 'تم التحقق من البريد الإلكتروني بنجاح!' : 'Email Verified!'}
          </h1>
          <p className="vec__success-msg">
            {message || (isAr ? 'تم التحقق من حسابك بنجاح. يمكنك الآن تسجيل الدخول.' : 'Your email address has been verified successfully. You can now log in.')}
          </p>
        </div>

        <Link to="/auth/login" id="verify-email-login-btn" className="vec__cta">
          {isAr ? 'الذهاب لتسجيل الدخول ←' : 'Go to Login →'}
        </Link>
      </div>
    );
  }

  /* ── 3. Error State ── */
  return (
    <div className="vec" id="verify-email-error">
      <div className="vec__error-icon" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>

      <div>
        <h1 className="vec__error-title">
          {isAr ? 'فشل التحقق من الحساب' : 'Verification Failed'}
        </h1>
        <p className="vec__error-msg">
          {message || (isAr ? 'رابط التحقق غير صالح أو قد انتهت صلاحيته.' : 'Verification token is invalid or has expired.')}
        </p>
      </div>

      <Link
        to="/auth/resend-verification"
        id="verify-email-resend-btn"
        className="vec__cta"
      >
        {isAr ? 'طلب رابط تحقق جديد' : 'Request New Verification Link'}
      </Link>

      <Link to="/auth/login" id="verify-email-back-login" className="vec__back-link">
        {isAr ? '→ العودة لتسجيل الدخول' : '← Back to login'}
      </Link>
    </div>
  );
}

export default VerifyEmailCard;
