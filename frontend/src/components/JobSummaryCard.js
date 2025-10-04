import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationAPI } from '../utils/api';
import { formatSalaryRange, formatLocation, formatDate } from '../utils/formatters';

const JobSummaryCard = ({ job }) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');

  const companyName = job.company?.name || 'Unknown Company';
  const salaryLabel = formatSalaryRange(job.salary);
  const locationLabel = formatLocation(job.location);
  const postedDate = job.createdAt ? formatDate(job.createdAt) : null;
  
  const isJobseeker = user?.role === 'jobseeker';
  const hasResume = isJobseeker && user?.profile?.resume;
  const isJobClosed = job.status === 'closed';
  // No body scroll lock so the page feels continuous under the overlay

  useEffect(() => {
    const checkIfApplied = async () => {
      if (!isJobseeker) {
        setHasApplied(false);
        return;
      }

      try {
        const response = await applicationAPI.getMyApplications({ limit: 100 });
        const alreadyApplied = response.data.data?.some((application) => application.job?._id === job._id);
        setHasApplied(alreadyApplied);
      } catch (err) {
        console.error('Error checking application status', err);
      }
    };

    if (expanded) {
      checkIfApplied();
    }
  }, [isJobseeker, job._id, expanded]);

  const handleApplyClick = () => {
    if (!hasResume) {
      setApplyError('Please upload your resume in your profile before applying.');
      return;
    }
    setShowApplyModal(true);
    setApplyError('');
    setApplySuccess('');
  };

  const handleApplySubmit = async (event) => {
    event.preventDefault();
    setApplyError('');
    setApplySuccess('');

    // Double-check resume availability before submission
    if (!hasResume) {
      setApplyError('You cannot apply without uploading a resume. Please upload your resume in your profile first.');
      return;
    }

    try {
      setApplyLoading(true);
      // Don't send resume field - backend will use profile resume
      await applicationAPI.applyForJob({
        jobId: job._id,
        coverLetter: coverLetter || '', // Send empty string if no cover letter
      });
      setApplySuccess('Your application has been submitted successfully!');
      setHasApplied(true);
      setCoverLetter('');
      setTimeout(() => {
        setShowApplyModal(false);
        setApplySuccess('');
      }, 2000);
    } catch (err) {
      console.error('Error submitting application', err);
      console.error('Error response:', err.response);
      
      // Extract error message from various possible locations
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || '';
      
      // Check if it's a resume-related error
      if (errorMessage.toLowerCase().includes('resume') || 
          err.response?.status === 400) {
        setApplyError('You have not uploaded a resume. Please upload your resume in your profile first.');
      } else {
        setApplyError(errorMessage || 'Server error submitting application. Please try again.');
      }
    } finally {
      setApplyLoading(false);
    }
  };

  if (!job) return null;

  return (
    <div className="job-card">
      <div className="card-body">
        {/* Top row compact */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-base text-gray-900 leading-tight">{job.title}</h3>
              <div className="text-sm text-gray-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-primary-700 font-medium">{companyName}</span>
                <span className="text-gray-300">•</span>
                <span>{job.jobType}</span>
                {postedDate && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span>Posted {postedDate}</span>
                  </>
                )}
                {job.category && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span>{job.category}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-green-700">{salaryLabel}</div>
            <div className="text-xs text-gray-500">{locationLabel}</div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 items-center justify-between">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="btn btn-outline btn-sm"
          >
            Show details
          </button>
          <Link to={`/jobs/${job._id}`} className="btn btn-outline btn-sm">Full details</Link>
        </div>

        {/* Details Modal */}
        {expanded && createPortal(
          (
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setExpanded(false)}
            >
              <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base text-gray-900 leading-tight">{job.title}</h3>
                  <div className="text-xs text-gray-600 flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                    <span className="text-primary-700 font-medium">{companyName}</span>
                    <span className="text-gray-300">•</span>
                    <span>{job.jobType}</span>
                    {job.category && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span>{job.category}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="text-gray-400 hover:text-gray-600 ml-2"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="text-xs">
                    <div className="text-sm font-medium text-green-700">{salaryLabel}</div>
                    <div className="text-xs text-gray-500">{locationLabel}</div>
                  </div>
                </div>

                <div className="text-sm text-gray-700 space-y-2">
                  {job.responsibilities?.length ? (
                    <div>
                      <span className="font-semibold text-gray-800">Responsibilities: </span>
                      <span>
                        {job.responsibilities.slice(0, 3).join(', ')}
                        {job.responsibilities.length > 3 ? '…' : ''}
                      </span>
                    </div>
                  ) : null}
                  {job.requirements?.length ? (
                    <div>
                      <span className="font-semibold text-gray-800">Requirements: </span>
                      <span>
                        {job.requirements.slice(0, 3).join(', ')}
                        {job.requirements.length > 3 ? '…' : ''}
                      </span>
                    </div>
                  ) : null}
                  {job.applicationDeadline && (
                    <div className="text-xs text-gray-500 mt-1">Apply by {formatDate(job.applicationDeadline)}</div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setExpanded(false)}>
                    Close
                  </button>
                  <div className="flex gap-2">
                    {isJobseeker && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleApplyClick}
                        disabled={hasApplied || isJobClosed}
                      >
                        {hasApplied ? 'Applied' : isJobClosed ? 'Closed' : 'Apply'}
                      </button>
                    )}
                    <Link to={`/jobs/${job._id}`} className="btn btn-outline btn-sm">Full details</Link>
                  </div>
                </div>
              </div>
              </div>
            </div>
          ),
          document.body
        )}

        {/* Apply Modal */}
        {showApplyModal && createPortal(
          (
            <div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowApplyModal(false)}
            >
              <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-base text-gray-900">Apply for {job.title}</h3>
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleApplySubmit} className="px-5 py-4">
                  {applySuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">{applySuccess}</p>
                    </div>
                  )}

                  {applyError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{applyError}</p>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Please make sure you have read all the job details carefully before applying.
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter (Optional)
                    </label>
                    <textarea
                      id="coverLetter"
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows="4"
                      placeholder="Tell the employer why you're a great fit for this role..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setShowApplyModal(false)}
                      disabled={applyLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={applyLoading}
                    >
                      {applyLoading ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ),
          document.body
        )}
      </div>
    </div>
  );
};

export default JobSummaryCard;
