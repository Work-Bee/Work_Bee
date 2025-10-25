import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

const ROLE_CONFIG = {
  jobseeker: {
    label: 'Job Seeker',
    registerLink: '/register/jobseeker',
    registerText: 'Create a job seeker account',
    helperText: 'Sign in to track applications and manage your profile.',
    switchLinks: [
      { path: '/login/employer', text: 'Sign in as an employer' },
      { path: '/login/admin', text: 'Go to admin console' }
    ],
    demoEmail: 'jobseeker@demo.com',
    demoPassword: 'demo123'
  },
  employer: {
    label: 'Employer',
    registerLink: '/register/employer',
    registerText: 'Create an employer account',
    helperText: 'Log in to post jobs and review applicants.',
    switchLinks: [
      { path: '/login/jobseeker', text: 'Sign in as a job seeker' },
      { path: '/login/admin', text: 'Go to admin console' }
    ],
    demoEmail: 'employer@demo.com',
    demoPassword: 'demo123'
  },
  admin: {
    label: 'Admin',
    registerLink: null,
    registerText: null,
    helperText: 'Restricted access. Use the credentials shared by the platform owner.',
    switchLinks: [
      { path: '/login/jobseeker', text: 'Job seeker sign in' },
      { path: '/login/employer', text: 'Employer sign in' }
    ],
    demoEmail: 'admin@demo.com',
    demoPassword: 'admin123'
  }
};

const RoleLoginForm = ({ role }) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, clearError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const safeRole = ROLE_CONFIG[role] ? role : 'jobseeker';
  const config = ROLE_CONFIG[safeRole];
  const isJobseeker = safeRole === 'jobseeker';

  const attemptLogin = async (formData) => {
    clearError();

    const payload = {
      ...formData,
      role: safeRole,
    };

    const result = await login(payload);

    if (result.success) {
      const requestedPath = location.state?.from?.pathname;
      const defaultDestinations = {
        jobseeker: '/jobseeker/home',
        employer: '/employer/home',
        admin: '/admin/dashboard',
      };

      const fallback = defaultDestinations[result.user?.role] || '/';
      const destination =
        requestedPath && requestedPath !== '/' ? requestedPath : fallback;

      navigate(destination, { replace: true });
    }
  };

  const startGoogleLogin = () => {
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5555/api';
    const next = location.state?.from?.pathname || '';
    // Use path relative to api base to ensure /api prefix is preserved
    const url = new URL('auth/google', apiBase);
    url.searchParams.set('role', safeRole);
    if (next) url.searchParams.set('next', next);
    window.location.href = url.toString();
  };

  return (
    <div
      className={
        `relative min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 overflow-hidden`
      }
    >
      {/* Background decorations for jobseeker */}
      {isJobseeker && (
        <>
          <div className="absolute inset-0 grid-overlay opacity-20" />
          <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 bg-gray-800 rounded-full blur-3xl opacity-10" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 bg-gray-800 rounded-full blur-3xl opacity-10" />
        </>
      )}
      <div className="relative z-10 max-w-md w-full">
        <div className={`glass rounded-2xl p-8 shadow-glow animate-bounce-in ${isJobseeker ? 'bg-white/75' : ''} relative`}>
          {/* Close button inside the card -> back to Home */}
          <Link
            to="/"
            aria-label="Close and go to home"
            className="absolute top-4 right-4 z-10 inline-flex items-center justify-center rounded-full p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 text-gray-600 hover:bg-gray-100 focus:ring-black"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
          <div className="text-center">
            <div className="mx-auto h-14 w-14 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-800">
              {config.label} Sign In
            </h2>
            {config.registerLink ? (
              <>
                <p className="mt-2 text-sm text-gray-600">
                  New here?{' '}
                  <Link to={config.registerLink} className="font-medium text-gray-800 hover:text-gray-800">
                    {config.registerText}
                  </Link>
                </p>
                {config.helperText && (
                  <p className="mt-1 text-xs text-gray-500">{config.helperText}</p>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm text-gray-600">{config.helperText}</p>
            )}
            {config.switchLinks?.length > 0 && (
              <div className="mt-3 text-center flex flex-col gap-1">
                {config.switchLinks.map(({ path, text }) => (
                  <Link key={path} to={path} className="text-xs text-gray-500 hover:text-gray-700">
                    {text}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="alert alert-error mt-6">
              <div className="flex">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(attemptLogin)}>
            {/* Google OAuth Button - Show First */}
            <div>
              <button
                type="button"
                onClick={startGoogleLogin}
                className="w-full btn btn-lg flex items-center justify-center gap-3 border-2 border-gray-800 hover:bg-gray-100 transition-all duration-200"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-white">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                    <path fill="#EA4335" d="M12 10.2h10.5c.1.6.1 1.2.1 1.8 0 6-4 10-10.6 10-6.1 0-11-4.9-11-11s4.9-11 11-11c2.9 0 5.3 1.1 7.2 2.8l-2.9 2.8C15.1 4.7 13.7 4 12 4 8.7 4 6 6.7 6 10s2.7 6 6 6c3 0 4.9-1.7 5.4-4.1H12v-1.7z"/>
                  </svg>
                </span>
                <span className="font-medium">Continue with Google</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>

            <div className="rounded-md space-y-4">
              <div>
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  autoComplete="email"
                  className="form-input focus:ring-black focus:border-gray-800"
                  placeholder="Email address"
                />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                                    <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="form-input pr-10 focus:ring-black focus:border-gray-800"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showPassword ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      )}
                    </svg>
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-gray-800 focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-800">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-gray-800 hover:text-gray-800">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-lg bg-gray-800 text-white hover:bg-gray-800 transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner h-5 w-5 mr-2 border-white"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            {config.demoEmail && config.demoPassword && (
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white/80 text-gray-500">Demo account</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      attemptLogin({
                        email: config.demoEmail,
                        password: config.demoPassword,
                      })
                    }
                    className="btn text-sm border-2 border-gray-800 bg-white hover:bg-gray-100"
                  >
                    Use {config.label} Demo
                  </button>
                </div>
                {safeRole === 'admin' && (
                  <p className="mt-3 text-xs text-gray-500 text-center">
                    Demo admin credentials are for evaluation only. Update the password after first login.
                  </p>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RoleLoginForm;
