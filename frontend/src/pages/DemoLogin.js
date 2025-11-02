import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DemoLogin = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'jobseeker';
  const [userType, setUserType] = useState(initialType);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setUserType(initialType);
  }, [initialType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const result = await login({
      email: formData.email,
      password: formData.password,
      role: userType
    });

    if (result.success) {
      const destination = userType === 'jobseeker' ? '/jobseeker/home' : '/employer/home';
      navigate(destination, { replace: true });
    }
  };

  const startGoogleLogin = () => {
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const url = new URL('auth/google', apiBase);
    url.searchParams.set('role', userType);
    window.location.href = url.toString();
  };

  const useDemoAccount = () => {
    // Redirect directly to the appropriate dashboard without login
    const destination = userType === 'jobseeker' ? '/jobseeker/home' : '/employer/home';
    navigate(destination, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Panel */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-800 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-800">WorkBee</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <span>1,200+ jobs posted</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>350+ verified employers</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Avg 3 days to hire</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Header */}
              <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to continue to your account
            </p>
          </div>

          {/* User Type Toggle */}
          <div className="mb-6">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setUserType('jobseeker')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition ${
                  userType === 'jobseeker'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => setUserType('employer')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition ${
                  userType === 'employer'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Employer
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error mb-6">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">Login Failed</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="glass rounded-xl p-8 shadow-soft">
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={startGoogleLogin}
              className="w-full mb-4 flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-800 rounded-lg hover:bg-gray-50 transition bg-white font-medium"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                <path fill="#EA4335" d="M12 10.2h10.5c.1.6.1 1.2.1 1.8 0 6-4 10-10.6 10-6.1 0-11-4.9-11-11s4.9-11 11-11c2.9 0 5.3 1.1 7.2 2.8l-2.9 2.8C15.1 4.7 13.7 4 12 4 8.7 4 6 6.7 6 10s2.7 6 6 6c3 0 4.9-1.7 5.4-4.1H12v-1.7z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Demo Account Button */}
            <button
              type="button"
              onClick={useDemoAccount}
              className="w-full mb-6 flex items-center justify-center gap-3 px-6 py-3 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition bg-white font-medium text-blue-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Try {userType === 'jobseeker' ? 'Job Seeker' : 'Employer'} Demo Account</span>
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Or sign in with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 text-gray-800 border-gray-300 rounded focus:ring-gray-500" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-gray-800 hover:text-gray-600 font-medium">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner h-5 w-5 mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Admin Login Link */}
            {userType === 'employer' && (
              <div className="mt-4 text-center">
                <Link 
                  to="/login/admin"
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Admin Login →
                </Link>
              </div>
            )}
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to={`/register?type=${userType}`}
                className="font-semibold text-gray-800 hover:text-gray-600"
              >
                Create one now
              </Link>
            </p>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoLogin;
