import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  
  const [showJobModal, setShowJobModal] = useState(false);
  const [showEditMode, setShowEditMode] = useState(false);

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

  return (
    <>
      <div className="bg-gray-50 min-h-screen py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Employer Dashboard</h1>
              <p className="text-gray-600">
                Monitor your job postings and review applicants in one place.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm">
                  <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">Active jobs</div>
                  <div className="text-2xl font-bold text-primary-600">{jobs.length}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm">
                  <div className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">Applications</div>
                  <div className="text-2xl font-bold text-green-600">{totalApplications}</div>
                </div>
              </div>
              <Link to="/employer/jobs/new" className="btn btn-primary whitespace-nowrap">
                Post a Job
              </Link>
            </div>
          </div>

          {/* Job Cards Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Job Postings</h2>
              <Link to="/employer/jobs/new" className="btn btn-primary">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Post New Job
              </Link>
            </div>

            {jobsLoading ? (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10">
                <LoadingSpinner text="Loading jobs..." />
              </div>
            ) : jobsError ? (
              <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-6 text-red-600">
                {jobsError}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
                <p className="text-gray-600 mb-6">Create your first job to start receiving applications.</p>
                <Link to="/employer/jobs/new" className="btn btn-primary">
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

                  return (
                    <div
                      key={job._id}
                      onClick={() => {
                        setSelectedJobId(job._id);
                        setSelectedJob(job);
                        setShowJobModal(true);
                        setShowEditMode(false);
                      }}
                      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                    >
                      {/* Card Header */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {job.title}
                          </h3>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {isActive ? '● Active' : '○ Paused'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="px-2 py-1 bg-white rounded-md">{job.jobType}</span>
                          <span className="px-2 py-1 bg-white rounded-md">{job.category}</span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{locationLabel}</span>
                        </div>

                        <div className="flex items-center text-sm text-green-600 font-semibold">
                          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {salaryLabel}
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <div className="text-xl font-bold text-blue-600">{job.applicationsCount || 0}</div>
                            <div className="text-xs text-gray-600">Applications</div>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded-lg">
                            <div className="text-xl font-bold text-purple-600">{job.viewsCount || 0}</div>
                            <div className="text-xs text-gray-600">Views</div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Deadline: {deadline}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Applications Section */}
          {selectedJobId && (
            <div>
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <header className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Applications</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedJob ? `For: ${selectedJob.title}` : 'Select a job to view applications'}
                      </p>
                    </div>
                  </div>
                </header>

              {!selectedJob ? (
                <div className="p-6 text-sm text-gray-600">
                  Select a job from the list to view incoming applications.
                </div>
              ) : applicationsLoading ? (
                <div className="p-6">
                  <LoadingSpinner text="Loading applications..." />
                </div>
              ) : applicationsError ? (
                <div className="p-6 text-sm text-red-600">{applicationsError}</div>
              ) : applications.length === 0 ? (
                <div className="p-6 text-sm text-gray-600">
                  No applications received yet. Share your job posting to reach more candidates.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Candidate
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Applied
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {applications.map((application) => {
                        const applicant = application.applicant || {};
                        const resumeUrl = application.resume?.path
                          ? `${API_BASE_URL}/${application.resume.path.replace(/^\/+/u, '')}`
                          : null;
                        const badgeClass = statusBadge[application.status] || 'bg-gray-100 text-gray-700';

                        return (
                          <tr key={application._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900">{applicant.name}</div>
                              <div className="text-xs text-gray-500">
                                {applicant.profile?.experience || 'Experience: N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div>{applicant.email}</div>
                              {applicant.phone && <div>{applicant.phone}</div>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div>{formatDate(application.appliedAt)}</div>
                              <div className="text-xs text-gray-400">Updated {formatDate(application.lastStatusUpdate)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <div className="flex justify-end gap-2">
                                {resumeUrl && (
                                  <a
                                    href={resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline btn-sm"
                                  >
                                    View resume
                                  </a>
                                )}
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  onClick={() => openStatusModal(application)}
                                >
                                  Update status
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {Object.keys(applicationStats).length > 0 && (
                <footer className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(applicationStats).map(([status, count]) => (
                      <span key={status} className="px-3 py-1 rounded-full bg-white border border-gray-200">
                        {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
                      </span>
                    ))}
                  </div>
                </footer>
              )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Job Actions Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 rounded-t-2xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold">{selectedJob.title}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${selectedJob.isActive ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                      {selectedJob.isActive ? '● Active' : '○ Paused'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-blue-100">
                    <span>{formatLocation(selectedJob.location)}</span>
                    <span>•</span>
                    <span>{formatSalaryRange(selectedJob.salary)}</span>
                    <span>•</span>
                    <span>{selectedJob.jobType}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowJobModal(false);
                    setShowEditMode(false);
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="px-6 py-5">
              {!showEditMode ? (
                /* View Mode - Compact Action-Focused */
                <div className="space-y-4">
                  {/* Quick Stats - Smaller & Compact */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-2.5 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">{selectedJob.applicationsCount || 0}</div>
                      <div className="text-xs text-gray-600 mt-0.5">Applications</div>
                    </div>
                    <div className="text-center p-2.5 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="text-2xl font-bold text-indigo-600">{selectedJob.viewsCount || 0}</div>
                      <div className="text-xs text-gray-600 mt-0.5">Views</div>
                    </div>
                    <div className="text-center p-2.5 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="text-xs font-semibold text-purple-600 truncate">{selectedJob.category}</div>
                      <div className="text-xs text-gray-600 mt-0.5">Category</div>
                    </div>
                    <div className="text-center p-2.5 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-xs font-semibold text-orange-600">{formatDate(selectedJob.applicationDeadline)}</div>
                      <div className="text-xs text-gray-600 mt-0.5">Deadline</div>
                    </div>
                  </div>

                  {/* Short Description */}
                  {selectedJob.description && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Description</h3>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                        {selectedJob.description}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <Link
                      to={`/employer/jobs/${selectedJob._id}/edit`}
                      className="w-full inline-flex items-center justify-center px-5 py-3.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-md hover:shadow-lg"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Job
                    </Link>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to ${selectedJob.isActive ? 'pause' : 'activate'} this job?`)) {
                            try {
                              await jobAPI.toggleJobStatus(selectedJob._id);
                              setShowJobModal(false);
                              window.location.reload();
                            } catch (err) {
                              alert('Failed to update job status');
                            }
                          }
                        }}
                        className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all border border-gray-300"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={selectedJob.isActive ? "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" : "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
                        </svg>
                        {selectedJob.isActive ? 'Pause' : 'Activate'}
                      </button>

                      <Link
                        to={`/jobs/${selectedJob._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-blue-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {statusModalOpen && activeApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <form onSubmit={handleStatusSubmit} className="p-6 space-y-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Update application status</h3>
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
    </>
  );
};

export default EmployerDashboard;