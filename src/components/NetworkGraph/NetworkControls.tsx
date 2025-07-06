import React from 'react';
import type { NetworkControlsProps } from './types/networkGraph';

export const NetworkControls: React.FC<NetworkControlsProps> = ({
  linkMode,
  onModeChange
}) => {
  return (
    <div className="flex items-center space-x-2 text-sm">
      <button
        className={`px-2 py-1 rounded transition-colors ${
          linkMode === 'inflow' 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
        }`}
        onClick={() => onModeChange('inflow')}
      >
        Inflow
      </button>
      <button
        className={`px-2 py-1 rounded transition-colors ${
          linkMode === 'outflow' 
            ? 'bg-red-600 text-white' 
            : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
        }`}
        onClick={() => onModeChange('outflow')}
      >
        Outflow
      </button>
    </div>
  );
}; 