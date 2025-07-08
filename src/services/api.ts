import { apiClient } from './apiClient';
import type { Token, TokenPair, Swap, NetworkData } from '../types';
import { API_ENDPOINTS } from '../utils/constants';

export const tokenApi = {
  getTopTokens: async (limit: number = 50) => {
    return apiClient.get<Token[]>(`${API_ENDPOINTS.TOKENS_TOP}?limit=${limit}`);
  },

  getToken: async (symbol: string) => {
    return apiClient.get<Token>(`/api/tokens/${symbol}`);
  },

  getTokenPairs: async (symbol: string, limit: number = 50) => {
    return apiClient.get<NetworkData>(`${API_ENDPOINTS.TOKEN_PAIRS}/${symbol}?limit=${limit}`);
  }
};

export const swapApi = {
  getPairSwaps: async (token0: string, token1: string, hours: number = 24) => {
    return apiClient.get<Swap[]>(`/api/pairs/${token0}/${token1}/swaps?hours=${hours}`);
  },

  getSwapsFromTimestamp: async (timestamp: number, limit: number = 100) => {
    return apiClient.get<Swap[]>(`/api/swaps/from/${timestamp}?limit=${limit}`);
  }
};

export const statsApi = {
  getStats: async () => {
    return apiClient.get<{ totalSwaps: number; topTokens: Token[] }>('/api/stats');
  },

  checkHealth: async () => {
    return apiClient.get<{ status: string }>('/api/health');
  }
}; 