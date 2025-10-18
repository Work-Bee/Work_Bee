import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../utils/api';

const roleDestinations = {
  jobseeker: '/jobseeker/home',
  employer: '/employer/home',
  admin: '/admin/dashboard',
};

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('Finishing sign-in...');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const role = params.get('role') || 'jobseeker';

    const finish = async () => {
      if (!token) {
        setMessage('Missing token. Please try signing in again.');
        setTimeout(() => navigate('/login/jobseeker'), 1500);
        return;
      }

      try {
        // Store token for axios interceptor
        localStorage.setItem('token', token);

        // Load user profile
        const resp = await authAPI.getProfile();
        const user = resp?.data?.data?.user;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        const dest = roleDestinations[user?.role || role] || '/';
        navigate(dest, { replace: true });
      } catch (err) {
        console.error('OAuth callback error:', err);
        setMessage('Could not complete sign-in. Please try again.');
        setTimeout(() => navigate('/login/jobseeker'), 1500);
      }
    };

    finish();
  }, [location.search, navigate]);

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
