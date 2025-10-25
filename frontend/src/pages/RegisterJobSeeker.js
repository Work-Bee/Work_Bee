import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterJobSeeker = () => {
  const [showForm, setShowForm] = useState(false); // New state to control form visibility
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Google OAuth handler
  const startGoogleLogin = () => {
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5555/api';
    const url = new URL('auth/google', apiBase);
    url.searchParams.set('role', 'jobseeker');
    window.location.href = url.toString();
  };

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Basic Identity
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Step 2: Professional Profile
    location: '',
    preferredLocations: [],
    recentJobs: [],
    experienceLevel: 'Entry Level',
    skills: [],
    
    // Step 3: Additional Details
    degree: '',
    languages: [],
    expectedSalaryMin: '',
    expectedSalaryMax: '',
  salaryCurrency: 'INR',
    salaryPeriod: 'month',
    availability: 'Immediate',
    workPreference: 'Flexible',
    willingToRelocate: 'Maybe',
    bio: ''
  });

  const [errors, setErrors] = useState({});
  const [tempInput, setTempInput] = useState({
    skill: '',
    preferredLocation: '',
    recentJob: '',
    language: ''
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Add item to array fields
  const addToArray = (field, value) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setTempInput(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Remove item from array fields
  const removeFromArray = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }));
  };

  // Validate Step 1
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+()\-\s]{7,15}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate Step 2
  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.location.trim()) {
      newErrors.location = 'Current location is required';
    }
    
    if (!formData.experienceLevel) {
      newErrors.experienceLevel = 'Experience level is required';
    }
    
    if (formData.skills.length === 0) {
      newErrors.skills = 'Please add at least one skill';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    clearError();
    
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      window.scrollTo(0, 0);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
      window.scrollTo(0, 0);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    // Prepare data for backend
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      location: formData.location,
      role: 'jobseeker',
      experienceLevel: formData.experienceLevel,
      skills: formData.skills,
      preferredLocations: formData.preferredLocations,
      ...(formData.recentJobs.length > 0 && { recentJobs: formData.recentJobs }),
      
      // Optional fields
      ...(formData.degree && { degree: formData.degree }),
      ...(formData.languages.length > 0 && { languages: formData.languages }),
      ...(formData.expectedSalaryMin && {
        expectedSalary: {
          min: parseInt(formData.expectedSalaryMin),
          max: parseInt(formData.expectedSalaryMax) || parseInt(formData.expectedSalaryMin),
          currency: formData.salaryCurrency,
          period: formData.salaryPeriod
        }
      }),
      availability: formData.availability,
      workPreference: formData.workPreference,
      willingToRelocate: formData.willingToRelocate,
      ...(formData.bio && { bio: formData.bio })
    };
    
    const result = await registerUser(userData);
    
    if (result.success) {
      navigate('/jobseeker/home');
    }
  };

  // Skip Step 3
  const handleSkipStep3 = async () => {
    // Submit with just required fields
    await handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-800">
            Create Your Job Seeker Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login/jobseeker" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Google OAuth Prompt - Show first if form not started */}
        {!showForm ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
              Get Started Quickly
            </h3>
            <p className="text-center text-sm text-gray-600 mb-6">
              Choose how you want to create your account
            </p>

            <div className="space-y-3">
              {/* Google Sign Up Button */}
              <button
                type="button"
                onClick={startGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-800 hover:shadow-md transition-all duration-200 bg-white"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-white">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                    <path fill="#EA4335" d="M12 10.2h10.5c.1.6.1 1.2.1 1.8 0 6-4 10-10.6 10-6.1 0-11-4.9-11-11s4.9-11 11-11c2.9 0 5.3 1.1 7.2 2.8l-2.9 2.8C15.1 4.7 13.7 4 12 4 8.7 4 6 6.7 6 10s2.7 6 6 6c3 0 4.9-1.7 5.4-4.1H12v-1.7z"/>
                  </svg>
                </span>
                <span className="font-medium text-gray-800">Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              {/* Email Sign Up Button */}
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-800 hover:shadow-md transition-all duration-200 bg-white"
              >
                <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-gray-800">Continue with Email</span>
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link to="/register" className="text-sm text-gray-600 hover:text-gray-800">
                ← Choose different account type
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Progress Indicator */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          step < currentStep
                            ? 'bg-green-500 text-white'
                            : step === currentStep
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {step < currentStep ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          step
                        )}
                      </div>
                      <p className={`text-xs mt-2 text-center ${step === currentStep ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                        {step === 1 ? 'Account Setup' : step === 2 ? 'Professional Info' : 'Complete Profile'}
                      </p>
                    </div>
                    {step < 3 && (
                      <div className={`h-1 flex-1 mx-2 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                <div className="flex">
                  <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-semibold">Registration Failed</p>
                    <p className="text-sm mt-1">{error}</p>
                    <p className="text-xs mt-2 text-red-600">Please check all required fields and try again. If the problem persists, you may already have an account with this email.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* STEP 1: Basic Identity */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                </div>
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 6 characters with uppercase, lowercase, and number
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showConfirmPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      )}
                    </svg>
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1-234-567-8900"
                />
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
              </div>

              {/* Next Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Next: Professional Information →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Professional Profile */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Professional Profile</h3>
              
              {/* Current Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City, State"
                />
                {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
              </div>

              {/* Preferred Locations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Job Locations <span className="text-gray-500">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempInput.preferredLocation}
                    onChange={(e) => setTempInput(prev => ({ ...prev, preferredLocation: e.target.value }))}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('preferredLocations', tempInput.preferredLocation);
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a preferred location"
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('preferredLocations', tempInput.preferredLocation)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.preferredLocations.map((location, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {location}
                      <button
                        type="button"
                        onClick={() => removeFromArray('preferredLocations', location)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Jobs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recent Jobs <span className="text-gray-500">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempInput.recentJob}
                    onChange={(e) => setTempInput(prev => ({ ...prev, recentJob: e.target.value }))}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('recentJobs', tempInput.recentJob);
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Warehouse Associate, Retail Sales"
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('recentJobs', tempInput.recentJob)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.recentJobs.map((job, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {job}
                      <button
                        type="button"
                        onClick={() => removeFromArray('recentJobs', job)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Add your previous job titles or work experience
                </p>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Entry Level">Entry Level (0-1 years)</option>
                  <option value="Some Experience">Some Experience (1-3 years)</option>
                  <option value="Experienced">Experienced (3-5 years)</option>
                  <option value="Very Experienced">Very Experienced (5+ years)</option>
                </select>
                {errors.experienceLevel && <p className="text-red-600 text-sm mt-1">{errors.experienceLevel}</p>}
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Skills <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempInput.skill}
                    onChange={(e) => setTempInput(prev => ({ ...prev, skill: e.target.value }))}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('skills', tempInput.skill);
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add a skill"
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('skills', tempInput.skill)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeFromArray('skills', skill)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                {errors.skills && <p className="text-red-600 text-sm mt-1">{errors.skills}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Add at least one skill (e.g., Customer Service, Physical Labor, Driving)
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Next: Complete Profile →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Additional Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Complete Your Profile</h3>
                <button
                  type="button"
                  onClick={handleSkipStep3}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Skip this step
                </button>
              </div>

              <p className="text-sm text-gray-600">
                All fields in this step are optional. You can complete your profile now or add these details later.
              </p>

              {/* Education Section */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">Education</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Highest Qualification
                  </label>
                  <select
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select your highest qualification</option>
                    <option value="Below 10th">Below 10th</option>
                    <option value="10th Pass">10th Pass</option>
                    <option value="12th Pass">12th Pass</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Languages */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">Languages</h4>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempInput.language}
                    onChange={(e) => setTempInput(prev => ({ ...prev, language: e.target.value }))}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('languages', tempInput.language);
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., English, Spanish, Hindi"
                  />
                  <button
                    type="button"
                    onClick={() => addToArray('languages', tempInput.language)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.languages.map((language, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {language}
                      <button
                        type="button"
                        onClick={() => removeFromArray('languages', language)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Expected Salary */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">Expected Salary Range</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum
                    </label>
                    <input
                      type="number"
                      name="expectedSalaryMin"
                      value={formData.expectedSalaryMin}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="30000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum
                    </label>
                    <input
                      type="number"
                      name="expectedSalaryMax"
                      value={formData.expectedSalaryMax}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="50000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <input
                      type="text"
                      value="INR (₹)"
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                    <input type="hidden" name="salaryCurrency" value="INR" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Period
                    </label>
                    <select
                      name="salaryPeriod"
                      value={formData.salaryPeriod}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="hour">Per Hour</option>
                      <option value="month">Per Month</option>
                      <option value="year">Per Year</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Availability & Preferences */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">Work Preferences</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability
                    </label>
                    <select
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Immediate">Immediate</option>
                      <option value="Within 30 days">Within 30 days</option>
                      <option value="Within 60 days">Within 60 days</option>
                      <option value="Contract">Contract basis</option>
                      <option value="Negotiable">Negotiable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Preference
                    </label>
                    <select
                      name="workPreference"
                      value={formData.workPreference}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Willing to Relocate
                    </label>
                    <select
                      name="willingToRelocate"
                      value={formData.willingToRelocate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Maybe">Maybe</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Career Summary */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-medium text-gray-800 mb-3">Career Summary / Bio</h4>
                
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell employers about yourself, your experience, strengths, and what you're looking for..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:bg-green-400"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="spinner h-5 w-5 mr-2"></div>
                      Creating account...
                    </div>
                  ) : (
                    'Complete Registration ✓'
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Need help?{' '}
            <Link to="/contact" className="text-blue-600 hover:text-blue-800">
              Contact Support
            </Link>
          </p>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default RegisterJobSeeker;
