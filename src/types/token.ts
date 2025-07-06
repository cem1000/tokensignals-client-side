export interface Token {
  symbol: string;
  totalVolumeUSD: number;
  totalSwaps: number;
  totalInflowUSD: number;
  totalOutflowUSD: number;
  lastUpdated?: string;
}

export interface TokenPair {
  centralToken: string;
  otherToken: string;
  totalVolumeUSD: number;
  totalSwaps: number;
  centralTokenInflowUSD: number;
  centralTokenOutflowUSD: number;
  otherTokenInflowUSD: number;
  otherTokenOutflowUSD: number;
} 