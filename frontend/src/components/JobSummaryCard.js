import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { applicationAPI, bookmarkAPI, authAPI } from '../utils/api';
import { formatSalaryRange, formatLocation, formatDate } from '../utils/formatters';

const JobSummaryCard = ({ job }) => {
  const { user, updateUser } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState('');
  const [applyError, setApplyError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [checkingResume, setCheckingResume] = useState(false);

  const companyName = job.company?.name || 'Unknown Company';
  const salaryLabel = formatSalaryRange(job.salary);
  const locationLabel = formatLocation(job.location);
  const postedDate = job.createdAt ? formatDate(job.createdAt) : null;
  
  const isJobseeker = user?.role === 'jobseeker';
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

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!isJobseeker) return;
      
      try {
        const response = await bookmarkAPI.checkBookmark(job._id);
        setIsBookmarked(response.data.data.isBookmarked);
      } catch (err) {
        console.error('Error checking bookmark status', err);
      }
    };

    checkBookmarkStatus();
  }, [isJobseeker, job._id]);

  const handleBookmarkToggle = async () => {
    if (!isJobseeker) return;

    try {
      setBookmarkLoading(true);
      if (isBookmarked) {
        await bookmarkAPI.removeBookmark(job._id);
        setIsBookmarked(false);
      } else {
        await bookmarkAPI.addBookmark(job._id);
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Error toggling bookmark', err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleShare = () => {
    const jobUrl = `${window.location.origin}/jobs/${job._id}`;
    navigator.clipboard.writeText(jobUrl).then(() => {
      setShowShareSuccess(true);
      setTimeout(() => setShowShareSuccess(false), 3000);
    }).catch(err => {
      console.error('Failed to copy link', err);
      alert('Failed to copy link. Please try again.');
    });
  };

  const handleApplyClick = async () => {
    setApplyError('');
    setCheckingResume(true);
    
    try {
      // Refresh user profile to get the latest resume status from backend
      const profileResponse = await authAPI.getProfile();
      const latestUser = profileResponse.data.data.user;
      updateUser(latestUser);
      
      // Check if resume exists in the latest user data
      const currentHasResume = latestUser?.profile?.resume;
      
      if (!currentHasResume) {
        setApplyError('Please upload your resume in your profile before applying.');
        setCheckingResume(false);
        return;
      }
      
      // Resume exists, open the modal
      setShowApplyModal(true);
      setApplySuccess('');
    } catch (error) {
      console.error('Error checking resume status:', error);
      setApplyError('Unable to verify resume status. Please try again.');
    } finally {
      setCheckingResume(false);
    }
  };

  const handleApplySubmit = async (event) => {
    event.preventDefault();
    setApplyError('');
    setApplySuccess('');

    try {
      setApplyLoading(true);
      
      // Fetch the latest profile to ensure resume is still available
      const profileResponse = await authAPI.getProfile();
      const latestUser = profileResponse.data.data.user;
      
      // Final check: verify resume exists
      if (!latestUser?.profile?.resume) {
        setApplyError('You cannot apply without uploading a resume. Please upload your resume in your profile first.');
        setApplyLoading(false);
        return;
      }
      
      // Resume exists - proceed with application
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
      <div 
        className="card-body cursor-pointer hover:shadow-lg transition-shadow duration-200"
        onClick={() => setExpanded(true)}
      >
        {/* Job Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gray-100 border-2 border-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-800 mb-1 leading-tight">{job.title}</h3>
              <p className="text-sm text-gray-800 font-medium">{companyName}</p>
            </div>
          </div>
          <div className="flex gap-1.5 items-start flex-shrink-0">
            {isJobseeker && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookmarkToggle();
                }}
                disabled={bookmarkLoading}
                className={`p-1.5 rounded-lg transition-colors ${
                  isBookmarked 
                    ? 'text-gray-800 bg-gray-100 hover:bg-gray-200' 
                    : 'text-gray-400 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark this job'}
              >
                <svg className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            )}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                title="Share job link"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
              {showShareSuccess && (
                <div className="absolute top-full right-0 mt-2 bg-gray-100 border-2 border-gray-800 rounded-lg px-3 py-2 shadow-lg z-10 whitespace-nowrap">
                  <p className="text-sm text-gray-800 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Link copied!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{locationLabel}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-800 font-semibold">
              <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{salaryLabel}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 border-2 border-gray-800 whitespace-nowrap">
              {job.jobType}{job.experienceLevel ? ` • ${job.experienceLevel}` : ''}
            </span>
            {postedDate && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="whitespace-nowrap">{postedDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Details Modal */}
        {expanded && createPortal(
          (
            <div
              className="fixed inset-0 z-40 bg-gray-800/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setExpanded(false)}
            >
              <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md border-2 border-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
              <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base text-gray-800 leading-tight">{job.title}</h3>
                  <div className="text-xs text-gray-600 flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                    <span className="text-gray-800 font-medium">{companyName}</span>
                    <span className="text-gray-300">•</span>
                    <span>{job.employmentType} • {job.duration}</span>
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
                      <div className="text-sm font-medium text-gray-800">{salaryLabel}</div>
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

                {showFull && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                    {job.description && (
                      <div>
                        <div className="font-semibold text-gray-800 mb-1">Role Description</div>
                        <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                      </div>
                    )}
                    {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
                      <div>
                        <div className="font-semibold text-gray-800 mb-1">Full Responsibilities</div>
                        <ul className="list-disc list-inside space-y-1">
                          {job.responsibilities.map((r, i) => (
                            <li key={`resp-${job._id}-${i}`}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {Array.isArray(job.requirements) && job.requirements.length > 0 && (
                      <div>
                        <div className="font-semibold text-gray-800 mb-1">Full Requirements</div>
                        <ul className="list-disc list-inside space-y-1">
                          {job.requirements.map((r, i) => (
                            <li key={`req-${job._id}-${i}`}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

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
                        disabled={hasApplied || isJobClosed || checkingResume}
                      >
                        {checkingResume ? 'Checking...' : hasApplied ? 'Applied' : isJobClosed ? 'Closed' : 'Apply'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setShowFull((v) => !v)}
                    >
                      {showFull ? 'Hide details' : 'View full details'}
                    </button>
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
              className="fixed inset-0 z-50 bg-gray-800/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowApplyModal(false)}
            >
              <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md border-2 border-gray-800"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-base text-gray-800">Apply for {job.title}</h3>
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
                    <div className="mb-4 p-3 bg-gray-100 border-2 border-gray-800 rounded-lg">
                      <p className="text-sm text-gray-800">{applySuccess}</p>
                    </div>
                  )}

                  {applyError && (
                    <div className="mb-4 p-3 bg-gray-100 border-2 border-gray-800 rounded-lg">
                      <p className="text-sm text-gray-800">{applyError}</p>
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="p-3 bg-gray-100 border-2 border-gray-800 rounded-lg">
                      <p className="text-sm text-gray-800">
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
                      className="w-full px-3 py-2 border-2 border-gray-800 rounded-lg focus:ring-2 focus:ring-black focus:border-gray-800 text-sm"
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
