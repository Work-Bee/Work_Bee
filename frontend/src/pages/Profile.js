import React from 'react';
import { Link } from 'react-router-dom';

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">User Profile</h1>
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <p className="text-lg text-gray-600 mb-6">
              Profile page coming soon! This will allow job seekers to manage their profile and resume.
            </p>
            <Link to="/" className="btn btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;