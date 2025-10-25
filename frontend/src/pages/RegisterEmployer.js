import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterEmployer = () => {
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
    url.searchParams.set('role', 'employer');
    window.location.href = url.toString();
  };

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Company Details (Mandatory)
    companyName: '',
    email: '',
    website: '',
    contactPersonName: '',
    contactPersonRole: '',
    phone: '',
    secondaryPhone: '',
    primaryHasWhatsApp: false,
    secondaryHasWhatsApp: false,
    location: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Additional Details (Optional but encouraged)
    industry: '',
    companySize: '',
    companyAddress: '',
    city: '',
    state: ''
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate Step 1
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.contactPersonName.trim()) {
      newErrors.contactPersonName = 'Contact person name is required';
    }

    if (!formData.contactPersonRole.trim()) {
      newErrors.contactPersonRole = 'Contact person role is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Primary phone number is required';
    } else if (!/^[0-9+()\-\s]{7,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.secondaryPhone.trim()) {
      newErrors.secondaryPhone = 'Secondary phone number is required';
    } else if (!/^[0-9+()\-\s]{7,15}$/.test(formData.secondaryPhone)) {
      newErrors.secondaryPhone = 'Please enter a valid secondary phone number';
    } else if (formData.phone === formData.secondaryPhone) {
      newErrors.secondaryPhone = 'Secondary phone must be different from primary phone';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Company location is required';
    }

    if (!formData.primaryHasWhatsApp && !formData.secondaryHasWhatsApp) {
      newErrors.whatsapp = 'At least one phone number must have WhatsApp';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, lowercase letter, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      clearError();
    }
  };

  // Handle back
  const handleBack = () => {
    setCurrentStep(1);
    clearError();
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // Prepare data for API
    const userData = {
      role: 'employer',
      name: formData.contactPersonName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.trim(),
      secondaryPhone: formData.secondaryPhone.trim(),
      location: formData.location.trim(),
      primaryHasWhatsApp: formData.primaryHasWhatsApp,
      secondaryHasWhatsApp: formData.secondaryHasWhatsApp,
      companyDetails: {
        companyName: formData.companyName.trim(),
        officialEmail: formData.email.trim(),
        website: formData.website.trim() || undefined,
        contactPersonRole: formData.contactPersonRole.trim(),
        industry: formData.industry || undefined,
        companySize: formData.companySize || undefined,
        companyAddress: formData.companyAddress.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined
      }
    };

    const result = await registerUser(userData);
    
    if (result.success) {
      navigate('/employer/home');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-800">
            Employer Registration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login/employer" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Google OAuth Prompt - Show first if form not started */}
        {!showForm ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
              Get Started Quickly
            </h3>
            <p className="text-center text-sm text-gray-600 mb-6">
              Choose how you want to create your employer account
            </p>

            <div className="space-y-3">
              {/* Google Sign Up Button */}
              <button
                type="button"
                onClick={startGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:shadow-md transition-all duration-200 bg-white"
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
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:shadow-md transition-all duration-200 bg-white"
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
            <div className="mb-8">
              <div className="flex items-center justify-center">
                <div className="flex items-center">
                  {/* Step 1 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > 1 ? '✓' : '1'}
                    </div>
                    <span className="mt-2 text-xs font-medium text-gray-600">Company Details</span>
                  </div>
                  
                  {/* Connector */}
                  <div className={`w-24 h-1 mx-4 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  
                  {/* Step 2 */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      2
                    </div>
                    <span className="mt-2 text-xs font-medium text-gray-600">Additional Info</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Global Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <p className="font-medium">Registration Failed</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Company Details (Mandatory) */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Company Details</h3>
                  <p className="text-sm text-gray-500 mt-1">All fields are mandatory for credibility</p>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company / Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    maxLength={100}
                    placeholder="Enter your company name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Company Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Website (Optional)
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.company.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Contact Person Name & Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Person Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactPersonName"
                      value={formData.contactPersonName}
                      onChange={handleInputChange}
                      maxLength={50}
                      placeholder="e.g., Ramesh Kumar"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.contactPersonName && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactPersonName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role / Designation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contactPersonRole"
                      value={formData.contactPersonRole}
                      onChange={handleInputChange}
                      maxLength={50}
                      placeholder="e.g., HR Manager"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.contactPersonRole && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactPersonRole}</p>
                    )}
                  </div>
                </div>

                {/* Contact Numbers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <label className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        name="primaryHasWhatsApp"
                        checked={formData.primaryHasWhatsApp}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">This number has WhatsApp</span>
                    </label>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="secondaryPhone"
                      value={formData.secondaryPhone}
                      onChange={handleInputChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <label className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        name="secondaryHasWhatsApp"
                        checked={formData.secondaryHasWhatsApp}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">This number has WhatsApp</span>
                    </label>
                    {errors.secondaryPhone && (
                      <p className="mt-1 text-sm text-red-600">{errors.secondaryPhone}</p>
                    )}
                  </div>
                </div>
                {errors.whatsapp && (
                  <p className="text-sm text-red-600 -mt-3">{errors.whatsapp}</p>
                )}

                {/* Company Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    maxLength={100}
                    placeholder="e.g., Bangalore, Karnataka"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter city, state or full address for company location
                  </p>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                  )}
                </div>

                {/* Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter password (min 6 characters)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Re-enter password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Next Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-md"
                  >
                    Next Step →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Additional Details (Optional) */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Additional Company Information</h3>
                  <p className="text-sm text-gray-500 mt-1">Optional but helps make your profile more credible</p>
                </div>

                {/* Industry & Company Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry / Sector
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select industry</option>
                      <option value="IT">IT & Technology</option>
                      <option value="Finance">Finance & Banking</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail & E-commerce</option>
                      <option value="Construction">Construction</option>
                      <option value="Education">Education</option>
                      <option value="Food Service">Food Service & Hospitality</option>
                      <option value="Transportation">Transportation & Logistics</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Size
                    </label>
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="200+">200+ employees</option>
                    </select>
                  </div>
                </div>

                {/* Company Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Address
                  </label>
                  <input
                    type="text"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                    maxLength={200}
                    placeholder="Street address, Building name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* City & State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      maxLength={50}
                      placeholder="e.g., Kochi"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      maxLength={50}
                      placeholder="e.g., Kerala"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-md disabled:bg-green-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : 'Complete Registration'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Looking for a job instead?{' '}
            <Link to="/register/jobseeker" className="font-medium text-blue-600 hover:text-blue-500">
              Register as Job Seeker
            </Link>
          </p>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default RegisterEmployer;
