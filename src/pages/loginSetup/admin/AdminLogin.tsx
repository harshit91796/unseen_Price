import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminPanelSettings, Lock } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { adminLogin } from '../../../Api';
import styles from './AdminLogin.module.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminLogin(credentials.email, credentials.password);
      
      // Check if user has admin role
      if (response.data && response.data.role === 'admin') {
        toast.success('Admin login successful!');
        navigate('/AdminDashboard');
      } else {
        toast.error('Access denied. Admin privileges required.');
        // Clear any token that might have been set
        localStorage.removeItem('adminToken');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      localStorage.removeItem('adminToken');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <AdminPanelSettings className={styles.logo} />
          <h1>Admin Login</h1>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.passwordInput}>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <Lock className={styles.lockIcon} />
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login to Dashboard'}
          </button>
        </form>

        <div className={styles.securityNote}>
          <p>🔒 Secure Admin Access Only</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 