import React from 'react';
import { TokenSearch } from '../TokenSearch/TokenSearch';

interface HeaderProps {
  onTokenSelect: (token: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onTokenSelect }) => {
  return (
    <header className="w-full bg-gray-950 border-b border-gray-800 flex items-center justify-between px-8 py-3">
      <div className="flex items-center">
        <span className="text-blue-400 font-bold text-xl tracking-tight mr-2">TokenSignals</span>
        <span className="text-xs text-gray-400 font-light">Uniswap Network Visualizer</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center space-x-4">
        <TokenSearch onTokenSelect={onTokenSelect} />
      </div>
    </header>
  );
}; 