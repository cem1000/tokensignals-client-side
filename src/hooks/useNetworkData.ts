import { useQuery } from '@tanstack/react-query';
import { tokenApi } from '../services/api';
import { transformNetworkData } from '../utils/transformers';

export const useNetworkData = (centralToken: string, limit: number = 50) => {
  return useQuery({
    queryKey: ['networkData', centralToken, limit],
    queryFn: async () => {
      const response = await tokenApi.getTokenPairs(centralToken, limit);
      return transformNetworkData(response.data);
    },
    enabled: !!centralToken,
    staleTime: 30000,
    refetchInterval: 30000,
  });
}; 