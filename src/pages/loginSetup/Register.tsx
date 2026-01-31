import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, sendOtp, verifyOtp } from '../../Api';
import { useAppDispatch } from '../../redux/hooks/hooks';
import { setUser } from '../../redux/user/userSlice';
import './Auth.css';
import logo from '../../assets/images/l2.png';
import { FaGoogle, FaFacebook, FaApple, FaTwitter } from 'react-icons/fa';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    phoneNumber: '',
    otp: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.email) {
        setError('Email is required');
        return;
      }
      setStep(2);
    }
  };

  const handleFullRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const userData = await register(formData);
      dispatch(setUser(userData.data));
      navigate('/setup/avatar');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleOAuthRegister = (provider: string) => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/${provider}`;
  };

  return (
    <div className="auth-container">
      <div className="left-section">
        <div className="login-logo">
          <img src={logo} alt="Habu" />
        </div>
        
        <div className="auth-content">
          {step === 1 ? (
            <>
              <h2>Take the creative leap!</h2>
              <p>Create an account and discover your next exciting project</p>
              
              <form onSubmit={handleEmailSubmit} className="auth-form">
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Enter your email" 
                  value={formData.email}
                  onChange={handleChange} 
                  required 
                />
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Enter your password" 
                  value={formData.password}
                  onChange={handleChange} 
                  required 
                />
                <input 
                  type="password" 
                  name="confirmPassword" 
                  placeholder="Confirm your password" 
                  value={formData.confirmPassword}
                  onChange={handleChange} 
                  required 
                />
                <input 
                  type="number" 
                  name="age" 
                  placeholder="Enter your age" 
                  value={formData.age}
                  onChange={handleChange} 
                  required 
                />
                <input 
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
                <button type="submit" className="primary-button">Continue</button>
              </form>
              
              <div className="divider">OR</div>
              
              <div className="oauth-buttons">
                <button 
                  onClick={() => handleOAuthRegister('google')} 
                  className="oauth-button"
                >
                  <FaGoogle /> Continue with Google
                </button>
                <button 
                  onClick={() => handleOAuthRegister('apple')} 
                  className="oauth-button"
                >
                  <FaApple /> Continue with Apple
                </button>
                <button 
                  onClick={() => handleOAuthRegister('x')} 
                  className="oauth-button"
                >
                  <FaTwitter /> Continue with X
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>Complete your registration</h2>
              <p>Fill in your details to create your account</p>
              
              <form onSubmit={handleFullRegister} className="auth-form">
                <input 
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <input 
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                />
                <input 
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <input 
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <input 
                  type="number"
                  name="age"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
                <input 
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
                
                {error && <p className="error-message">{error}</p>}
                
                <button type="submit" className="primary-button">
                  Create Account
                </button>
                <button 
                  type="button" 
                  className="secondary-button"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
              </form>
            </>
          )}
          
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign in</Link></p>
            <p className="terms">
              By creating an account, you acknowledge that you have read and agree to our{' '}
              <Link to="/terms">Terms & conditions</Link> and{' '}
              <Link to="/privacy">Privacy Policy</Link>
            </p>
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

export default Register;