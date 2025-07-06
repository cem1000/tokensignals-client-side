export interface Swap {
  id: string;
  timestamp: number;
  token0: string;
  token1: string;
  amount0: number;
  amount1: number;
  amountUSD: number;
  pool: string;
  createdAt?: string;
} 