import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LockReset, MarkEmailRead } from '@mui/icons-material';
import { forgotPassword } from '../../Api';
import usePageMeta from '../../hooks/usePageMeta';
import './VerifyEmail.css';
import './PasswordReset.css';

const DEFAULT_SENT_MESSAGE = 'If an account exists for that email, we sent a link to reset your password.';

/**
 * Step 1 of password recovery: ask for the email, send the reset link.
 *
 * The confirmation reads the same whether or not the email has an account, so
 * this page cannot be used to find out who is registered.
 */
const ForgotPassword: React.FC = () => {
  usePageMeta({ title: 'Forgot Password', noindex: true });

  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sentMessage, setSentMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim();
    if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSending(true);
    try {
      const res = await forgotPassword(trimmed);
      setSentMessage(res?.message || DEFAULT_SENT_MESSAGE);
    } catch (err: any) {
      // 429 (too many requests) and validation errors come back with a readable message.
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="verify-email-page">
      <div className="verify-email-card">
        {sentMessage ? (
          <>
            <MarkEmailRead className="verify-email-icon success" />
            <h1>Check your email</h1>
            <p>{sentMessage}</p>
            {/* Matches RESET_PASSWORD_TOKEN_MINUTES in the backend User model. */}
            <p className="password-reset-hint">
              The link expires in 30 minutes. If it doesn't arrive, check your spam folder.
            </p>
            <Link to="/login" className="verify-email-btn primary">
              Back to login
            </Link>
            <button
              type="button"
              className="verify-email-btn secondary"
              onClick={() => setSentMessage('')}
            >
              Use a different email
            </button>
          </>
        ) : (
          <>
            <LockReset className="verify-email-icon password-reset-icon" />
            <h1>Forgot your password?</h1>
            <p>Enter the email you signed up with and we'll send you a link to reset it.</p>

            <form onSubmit={handleSubmit} className="password-reset-form" noValidate>
              <label htmlFor="forgot-email" className="password-reset-label">Email</label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="verify-email-input"
                autoComplete="email"
                autoFocus
              />
              {error && <p className="password-reset-error" role="alert">{error}</p>}
              <button type="submit" className="verify-email-btn primary" disabled={sending}>
                {sending ? 'Sending...' : 'Send reset link'}
              </button>
            </form>

            <Link to="/login" className="password-reset-back">Back to login</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
