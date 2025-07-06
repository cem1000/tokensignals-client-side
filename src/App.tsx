import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Header } from './components/Layout/Header';
import { NetworkGraph } from './components/NetworkGraph/NetworkGraph';
import { TokenStats } from './components/TokenStats/TokenStats';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [centralToken, setCentralToken] = useState('WETH');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen bg-gray-950">
        <Header onTokenSelect={setCentralToken} />
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
          <TokenStats tokenSymbol={centralToken} />
        </div>
        <main className="flex-1">
          <NetworkGraph centralToken={centralToken} onNodeClick={setCentralToken} />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App; 