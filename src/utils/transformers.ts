import type { TokenPair, NetworkData, NetworkNode, NetworkLink } from '../types';

export const transformNetworkData = (
  tokenPairs: Record<string, TokenPair>
): NetworkData => {
  const nodes: NetworkNode[] = [];
  const links: NetworkLink[] = [];
  const nodeMap: Record<string, NetworkNode> = {};
  
  // Get the central token from the first pair
  const firstPair = Object.values(tokenPairs)[0];
  if (!firstPair) return { nodes, links };
  
  const centralToken = firstPair.centralToken;
  
  // Add central node
  const centralNode: NetworkNode = {
    id: centralToken,
    type: 'central',
    isCentral: true,
    totalVolumeUSD: Object.values(tokenPairs).reduce((sum, pair) => sum + pair.totalVolumeUSD, 0),
    totalSwaps: Object.values(tokenPairs).reduce((sum, pair) => sum + pair.totalSwaps, 0)
  };
  nodes.push(centralNode);
  nodeMap[centralToken] = centralNode;
  
  // Process each pair - API now provides centralToken and otherToken
  Object.entries(tokenPairs).forEach(([_pairKey, pair]) => {
    const { centralToken, otherToken, totalVolumeUSD, totalSwaps, centralTokenInflowUSD, centralTokenOutflowUSD, otherTokenInflowUSD, otherTokenOutflowUSD } = pair;
    
    // Add other token node if not already added
    if (!nodeMap[otherToken]) {
      const otherNode: NetworkNode = {
        id: otherToken,
        type: 'connected',
        isCentral: false,
        totalVolumeUSD: totalVolumeUSD,
        totalSwaps: totalSwaps
      };
      nodes.push(otherNode);
      nodeMap[otherToken] = otherNode;
    }
    
    // Create link from other token to central token
    links.push({
      source: otherToken,
      target: centralToken,
      inflow: otherTokenInflowUSD ?? 0,
      outflow: otherTokenOutflowUSD ?? 0,
      centralInflow: centralTokenInflowUSD ?? 0,
      centralOutflow: centralTokenOutflowUSD ?? 0,
      totalVolumeUSD: totalVolumeUSD,
      totalSwaps: totalSwaps
    });
  });
  
  return { nodes, links };
}; 