import * as d3 from 'd3';
import type { NetworkNode } from '../../../types';
import { getNodeRadius, getNodeFill } from '../utils/networkScales';

export class NodeRenderer {
  private container: d3.Selection<SVGGElement, unknown, null, undefined>;
  private onNodeClick: (event: MouseEvent, node: NetworkNode) => void;
  private onNodeMouseOver: (event: MouseEvent, node: NetworkNode) => void;
  private onNodeMouseOut: () => void;
  private createDragBehavior: () => d3.DragBehavior<SVGCircleElement, NetworkNode, NetworkNode>;

  constructor(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    onNodeClick: (event: MouseEvent, node: NetworkNode) => void,
    onNodeMouseOver: (event: MouseEvent, node: NetworkNode) => void,
    onNodeMouseOut: () => void,
    createDragBehavior: () => d3.DragBehavior<SVGCircleElement, NetworkNode, NetworkNode>
  ) {
    this.container = svg.append('g');
    this.onNodeClick = onNodeClick;
    this.onNodeMouseOver = onNodeMouseOver;
    this.onNodeMouseOut = onNodeMouseOut;
    this.createDragBehavior = createDragBehavior;
  }

  render(nodes: NetworkNode[]) {
    const nodeSelection = this.container.selectAll<SVGCircleElement, NetworkNode>('circle')
      .data(nodes, (d: NetworkNode) => d.id);

    nodeSelection.exit().remove();

    nodeSelection.enter().append('circle')
      .attr('class', 'node')
      .attr('r', (d: NetworkNode) => getNodeRadius(d))
      .attr('fill', (d: NetworkNode) => getNodeFill(d))
      .style('cursor', 'pointer')
      .on('click', this.onNodeClick)
      .on('mouseover', this.onNodeMouseOver)
      .on('mouseout', this.onNodeMouseOut)
      .call(this.createDragBehavior());
  }

  updatePositions(nodes: NetworkNode[]) {
    this.container.selectAll<SVGCircleElement, NetworkNode>('circle')
      .data(nodes)
      .join('circle')
      .attr('cx', (d: NetworkNode) => d.x ?? 0)
      .attr('cy', (d: NetworkNode) => d.y ?? 0);
  }

  destroy() {
    this.container.remove();
  }
} 