import React from 'react';

const TIME_OPTIONS = [
  { label: '5m', value: 5 },
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '1h', value: 60 },
  { label: '2h', value: 120 },
  { label: '4h', value: 240 },
  { label: '8h', value: 480 },
  { label: '12h', value: 720 },
  { label: '24h', value: 1440 },
];

interface RelativeTimeFilterProps {
  value: number;
  onChange: (minutes: number) => void;
}

export const RelativeTimeFilter: React.FC<RelativeTimeFilterProps> = ({ value, onChange }) => (
  <div className="flex items-center gap-2">
    <span className="text-gray-300 font-medium text-sm">Time:</span>
    <select
      className="bg-gray-800 text-white px-3 py-1.5 rounded-md border border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
    >
      {TIME_OPTIONS.map(opt => (
        <option key={opt.value} value={opt.value}>{`Last ${opt.label}`}</option>
      ))}
    </select>
  </div>
); 