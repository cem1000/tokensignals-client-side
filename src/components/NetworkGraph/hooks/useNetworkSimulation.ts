import { useRef, useCallback } from 'react';
import * as d3 from 'd3';
import type { NetworkNode, NetworkLink } from '../../../types';
import { NETWORK_CONFIG } from '../../../utils/constants';

export const useNetworkSimulation = (width: number, height: number) => {
  const simulationRef = useRef<d3.Simulation<NetworkNode, NetworkLink> | null>(null);

  const createSimulation = useCallback((
    nodes: NetworkNode[],
    links: NetworkLink[]
  ) => {
    const simulation = d3.forceSimulation<NetworkNode>(nodes)
      .force('link', d3.forceLink<NetworkNode, NetworkLink>(links)
        .id(d => d.id)
        .distance(180)
        .strength(0.8))
      .force('charge', d3.forceManyBody().strength(-800))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => {
        const node = d as NetworkNode;
        return Math.max(
          NETWORK_CONFIG.MIN_NODE_RADIUS,
          Math.min(NETWORK_CONFIG.MAX_NODE_RADIUS, (node.totalVolumeUSD ?? 0) / 1000000 * 2)
        ) + 8;
      }));

    simulationRef.current = simulation;
    return simulation;
  }, [width, height]);

  const stopSimulation = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.stop();
    }
  }, []);

  const restartSimulation = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.alpha(1).restart();
    }
  }, []);

  const updateSimulationData = useCallback((
    nodes: NetworkNode[],
    links: NetworkLink[]
  ) => {
    if (simulationRef.current) {
      simulationRef.current.nodes(nodes);
      const linkForce = simulationRef.current.force('link') as d3.ForceLink<NetworkNode, NetworkLink>;
      linkForce.links(links);
    }
  }, []);

  const addTickHandler = useCallback((
    handler: (nodes: NetworkNode[], links: NetworkLink[]) => void,
    nodes: NetworkNode[],
    links: NetworkLink[]
  ) => {
    if (simulationRef.current) {
      let tickCount = 0;
      const boostDuration = 50;

      simulationRef.current.on('tick', () => {
        tickCount++;
        
        if (tickCount <= boostDuration) {
          simulationRef.current?.force('charge', d3.forceManyBody().strength(-800));
        } else if (tickCount === boostDuration + 1) {
          simulationRef.current?.force('charge', d3.forceManyBody().strength(-300));
        }

        nodes.forEach(node => {
          if (!node.isCentral && node.vx !== undefined && node.vy !== undefined) {
            node.vx += (Math.random() - 0.5) * 0.01;
            node.vy += (Math.random() - 0.5) * 0.01;
          }
        });

        handler(nodes, links);
      });
    }
  }, []);

  return {
    createSimulation,
    stopSimulation,
    restartSimulation,
    updateSimulationData,
    addTickHandler
  };
}; 