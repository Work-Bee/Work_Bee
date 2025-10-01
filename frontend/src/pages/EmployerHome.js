import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatLocation, formatSalaryRange } from '../utils/formatters';

const EmployerHome = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await jobAPI.getEmployerJobs({ limit: 3 });
        setJobs(response.data.data || []);
      } catch (err) {
        console.error('Error fetching employer jobs', err);
        setError('Unable to load your recent postings.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/15 text-white text-sm font-semibold mb-6">
                Hire faster in Kochi
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
                Build a reliable workforce with WorkBee.
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-xl mb-8">
                Post openings designed for entry-level talent, review candidates in one dashboard, and keep your hiring pipeline organised from start to finish.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/employer/jobs/new" className="btn btn-secondary btn-lg bg-white text-primary-600 hover:bg-gray-100">
                  Post a New Job
                </Link>
                <Link to="/dashboard" className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary-600">
                  Open Dashboard
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 bg-white/10 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white text-gray-900 rounded-3xl shadow-2xl p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-primary-600 mb-3">Hiring snapshot</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Active postings', value: jobs.length },
                      { label: 'Applicants this week', value: jobs.reduce((acc, job) => acc + (job.applicationsCount || 0), 0) },
                      { label: 'Average salary', value: jobs.length ? `₹${Math.round(jobs.reduce((acc, job) => acc + (job.salary?.max || 0), 0) / jobs.length).toLocaleString('en-IN')}` : '—' },
                      { label: 'Time to publish', value: 'Under 5 mins' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500 uppercase tracking-wide">{item.label}</p>
                        <p className="text-2xl font-semibold text-gray-900 mt-2">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Tip: Keep your job descriptions focused on responsibilities and shift timings to attract the right candidates quickly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Recent job postings</h2>
              <p className="text-gray-600">Keep track of the roles you have live right now.</p>
            </div>
            <Link to="/dashboard" className="btn btn-primary">View all jobs</Link>
          </div>

          {loading ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
              <LoadingSpinner text="Loading your job postings..." />
            </div>
          ) : error ? (
            <div className="bg-white border border-red-100 text-red-700 rounded-2xl p-8 text-center">
              {error}
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-primary-200 p-12 text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">You haven&apos;t posted any jobs yet</h3>
              <p className="text-gray-600 mb-6">Publish your first opening to start receiving applications from motivated job seekers.</p>
              <Link to="/employer/jobs/new" className="btn btn-primary btn-lg">Create your first job</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job._id} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-500">{formatLocation(job.location)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.isActive ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {job.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{job.jobType} • {job.experienceLevel}</p>
                    <p>{formatSalaryRange(job.salary)}</p>
                    <p>Applicants: <span className="font-semibold text-gray-900">{job.applicationsCount}</span></p>
                    {job.applicationDeadline && (
                      <p>Apply by {formatDate(job.applicationDeadline)}</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Link to={`/employer/jobs/${job._id}/edit`} className="btn btn-outline btn-sm flex-1">Edit</Link>
                    <Link to="/employer/jobs/new" state={{ duplicateFrom: job }} className="btn btn-outline btn-sm flex-1">
                      Duplicate
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Hiring playbook</h2>
            <p className="text-lg text-gray-600">Simple steps to keep your recruitment flow efficient.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Publish clear roles',
                description: 'Share shifts, pay range, and required documents so applicants can respond quickly.'
              },
              {
                step: '2',
                title: 'Review daily',
                description: 'Check the dashboard each day to shortlist applicants and move fast on interviews.'
              },
              {
                step: '3',
                title: 'Update candidates',
                description: 'Use status updates so applicants stay informed while you finalise hiring.'
              }
            ].map((item) => (
              <div key={item.step} className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-lg font-semibold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Need to hire quickly?</h2>
          <p className="text-lg text-white/80 mb-8">Create a post in minutes and start receiving applications from ready-to-work talent across Kochi.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/employer/jobs/new" className="btn btn-secondary btn-lg bg-white text-primary-600 hover:bg-gray-100">
              Post a Job Now
            </Link>
            <Link to="/dashboard" className="btn btn-outline btn-lg border-white text-white hover:bg-white hover:text-primary-600">
              Review Applicants
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmployerHome;
