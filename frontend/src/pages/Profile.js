import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, userAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user: authUser, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    secondaryPhone: '',
    primaryHasWhatsApp: false,
    secondaryHasWhatsApp: false,
    location: '',
    profile: {
      bio: '',
      skills: [],
      experienceLevel: 'Entry Level',
      recentJobs: [],
      preferredLocations: [],
      workPreference: 'Flexible',
      expectedSalary: {
        min: '',
        max: '',
        period: 'month'
      }
    }
  });

  const [newSkill, setNewSkill] = useState('');
  const [newRecentJob, setNewRecentJob] = useState('');
  const [newPreferredLocation, setNewPreferredLocation] = useState('');

  useEffect(() => {
    if (authUser) {
      setFormData({
        name: authUser.name || '',
        phone: authUser.phone || '',
        secondaryPhone: authUser.secondaryPhone || '',
        primaryHasWhatsApp: authUser.primaryHasWhatsApp || false,
        secondaryHasWhatsApp: authUser.secondaryHasWhatsApp || false,
        location: authUser.location || '',
        profile: {
          bio: authUser.profile?.bio || '',
          skills: authUser.profile?.skills || [],
          experienceLevel: authUser.profile?.experienceLevel || 'Entry Level',
          recentJobs: authUser.profile?.recentJobs || [],
          preferredLocations: authUser.profile?.preferredLocations || [],
          workPreference: authUser.profile?.workPreference || 'Flexible',
          expectedSalary: {
            min: authUser.profile?.expectedSalary?.min || '',
            max: authUser.profile?.expectedSalary?.max || '',
            period: authUser.profile?.expectedSalary?.period || 'month'
          }
        }
      });
    }
  }, [authUser]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('profile.expectedSalary.')) {
      const salaryField = name.split('.')[2];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          expectedSalary: {
            ...prev.profile.expectedSalary,
            [salaryField]: value
          }
        }
      }));
    } else if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.profile.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          skills: [...prev.profile.skills, newSkill.trim()]
        }
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        skills: prev.profile.skills.filter(skill => skill !== skillToRemove)
      }
    }));
  };

  const handleAddRecentJob = () => {
    if (newRecentJob.trim() && !formData.profile.recentJobs.includes(newRecentJob.trim())) {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          recentJobs: [...prev.profile.recentJobs, newRecentJob.trim()]
        }
      }));
      setNewRecentJob('');
    }
  };

  const handleRemoveRecentJob = (jobToRemove) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        recentJobs: prev.profile.recentJobs.filter(job => job !== jobToRemove)
      }
    }));
  };

  const handleAddPreferredLocation = () => {
    if (newPreferredLocation.trim() && !formData.profile.preferredLocations.includes(newPreferredLocation.trim())) {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          preferredLocations: [...prev.profile.preferredLocations, newPreferredLocation.trim()]
        }
      }));
      setNewPreferredLocation('');
    }
  };

  const handleRemovePreferredLocation = (locationToRemove) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        preferredLocations: prev.profile.preferredLocations.filter(loc => loc !== locationToRemove)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await authAPI.updateProfile(formData);
      
      if (response.data.success) {
        updateUser(response.data.data.user);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Please upload a PDF or Word document' });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    setUploadingResume(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await userAPI.uploadResume(file);
      
      if (response.data.success) {
        // Refresh user profile to get updated resume info
        const profileResponse = await authAPI.getProfile();
        updateUser(profileResponse.data.data.user);
        setMessage({ type: 'success', text: 'Resume uploaded successfully!' });
        setResumeFile(null);
        setShowResumeUpload(false);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to upload resume' 
      });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async () => {
    setDeletingResume(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await userAPI.deleteResume();
      
      if (response.data.success) {
        // Refresh user profile to remove resume info
        const profileResponse = await authAPI.getProfile();
        updateUser(profileResponse.data.data.user);
        setMessage({ type: 'success', text: 'Resume deleted successfully!' });
        setShowDeleteConfirm(false);
        setShowResumeUpload(false);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to delete resume' 
      });
    } finally {
      setDeletingResume(false);
    }
  };

  if (!authUser) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">Manage your personal information and resume</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Main Profile Display */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Profile Details</h2>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Basic Information - Display Only */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <p className="text-gray-900 text-lg">{formData.name || 'Not provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <p className="text-gray-900 text-lg">{authUser.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Phone
                </label>
                <div>
                  <p className="text-gray-900 text-lg">{formData.phone || 'Not provided'}</p>
                  {formData.primaryHasWhatsApp && formData.phone && (
                    <span className="inline-flex items-center mt-1 text-xs text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      WhatsApp
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Phone
                </label>
                <div>
                  <p className="text-gray-900 text-lg">{formData.secondaryPhone || 'Not provided'}</p>
                  {formData.secondaryHasWhatsApp && formData.secondaryPhone && (
                    <span className="inline-flex items-center mt-1 text-xs text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      WhatsApp
                    </span>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <p className="text-gray-900 text-lg">{formData.location || 'Not provided'}</p>
              </div>
            </div>

            {/* Professional Information - Display Only */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <p className="text-gray-900 text-lg">{formData.profile.experienceLevel}</p>
                </div>

                {/* Recent Jobs */}
                {authUser.profile?.recentJobs && authUser.profile.recentJobs.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recent Jobs
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {authUser.profile.recentJobs.map((job, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {job}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preferred Locations */}
                {authUser.profile?.preferredLocations && authUser.profile.preferredLocations.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Job Locations
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {authUser.profile.preferredLocations.map((location, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {location}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {formData.profile.skills.length > 0 ? (
                      formData.profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills added yet</p>
                    )}
                  </div>
                </div>

                {/* Education */}
                {authUser.profile?.degree && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Highest Qualification
                    </label>
                    <p className="text-gray-900 text-lg">{authUser.profile.degree}</p>
                  </div>
                )}

                {/* Languages */}
                {authUser.profile?.languages && authUser.profile.languages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Languages
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {authUser.profile.languages.map((language, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {authUser.profile?.availability && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Availability
                      </label>
                      <p className="text-gray-900">{authUser.profile.availability}</p>
                    </div>
                  )}
                  
                  {authUser.profile?.workPreference && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Work Preference
                      </label>
                      <p className="text-gray-900">{authUser.profile.workPreference}</p>
                    </div>
                  )}
                  
                  {authUser.profile?.willingToRelocate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Willing to Relocate
                      </label>
                      <p className="text-gray-900">{authUser.profile.willingToRelocate}</p>
                    </div>
                  )}
                </div>

                {/* Expected Salary */}
                {authUser.profile?.expectedSalary && authUser.profile.expectedSalary.min && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Salary
                    </label>
                    <p className="text-gray-900 text-lg">
                      ₹{authUser.profile.expectedSalary.min?.toLocaleString()} 
                      {authUser.profile.expectedSalary.max && authUser.profile.expectedSalary.max !== authUser.profile.expectedSalary.min && 
                        ` - ₹${authUser.profile.expectedSalary.max?.toLocaleString()}`
                      }
                      {' '}{authUser.profile.expectedSalary.period === 'month' ? 'per month' : authUser.profile.expectedSalary.period === 'year' ? 'per year' : 'per hour'}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <p className="text-gray-900">{formData.profile.bio || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Resume Section - Display Only */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume</h3>
              {authUser.profile?.resume?.originalName ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">{authUser.profile.resume.originalName}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded {new Date(authUser.profile.resume.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete resume"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ) : (
                <p className="text-gray-500">No resume uploaded yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Edit Profile
          </button>
          <button
            onClick={() => setShowResumeUpload(true)}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            Upload Resume
          </button>
        </div>

        {/* Edit Profile Section - Shown when Edit Profile is clicked */}
        {isEditing && (
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setMessage({ type: '', text: '' });
                  // Reset form to current user data
                  setFormData({
                    name: authUser.name || '',
                    phone: authUser.phone || '',
                    secondaryPhone: authUser.secondaryPhone || '',
                    primaryHasWhatsApp: authUser.primaryHasWhatsApp || false,
                    secondaryHasWhatsApp: authUser.secondaryHasWhatsApp || false,
                    location: authUser.location || '',
                    profile: {
                      bio: authUser.profile?.bio || '',
                      skills: authUser.profile?.skills || [],
                      experienceLevel: authUser.profile?.experienceLevel || 'Entry Level'
                    }
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <p className="text-gray-500 py-2">{authUser.email}</p>
                  <p className="text-xs text-gray-400">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Phone
                  </label>
                  <div className="space-y-2">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1-234-567-8900"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="primaryHasWhatsApp"
                        checked={formData.primaryHasWhatsApp}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">This number has WhatsApp</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Phone
                  </label>
                  <div className="space-y-2">
                    <input
                      type="tel"
                      name="secondaryPhone"
                      value={formData.secondaryPhone}
                      onChange={handleInputChange}
                      placeholder="+1-234-567-8900"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="secondaryHasWhatsApp"
                        checked={formData.secondaryHasWhatsApp}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">This number has WhatsApp</span>
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, State"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <select
                      name="profile.experienceLevel"
                      value={formData.profile.experienceLevel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Entry Level">Entry Level</option>
                      <option value="Some Experience">Some Experience</option>
                      <option value="Experienced">Experienced</option>
                      <option value="Very Experienced">Very Experienced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="profile.bio"
                      value={formData.profile.bio}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Tell employers about yourself, your experience, and what you're looking for..."
                      maxLength={500}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.profile.bio.length}/500 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills
                    </label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                          placeholder="Add a skill"
                          maxLength={50}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.profile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-2 text-green-600 hover:text-green-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Jobs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recent Jobs
                    </label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newRecentJob}
                          onChange={(e) => setNewRecentJob(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRecentJob())}
                          placeholder="Add a recent job"
                          maxLength={100}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={handleAddRecentJob}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.profile.recentJobs.map((job, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                          >
                            {job}
                            <button
                              type="button"
                              onClick={() => handleRemoveRecentJob(job)}
                              className="ml-2 text-purple-600 hover:text-purple-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Preferred Locations */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Job Locations
                    </label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newPreferredLocation}
                          onChange={(e) => setNewPreferredLocation(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPreferredLocation())}
                          placeholder="Add a preferred location"
                          maxLength={100}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={handleAddPreferredLocation}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.profile.preferredLocations.map((location, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {location}
                            <button
                              type="button"
                              onClick={() => handleRemovePreferredLocation(location)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Work Preference */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Preference
                    </label>
                    <select
                      name="profile.workPreference"
                      value={formData.profile.workPreference}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>

                  {/* Expected Salary */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Salary Range
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Minimum (₹)</label>
                        <input
                          type="number"
                          name="profile.expectedSalary.min"
                          value={formData.profile.expectedSalary.min}
                          onChange={handleInputChange}
                          placeholder="20000"
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Maximum (₹)</label>
                        <input
                          type="number"
                          name="profile.expectedSalary.max"
                          value={formData.profile.expectedSalary.max}
                          onChange={handleInputChange}
                          placeholder="30000"
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Period</label>
                        <select
                          name="profile.expectedSalary.period"
                          value={formData.profile.expectedSalary.period}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="hour">Per Hour</option>
                          <option value="month">Per Month</option>
                          <option value="year">Per Year</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 font-medium"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setMessage({ type: '', text: '' });
                    // Reset form to current user data
                    setFormData({
                      name: authUser.name || '',
                      phone: authUser.phone || '',
                      secondaryPhone: authUser.secondaryPhone || '',
                      primaryHasWhatsApp: authUser.primaryHasWhatsApp || false,
                      secondaryHasWhatsApp: authUser.secondaryHasWhatsApp || false,
                      location: authUser.location || '',
                      profile: {
                        bio: authUser.profile?.bio || '',
                        skills: authUser.profile?.skills || [],
                        experienceLevel: authUser.profile?.experienceLevel || 'Entry Level',
                        recentJobs: authUser.profile?.recentJobs || [],
                        preferredLocations: authUser.profile?.preferredLocations || [],
                        workPreference: authUser.profile?.workPreference || 'Flexible',
                        expectedSalary: authUser.profile?.expectedSalary || { min: '', max: '', period: 'month' }
                      }
                    });
                    setNewSkill('');
                    setNewRecentJob('');
                    setNewPreferredLocation('');
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Resume Upload Modal/Card - Shown when Upload Resume is clicked */}
        {showResumeUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Upload Resume</h2>
                <button
                  onClick={() => {
                    setShowResumeUpload(false);
                    setMessage({ type: '', text: '' });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-6 py-6 space-y-4">
                {/* Current Resume Display */}
                {authUser.profile?.resume?.originalName && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Current Resume
                      </label>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete Resume
                      </button>
                    </div>
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <svg className="w-8 h-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">{authUser.profile.resume.originalName}</p>
                        <p className="text-sm text-gray-500">
                          Uploaded {new Date(authUser.profile.resume.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload New Resume */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {authUser.profile?.resume?.originalName ? 'Upload New Resume' : 'Select Resume File'}
                  </label>
                  <div className="mt-2">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      disabled={uploadingResume}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Accepted formats: PDF, DOC, DOCX (Max 5MB)
                  </p>
                  {uploadingResume && (
                    <div className="mt-3 flex items-center text-blue-600">
                      <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm">Uploading resume...</span>
                    </div>
                  )}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Tips for your resume:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Keep your resume updated with recent experience</li>
                        <li>Highlight relevant skills for the jobs you want</li>
                        <li>Use a clear, professional format</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => {
                    setShowResumeUpload(false);
                    setMessage({ type: '', text: '' });
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Delete Resume</h2>
              </div>

              <div className="px-6 py-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium mb-2">
                      Are you sure you want to delete your resume?
                    </p>
                    <p className="text-sm text-gray-600">
                      This action cannot be undone. You'll need to upload a new resume if you want to apply for jobs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deletingResume}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteResume}
                  disabled={deletingResume}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:bg-red-400"
                >
                  {deletingResume ? 'Deleting...' : 'Delete Resume'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;