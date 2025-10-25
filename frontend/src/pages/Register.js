import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const Register = () => {
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type');
  const preselectedRole = useMemo(() => (
    ['jobseeker', 'employer'].includes(typeFromUrl) ? typeFromUrl : null
  ), [typeFromUrl]);
  const [selectedRole, setSelectedRole] = useState(preselectedRole);

  const startGoogleLogin = (role) => {
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5555/api';
    // Use path relative to api base to ensure /api prefix is preserved
    const url = new URL('auth/google', apiBase);
    url.searchParams.set('role', role);
    window.location.href = url.toString();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-12 w-12 bg-gray-800 rounded-lg flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-800">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/"
              className="font-medium text-gray-800 hover:text-gray-700"
            >
              go back to homepage
            </Link>
          </p>
        </div>

        {/* Two-step registration */}
        {!selectedRole ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Choose your registration type</h3>
            <p className="text-center text-sm text-gray-600 mb-5">Tell us who you are to continue.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSelectedRole('jobseeker')}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 hover:border-gray-800 block"
              >
                <div className="flex flex-col items-center">
                  <svg className="h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                  <span className="font-medium text-gray-800">I’m a Job Seeker</span>
                  <span className="text-sm text-gray-500 mt-1">Find opportunities and apply</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('employer')}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 hover:border-gray-800 block"
              >
                <div className="flex flex-col items-center">
                  <svg className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-4a2 2 0 012-2h2a2 2 0 012 2v4.01" />
                  </svg>
                  <span className="font-medium text-gray-800">I’m an Employer</span>
                  <span className="text-sm text-gray-500 mt-1">Post jobs and find candidates</span>
                </div>
              </button>
            </div>
            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-800">← Back to homepage</Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
              {selectedRole === 'employer' ? 'Sign up as an Employer' : 'Sign up as a Job Seeker'}
            </h3>
            <p className="text-center text-sm text-gray-600 mb-5">Choose how you want to get started.</p>

            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => startGoogleLogin(selectedRole)}
                className="w-full btn btn-outline flex items-center justify-center gap-2"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-white">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
                    <path fill="#EA4335" d="M12 10.2h10.5c.1.6.1 1.2.1 1.8 0 6-4 10-10.6 10-6.1 0-11-4.9-11-11s4.9-11 11-11c2.9 0 5.3 1.1 7.2 2.8l-2.9 2.8C15.1 4.7 13.7 4 12 4 8.7 4 6 6.7 6 10s2.7 6 6 6c3 0 4.9-1.7 5.4-4.1H12v-1.7z"/>
                  </svg>
                </span>
                <span>Continue with Google</span>
              </button>
              <Link
                to={selectedRole === 'employer' ? '/register/employer' : '/register/jobseeker'}
                className="btn btn-outline w-full text-sm text-center"
              >
                Continue with Email
              </Link>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button type="button" className="text-sm text-gray-600 hover:text-gray-800" onClick={() => setSelectedRole(null)}>
                ← Change registration type
              </button>
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-800">Back to homepage</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
