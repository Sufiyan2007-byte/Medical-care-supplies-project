import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resendVerification as resendVerificationRequest } from '../services/authService';

/**
 * useResendVerification — Hook managing state for resending email verification.
 */
export function useResendVerification() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail]               = useState(initialEmail);
  const [error, setError]               = useState('');
  const [errorVariant, setErrorVariant] = useState('error'); // 'error' | 'warning'
  const [isLoading, setIsLoading]       = useState(false);
  const [isSuccess, setIsSuccess]       = useState(false);

  function handleChange(e) {
    setEmail(e.target.value);
    if (error) setError('');
  }

  function validate() {
    if (!email.trim()) {
      setError('Email address is required.');
      setErrorVariant('error');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      setErrorVariant('error');
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setError('');

    try {
      await resendVerificationRequest({ email: email.trim() });
      setIsSuccess(true);
    } catch (err) {
      // 429 Too Many Requests -> Warning amber style for cooldown
      const isRateLimited = err.status === 429;
      setErrorVariant(isRateLimited ? 'warning' : 'error');
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return {
    email,
    error,
    errorVariant,
    isLoading,
    isSuccess,
    handleChange,
    handleSubmit,
  };
}
