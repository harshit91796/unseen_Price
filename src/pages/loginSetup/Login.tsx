import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, sendOtp, verifyOtp } from '../../Api';
import { useAppDispatch } from '../../redux/hooks/hooks';
import { setUser } from '../../redux/user/userSlice';
import './Auth.css';

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

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
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
    } catch (error) {
      setError('Login failed. Please check your email and password.');
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
    window.location.href = `http://localhost:3007/api/auth/${provider}`;

    
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="login-method-toggle">
          <button onClick={() => setLoginMethod('email')} className={loginMethod === 'email' ? 'active' : ''}>Email</button>
          <button onClick={() => setLoginMethod('phone')} className={loginMethod === 'phone' ? 'active' : ''}>Phone</button>
        </div>
        {loginMethod === 'email' ? (
          <form onSubmit={handleEmailLogin}>
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <button type="submit">Login</button>
          </form>
        ) : (
          <div>
            <input type="tel" name="phoneNumber" placeholder="Phone Number" onChange={handleChange} required />
            {!otpSent ? (
              <button onClick={handleSendOtp}>Send OTP</button>
            ) : (
              <>
                <input type="text" name="otp" placeholder="Enter OTP" onChange={handleChange} required />
                <button onClick={handleVerifyOtp}>Verify OTP</button>
              </>
            )}
          </div>
        )}
        <div className="oauth-buttons">
          <button onClick={() => handleOAuthLogin('google')} className="google-btn">Login with Google</button>
          <button onClick={() => handleOAuthLogin('facebook')} className="facebook-btn">Login with Facebook</button>
        </div>
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
};

export default Login;