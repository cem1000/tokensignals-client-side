# Uniswap Network Visualizer - Frontend Codebase Structure

## 🎯 High-Level Project Overview

### What We're Building
We're creating a **real-time interactive trading network visualizer** for Uniswap DEX data. Think of it as a "trading relationship map" that shows how different cryptocurrencies are connected through trading activity.

### Key Concept
- **Central Hub Model**: Select any token (like WETH) and see all tokens that trade with it
- **Interactive Network Graph**: Visual representation where tokens are nodes and trading relationships are connections
- **Real-time Data**: Live updates showing current trading volumes, swap counts, and market activity
- **Exploration Interface**: Click any connected token to make it the new center and explore its network

### Business Value
1. **Trading Insights**: Identify the most active trading pairs and liquidity hubs
2. **Market Analysis**: Understand token relationships and trading flow patterns
3. **Portfolio Strategy**: Find optimal trading paths and liquidity opportunities
4. **Risk Assessment**: Visualize token interconnectedness and market dependencies

### User Experience Flow
1. **Landing**: User sees WETH as default center with its trading partners around it
2. **Search**: User can search for any token (USDC, DAI, UNI, etc.)
3. **Explore**: Click any connected token to recenter the network around it
4. **Analyze**: View detailed statistics, trading volumes, and swap frequencies
5. **Monitor**: Real-time updates every 30 seconds show live market activity

### Technical Architecture
- **Frontend**: React/TypeScript SPA with D3.js network visualization
- **Backend**: Node.js API serving Uniswap trading data from SQLite database
- **Data Flow**: Backend fetches from Uniswap GraphQL → Processes → Serves to Frontend
- **Visualization**: Force-directed graph with interactive nodes and weighted edges

---

## 📁 Complete File Structure

```
uniswap-network-frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── index.ts
│   │   ├── NetworkGraph/
│   │   │   ├── NetworkGraph.tsx
│   │   │   ├── NetworkControls.tsx
│   │   │   ├── NetworkLegend.tsx
│   │   │   └── index.ts
│   │   ├── TokenSearch/
│   │   │   ├── TokenSearch.tsx
│   │   │   ├── TokenDropdown.tsx
│   │   │   ├── TokenSuggestions.tsx
│   │   │   └── index.ts
│   │   ├── TokenStats/
│   │   │   ├── TokenStats.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   ├── TopPairs.tsx
│   │   │   └── index.ts
│   │   ├── SwapList/
│   │   │   ├── SwapList.tsx
│   │   │   ├── SwapItem.tsx
│   │   │   └── index.ts
│   │   └── UI/
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorMessage.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useTokenData.ts
│   │   ├── useNetworkData.ts
│   │   ├── useSwapsData.ts
│   │   ├── useAutoRefresh.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── apiClient.ts
│   │   ├── endpoints.ts
│   │   └── mockData.ts
│   ├── types/
│   │   ├── token.ts
│   │   ├── swap.ts
│   │   ├── network.ts
│   │   ├── api.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── d3Helpers.ts
│   │   ├── formatters.ts
│   │   ├── transformers.ts
│   │   ├── constants.ts
│   │   └── index.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── components.css
│   │   └── animations.css
│   ├── contexts/
│   │   ├── AppContext.tsx
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── .env.local
├── .gitignore
└── README.md
```

---

## 🚀 Step-by-Step Build Guide for Cursor LLM

### Phase 1: Project Setup and Configuration

#### Step 1: Initialize Vite React TypeScript Project
```bash
npm create vite@latest uniswap-network-frontend -- --template react-ts
cd uniswap-network-frontend
npm install
```

#### Step 2: Install Required Dependencies
```bash
# Core dependencies
npm install @tanstack/react-query axios d3 lucide-react

# Development dependencies
npm install -D tailwindcss postcss autoprefixer @types/d3
npx tailwindcss init -p
```

#### Step 3: Configure Tailwind CSS
Create `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          950: '#030712',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
```

#### Step 4: Configure Vite for API Proxy
Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
```

#### Step 5: Setup Environment Variables
Create `.env.example`:
```
VITE_API_BASE_URL=http://localhost:3000
VITE_REFRESH_INTERVAL=30000
VITE_DEFAULT_TOKEN=WETH
```

---

### Phase 2: Type Definitions

#### Step 6: Create Type Definitions

**src/types/token.ts**:
```typescript
export interface Token {
  symbol: string;
  totalVolumeUSD: number;
  totalSwaps: number;
  totalInflowUSD: number;
  totalOutflowUSD: number;
}

