import type { NetworkNode, NetworkLink } from '../../../types';
import type { LinkMode } from '../types/networkGraph';

export const VOLUME_BUCKETS = [0, 100, 1000, 10000, 50000, 100000, 500000, 1000000, 10000000];

export interface BuySellStats {
  buyPct: number;
  sellPct: number;
}

export interface LinkRatio {
  ratio: number;
  deviation: number;
  intensity: number;
  inflowShare: number;
}

export interface FilteredNetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export const getMinVolumeFromIndex = (index: number): number => {
  return VOLUME_BUCKETS[Math.max(0, Math.min(index, VOLUME_BUCKETS.length - 1))];
};

export const getVolumeIndexFromValue = (value: number): number => {
  return VOLUME_BUCKETS.findIndex(bucket => bucket >= value);
};

export const filterNetworkDataByVolume = (
  rawData: { nodes: NetworkNode[]; links: NetworkLink[] },
  minVolume: number
): FilteredNetworkData => {
  const { nodes, links } = rawData;
  
  const filteredNodes = nodes.filter((node: NetworkNode) => 
    (node.totalVolumeUSD ?? 0) >= minVolume
  );
  
  const nodeIds = new Set(filteredNodes.map((node: NetworkNode) => node.id));
  
  const filteredLinks = links.filter((link: NetworkLink) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    return nodeIds.has(sourceId) && nodeIds.has(targetId);
  });

  return { nodes: filteredNodes, links: filteredLinks };
};

export const calculateLinkRatio = (link: NetworkLink, window: '24h' | '1h' = '24h'): LinkRatio => {
  if (!link) {
    return { ratio: 1, deviation: 0, intensity: 0, inflowShare: 0.5 };
  }
  
  const inflow = link.centralInflow ?? 0;
  const outflow = link.centralOutflow ?? 0;
  const total = inflow + outflow;
  
  if (total <= 0) {
    return { ratio: 1, deviation: 0, intensity: 0, inflowShare: 0.5 };
  }
  
  // Scale intensity based on timeframe
  const timeScale = window === '1h' ? 24 : 1; // 1h data needs 24x scaling to match 24h intensity
  
  let ratio;
  if (inflow > outflow) {
    ratio = outflow > 0 ? inflow / outflow : 5;
  } else {
    ratio = inflow > 0 ? outflow / inflow : 5;
  }
  
  const deviation = Math.abs(ratio - 1);
  const amplifiedDeviation = Math.pow(deviation, 0.3);
  const intensity = Math.min(amplifiedDeviation * timeScale, 1);
  const inflowShare = inflow / total;
  
  return { ratio, deviation, intensity, inflowShare };
};

export const getLinkColor = (link: NetworkLink, _mode: LinkMode, window: '24h' | '1h' = '24h'): string => {
  if (!link) return '#808080'; // Default gray for null links
  
  const { intensity, inflowShare } = calculateLinkRatio(link, window);
  
  if (inflowShare > 0.5) {
    // Stronger green: more dramatic range from light to dark green
    const greenValue = Math.round(50 + (intensity * 205)); // 50-255 range instead of 100-255
    return `#00${greenValue.toString(16).padStart(2, '0')}00`;
  } else {
    // Stronger red: more dramatic range from light to dark red
    const redValue = Math.round(50 + (intensity * 205)); // 50-255 range instead of 100-255
    return `#${redValue.toString(16).padStart(2, '0')}0000`;
  }
};

export const getLinkStrokeWidth = (link: NetworkLink, window: '24h' | '1h' = '24h'): number => {
  if (!link) return 1.5;
  
  const minStroke = 1.5;
  const maxStroke = 6;
  const { intensity } = calculateLinkRatio(link, window);
  return minStroke + (maxStroke - minStroke) * intensity;
};

export const getLinkOpacity = (link: NetworkLink, mode: LinkMode): number => {
  const { inflowShare } = calculateLinkRatio(link);
  
  if (mode === 'inflow') {
    return inflowShare > 0.5 ? 0.8 : 0.3;
  } else {
    return inflowShare <= 0.5 ? 0.8 : 0.3;
  }
};
export const getArrowSpeed = (link: NetworkLink, window: '24h' | '1h' = '24h'): number => {
  if (!link) return 1.5;
  
  const { intensity } = calculateLinkRatio(link, window);
  const totalVolume = (link.centralInflow ?? 0) + (link.centralOutflow ?? 0);
  
  // Scale volume factor based on timeframe
  const volumeThreshold = window === '1h' ? 12500 : 300000; // Much lower threshold for 1h data
  const volumeFactor = Math.min(totalVolume / volumeThreshold, 10);
  
  return Math.max(1.5, intensity * volumeFactor * 3);
};

export const getNodeRadiusByPairVolume = (
  node: NetworkNode,
  links: NetworkLink[],
  centralToken: string,
  rScale: (v: number) => number
) => {
  if (node.id === centralToken) {
    return rScale(node.totalVolumeUSD ?? 0);
  } else {
    const pairLink = links.find(l => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      return (
        (sourceId === centralToken && targetId === node.id) ||
        (sourceId === node.id && targetId === centralToken)
      );
    });
    return rScale(pairLink?.totalVolumeUSD ?? 0);
  }
};

export const filterLinksByMode = (links: any[], mode: 'all' | 'buy' | 'sell') => {
  if (mode === 'all') return links;
  return links.filter((link: any) => {
    const { inflowShare } = calculateLinkRatio(link);
    return mode === 'buy' ? inflowShare > 0.5 : inflowShare <= 0.5;
  });
};

export const filterNodesByLinks = (nodes: any[], links: any[]) => {
  const nodeIds = new Set();
  links.forEach((link: any) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    nodeIds.add(sourceId);
    nodeIds.add(targetId);
  });
  return nodes.filter((node: any) => nodeIds.has(node.id));
};

export function getCentralTokenBuySellStats(filteredLinks: any[]): BuySellStats {
  let totalInflow = 0;
  let totalOutflow = 0;
  let totalVolume = 0;
  filteredLinks.forEach((link: any) => {
    totalInflow += link.centralInflow ?? 0;
    totalOutflow += link.centralOutflow ?? 0;
    totalVolume += (link.centralInflow ?? 0) + (link.centralOutflow ?? 0);
  });
  const buyPct = totalVolume ? (totalInflow / totalVolume) * 100 : 0;
  const sellPct = totalVolume ? (totalOutflow / totalVolume) * 100 : 0;
  return { buyPct, sellPct };
} 