import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, sendOtp, verifyOtp } from '../../Api';
import { useAppDispatch } from '../../redux/hooks/hooks';
import { setUser } from '../../redux/user/userSlice';
import './Auth.css';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import logo from '../../assets/images/l2.png';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phoneNumber: '',
    otp: '',
  });
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    try {
      const userData = await login(formData.email, formData.password);
      console.log('User data:', userData);
       if(userData){
        dispatch(setUser(userData.data));
        if(!userData.data.profilePic){
          navigate("/setup/avatar");
        }else{
          navigate("/");
        }
      }
      else{
        setError('Login failed. Please check your email and password.');
      }
    } catch (err: any) {
      const msg: string = err?.response?.data?.message || '';
      if (msg.toLowerCase().includes('verify your email')) {
        setNeedsVerification(true);
        setError(msg);
      } else if (msg.toLowerCase().includes('banned')) {
        setError(msg);
      } else {
        setError('Login failed. Please check your email and password.');
      }
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) return;
    setResendingVerification(true);
    try {
      const { resendVerificationEmail } = await import('../../Api');
      const res = await resendVerificationEmail(formData.email);
      setError(res?.message || 'Verification email sent. Check your inbox.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not send verification email');
    } finally {
      setResendingVerification(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      await sendOtp(formData.phoneNumber);
      setOtpSent(true);
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const userData = await verifyOtp(formData.phoneNumber, formData.otp);
      dispatch(setUser(userData.data));
      navigate('/', { replace: true }); // Change this line to navigate to the home page
    } catch (error) {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleOAuthLogin = (provider: string) => {
    window.location.href = `http://localhost:3000/api/auth/${provider}`;

    
  };

  return (
    <div className="auth-container">
      <div className="left-section">
        <div className="login-logo">
          <img src={logo} alt="Habu" />
          {/* Unseen Price */}
        </div>
        
        <div className="auth-content">
          <h2>Please Enter your Account details</h2>
          {error && <p className="error-message">{error}</p>}
          {needsVerification && (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendingVerification}
              style={{
                marginTop: '0.5rem',
                padding: '0.6rem 1rem',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 600,
                width: '100%'
              }}
            >
              {resendingVerification ? 'Sending...' : 'Resend verification email'}
            </button>
          )}
          
          <form onSubmit={handleEmailLogin} className="auth-form">
            <input 
              type="email" 
              name="email" 
              placeholder="Johndoe@gmail.com" 
              onChange={handleChange} 
              required 
            />
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              onChange={handleChange} 
              required 
            />
            <button type="submit" className="primary-button">Sign in</button>
          </form>
          
          <div className="divider">OR</div>
          
          <div className="oauth-buttons">
            <button onClick={() => handleOAuthLogin('google')} className="oauth-button">
              <FaGoogle /> Continue with Google
            </button>
            <button onClick={() => handleOAuthLogin('apple')} className="oauth-button">
             Continue with Apple
            </button>
            <button onClick={() => handleOAuthLogin('x')} className="oauth-button">
               Continue with X
            </button>
          </div>
          
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Create account</Link></p>
          </div>
        </div>
      </div>

      <div className="right-section">
        <h1>Elevate your Shop&Products and join the elite ranks of top sellers</h1>
        <p>Unlock your creative potential and gain recognition</p>
      </div>
    </div>
  );
};

export default Login;