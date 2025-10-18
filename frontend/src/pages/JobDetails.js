import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI, applicationAPI, API_BASE_URL } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatFullAddress, formatSalaryRange } from '../utils/formatters';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const isEmployer = user?.role === 'employer';

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await jobAPI.getJob(id);
        setJob(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error loading job', err);
        setError('We could not load this job. It might have been removed.');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  useEffect(() => {
    const checkIfApplied = async () => {
      if (!user || user.role !== 'jobseeker') {
        setHasApplied(false);
        return;
      }

      try {
        const response = await applicationAPI.getMyApplications({ limit: 100 });
        const alreadyApplied = response.data.data?.some((application) => application.job?._id === id);
        setHasApplied(alreadyApplied);
      } catch (err) {
        console.error('Error checking application status', err);
      }
    };

    checkIfApplied();
  }, [user, id]);

  const handleResumeChange = (event) => {
    setResume(event.target.files[0]);
  };

  const handleApply = async (event) => {
    event.preventDefault();
    setApplyError('');
    setApplySuccess('');

    if (!resume) {
      setApplyError('Please upload your resume to apply.');
      return;
    }

    try {
      setApplyLoading(true);
      await applicationAPI.applyForJob({
        jobId: id,
        coverLetter,
        resume,
      });
      setApplySuccess('Your application has been submitted successfully.');
      setHasApplied(true);
      setCoverLetter('');
      setResume(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error submitting application', err);
      const message = err.response?.data?.error || 'Failed to submit application. Please try again later.';
      setApplyError(message);
    } finally {
      setApplyLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <LoadingSpinner text="Loading job details..." />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-white rounded-xl shadow-sm p-10">
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">Job Not Available</h1>
            <p className="text-gray-600 mb-6">{error || 'This job could not be found.'}</p>
            <Link to="/jobs" className="btn btn-primary">
              Browse other jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Employers can view job details. If it's not their posting, we simply avoid edit/apply affordances elsewhere.

  const companyName = job.company?.name || 'Unknown Company';
  const companyLogo = job.company?.logo ? `${API_BASE_URL}/${job.company.logo.replace(/^\//, '')}` : null;
  const salaryLabel = formatSalaryRange(job.salary);
  const addressLabel = formatFullAddress(job.location);
  const postedDate = job.createdAt ? formatDate(job.createdAt) : null;
  const deadline = job.applicationDeadline ? formatDate(job.applicationDeadline) : null;
  const daysUntilDeadline = job.applicationDeadline
    ? Math.max(0, Math.ceil((new Date(job.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;
  const isDeadlinePassed = job.applicationDeadline ? new Date(job.applicationDeadline) < new Date() : false;

  const canApply =
    user &&
    user.role === 'jobseeker' &&
    !hasApplied &&
    job.isActive &&
    !isDeadlinePassed;

  return (
    <div className="bg-gray-50 py-10 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/jobs" className="text-sm text-primary-600 hover:text-primary-700">
            ← Back to job listings
          </Link>
        </div>

        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex w-16 h-16 bg-primary-100 rounded-2xl items-center justify-center flex-shrink-0">
                  <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 mb-3">
                    {job.category}
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{job.title}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-600">
                    <span className="font-semibold text-primary-600">{companyName}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{addressLabel}</span>
                  </div>
                  {postedDate && (
                    <p className="text-xs text-gray-400 mt-2">Posted on {postedDate}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-start space-y-3">
                <div className="bg-primary-50 text-primary-800 px-4 py-2 rounded-xl text-sm font-semibold">
                  {salaryLabel}
                </div>
                <span className="badge badge-primary uppercase tracking-wide">{job.jobType}</span>
                {job.experienceLevel && (
                  <div className="text-sm text-gray-600">Experience: {job.experienceLevel}</div>
                )}
                {job.applicationsCount > 0 && (
                  <div className="text-xs text-gray-500">{job.applicationsCount} applicants</div>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 grid grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 p-6 sm:p-10 space-y-10">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Role Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
              </section>

              {job.responsibilities?.length ? (
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Responsibilities</h2>
                  <ul className="space-y-2 text-gray-700 list-disc list-inside">
                    {job.responsibilities.map((item, index) => (
                      <li key={`${job._id}-resp-${index}`}>{item}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {job.requirements?.length ? (
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
                  <ul className="space-y-2 text-gray-700 list-disc list-inside">
                    {job.requirements.map((item, index) => (
                      <li key={`${job._id}-req-${index}`}>{item}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {job.tags?.length ? (
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Highlights</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="bg-gray-50 border border-gray-100 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">About the Employer</h2>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                    {companyLogo ? (
                      <img src={companyLogo} alt={companyName} className="w-12 h-12 object-contain" />
                    ) : (
                      <span className="text-lg font-semibold text-primary-600">
                        {companyName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">{companyName}</p>
                    {job.company?.industry && (
                      <p className="text-sm text-gray-600">Industry: {job.company.industry}</p>
                    )}
                    {job.company?.location?.city && (
                      <p className="text-sm text-gray-600">
                        Location: {job.company.location.city}, {job.company.location.state}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>

            <aside className="border-t lg:border-l border-gray-100 p-6 sm:p-8 space-y-6 bg-gray-50">
              <section className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Job Snapshot</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start justify-between">
                    <span className="text-gray-500">Job Type</span>
                    <span className="font-medium text-gray-900">{job.jobType}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-gray-500">Experience</span>
                    <span className="font-medium text-gray-900">{job.experienceLevel}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-gray-500">Applications</span>
                    <span className="font-medium text-gray-900">{job.applicationsCount}</span>
                  </div>
                  {deadline && (
                    <div className="flex items-start justify-between">
                      <span className="text-gray-500">Apply by</span>
                      <span className="font-medium text-gray-900">{deadline}</span>
                    </div>
                  )}
                  {daysUntilDeadline !== null && (
                    <div className="flex items-start justify-between">
                      <span className="text-gray-500">Time left</span>
                      <span className={`font-semibold ${isDeadlinePassed ? 'text-red-600' : 'text-green-600'}`}>
                        {isDeadlinePassed ? 'Closed' : `${daysUntilDeadline} day${daysUntilDeadline === 1 ? '' : 's'}`}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-white border border-gray-100 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Apply for this job</h3>

                {!user && (
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>Sign in or create a job seeker account to apply for this opportunity.</p>
                    <div className="flex flex-col gap-2">
                      <Link to="/login/jobseeker" className="btn btn-primary btn-sm text-center">
                        Sign in to apply
                      </Link>
                      <Link to="/register/jobseeker" className="btn btn-outline btn-sm text-center">
                        Create free account
                      </Link>
                    </div>
                  </div>
                )}

                {user && user.role !== 'jobseeker' && (
                  <div className="text-sm text-gray-600">
                    You are signed in as an employer. Switch to a job seeker account to apply.
                  </div>
                )}

                {user && user.role === 'jobseeker' && (
                  <div className="space-y-4">
                    {hasApplied && (
                      <div className="bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg p-3">
                        You have already applied for this job. Our team will review your application shortly.
                      </div>
                    )}

                    {!job.isActive && (
                      <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 text-sm rounded-lg p-3">
                        This job is no longer accepting new applications.
                      </div>
                    )}

                    {isDeadlinePassed && job.isActive && (
                      <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 text-sm rounded-lg p-3">
                        The application deadline has passed.
                      </div>
                    )}

                    {applySuccess && (
                      <div className="bg-green-50 border border-green-100 text-green-700 text-sm rounded-lg p-3">
                        {applySuccess}
                      </div>
                    )}

                    {applyError && (
                      <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg p-3">
                        {applyError}
                      </div>
                    )}

                    {canApply && (
                      <form className="space-y-4" onSubmit={handleApply}>
                        <div>
                          <label htmlFor="coverLetter" className="form-label">
                            Cover Letter <span className="text-gray-400">(optional)</span>
                          </label>
                          <textarea
                            id="coverLetter"
                            className="form-textarea"
                            rows={4}
                            value={coverLetter}
                            onChange={(event) => setCoverLetter(event.target.value)}
                            placeholder="Tell the employer why you're a great fit."
                          ></textarea>
                        </div>

                        <div>
                          <label className="form-label" htmlFor="resume">
                            Upload Resume <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="resume"
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeChange}
                            className="form-input"
                          />
                          <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX</p>
                        </div>

                        <button
                          type="submit"
                          className="btn btn-primary w-full"
                          disabled={applyLoading}
                        >
                          {applyLoading ? 'Submitting application...' : 'Submit application'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </section>

              <section className="bg-white border border-gray-100 rounded-xl p-6 text-sm text-gray-600 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Need help?</h3>
                <p>Have questions about this role? Reach out to the employer through the application process or contact our support team.</p>
                <Link to="/contact" className="text-primary-600 font-semibold text-sm">
                  Contact support →
                </Link>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;