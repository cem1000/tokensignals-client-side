import type { NetworkNode, NetworkLink } from '../../../types';

export function getNodeRadiusByPairVolume(
  node: NetworkNode,
  links: NetworkLink[],
  centralToken: string,
  rScale: (v: number) => number
) {
  if (node.id === centralToken) {
    return rScale(node.totalVolumeUSD ?? 0);
  } else {
    // Find the link between centralToken and this node
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
} 