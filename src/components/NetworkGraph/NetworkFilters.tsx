import React from 'react';
import { VOLUME_BUCKETS, getMinVolumeFromIndex } from './utils/networkUtils';

const LIMIT_OPTIONS = [5, 10, 25, 50, 100, 200, 500];

interface NetworkFiltersProps {
  limit: number;
  onLimitChange: (limit: number) => void;
}

export const NetworkFilters: React.FC<NetworkFiltersProps> = ({
  limit,
  onLimitChange
}) => {
  return (
    <div className="flex items-center gap-6 mb-4 px-4 py-2 bg-gray-900 border-b border-gray-800 rounded-t">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">Limit:</span>
        <select
          className="bg-gray-800 text-white px-2 py-1 rounded"
          value={limit}
          onChange={e => onLimitChange(Number(e.target.value))}
        >
          {LIMIT_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
}; 