import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const EmployerProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      linkedInPage: '',
      contactPersonRole: '',
      industry: '',
      companySize: '',
      companyAddress: '',
      city: '',
      state: '',
      glassdoorUrl: '',
      otherSocialLink: ''
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
          linkedInPage: user.companyDetails?.linkedInPage || '',
          contactPersonRole: user.companyDetails?.contactPersonRole || '',
          industry: user.companyDetails?.industry || '',
          companySize: user.companyDetails?.companySize || '',
          companyAddress: user.companyDetails?.companyAddress || '',
          city: user.companyDetails?.city || '',
          state: user.companyDetails?.state || '',
          glassdoorUrl: user.companyDetails?.glassdoorUrl || '',
          otherSocialLink: user.companyDetails?.otherSocialLink || ''
        }
      });
    }
  }, [user]);

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
      updateUser(response.data.data);
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
        linkedInPage: user.companyDetails?.linkedInPage || '',
        contactPersonRole: user.companyDetails?.contactPersonRole || '',
        industry: user.companyDetails?.industry || '',
        companySize: user.companyDetails?.companySize || '',
        companyAddress: user.companyDetails?.companyAddress || '',
        city: user.companyDetails?.city || '',
        state: user.companyDetails?.state || '',
        glassdoorUrl: user.companyDetails?.glassdoorUrl || '',
        otherSocialLink: user.companyDetails?.otherSocialLink || ''
      }
    });
    setIsEditing(false);
    setError('');
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
            <p className="mt-2 text-gray-600">Manage your company information and settings</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          )}
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
          <div className="px-6 py-4 bg-gradient-to-r from-primary-50 to-purple-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Company Information
            </h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">
                  {profile.companyDetails.website ? (
                    <a href={profile.companyDetails.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      {profile.companyDetails.website}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </p>
              )}
            </div>

            {/* LinkedIn Page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Page
              </label>
              {isEditing ? (
                <input
                  type="url"
                  name="linkedInPage"
                  value={profile.companyDetails.linkedInPage}
                  onChange={handleCompanyDetailsChange}
                  placeholder="https://linkedin.com/company/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">
                  {profile.companyDetails.linkedInPage ? (
                    <a href={profile.companyDetails.linkedInPage} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      {profile.companyDetails.linkedInPage}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Contact Person Details
            </h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="primaryHasWhatsApp"
                      checked={profile.primaryHasWhatsApp}
                      onChange={handleInputChange}
                      className="rounded text-primary-600 focus:ring-primary-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="secondaryHasWhatsApp"
                      checked={profile.secondaryHasWhatsApp}
                      onChange={handleInputChange}
                      className="rounded text-primary-600 focus:ring-primary-500"
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
          <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Location Details
            </h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{profile.companyDetails.state || 'Not specified'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Additional Links
            </h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Glassdoor URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Glassdoor URL
              </label>
              {isEditing ? (
                <input
                  type="url"
                  name="glassdoorUrl"
                  value={profile.companyDetails.glassdoorUrl}
                  onChange={handleCompanyDetailsChange}
                  placeholder="https://glassdoor.com/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">
                  {profile.companyDetails.glassdoorUrl ? (
                    <a href={profile.companyDetails.glassdoorUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      {profile.companyDetails.glassdoorUrl}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </p>
              )}
            </div>

            {/* Other Social Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Social Link
              </label>
              {isEditing ? (
                <input
                  type="url"
                  name="otherSocialLink"
                  value={profile.companyDetails.otherSocialLink}
                  onChange={handleCompanyDetailsChange}
                  placeholder="Twitter, Facebook, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">
                  {profile.companyDetails.otherSocialLink ? (
                    <a href={profile.companyDetails.otherSocialLink} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      {profile.companyDetails.otherSocialLink}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
  );
};

export default EmployerProfile;
