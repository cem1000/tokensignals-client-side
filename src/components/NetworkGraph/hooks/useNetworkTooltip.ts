import { useCallback } from 'react';
import * as d3 from 'd3';
import type { NetworkNode, NetworkLink } from '../../../types';

const getLinkBetween = (a: string, b: string, links: NetworkLink[]) => {
  return links.find(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    return (
      (sourceId === a && targetId === b) ||
      (sourceId === b && targetId === a)
    );
  });
};

const formatTooltipContent = (node: NetworkNode, links: NetworkLink[], centralToken: string) => {
  // If hovering central node, show aggregate
  if (node.id === centralToken) {
    let totalInflow = 0;
    let totalOutflow = 0;
    let totalVolume = 0;
    let totalSwaps = 0;
    links.forEach(link => {
      totalInflow += link.centralInflow ?? 0;
      totalOutflow += link.centralOutflow ?? 0;
      totalVolume += link.totalVolumeUSD ?? 0;
      totalSwaps += link.totalSwaps ?? 0;
    });
    const total = totalInflow + totalOutflow;
    const buyPct = total > 0 ? Math.round((totalInflow / total) * 100) : 0;
    const sellPct = total > 0 ? Math.round((totalOutflow / total) * 100) : 0;
    return `
      <div style="margin-bottom: 8px;"></div>
      <div style="border-top: 1px solid #444; padding-top: 8px; margin-top: 8px;">
        <div style="font-weight: bold; margin-bottom: 4px;">${centralToken} (Aggregate)</div>
        <div>Volume: $${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        <div>Swaps: ${totalSwaps.toLocaleString()}</div>
        <div>% Buys (inflow): <span style='color:#10b981;'>${buyPct}%</span></div>
        <div>% Sells (outflow): <span style='color:#ef4444;'>${sellPct}%</span></div>
      </div>
    `;
  }
  // If hovering a secondary node, show pair stats
  const link = getLinkBetween(node.id, centralToken, links);
  if (!link) return '';

  let inflow = 0;
  let outflow = 0;
  if (typeof link.source === 'object' && link.source.id === node.id) {
    // node is source
    inflow = link.outflow ?? 0;
    outflow = link.inflow ?? 0;
  } else if (typeof link.target === 'object' && link.target.id === node.id) {
    inflow = link.inflow ?? 0;
    outflow = link.outflow ?? 0;
  } else if (typeof link.source === 'string' && link.source === node.id) {
    inflow = link.outflow ?? 0;
    outflow = link.inflow ?? 0;
  } else {
    inflow = link.inflow ?? 0;
    outflow = link.outflow ?? 0;
  }
  const total = inflow + outflow;
  const buyPct = total > 0 ? Math.round((inflow / total) * 100) : 0;
  const sellPct = total > 0 ? Math.round((outflow / total) * 100) : 0;
  const totalVolume = link.totalVolumeUSD ?? 0;
  const totalSwaps = link.totalSwaps ?? 0;
  return `
    <div style="margin-bottom: 8px;"></div>
    <div style="border-top: 1px solid #444; padding-top: 8px; margin-top: 8px;">
      <div style="font-weight: bold; margin-bottom: 4px;">${node.id} ↔ ${centralToken}</div>
      <div>Volume: $${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
      <div>Swaps: ${totalSwaps.toLocaleString()}</div>
      <div>% Buys (of ${node.id}): <span style='color:#10b981;'>${buyPct}%</span></div>
      <div>% Sells (of ${node.id}): <span style='color:#ef4444;'>${sellPct}%</span></div>
    </div>
  `;
};

export const useNetworkTooltip = () => {
  const createTooltip = useCallback(() => {
    return d3.select('body').append('div')
      .attr('class', 'network-tooltip')
      .style('position', 'absolute')
      .style('background', 'rgba(0, 0, 0, 0.9)')
      .style('color', 'white')
      .style('padding', '12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('max-width', '300px')
      .style('white-space', 'nowrap')
      .style('opacity', 0);
  }, []);

  const showTooltip = useCallback((
    event: MouseEvent,
    node: NetworkNode,
    links: NetworkLink[],
    centralToken: string
  ) => {
    let tooltip = d3.select('body').select<HTMLDivElement>('.network-tooltip');
    if (tooltip.empty()) {
      tooltip = createTooltip();
    }
    const tooltipContent = formatTooltipContent(node, links, centralToken);
    tooltip.transition().duration(200).style('opacity', 1);
    tooltip.html(tooltipContent)
      .style('left', event.pageX + 10 + 'px')
      .style('top', event.pageY - 28 + 'px');
  }, [createTooltip]);

  const hideTooltip = useCallback(() => {
    d3.select('body').select('.network-tooltip')
      .transition()
      .duration(200)
      .style('opacity', 0);
  }, []);

  const destroyTooltip = useCallback(() => {
    d3.selectAll('.network-tooltip').remove();
  }, []);

  return {
    showTooltip,
    hideTooltip,
    destroyTooltip
  };
}; 