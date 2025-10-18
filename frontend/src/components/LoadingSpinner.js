import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  };

  const dotSize = {
    small: 'w-1.5 h-1.5',
    medium: 'w-2 h-2',
    large: 'w-3 h-3',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      {/* Themed animated spinner */}
      <div className="relative mb-6">
        {/* Outer rotating gradient ring */}
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 border-r-green-500 rounded-full animate-spin"></div>
        
        {/* Inner bee icon */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-8 h-8 text-purple-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
          </svg>
        </div>
      </div>
      
      {/* Animated dots */}
      <div className="flex space-x-2 mb-4">
        <div className={`${dotSize[size]} bg-purple-500 rounded-full animate-bounce`}></div>
        <div className={`${dotSize[size]} bg-green-500 rounded-full animate-bounce`} style={{animationDelay: '0.1s'}}></div>
        <div className={`${dotSize[size]} bg-purple-400 rounded-full animate-bounce`} style={{animationDelay: '0.2s'}}></div>
      </div>
      
      <p className="text-gray-600 font-medium animate-pulse">{text}</p>
    </div>
  );
};

export default LoadingSpinner;