import { useCallback } from 'react';
import * as d3 from 'd3';
import type { NetworkNode } from '../../../types';

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
    node: NetworkNode
  ) => {
    let tooltip = d3.select('body').select<HTMLDivElement>('.network-tooltip');
    
    if (tooltip.empty()) {
      tooltip = createTooltip();
    }
    
    // For now, we'll create a simple tooltip without links data
    const tooltipContent = `
      <div style="margin-bottom: 8px;">
        <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${node.id}</div>
        <div>Total Volume: $${(node.totalVolumeUSD ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        <div>Total Swaps: ${(node.totalSwaps ?? 0).toLocaleString()}</div>
      </div>
    `;
    
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