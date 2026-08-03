import { useState } from 'react';
import { forgotPassword as forgotPasswordRequest } from '../services/authService';

/**
 * useForgotPassword — Forgot password form state machine.
 *
 * Returns: email, error, isLoading, isSubmitted,
 *          handleChange, handleSubmit
 */
export function useForgotPassword() {
  const [email, setEmail]           = useState('');
  const [error, setError]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleChange(e) {
    setEmail(e.target.value);
    if (error) setError('');
  }

  function validate() {
    if (!email.trim()) {
      setError('Email address is required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
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
      // Backend always returns 200 regardless of whether email exists
      // (prevents email enumeration — Issue #17 behaviour)
      await forgotPasswordRequest({ email: email.trim() });
      setIsSubmitted(true);
    } catch (err) {
      // Only genuine network / server failures reach here
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return { email, error, isLoading, isSubmitted, handleChange, handleSubmit };
}
