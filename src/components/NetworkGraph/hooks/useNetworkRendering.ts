import { useRef, useCallback, useEffect } from 'react';
import type { NetworkNode, NetworkLink } from '../../../types';
import type { LinkMode } from '../types/networkGraph';
import { NetworkRenderer } from '../renderers/NetworkRenderer';

export const useNetworkRendering = (
  svgRef: React.RefObject<SVGSVGElement | null>,
  width: number,
  height: number,
  onNodeClick: (token: string) => void,
  onNodeMouseOver: (event: MouseEvent, node: NetworkNode) => void,
  onNodeMouseOut: () => void,
  createDragBehavior: () => any
) => {
  const rendererRef = useRef<NetworkRenderer | null>(null);

  const initializeRenderer = useCallback(() => {
    if (svgRef.current && !rendererRef.current) {
      rendererRef.current = new NetworkRenderer(
        svgRef.current,
        width,
        height,
        (_event, node) => onNodeClick(node.id),
        onNodeMouseOver,
        onNodeMouseOut,
        createDragBehavior
      );
    }
  }, [svgRef, width, height, onNodeClick, onNodeMouseOver, onNodeMouseOut, createDragBehavior]);

  const render = useCallback((
    data: { nodes: NetworkNode[]; links: NetworkLink[] },
    centralToken: string,
    linkMode: LinkMode
  ) => {
    if (rendererRef.current) {
      return rendererRef.current.render(data, centralToken, linkMode);
    }
    return { filteredNodes: [], filteredLinks: [] };
  }, []);

  const updatePositions = useCallback((nodes: NetworkNode[], links: NetworkLink[]) => {
    if (rendererRef.current) {
      rendererRef.current.updatePositions(nodes, links);
    }
  }, []);

  const updateLinkMode = useCallback((links: NetworkLink[], mode: LinkMode) => {
    if (rendererRef.current) {
      rendererRef.current.updateLinkMode(links, mode);
    }
  }, []);

  const destroy = useCallback(() => {
    if (rendererRef.current) {
      rendererRef.current.destroy();
      rendererRef.current = null;
    }
  }, []);

  useEffect(() => {
    initializeRenderer();
    return destroy;
  }, [initializeRenderer, destroy]);

  return {
    render,
    updatePositions,
    updateLinkMode,
    destroy
  };
}; 