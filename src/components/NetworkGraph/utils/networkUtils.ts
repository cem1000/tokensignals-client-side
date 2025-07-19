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

export const calculateLinkRatio = (link: NetworkLink): LinkRatio => {
  if (!link) {
    return { ratio: 1, deviation: 0, intensity: 0, inflowShare: 0.5 };
  }
  
  const inflow = link.centralInflow ?? 0;
  const outflow = link.centralOutflow ?? 0;
  const total = inflow + outflow;
  
  if (total <= 0) {
    return { ratio: 1, deviation: 0, intensity: 0, inflowShare: 0.5 };
  }
  
  const inflowShare = inflow / total;
  const outflowShare = outflow / total;
  
  // Intensity based on dominant flow share (0.5 to 1.0)
  let intensity: number;
  if (outflowShare > 0.5) {
    // Red (central buying) - intensity based on outflow share
    intensity = outflowShare;
  } else {
    // Green (central selling) - intensity based on inflow share
    intensity = inflowShare;
  }
  
  // Use the same intensity for ratio (thickness)
  const ratio = intensity;
  const deviation = Math.abs(ratio - 0.5);
  
  // Ensure intensity is properly scaled (0.5 to 1.0)
  intensity = Math.max(0.5, Math.min(1.0, intensity));
  
  return { ratio, deviation, intensity, inflowShare };
};

export const getLinkColor = (link: NetworkLink, _mode: LinkMode): string => {
  if (!link) return '#808080'; // Default gray for null links
  
  const { intensity } = calculateLinkRatio(link);
  const inflow = link.centralInflow ?? 0;
  const outflow = link.centralOutflow ?? 0;
  const total = inflow + outflow;
  
  if (total <= 0) return '#808080';
  
  const outflowShare = outflow / total;
  
  if (outflowShare > 0.5) {
    // Red: Central node is BUYING from secondary node (outflow > inflow)
    const redValue = Math.round(100 + (intensity * 155)); // Increased minimum from 50 to 100
    return `#${redValue.toString(16).padStart(2, '0')}0000`;
  } else {
    // Green: Central node is SELLING to secondary node (inflow > outflow)
    const greenValue = Math.round(50 + (intensity * 205));
    return `#00${greenValue.toString(16).padStart(2, '0')}00`;
  }
};

export const getLinkStrokeWidth = (link: NetworkLink): number => {
  if (!link) return 2;
  
  const minStroke = 2;
  const maxStroke = 6;
  const { intensity } = calculateLinkRatio(link);
  
  // Map buy/sell share (0.5-1.0) to stroke width (2-6)
  const strokeWidth = minStroke + (maxStroke - minStroke) * ((intensity - 0.5) / 0.5);
  return strokeWidth;
};

export const getLinkOpacity = (link: NetworkLink, mode: LinkMode): number => {
  const { inflowShare } = calculateLinkRatio(link);
  
  if (mode === 'inflow') {
    return inflowShare > 0.5 ? 0.8 : 0.3;
  } else {
    return inflowShare <= 0.5 ? 0.8 : 0.3;
  }
};
export const getArrowSpeed = (link: NetworkLink): number => {
  if (!link) return 3;
  
  const { intensity } = calculateLinkRatio(link);
  const totalVolume = (link.centralInflow ?? 0) + (link.centralOutflow ?? 0);
  
  // Single volume threshold since we only use one API
  const volumeThreshold = 100000;
  const volumeFactor = Math.min(totalVolume / volumeThreshold, 15);
  
  const baseSpeed = 3;
  const intensitySpeed = intensity * 40; // Increased from 20 to 40 for more dramatic difference
  const volumeSpeed = volumeFactor * 3;
  
  return Math.max(baseSpeed, intensitySpeed + volumeSpeed);
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
    const inflow = link.centralInflow ?? 0;
    const outflow = link.centralOutflow ?? 0;
    const total = inflow + outflow;
    
    if (total <= 0) return false;
    
    const outflowShare = outflow / total;
    
    // buy = central selling (green), sell = central buying (red)
    return mode === 'buy' ? outflowShare <= 0.5 : outflowShare > 0.5;
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