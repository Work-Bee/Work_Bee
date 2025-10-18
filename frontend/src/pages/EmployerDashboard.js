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
                  <div className="text-2xl font-bold text-purple-600">{jobs.length}</div>
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

          <div className="grid lg:grid-cols-3 gap-6">
            <section className="lg:col-span-1 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <header className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Your job postings</h2>
                <span className="text-xs text-gray-500">{jobs.length} listed</span>
              </header>

              {jobsLoading ? (
                <div className="p-6">
                  <LoadingSpinner text="Loading jobs..." />
                </div>
              ) : jobsError ? (
                <div className="p-6 text-sm text-red-600">{jobsError}</div>
              ) : jobs.length === 0 ? (
                <div className="p-8 text-center">
                  {/* Illustration */}
                  <div className="mb-6 flex justify-center">
                    <div className="relative">
                      <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full opacity-50 animate-pulse"></div>
                      <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-purple-400 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Jobs Posted Yet</h3>
                  <p className="text-sm text-gray-600 mb-4 max-w-xs mx-auto">
                    Start your hiring journey by posting your first job and connect with talented candidates.
                  </p>
                  <div className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Click "Post a Job" above to begin
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 max-h-[480px] overflow-y-auto">
                  {jobs.map((job) => {
                    const isActive = job.isActive;
                    const deadline = job.applicationDeadline ? formatDate(job.applicationDeadline) : 'No deadline';
                    const locationLabel = formatLocation(job.location);
                    const isSelected = job._id === selectedJobId;

                    return (
                      <li key={job._id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedJobId(job._id);
                            setSelectedJob(job);
                            navigate(`/employer/jobs/${job._id}/applications`);
                          }}
                          className={`w-full text-left px-6 py-5 hover:bg-purple-50 transition-colors ${
                            isSelected ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
                            <span className={`text-xs font-medium ${isActive ? 'text-green-600' : 'text-red-500'}`}>
                              {isActive ? 'Active' : 'Paused'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{locationLabel}</p>
                          <div className="flex items-center text-xs text-gray-500 gap-3">
                            <span
                              className="underline text-indigo-600 hover:text-indigo-700 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedJobId(job._id);
                                setSelectedJob(job);
                                navigate(`/employer/jobs/${job._id}/applications`);
                              }}
                              title="View all applications"
                            >
                              {job.applicationsCount} applicants
                            </span>
                            <span>•</span>
                            <span>Apply by {deadline}</span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <header className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-gray-900">Applications</h2>
                  <p className="text-xs text-gray-500">Review candidates and download resumes.</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedJob && (
                    <Link
                      to={`/employer/jobs/${selectedJob._id}/edit`}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-600 bg-white border border-purple-600 rounded-lg hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit job
                    </Link>
                  )}
                  {selectedJob && (
                    <Link
                      to={`/employer/jobs/${selectedJob._id}/applications`}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                      title="Open full applications view"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                      </svg>
                      View all applications
                    </Link>
                  )}
                </div>
                {selectedJob && (
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    <span className="px-3 py-1 rounded-full bg-gray-100">
                      {selectedJob.jobType}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-gray-100">
                      {selectedJob.experienceLevel}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-gray-100">
                      {formatSalaryRange(selectedJob.salary)}
                    </span>
                  </div>
                )}
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
            </section>
          </div>
        </div>
      </div>

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
    </>
  );
};

export default EmployerDashboard;