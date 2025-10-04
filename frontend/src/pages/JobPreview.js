import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { jobAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatLocation, formatSalaryRange } from '../utils/formatters';

const JobPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await jobAPI.getJob(id);
        setJob(res.data.data);
        setError('');
      } catch (e) {
        setError(e.response?.data?.error || 'Failed to load job');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="card">
          <div className="card-body">
            <p className="text-red-600 text-sm">{error || 'Job not found'}</p>
            <div className="mt-4">
              <button className="btn btn-outline" onClick={() => navigate(-1)}>Go back</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const companyName = job.company?.name || 'Unknown Company';
  const salaryLabel = formatSalaryRange(job.salary);
  const locationLabel = formatLocation(job.location);
  const postedDate = job.createdAt ? formatDate(job.createdAt) : null;
  const deadline = job.applicationDeadline ? formatDate(job.applicationDeadline) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <header className="px-6 py-5 border-b border-gray-200 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{job.title}</h1>
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
            <div className="text-right">
              <div className="text-sm font-medium text-green-700">{salaryLabel}</div>
              <div className="text-xs text-gray-500">{locationLabel}</div>
            </div>
          </header>

          <div className="px-6 py-5 space-y-4 text-sm text-gray-700">
            {job.responsibilities?.length ? (
              <div>
                <div className="font-semibold text-gray-800 mb-1">Responsibilities</div>
                <ul className="list-disc list-inside space-y-1">
                  {job.responsibilities.slice(0, 5).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {job.requirements?.length ? (
              <div>
                <div className="font-semibold text-gray-800 mb-1">Requirements</div>
                <ul className="list-disc list-inside space-y-1">
                  {job.requirements.slice(0, 5).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {deadline && (
              <div className="text-xs text-gray-500">Apply by {deadline}</div>
            )}
          </div>

          <footer className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button className="btn btn-outline" onClick={() => navigate(-1)}>Back to jobs</button>
            <div className="flex items-center gap-2">
              <Link to={`/jobs/${job._id}`} className="btn btn-outline btn-sm">Full details</Link>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default JobPreview;
