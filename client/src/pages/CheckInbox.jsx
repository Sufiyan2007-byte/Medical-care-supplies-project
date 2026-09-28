import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * CheckInbox — Confirmation page shown after successful signup.
 * Reads `?email=` query param to display the user's address.
 */
function CheckInbox() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || 'your inbox';

  return (
    <div
      id="check-inbox-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1.25rem',
        padding: '1rem 0',
      }}
    >
      {/* Animated envelope */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(var(--accent-rgb), 0.14)',
          border: '2px solid rgba(var(--accent-rgb), 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'auth-float 3.5s ease-in-out infinite',
          boxShadow: '0 8px 24px rgba(var(--accent-rgb), 0.25)',
        }}
        aria-hidden="true"
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      </div>

      {/* Heading */}
      <div>
        <p
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: 'var(--accent-color)',
            marginBottom: '0.6rem',
          }}
        >
          ✅ Account created
        </p>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            color: 'var(--auth-form-text, var(--dark-card))',
            margin: '0 0 0.5rem',
            lineHeight: 1.2,
          }}
        >
          {t('auth.check_inbox_title')}
        </h1>
        <p
          style={{
            fontSize: '0.925rem',
            color: 'var(--auth-form-muted, var(--muted-text))',
            lineHeight: 1.6,
            margin: 0,
            maxWidth: '36ch',
          }}
        >
          {t('auth.check_inbox_msg')}
        </p>
      </div>

      {/* Info card */}
      <div
        style={{
          background: 'rgba(14, 165, 233, 0.06)',
          border: '1px solid rgba(14, 165, 233, 0.2)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          fontSize: '0.85rem',
          color: 'var(--auth-form-muted, var(--muted-text))',
          lineHeight: 1.6,
          textAlign: 'start',
          width: '100%',
        }}
        role="note"
      >
        <strong style={{ color: 'var(--auth-form-text, var(--dark-card))' }}>
          💡 Didn't receive the email?
        </strong>
        <ul style={{ margin: '0.5rem 0 0', paddingInlineStart: '1.25rem' }}>
          <li>Check your spam or junk folder.</li>
          <li>Make sure you entered the right email address.</li>
          <li>
            <Link
              to="/auth/resend-verification"
              id="check-inbox-resend-link"
              style={{ color: 'var(--accent-color)', fontWeight: 600, textDecoration: 'none' }}
            >
              Resend the verification email →
            </Link>
          </li>
        </ul>
      </div>

      {/* Back to login */}
      <Link
        to="/auth/login"
        id="check-inbox-login-link"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--auth-form-muted, var(--muted-text))',
          textDecoration: 'none',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          transition: 'color 0.2s, background 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--accent-color)';
          e.currentTarget.style.background = 'rgba(14,165,233,0.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--auth-form-muted, var(--muted-text))';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        {t('auth.check_inbox_back')}
      </Link>
    </div>
  );
}

export default CheckInbox;

