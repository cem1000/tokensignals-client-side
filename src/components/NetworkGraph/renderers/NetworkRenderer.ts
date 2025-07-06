import * as d3 from 'd3';
import type { NetworkNode, NetworkLink } from '../../../types';
import type { LinkMode } from '../types/networkGraph';
import { LinkRenderer } from './LinkRenderer';
import { NodeRenderer } from './NodeRenderer';
import { LabelRenderer } from './LabelRenderer';
import { filterNetworkData } from '../utils/networkCalculations';

export class NetworkRenderer {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private linkRenderer: LinkRenderer;
  private nodeRenderer: NodeRenderer;
  private labelRenderer: LabelRenderer;

  constructor(
    svgElement: SVGSVGElement,
    _width: number,
    _height: number,
    onNodeClick: (event: MouseEvent, node: NetworkNode) => void,
    onNodeMouseOver: (event: MouseEvent, node: NetworkNode) => void,
    onNodeMouseOut: () => void,
    createDragBehavior: () => d3.DragBehavior<SVGCircleElement, NetworkNode, NetworkNode>
  ) {
    this.svg = d3.select(svgElement);
    this.svg.selectAll('*').remove();

    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        this.svg.select('g').attr('transform', event.transform);
      });

    this.svg.call(zoom);

    // Create main container
    this.svg.append('g');

    // Initialize renderers
    this.linkRenderer = new LinkRenderer(this.svg);
    this.nodeRenderer = new NodeRenderer(
      this.svg,
      onNodeClick,
      onNodeMouseOver,
      onNodeMouseOut,
      createDragBehavior
    );
    this.labelRenderer = new LabelRenderer(this.svg);
  }

  render(
    data: { nodes: NetworkNode[]; links: NetworkLink[] },
    centralToken: string,
    linkMode: LinkMode
  ) {
    const { filteredNodes, filteredLinks } = filterNetworkData(data, centralToken);

    this.linkRenderer.render(filteredLinks, linkMode, filteredNodes);
    this.nodeRenderer.render(filteredNodes);
    this.labelRenderer.render(filteredNodes);

    return { filteredNodes, filteredLinks };
  }

  updatePositions(nodes: NetworkNode[], links: NetworkLink[]) {
    this.linkRenderer.updatePositions(links, nodes);
    this.nodeRenderer.updatePositions(nodes);
    this.labelRenderer.updatePositions(nodes);
  }

  updateLinkMode(links: NetworkLink[], mode: LinkMode) {
    this.linkRenderer.render(links, mode, []);
  }

  destroy() {
    this.linkRenderer.destroy();
    this.nodeRenderer.destroy();
    this.labelRenderer.destroy();
    this.svg.selectAll('*').remove();
  }
} 