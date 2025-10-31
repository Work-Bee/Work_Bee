import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleDestinations = {
  jobseeker: '/jobseeker/home',
  employer: '/employer/home',
  admin: '/admin/dashboard',
};

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getProfile } = useAuth();
  const [message, setMessage] = useState('Finishing sign-in...');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const role = params.get('role') || 'jobseeker';

    const finish = async () => {
      if (!token) {
        console.error('No token found in URL');
        setMessage('Missing token. Please try signing in again.');
        setTimeout(() => navigate('/login/jobseeker'), 1500);
        return;
      }

      console.log('Token received:', token.substring(0, 20) + '...');
      console.log('Role from URL:', role);

      try {
        // Store token for axios interceptor
        localStorage.setItem('token', token);
        console.log('Token stored in localStorage');

        // Load user profile and update AuthContext
        console.log('Calling getProfile...');
        const result = await getProfile();
        console.log('getProfile result:', result);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to load profile');
        }

        const user = result.user;
        console.log('User loaded:', user);
        
        const dest = roleDestinations[user?.role || role] || '/';
        console.log('Navigating to:', dest);
        
        navigate(dest, { replace: true });
      } catch (err) {
        console.error('OAuth callback error:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        
        setMessage('Could not complete sign-in. Please try again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/login/jobseeker'), 2000);
      }
    };

    finish();
  }, [location.search, navigate, getProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-primary-600 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 018-8v3m4 1a8 8 0 11-8 14.32" />
          </svg>
        </div>
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
