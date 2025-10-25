import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { applicationAPI, jobAPI, API_BASE_URL } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatLocation, formatSalaryRange } from '../utils/formatters';

const statusOptions = [
  { value: 'pending', label: 'Pending review' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interviewed', label: 'Interviewed' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

const badgeByStatus = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  reviewed: 'bg-blue-50 text-blue-700 border border-blue-100',
  shortlisted: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
  interviewed: 'bg-purple-50 text-purple-700 border border-purple-100',
  hired: 'bg-green-50 text-green-700 border border-green-100',
  rejected: 'bg-red-50 text-red-700 border border-red-100',
};

const EmployerJobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [jobError, setJobError] = useState('');

  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [appsError, setAppsError] = useState('');
  const [stats, setStats] = useState({});

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [activeApplication, setActiveApplication] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: 'pending', note: '' });
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoadingJob(true);
        setJobError('');
        const res = await jobAPI.getJob(jobId);
        setJob(res.data.data);
      } catch (e) {
        setJobError(e.response?.data?.error || 'Failed to load job');
      } finally {
        setLoadingJob(false);
      }
    };
    loadJob();
  }, [jobId]);

  const loadApplications = useCallback(async () => {
    try {
      setAppsLoading(true);
      setAppsError('');
      const res = await applicationAPI.getJobApplications(jobId, { limit: 200 });
      setApplications(res.data.data || []);
      setStats(res.data.stats || {});
    } catch (e) {
      setAppsError(e.response?.data?.error || 'Unable to load applications');
      setApplications([]);
      setStats({});
    } finally {
      setAppsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

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
      await loadApplications();
      closeStatusModal();
    } catch (err) {
      const message = err.response?.data?.error || 'Unable to update application status. Please try again.';
      setStatusError(message);
    } finally {
      setStatusLoading(false);
    }
  };

  const companyName = job?.company?.name || 'Unknown Company';
  const salaryLabel = job ? formatSalaryRange(job.salary) : '';
  const locationLabel = job ? formatLocation(job.location) : '';
  const resumeUrlFor = (application) => application.resume?.path
    ? `${API_BASE_URL}/${application.resume.path.replace(/^\/+/, '')}`
    : null;

  return (
    <div className="bg-gray-50 min-h-screen py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Applications for this job</h1>
            {loadingJob ? (
              <span className="text-sm text-gray-500">Loading job…</span>
            ) : jobError ? (
              <span className="text-sm text-red-600">{jobError}</span>
            ) : job ? (
              <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2">
                <span className="text-primary-700 font-medium">{job.title}</span>
                <span className="text-gray-300">•</span>
                <span>{companyName}</span>
                <span className="text-gray-300">•</span>
                <span>{salaryLabel}</span>
                <span className="text-gray-300">•</span>
                <span>{locationLabel}</span>
              </div>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-outline" onClick={() => navigate(-1)}>Back</button>
            {job && (
              <Link to={`/employer/jobs/${job._id}/edit`} className="btn btn-primary">Edit job</Link>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {appsLoading ? (
            <div className="p-6">
              <LoadingSpinner text="Loading applications..." />
            </div>
          ) : appsError ? (
            <div className="p-6 text-sm text-red-600">{appsError}</div>
          ) : applications.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">No applications received for this job yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {applications.map((application) => {
                    const applicant = application.applicant || {};
                    const resumeUrl = resumeUrlFor(application);
                    const badgeClass = badgeByStatus[application.status] || 'bg-gray-100 text-gray-700';

                    return (
                      <tr key={application._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-800">{applicant.name}</div>
                          <div className="text-xs text-gray-500">{applicant.profile?.experience || 'Experience: N/A'}</div>
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
                              <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                                View resume
                              </a>
                            )}
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => openStatusModal(application)}>
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

          {Object.keys(stats).length > 0 && (
            <footer className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
              <div className="flex flex-wrap gap-3">
                {Object.entries(stats).map(([status, count]) => (
                  <span key={status} className="px-3 py-1 rounded-full bg-white border border-gray-200">
                    {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
                  </span>
                ))}
              </div>
            </footer>
          )}
        </div>
      </div>

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
                <button type="button" onClick={closeStatusModal} className="text-gray-400 hover:text-gray-600" aria-label="Close" disabled={statusLoading}>
                  <span className="text-2xl leading-none">×</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Select new status</label>
                  <select id="status" name="status" value={statusForm.status} onChange={handleStatusChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" disabled={statusLoading}>
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">Optional note (visible to your team)</label>
                  <textarea id="note" name="note" rows={4} value={statusForm.note} onChange={handleStatusChange} placeholder="Add context about this decision..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" disabled={statusLoading} />
                  <p className="text-xs text-gray-400 mt-1">Notes help teammates understand progress. Applicants do not see these notes.</p>
                </div>
              </div>

              {statusError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{statusError}</div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" className="btn btn-outline" onClick={closeStatusModal} disabled={statusLoading}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={statusLoading}>{statusLoading ? 'Updating...' : 'Save changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerJobApplications;
