import * as d3 from 'd3';
import type { NetworkNode } from '../../../types';

export class LabelRenderer {
  private container: d3.Selection<SVGGElement, unknown, null, undefined>;

  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    this.container = svg.append('g');
  }

  render(nodes: NetworkNode[]) {
    const labelSelection = this.container.selectAll<SVGTextElement, NetworkNode>('text')
      .data(nodes, (d: NetworkNode) => d.id);

    labelSelection.exit().remove();

    labelSelection.enter().append('text')
      .attr('class', 'label')
      .text((d: NetworkNode) => d.id)
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none');
  }

  updatePositions(nodes: NetworkNode[]) {
    this.container.selectAll<SVGTextElement, NetworkNode>('text')
      .data(nodes)
      .join('text')
      .attr('x', (d: NetworkNode) => (d.x ?? 0) + 20)
      .attr('y', (d: NetworkNode) => (d.y ?? 0) + 5);
  }

  destroy() {
    this.container.remove();
  }
} 