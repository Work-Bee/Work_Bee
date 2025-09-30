import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const homePath = user?.role === 'employer'
    ? '/employer/home'
    : user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'jobseeker'
        ? '/jobseeker/home'
        : '/';

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">JobPortal</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to={homePath}
              className={`nav-link ${isActive(homePath) ? 'active' : ''}`}
            >
              Home
            </Link>
            {(!user || user.role === 'jobseeker') && (
              <Link
                to="/jobs"
                className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}
              >
                Jobs
              </Link>
            )}
            
            {user ? (
              <>
                {user.role === 'jobseeker' && (
                  <>
                    <Link
                      to="/profile"
                      className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/applications"
                      className={`nav-link ${isActive('/applications') ? 'active' : ''}`}
                    >
                      Applications
                    </Link>
                  </>
                )}
                
                {user.role === 'employer' && (
                  <Link
                    to="/dashboard"
                    className={`nav-link ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`}
                  >
                    Dashboard
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                  >
                    Admin Dashboard
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isProfileMenuOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b">
                        {user.email}
                      </div>
                      {user.role === 'jobseeker' && (
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                      )}
                      {user.role === 'employer' && (
                        <Link
                          to="/dashboard/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Company Profile
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login/jobseeker"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Job Seeker Sign in
                </Link>
                <Link
                  to="/login/employer"
                  className="text-gray-600 hover:text-gray-900 font-medium"
                >
                  Employer Sign in
                </Link>
                <Link
                  to="/login/admin"
                  className="text-gray-500 hover:text-gray-800 text-sm"
                >
                  Admin Console
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link
                to={homePath}
                className={`block nav-link ${isActive(homePath) ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {(!user || user.role === 'jobseeker') && (
                <Link
                  to="/jobs"
                  className={`block nav-link ${isActive('/jobs') ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Jobs
                </Link>
              )}
              
              {user ? (
                <>
                  {user.role === 'jobseeker' && (
                    <>
                      <Link
                        to="/profile"
                        className={`block nav-link ${isActive('/profile') ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/applications"
                        className={`block nav-link ${isActive('/applications') ? 'active' : ''}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Applications
                      </Link>
                    </>
                  )}
                  
                  {user.role === 'employer' && (
                    <Link
                      to="/dashboard"
                      className={`block nav-link ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}

                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className={`block nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center px-3 mb-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left nav-link text-red-600 hover:text-red-700"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-200 pt-3 space-y-1">
                  <Link
                    to="/login/jobseeker"
                    className="block nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Job Seeker Sign in
                  </Link>
                  <Link
                    to="/login/employer"
                    className="block nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Employer Sign in
                  </Link>
                  <Link
                    to="/login/admin"
                    className="block nav-link text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Console
                  </Link>
                  <Link
                    to="/register"
                    className="block nav-link text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;