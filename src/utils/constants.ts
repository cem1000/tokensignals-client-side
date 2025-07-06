export const POPULAR_TOKENS = [
  'WETH', 'USDC', 'USDT', 'DAI', 'UNI', 'MATIC', 'LINK', 'AAVE'
];

export const API_ENDPOINTS = {
  HEALTH: '/api/health',
  TOKENS_TOP: '/api/tokens/top',
  TOKEN_PAIRS: '/api/token-pairs',
  SWAPS: '/api/swaps',
  STATS: '/api/stats'
} as const;

export const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#8b5cf6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  GRAY: {
    50: '#f9fafb',
    800: '#1f2937',
    900: '#111827',
    950: '#030712'
  }
} as const;

export const NETWORK_CONFIG = {
  LINK_DISTANCE: 150,
  CHARGE_STRENGTH: -1000,
  COLLISION_RADIUS: 50,
  CENTRAL_NODE_RADIUS: 60,
  CONNECTED_NODE_RADIUS: 35,
  MIN_NODE_RADIUS: 15,
  MAX_NODE_RADIUS: 50,
  MIN_LINK_WIDTH: 0.5,
  MAX_LINK_WIDTH: 4
} as const; 