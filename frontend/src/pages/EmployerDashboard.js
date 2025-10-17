import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatLocation, formatSalaryRange } from '../utils/formatters';
import DashboardJobCard from '../components/DashboardJobCard';

const styles = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
  .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
  .animate-slideUp { animation: slideUp 0.3s ease-out; }
`;

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

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [activeApplication, setActiveApplication] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: 'pending', note: '' });
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  const [showJobModal, setShowJobModal] = useState(false);
  const [showEditMode, setShowEditMode] = useState(false);
  const [jobModalView, setJobModalView] = useState('overview'); // 'overview' | 'applications'

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setJobsLoading(true);
        setJobsError('');
        const response = await jobAPI.getEmployerJobs({ limit: 20 });
        const jobList = response.data.data || [];
        setJobs(jobList);
        if (jobList.length > 0) {
          setSelectedJobId(jobList[0]._id);
          setSelectedJob(jobList[0]);
        }
      } catch (e) {
        console.error(e);
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
      return;
    }
    try {
      setApplicationsLoading(true);
      setApplicationsError('');
      const response = await applicationAPI.getJobApplications(selectedJobId, { limit: 100 });
      setApplications(response.data.data || []);
    } catch (e) {
      console.error(e);
      setApplicationsError('Unable to load applications for this job.');
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  }, [selectedJobId]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

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

  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!activeApplication) return;
    try {
      setStatusLoading(true);
      setStatusError('');
      const payload = { status: statusForm.status };
      const noteValue = statusForm.note.trim();
      if (noteValue) payload.note = noteValue;
      await applicationAPI.updateApplicationStatus(activeApplication._id, payload);
      await fetchApplications();
      closeStatusModal();
    } catch (e2) {
      console.error(e2);
      const message = e2.response?.data?.error || 'Unable to update application status. Please try again.';
      setStatusError(message);
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="bg-gray-50 min-h-screen py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Employer Dashboard</h1>
              <p className="text-gray-600">Monitor your job postings and review applicants in one place.</p>
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
              <Link to="/employer/jobs/new" className="btn btn-primary whitespace-nowrap">Post a Job</Link>
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
              <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-6 text-red-600">{jobsError}</div>
            ) : jobs.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs posted yet</h3>
                <p className="text-gray-600 mb-6">Create your first job to start receiving applications.</p>
                <Link to="/employer/jobs/new" className="btn btn-primary">Post Your First Job</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <DashboardJobCard
                    key={job._id}
                    job={job}
                    showStatus
                    showStats
                    tags={[job.jobType, job.category].filter(Boolean)}
                    onClick={() => {
                      setSelectedJobId(job._id);
                      setSelectedJob(job);
                      setShowJobModal(true);
                      setShowEditMode(false);
                      setJobModalView('overview');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Job Actions Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-slideUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 text-white">
                  <h2 className="text-xl font-bold mb-2">{selectedJob.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-white/20 rounded text-white">{formatLocation(selectedJob.location)}</span>
                    <span className="px-2 py-1 bg-white/20 rounded text-white">{formatSalaryRange(selectedJob.salary)}</span>
                    <span className="px-2 py-1 bg-white/20 rounded text-white">{selectedJob.jobType}</span>
                    <span className="px-2 py-1 bg-purple-400 text-purple-900 rounded font-semibold">{selectedJob.category}</span>
                    <span className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded font-semibold">Apply by: {formatDate(selectedJob.applicationDeadline)}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowJobModal(false); setShowEditMode(false); setJobModalView('overview'); }}
                    className="text-white hover:text-gray-200 transition-colors"
                    aria-label="Close"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${selectedJob.isActive ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>{selectedJob.isActive ? '● Active' : '○ Paused'}</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 flex-1 overflow-y-auto">
              {!showEditMode && jobModalView === 'overview' ? (
                <div className="space-y-5">
                  {/* Quick Stats - Only Applications & Views */}
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className="relative overflow-hidden text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:shadow-md transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                      role="button"
                      tabIndex={0}
                      onClick={() => setJobModalView('applications')}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setJobModalView('applications'); } }}
                    >
                      <div className="absolute top-2 right-2 opacity-20">
                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                      </div>
                      <div className="text-3xl font-bold text-blue-600 mb-1">{selectedJob.applicationsCount || 0}</div>
                      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Applications</div>
                    </div>
                    <div className="relative overflow-hidden text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border-2 border-indigo-200 hover:shadow-md transition-shadow">
                      <div className="absolute top-2 right-2 opacity-20">
                        <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-3xl font-bold text-indigo-600 mb-1">{selectedJob.viewsCount || 0}</div>
                      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Views</div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Short Description */}
                  {selectedJob.description && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Job Description</h3>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{selectedJob.description}</p>
                      <Link to={`/jobs/${selectedJob._id}`} target="_blank" className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700">
                        Read full description
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Action Buttons */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h4>
                    <div className="space-y-3">
                      <Link to={`/employer/jobs/${selectedJob._id}/edit`} className="group w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                        <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Job Details
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
                          className={`group inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                            selectedJob.isActive 
                              ? 'text-orange-700 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 focus:ring-orange-400' 
                              : 'text-green-700 bg-green-50 hover:bg-green-100 border-2 border-green-200 focus:ring-green-400'
                          }`}
                        >
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={selectedJob.isActive ? "M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" : "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
                          </svg>
                          {selectedJob.isActive ? 'Pause Job' : 'Activate Job'}
                        </button>
                        <Link to={`/jobs/${selectedJob._id}`} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all border-2 border-indigo-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          View Full
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : jobModalView === 'applications' && !showEditMode ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Applications for this job</h3>
                    <button className="btn btn-outline btn-sm" onClick={() => setJobModalView('overview')}>Back</button>
                  </div>
                  {applicationsLoading ? (
                    <LoadingSpinner text="Loading applications..." />
                  ) : applicationsError ? (
                    <div className="text-sm text-red-600">{applicationsError}</div>
                  ) : applications.length === 0 ? (
                    <div className="text-sm text-gray-600">No applications yet.</div>
                  ) : (
                    <div className="max-h-[50vh] overflow-y-auto border border-gray-100 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Candidate</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {applications.map((a) => (
                            <tr key={a._id}>
                              <td className="px-4 py-2 text-sm text-gray-800">{a.applicant?.name || 'Candidate'}</td>
                              <td className="px-4 py-2"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadge[a.status] || 'bg-gray-100 text-gray-700'}`}>{a.status}</span></td>
                              <td className="px-4 py-2 text-right">
                                <button className="btn btn-outline btn-xs" onClick={() => openStatusModal(a)}>Update status</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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
                  <p className="text-sm text-gray-500">{activeApplication.applicant?.name || 'Candidate'} — {activeApplication.applicant?.email}</p>
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
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Select new status</label>
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
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">Optional note (visible to your team)</label>
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