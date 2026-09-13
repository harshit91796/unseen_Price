import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CheckCircleOutline, ErrorOutline, LockReset } from '@mui/icons-material';
import { resetPassword } from '../../Api';
import { clearUser } from '../../redux/user/userSlice';
import usePageMeta from '../../hooks/usePageMeta';
import './VerifyEmail.css';
import './PasswordReset.css';

// Must match PASSWORD_MIN_LENGTH in the backend authService and the signup form.
const MIN_LENGTH = 8;

/**
 * Step 2 of password recovery: the page the emailed link opens.
 * Reads ?token=... from the URL and sets the new password.
 */
const ResetPassword: React.FC = () => {
  usePageMeta({ title: 'Reset Password', noindex: true });

  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const longEnough = password.length >= MIN_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!longEnough) {
      setError(`Password must be at least ${MIN_LENGTH} characters long.`);
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await resetPassword(token, password);
      // The server now rejects every login issued before the reset, including any
      // in this browser. Clear it so the site doesn't look logged in but fail.
      localStorage.removeItem('authToken');
      dispatch(clearUser());
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not reset your password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <div className="verify-email-page">
        <div className="verify-email-card">
          <ErrorOutline className="verify-email-icon error" />
          <h1>This link is incomplete</h1>
          <p>Open the reset link straight from your email, or request a new one.</p>
          <Link to="/forgot-password" className="verify-email-btn primary">Request a new link</Link>
          <Link to="/login" className="password-reset-back">Back to login</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="verify-email-page">
        <div className="verify-email-card">
          <CheckCircleOutline className="verify-email-icon success" />
          <h1>Password updated</h1>
          <p>Your password has been reset. Log in with your new password.</p>
          <button type="button" className="verify-email-btn primary" onClick={() => navigate('/login')}>
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-email-page">
      <div className="verify-email-card">
        <LockReset className="verify-email-icon password-reset-icon" />
        <h1>Choose a new password</h1>
        <p>You'll use this to log in from now on.</p>

        <form onSubmit={handleSubmit} className="password-reset-form" noValidate>
          <label htmlFor="new-password" className="password-reset-label">New password</label>
          <div className="password-reset-field">
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="verify-email-input"
              autoComplete="new-password"
              autoFocus
            />
            <button
              type="button"
              className="password-reset-toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className={`password-reset-rule ${longEnough ? 'met' : ''}`}>
            {longEnough ? '✓ ' : ''}At least {MIN_LENGTH} characters
          </p>

          <label htmlFor="confirm-password" className="password-reset-label">Confirm new password</label>
          <input
            id="confirm-password"
            type={showPassword ? 'text' : 'password'}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="verify-email-input"
            autoComplete="new-password"
          />

          {error && <p className="password-reset-error" role="alert">{error}</p>}

          <button type="submit" className="verify-email-btn primary" disabled={saving}>
            {saving ? 'Saving...' : 'Reset password'}
          </button>
        </form>

        <Link to="/forgot-password" className="password-reset-back">Request a new link</Link>
      </div>
    </div>
  );
};

export default ResetPassword;
