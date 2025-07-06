import type { TokenPair } from './token';

export interface NetworkNode {
  id: string;
  type?: 'central' | 'connected';
  totalVolumeUSD?: number;
  totalSwaps?: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  isCentral?: boolean;
  vx?: number;
  vy?: number;
}

export interface NetworkLink {
  source: string | NetworkNode;
  target: string | NetworkNode;
  value?: number;
  pair?: TokenPair;
  inflow?: number;
  outflow?: number;
  centralInflow?: number;
  centralOutflow?: number;
  totalVolumeUSD?: number;
  totalSwaps?: number;
}

export interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
} 