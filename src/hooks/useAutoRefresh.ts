import { useEffect, useRef } from 'react';

export const useAutoRefresh = (callback: () => void, interval: number = 30000) => {
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    intervalRef.current = setInterval(callback, interval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [callback, interval]);

  const stopRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const startRefresh = () => {
    stopRefresh();
    intervalRef.current = setInterval(callback, interval);
  };

  return { stopRefresh, startRefresh };
}; 