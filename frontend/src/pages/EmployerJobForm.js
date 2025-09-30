import React from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { jobAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

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

const JOB_TYPE_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Seasonal'];
const EXPERIENCE_OPTIONS = ['Entry Level', '1-2 years', '3-5 years', '5+ years'];
const SALARY_PERIOD_OPTIONS = ['hour', 'day', 'week', 'month', 'year'];
const SALARY_CURRENCY_OPTIONS = ['USD', 'INR'];

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
      jobType: JOB_TYPE_OPTIONS[0],
      experienceLevel: EXPERIENCE_OPTIONS[0],
      salaryMin: '',
      salaryMax: '',
      salaryCurrency: SALARY_CURRENCY_OPTIONS[0],
      salaryPeriod: 'hour',
      locationAddress: '',
      locationCity: '',
      locationState: '',
      locationZipCode: '',
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
        jobType: job.jobType || JOB_TYPE_OPTIONS[0],
        experienceLevel: job.experienceLevel || EXPERIENCE_OPTIONS[0],
        salaryMin: job.salary?.min ?? '',
        salaryMax: job.salary?.max ?? '',
        salaryCurrency: job.salary?.currency || SALARY_CURRENCY_OPTIONS[0],
        salaryPeriod: job.salary?.period || 'hour',
        locationAddress: job.location?.address || '',
        locationCity: job.location?.city || '',
        locationState: job.location?.state || '',
        locationZipCode: job.location?.zipCode || '',
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
        jobType: formValues.jobType,
        experienceLevel: formValues.experienceLevel,
        salary: {
          min: Number(formValues.salaryMin),
          max: Number(formValues.salaryMax),
          currency: formValues.salaryCurrency,
          period: formValues.salaryPeriod,
        },
        location: {
          address: formValues.locationAddress.trim(),
          city: formValues.locationCity.trim(),
          state: formValues.locationState.trim(),
          zipCode: formValues.locationZipCode.trim(),
          remote: Boolean(formValues.remote),
        },
        applicationDeadline: new Date(formValues.applicationDeadline).toISOString(),
        tags: listFromText(formValues.tags),
      };

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
      const apiError = error.response?.data?.error || 'Failed to save the job. Please try again.';
      setSubmitError(apiError);
    }
  };

  if (loading) {
    return (
      <div className="py-20">
        <LoadingSpinner text="Loading job details..." />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            {mode === 'edit' ? 'Edit job posting' : 'Post a new job'}
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Provide details about the role so that qualified candidates can apply quickly. Required fields are marked with *.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8">
          {submitError && (
            <div className="alert alert-error mb-6">
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="alert alert-success mb-6">
              <span>{submitSuccess}</span>
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Role information</h2>
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
                  <label className="form-label" htmlFor="jobType">Job type *</label>
                  <select id="jobType" className="form-input" {...register('jobType', { required: true })}>
                    {JOB_TYPE_OPTIONS.map((option) => (
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Compensation & schedule</h2>
                <p className="text-sm text-gray-500">Tell applicants how they will be paid.</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-4">
                <div>
                  <label className="form-label" htmlFor="salaryMin">Salary minimum *</label>
                  <input
                    id="salaryMin"
                    type="number"
                    step="0.01"
                    className="form-input"
                    {...register('salaryMin', { required: 'Minimum salary is required' })}
                  />
                  {errors.salaryMin && <p className="form-error">{errors.salaryMin.message}</p>}
                </div>
                <div>
                  <label className="form-label" htmlFor="salaryMax">Salary maximum *</label>
                  <input
                    id="salaryMax"
                    type="number"
                    step="0.01"
                    className="form-input"
                    {...register('salaryMax', { required: 'Maximum salary is required' })}
                  />
                  {errors.salaryMax && <p className="form-error">{errors.salaryMax.message}</p>}
                </div>
                <div>
                  <label className="form-label" htmlFor="salaryCurrency">Currency *</label>
                  <select id="salaryCurrency" className="form-input" {...register('salaryCurrency', { required: true })}>
                    {SALARY_CURRENCY_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Location</h2>
                <p className="text-sm text-gray-500">Let applicants know where they would work.</p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <label className="form-label" htmlFor="locationAddress">Street address *</label>
                  <input
                    id="locationAddress"
                    type="text"
                    className="form-input"
                    {...register('locationAddress', { required: 'Address is required' })}
                  />
                  {errors.locationAddress && <p className="form-error">{errors.locationAddress.message}</p>}
                </div>
                <div>
                  <label className="form-label" htmlFor="locationCity">City *</label>
                  <input
                    id="locationCity"
                    type="text"
                    className="form-input"
                    {...register('locationCity', { required: 'City is required' })}
                  />
                  {errors.locationCity && <p className="form-error">{errors.locationCity.message}</p>}
                </div>
                <div>
                  <label className="form-label" htmlFor="locationState">State *</label>
                  <input
                    id="locationState"
                    type="text"
                    className="form-input"
                    {...register('locationState', { required: 'State is required' })}
                  />
                  {errors.locationState && <p className="form-error">{errors.locationState.message}</p>}
                </div>
                <div>
                  <label className="form-label" htmlFor="locationZipCode">Postal code *</label>
                  <input
                    id="locationZipCode"
                    type="text"
                    className="form-input"
                    {...register('locationZipCode', { required: 'Postal code is required' })}
                  />
                  {errors.locationZipCode && <p className="form-error">{errors.locationZipCode.message}</p>}
                </div>
                <div className="flex items-center gap-2 pt-6">
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
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Extras</h2>
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
