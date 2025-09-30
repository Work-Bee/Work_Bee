import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <div className={`spinner ${sizeClasses[size]} mb-4`}></div>
      <p className="text-gray-600 animate-pulse">{text}</p>
    </div>
  );
};

export default LoadingSpinner;