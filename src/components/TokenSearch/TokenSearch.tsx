import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../UI/Button';

interface TokenSearchProps {
  onTokenSelect: (token: string) => void;
}

export const TokenSearch = ({ onTokenSelect }: TokenSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onTokenSelect(searchTerm.trim().toUpperCase());
      setSearchTerm('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tokens..."
          className="w-64 pl-8 pr-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
        />
      </div>
      <Button type="submit" size="sm" className="px-3 py-1.5 text-sm">
        Search
      </Button>
    </form>
  );
}; 