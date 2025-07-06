import * as d3 from 'd3';
import type { NetworkLink } from '../../../types';
import type { LinkMode } from '../types/networkGraph';
import { NETWORK_CONFIG } from '../../../utils/constants';

export const createLinkStrokeScale = (links: NetworkLink[], mode: LinkMode) => {
  const minStroke = 1.5;
  const maxStroke = 8;
  
  const ratioExtent = d3.extent(links, d => {
    const inflow = d.centralInflow ?? 0;
    const outflow = d.centralOutflow ?? 0;
    
    if (mode === 'inflow') {
      return outflow > 0 ? inflow / outflow : 0;
    } else {
      return inflow > 0 ? outflow / inflow : 0;
    }
  });
  
  return d3.scaleLinear()
    .domain(ratioExtent as [number, number])
    .range([minStroke, maxStroke])
    .clamp(true);
};

export const getLinkColor = (link: NetworkLink, mode: LinkMode) => {
  const inflow = link.centralInflow ?? 0;
  const outflow = link.centralOutflow ?? 0;
  
  if (mode === 'inflow') {
    return outflow > 0 && inflow / outflow > 1 ? '#10b981' : '#666';
  } else {
    return inflow > 0 && outflow / inflow > 1 ? '#ef4444' : '#666';
  }
};

export const getLinkOpacity = (link: NetworkLink, mode: LinkMode) => {
  const inflow = link.centralInflow ?? 0;
  const outflow = link.centralOutflow ?? 0;
  
  if (mode === 'inflow') {
    return outflow > 0 && inflow / outflow > 1 ? 0.8 : 0.3;
  } else {
    return inflow > 0 && outflow / inflow > 1 ? 0.8 : 0.3;
  }
};

export const getNodeRadius = (node: any) => {
  if (node.isCentral) {
    return NETWORK_CONFIG.CENTRAL_NODE_RADIUS;
  }
  const volume = node.totalVolumeUSD ?? 0;
  return Math.max(
    NETWORK_CONFIG.MIN_NODE_RADIUS,
    Math.min(NETWORK_CONFIG.MAX_NODE_RADIUS, volume / 1000000 * 2)
  );
};

export const getNodeFill = (node: any) => {
  return node.isCentral ? '#3b82f6' : '#6b7280';
}; 