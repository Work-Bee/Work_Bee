import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationAPI, API_BASE_URL } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
// Chat happens on a dedicated page now
import { formatDate, formatLocation, formatSalaryRange } from '../utils/formatters';

const statusStyles = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  reviewed: 'bg-blue-50 text-blue-700 border border-blue-100',
  shortlisted: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
  interviewed: 'bg-purple-50 text-purple-700 border border-purple-100',
  hired: 'bg-green-50 text-green-700 border border-green-100',
  rejected: 'bg-red-50 text-red-700 border border-red-100',
};

// Component to handle resume viewing with error handling
const ResumeButton = ({ resumeUrl }) => {
  const [showError, setShowError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleResumeClick = async (e) => {
    e.preventDefault();
    setIsChecking(true);

    try {
      // Check if the resume file exists
      const response = await fetch(resumeUrl, { method: 'HEAD' });
      
      if (response.ok) {
        // File exists, open it
        window.open(resumeUrl, '_blank', 'noopener,noreferrer');
      } else {
        // File doesn't exist
        setShowError(true);
        setTimeout(() => setShowError(false), 5000); // Hide after 5 seconds
      }
    } catch (error) {
      // Network error or file not found
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleResumeClick}
        disabled={isChecking}
        className="btn btn-outline btn-sm"
      >
        {isChecking ? 'Checking...' : 'View submitted resume'}
      </button>
      
      {showError && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-red-50 border border-red-200 rounded-lg p-3 shadow-lg z-10">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-red-800">
              <p className="font-semibold">Resume not available</p>
              <p className="text-xs mt-1">The resume you used to apply for this job has been deleted or is no longer available.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user || user.role !== 'jobseeker') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await applicationAPI.getMyApplications({ limit: 50 });
        setApplications(response.data.data || []);
      } catch (err) {
        console.error('Error fetching applications', err);
        setError('Unable to load your applications right now. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  const handleDeleteApplication = async (applicationId) => {
    try {
      setDeletingId(applicationId);
      await applicationAPI.withdrawApplication(applicationId);
      
      // Remove the application from the list
      setApplications(applications.filter(app => app._id !== applicationId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting application', err);
      alert('Failed to delete application. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <LoadingSpinner text="Loading your applications..." />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">Track the status of every job you have applied to.</p>
        </div>

        {error ? (
          <div className="bg-white border border-red-100 text-red-700 rounded-xl p-6 text-center">
            {error}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">You haven’t applied to any jobs yet</h2>
            <p className="text-gray-600 mb-6">Browse open positions and apply with your resume to track them here.</p>
            <Link to="/jobs" className="btn btn-primary">
              Browse jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => {
              const job = application.job || {};
              const companyName = job.company?.name || 'Unknown Company';
              const locationLabel = formatLocation(job.location);
              const salaryLabel = formatSalaryRange(job.salary);
              const appliedDate = formatDate(application.appliedAt);
              const statusClass = statusStyles[application.status] || 'bg-gray-100 text-gray-700';
              const resumeUrl = application.resume?.path
                ? `${API_BASE_URL}/${application.resume.path.replace(/^\//, '')}`
                : null;

              return (
                <div key={application._id} className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  {/* Header Section */}
                  <div className="bg-gradient-to-r from-primary-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg font-semibold text-gray-900 mb-1 leading-tight">{job.title}</h2>
                          <p className="text-sm text-primary-700 font-medium">{companyName}</p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusClass}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{locationLabel}</span>
                      </div>

                      {job.jobType && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{job.jobType}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-green-700 font-semibold">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{salaryLabel}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Applied {appliedDate}</span>
                      </div>
                    </div>

                    {application.coverLetter && (
                      <div className="mt-4 bg-gray-50 border border-gray-100 rounded-lg p-4">
                        <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Cover Letter
                        </h3>
                        <p className="text-sm text-gray-600 whitespace-pre-line max-h-32 overflow-y-auto">
                          {application.coverLetter}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center gap-2">
                    <Link to={`/jobs/${job._id}`} className="btn btn-outline btn-sm">
                      View Job
                    </Link>
                    {resumeUrl && (
                      <ResumeButton resumeUrl={resumeUrl} />
                    )}
                    {application.status === 'shortlisted' && (
                      <Link className="btn btn-outline btn-sm" to={`/applications/${application._id}/chat`}>
                        Open Chat
                      </Link>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(application._id)}
                      className="btn btn-outline btn-sm text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      Delete
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && createPortal(
          (
            <div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowDeleteConfirm(null)}
            >
              <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                  <p className="text-base text-gray-700 mb-2">
                    Are you sure you want to delete your application for:
                  </p>
                  <p className="text-lg font-semibold text-gray-900 mb-4">
                    {applications.find(app => app._id === showDeleteConfirm)?.job?.title || 'this position'}
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      This action cannot be undone. Your application will be permanently removed.
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="btn btn-outline w-full sm:w-auto"
                    disabled={deletingId === showDeleteConfirm}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteApplication(showDeleteConfirm)}
                    disabled={deletingId === showDeleteConfirm}
                    className="btn bg-red-600 text-white hover:bg-red-700 border-red-600 hover:border-red-700 w-full sm:w-auto"
                  >
                    {deletingId === showDeleteConfirm ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </span>
                    ) : (
                      'Delete Application'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ),
          document.body
        )}
      </div>
      {/* Chat is now a dedicated page at /applications/:id/chat */}
    </div>
  );
};

export default Applications;