export interface TokenPair {
  tokenA: string;
  tokenB: string;
  totalVolumeUSD: number;
  totalSwaps: number;
  tokenAInflowUSD: number;
  tokenAOutflowUSD: number;
  tokenBInflowUSD: number;
  tokenBOutflowUSD: number;
}
```

**src/types/network.ts**:
```typescript
export interface NetworkNode {
  id: string;
  type: 'central' | 'connected';
  totalVolumeUSD?: number;
  totalSwaps?: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface NetworkLink {
  source: string | NetworkNode;
  target: string | NetworkNode;
  value: number;
  pair: TokenPair;
}

export interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}
```

**src/types/swap.ts**:
```typescript
export interface Swap {
  id: string;
  timestamp: number;
  token0: string;
  token1: string;
  amount0: number;
  amount1: number;
  amountUSD: number;
  poolId: string;
}
```

**src/types/api.ts**:
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
}
```

---

### Phase 3: Utility Functions

#### Step 7: Create Utility Functions

**src/utils/formatters.ts**:
```typescript
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', { 
    notation: 'compact',
    maximumFractionDigits: 1 
  }).format(num);
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};
```

**src/utils/transformers.ts**:
```typescript
import { TokenPair, NetworkData, NetworkNode, NetworkLink } from '../types';

export const transformNetworkData = (
  tokenPairs: Record<string, TokenPair>, 
  centralToken: string
): NetworkData => {
  const nodes: NetworkNode[] = [];
  const links: NetworkLink[] = [];
  
  // Add central node
  nodes.push({ 
    id: centralToken, 
    type: 'central',
    totalVolumeUSD: Object.values(tokenPairs).reduce((sum, pair) => sum + pair.totalVolumeUSD, 0),
    totalSwaps: Object.values(tokenPairs).reduce((sum, pair) => sum + pair.totalSwaps, 0)
  });
  
  // Process each pair
  Object.entries(tokenPairs).forEach(([pairKey, pair]) => {
    const [tokenA, tokenB] = pairKey.split('-');
    
    // Add connected tokens as nodes
    if (tokenA !== centralToken && !nodes.find(n => n.id === tokenA)) {
      nodes.push({ 
        id: tokenA, 
        type: 'connected',
        totalVolumeUSD: pair.totalVolumeUSD,
        totalSwaps: pair.totalSwaps
      });
    }
    if (tokenB !== centralToken && !nodes.find(n => n.id === tokenB)) {
      nodes.push({ 
        id: tokenB, 
        type: 'connected',
        totalVolumeUSD: pair.totalVolumeUSD,
        totalSwaps: pair.totalSwaps
      });
    }
    
    // Add link
    links.push({
      source: tokenA === centralToken ? centralToken : tokenA,
      target: tokenB === centralToken ? centralToken : tokenB,
      value: pair.totalVolumeUSD,
      pair: pair
    });
  });
  
  return { nodes, links };
};
```

**src/utils/constants.ts**:
```typescript
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
  CENTRAL_NODE_RADIUS: 40,
  CONNECTED_NODE_RADIUS: 25,
  MIN_LINK_WIDTH: 1,
  MAX_LINK_WIDTH: 8
} as const;
```

---

### Phase 4: API Services

#### Step 8: Create API Service Layer

**src/services/apiClient.ts**:
```typescript
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, ApiError } from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'An error occurred',
          status: error.response?.status
        };
        return Promise.reject(apiError);
      }
    );
  }

  async get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data;
  }
}

export const apiClient = new ApiClient();
```

**src/services/api.ts**:
```typescript
import { apiClient } from './apiClient';
import { Token, TokenPair, Swap } from '../types';
import { API_ENDPOINTS } from '../utils/constants';

export const tokenApi = {
  getTopTokens: async (limit: number = 50) => {
    return apiClient.get<Token[]>(`${API_ENDPOINTS.TOKENS_TOP}?limit=${limit}`);
  },

  getToken: async (symbol: string) => {
    return apiClient.get<Token>(`/api/tokens/${symbol}`);
  },

  getTokenPairs: async (symbol: string) => {
    return apiClient.get<Record<string, TokenPair>>(`${API_ENDPOINTS.TOKEN_PAIRS}/${symbol}`);
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
```

