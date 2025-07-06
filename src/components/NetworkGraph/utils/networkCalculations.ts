import type { NetworkNode, NetworkLink } from '../../../types';
import type { LinkMode } from '../types/networkGraph';

export const filterNetworkData = (
  data: { nodes: NetworkNode[]; links: NetworkLink[] },
  centralToken: string
) => {
  const { nodes, links } = data;
  
  // Always show all links, but mark which ones are dominant
  const filteredLinks = links;
  const nodeIds = new Set([
    centralToken,
    ...filteredLinks.map(l => typeof l.source === 'string' ? l.source : l.source.id),
    ...filteredLinks.map(l => typeof l.target === 'string' ? l.target : l.target.id)
  ]);
  
  const filteredNodes = nodes.filter(node => nodeIds.has(node.id));
  
  return { filteredNodes, filteredLinks };
};

export const calculateLinkRatios = (link: NetworkLink, mode: LinkMode) => {
  const inflow = link.centralInflow ?? 0;
  const outflow = link.centralOutflow ?? 0;
  
  if (mode === 'inflow') {
    return outflow > 0 ? inflow / outflow : 0;
  } else {
    return inflow > 0 ? outflow / inflow : 0;
  }
};

export const isLinkDominant = (link: NetworkLink, mode: LinkMode) => {
  const inflow = link.centralInflow ?? 0;
  const outflow = link.centralOutflow ?? 0;
  
  if (mode === 'inflow') {
    return outflow > 0 && inflow / outflow > 1;
  } else {
    return inflow > 0 && outflow / inflow > 1;
  }
};

export const getConnectedLinks = (nodeId: string, links: NetworkLink[]) => {
  return links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    return sourceId === nodeId || targetId === nodeId;
  });
};

export const getOtherTokenInPair = (nodeId: string, link: NetworkLink) => {
  const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
  const targetId = typeof link.target === 'string' ? link.target : link.target.id;
  return sourceId === nodeId ? targetId : sourceId;
}; 