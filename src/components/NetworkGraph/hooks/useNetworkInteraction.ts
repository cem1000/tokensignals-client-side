import { useCallback } from 'react';
import * as d3 from 'd3';
import type { NetworkNode } from '../../../types';

export const useNetworkInteraction = (
  onNodeClick: (token: string) => void,
  simulation: d3.Simulation<NetworkNode, any> | null
) => {
  const handleNodeClick = useCallback((_event: MouseEvent, d: NetworkNode) => {
    if (onNodeClick && !d.isCentral) {
      onNodeClick(d.id);
    }
  }, [onNodeClick]);

  const createDragBehavior = useCallback(() => {
    return d3.drag<SVGCircleElement, NetworkNode>()
      .on('start', function(event, d) {
        if (!event.active && simulation) {
          simulation.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', function(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', function(event, d) {
        if (!event.active && simulation) {
          simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
      });
  }, [simulation]);

  return {
    handleNodeClick,
    createDragBehavior
  };
}; 