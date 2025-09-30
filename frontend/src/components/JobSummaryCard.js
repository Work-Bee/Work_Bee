import React from 'react';
import { Link } from 'react-router-dom';
import { formatSalaryRange, formatLocation, formatDate } from '../utils/formatters';

const JobSummaryCard = ({ job }) => {
  if (!job) return null;

  const companyName = job.company?.name || 'Unknown Company';
  const description = job.description || '';
  const summary = description.length > 180 ? `${description.slice(0, 177)}...` : description;
  const salaryLabel = formatSalaryRange(job.salary);
  const locationLabel = formatLocation(job.location);
  const postedDate = job.createdAt ? formatDate(job.createdAt) : null;

  return (
    <div className="job-card">
      <div className="card-body">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-1">{job.title}</h3>
              <p className="text-primary-600 font-medium mb-1">{companyName}</p>
              <p className="text-gray-600 text-sm">
                {locationLabel}
                {postedDate && (
                  <span className="ml-2 text-xs text-gray-400">• Posted {postedDate}</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{summary}</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-green-600">{salaryLabel}</span>
            {job.jobType ? (
              <span className="badge badge-gray">{job.jobType}</span>
            ) : null}
            {job.category ? (
              <span className="inline-flex items-center gap-1 text-gray-500">
                <span className="text-gray-300">•</span>
                <span>{job.category}</span>
              </span>
            ) : null}
            {job.applicationsCount ? (
              <span className="inline-flex items-center gap-1 text-gray-500">
                <span className="text-gray-300">•</span>
                <span>{job.applicationsCount} applicants</span>
              </span>
            ) : null}
          </div>
          <Link
            to={`/jobs/${job._id}`}
            className="btn btn-primary btn-sm self-start sm:self-auto"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobSummaryCard;
