import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword as resetPasswordRequest } from '../services/authService';

/**
 * Computes password strength score 0-4 (reused from useSignup.js pattern).
 */
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '#e2e8f0', width: '0%' };

  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const clamped = Math.min(4, Math.max(1, score));
  const meta = {
    1: { label: 'Weak',        color: '#ef4444', width: '25%'  },
    2: { label: 'Fair',        color: '#f97316', width: '50%'  },
    3: { label: 'Strong',      color: '#eab308', width: '75%'  },
    4: { label: 'Very Strong', color: '#22c55e', width: '100%' },
  };

  return { score: clamped, ...meta[clamped] };
}

/**
 * useResetPassword — Reset password form state machine.
 *
 * Reads `?token=` from URL. If absent, `hasToken` is false and
 * the form should show the invalid-token error state immediately.
 *
 * Returns: token, hasToken, formData, errors, isLoading, isSuccess,
 *          showPassword, showConfirm, passwordStrength,
 *          handleChange, handleSubmit, togglePassword, toggleConfirm
 */
export function useResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const hasToken = token.trim().length > 0;

  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors]           = useState({});
  const [isLoading, setIsLoading]     = useState(false);
  const [isSuccess, setIsSuccess]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  const passwordStrength = getPasswordStrength(formData.newPassword);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name])   setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (errors.server)  setErrors((prev) => ({ ...prev, server: undefined }));
  }

  function validate() {
    const errs = {};

    if (!formData.newPassword) {
      errs.newPassword = 'New password is required.';
    } else if (formData.newPassword.length < 8) {
      errs.newPassword = 'Password must be at least 8 characters.';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your new password.';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await resetPasswordRequest({ token, newPassword: formData.newPassword });
      setIsSuccess(true);
    } catch (err) {
      setErrors({
        server: err.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    token,
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
    togglePassword: () => setShowPassword((p) => !p),
    toggleConfirm:  () => setShowConfirm((p) => !p),
  };
}
