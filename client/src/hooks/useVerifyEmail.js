import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyEmail as verifyEmailRequest } from '../services/authService';

/**
 * useVerifyEmail — Hook handling automated email verification on mount.
 */
export function useVerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [status, setStatus]   = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const hasFired             = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    if (!token.trim()) {
      setStatus('error');
      setMessage('No verification token provided in the link.');
      return;
    }

    async function doVerify() {
      try {
        const res = await verifyEmailRequest({ token: token.trim() });
        setStatus('success');
        setMessage(res.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Invalid or expired verification token.');
      }
    }

    doVerify();
  }, [token]);

  return { token, status, message };
}
