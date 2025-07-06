import { useQuery } from '@tanstack/react-query';
import { tokenApi } from '../services/api';


export const useTokenData = (symbol: string) => {
  return useQuery({
    queryKey: ['token', symbol],
    queryFn: () => tokenApi.getToken(symbol),
    enabled: !!symbol,
    staleTime: 30000,
    refetchInterval: 30000,
  });
};

export const useTopTokens = (limit: number = 50) => {
  return useQuery({
    queryKey: ['topTokens', limit],
    queryFn: () => tokenApi.getTopTokens(limit),
    staleTime: 30000,
    refetchInterval: 30000,
  });
}; 