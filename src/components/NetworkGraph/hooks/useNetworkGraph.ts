import { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { 
  getNodeRadiusByPairVolume,
  getLinkColor, 
  getLinkStrokeWidth, 
  getLinkOpacity,
  getArrowSpeed,
  calculateLinkRatio 
} from '../utils/networkUtils';

const WIDTH = 1600;
const HEIGHT = 1000;

interface UseNetworkGraphProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  filteredNodes: any[];
  filteredLinks: any[];
  centralToken: string;
  window: '24h' | '1h';
  onNodeClick?: (id: string) => void;
  showTooltip: (...args: any[]) => void;
  hideTooltip: (...args: any[]) => void;
  destroyTooltip: (...args: any[]) => void;
}

export function useNetworkGraph({
  svgRef,
  filteredNodes,
  filteredLinks,
  centralToken,
  window,
  onNodeClick,
  showTooltip,
  hideTooltip,
  destroyTooltip
}: UseNetworkGraphProps) {
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null);
  const intervalRef = useRef<number | null>(null);

  const createSimulation = useCallback(() => {
    if (!filteredNodes || !filteredLinks || filteredNodes.length === 0 || filteredLinks.length === 0) {
      console.warn('No data available for simulation');
      return;
    }

    const minR = 8;
    const maxR = 24;
    const maxVolume = d3.max(filteredNodes, (d: any) => d?.totalVolumeUSD ?? 0) || 1;
    const rScale = d3.scaleSqrt()
      .domain([0, maxVolume])
      .range([minR, maxR]);

    const simulation = d3.forceSimulation(filteredNodes)
      .force('link', d3.forceLink(filteredLinks).id((d: any) => d?.id).distance(160).strength(0.8))
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('center', d3.forceCenter(WIDTH / 2, HEIGHT / 2))
      .force('collision', d3.forceCollide().radius((d: any) => rScale(d?.totalVolumeUSD ?? 0) + 8));

    simulationRef.current = simulation;
    return { simulation, rScale };
  }, [filteredNodes, filteredLinks]);

  const renderElements = useCallback((svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, rScale: (v: number) => number) => {
    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(filteredLinks)
      .enter().append('line')
      .attr('stroke', (d: any) => getLinkColor(d, 'inflow', window))
      .attr('stroke-width', (d: any) => getLinkStrokeWidth(d, window))
      .style('opacity', (d: any) => getLinkOpacity(d, 'inflow'))
      .style('stroke-dasharray', '5,5')
      .style('stroke-dashoffset', '0')
      .style('stroke-linecap', 'round');

    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(filteredNodes)
      .enter().append('circle')
      .attr('r', (d: any) => getNodeRadiusByPairVolume(d, filteredLinks, centralToken, rScale))
      .attr('fill', (d: any) => d.id === centralToken ? '#3b82f6' : '#6b7280')
      .call((d3.drag() as any)
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (_event: any, d: any) => {
        if (onNodeClick && d.id !== centralToken) {
          onNodeClick(d.id);
        }
      })
      .on('mouseover', function(event, d: any) {
        showTooltip(event, d, filteredLinks, centralToken);
      })
      .on('mousemove', function(event: any) {
        d3.select('body').select('.network-tooltip')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        hideTooltip();
      });

    const label = svg.append('g')
      .selectAll('text')
      .data(filteredNodes)
      .enter().append('text')
      .text((d: any) => d.id)
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none');

    return { link, node, label };
  }, [filteredNodes, filteredLinks, centralToken, onNodeClick, showTooltip, hideTooltip]);

  const createTickHandler = useCallback((link: any, node: any, label: any) => {
    return () => {
      link
        .attr('x1', (d: any) => typeof d.source === 'object' && d.source !== null ? (d.source.x ?? 0) : 0)
        .attr('y1', (d: any) => typeof d.source === 'object' && d.source !== null ? (d.source.y ?? 0) : 0)
        .attr('x2', (d: any) => typeof d.target === 'object' && d.target !== null ? (d.target.x ?? 0) : 0)
        .attr('y2', (d: any) => typeof d.target === 'object' && d.target !== null ? (d.target.y ?? 0) : 0)
        .attr('stroke-width', (d: any) => getLinkStrokeWidth(d, window))
        .style('stroke-dashoffset', function(d: any) {
          const speed = getArrowSpeed(d, window);
          const time = Date.now() / 1000;
          const { inflowShare } = calculateLinkRatio(d, window);
          
          // Determine direction: positive = flow towards central token, negative = flow away from central token
          const direction = inflowShare > 0.5 ? -1 : 1;
          
          // Calculate the dash offset to create moving particle effect
          const offset = (time * speed * direction) % 10; // 10 = dasharray length (5+5)
          return offset.toString();
        });
      node
        .attr('cx', (d: any) => d.x ?? 0)
        .attr('cy', (d: any) => d.y ?? 0);
      label
        .attr('x', (d: any) => (d.x ?? 0) + 22)
        .attr('y', (d: any) => (d.y ?? 0) + 5);
    };
  }, []);

  function dragstarted(event: any, d: any) {
    if (!event.active && simulationRef.current) simulationRef.current.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event: any, d: any) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event: any, d: any) {
    if (!event.active && simulationRef.current) simulationRef.current.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  useEffect(() => {
    if (!filteredNodes || !filteredLinks || !svgRef.current) {
      console.warn('Missing required data for network graph');
      return;
    }
    
    if (filteredNodes.length === 0 || filteredLinks.length === 0) {
      console.warn('Empty data arrays for network graph');
      return;
    }
    
    try {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const simulationData = createSimulation();
      if (!simulationData) {
        console.warn('Failed to create simulation');
        return;
      }
      
      const { simulation, rScale } = simulationData;
      const { link, node, label } = renderElements(svg, rScale);
      const ticked = createTickHandler(link, node, label);

      simulation.on('tick', ticked);

      // Add animation frame for smooth particle movement
      let animationId: number;
      const animate = () => {
        ticked();
        animationId = requestAnimationFrame(animate);
      };
      animate();

      intervalRef.current = setInterval(() => {
        simulation.alpha(0.05).restart();
      }, 2000);

      return () => {
        simulation.stop();
        svg.selectAll('*').remove();
        destroyTooltip();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    } catch (error) {
      console.error('Error setting up network graph:', error);
    }
  }, [filteredNodes, filteredLinks, centralToken, onNodeClick, showTooltip, hideTooltip, destroyTooltip, createSimulation, renderElements, createTickHandler]);
} 