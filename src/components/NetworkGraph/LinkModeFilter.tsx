type LinkMode = 'all' | 'buy' | 'sell';

export const LinkModeFilter = ({ value, onChange }: { value: LinkMode; onChange: (v: LinkMode) => void }) => (
  <div className="flex justify-center items-center py-2 space-x-2">
    <button
      className={`px-3 py-1 rounded ${value === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
      onClick={() => onChange('all')}
    >
      All
    </button>
    <button
      className={`px-3 py-1 rounded ${value === 'buy' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
      onClick={() => onChange('buy')}
    >
      Buys
    </button>
    <button
      className={`px-3 py-1 rounded ${value === 'sell' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
      onClick={() => onChange('sell')}
    >
      Sells
    </button>
  </div>
); 