import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Header } from './components/Layout/Header';
import { NetworkGraph } from './components/NetworkGraph/NetworkGraph';
import { TokenStats } from './components/TokenStats/TokenStats';
import { Breadcrumb } from './components/UI';
import { useBreadcrumbNavigation } from './hooks';

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
  const { 
    navigationPath, 
    currentToken, 
    navigateToToken, 
    navigateToBreadcrumb 
  } = useBreadcrumbNavigation(centralToken);

  const handleTokenSelect = (token: string) => {
    navigateToToken(token);
    setCentralToken(token);
  };

  const handleBreadcrumbClick = (token: string) => {
    navigateToBreadcrumb(token);
    setCentralToken(token);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen bg-gray-950">
        <Header onTokenSelect={handleTokenSelect} />
        <main className="flex-1">
          <NetworkGraph centralToken={centralToken} onNodeClick={handleTokenSelect} navigationPath={navigationPath} currentToken={currentToken} onTokenClick={handleBreadcrumbClick} />
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App; 