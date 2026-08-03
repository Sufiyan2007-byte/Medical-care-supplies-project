import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login as loginRequest } from '../services/authService';
import { useAuthContext } from '../context/AuthContext';

/**
 * useAuth — Login form state machine.
 */
export function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: contextLogin } = useAuthContext();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ── Field change handler ─────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (errors.server) {
      setErrors((prev) => ({ ...prev, server: undefined }));
    }
  }

  // ── Client-side validation ────────────────────────────────────────────────
  function validate() {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Form submit ───────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const data = await loginRequest(formData);

      // Update global AuthContext state
      contextLogin(data.token, data.user);

      // Redirect back to intended location or home
      const origin = location.state?.from?.pathname || '/';
      navigate(origin, { replace: true });
    } catch (err) {
      const isUnverified = err.status === 403;
      setErrors({
        server: err.message || 'Something went wrong. Please try again.',
        serverVariant: isUnverified ? 'warning' : 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // ── Password visibility toggle ────────────────────────────────────────────
  function togglePassword() {
    setShowPassword((prev) => !prev);
  }

  return {
    formData,
    errors,
    isLoading,
    showPassword,
    handleChange,
    handleSubmit,
    togglePassword,
  };
}
