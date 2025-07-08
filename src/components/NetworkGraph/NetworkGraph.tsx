import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { LoadingSpinner, ErrorMessage } from '../UI';
import { NetworkControls } from './NetworkControls';
import { NetworkGraphContainer } from './NetworkGraphContainer';
import { NetworkFilters } from './NetworkFilters';
import { useNetworkTooltip } from './hooks/useNetworkTooltip';
import { getNodeRadiusByPairVolume } from './utils/nodeSizing';
import { 
  filterNetworkDataByVolume, 
  getMinVolumeFromIndex,
  getLinkColor,
  getLinkStrokeWidth,
  getLinkOpacity
} from './utils/networkFilters';
import type { NetworkGraphProps, LinkMode } from './types/networkGraph';

const WIDTH = 1600;
const HEIGHT = 1000;

function fetchNetworkData(token: string, window: '24h' | '1h', limit: number) {
  const endpoint = window === '1h'
    ? `/api/1h/token-pairs/${token}?limit=${limit}`
    : `/api/token-pairs/${token}?limit=${limit}`;
  return fetch(endpoint).then(res => res.json());
}

export const NetworkGraph = ({ centralToken, onNodeClick }: NetworkGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [linkMode, setLinkMode] = useState<LinkMode>('inflow');
  const [window, setWindow] = useState<'24h' | '1h'>('24h');
  const [limit, setLimit] = useState<number>(50);
  const [minVolumeIdx, setMinVolumeIdx] = useState<number>(0);
  const minVolume = getMinVolumeFromIndex(minVolumeIdx);
  const [rawData, setRawData] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showTooltip, hideTooltip, destroyTooltip } = useNetworkTooltip();

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    console.log('Fetching:', centralToken, window, limit);
    fetchNetworkData(centralToken, window, limit)
      .then(res => {
        console.log('Fetched rawData:', res);
        setRawData(res);
        setIsLoading(false);
      })
      .catch(e => {
        setError(e.message || 'Error fetching data');
        setIsLoading(false);
      });
  }, [centralToken, window, limit]);

  useEffect(() => {
    if (!rawData) return;
    const filteredData = filterNetworkDataByVolume(rawData, minVolume);
    console.log('Filtered nodes:', filteredData.nodes);
    console.log('Filtered links:', filteredData.links);
    setData(filteredData);
  }, [rawData, minVolume]);

  useEffect(() => {
    if (!data) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { nodes, links } = data;
    if (!nodes || !links) return;

    // Node size scale
    const minR = 8;
    const maxR = 24;
    const maxVolume = d3.max(nodes as any[], (d: any) => d.totalVolumeUSD ?? 0) || 1;
    const rScale = d3.scaleSqrt()
      .domain([0, maxVolume])
      .range([minR, maxR]);

    // D3 simulation
    const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id((d: any) => d.id).distance(160).strength(0.8))
    .force('charge', d3.forceManyBody().strength(-1000))
    .force('center', d3.forceCenter(WIDTH / 2, HEIGHT / 2))
    .force('collision', d3.forceCollide().radius((d: any) => rScale(d.totalVolumeUSD ?? 0) + 8))
    .force('alpha', d3.forceManyBody().strength(0.2))
    .on('tick', ticked);

    const intervalId = setInterval(() => {
      simulation.alpha(0.05).restart();
    }, 2000);
    
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
      .attr('r', (d: any) => getNodeRadiusByPairVolume(d, links, centralToken, rScale))
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
        showTooltip(event, d, links);
      })
      .on('mousemove', function(event: any) {
        d3.select('body').select('.network-tooltip')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function(this: any) {
        hideTooltip();
      });

    // Draw labels
    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .text((d: any) => d.id)
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none');

    function updateLinkStyles() {
      link
        .attr('stroke', (d: any) => getLinkColor(d, linkMode))
        .attr('stroke-width', (d: any) => getLinkStrokeWidth(d, linkMode))
        .style('opacity', (d: any) => getLinkOpacity(d, linkMode));
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
      destroyTooltip();
      clearInterval(intervalId);
      unsub();
    };
  }, [data, centralToken, onNodeClick, linkMode]);

  // When linkMode changes, update link styles
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const link = svg.selectAll('g.links line');
    if (!link.empty()) {
      link
        .attr('stroke', (d: any) => getLinkColor(d, linkMode))
        .attr('stroke-width', (d: any) => getLinkStrokeWidth(d, linkMode))
        .style('opacity', (d: any) => getLinkOpacity(d, linkMode));
    }
  }, [linkMode]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <NetworkFilters
        limit={limit}
        onLimitChange={setLimit}
        minVolumeIdx={minVolumeIdx}
        onMinVolumeIdxChange={setMinVolumeIdx}
      />
      <NetworkControls
        linkMode={linkMode}
        onModeChange={setLinkMode}
        window={window}
        onWindowChange={setWindow}
      />
      <NetworkGraphContainer centralToken={centralToken}>
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <svg key={`${centralToken}-${window}`} ref={svgRef} width={WIDTH} height={HEIGHT} />
        )}
      </NetworkGraphContainer>
    </div>
  );
}; 