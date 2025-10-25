import React from 'react';
import { useQuery } from 'react-query';
import { adminAPI } from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const formatDateTime = (value) => {
  if (!value) {
    return '—';
  }
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return '—';
  }
};

const toTitleCase = (value) => {
  if (!value) {
    return '—';
  }
  return value
    .split(/[_\s-]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const AdminDashboard = () => {
  const numberFormatter = React.useMemo(() => new Intl.NumberFormat(), []);

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery(
    ['admin-overview'],
    async () => {
      const response = await adminAPI.getOverview();
      return response.data.data;
    },
    {
      staleTime: 60 * 1000,
    }
  );

  if (isLoading) {
    return (
      <div className="py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    const message = error.response?.data?.error || error.message || 'Unable to load admin data.';
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="alert alert-error">
          <div className="flex flex-col gap-3">
            <span>{message}</span>
            <button type="button" onClick={() => refetch()} className="btn btn-outline w-fit">
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    metrics = {},
    recentJobSeekers = [],
    recentEmployers = [],
    recentJobs = [],
    recentApplications = [],
  } = data || {};

  const metricCards = [
    {
      label: 'Job Seekers',
      value: metrics.totalJobSeekers,
      caption: 'Registered seekers',
    },
    {
      label: 'Employers',
      value: metrics.totalEmployers,
      caption: 'Active hiring partners',
    },
    {
      label: 'Open Roles',
      value: metrics.activeJobs,
      caption: `${numberFormatter.format(metrics.totalJobs ?? 0)} total listings`,
    },
    {
      label: 'Applications',
      value: metrics.totalApplications,
      caption: 'Submitted across all jobs',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">
            Monitor platform activity and keep track of seeker and employer engagement.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="btn btn-outline w-fit"
          disabled={isFetching}
        >
          {isFetching ? 'Refreshing…' : 'Refresh data'}
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ label, value, caption }) => (
          <div key={label} className="bg-white shadow-sm border border-gray-100 rounded-lg p-5">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-800">
              {numberFormatter.format(value ?? 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{caption}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Latest Job Seekers</h2>
              <p className="text-xs text-gray-500">Most recent seeker registrations</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Experience</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentJobSeekers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                      No job seeker activity yet.
                    </td>
                  </tr>
                ) : (
                  recentJobSeekers.map((seeker) => (
                    <tr key={seeker._id}>
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">{seeker.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{seeker.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {seeker.profile?.experience ? toTitleCase(seeker.profile.experience) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(seeker.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Latest Employers</h2>
              <p className="text-xs text-gray-500">Most recent employer sign-ups</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentEmployers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                      No employer activity yet.
                    </td>
                  </tr>
                ) : (
                  recentEmployers.map((employer) => (
                    <tr key={employer._id}>
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">{employer.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{employer.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {employer.company?.name || employer.companyDetails?.companyName || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(employer.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Recent Job Posts</h2>
              <p className="text-xs text-gray-500">Newest opportunities posted on the platform</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Posted By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applications</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Posted</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                      No job postings yet.
                    </td>
                  </tr>
                ) : (
                  recentJobs.map((job) => (
                    <tr key={job._id}>
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">{job.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{job.company?.name || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{job.postedBy?.name || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{numberFormatter.format(job.applicationsCount ?? 0)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            job.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {job.isActive ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(job.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Recent Applications</h2>
              <p className="text-xs text-gray-500">Latest applications submitted by seekers</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Job</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentApplications.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">
                      No applications yet.
                    </td>
                  </tr>
                ) : (
                  recentApplications.map((application) => (
                    <tr key={application._id}>
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                        {application.job?.title || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {application.applicant?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                          {toTitleCase(application.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(application.appliedAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
