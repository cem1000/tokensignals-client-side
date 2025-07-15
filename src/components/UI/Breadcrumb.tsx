import React from 'react';

export interface BreadcrumbProps {
  path: string[];
  currentToken: string;
  onTokenClick: (token: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  path, 
  currentToken, 
  onTokenClick 
}) => {
  const maxBreadcrumbs = 7;
  const displayPath = path.length > maxBreadcrumbs 
    ? [...path.slice(-maxBreadcrumbs + 1), currentToken]
    : [...path, currentToken];

  return (
    <div className="flex items-center justify-center py-3 px-4 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center space-x-2 text-sm">
        {displayPath.map((token, index) => (
          <React.Fragment key={`${token}-${index}`}>
            {index > 0 && (
              <svg 
                className="w-4 h-4 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            )}
            <button
              onClick={() => onTokenClick(token)}
              className={`px-3 py-1 rounded-md transition-colors duration-200 ${
                index === displayPath.length - 1
                  ? 'bg-blue-600 text-white font-semibold cursor-default'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
              disabled={index === displayPath.length - 1}
            >
              {token}
            </button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}; 