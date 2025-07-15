import React from 'react';

interface Props {
  window: '24h' | '1h';
  onWindowChange: (window: '24h' | '1h') => void;
}

export const NetworkControls: React.FC<Props> = ({
  window,
  onWindowChange
}) => {
  return (
    <div className="flex items-center space-x-4 text-sm">
      <div className="flex items-center space-x-1 ml-4">
        <span className="text-gray-400">Window:</span>
        <button
          className={`px-2 py-1 rounded transition-colors ${window === '24h' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
          onClick={() => onWindowChange('24h')}
        >
          Last 24h
        </button>
        <button
          className={`px-2 py-1 rounded transition-colors ${window === '1h' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
          onClick={() => onWindowChange('1h')}
        >
          Last 1h
        </button>
      </div>
    </div>
  );
}; 