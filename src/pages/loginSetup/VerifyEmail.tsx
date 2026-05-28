import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { CheckCircleOutline, ErrorOutline, MarkEmailRead } from '@mui/icons-material';
import { verifyEmail, resendVerificationEmail } from '../../Api';
import { setUser } from '../../redux/user/userSlice';
import { toast } from 'react-toastify';
import './VerifyEmail.css';

const VerifyEmail: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = params.get('token') || '';

  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMsg, setErrorMsg] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  // Ref guard: prevents the verification call from firing twice in React Strict Mode.
  // Without this, the first call succeeds (deletes token) and the second call fails
  // with "Invalid or expired" — overwriting the success state.
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('No verification token in URL. Use the link from your email.');
      return;
    }
    if (hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;

    (async () => {
      try {
        const res = await verifyEmail(token);
        // Auto-login: store token + user, redirect to homepage
        if (res?.token) {
          localStorage.setItem('authToken', res.token);
        }
        if (res?.data) {
          dispatch(setUser(res.data));
          localStorage.setItem('user', JSON.stringify(res.data));
        }
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err?.response?.data?.message || 'Verification link is invalid or expired.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail.trim()) {
      toast.warning('Enter your email to receive a new link');
      return;
    }
    setResending(true);
    try {
      const res = await resendVerificationEmail(resendEmail.trim());
      toast.success(res?.message || 'Verification email sent. Check your inbox.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not send verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-email-page">
      <div className="verify-email-card">
        {status === 'pending' && (
          <>
            <div className="verify-email-spinner" />
            <h1>Verifying your email...</h1>
            <p>Hold on a second.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircleOutline className="verify-email-icon success" />
            <h1>You're verified!</h1>
            <p>Welcome to Unseen Price. You're now logged in.</p>
            <button className="verify-email-btn primary" onClick={() => navigate('/')}>
              Go to homepage
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <ErrorOutline className="verify-email-icon error" />
            <h1>Verification failed</h1>
            <p>{errorMsg}</p>
            <div className="verify-email-resend">
              <p style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                <MarkEmailRead fontSize="small" style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Need a new link?
              </p>
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="Enter your email"
                className="verify-email-input"
              />
              <button
                className="verify-email-btn primary"
                onClick={handleResend}
                disabled={resending}
                style={{ marginTop: '0.5rem' }}
              >
                {resending ? 'Sending...' : 'Send a new link'}
              </button>
            </div>
            <button className="verify-email-btn secondary" onClick={() => navigate('/login')}>
              Back to login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
