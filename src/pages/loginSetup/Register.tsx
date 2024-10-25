import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, sendOtp, verifyOtp } from '../../Api';
import { useAppDispatch } from '../../redux/hooks/hooks';
import { setUser } from '../../redux/user/userSlice';
import './Auth.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [registerMethod, setRegisterMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    phoneNumber: '',
    otp: '',
  });
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const userData = await register(formData);
      dispatch(setUser(userData.data));
      navigate('/conversations');
    } catch (error) {
      setError('Registration failed. Please try again.');
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
      navigate('/conversations', { replace: true });
    } catch (error) {
      setError('Invalid OTP. Please try again.');
    }
  };

  const handleOAuthRegister = (provider: string) => {
    window.location.href = `http://localhost:3007/api/auth/${provider}`;
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Register</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="register-method-toggle">
          <button onClick={() => setRegisterMethod('email')} className={registerMethod === 'email' ? 'active' : ''}>Email</button>
          <button onClick={() => setRegisterMethod('phone')} className={registerMethod === 'phone' ? 'active' : ''}>Phone</button>
        </div>
        {registerMethod === 'email' ? (
          <form onSubmit={handleEmailRegister}>
            <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <input type="number" name="age" placeholder="Age" onChange={handleChange} required />
            <button type="submit">Register</button>
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
          <button onClick={() => handleOAuthRegister('google')} className="google-btn">Register with Google</button>
          <button onClick={() => handleOAuthRegister('facebook')} className="facebook-btn">Register with Facebook</button>
        </div>
      </div>
    </div>
  );
};

export default Register;