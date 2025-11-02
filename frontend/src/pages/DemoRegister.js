import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DemoRegister = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'jobseeker';
  const [userType, setUserType] = useState(initialType);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Job Seeker Form Data (3 steps)
  const [jobSeekerData, setJobSeekerData] = useState({
    // Step 1: Account Setup
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Step 2: Professional Info
    location: '',
    preferredLocations: [],
    recentJobs: [],
    experienceLevel: 'Entry Level',
    skills: [],
    // Step 3: Complete Profile
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

  // Employer Form Data (2 steps)
  const [employerData, setEmployerData] = useState({
    // Step 1: Company Details
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
    // Step 2: Additional Info
    industry: '',
    companySize: '',
    companyAddress: '',
    city: '',
    state: ''
  });

  const [errors, setErrors] = useState({});
  const [tempInput, setTempInput] = useState({
    skill: '',
    preferredLocation: '',
    recentJob: '',
    language: ''
  });

  useEffect(() => {
    setUserType(initialType);
    setCurrentStep(1);
  }, [initialType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    if (userType === 'jobseeker') {
      setJobSeekerData(prev => ({
        ...prev,
        [name]: newValue
      }));
    } else {
      setEmployerData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    clearError();
  };

  // Array field helpers for job seeker
  const addToArray = (field, value) => {
    if (value.trim() && !jobSeekerData[field].includes(value.trim())) {
      setJobSeekerData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setTempInput(prev => ({ ...prev, [field.replace(/s$/, '')]: '' }));
    }
  };

  const removeFromArray = (field, value) => {
    setJobSeekerData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }));
  };

  // Validation functions
  const validateJobSeekerStep1 = () => {
    const newErrors = {};
    if (!jobSeekerData.name.trim()) newErrors.name = 'Name is required';
    else if (jobSeekerData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    
    if (!jobSeekerData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(jobSeekerData.email))
      newErrors.email = 'Invalid email address';
    
    if (!jobSeekerData.password) newErrors.password = 'Password is required';
    else if (jobSeekerData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(jobSeekerData.password))
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    
    if (!jobSeekerData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (jobSeekerData.password !== jobSeekerData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    
    if (!jobSeekerData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[0-9+()\-\s]{7,15}$/.test(jobSeekerData.phone))
      newErrors.phone = 'Invalid phone number';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateJobSeekerStep2 = () => {
    const newErrors = {};
    if (!jobSeekerData.location.trim()) newErrors.location = 'Current location is required';
    if (!jobSeekerData.experienceLevel) newErrors.experienceLevel = 'Experience level is required';
    if (jobSeekerData.skills.length === 0) newErrors.skills = 'Please add at least one skill';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEmployerStep1 = () => {
    const newErrors = {};
    if (!employerData.companyName.trim()) newErrors.companyName = 'Company name is required';
    else if (employerData.companyName.trim().length < 2)
      newErrors.companyName = 'Company name must be at least 2 characters';
    
    if (!employerData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(employerData.email))
      newErrors.email = 'Invalid email address';
    
    if (!employerData.contactPersonName.trim())
      newErrors.contactPersonName = 'Contact person name is required';
    if (!employerData.contactPersonRole.trim())
      newErrors.contactPersonRole = 'Contact person role is required';
    
    if (!employerData.phone.trim()) newErrors.phone = 'Primary phone number is required';
    else if (!/^[0-9+()\-\s]{7,15}$/.test(employerData.phone))
      newErrors.phone = 'Invalid phone number';
    
    if (!employerData.secondaryPhone.trim())
      newErrors.secondaryPhone = 'Secondary phone number is required';
    else if (!/^[0-9+()\-\s]{7,15}$/.test(employerData.secondaryPhone))
      newErrors.secondaryPhone = 'Invalid secondary phone number';
    else if (employerData.phone === employerData.secondaryPhone)
      newErrors.secondaryPhone = 'Secondary phone must be different from primary';
    
    if (!employerData.location.trim()) newErrors.location = 'Company location is required';
    if (!employerData.primaryHasWhatsApp && !employerData.secondaryHasWhatsApp)
      newErrors.whatsapp = 'At least one phone number must have WhatsApp';
    
    if (!employerData.password) newErrors.password = 'Password is required';
    else if (employerData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(employerData.password))
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    
    if (employerData.password !== employerData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    clearError();
    if (userType === 'jobseeker') {
      if (currentStep === 1 && validateJobSeekerStep1()) {
        setCurrentStep(2);
        window.scrollTo(0, 0);
      } else if (currentStep === 2 && validateJobSeekerStep2()) {
        setCurrentStep(3);
        window.scrollTo(0, 0);
      }
    } else {
      if (currentStep === 1 && validateEmployerStep1()) {
        setCurrentStep(2);
        window.scrollTo(0, 0);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSkipStep3 = async () => {
    await handleSubmit({ preventDefault: () => {} });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    let userData;
    if (userType === 'jobseeker') {
      userData = {
        name: jobSeekerData.name,
        email: jobSeekerData.email,
        password: jobSeekerData.password,
        phone: jobSeekerData.phone,
        location: jobSeekerData.location,
        role: 'jobseeker',
        experienceLevel: jobSeekerData.experienceLevel,
        skills: jobSeekerData.skills,
        preferredLocations: jobSeekerData.preferredLocations,
        ...(jobSeekerData.recentJobs.length > 0 && { recentJobs: jobSeekerData.recentJobs }),
        ...(jobSeekerData.degree && { degree: jobSeekerData.degree }),
        ...(jobSeekerData.languages.length > 0 && { languages: jobSeekerData.languages }),
        ...(jobSeekerData.expectedSalaryMin && {
          expectedSalary: {
            min: parseInt(jobSeekerData.expectedSalaryMin),
            max: parseInt(jobSeekerData.expectedSalaryMax) || parseInt(jobSeekerData.expectedSalaryMin),
            currency: jobSeekerData.salaryCurrency,
            period: jobSeekerData.salaryPeriod
          }
        }),
        availability: jobSeekerData.availability,
        workPreference: jobSeekerData.workPreference,
        willingToRelocate: jobSeekerData.willingToRelocate,
        ...(jobSeekerData.bio && { bio: jobSeekerData.bio })
      };
    } else {
      userData = {
        role: 'employer',
        name: employerData.contactPersonName.trim(),
        email: employerData.email.trim(),
        password: employerData.password,
        phone: employerData.phone.trim(),
        secondaryPhone: employerData.secondaryPhone.trim(),
        location: employerData.location.trim(),
        primaryHasWhatsApp: employerData.primaryHasWhatsApp,
        secondaryHasWhatsApp: employerData.secondaryHasWhatsApp,
        companyDetails: {
          companyName: employerData.companyName.trim(),
          officialEmail: employerData.email.trim(),
          website: employerData.website.trim() || undefined,
          contactPersonRole: employerData.contactPersonRole.trim(),
          industry: employerData.industry || undefined,
          companySize: employerData.companySize || undefined,
          companyAddress: employerData.companyAddress.trim() || undefined,
          city: employerData.city.trim() || undefined,
          state: employerData.state.trim() || undefined
        }
      };
    }

    const result = await registerUser(userData);
    if (result.success) {
      const destination = userType === 'jobseeker' ? '/jobseeker/home' : '/employer/home';
      navigate(destination, { replace: true });
    }
  };

  const startGoogleSignup = () => {
    const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const url = new URL('auth/google', apiBase);
    url.searchParams.set('role', userType);
    window.location.href = url.toString();
  };

  const useDemoAccount = () => {
    // Redirect directly to the appropriate dashboard without login
    const destination = userType === 'jobseeker' ? '/jobseeker/home' : '/employer/home';
    navigate(destination, { replace: true });
  };

  const maxSteps = userType === 'jobseeker' ? 3 : 2;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Panel */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-800 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-800">WorkBee</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Quick setup</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure & verified</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-8">
            {/* Left Side - Info Panel */}
            <div className="hidden lg:block w-96 flex-shrink-0">
              <div className="fixed w-96 bg-white rounded-xl p-8 shadow-soft border border-gray-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  {userType === 'jobseeker' ? 'Join WorkBee Today' : 'Start Hiring Today'}
                </h3>
                
                <div className="space-y-5 mb-8">
              {userType === 'jobseeker' ? (
                <>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Quick & Easy Setup</h4>
                      <p className="text-sm text-gray-600">Complete your profile in minutes and start applying</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">1,200+ Active Jobs</h4>
                      <p className="text-sm text-gray-600">Browse opportunities from verified employers</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Fast Hiring Process</h4>
                      <p className="text-sm text-gray-600">Get hired in an average of 3 days</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Free to Use</h4>
                      <p className="text-sm text-gray-600">No hidden fees, completely free for job seekers</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Post Jobs Instantly</h4>
                      <p className="text-sm text-gray-600">Reach thousands of qualified candidates</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Large Talent Pool</h4>
                      <p className="text-sm text-gray-600">Access to thousands of active job seekers</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Fast Responses</h4>
                      <p className="text-sm text-gray-600">Candidates respond within hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Verified Platform</h4>
                      <p className="text-sm text-gray-600">All profiles are verified for authenticity</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-800">{userType === 'jobseeker' ? '1,200+' : '350+'}</div>
                  <div className="text-xs text-gray-600">{userType === 'jobseeker' ? 'Active Jobs' : 'Companies'}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">3 Days</div>
                  <div className="text-xs text-gray-600">Avg. Time to Hire</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full max-w-2xl flex-1">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Create Your Account
            </h2>
            <p className="text-gray-600">
              Join thousands of {userType === 'jobseeker' ? 'job seekers' : 'employers'}
            </p>
          </div>

          {/* User Type Toggle */}
          <div className="mb-6">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  setUserType('jobseeker');
                  setCurrentStep(1);
                }}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition ${
                  userType === 'jobseeker'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserType('employer');
                  setCurrentStep(1);
                }}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition ${
                  userType === 'employer'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Employer
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              {Array.from({ length: maxSteps }).map((_, index) => {
                const step = index + 1;
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          step < currentStep
                            ? 'bg-green-500 text-white'
                            : step === currentStep
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {step < currentStep ? '✓' : step}
                      </div>
                      <p className={`text-xs mt-2 text-center ${step === currentStep ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                        {userType === 'jobseeker' 
                          ? ['Account Setup', 'Professional Info', 'Complete Profile'][index]
                          : ['Company Details', 'Additional Info'][index]
                        }
                      </p>
                    </div>
                    {step < maxSteps && (
                      <div className={`h-1 flex-1 mx-2 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error mb-6">
              <div className="flex items-start gap-3">
                <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">Registration Failed</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="glass rounded-xl p-8 shadow-soft">
            {/* Google OAuth Button - Only on step 1 */}
            {currentStep === 1 && (
              <>
                <button
                  type="button"
                  onClick={startGoogleSignup}
                  className="w-full mb-4 flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-800 rounded-lg hover:bg-gray-50 transition bg-white font-medium"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                    <path fill="#EA4335" d="M12 10.2h10.5c.1.6.1 1.2.1 1.8 0 6-4 10-10.6 10-6.1 0-11-4.9-11-11s4.9-11 11-11c2.9 0 5.3 1.1 7.2 2.8l-2.9 2.8C15.1 4.7 13.7 4 12 4 8.7 4 6 6.7 6 10s2.7 6 6 6c3 0 4.9-1.7 5.4-4.1H12v-1.7z"/>
                  </svg>
                  <span>Sign up with Google</span>
                </button>

                {/* Demo Account Button */}
                <button
                  type="button"
                  onClick={useDemoAccount}
                  className="w-full mb-4 flex items-center justify-center gap-3 px-6 py-3 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition bg-white font-medium text-blue-600"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Try {userType === 'jobseeker' ? 'Job Seeker' : 'Employer'} Demo Account</span>
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500">Or register with email</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* JOB SEEKER FORMS */}
              {userType === 'jobseeker' && (
                <>
                  {/* Step 1: Account Setup */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                      
                      <div>
                        <label className="form-label">Full Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="name"
                          value={jobSeekerData.name}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Enter your full name"
                        />
                        {errors.name && <p className="form-error">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="form-label">Email Address <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          name="email"
                          value={jobSeekerData.email}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="your.email@example.com"
                        />
                        {errors.email && <p className="form-error">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="form-label">Password <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={jobSeekerData.password}
                            onChange={handleChange}
                            className="form-input pr-10"
                            placeholder="Create a strong password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {showPassword ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              )}
                            </svg>
                          </button>
                        </div>
                        {errors.password && <p className="form-error">{errors.password}</p>}
                        <p className="text-xs text-gray-500 mt-1">
                          Must be at least 6 characters with uppercase, lowercase, and number
                        </p>
                      </div>

                      <div>
                        <label className="form-label">Confirm Password <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={jobSeekerData.confirmPassword}
                            onChange={handleChange}
                            className="form-input pr-10"
                            placeholder="Re-enter your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              {showConfirmPassword ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              )}
                            </svg>
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                      </div>

                      <div>
                        <label className="form-label">Phone Number <span className="text-red-500">*</span></label>
                        <input
                          type="tel"
                          name="phone"
                          value={jobSeekerData.phone}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="+1-234-567-8900"
                        />
                        {errors.phone && <p className="form-error">{errors.phone}</p>}
                      </div>

                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={handleNext}
                          className="btn btn-primary w-full"
                        >
                          Next: Professional Information →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Professional Info */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Professional Profile</h3>
                      
                      <div>
                        <label className="form-label">Current Location <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="location"
                          value={jobSeekerData.location}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="City, State"
                        />
                        {errors.location && <p className="form-error">{errors.location}</p>}
                      </div>

                      <div>
                        <label className="form-label">Preferred Job Locations (optional)</label>
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
                            className="form-input flex-1"
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
                          {jobSeekerData.preferredLocations.map((location, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm border border-gray-300"
                            >
                              {location}
                              <button
                                type="button"
                                onClick={() => removeFromArray('preferredLocations', location)}
                                className="ml-2 text-gray-600 hover:text-gray-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="form-label">Recent Jobs (optional)</label>
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
                            className="form-input flex-1"
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
                          {jobSeekerData.recentJobs.map((job, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm border border-gray-300"
                            >
                              {job}
                              <button
                                type="button"
                                onClick={() => removeFromArray('recentJobs', job)}
                                className="ml-2 text-gray-600 hover:text-gray-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="form-label">Experience Level <span className="text-red-500">*</span></label>
                        <select
                          name="experienceLevel"
                          value={jobSeekerData.experienceLevel}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="Entry Level">Entry Level (0-1 years)</option>
                          <option value="Some Experience">Some Experience (1-3 years)</option>
                          <option value="Experienced">Experienced (3-5 years)</option>
                          <option value="Very Experienced">Very Experienced (5+ years)</option>
                        </select>
                        {errors.experienceLevel && <p className="form-error">{errors.experienceLevel}</p>}
                      </div>

                      <div>
                        <label className="form-label">Key Skills <span className="text-red-500">*</span></label>
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
                            className="form-input flex-1"
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
                          {jobSeekerData.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm border border-gray-300"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeFromArray('skills', skill)}
                                className="ml-2 text-gray-600 hover:text-gray-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        {errors.skills && <p className="form-error">{errors.skills}</p>}
                        <p className="text-xs text-gray-500 mt-1">
                          Add at least one skill (e.g., Customer Service, Physical Labor, Driving)
                        </p>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={handlePrevious}
                          className="flex-1 btn btn-secondary"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={handleNext}
                          className="flex-1 btn btn-primary"
                        >
                          Next: Complete Profile →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Complete Profile */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Complete Your Profile</h3>
                        <button
                          type="button"
                          onClick={handleSkipStep3}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Skip this step
                        </button>
                      </div>

                      <p className="text-sm text-gray-600">
                        All fields in this step are optional. You can complete your profile now or add these details later.
                      </p>

                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-md font-medium text-gray-800 mb-3">Education</h4>
                        
                        <div>
                          <label className="form-label">Highest Qualification</label>
                          <select
                            name="degree"
                            value={jobSeekerData.degree}
                            onChange={handleChange}
                            className="form-select"
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
                            className="form-input flex-1"
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
                          {jobSeekerData.languages.map((language, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm border border-gray-300"
                            >
                              {language}
                              <button
                                type="button"
                                onClick={() => removeFromArray('languages', language)}
                                className="ml-2 text-gray-600 hover:text-gray-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-md font-medium text-gray-800 mb-3">Expected Salary Range</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="form-label">Minimum</label>
                            <input
                              type="number"
                              name="expectedSalaryMin"
                              value={jobSeekerData.expectedSalaryMin}
                              onChange={handleChange}
                              min="0"
                              className="form-input"
                              placeholder="30000"
                            />
                          </div>

                          <div>
                            <label className="form-label">Maximum</label>
                            <input
                              type="number"
                              name="expectedSalaryMax"
                              value={jobSeekerData.expectedSalaryMax}
                              onChange={handleChange}
                              min="0"
                              className="form-input"
                              placeholder="50000"
                            />
                          </div>

                          <div>
                            <label className="form-label">Currency</label>
                            <input
                              type="text"
                              value="INR (₹)"
                              disabled
                              className="form-input bg-gray-100"
                            />
                          </div>

                          <div>
                            <label className="form-label">Period</label>
                            <select
                              name="salaryPeriod"
                              value={jobSeekerData.salaryPeriod}
                              onChange={handleChange}
                              className="form-select"
                            >
                              <option value="hour">Per Hour</option>
                              <option value="month">Per Month</option>
                              <option value="year">Per Year</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-md font-medium text-gray-800 mb-3">Work Preferences</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="form-label">Availability</label>
                            <select
                              name="availability"
                              value={jobSeekerData.availability}
                              onChange={handleChange}
                              className="form-select"
                            >
                              <option value="Immediate">Immediate</option>
                              <option value="Within 30 days">Within 30 days</option>
                              <option value="Within 60 days">Within 60 days</option>
                              <option value="Contract">Contract basis</option>
                              <option value="Negotiable">Negotiable</option>
                            </select>
                          </div>

                          <div>
                            <label className="form-label">Work Preference</label>
                            <select
                              name="workPreference"
                              value={jobSeekerData.workPreference}
                              onChange={handleChange}
                              className="form-select"
                            >
                              <option value="Remote">Remote</option>
                              <option value="Hybrid">Hybrid</option>
                              <option value="On-site">On-site</option>
                              <option value="Flexible">Flexible</option>
                            </select>
                          </div>

                          <div>
                            <label className="form-label">Willing to Relocate</label>
                            <select
                              name="willingToRelocate"
                              value={jobSeekerData.willingToRelocate}
                              onChange={handleChange}
                              className="form-select"
                            >
                              <option value="Yes">Yes</option>
                              <option value="No">No</option>
                              <option value="Maybe">Maybe</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-md font-medium text-gray-800 mb-3">Career Summary / Bio</h4>
                        
                        <textarea
                          name="bio"
                          value={jobSeekerData.bio}
                          onChange={handleChange}
                          rows={4}
                          maxLength={500}
                          className="form-textarea"
                          placeholder="Tell employers about yourself, your experience, strengths, and what you're looking for..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {jobSeekerData.bio.length}/500 characters
                        </p>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={handlePrevious}
                          className="flex-1 btn btn-secondary"
                        >
                          ← Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 btn btn-primary"
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
                </>
              )}

              {/* EMPLOYER FORMS */}
              {userType === 'employer' && (
                <>
                  {/* Step 1: Company Details */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Company & Contact Information</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="form-label">Company Name <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            name="companyName"
                            value={employerData.companyName}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Your company name"
                          />
                          {errors.companyName && <p className="form-error">{errors.companyName}</p>}
                        </div>

                        <div className="md:col-span-2">
                          <label className="form-label">Company Email <span className="text-red-500">*</span></label>
                          <input
                            type="email"
                            name="email"
                            value={employerData.email}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="company@example.com"
                          />
                          {errors.email && <p className="form-error">{errors.email}</p>}
                        </div>

                        <div className="md:col-span-2">
                          <label className="form-label">Company Website (optional)</label>
                          <input
                            type="url"
                            name="website"
                            value={employerData.website}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="https://www.example.com"
                          />
                        </div>

                        <div>
                          <label className="form-label">Contact Person Name <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            name="contactPersonName"
                            value={employerData.contactPersonName}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Full name"
                          />
                          {errors.contactPersonName && <p className="form-error">{errors.contactPersonName}</p>}
                        </div>

                        <div>
                          <label className="form-label">Contact Person Role <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            name="contactPersonRole"
                            value={employerData.contactPersonRole}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="e.g., HR Manager, Owner"
                          />
                          {errors.contactPersonRole && <p className="form-error">{errors.contactPersonRole}</p>}
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <h4 className="text-md font-medium text-gray-800 mb-3">Contact Numbers</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="form-label">Primary Phone Number <span className="text-red-500">*</span></label>
                            <div className="space-y-2">
                              <input
                                type="tel"
                                name="phone"
                                value={employerData.phone}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="+1-234-567-8900"
                              />
                              <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                  type="checkbox"
                                  name="primaryHasWhatsApp"
                                  checked={employerData.primaryHasWhatsApp}
                                  onChange={handleChange}
                                  className="w-4 h-4 text-gray-800 border-gray-300 rounded focus:ring-gray-500"
                                />
                                <span>This number has WhatsApp</span>
                              </label>
                            </div>
                            {errors.phone && <p className="form-error">{errors.phone}</p>}
                          </div>

                          <div>
                            <label className="form-label">Secondary Phone Number <span className="text-red-500">*</span></label>
                            <div className="space-y-2">
                              <input
                                type="tel"
                                name="secondaryPhone"
                                value={employerData.secondaryPhone}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="+1-234-567-8901"
                              />
                              <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                  type="checkbox"
                                  name="secondaryHasWhatsApp"
                                  checked={employerData.secondaryHasWhatsApp}
                                  onChange={handleChange}
                                  className="w-4 h-4 text-gray-800 border-gray-300 rounded focus:ring-gray-500"
                                />
                                <span>This number has WhatsApp</span>
                              </label>
                            </div>
                            {errors.secondaryPhone && <p className="form-error">{errors.secondaryPhone}</p>}
                          </div>

                          {errors.whatsapp && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                              <p className="text-sm text-amber-800 flex items-center gap-2">
                                <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.whatsapp}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="form-label">Company Location <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="location"
                          value={employerData.location}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="City, State"
                        />
                        {errors.location && <p className="form-error">{errors.location}</p>}
                      </div>

                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <h4 className="text-md font-medium text-gray-800 mb-3">Account Security</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="form-label">Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={employerData.password}
                                onChange={handleChange}
                                className="form-input pr-10"
                                placeholder="Create a strong password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  {showPassword ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                  ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  )}
                                </svg>
                              </button>
                            </div>
                            {errors.password && <p className="form-error">{errors.password}</p>}
                            <p className="text-xs text-gray-500 mt-1">
                              Must be at least 6 characters with uppercase, lowercase, and number
                            </p>
                          </div>

                          <div>
                            <label className="form-label">Confirm Password <span className="text-red-500">*</span></label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={employerData.confirmPassword}
                                onChange={handleChange}
                                className="form-input pr-10"
                                placeholder="Re-enter your password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  {showConfirmPassword ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                  ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  )}
                                </svg>
                              </button>
                            </div>
                            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={handleNext}
                          className="btn btn-primary w-full"
                        >
                          Next: Additional Information →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Additional Information */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Additional Company Information</h3>
                        <p className="text-sm text-gray-600">(All fields optional)</p>
                      </div>

                      <div>
                        <label className="form-label">Industry</label>
                        <select
                          name="industry"
                          value={employerData.industry}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="">Select industry</option>
                          <option value="Technology">Technology</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Retail">Retail</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Construction">Construction</option>
                          <option value="Education">Education</option>
                          <option value="Hospitality">Hospitality</option>
                          <option value="Finance">Finance</option>
                          <option value="Transportation">Transportation</option>
                          <option value="Agriculture">Agriculture</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Company Size</label>
                        <select
                          name="companySize"
                          value={employerData.companySize}
                          onChange={handleChange}
                          className="form-select"
                        >
                          <option value="">Select company size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="501-1000">501-1000 employees</option>
                          <option value="1000+">1000+ employees</option>
                        </select>
                      </div>

                      <div>
                        <label className="form-label">Company Address</label>
                        <input
                          type="text"
                          name="companyAddress"
                          value={employerData.companyAddress}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Street address"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="form-label">City</label>
                          <input
                            type="text"
                            name="city"
                            value={employerData.city}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="City"
                          />
                        </div>

                        <div>
                          <label className="form-label">State/Province</label>
                          <input
                            type="text"
                            name="state"
                            value={employerData.state}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="State or Province"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-gray-200 mt-6">
                        <button
                          type="button"
                          onClick={handlePrevious}
                          className="flex-1 btn btn-secondary"
                        >
                          ← Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 btn btn-primary"
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
                </>
              )}
            </form>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to={`/login/${userType}`}
                className="font-semibold text-gray-800 hover:text-gray-600"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoRegister;
