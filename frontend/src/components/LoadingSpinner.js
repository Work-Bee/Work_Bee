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
      {/* Graduation cap with rotating aura */}
      <div className="relative mb-6 w-32 h-32 flex items-center justify-center">
        {/* Rotating aura ring with particles */}
        <div className="absolute inset-0 animate-spin" style={{animationDuration: '3s'}}>
          {/* Main aura ring */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Outer glowing ring */}
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="url(#gradient)" 
              strokeWidth="2"
              strokeDasharray="8 4"
              opacity="0.6"
            />
            {/* Inner subtle ring */}
            <circle 
              cx="50" 
              cy="50" 
              r="42" 
              fill="none" 
              stroke="#1f2937" 
              strokeWidth="1"
              opacity="0.3"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#1f2937', stopOpacity: 1}} />
                <stop offset="50%" style={{stopColor: '#4b5563', stopOpacity: 0.8}} />
                <stop offset="100%" style={{stopColor: '#1f2937', stopOpacity: 1}} />
              </linearGradient>
            </defs>
            
            {/* Orbiting particles */}
            <circle cx="50" cy="5" r="2.5" fill="#1f2937" opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="95" cy="50" r="2" fill="#4b5563" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" begin="0.5s" />
            </circle>
            <circle cx="50" cy="95" r="2.5" fill="#1f2937" opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" begin="1s" />
            </circle>
            <circle cx="5" cy="50" r="2" fill="#4b5563" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" begin="1.5s" />
            </circle>
            
            {/* Additional small particles */}
            <circle cx="73" cy="15" r="1.5" fill="#6b7280" opacity="0.7">
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="85" cy="73" r="1.5" fill="#6b7280" opacity="0.7">
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
            </circle>
            <circle cx="27" cy="85" r="1.5" fill="#6b7280" opacity="0.7">
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.5s" repeatCount="indefinite" begin="1s" />
            </circle>
            <circle cx="15" cy="27" r="1.5" fill="#6b7280" opacity="0.7">
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
            </circle>
          </svg>
        </div>
        
        {/* Central graduation cap (stationary) */}
        <div className="relative z-10 w-16 h-16">
          <svg className="w-full h-full text-gray-800" fill="currentColor" viewBox="0 0 24 24">
            {/* Graduation cap icon */}
            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
          </svg>
        </div>
      </div>
      
      {/* Animated dots */}
      <div className="flex space-x-2 mb-4">
        <div className={`${dotSize[size]} bg-gray-800 rounded-full animate-bounce`}></div>
        <div className={`${dotSize[size]} bg-gray-800 rounded-full animate-bounce`} style={{animationDelay: '0.1s'}}></div>
        <div className={`${dotSize[size]} bg-gray-800 rounded-full animate-bounce`} style={{animationDelay: '0.2s'}}></div>
      </div>
      
      <p className="text-gray-800 font-medium animate-pulse">{text}</p>
    </div>
  );
};

export default LoadingSpinner;