---

### Phase 5: Custom Hooks

#### Step 9: Create React Query Hooks

**src/hooks/useTokenData.ts**:
```typescript
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { tokenApi } from '../services/api';
import { Token, TokenPair, ApiError } from '../types';

export const useTopTokens = (limit: number = 50): UseQueryResult<Token[], ApiError> => {
  return useQuery({
    queryKey: ['tokens', 'top', limit],
    queryFn: async () => {
      const response = await tokenApi.getTopTokens(limit);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // 30 seconds
  });
};

export const useToken = (symbol: string): UseQueryResult<Token, ApiError> => {
  return useQuery({
    queryKey: ['token', symbol],
    queryFn: async () => {
      const response = await tokenApi.getToken(symbol);
      return response.data;
    },
    enabled: !!symbol,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useTokenPairs = (symbol: string): UseQueryResult<Record<string, TokenPair>, ApiError> => {
  return useQuery({
    queryKey: ['tokenPairs', symbol],
    queryFn: async () => {
      const response = await tokenApi.getTokenPairs(symbol);
      return response.data;
    },
    enabled: !!symbol,
    refetchInterval: 30000, // 30 seconds
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};
```

**src/hooks/useNetworkData.ts**:
```typescript
import { useMemo } from 'react';
import { useTokenPairs } from './useTokenData';
import { transformNetworkData } from '../utils/transformers';
import { NetworkData } from '../types';

export const useNetworkData = (centralToken: string) => {
  const { data: tokenPairs, isLoading, error, refetch } = useTokenPairs(centralToken);

  const networkData: NetworkData | undefined = useMemo(() => {
    if (!tokenPairs) return undefined;
    return transformNetworkData(tokenPairs, centralToken);
  }, [tokenPairs, centralToken]);

  return {
    networkData,
    tokenPairs,
    isLoading,
    error,
    refetch
  };
};
```

**src/hooks/useAutoRefresh.ts**:
```typescript
import { useEffect, useRef } from 'react';

export const useAutoRefresh = (
  callback: () => void,
  interval: number = 30000,
  enabled: boolean = true
) => {
  const callbackRef = useRef(callback);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      callbackRef.current();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval, enabled]);

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const start = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      callbackRef.current();
    }, interval);
  };

  return { stop, start };
};
```

---

### Phase 6: UI Components

#### Step 10: Create Reusable UI Components

**src/components/UI/LoadingSpinner.tsx**:
```typescript
import React from 'react';
import { Activity } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-6 w-6'
  };

  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Activity className={`${iconSizes[size]} text-blue-500`} />
        </div>
      </div>
    </div>
  );
};
```

**src/components/UI/ErrorMessage.tsx**:
```typescript
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  title?: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  title = 'Error',
  className = '' 
}) => {
  return (
    <div className={`bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-center gap-3 ${className}`}>
      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
      <div>
        <p className="text-red-400 font-medium">{title}</p>
        <p className="text-red-300 text-sm">{message}</p>
      </div>
    </div>
  );
};
```

