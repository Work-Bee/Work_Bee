import React from 'react';
import { formatLocation, formatSalaryRange, formatDate } from '../utils/formatters';

/**
 * DashboardStyle Job Card
 * Props:
 * - job: Job object
 * - onClick: () => void (card click handler)
 * - showStatus: boolean (show Active/Paused badge)
 * - showStats: boolean (show Applications/Views boxes)
 * - tags: string[] (small header chips)
 */
const DashboardJobCard = ({ job, onClick, showStatus = false, showStats = false, tags = [] }) => {
  if (!job) return null;
  const locationLabel = formatLocation(job.location);
  const salaryLabel = formatSalaryRange(job.salary);
  const deadline = job.applicationDeadline ? formatDate(job.applicationDeadline) : null;
  const isActive = !!job.isActive;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">{job.title}</h3>
          {showStatus && (
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isActive ? '● Active' : '○ Paused'}
            </span>
          )}
        </div>
        {tags?.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            {tags.slice(0, 2).map((t, idx) => (
              <span key={idx} className="px-2 py-1 bg-white rounded-md">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
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

        {showStats ? (
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
        ) : (
          <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {deadline ? <>Deadline: {deadline}</> : 'Open until filled'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardJobCard;
