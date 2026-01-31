import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../redux/hooks/hooks';
import { setUser } from '../../redux/user/userSlice';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const userString = params.get('user');

      if (token && userString) {
        try {
          const user = JSON.parse(decodeURIComponent(userString));
          console.log('OAuthCallback: Parsed user object:', user);
          localStorage.setItem('authToken', token);
          dispatch(setUser(user));
          setStatus('success');
          navigate('/', { replace: true }); // Navigate to the home page
        } catch (error) {
          console.error('OAuthCallback: Error parsing user data:', error);
          setStatus('error');
        }
      } else {
        setStatus('error');
      }
    };

    handleCallback();
  }, [dispatch, navigate]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'error') {
    return <div>An error occurred during login. Please try again.</div>;
  }

  return null;
};

export default OAuthCallback;
