import { useCallback } from 'react';
import * as d3 from 'd3';
import type { NetworkNode, NetworkLink } from '../../../types';

const getConnectedLinks = (nodeId: string, links: NetworkLink[]) => {
  return links.filter(link => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
    const targetId = typeof link.target === 'string' ? link.target : link.target.id;
    return sourceId === nodeId || targetId === nodeId;
  });
};

const getOtherTokenInPair = (nodeId: string, link: NetworkLink) => {
  const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
  const targetId = typeof link.target === 'string' ? link.target : link.target.id;
  return sourceId === nodeId ? targetId : sourceId;
};

const formatTooltipContent = (node: NetworkNode, links: NetworkLink[]) => {
  const connectedLinks = getConnectedLinks(node.id, links);
  
  let tooltipContent = `
    <div style="margin-bottom: 8px;">

    </div>
  `;

  if (connectedLinks.length > 0) {
    tooltipContent += '<div style="border-top: 1px solid #444; padding-top: 8px; margin-top: 8px;">';
    tooltipContent += '<div style="font-weight: bold; margin-bottom: 4px;">Connected Pairs:</div>';
    
    connectedLinks.forEach(link => {
      const otherToken = getOtherTokenInPair(node.id, link);
      
      const centralInflow = link.centralInflow ?? 0;
      const centralOutflow = link.centralOutflow ?? 0;
      const totalVolume = link.totalVolumeUSD ?? 0;
      const totalSwaps = link.totalSwaps ?? 0;
      
      const outflowInflowRatio = centralOutflow > 0 && centralInflow > 0 ? (centralOutflow / centralInflow).toFixed(2) : 'N/A';
      const inflowOutflowRatio = centralInflow > 0 && centralOutflow > 0 ? (centralInflow / centralOutflow).toFixed(2) : 'N/A';
      
      tooltipContent += `
        <div style="margin-bottom: 6px; padding: 4px; background: rgba(255,255,255,0.1); border-radius: 3px;">
          <div style="font-weight: bold; color: #60a5fa;">${node.id} ↔ ${otherToken}</div>
          <div>Volume: $${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <div>Swaps: ${totalSwaps.toLocaleString()}</div>
          <div>Inflow: $${centralInflow.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <div>Outflow: $${centralOutflow.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
          <div>Outflow/Inflow: ${outflowInflowRatio}</div>
          <div>Inflow/Outflow: ${inflowOutflowRatio}</div>
        </div>
      `;
    });
    
    tooltipContent += '</div>';
  }

  return tooltipContent;
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
    links: NetworkLink[]
  ) => {
    console.log('Tooltip node:', node);
    console.log('Tooltip links:', links);
    let tooltip = d3.select('body').select<HTMLDivElement>('.network-tooltip');
    
    if (tooltip.empty()) {
      tooltip = createTooltip();
    }
    
    const tooltipContent = formatTooltipContent(node, links);
    
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