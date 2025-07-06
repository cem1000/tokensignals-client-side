import { useQuery } from '@tanstack/react-query';
import { swapApi } from '../services/api';


export const usePairSwaps = (token0: string, token1: string, hours: number = 24) => {
  return useQuery({
    queryKey: ['pairSwaps', token0, token1, hours],
    queryFn: () => swapApi.getPairSwaps(token0, token1, hours),
    enabled: !!token0 && !!token1,
    staleTime: 30000,
    refetchInterval: 30000,
  });
};

export const useSwapsFromTimestamp = (timestamp: number, limit: number = 100) => {
  return useQuery({
    queryKey: ['swapsFromTimestamp', timestamp, limit],
    queryFn: () => swapApi.getSwapsFromTimestamp(timestamp, limit),
    enabled: !!timestamp,
    staleTime: 30000,
    refetchInterval: 30000,
  });
}; 