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
  onNodeClick?: (id: string) => void;
  showTooltip: (...args: any[]) => void;
  hideTooltip: (...args: any[]) => void;
  destroyTooltip: (...args: any[]) => void;
  getImageUrl?: (symbol: string) => string | null;
  isResolved?: boolean;
}

export function useNetworkGraph({
  svgRef,
  filteredNodes,
  filteredLinks,
  centralToken,
  onNodeClick,
  showTooltip,
  hideTooltip,
  destroyTooltip,
  getImageUrl,
  isResolved
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
      .force('collision', d3.forceCollide().radius((d: any) => getNodeRadiusByPairVolume(d, filteredLinks, centralToken, rScale) + 8));

    simulationRef.current = simulation;
    return { simulation, rScale };
  }, [filteredNodes, filteredLinks]);

  const renderElements = useCallback((svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, rScale: (v: number) => number) => {
    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(filteredLinks)
      .enter().append('line')
      .attr('stroke', (d: any) => getLinkColor(d, 'inflow'))
      .attr('stroke-width', (d: any) => getLinkStrokeWidth(d))
      .style('opacity', (d: any) => getLinkOpacity(d, 'inflow'))
      .style('stroke-dasharray', '8,7')
      .style('stroke-dashoffset', '0')
      .style('stroke-linecap', 'round');

    // Cache tooltip element for better performance
    const tooltipElement = d3.select('body').select('.network-tooltip');

    // Create node groups for each token
    const nodeGroup = svg.append('g')
      .selectAll('g')
      .data(filteredNodes)
      .enter().append('g')
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
        tooltipElement
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        hideTooltip();
      });

    // Add subtle border circle for visual definition (this will handle clicks)
    nodeGroup.append('circle')
      .attr('r', (d: any) => getNodeRadiusByPairVolume(d, filteredLinks, centralToken, rScale))
      .attr('fill', 'transparent')
      .attr('stroke', (d: any) => d.id === centralToken ? '#3b82f6' : '#ffffff')
      .attr('stroke-width', (d: any) => d.id === centralToken ? 3 : 1.5);

    // Add token images or fallback circles
    if (getImageUrl) {
      // Add token images for tokens that have them
      nodeGroup.append('image')
        .attr('href', (d: any) => getImageUrl(d.id) || '')
        .attr('x', (d: any) => -getNodeRadiusByPairVolume(d, filteredLinks, centralToken, rScale))
        .attr('y', (d: any) => -getNodeRadiusByPairVolume(d, filteredLinks, centralToken, rScale))
        .attr('width', (d: any) => getNodeRadiusByPairVolume(d, filteredLinks, centralToken, rScale) * 2)
        .attr('height', (d: any) => getNodeRadiusByPairVolume(d, filteredLinks, centralToken, rScale) * 2)
        .attr('clip-path', (d: any) => `circle(${getNodeRadiusByPairVolume(d, filteredLinks, centralToken, rScale)}px at ${getNodeRadiusByPairVolume(d, filteredLinks, centralToken, rScale)}px ${getNodeRadiusByPairVolume(d, filteredLinks, centralToken, rScale)}px)`)
        .style('pointer-events', 'none')
        .style('opacity', (d: any) => getImageUrl(d.id) ? 1 : 0);

      // Add fallback circles for tokens without images
      nodeGroup.append('circle')
        .attr('r', (d: any) => getNodeRadiusByPairVolume(d, filteredLinks, centralToken, rScale))
        .attr('fill', (d: any) => {
          if (getImageUrl(d.id)) return 'transparent'; // Hide if image exists
          // Generate color based on token symbol
          const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
          const hash = d.id.split('').reduce((a: number, b: string) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
          }, 0);
          return colors[Math.abs(hash) % colors.length];
        })
        .style('pointer-events', 'none');

      // Add token symbol text for fallback circles
      nodeGroup.append('text')
        .text((d: any) => getImageUrl(d.id) ? '' : d.id.slice(0, 2).toUpperCase())
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .style('pointer-events', 'none');
    }

    const label = svg.append('g')
      .selectAll('text')
      .data(filteredNodes)
      .enter().append('text')
      .text((d: any) => d.id)
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none');

    return { link, node: nodeGroup, label };
  }, [filteredNodes, filteredLinks, centralToken, onNodeClick, showTooltip, hideTooltip]);

  const createTickHandler = useCallback((svg: any, link: any, node: any, label: any) => {
    return () => {
      // Batch DOM updates for better performance
      const time = Date.now() / 1000;
      
      link
        .attr('x1', (d: any) => typeof d.source === 'object' && d.source !== null ? (d.source.x ?? 0) : 0)
        .attr('y1', (d: any) => typeof d.source === 'object' && d.source !== null ? (d.source.y ?? 0) : 0)
        .attr('x2', (d: any) => typeof d.target === 'object' && d.target !== null ? (d.target.x ?? 0) : 0)
        .attr('y2', (d: any) => typeof d.target === 'object' && d.target !== null ? (d.target.y ?? 0) : 0)
        .attr('stroke-width', (d: any) => getLinkStrokeWidth(d))
        .style('stroke-dashoffset', function(d: any) {
          const speed = getArrowSpeed(d);
          const { inflowShare } = calculateLinkRatio(d);
          
          // Determine direction: positive = flow towards central token, negative = flow away from central token
          const direction = inflowShare > 0.5 ? -1 : 1;
          
          // Calculate the dash offset to create moving particle effect
          const dashLength = 15;
          const offset = (time * speed * direction) % dashLength;
          return offset.toString();
        });
      node
        .attr('transform', (d: any) => `translate(${d.x ?? 0}, ${d.y ?? 0})`);
      label
        .attr('x', (d: any) => (d.x ?? 0) + 22)
        .attr('y', (d: any) => (d.y ?? 0) + 5);
    };
  }, [window]);

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
    // Block rendering if we're waiting for images
    if (getImageUrl && isResolved === false) {
      return;
    }

    if (!filteredNodes || !filteredLinks || !svgRef.current) {
      return;
    }
    
    if (filteredNodes.length === 0 || filteredLinks.length === 0) {
      return;
    }

    try {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const simulationData = createSimulation();
      if (!simulationData) {
        return;
      }
      
      const { simulation, rScale } = simulationData;
      const { link, node, label } = renderElements(svg, rScale);
      const ticked = createTickHandler(svg, link, node, label);

      simulation.on('tick', ticked);

      // Add animation frame for smooth particle movement
      let animationId: number;
      let lastTime = 0;
      const animate = (currentTime: number) => {
        // Throttle animation to 60fps and reduce CPU usage
        if (currentTime - lastTime >= 16) { // ~60fps
          ticked();
          lastTime = currentTime;
        }
        animationId = requestAnimationFrame(animate);
      };
      animate(0);

      // Reduce simulation restart frequency to prevent excessive recalculations
      intervalRef.current = setInterval(() => {
        simulation.alpha(0.03).restart();
      }, 3000);

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
      // Error handling
    }
  }, [filteredNodes, filteredLinks, centralToken, onNodeClick, showTooltip, hideTooltip, destroyTooltip, createSimulation, renderElements, createTickHandler, isResolved, getImageUrl]);
} 