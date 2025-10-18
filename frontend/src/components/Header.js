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
    <header className="sticky top-0 z-50">
      {/* Accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-700" />
      {/* Glass wrapper */}
      <div className="bg-white/70 backdrop-blur-md border-b border-gray-200/70 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top bar */}
          <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <span className="text-xl font-extrabold text-gradient">WorkBee</span>
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
                      to="/applications"
                      className={`nav-link ${isActive('/applications') ? 'active' : ''}`}
                    >
                      Applications
                    </Link>
                    <Link
                      to="/bookmarks"
                      className={`nav-link ${isActive('/bookmarks') ? 'active' : ''}`}
                    >
                      Bookmarks
                    </Link>
                  </>
                )}
                
                {user.role === 'employer' && (
                  <>
                    <Link
                      to="/dashboard"
                      className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/employer/applications"
                      className={`nav-link ${location.pathname === '/employer/applications' ? 'active' : ''}`}
                    >
                      Applications
                    </Link>
                  </>
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

          {/* Mobile menu button only (profile moved inside panel) */}
          <div className="md:hidden flex items-center">
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

        {/* Mobile Navigation Menu - Slide-in from Right */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/70 z-40 md:hidden transition-opacity duration-300"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Slide-in Panel */}
            <div className="fixed inset-y-0 right-0 h-screen w-64 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out border-l-4 border-purple-300 flex flex-col">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-green-50">
                <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 hover:text-gray-900 focus:outline-none hover:bg-gray-100 rounded-lg p-2 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation Items */}
              <div className="px-4 py-6 space-y-3 overflow-y-auto flex-1 bg-gray-50">
                {/* Profile section inside menu */}
                {user && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-600">
                          {user.name?.charAt(0)?.toUpperCase?.() || 'U'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      {user.role === 'jobseeker' && (
                        <Link
                          to="/profile"
                          className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-green-500 hover:shadow-lg transition-all"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                          My Profile
                        </Link>
                      )}
                      {user.role === 'employer' && (
                        <Link
                          to="/dashboard/profile"
                          className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-green-500 hover:shadow-lg transition-all"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                          Company Profile
                        </Link>
                      )}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-green-500 hover:shadow-lg transition-all"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                        className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
                <Link
                  to={homePath}
                  className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                    isActive(homePath)
                      ? 'bg-gradient-to-r from-purple-500 to-green-500 text-white shadow-lg'
                      : 'text-gray-800 hover:bg-white hover:shadow-md'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                </Link>

                {(!user || user.role === 'jobseeker') && (
                  <Link
                    to="/jobs"
                    className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                      isActive('/jobs')
                        ? 'bg-gradient-to-r from-purple-500 to-green-500 text-white shadow-lg'
                        : 'text-gray-800 hover:bg-white hover:shadow-md'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                    Jobs
                  </Link>
                )}
                
{user && (
                  <>
                    {user.role === 'jobseeker' && (
                      <>
                        <Link
                          to="/applications"
                          className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                            isActive('/applications')
                              ? 'bg-gradient-to-r from-purple-500 to-green-500 text-white shadow-lg'
                              : 'text-gray-800 hover:bg-white hover:shadow-md'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Applications
                        </Link>
                        
                        <Link
                          to="/bookmarks"
                          className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                            isActive('/bookmarks')
                              ? 'bg-gradient-to-r from-purple-500 to-green-500 text-white shadow-lg'
                              : 'text-gray-800 hover:bg-white hover:shadow-md'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                          </svg>
                          Bookmarks
                        </Link>
                        
                        <Link
                          to="/profile"
                          className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                            isActive('/profile')
                              ? 'bg-gradient-to-r from-purple-500 to-green-500 text-white shadow-lg'
                              : 'text-gray-800 hover:bg-white hover:shadow-md'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>
                      </>
                    )}
                    
                    {user.role === 'employer' && (
                      <>
                        <Link
                          to="/dashboard"
                          className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                            location.pathname === '/dashboard'
                              ? 'bg-gradient-to-r from-purple-500 to-green-500 text-white shadow-lg'
                              : 'text-gray-800 hover:bg-white hover:shadow-md'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Dashboard
                        </Link>

                        <Link
                          to="/employer/applications"
                          className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                            location.pathname === '/employer/applications'
                              ? 'bg-gradient-to-r from-purple-500 to-green-500 text-white shadow-lg'
                              : 'text-gray-800 hover:bg-white hover:shadow-md'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Applications
                        </Link>

                        <Link
                          to="/dashboard/profile"
                          className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                            location.pathname === '/dashboard/profile'
                              ? 'bg-gradient-to-r from-purple-500 to-green-500 text-white shadow-lg'
                              : 'text-gray-800 hover:bg-white hover:shadow-md'
                          }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Company Profile
                        </Link>
                      </>
                    )}

                    {user.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                          location.pathname.startsWith('/admin')
                            ? 'bg-gradient-to-r from-purple-500 to-green-500 text-white shadow-lg'
                            : 'text-gray-800 hover:bg-white hover:shadow-md'
                        }`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin Dashboard
                      </Link>
                    )}

                    {/* Single logout lives in profile section above */}
                  </>
                )}

                {!user && (
                  <div className="border-t-2 border-indigo-300 mt-4 pt-4 space-y-2">
                    <Link
                      to="/login/jobseeker"
                      className="flex items-center px-4 py-3.5 rounded-xl text-base font-medium text-gray-800 hover:bg-white hover:shadow-md transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Job Seeker Sign in
                    </Link>
                    <Link
                      to="/login/employer"
                      className="flex items-center px-4 py-3.5 rounded-xl text-base font-medium text-gray-800 hover:bg-white hover:shadow-md transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Employer Sign in
                    </Link>
                    <Link
                      to="/login/admin"
                      className="flex items-center px-4 py-3.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-white hover:shadow-md transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin Console
                    </Link>
                    <Link
                      to="/register"
                      className="flex items-center px-4 py-3.5 rounded-xl text-base font-medium bg-gradient-to-r from-purple-500 to-green-500 text-white hover:from-purple-600 hover:to-green-600 shadow-lg transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </header>
  );
};

export default Header;