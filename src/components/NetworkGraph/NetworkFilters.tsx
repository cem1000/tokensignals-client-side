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
    <div className="flex items-center gap-2">
      <span className="text-gray-300 font-medium text-sm">Limit:</span>
      <select
        className="bg-gray-800 text-white px-3 py-1.5 rounded-md border border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        value={limit}
        onChange={e => onLimitChange(Number(e.target.value))}
      >
        {LIMIT_OPTIONS.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}; 