**src/components/UI/Card.tsx**:
```typescript
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '',
  padding = 'md'
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`bg-gray-900 rounded-xl border border-gray-700 ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};
```

---

### Phase 7: Feature Components

#### Step 11: Create TokenSearch Component

**src/components/TokenSearch/TokenSearch.tsx**:
```typescript
import React, { useState, useRef, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { TokenDropdown } from './TokenDropdown';
import { POPULAR_TOKENS } from '../../utils/constants';

interface TokenSearchProps {
  onTokenSelect: (token: string) => void;
  selectedToken: string;
  isLoading: boolean;
  className?: string;
}

export const TokenSearch: React.FC<TokenSearchProps> = ({
  onTokenSelect,
  selectedToken,
  isLoading,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredTokens = POPULAR_TOKENS.filter(token =>
    token.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (searchTerm.trim()) {
      onTokenSelect(searchTerm.trim().toUpperCase());
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleTokenSelect = (token: string) => {
    onTokenSelect(token);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search tokens (e.g., WETH, USDC)"
          className="w-full pl-10 pr-12 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          disabled={isLoading}
        />
        {isLoading && (
          <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
        )}
      </div>

      <TokenDropdown
        isOpen={isOpen}
        tokens={filteredTokens}
        selectedToken={selectedToken}
        onTokenSelect={handleTokenSelect}
        searchTerm={searchTerm}
      />
    </div>
  );
};
```

#### Step 12: Create NetworkGraph Component with D3.js

**src/utils/d3Helpers.ts**:
```typescript
import * as d3 from 'd3';
import { NetworkData, NetworkNode, NetworkLink } from '../types';
import { NETWORK_CONFIG } from './constants';

export class NetworkGraphRenderer {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private container: d3.Selection<SVGGElement, unknown, null, undefined>;
  private simulation: d3.Simulation<NetworkNode, undefined>;
  private width: number;
  private height: number;

  constructor(svgElement: SVGSVGElement, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.svg = d3.select(svgElement);
    this.svg.selectAll('*').remove();

    // Create main container
    this.container = this.svg.append('g');

    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        this.container.attr('transform', event.transform);
      });

    this.svg.call(zoom);

    // Initialize simulation
    this.simulation = d3.forceSimulation<NetworkNode>()
      .force('link', d3.forceLink<NetworkNode, NetworkLink>().id(d => d.id).distance(NETWORK_CONFIG.LINK_DISTANCE))
      .force('charge', d3.forceManyBody().strength(NETWORK_CONFIG.CHARGE_STRENGTH))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(NETWORK_CONFIG.COLLISION_RADIUS));
  }

  render(data: NetworkData, onNodeClick: (token: string) => void, selectedNode?: string): void {
    // Create scales
    const maxVolume = Math.max(...data.links.map(l => l.value));
    const linkWidthScale = d3.scaleLinear()
      .domain([0, maxVolume])
      .range([NETWORK_CONFIG.MIN_LINK_WIDTH, NETWORK_CONFIG.MAX_LINK_WIDTH]);

    // Add gradient definitions
    this.addGradients();

    // Render links
    this.renderLinks(data.links, linkWidthScale);

    // Render nodes
    this.renderNodes(data.nodes, onNodeClick, selectedNode);

    // Update simulation
    this.simulation
      .nodes(data.nodes)
      .on('tick', () => this.tick());

    const linkForce = this.simulation.force('link') as d3.ForceLink<NetworkNode, NetworkLink>;
    linkForce.links(data.links);

    this.simulation.alpha(1).restart();
  }

  private addGradients(): void {
    const defs = this.svg.select('defs').empty() ? this.svg.append('defs') : this.svg.select('defs');
    
    // Link gradient
    const linkGradient = defs.selectAll('#linkGradient').data([0]);
    const linkGradientEnter = linkGradient.enter().append('linearGradient')
      .attr('id', 'linkGradient')
      .attr('gradientUnits', 'userSpaceOnUse');

    linkGradientEnter.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3b82f6');

    linkGradientEnter.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#8b5cf6');

    // Central node gradient
    const centralGradient = defs.selectAll('#centralGradient').data([0]);
    const centralGradientEnter = centralGradient.enter().append('radialGradient')
      .attr('id', 'centralGradient');

    centralGradientEnter.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#60a5fa');

    centralGradientEnter.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6');
  }

  private renderLinks(links: NetworkLink[], widthScale: d3.ScaleLinear<number, number>): void {
    const linkSelection = this.container.selectAll('.link')
      .data(links, (d: any) => `${d.source.id || d.source}-${d.target.id || d.target}`);

    linkSelection.exit().remove();

    linkSelection.enter().append('line')
      .attr('class', 'link')
      .attr('stroke', 'url(#linkGradient)')
      .attr('stroke-opacity', 0.6)
      .merge(linkSelection as any)
      .attr('stroke-width', (d: NetworkLink) => widthScale(d.value));
  }

  private renderNodes(nodes: NetworkNode[], onNodeClick: (token: string) => void, selectedNode?: string): void {
    const nodeSelection = this.container.selectAll('.node')
      .data(nodes, (d: NetworkNode) => d.id);

    nodeSelection.exit().remove();

    const nodeEnter = nodeSelection.enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(this.createDragBehavior());

    // Add circles
    nodeEnter.append('circle');

    // Add labels
    nodeEnter.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .style('pointer-events', 'none');

    // Update all nodes
    const nodeUpdate = nodeEnter.merge(nodeSelection as any);