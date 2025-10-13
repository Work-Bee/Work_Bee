import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatWizard from '../components/ChatWizard';

const Register = () => {
  // Overlay state
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState('');
  const { register: registerUser, loading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    if (typeFromUrl && ['jobseeker', 'employer'].includes(typeFromUrl)) {
      setUserType(typeFromUrl);
    }
  }, [searchParams]);

  // Legacy form flow removed; chat overlay handles input/validation now

  // Build chat steps for both flows
  const phoneValidate = (v) => (/^[0-9+()\-\s]{7,15}$/.test(v) ? null : 'Please enter a valid phone number');

  const seekerSteps = [
    { key: 'name', prompt: 'Great! What should we call you?', type: 'text', placeholder: 'Your full name' , validate: (v)=> v.trim().length<2? 'Name must be at least 2 characters': null},
    { key: 'email', prompt: 'What’s your email address?', type: 'email', placeholder: 'you@example.com', validate: (v)=> /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v) ? null : 'Invalid email address' },
    { key: 'passwords', prompt: 'Create your password (enter twice to confirm)', type: 'group', fields: [
        { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
        { key: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
      ], validate: (v) => {
        const pw = (v?.password || '').toString();
        const cpw = (v?.confirmPassword || '').toString();
        if (pw.length < 6 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pw)) return 'Must be 6+ chars with uppercase, lowercase, and number';
        if (pw !== cpw) return 'Passwords do not match';
        return null;
      }
    },
    { key: 'phone', prompt: 'Your phone number?', type: 'tel', placeholder: '+91 9XXXXXXXXX', validate: phoneValidate },
    { key: 'location', prompt: 'Where are you based? (City, State)', type: 'text', placeholder: 'Kochi, Kerala' },
  { key: 'experienceLevel', prompt: 'Your experience level?', type: 'select', options: ['Entry Level', 'Some Experience', 'Experienced', 'Very Experienced'] },
    { key: 'skills', prompt: 'Add a few skills or interests. Press Enter to add each.', type: 'chips', placeholder: 'e.g., Construction, Driving, Customer Service', optional: true },
    { key: 'preferredLocations', prompt: 'Preferred locations (optional). Add a few and press Add.', type: 'chips', optional: true },
    { key: 'recentJobs', prompt: 'Recent job titles/roles (optional). Add and press Add.', type: 'chips', optional: true },
    { key: 'degree', prompt: 'Highest degree (optional)', type: 'text', optional: true },
    { key: 'languages', prompt: 'Languages you speak (optional). Add and press Add.', type: 'chips', optional: true },
    { key: 'expectedSalary', prompt: 'Expected monthly salary (optional)', type: 'group', optional: true, fields: [
        { key: 'expectedSalaryMin', label: 'Min (INR)', type: 'number', placeholder: 'e.g., 12000' },
        { key: 'expectedSalaryMax', label: 'Max (INR)', type: 'number', placeholder: 'e.g., 20000' },
      ], validate: (v)=> {
        if (!v) return null;
        const min = v.expectedSalaryMin?.toString().trim();
        const max = v.expectedSalaryMax?.toString().trim();
        if (min && !/^\d+$/.test(min)) return 'Min: numbers only';
        if (max && !/^\d+$/.test(max)) return 'Max: numbers only';
        if (min && max && Number(max) < Number(min)) return 'Max must be >= Min';
        return null;
      }
    },
  { key: 'availability', prompt: 'Availability to start?', type: 'select', options: ['Immediate', 'Within 30 days', 'Within 60 days', 'Contract', 'Negotiable'], optional: true },
    { key: 'workPreference', prompt: 'Work preference?', type: 'select', options: ['Flexible', 'On-site', 'Remote'], optional: true },
    { key: 'willingToRelocate', prompt: 'Willing to relocate?', type: 'select', options: ['Yes', 'No', 'Maybe'], optional: true },
    { key: 'bio', prompt: 'Brief bio (optional)', type: 'text', optional: true },
  ];

  const employerSteps = [
    { key: 'companyName', prompt: 'What’s your company name?', type: 'text', validate: (v)=> v.trim().length<2? 'Company name must be at least 2 characters': null },
    { key: 'officialEmail', prompt: 'Your official company email?', type: 'email', validate: (v)=> {
        if(!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v)) return 'Enter a valid email';
        if(/gmail\.com|yahoo\.com|hotmail\.com|outlook\.com/i.test(v)) return 'Use an official company email';
        return null;
      }
    },
    { key: 'contactPersonName', prompt: 'Your name (contact person)?', type: 'text', validate: (v)=> v.trim().length<2? 'Name must be at least 2 characters': null },
    { key: 'contactPersonRole', prompt: 'Your role in the company?', type: 'text' },
    {
      key: 'phones',
      prompt: 'Primary and secondary contacts (mark WhatsApp if available)',
      type: 'group',
      fields: [
        { key: 'phone', label: 'Primary phone', type: 'tel', placeholder: '+91 9XXXXXXXXX' },
        { key: 'primaryHasWhatsApp', label: 'Primary WhatsApp?', type: 'checkbox', checkboxLabel: 'Has WhatsApp' },
        { key: 'secondaryPhone', label: 'Secondary phone', type: 'tel', placeholder: '+91 9XXXXXXXXX' },
        { key: 'secondaryHasWhatsApp', label: 'Secondary WhatsApp?', type: 'checkbox', checkboxLabel: 'Has WhatsApp' },
      ],
      validate: (v) => {
        if (!v) return 'This field is required';
        const phoneErr = phoneValidate(v.phone);
        if (phoneErr) return phoneErr;
        const secErr = v.secondaryPhone ? phoneValidate(v.secondaryPhone) : null;
        if (secErr) return secErr;
        if (v.secondaryPhone && v.phone && v.secondaryPhone.trim() === v.phone.trim()) return 'Secondary must differ from primary';
        if (!v.primaryHasWhatsApp && !v.secondaryHasWhatsApp) return 'At least one number must have WhatsApp';
        return null;
      }
    },
    { key: 'location', prompt: 'Where is your business located? (City, State)', type: 'text' },
  { key: 'industry', prompt: 'Which industry are you in?', type: 'select', options: ['IT','Finance','Healthcare','Manufacturing','Retail','Construction','Education','Food Service','Transportation','Real Estate','Other'] },
  { key: 'companySize', prompt: 'Company size?', type: 'select', options: ['1-10','11-50','51-200','200+'] },
    { key: 'website', prompt: 'Company website (optional)', type: 'text', optional: true },
    { key: 'linkedInPage', prompt: 'LinkedIn page (optional)', type: 'text', optional: true, validate: (v, d)=> {
        if (!v && !d.website) return 'Provide a company website or LinkedIn page';
        return null;
      }
    },
    {
      key: 'passwords',
      prompt: 'Create your password (enter twice to confirm)',
      type: 'group',
      fields: [
        { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
        { key: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
      ],
      validate: (v) => {
        const pw = (v?.password || '').toString();
        const cpw = (v?.confirmPassword || '').toString();
        if (pw.length < 6 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pw)) return 'Must be 6+ chars with uppercase, lowercase, and number';
        if (pw !== cpw) return 'Passwords do not match';
        return null;
      }
    },
  ];

  const [showOverlay, setShowOverlay] = useState(false);

  // Handlers to open overlays
  const openSeeker = () => { setUserType('jobseeker'); setShowOverlay(true); };
  const openEmployer = () => { setUserType('employer'); setShowOverlay(true); };

  // Complete actions
  const handleSeekerComplete = async (d) => {
    // when using grouped passwords, ChatWizard merges fields by key, so d.password and d.confirmPassword exist
    const payload = {
      role: 'jobseeker',
      name: d.name,
      email: d.email,
      password: d.password,
      phone: d.phone,
      location: d.location,
      experienceLevel: d.experienceLevel,
      ...(Array.isArray(d.skills) && d.skills.length ? { skills: d.skills } : {}),
      ...(Array.isArray(d.preferredLocations) && d.preferredLocations.length ? { preferredLocations: d.preferredLocations } : {}),
      ...(Array.isArray(d.recentJobs) && d.recentJobs.length ? { recentJobs: d.recentJobs } : {}),
      ...(d.degree ? { degree: d.degree } : {}),
      ...(Array.isArray(d.languages) && d.languages.length ? { languages: d.languages } : {}),
      ...((d.expectedSalaryMin || d.expectedSalaryMax) ? { expectedSalary: { min: Number(d.expectedSalaryMin) || 0, max: Number(d.expectedSalaryMax) || Number(d.expectedSalaryMin) || 0, currency: 'INR', period: 'month' } } : {}),
      ...(d.availability ? { availability: d.availability } : {}),
      ...(d.workPreference ? { workPreference: d.workPreference } : {}),
      ...(d.willingToRelocate ? { willingToRelocate: d.willingToRelocate } : {}),
      ...(d.bio ? { bio: d.bio } : {}),
    };
    const result = await registerUser(payload);
    if (result.success) navigate('/jobseeker/home');
  };

  const handleEmployerComplete = async (d) => {
    // After group step ChatWizard merges phone and whatsapp flags into top-level keys: phone, secondaryPhone, primaryHasWhatsApp, secondaryHasWhatsApp
    const payload = {
      role: 'employer',
      name: d.contactPersonName,
      email: d.officialEmail,
      password: d.password,
      phone: d.phone,
      secondaryPhone: d.secondaryPhone,
      location: d.location,
      primaryHasWhatsApp: !!d.primaryHasWhatsApp,
      secondaryHasWhatsApp: !!d.secondaryHasWhatsApp,
      companyDetails: {
        companyName: d.companyName,
        officialEmail: d.officialEmail,
        website: d.website || undefined,
        linkedInPage: d.linkedInPage || undefined,
        contactPersonRole: d.contactPersonRole,
        industry: d.industry,
        companySize: d.companySize,
      },
    };
    const result = await registerUser(payload);
    if (result.success) navigate('/employer/home');
  };

  const seekerInitial = { name: '', email: '', password: '', phone: '', location: '', experienceLevel: 'Entry Level', skills: [] };
  const employerInitial = { companyName: '', officialEmail: '', contactPersonName: '', contactPersonRole: '', phone: '', secondaryPhone: '', whatsapp: false, location: '', industry: '', companySize: '', website: '', password: '' };

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
            <Link to="/" className="font-medium text-primary-600 hover:text-primary-500">
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

        {/* User Type Selection (unchanged) */}
        {!showOverlay && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Choose your registration type
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={openSeeker}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-primary-300 block"
              >
                <div className="flex flex-col items-center">
                  <svg className="h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                  <span className="font-medium text-gray-900">Looking for a Job</span>
                  <span className="text-sm text-gray-500 mt-1">Find opportunities and apply</span>
                </div>
              </button>

              <button
                type="button"
                onClick={openEmployer}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-primary-300 block"
              >
                <div className="flex flex-col items-center">
                  <svg className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2-2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-4a2 2 0 012-2h2a2 2 0 012 2v4.01" />
                  </svg>
                  <span className="font-medium text-gray-900">Hiring Talent</span>
                  <span className="text-sm text-gray-500 mt-1">Post jobs and find candidates</span>
                </div>
              </button>
            </div>
            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">← Back to homepage</Link>
            </div>
          </div>
        )}

        {/* Chat Overlays */}
        {showOverlay && userType === 'jobseeker' && (
          <ChatWizard
            isOpen
            title="Let's set up your jobseeker profile"
            steps={seekerSteps}
            initialData={seekerInitial}
            onBack={() => { setShowOverlay(false); setUserType(''); }}
            onComplete={handleSeekerComplete}
            loading={loading}
            error={error || ''}
          />
        )}
        {showOverlay && userType === 'employer' && (
          <ChatWizard
            isOpen
            title="Let's create your employer account"
            steps={employerSteps}
            initialData={employerInitial}
            onBack={() => { setShowOverlay(false); setUserType(''); }}
            onComplete={handleEmployerComplete}
            loading={loading}
            error={error || ''}
          />
        )}
      </div>
    </div>
  );
};

export default Register;