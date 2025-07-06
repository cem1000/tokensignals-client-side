import { TrendingUp } from 'lucide-react';
import { TokenSearch } from '../TokenSearch/TokenSearch';

interface HeaderProps {
  onTokenSelect: (token: string) => void;
}

export const Header = ({ onTokenSelect }: HeaderProps) => {
  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-blue-500" size={28} />
            <div>
              <h1 className="text-lg font-bold text-white">TokenSignals</h1>
              <p className="text-xs text-gray-400">Uniswap Network Visualizer</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <TokenSearch onTokenSelect={onTokenSelect} />
          </div>
        </div>
      </div>
    </header>
  );
}; 