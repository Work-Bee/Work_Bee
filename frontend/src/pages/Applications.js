import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationAPI, API_BASE_URL } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatLocation, formatSalaryRange } from '../utils/formatters';

const statusStyles = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
  reviewed: 'bg-blue-50 text-blue-700 border border-blue-100',
  shortlisted: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
  interviewed: 'bg-purple-50 text-purple-700 border border-purple-100',
  hired: 'bg-green-50 text-green-700 border border-green-100',
  rejected: 'bg-red-50 text-red-700 border border-red-100',
};

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
                <div key={application._id} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-6 sm:p-8">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-primary-600 font-medium">{companyName}</p>
                      <p className="text-sm text-gray-600">
                        {locationLabel}
                        {job.jobType && <span className="ml-2">• {job.jobType}</span>}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Applied on {appliedDate}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p className="font-semibold text-green-600">{salaryLabel}</p>
                      {job.applicationDeadline && (
                        <p className="text-xs text-gray-400 mt-1">
                          Apply by {formatDate(job.applicationDeadline)}
                        </p>
                      )}
                    </div>
                  </div>

                  {application.coverLetter && (
                    <div className="mt-5 bg-gray-50 border border-gray-100 rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Cover letter preview</h3>
                      <p className="text-sm text-gray-600 whitespace-pre-line max-h-40 overflow-y-auto">
                        {application.coverLetter}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                    <Link to={`/jobs/${job._id}`} className="btn btn-outline btn-sm">
                      View job details
                    </Link>
                    {resumeUrl && (
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                      >
                        View submitted resume
                      </a>
                    )}
                    <span className="text-xs text-gray-500">
                      Last updated {formatDate(application.lastStatusUpdate)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;