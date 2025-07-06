import type { NetworkNode, NetworkLink } from '../../../types';
import { getConnectedLinks, getOtherTokenInPair } from './networkCalculations';

export const formatTooltipContent = (node: NetworkNode, links: NetworkLink[]) => {
  const connectedLinks = getConnectedLinks(node.id, links);
  
  let tooltipContent = `
    <div style="margin-bottom: 8px;">
      <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${node.id}</div>
      <div>Total Volume: $${(node.totalVolumeUSD ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
      <div>Total Swaps: ${(node.totalSwaps ?? 0).toLocaleString()}</div>
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