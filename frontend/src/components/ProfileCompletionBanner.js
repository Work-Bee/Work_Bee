import React from 'react';
import { Link } from 'react-router-dom';
import { computeJobSeekerCompletion, computeEmployerCompletion } from '../utils/profile';

const Bar = ({ percent }) => (
  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
    <div
      className="h-2 rounded-full bg-gray-800"
      style={{ width: `${percent}%` }}
    />
  </div>
);

const ProfileCompletionBanner = ({ user }) => {
  if (!user) return null;
  const role = user.role;
  const { percent, missing } = role === 'employer' ? computeEmployerCompletion(user) : computeJobSeekerCompletion(user);

  // Consider fully complete at >= 95%
  if (percent >= 95) return null;

  const cta = role === 'employer' ? {
    to: '/dashboard/profile?wizard=1',
    label: 'Complete company profile',
    note: 'Add your company to start posting jobs.',
  } : {
    to: '/profile',
    label: 'Complete your profile',
    note: 'Upload your resume and fill in details to apply for jobs.',
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-800 font-medium">
                Profile completion: <span className="font-semibold">{percent}%</span>
              </p>
              <span className="text-xs text-gray-500 hidden sm:inline">
                {missing.length > 0 ? `Missing: ${missing.slice(0,3).join(', ')}${missing.length > 3 ? '…' : ''}` : 'All set'}
              </span>
            </div>
            <Bar percent={percent} />
          </div>
          <div className="sm:ml-4">
            <Link to={cta.to} className="btn btn-sm btn-primary whitespace-nowrap">{cta.label}</Link>
            <p className="text-xs text-gray-500 mt-1">{cta.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionBanner;
