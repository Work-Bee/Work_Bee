import React, { useCallback, useEffect, useState } from 'react';
import { applicationAPI } from '../utils/api';
import LoadingSpinner from './LoadingSpinner';
import { formatDate, formatLocation, formatSalaryRange } from '../utils/formatters';

const EmployerJobModal = ({ job, isOpen, onClose }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('overview'); // 'overview' | 'applications'

  const loadApplications = useCallback(async () => {
    if (!job?._id) return;
    try {
      setLoading(true);
      setError('');
      const res = await applicationAPI.getJobApplications(job._id, { limit: 100 });
      setApplications(res.data.data || []);
    } catch (e) {
      console.error('Error loading applications', e);
      setError('Unable to load applications for this job.');
    } finally {
      setLoading(false);
    }
  }, [job?._id]);

  useEffect(() => {
    if (isOpen && job?._id) {
      setView('overview');
      loadApplications();
    }
  }, [isOpen, job?._id, loadApplications]);

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 text-white">
              <h2 className="text-xl font-bold mb-2">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-white/20 rounded text-white">{formatLocation(job.location)}</span>
                <span className="px-2 py-1 bg-white/20 rounded text-white">{formatSalaryRange(job.salary)}</span>
                {job.jobType && <span className="px-2 py-1 bg-white/20 rounded text-white">{job.jobType}</span>}
                {job.category && <span className="px-2 py-1 bg-purple-400 text-purple-900 rounded font-semibold">{job.category}</span>}
                {job.applicationDeadline && (
                  <span className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded font-semibold">
                    Apply by: {formatDate(job.applicationDeadline)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button type="button" onClick={onClose} className="text-white hover:text-gray-200 transition-colors" aria-label="Close">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${job.isActive ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                {job.isActive ? '● Active' : '○ Paused'}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex-1 overflow-y-auto">
          {view === 'overview' ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="relative overflow-hidden text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:shadow-md transition-shadow"
                  onClick={() => setView('applications')}
                >
                  <div className="absolute top-2 right-2 opacity-20">
                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">{job.applicationsCount || applications.length}</div>
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Applications</div>
                </button>
                <div className="relative overflow-hidden text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border-2 border-indigo-200 hover:shadow-md transition-shadow">
                  <div className="absolute top-2 right-2 opacity-20">
                    <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-indigo-600 mb-1">{job.viewsCount || 0}</div>
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Views</div>
                </div>
              </div>

              {job.description && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Job Description</h3>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{job.description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Applications for this job</h3>
                <button className="btn btn-outline btn-sm" onClick={() => setView('overview')}>Back</button>
              </div>
              {loading ? (
                <LoadingSpinner text="Loading applications..." />
              ) : error ? (
                <div className="text-sm text-red-600">{error}</div>
              ) : applications.length === 0 ? (
                <div className="text-sm text-gray-600">No applications yet.</div>
              ) : (
                <div className="max-h-[50vh] overflow-y-auto border border-gray-100 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Candidate</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {applications.map((a) => (
                        <tr key={a._id}>
                          <td className="px-4 py-2 text-sm text-gray-800">{a.applicant?.name || 'Candidate'}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{a.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerJobModal;
