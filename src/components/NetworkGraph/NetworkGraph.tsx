import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useNetworkData } from '../../hooks/useNetworkData';
import { LoadingSpinner, ErrorMessage } from '../UI';
import { NetworkControls } from './NetworkControls';
import { NetworkGraphContainer } from './NetworkGraphContainer';
import type { NetworkGraphProps, LinkMode } from './types/networkGraph';
import { transformNetworkData } from '../../utils/transformers';

const WIDTH = 1600;
const HEIGHT = 1000;

function fetchNetworkData(token: string, window: '24h' | '1h') {
  const endpoint = window === '1h'
    ? `/api/token-pairs/${token}?window=1h`
    : `/api/token-pairs/${token}`;
  return fetch(endpoint).then(res => res.json());
}

export const NetworkGraph = ({ centralToken, onNodeClick }: NetworkGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [linkMode, setLinkMode] = useState<LinkMode>('inflow');
  const [window, setWindow] = useState<'24h' | '1h'>('24h');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchNetworkData(centralToken, window)
      .then(res => {
        console.log('NetworkGraph API response:', res);
        // Transform the pair map into nodes/links
        const networkData = transformNetworkData(res.data, centralToken);
        setData(networkData);
        setIsLoading(false);
      })
      .catch(e => {
        setError(e.message || 'Error fetching data');
        setIsLoading(false);
      });
  }, [centralToken, window]);

  useEffect(() => {
    if (!data) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { nodes, links } = data;
    if (!nodes || !links) return;

    // Node size scale
    const minR = 14;
    const maxR = 36;
    const maxVolume = d3.max(nodes as any[], (d: any) => d.totalVolumeUSD ?? 0) || 1;
    const rScale = d3.scaleSqrt()
      .domain([0, maxVolume])
      .range([minR, maxR]);

    // D3 simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(260).strength(0.8))
      .force('charge', d3.forceManyBody().strength(-1200))
      .force('center', d3.forceCenter(WIDTH / 2, HEIGHT / 2))
      .force('collision', d3.forceCollide().radius((d: any) => rScale(d.totalVolumeUSD ?? 0) + 8))
      .on('tick', ticked);

    // Draw links
    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line');

    // Draw nodes
    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', (d: any) => rScale(d.totalVolumeUSD ?? 0))
      .attr('fill', (d: any) => d.id === centralToken ? '#3b82f6' : '#6b7280')
      .call((d3.drag() as any)
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event: any, d: any) => {
        if (onNodeClick && d.id !== centralToken) {
          onNodeClick(d.id);
        }
      })
      .on('mouseover', function(event, d: any) {
        let tooltip = d3.select('body').select('.network-tooltip') as any;
        if (tooltip.empty()) {
          tooltip = d3.select('body').append('div') as any;
          tooltip.attr('class', 'network-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.9)')
            .style('color', 'white')
            .style('padding', '12px')
            .style('border-radius', '6px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('z-index', '1000')
            .style('max-width', '300px')
            .style('white-space', 'nowrap');
        }
        const node: any = d;
        // Find all links connected to this node
        const connectedLinks = links.filter((l: any) => {
          const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
          const targetId = typeof l.target === 'object' ? l.target.id : l.target;
          return sourceId === node.id || targetId === node.id;
        });
        // Sum inflow/outflow for this node
        let inflow = 0;
        let outflow = 0;
        connectedLinks.forEach((l: any) => {
          const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
          if (sourceId === node.id) {
            outflow += l.centralOutflow ?? l.tokenAOutflowUSD ?? 0;
            inflow += l.centralInflow ?? l.tokenAInflowUSD ?? 0;
          } else {
            outflow += l.centralOutflow ?? l.tokenBOutflowUSD ?? 0;
            inflow += l.centralInflow ?? l.tokenBInflowUSD ?? 0;
          }
        });
        const outflowInflowRatio = inflow > 0 && outflow > 0 ? (outflow / inflow).toFixed(2) : 'N/A';
        const inflowOutflowRatio = inflow > 0 && outflow > 0 ? (inflow / outflow).toFixed(2) : 'N/A';
        const html = `
          <div style="margin-bottom: 8px;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${node.id}</div>
            <div>Total Volume: $${(node.totalVolumeUSD ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            <div>Total Swaps: ${(node.totalSwaps ?? 0).toLocaleString()}</div>
            <div>Inflow: $${inflow.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            <div>Outflow: $${outflow.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            <div>Outflow/Inflow: ${outflowInflowRatio}</div>
            <div>Inflow/Outflow: ${inflowOutflowRatio}</div>
          </div>
        `;
        tooltip.html(html)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')
          .transition().duration(200).style('opacity', 1);
      })
      .on('mousemove', function(event: any) {
        d3.select('body').select('.network-tooltip')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function(this: any) {
        d3.select('body').select('.network-tooltip')
          .transition().duration(200).style('opacity', 0);
      });

    // Draw labels
    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text(d => d.id)
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none');

    function updateLinkStyles() {
      const minStroke = 1.5;
      const maxStroke = 8;
      link
        .attr('stroke', (d: any) => {
          const inflow = d.centralInflow ?? 0;
          const outflow = d.centralOutflow ?? 0;
          if (linkMode === 'inflow') {
            return outflow > 0 && inflow / outflow > 1 ? '#10b981' : '#666';
          } else {
            return inflow > 0 && outflow / inflow > 1 ? '#ef4444' : '#666';
          }
        })
        .attr('stroke-width', (d: any) => {
          const inflow = d.centralInflow ?? 0;
          const outflow = d.centralOutflow ?? 0;
          let ratio = 1;
          if (linkMode === 'inflow') {
            ratio = outflow > 0 ? inflow / outflow : 0;
          } else {
            ratio = inflow > 0 ? outflow / inflow : 0;
          }
          if ((linkMode === 'inflow' && outflow > 0 && inflow / outflow > 1) ||
              (linkMode === 'outflow' && inflow > 0 && outflow / inflow > 1)) {
            return Math.max(minStroke, Math.min(maxStroke, ratio * 2));
          }
          return minStroke;
        })
        .style('opacity', (d: any) => {
          const inflow = d.centralInflow ?? 0;
          const outflow = d.centralOutflow ?? 0;
          if (linkMode === 'inflow') {
            return outflow > 0 && inflow / outflow > 1 ? 0.8 : 0.3;
          } else {
            return inflow > 0 && outflow / inflow > 1 ? 0.8 : 0.3;
          }
        });
    }

    updateLinkStyles();

    function ticked() {
      link
        .attr('x1', (d: any) => typeof d.source === 'object' && d.source !== null ? (d.source.x ?? 0) : 0)
        .attr('y1', (d: any) => typeof d.source === 'object' && d.source !== null ? (d.source.y ?? 0) : 0)
        .attr('x2', (d: any) => typeof d.target === 'object' && d.target !== null ? (d.target.x ?? 0) : 0)
        .attr('y2', (d: any) => typeof d.target === 'object' && d.target !== null ? (d.target.y ?? 0) : 0);
      node
        .attr('cx', (d: any) => d.x ?? 0)
        .attr('cy', (d: any) => d.y ?? 0);
      label
        .attr('x', (d: any) => (d.x ?? 0) + 22)
        .attr('y', (d: any) => (d.y ?? 0) + 5);
    }

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Listen for linkMode changes
    const unsub = () => {};
    return () => {
      simulation.stop();
      svg.selectAll('*').remove();
      d3.selectAll('.network-tooltip').remove();
      unsub();
    };
  }, [data, centralToken, onNodeClick, linkMode]);

  // When linkMode changes, update link styles
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const link = svg.selectAll('g.links line');
    if (!link.empty()) {
      const minStroke = 1.5;
      const maxStroke = 8;
      link
        .attr('stroke', (d: any) => {
          const inflow = d.centralInflow ?? 0;
          const outflow = d.centralOutflow ?? 0;
          if (linkMode === 'inflow') {
            return outflow > 0 && inflow / outflow > 1 ? '#10b981' : '#666';
          } else {
            return inflow > 0 && outflow / inflow > 1 ? '#ef4444' : '#666';
          }
        })
        .attr('stroke-width', (d: any) => {
          const inflow = d.centralInflow ?? 0;
          const outflow = d.centralOutflow ?? 0;
          let ratio = 1;
          if (linkMode === 'inflow') {
            ratio = outflow > 0 ? inflow / outflow : 0;
          } else {
            ratio = inflow > 0 ? outflow / inflow : 0;
          }
          if ((linkMode === 'inflow' && outflow > 0 && inflow / outflow > 1) ||
              (linkMode === 'outflow' && inflow > 0 && outflow / inflow > 1)) {
            return Math.max(minStroke, Math.min(maxStroke, ratio * 2));
          }
          return minStroke;
        })
        .style('opacity', (d: any) => {
          const inflow = d.centralInflow ?? 0;
          const outflow = d.centralOutflow ?? 0;
          if (linkMode === 'inflow') {
            return outflow > 0 && inflow / outflow > 1 ? 0.8 : 0.3;
          } else {
            return inflow > 0 && outflow / inflow > 1 ? 0.8 : 0.3;
          }
        });
    }
  }, [linkMode]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <NetworkGraphContainer centralToken={centralToken}>
      <div className="flex items-center justify-between mb-4">
        <NetworkControls
          linkMode={linkMode}
          onModeChange={setLinkMode}
          window={window}
          onWindowChange={setWindow}
        />
      </div>
      <svg ref={svgRef} width={WIDTH} height={HEIGHT} />
    </NetworkGraphContainer>
  );
}; 