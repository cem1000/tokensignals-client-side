import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useNetworkData } from '../../hooks/useNetworkData';
import { LoadingSpinner, ErrorMessage } from '../UI';
import { NETWORK_CONFIG } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import type { NetworkNode, NetworkLink } from '../../types';

interface NetworkGraphProps {
  centralToken: string;
  onNodeClick: (token: string) => void;
}

export const NetworkGraph = ({ centralToken, onNodeClick }: NetworkGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { data, isLoading, error } = useNetworkData(centralToken, 50);
  const [linkMode, setLinkMode] = useState<'inflow' | 'outflow' | 'all'>('outflow');
  const simulationRef = useRef<d3.Simulation<NetworkNode, NetworkLink> | null>(null);

  // Move these outside useEffect
  const width = 1200;
  const height = 900;

  useEffect(() => {
    if (!data) return;

    const { nodes, links } = data;

    // Filter links based on mode
    let filteredLinks = links;
    if (linkMode === 'inflow') {
      filteredLinks = links.filter(l => {
        const inflow = l.centralInflow ?? 0;
        const outflow = l.centralOutflow ?? 0;
        return outflow > 0 && inflow / outflow > 1;
      });
    } else if (linkMode === 'outflow') {
      filteredLinks = links.filter(l => {
        const inflow = l.centralInflow ?? 0;
        const outflow = l.centralOutflow ?? 0;
        return inflow > 0 && outflow / inflow > 1;
      });
    }

    // Filter nodes to only show connected ones (plus central node)
    const connectedNodeIds = new Set<string>();
    connectedNodeIds.add(centralToken); // Always include central node
    
    filteredLinks.forEach(link => {
      const source = typeof link.source === 'string' ? link.source : link.source.id;
      const target = typeof link.target === 'string' ? link.target : link.target.id;
      connectedNodeIds.add(source);
      connectedNodeIds.add(target);
    });

    const filteredNodes = nodes.filter(node => connectedNodeIds.has(node.id));

    // Clear existing SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Stop existing simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    // Create new simulation with filtered data
    const simulation = d3.forceSimulation<NetworkNode>(filteredNodes)
      .force('link', d3.forceLink<NetworkNode, NetworkLink>(filteredLinks)
        .id(d => d.id)
        .distance(180)
        .strength(0.8))
      .force('charge', d3.forceManyBody().strength(-800))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => {
        const node = d as NetworkNode;
        return Math.max(NETWORK_CONFIG.MIN_NODE_RADIUS, Math.min(NETWORK_CONFIG.MAX_NODE_RADIUS, node.totalVolumeUSD ?? 0 / 1000000 * 2)) + 8;
      }));

    simulationRef.current = simulation;

    // Add force boost for better initial spread
    let tickCount = 0;
    const boostDuration = 50; // Number of ticks for boost

    simulation.on('tick', () => {
      tickCount++;
      
      // Apply force boost for initial spread
      if (tickCount <= boostDuration) {
        simulation.force('charge', d3.forceManyBody().strength(-800));
      } else if (tickCount === boostDuration + 1) {
        // Return to normal strength
        simulation.force('charge', d3.forceManyBody().strength(-300));
      }

      // Add subtle random force for continuous jiggle
      filteredNodes.forEach(node => {
        if (!node.isCentral && node.vx !== undefined && node.vy !== undefined) {
          node.vx += (Math.random() - 0.5) * 0.01;
          node.vy += (Math.random() - 0.5) * 0.01;
        }
      });

      // Update positions
      const link = svg.selectAll<SVGLineElement, NetworkLink>('line')
        .data(filteredLinks)
        .join('line')
        .attr('x1', d => {
          const source = typeof d.source === 'string' ? filteredNodes.find(n => n.id === d.source) : d.source;
          return source?.x ?? 0;
        })
        .attr('y1', d => {
          const source = typeof d.source === 'string' ? filteredNodes.find(n => n.id === d.source) : d.source;
          return source?.y ?? 0;
        })
        .attr('x2', d => {
          const target = typeof d.target === 'string' ? filteredNodes.find(n => n.id === d.target) : d.target;
          return target?.x ?? 0;
        })
        .attr('y2', d => {
          const target = typeof d.target === 'string' ? filteredNodes.find(n => n.id === d.target) : d.target;
          return target?.y ?? 0;
        });

      const node = svg.selectAll<SVGCircleElement, NetworkNode>('circle')
        .data(filteredNodes)
        .join('circle')
        .attr('cx', d => d.x ?? 0)
        .attr('cy', d => d.y ?? 0);

      const label = svg.selectAll<SVGTextElement, NetworkNode>('text')
        .data(filteredNodes)
        .join('text')
        .attr('x', d => (d.x ?? 0) + 20)
        .attr('y', d => (d.y ?? 0) + 5);
    });

    // Draw links
    const minStroke = 1.5;
    const maxStroke = 8;
    const volumeExtent = d3.extent(filteredLinks, d => d.totalVolumeUSD || 1);
    const strokeScale = d3.scaleLinear()
      .domain(volumeExtent as [number, number])
      .range([minStroke, maxStroke])
      .clamp(true);

    const link = svg.append('g')
      .selectAll('line')
      .data(filteredLinks)
      .enter()
      .append('line')
      .attr('stroke', linkMode === 'outflow' ? '#ef4444' : linkMode === 'inflow' ? '#10b981' : '#888')
      .attr('stroke-width', d => strokeScale(d.totalVolumeUSD || 1))
      .style('opacity', 0.6);

    // Draw nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(filteredNodes)
      .enter()
      .append('circle')
      .attr('r', d => {
        if (d.isCentral) {
          return NETWORK_CONFIG.CENTRAL_NODE_RADIUS;
        }
        const volume = d.totalVolumeUSD ?? 0;
        return Math.max(NETWORK_CONFIG.MIN_NODE_RADIUS, 
          Math.min(NETWORK_CONFIG.MAX_NODE_RADIUS, volume / 1000000 * 2));
      })
      .attr('fill', d => d.isCentral ? '#3b82f6' : '#6b7280')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (onNodeClick && !d.isCentral) {
          onNodeClick(d.id);
        }
      })
      .on('mouseover', function (event, d) {
        let tooltip = d3.select('body').select<HTMLDivElement>('.network-tooltip');
        if (tooltip.empty()) {
          tooltip = d3.select('body').append('div')
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
            .style('white-space', 'nowrap');
        }
        
        const node = d as NetworkNode;
        
        // Find all links connected to this node
        const connectedLinks = filteredLinks.filter(link => {
          const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
          const targetId = typeof link.target === 'string' ? link.target : link.target.id;
          return sourceId === node.id || targetId === node.id;
        });

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
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
            const targetId = typeof link.target === 'string' ? link.target : link.target.id;
            const otherToken = sourceId === node.id ? targetId : sourceId;
            
            const centralInflow = link.centralInflow ?? 0;
            const centralOutflow = link.centralOutflow ?? 0;
            const totalVolume = link.totalVolumeUSD ?? 0;
            const totalSwaps = link.totalSwaps ?? 0;
            
            // Calculate ratios
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

        tooltip.transition().duration(200).style('opacity', 1);
        tooltip.html(tooltipContent)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', function() {
        d3.selectAll('.network-tooltip').remove();
      });

    // Draw labels for each node
    const label = svg.append('g')
      .selectAll('text')
      .data(filteredNodes)
      .enter()
      .append('text')
      .text(d => d.id)
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none');

    // Cleanup function
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
      d3.selectAll('.network-tooltip').remove();
    };
  }, [data, centralToken, onNodeClick, linkMode]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.toString()} />;

  return (
    <div className="w-full flex justify-center">
      <div className="bg-gray-900 rounded-lg p-4 min-w-[900px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Network Graph - {centralToken}</h2>
          <div className="flex items-center space-x-2 text-sm">
            <button
              className={`px-2 py-1 rounded ${linkMode === 'inflow' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-200'}`}
              onClick={() => setLinkMode('inflow')}
            >
              Inflow
            </button>
            <button
              className={`px-2 py-1 rounded ${linkMode === 'outflow' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-200'}`}
              onClick={() => setLinkMode('outflow')}
            >
              Outflow
            </button>
            <button
              className={`px-2 py-1 rounded ${linkMode === 'all' ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-200'}`}
              onClick={() => setLinkMode('all')}
            >
              All
            </button>
          </div>
        </div>
        <svg ref={svgRef} width={width} height={height} />
      </div>
    </div>
  );
}; 