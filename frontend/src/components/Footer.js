import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { user } = useAuth();
  const role = user?.role || 'guest';

  // Role-aware link sets
  const roleLinks = {
    guest: [
      { label: 'Browse Jobs', to: '/jobs' },
      { label: 'Create Account', to: '/register' },
      { label: 'Job Seeker Login', to: '/login/jobseeker' },
      { label: 'Employer Login', to: '/login/employer' },
    ],
    jobseeker: [
      { label: 'Jobs', to: '/jobs' },
      { label: 'Applications', to: '/applications' },
      { label: 'Bookmarks', to: '/bookmarks' },
      { label: 'My Profile', to: '/profile' },
    ],
    employer: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Post a Job', to: '/employer/jobs/new' },
      { label: 'Company Profile', to: '/dashboard/profile' },
    ],
    admin: [
      { label: 'Admin Dashboard', to: '/admin/dashboard' },
    ],
  };

  const linksForRole = roleLinks[role] || roleLinks.guest;

  return (
    <footer className="bg-gray-900 text-white">
      {/* Accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-700" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <span className="text-xl font-bold">WorkBee</span>
            </div>
            <p className="text-gray-400 text-sm">
              Connecting job seekers with opportunities in unskilled and entry-level positions. 
              Building careers, one job at a time.
            </p>
            {/* Social links (add real accounts when available) */}
            <div className="flex space-x-4 text-gray-500 text-xs">
              <span>Follow us: (coming soon)</span>
            </div>
          </div>

          {/* Role-aware Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {linksForRole.map((link) => (
                <li key={`${role}-${link.label}`}>
                  <Link to={link.to} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} WorkBee. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
            <span>Built for Kochi’s workforce</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;