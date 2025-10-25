import React from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { jobAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const CATEGORY_OPTIONS = [
  'Manufacturing',
  'Construction',
  'Retail',
  'Food Service',
  'Hospitality',
  'Transportation',
  'Warehouse',
  'Agriculture',
  'Cleaning',
  'Security',
  'Delivery',
  'Customer Service',
  'General Labor',
  'Other',
];

const EMPLOYMENT_TYPE_OPTIONS = ['Full-time', 'Part-time'];
const DURATION_OPTIONS = ['Permanent', 'Contract', 'Temporary', 'Seasonal'];
const EXPERIENCE_OPTIONS = ['Entry Level', '1-2 years', '3-5 years', '5+ years'];
const SALARY_PERIOD_OPTIONS = ['hour', 'day', 'week', 'month', 'year'];
const SALARY_CURRENCY_OPTIONS = ['INR'];

const listFromText = (value) => {
  if (!value) return [];
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const formatListForTextarea = (list) => (Array.isArray(list) && list.length ? list.join('\n') : '');

const formatTags = (list) => (Array.isArray(list) && list.length ? list.join(', ') : '');

const getDefaultDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
};

const EmployerJobForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const location = useLocation();
  const duplicateFrom = location.state?.duplicateFrom;
  const { user } = useAuth();

  const [loading, setLoading] = React.useState(mode === 'edit');
  const [submitError, setSubmitError] = React.useState('');
  const [submitSuccess, setSubmitSuccess] = React.useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      responsibilities: '',
      category: CATEGORY_OPTIONS[0],
      employmentType: EMPLOYMENT_TYPE_OPTIONS[0],
      duration: DURATION_OPTIONS[0],
      experienceLevel: EXPERIENCE_OPTIONS[0],
      salaryMin: '',
      salaryMax: '',
      salaryCurrency: 'INR',
      salaryPeriod: 'month',
      location: '',
      postalCode: '',
      remote: false,
      applicationDeadline: getDefaultDate(),
      tags: '',
      isActive: true,
    },
  });

  React.useEffect(() => {
    const populateFromJob = (job) => {
      if (!job) return;

      const deadlineDate = job.applicationDeadline ? new Date(job.applicationDeadline) : null;
      const isDeadlineValid = deadlineDate && !Number.isNaN(deadlineDate.valueOf()) && deadlineDate > new Date();
      const deadlineValue = (isDeadlineValid ? deadlineDate : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))
        .toISOString()
        .slice(0, 10);

      reset({
        title: job.title || '',
        description: job.description || '',
        requirements: formatListForTextarea(job.requirements),
        responsibilities: formatListForTextarea(job.responsibilities),
        category: job.category || CATEGORY_OPTIONS[0],
        employmentType: job.jobType || job.employmentType || EMPLOYMENT_TYPE_OPTIONS[0], // Map jobType to employmentType
        duration: job.duration || DURATION_OPTIONS[0],
        experienceLevel: job.experienceLevel || EXPERIENCE_OPTIONS[0],
        salaryMin: job.salary?.min ?? '',
        salaryMax: job.salary?.max ?? '',
        salaryCurrency: 'INR',
        salaryPeriod: job.salary?.period || 'month',
        location: job.location?.city || job.location?.address || '',
        postalCode: job.location?.zipCode || '',
        remote: Boolean(job.location?.remote),
        applicationDeadline: deadlineValue,
        tags: formatTags(job.tags),
        isActive: job.isActive ?? true,
      });
    };

    if (mode === 'edit' && jobId) {
      const fetchJob = async () => {
        try {
          setLoading(true);
          const response = await jobAPI.getJob(jobId);
          populateFromJob(response.data.data);
        } catch (error) {
          console.error('Failed to load job for editing', error);
          setSubmitError('Unable to load the job details for editing.');
        } finally {
          setLoading(false);
        }
      };

      fetchJob();
    } else if (duplicateFrom) {
      populateFromJob(duplicateFrom);
    } else {
      reset((current) => ({
        ...current,
        applicationDeadline: getDefaultDate(),
      }));
    }
  }, [mode, jobId, duplicateFrom, reset]);

  const onSubmit = async (formValues) => {
    try {
      setSubmitError('');
      setSubmitSuccess('');

      const payload = {
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        requirements: listFromText(formValues.requirements),
        responsibilities: listFromText(formValues.responsibilities),
        category: formValues.category,
        jobType: formValues.employmentType, // Map employmentType to jobType for backend
        experienceLevel: formValues.experienceLevel,
        salary: {
          min: Number(formValues.salaryMin),
          max: Number(formValues.salaryMax),
          currency: 'INR',
          period: formValues.salaryPeriod,
        },
        location: {
          address: formValues.location.trim() || '',
          city: formValues.location.trim() || '',
          state: 'Kerala',
          zipCode: formValues.postalCode.trim() || '',
          remote: Boolean(formValues.remote),
        },
        applicationDeadline: new Date(formValues.applicationDeadline).toISOString(),
        tags: listFromText(formValues.tags),
      };

      console.log('Submitting payload:', JSON.stringify(payload, null, 2));

      if (mode === 'edit') {
        payload.isActive = Boolean(formValues.isActive);
      }

      if (mode === 'edit' && jobId) {
        await jobAPI.updateJob(jobId, payload);
        setSubmitSuccess('Job updated successfully.');
      } else {
        await jobAPI.createJob(payload);
        setSubmitSuccess('Job posted successfully.');
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving job', error);
      console.error('Error details:', error.response?.data);
      
      // Show detailed validation errors if available
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        console.log('Validation errors:', error.response.data.details);
        const errorMessages = error.response.data.details
          .map(err => {
            // Handle both express-validator format and custom format
            const field = err.param || err.path || err.field || 'unknown';
            const message = err.msg || err.message || 'Invalid value';
            return `${field}: ${message}`;
          })
          .join('; ');
        setSubmitError(`Validation failed: ${errorMessages}`);
      } else {
        const apiError = error.response?.data?.error || error.response?.data?.message || 'Failed to save the job. Please try again.';
        setSubmitError(apiError);
      }
    }
  };

  if (loading) {
    return (
      <div className="py-20">
        <LoadingSpinner text="Loading job details..." />
      </div>
    );
  }

  // Check if employer has company profile with required fields
  const hasCompanyProfile = user?.companyDetails?.companyName && user?.companyDetails?.industry;
  
  if (!hasCompanyProfile) {
    return (
      <div className="bg-gray-50 min-h-screen py-10 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
            <div className="mx-auto h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Company Profile Required</h2>
            <p className="text-gray-600 mb-6">
              You need to complete your company profile before posting jobs. This helps job seekers learn more about your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/dashboard/profile?wizard=1"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Complete Company Profile
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header with Illustration */}
        <div className="mb-8 relative bg-gradient-to-r from-purple-500 to-green-500 rounded-3xl p-8 overflow-hidden shadow-lg">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
          
          {/* Floating decorative shapes */}
          <div className="absolute top-8 right-1/4 animate-pulse">
            <div className="w-3 h-3 bg-white/30 rounded-full"></div>
          </div>
          <div className="absolute bottom-12 right-1/3 animate-pulse" style={{animationDelay: '0.5s'}}>
            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
          </div>
          <div className="absolute top-16 left-1/4 animate-pulse" style={{animationDelay: '1s'}}>
            <div className="w-2.5 h-2.5 bg-white/35 rounded-full"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">
                  {mode === 'edit' ? 'Edit job posting' : 'Post a new job'}
                </h1>
                <p className="text-white/90 max-w-2xl">
                  Provide details about the role so that qualified candidates can apply quickly. Required fields are marked with *.
                </p>
              </div>
            </div>
            
            {/* Quick tip badge */}
            <div className="hidden lg:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30 max-w-xs">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-white flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-white mb-1">Quick Tip</p>
                    <p className="text-xs text-white/80">Clear job descriptions get 2x more quality applications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8">
          {submitError && (
            <div className="alert alert-error mb-6">
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="relative bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-300 rounded-2xl p-6 mb-6 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-300/20 rounded-full translate-y-1/2 -translate-x-1/2"></div>
              
              {/* Animated decorative dots */}
              <div className="absolute top-4 right-16 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="absolute bottom-6 right-24 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
              
              <div className="relative z-10 flex items-center">
                {/* Success icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-bold text-green-900 text-lg">{submitSuccess}</h3>
                  <p className="text-green-700 text-sm mt-1">Your job posting is now live and visible to candidates</p>
                </div>
                
                {/* Confetti-like decorative elements */}
                <div className="hidden sm:flex items-center space-x-1 ml-4">
                  <div className="w-2 h-2 bg-green-400 rounded-sm rotate-12"></div>
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-sm -rotate-12"></div>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Role information</h2>
                <p className="text-sm text-gray-500">Share the essentials about the job opening.</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <label className="form-label" htmlFor="title">Job title *</label>
                  <input
                    id="title"
                    type="text"
                    className="form-input"
                    {...register('title', { required: 'Job title is required' })}
                  />
                  {errors.title && <p className="form-error">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="form-label" htmlFor="category">Category *</label>
                  <select id="category" className="form-input" {...register('category', { required: true })}>
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" htmlFor="employmentType">Employment type *</label>
                  <select id="employmentType" className="form-input" {...register('employmentType', { required: true })}>
                    {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" htmlFor="duration">Duration *</label>
                  <select id="duration" className="form-input" {...register('duration', { required: true })}>
                    {DURATION_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" htmlFor="experienceLevel">Experience level *</label>
                  <select id="experienceLevel" className="form-input" {...register('experienceLevel', { required: true })}>
                    {EXPERIENCE_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" htmlFor="applicationDeadline">Application deadline *</label>
                  <input
                    id="applicationDeadline"
                    type="date"
                    className="form-input"
                    {...register('applicationDeadline', { required: 'Application deadline is required' })}
                  />
                  {errors.applicationDeadline && <p className="form-error">{errors.applicationDeadline.message}</p>}
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="description">Job description *</label>
                <textarea
                  id="description"
                  rows={6}
                  className="form-textarea"
                  {...register('description', { required: 'Job description is required' })}
                />
                {errors.description && <p className="form-error">{errors.description.message}</p>}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <label className="form-label" htmlFor="requirements">Requirements (one per line)</label>
                  <textarea id="requirements" rows={4} className="form-textarea" {...register('requirements')} />
                </div>
                <div>
                  <label className="form-label" htmlFor="responsibilities">Responsibilities (one per line)</label>
                  <textarea id="responsibilities" rows={4} className="form-textarea" {...register('responsibilities')} />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Compensation & schedule</h2>
                <p className="text-sm text-gray-500">Tell applicants how they will be paid.</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div>
                  <label className="form-label" htmlFor="salaryMin">Salary minimum (INR) *</label>
                  <input
                    id="salaryMin"
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="e.g., 15000"
                    {...register('salaryMin', { required: 'Minimum salary is required' })}
                  />
                  {errors.salaryMin && <p className="form-error">{errors.salaryMin.message}</p>}
                </div>
                <div>
                  <label className="form-label" htmlFor="salaryMax">Salary maximum (INR) *</label>
                  <input
                    id="salaryMax"
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="e.g., 25000"
                    {...register('salaryMax', { required: 'Maximum salary is required' })}
                  />
                  {errors.salaryMax && <p className="form-error">{errors.salaryMax.message}</p>}
                </div>
                <div>
                  <label className="form-label" htmlFor="salaryPeriod">Pay period *</label>
                  <select id="salaryPeriod" className="form-input" {...register('salaryPeriod', { required: true })}>
                    {SALARY_PERIOD_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Location</h2>
                <p className="text-sm text-gray-500">Let applicants know where they would work.</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <label className="form-label" htmlFor="location">Location (City/Area) *</label>
                  <input
                    id="location"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Kochi, Kakkanad, Edappally"
                    {...register('location', { required: 'Location is required' })}
                  />
                  {errors.location && <p className="form-error">{errors.location.message}</p>}
                </div>
                <div>
                  <label className="form-label" htmlFor="postalCode">Postal code *</label>
                  <input
                    id="postalCode"
                    type="text"
                    className="form-input"
                    placeholder="e.g., 682030"
                    {...register('postalCode', { required: 'Postal code is required' })}
                  />
                  {errors.postalCode && <p className="form-error">{errors.postalCode.message}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="remote"
                    type="checkbox"
                    className="form-checkbox"
                    {...register('remote')}
                  />
                  <label htmlFor="remote" className="text-sm text-gray-700">
                    This role is remote-friendly
                  </label>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Extras</h2>
                <p className="text-sm text-gray-500">Optional details to help candidates stand out.</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <label className="form-label" htmlFor="tags">Tags (comma or new line separated)</label>
                  <textarea id="tags" rows={3} className="form-textarea" {...register('tags')} />
                </div>

                {mode === 'edit' && (
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      id="isActive"
                      type="checkbox"
                      className="form-checkbox"
                      {...register('isActive')}
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      Job is active and accepting applications
                    </label>
                  </div>
                )}
              </div>
            </section>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Publish job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployerJobForm;
