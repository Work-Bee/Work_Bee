import React from 'react';
import { Link } from 'react-router-dom';

/**
 * EmptyState
 * Props:
 * - title: string
 * - description?: string | ReactNode
 * - icon?: ReactNode
 * - primaryAction?: { label: string, to?: string, onClick?: () => void }
 * - secondaryAction?: { label: string, to?: string, onClick?: () => void }
 */
const EmptyState = ({ title, description, icon, primaryAction, secondaryAction }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
      {icon ? (
        <div className="mx-auto h-12 w-12 text-gray-300 mb-4 flex items-center justify-center">
          {icon}
        </div>
      ) : (
        <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
        </svg>
      )}
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      {description && (
        <div className="text-gray-600 mb-6">{description}</div>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {primaryAction && (
            primaryAction.to ? (
              <Link to={primaryAction.to} className="btn btn-primary min-w-[160px]">
                {primaryAction.label}
              </Link>
            ) : (
              <button onClick={primaryAction.onClick} className="btn btn-primary min-w-[160px]">
                {primaryAction.label}
              </button>
            )
          )}
          {secondaryAction && (
            secondaryAction.to ? (
              <Link to={secondaryAction.to} className="btn btn-outline min-w-[160px]">
                {secondaryAction.label}
              </Link>
            ) : (
              <button onClick={secondaryAction.onClick} className="btn btn-outline min-w-[160px]">
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
