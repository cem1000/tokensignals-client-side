import type { NetworkNode, NetworkLink } from '../../../types';
import type { LinkMode } from '../types/networkGraph';

export const VOLUME_BUCKETS = [0, 100, 1000, 10000, 50000, 100000, 500000, 1000000, 10000000];

export interface FilterOptions {
  minVolume: number;
  limit: number;
}

export interface FilteredNetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

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

export const getMinVolumeFromIndex = (index: number): number => {
  return VOLUME_BUCKETS[Math.max(0, Math.min(index, VOLUME_BUCKETS.length - 1))];
};

export const getVolumeIndexFromValue = (value: number): number => {
  return VOLUME_BUCKETS.findIndex(bucket => bucket >= value);
};

export const getLinkColor = (link: NetworkLink, mode: LinkMode): string => {
  const inflow = link.centralInflow ?? 0;
  const outflow = link.centralOutflow ?? 0;
  
  if (mode === 'inflow') {
    return outflow > 0 && inflow / outflow > 1 ? '#10b981' : '#666';
  } else {
    return inflow > 0 && outflow / inflow > 1 ? '#ef4444' : '#666';
  }
};

export const getLinkStrokeWidth = (link: NetworkLink, mode: LinkMode): number => {
  const minStroke = 1.5;
  const maxStroke = 8;
  const inflow = link.centralInflow ?? 0;
  const outflow = link.centralOutflow ?? 0;
  
  let ratio = 1;
  if (mode === 'inflow') {
    ratio = outflow > 0 ? inflow / outflow : 0;
  } else {
    ratio = inflow > 0 ? outflow / inflow : 0;
  }
  
  if ((mode === 'inflow' && outflow > 0 && inflow / outflow > 1) ||
      (mode === 'outflow' && inflow > 0 && outflow / inflow > 1)) {
    return Math.max(minStroke, Math.min(maxStroke, ratio * 2));
  }
  return minStroke;
};

export const getLinkOpacity = (link: NetworkLink, mode: LinkMode): number => {
  const inflow = link.centralInflow ?? 0;
  const outflow = link.centralOutflow ?? 0;
  
  if (mode === 'inflow') {
    return outflow > 0 && inflow / outflow > 1 ? 0.8 : 0.3;
  } else {
    return inflow > 0 && outflow / inflow > 1 ? 0.8 : 0.3;
  }
}; 