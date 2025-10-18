import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmployerProfileWizard from '../components/EmployerProfileWizard';

const EmployerProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    secondaryPhone: '',
    primaryHasWhatsApp: false,
    secondaryHasWhatsApp: false,
    companyDetails: {
      companyName: '',
      officialEmail: '',
      website: '',
      contactPersonRole: '',
      industry: '',
      companySize: '',
      companyAddress: '',
      city: '',
      state: ''
    }
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        secondaryPhone: user.secondaryPhone || '',
        primaryHasWhatsApp: user.primaryHasWhatsApp || false,
        secondaryHasWhatsApp: user.secondaryHasWhatsApp || false,
        companyDetails: {
          companyName: user.companyDetails?.companyName || '',
          officialEmail: user.companyDetails?.officialEmail || '',
          website: user.companyDetails?.website || '',
          contactPersonRole: user.companyDetails?.contactPersonRole || '',
          industry: user.companyDetails?.industry || '',
          companySize: user.companyDetails?.companySize || '',
          companyAddress: user.companyDetails?.companyAddress || '',
          city: user.companyDetails?.city || '',
          state: user.companyDetails?.state || ''
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (searchParams.get('wizard') === '1') {
      setWizardOpen(true);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCompanyDetailsChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      companyDetails: {
        ...prev.companyDetails,
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await userAPI.updateProfile(profile);
      updateUser(response.data.data.user);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to current user data
    setProfile({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      secondaryPhone: user.secondaryPhone || '',
      primaryHasWhatsApp: user.primaryHasWhatsApp || false,
      secondaryHasWhatsApp: user.secondaryHasWhatsApp || false,
      companyDetails: {
        companyName: user.companyDetails?.companyName || '',
        officialEmail: user.companyDetails?.officialEmail || '',
        website: user.companyDetails?.website || '',
        contactPersonRole: user.companyDetails?.contactPersonRole || '',
        industry: user.companyDetails?.industry || '',
        companySize: user.companyDetails?.companySize || '',
        companyAddress: user.companyDetails?.companyAddress || '',
        city: user.companyDetails?.city || '',
        state: user.companyDetails?.state || ''
      }
    });
    setIsEditing(false);
    setError('');
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <EmployerProfileWizard
          open={wizardOpen}
          onClose={() => {
            setWizardOpen(false);
            const next = new URLSearchParams(searchParams);
            next.delete('wizard');
            setSearchParams(next);
          }}
        />
        {/* Header with Illustration */}
        <div className="mb-8 relative bg-gradient-to-br from-purple-50 via-white to-green-50 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-purple-100">
          {/* Decorative circles */}
          <div className="absolute top-6 right-6 w-24 h-24 bg-gradient-to-br from-purple-200 to-green-200 rounded-full opacity-30 blur-xl"></div>
          <div className="absolute bottom-6 left-6 w-16 h-16 bg-gradient-to-br from-green-200 to-purple-200 rounded-full opacity-30 blur-lg"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between relative z-10 space-y-4 lg:space-y-0">
            <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
              {/* Icon illustration */}
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Company Profile</h1>
                <p className="mt-1 text-sm sm:text-base text-gray-600">Manage your company information and settings</p>
                
                {/* Progress indicator dots */}
                <div className="flex items-center mt-2 sm:mt-3 space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500 font-medium">Profile Active</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 bg-purple-500 text-white rounded-xl hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all shadow-md hover:shadow-lg text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              )}
              {!isEditing && (
                <button
                  onClick={() => {
                    setWizardOpen(true);
                    const next = new URLSearchParams(searchParams);
                    next.set('wizard', '1');
                    setSearchParams(next);
                  }}
                  className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 bg-white border-2 border-purple-200 text-gray-700 rounded-xl hover:bg-purple-50 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all shadow-sm hover:shadow-md text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Quick Setup
                </button>
              )}
            </div>
          </div>
        </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Company Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-4 sm:px-6 py-4 bg-purple-50 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Company Information
            </h2>
          </div>
          
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="companyName"
                  value={profile.companyDetails.companyName}
                  onChange={handleCompanyDetailsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  required
                  disabled
                />
              ) : (
                <p className="text-gray-900 font-medium">{profile.companyDetails.companyName || 'Not provided'}</p>
              )}
              {isEditing && <p className="text-xs text-gray-500 mt-1">Company name cannot be changed</p>}
            </div>

            {/* Official Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Official Email <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="officialEmail"
                  value={profile.companyDetails.officialEmail}
                  onChange={handleCompanyDetailsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  required
                  disabled
                />
              ) : (
                <p className="text-gray-900">{profile.companyDetails.officialEmail || 'Not provided'}</p>
              )}
              {isEditing && <p className="text-xs text-gray-500 mt-1">Official email cannot be changed</p>}
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              {isEditing ? (
                <input
                  type="url"
                  name="website"
                  value={profile.companyDetails.website}
                  onChange={handleCompanyDetailsChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">
                  {profile.companyDetails.website ? (
                    <a href={profile.companyDetails.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                      {profile.companyDetails.website}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </p>
              )}
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              {isEditing ? (
                <select
                  name="industry"
                  value={profile.companyDetails.industry}
                  onChange={handleCompanyDetailsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                >
                  <option value="">Select Industry</option>
                  <option value="IT">IT</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Construction">Construction</option>
                  <option value="Education">Education</option>
                  <option value="Food Service">Food Service</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p className="text-gray-900">{profile.companyDetails.industry || 'Not specified'}</p>
              )}
            </div>

            {/* Company Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size
              </label>
              {isEditing ? (
                <select
                  name="companySize"
                  value={profile.companyDetails.companySize}
                  onChange={handleCompanyDetailsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                >
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="200+">200+ employees</option>
                </select>
              ) : (
                <p className="text-gray-900">{profile.companyDetails.companySize || 'Not specified'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Person */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-4 sm:px-6 py-4 bg-green-50 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Contact Person Details
            </h2>
          </div>
          
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Contact Person Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 font-medium">{profile.name || 'Not provided'}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role / Position
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="contactPersonRole"
                  value={profile.companyDetails.contactPersonRole}
                  onChange={handleCompanyDetailsChange}
                  placeholder="e.g., HR Manager, CEO"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.companyDetails.contactPersonRole || 'Not specified'}</p>
              )}
            </div>

            {/* Primary Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Phone
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXXXXXXX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="primaryHasWhatsApp"
                      checked={profile.primaryHasWhatsApp}
                      onChange={handleInputChange}
                      className="rounded text-purple-600 focus:ring-purple-400"
                    />
                    <span className="ml-2 text-sm text-gray-600">Available on WhatsApp</span>
                  </label>
                </div>
              ) : (
                <p className="text-gray-900">
                  {profile.phone || 'Not provided'}
                  {profile.primaryHasWhatsApp && (
                    <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      WhatsApp
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Secondary Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Phone
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="tel"
                    name="secondaryPhone"
                    value={profile.secondaryPhone}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXXXXXXX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="secondaryHasWhatsApp"
                      checked={profile.secondaryHasWhatsApp}
                      onChange={handleInputChange}
                      className="rounded text-purple-600 focus:ring-purple-400"
                    />
                    <span className="ml-2 text-sm text-gray-600">Available on WhatsApp</span>
                  </label>
                </div>
              ) : (
                <p className="text-gray-900">
                  {profile.secondaryPhone || 'Not provided'}
                  {profile.secondaryHasWhatsApp && (
                    <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      WhatsApp
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-4 sm:px-6 py-4 bg-gray-100 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Location Details
            </h2>
          </div>
          
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Company Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Address
              </label>
              {isEditing ? (
                <textarea
                  name="companyAddress"
                  value={profile.companyDetails.companyAddress}
                  onChange={handleCompanyDetailsChange}
                  rows="2"
                  placeholder="Enter full company address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.companyDetails.companyAddress || 'Not provided'}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="city"
                  value={profile.companyDetails.city}
                  onChange={handleCompanyDetailsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.companyDetails.city || 'Not specified'}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="state"
                  value={profile.companyDetails.state}
                  onChange={handleCompanyDetailsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.companyDetails.state || 'Not specified'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </form>
      </div>
    </div>
  );
};

export default EmployerProfile;
