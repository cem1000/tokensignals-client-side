import { useState, useCallback } from 'react';

export const useBreadcrumbNavigation = (initialToken: string) => {
  const [navigationPath, setNavigationPath] = useState<string[]>([]);
  const [currentToken, setCurrentToken] = useState(initialToken);

  const navigateToToken = useCallback((token: string) => {
    if (token === currentToken) return;
    
    setNavigationPath(prev => {
      const newPath = [...prev, currentToken];
      return newPath.slice(-10);
    });
    setCurrentToken(token);
  }, [currentToken]);

  const navigateToBreadcrumb = useCallback((token: string) => {
    setCurrentToken(token);
    
    const tokenIndex = navigationPath.indexOf(token);
    if (tokenIndex !== -1) {
      setNavigationPath(prev => prev.slice(0, tokenIndex));
    } else {
      setNavigationPath([]);
    }
  }, [navigationPath]);

  const clearHistory = useCallback(() => {
    setNavigationPath([]);
  }, []);

  return {
    navigationPath,
    currentToken,
    navigateToToken,
    navigateToBreadcrumb,
    clearHistory
  };
}; 