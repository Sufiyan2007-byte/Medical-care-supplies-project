import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup as signupRequest } from '../services/authService';

/**
 * Computes password strength score (0–4) and metadata.
 * @param {string} password
 * @returns {{ score: number, label: string, color: string, width: string }}
 */
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '#e2e8f0', width: '0%' };

  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Clamp to 1–4 once something is typed
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
 * useSignup — Signup form state machine.
 *
 * Returns everything SignupForm needs:
 *   formData, errors, isLoading,
 *   showPassword, showConfirm,
 *   passwordStrength,
 *   handleChange, handleCheckbox,
 *   handleSubmit, togglePassword, toggleConfirm
 */
export function useSignup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });
  const [errors, setErrors]           = useState({});
  const [isLoading, setIsLoading]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

  // ── Field change ────────────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name])   setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (errors.server)  setErrors((prev) => ({ ...prev, server: undefined }));
  }

  function handleCheckbox(e) {
    setFormData((prev) => ({ ...prev, acceptedTerms: e.target.checked }));
    if (errors.acceptedTerms) {
      setErrors((prev) => ({ ...prev, acceptedTerms: undefined }));
    }
  }

  // ── Validation ──────────────────────────────────────────────────────────
  function validate() {
    const errs = {};

    if (!formData.name.trim()) {
      errs.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.acceptedTerms) {
      errs.acceptedTerms = 'You must accept the Terms & Privacy Policy to continue.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await signupRequest({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      // Redirect to inbox confirmation — pass email as query param
      navigate(
        `/auth/check-inbox?email=${encodeURIComponent(formData.email.trim())}`
      );
    } catch (err) {
      setErrors({
        server: err.message || 'Something went wrong. Please try again.',
        serverVariant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    formData,
    errors,
    isLoading,
    showPassword,
    showConfirm,
    passwordStrength,
    handleChange,
    handleCheckbox,
    handleSubmit,
    togglePassword: () => setShowPassword((p) => !p),
    toggleConfirm:  () => setShowConfirm((p) => !p),
  };
}
