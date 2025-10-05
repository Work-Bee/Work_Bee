import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState('');
  const { register: registerUser, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl && ['jobseeker', 'employer'].includes(typeFromUrl)) {
      setUserType(typeFromUrl);
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm();

  const phonePattern = /^[0-9+()\-\s]{7,15}$/;

  const password = watch('password');
  const primaryPhoneValue = watch('phone');
  const primaryWhatsAppValue = watch('primaryHasWhatsApp');
  const secondaryWhatsAppValue = watch('secondaryHasWhatsApp');

  useEffect(() => {
    if (primaryWhatsAppValue || secondaryWhatsAppValue) {
      clearErrors('primaryHasWhatsApp');
    }
  }, [primaryWhatsAppValue, secondaryWhatsAppValue, clearErrors]);

  const onSubmit = async (data) => {
    clearError();
    clearErrors('primaryHasWhatsApp');
    
    // Remove confirmPassword from data
    const { confirmPassword, ...userData } = data;

    if (userType === 'employer') {
      const primaryHasWhatsApp = !!userData.primaryHasWhatsApp;
      const secondaryHasWhatsApp = !!userData.secondaryHasWhatsApp;

      if (!primaryHasWhatsApp && !secondaryHasWhatsApp) {
        setError('primaryHasWhatsApp', {
          type: 'manual',
          message: 'Select at least one contact number that has WhatsApp.',
        });
        return;
      }

      userData.primaryHasWhatsApp = primaryHasWhatsApp;
      userData.secondaryHasWhatsApp = secondaryHasWhatsApp;
    } else {
      delete userData.secondaryPhone;
      delete userData.primaryHasWhatsApp;
      delete userData.secondaryHasWhatsApp;
    }

    if (userData.phone) {
      userData.phone = userData.phone.trim();
    }

    if (userData.secondaryPhone) {
      userData.secondaryPhone = userData.secondaryPhone.trim();
    }

    if (userData.location) {
      userData.location = userData.location.trim();
    }
    
    const result = await registerUser(userData);
    
    if (result.success) {
      const destination = userType === 'employer' ? '/employer/home' : '/jobseeker/home';
      navigate(destination);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <div className="mx-auto h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to={userType === 'employer' ? '/login/employer' : userType === 'jobseeker' ? '/login/jobseeker' : '/'}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <div className="flex">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* User Type Selection */}
        {!userType && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Choose your registration type
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Job Seeker Option */}
              <Link
                to="/register/jobseeker"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-primary-300 block"
              >
                <div className="flex flex-col items-center">
                  <svg className="h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                  <span className="font-medium text-gray-900">Looking for a Job</span>
                  <span className="text-sm text-gray-500 mt-1">Find opportunities and apply</span>
                </div>
              </Link>

              {/* Employer Option */}
              <Link
                to="/register/employer"
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-primary-300 block"
              >
                <div className="flex flex-col items-center">
                  <svg className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-4a2 2 0 012-2h2a2 2 0 012 2v4.01" />
                  </svg>
                  <span className="font-medium text-gray-900">Hiring Talent</span>
                  <span className="text-sm text-gray-500 mt-1">Post jobs and find candidates</span>
                </div>
              </Link>
            </div>
            <div className="mt-4 text-center">
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to homepage
              </Link>
            </div>
          </div>
        )}

        {/* Registration Form */}
        {userType && (
          <>
            <div className="mt-8 bg-primary-50 border border-primary-100 rounded-lg px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-900">Already have an account?</p>
                <p className="text-xs text-primary-700 mt-0.5">
                  Jump to your sign-in page without re-entering your details.
                </p>
              </div>
              <Link
                    to={userType === 'employer' ? '/login/employer' : '/login/jobseeker'}
                className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to login
              </Link>
            </div>
            <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <input type="hidden" {...register('role')} value={userType} />
            
            {/* User Type Display */}
            <div className="text-center mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {userType === 'jobseeker' ? (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                    Job Seeker Registration
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-4a2 2 0 012-2h2a2 2 0 012 2v4.01" />
                    </svg>
                    Employer Registration
                  </>
                )}
              </span>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUserType('');
                    navigate('/register');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Change registration type
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="form-label">
                  {userType === 'employer' ? 'Contact Person Name' : 'Full Name'}
                </label>
                <input
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                  type="text"
                  className="form-input"
                  placeholder={userType === 'employer' ? 'Enter contact person name' : 'Enter your full name'}
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message}</p>
                )}
              </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                className="form-input"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            {/* Employer-specific fields */}
            {userType === 'employer' && (
              <>
                {/* Company Name */}
                <div>
                  <label htmlFor="companyName" className="form-label">
                    Company Name
                  </label>
                  <input
                    {...register('companyName', {
                      required: 'Company name is required',
                      minLength: {
                        value: 2,
                        message: 'Company name must be at least 2 characters',
                      },
                    })}
                    type="text"
                    className="form-input"
                    placeholder="Enter your company name"
                  />
                  {errors.companyName && (
                    <p className="form-error">{errors.companyName.message}</p>
                  )}
                </div>

                {/* Industry */}
                <div>
                  <label htmlFor="industry" className="form-label">
                    Industry
                  </label>
                  <select
                    {...register('industry', { required: 'Please select your industry' })}
                    className="form-select"
                  >
                    <option value="">Select industry</option>
                    <option value="Construction">Construction</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Food Service">Food Service</option>
                    <option value="Warehouse">Warehouse & Logistics</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Cleaning">Cleaning & Maintenance</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Healthcare">Healthcare Support</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.industry && (
                    <p className="form-error">{errors.industry.message}</p>
                  )}
                </div>

                {/* Company Size */}
                <div>
                  <label htmlFor="companySize" className="form-label">
                    Company Size
                  </label>
                  <select
                    {...register('companySize', { required: 'Please select company size' })}
                    className="form-select"
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                  {errors.companySize && (
                    <p className="form-error">{errors.companySize.message}</p>
                  )}
                </div>

                {/* Company Website */}
                <div>
                  <label htmlFor="website" className="form-label">
                    Company Website <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    {...register('website', {
                      pattern: {
                        // eslint-disable-next-line no-useless-escape
                        value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                        message: 'Please enter a valid website URL',
                      },
                    })}
                    type="url"
                    className="form-input"
                    placeholder="https://www.company.com"
                  />
                  {errors.website && (
                    <p className="form-error">{errors.website.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Job Seeker-specific fields */}
            {userType === 'jobseeker' && (
              <>
                {/* Experience Level */}
                <div>
                  <label htmlFor="experienceLevel" className="form-label">
                    Experience Level
                  </label>
                  <select
                    {...register('experienceLevel', { required: 'Please select your experience level' })}
                    className="form-select"
                  >
                    <option value="">Select experience level</option>
                    <option value="Entry Level">Entry Level (0-1 years)</option>
                    <option value="Some Experience">Some Experience (1-3 years)</option>
                    <option value="Experienced">Experienced (3-5 years)</option>
                    <option value="Very Experienced">Very Experienced (5+ years)</option>
                  </select>
                  {errors.experienceLevel && (
                    <p className="form-error">{errors.experienceLevel.message}</p>
                  )}
                </div>

                {/* Skills/Interests */}
                <div>
                  <label htmlFor="skills" className="form-label">
                    Skills & Interests <span className="text-gray-400">(optional)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[
                      'Physical Labor', 'Customer Service', 'Driving', 'Food Service',
                      'Cleaning', 'Construction', 'Assembly', 'Warehouse Work',
                      'Cash Handling', 'Basic Computer', 'Team Work', 'Problem Solving'
                    ].map((skill) => (
                      <label key={skill} className="flex items-center">
                        <input
                          {...register('skills')}
                          type="checkbox"
                          value={skill}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Primary Phone */}
            <div>
              <label htmlFor="phone" className="form-label">
                Primary Phone Number{' '}
                {userType === 'employer' ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-gray-400">(optional)</span>
                )}
              </label>
              <input
                {...register('phone', {
                  validate: (value) => {
                    if (userType === 'employer' && !value) {
                      return 'Primary phone number is required';
                    }

                    if (value && !phonePattern.test(value)) {
                      return 'Please enter a valid phone number';
                    }

                    return true;
                  },
                })}
                type="tel"
                className="form-input"
                placeholder="Enter your primary contact number"
              />
              {userType === 'employer' && (
                <p className="text-xs text-gray-500 mt-1">
                  Include country or area code so we can reach you without delays.
                </p>
              )}
              {errors.phone && (
                <p className="form-error">{errors.phone.message}</p>
              )}
            </div>

            {userType === 'employer' && (
              <div>
                <label htmlFor="secondaryPhone" className="form-label">
                  Secondary Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('secondaryPhone', {
                    validate: (value) => {
                      if (!value) {
                        return 'Secondary phone number is required';
                      }

                      if (!phonePattern.test(value)) {
                        return 'Please enter a valid secondary phone number';
                      }

                      if (primaryPhoneValue && value.trim() === primaryPhoneValue.trim()) {
                        return 'Secondary phone must be different from the primary phone';
                      }

                      return true;
                    },
                  })}
                  type="tel"
                  className="form-input"
                  placeholder="Enter an alternate contact number"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Share another active number (e.g., supervisor or office line) so candidates can always get through.
                </p>
                {errors.secondaryPhone && (
                  <p className="form-error">{errors.secondaryPhone.message}</p>
                )}
              </div>
            )}

            {userType === 'employer' && (
              <div className="bg-primary-50 border border-primary-100 rounded-lg p-4">
                <p className="text-sm font-medium text-primary-900">
                  WhatsApp Availability <span className="text-red-500">*</span>
                </p>
                <p className="text-xs text-primary-700 mt-1">
                  At least one contact number must be reachable on WhatsApp so applicants can message you quickly.
                </p>
                <div className="mt-3 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" {...register('primaryHasWhatsApp')} />
                    Primary number has WhatsApp
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" {...register('secondaryHasWhatsApp')} />
                    Secondary number has WhatsApp
                  </label>
                </div>
                {errors.primaryHasWhatsApp && (
                  <p className="form-error mt-2">{errors.primaryHasWhatsApp.message}</p>
                )}
              </div>
            )}

            {/* Location (Common field) */}
            <div>
              <label htmlFor="location" className="form-label">
                Business Location{' '}
                {userType === 'employer' ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-gray-400">(optional)</span>
                )}
              </label>
              <input
                {...register('location', {
                  required: userType === 'employer' ? 'Location is required for employers' : false,
                  maxLength: {
                    value: 100,
                    message: 'Location cannot be more than 100 characters',
                  },
                })}
                type="text"
                className="form-input"
                placeholder="City, State"
              />
              {errors.location && (
                <p className="form-error">{errors.location.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="form-input pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {showPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    )}
                  </svg>
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
              <div className="mt-1 text-xs text-gray-500">
                Must contain at least 6 characters with uppercase, lowercase, and number
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {showConfirmPassword ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    )}
                  </svg>
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              {...register('terms', {
                required: 'You must accept the terms and conditions',
              })}
              id="terms"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <Link
                to="/terms"
                className="text-primary-600 hover:text-primary-500"
              >
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link
                to="/privacy"
                className="text-primary-600 hover:text-primary-500"
              >
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.terms && (
            <p className="form-error">{errors.terms.message}</p>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full btn-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner h-5 w-5 mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;