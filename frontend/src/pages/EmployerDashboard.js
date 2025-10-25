import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobAPI, applicationAPI, API_BASE_URL } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatLocation, formatSalaryRange } from '../utils/formatters';

const statusBadge = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  reviewed: 'bg-blue-50 text-blue-700 border border-blue-100',
  shortlisted: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
  interviewed: 'bg-purple-50 text-purple-700 border border-purple-100',
  hired: 'bg-green-50 text-green-700 border border-green-100',
  rejected: 'bg-red-50 text-red-700 border border-red-100',
};

const statusOptions = [
  { value: 'pending', label: 'Pending review' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interviewed', label: 'Interviewed' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

const EmployerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState('');

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState('');
  const [applicationStats, setApplicationStats] = useState({});

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [activeApplication, setActiveApplication] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: 'pending', note: '' });
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  // Job actions modal state
  const [jobActionsModalOpen, setJobActionsModalOpen] = useState(false);
  const [activeJob, setActiveJob] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setJobsLoading(true);
        setJobsError('');
        const response = await jobAPI.getEmployerJobs({ limit: 20 });
        const jobList = response.data.data || [];
        setJobs(jobList);

        if (jobList.length > 0) {
          const jobId = jobList[0]._id;
          setSelectedJobId(jobId);
          setSelectedJob(jobList[0]);
        }
      } catch (error) {
        console.error('Error loading employer jobs', error);
        setJobsError('Unable to load your job postings. Please try again later.');
      } finally {
        setJobsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const fetchApplications = useCallback(async () => {
    if (!selectedJobId) {
      setApplications([]);
      setApplicationStats({});
      return;
    }

    try {
      setApplicationsLoading(true);
      setApplicationsError('');
      const response = await applicationAPI.getJobApplications(selectedJobId, { limit: 100 });
      setApplications(response.data.data || []);
      setApplicationStats(response.data.stats || {});
    } catch (error) {
      console.error('Error loading job applications', error);
      setApplicationsError('Unable to load applications for this job.');
      setApplications([]);
      setApplicationStats({});
    } finally {
      setApplicationsLoading(false);
    }
  }, [selectedJobId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const totalApplications = applications.length || selectedJob?.applicationsCount || 0;

  const openStatusModal = (application) => {
    setActiveApplication(application);
    setStatusForm({ status: application.status, note: '' });
    setStatusError('');
    setStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setStatusModalOpen(false);
    setActiveApplication(null);
    setStatusForm({ status: 'pending', note: '' });
    setStatusLoading(false);
    setStatusError('');
  };

  const handleStatusChange = (event) => {
    const { name, value } = event.target;
    setStatusForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusSubmit = async (event) => {
    event.preventDefault();
    if (!activeApplication) return;

    try {
      setStatusLoading(true);
      setStatusError('');

      const payload = { status: statusForm.status };
      const noteValue = statusForm.note.trim();
      if (noteValue) {
        payload.note = noteValue;
      }

      await applicationAPI.updateApplicationStatus(activeApplication._id, payload);
      await fetchApplications();
      closeStatusModal();
    } catch (error) {
      console.error('Error updating application status', error);
      const message = error.response?.data?.error || 'Unable to update application status. Please try again.';
      setStatusError(message);
    } finally {
      setStatusLoading(false);
    }
  };

  // Open job actions modal
  const openJobActionsModal = (job) => {
    setActiveJob(job);
    setJobActionsModalOpen(true);
  };

  // Close job actions modal
  const closeJobActionsModal = () => {
    setJobActionsModalOpen(false);
    setActiveJob(null);
  };

  // Handle job status toggle
  const handleToggleJobStatus = async () => {
    if (!activeJob) return;
    
    const newStatus = !activeJob.isActive;
    if (window.confirm(`Are you sure you want to ${newStatus ? 'reopen' : 'close'} applications for "${activeJob.title}"?`)) {
      try {
        await jobAPI.updateJob(activeJob._id, { isActive: newStatus });
        // Refresh jobs list
        const response = await jobAPI.getEmployerJobs({ limit: 20 });
        setJobs(response.data.data || []);
        closeJobActionsModal();
      } catch (error) {
        console.error('Error updating job status:', error);
        alert('Failed to update job status. Please try again.');
      }
    }
  };



  return (
    <>
      <div className="bg-white min-h-screen py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Employer Dashboard</h1>
              <p className="text-gray-600">
                Monitor your job postings and review applicants in one place.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="bg-gray-800 text-white border border-gray-800 rounded-xl px-5 py-3 shadow-sm">
                  <div className="text-xs text-gray-300 uppercase font-semibold tracking-wide mb-1">Active jobs</div>
                  <div className="text-2xl font-bold">{jobs.length}</div>
                </div>
                <div className="bg-white border-2 border-gray-800 rounded-xl px-5 py-3 shadow-sm">
                  <div className="text-xs text-gray-600 uppercase font-semibold tracking-wide mb-1">Applications</div>
                  <div className="text-2xl font-bold text-gray-800">{totalApplications}</div>
                </div>
              </div>
              <Link to="/employer/jobs/new" className="bg-gray-800 text-white hover:bg-gray-800 px-6 py-3 rounded-xl font-semibold transition-colors whitespace-nowrap">
                Post a Job
              </Link>
            </div>
          </div>

          {/* Job Cards Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Your Job Postings</h2>
              <span className="text-sm text-gray-500">{jobs.length} active {jobs.length === 1 ? 'job' : 'jobs'}</span>
            </div>

            {jobsLoading ? (
              <div className="p-12 text-center">
                <LoadingSpinner text="Loading your jobs..." />
              </div>
            ) : jobsError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
                <p className="font-semibold mb-2">Error loading jobs</p>
                <p className="text-sm">{jobsError}</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-400 rounded-full opacity-50 animate-pulse"></div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gray-600 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">No Jobs Posted Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Start your hiring journey by posting your first job and connect with talented candidates.
                </p>
                <Link to="/employer/jobs/new" className="bg-gray-800 text-white hover:bg-gray-800 px-6 py-3 rounded-xl font-semibold transition-colors inline-flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Post Your First Job
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => {
                  const isActive = job.isActive;
                  const deadline = job.applicationDeadline ? formatDate(job.applicationDeadline) : 'No deadline';
                  const locationLabel = formatLocation(job.location);
                  const salaryLabel = formatSalaryRange(job.salary);
                  const applicationsCount = job.applicationsCount || 0;

                  return (
                    <div
                      key={job._id}
                      onClick={() => openJobActionsModal(job)}
                      className="bg-white border-2 border-gray-800 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-200 overflow-hidden group cursor-pointer hover:border-gray-800 hover:scale-[1.02]"
                    >
                      {/* Card Header */}
                      <div className="p-6 pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0 pr-3">
                            <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2 transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {locationLabel}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              isActive
                                ? 'bg-gray-800 text-white'
                                : 'bg-gray-200 text-gray-700 border-2 border-gray-400'
                            }`}
                          >
                            {isActive ? '● Active' : '● Closed'}
                          </span>
                        </div>

                        {/* Job Meta Info */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {salaryLabel}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Deadline: {deadline}
                          </div>
                          <div className="flex items-center text-sm font-semibold text-gray-800">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {applicationsCount} {applicationsCount === 1 ? 'Application' : 'Applications'}
                          </div>
                        </div>

                        {/* Job Type & Experience Badges */}
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 text-xs font-medium bg-gray-800 text-white rounded-full">
                            {job.jobType}
                          </span>
                          {job.experienceLevel && (
                            <span className="px-3 py-1 text-xs font-medium bg-gray-200 text-gray-800 rounded-full border border-gray-300">
                              {job.experienceLevel}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Status Update Modal (no longer used on this page but kept for compatibility) */}
      {statusModalOpen && activeApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <form onSubmit={handleStatusSubmit} className="p-6 space-y-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Update application status</h3>
                  <p className="text-sm text-gray-500">
                    {activeApplication.applicant?.name || 'Candidate'} — {activeApplication.applicant?.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeStatusModal}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                  disabled={statusLoading}
                >
                  <span className="text-2xl leading-none">×</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Select new status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={statusForm.status}
                    onChange={handleStatusChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    disabled={statusLoading}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                    Optional note (visible to your team)
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    rows={4}
                    value={statusForm.note}
                    onChange={handleStatusChange}
                    placeholder="Add context about this decision..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    disabled={statusLoading}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Notes help teammates understand progress. Applicants do not see these notes.
                  </p>
                </div>
              </div>

              {statusError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {statusError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closeStatusModal}
                  disabled={statusLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={statusLoading}
                >
                  {statusLoading ? 'Updating...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Actions Modal */}
      {jobActionsModalOpen && activeJob && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/70 backdrop-blur-sm px-4"
          onClick={closeJobActionsModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all border-2 border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b-2 border-gray-800 px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-2">
                    {activeJob.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {formatLocation(activeJob.location)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        activeJob.isActive
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-200 text-gray-700 border border-gray-400'
                      }`}
                    >
                      {activeJob.isActive ? '● Active' : '● Closed'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeJobActionsModal}
                  className="text-gray-400 hover:text-gray-800 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body - Action Options */}
            <div className="p-6">
              <div className="space-y-3">
                {/* View Applicants */}
                <Link
                  to={`/employer/jobs/${activeJob._id}/applications`}
                  className="flex items-center w-full px-5 py-4 text-left bg-gray-800 text-white hover:bg-gray-800 border-2 border-gray-800 rounded-xl transition-all duration-200 group"
                  onClick={closeJobActionsModal}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg mr-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold mb-1">View Applicants</h4>
                    <p className="text-sm text-gray-300">
                      Review {activeJob.applicationsCount || 0} application{activeJob.applicationsCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* View Job Details */}
                <Link
                  to={`/jobs/${activeJob._id}`}
                  className="flex items-center w-full px-5 py-4 text-left bg-white hover:bg-gray-100 border-2 border-gray-800 rounded-xl transition-all duration-200 group"
                  onClick={closeJobActionsModal}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-gray-800 mb-1">View Job Details</h4>
                    <p className="text-sm text-gray-600">See full job posting as candidates see it</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-800 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* Edit Job */}
                <Link
                  to={`/employer/jobs/${activeJob._id}/edit`}
                  className="flex items-center w-full px-5 py-4 text-left bg-white hover:bg-gray-100 border-2 border-gray-800 rounded-xl transition-all duration-200 group"
                  onClick={closeJobActionsModal}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-800 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-gray-800 mb-1">Edit Job</h4>
                    <p className="text-sm text-gray-600">Update job details and requirements</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-800 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* Close/Reopen Applications */}
                <button
                  onClick={handleToggleJobStatus}
                  className={`flex items-center w-full px-5 py-4 text-left border-2 rounded-xl transition-all duration-200 group ${
                    activeJob.isActive
                      ? 'bg-white hover:bg-gray-100 border-gray-800'
                      : 'bg-gray-800 hover:bg-gray-800 border-gray-800 text-white'
                  }`}
                >
                  <div className={`flex items-center justify-center w-12 h-12 rounded-lg mr-4 group-hover:scale-110 transition-transform ${
                    activeJob.isActive ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <svg className={`w-6 h-6 ${activeJob.isActive ? 'text-white' : 'text-gray-800'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {activeJob.isActive ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-base font-bold mb-1 ${
                      activeJob.isActive ? 'text-gray-800' : 'text-white'
                    }`}>
                      {activeJob.isActive ? 'Close Applications' : 'Reopen Applications'}
                    </h4>
                    <p className={`text-sm ${
                      activeJob.isActive ? 'text-gray-600' : 'text-gray-300'
                    }`}>
                      {activeJob.isActive 
                        ? 'Stop accepting new applications' 
                        : 'Start accepting applications again'}
                    </p>
                  </div>
                  <svg className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${
                    activeJob.isActive ? 'text-gray-800' : 'text-white'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t-2 border-gray-800 px-6 py-4 bg-gray-50 rounded-b-2xl">
              <button
                onClick={closeJobActionsModal}
                className="w-full bg-white hover:bg-gray-100 border-2 border-gray-800 text-gray-800 font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployerDashboard;