import * as d3 from 'd3';
import type { NetworkLink } from '../../../types';
import type { LinkMode } from '../types/networkGraph';
import { createLinkStrokeScale, getLinkColor, getLinkOpacity } from '../utils/networkScales';

export class LinkRenderer {
  private container: d3.Selection<SVGGElement, unknown, null, undefined>;

  constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) {
    this.container = svg.append('g');
  }

  render(links: NetworkLink[], mode: LinkMode, _nodes: any[]) {
    const strokeScale = createLinkStrokeScale(links, mode);

    const linkSelection = this.container.selectAll<SVGLineElement, NetworkLink>('line')
      .data(links, (d: any) => `${d.source.id || d.source}-${d.target.id || d.target}`);

    linkSelection.exit().remove();

    linkSelection.enter().append('line')
      .attr('class', 'link')
      .merge(linkSelection as any)
      .attr('stroke', (d: NetworkLink) => getLinkColor(d, mode))
      .attr('stroke-width', (d: NetworkLink) => {
        const isDominant = this.isLinkDominant(d, mode);
        return isDominant ? strokeScale(this.calculateRatio(d, mode)) : 1;
      })
      .style('opacity', (d: NetworkLink) => getLinkOpacity(d, mode));
  }

  updatePositions(links: NetworkLink[], nodes: any[]) {
    this.container.selectAll<SVGLineElement, NetworkLink>('line')
      .data(links)
      .join('line')
      .attr('x1', (d: NetworkLink) => {
        const source = typeof d.source === 'string' ? nodes.find(n => n.id === d.source) : d.source;
        return source?.x ?? 0;
      })
      .attr('y1', (d: NetworkLink) => {
        const source = typeof d.source === 'string' ? nodes.find(n => n.id === d.source) : d.source;
        return source?.y ?? 0;
      })
      .attr('x2', (d: NetworkLink) => {
        const target = typeof d.target === 'string' ? nodes.find(n => n.id === d.target) : d.target;
        return target?.x ?? 0;
      })
      .attr('y2', (d: NetworkLink) => {
        const target = typeof d.target === 'string' ? nodes.find(n => n.id === d.target) : d.target;
        return target?.y ?? 0;
      });
  }

  private isLinkDominant(link: NetworkLink, mode: LinkMode): boolean {
    const inflow = link.centralInflow ?? 0;
    const outflow = link.centralOutflow ?? 0;
    
    if (mode === 'inflow') {
      return outflow > 0 && inflow / outflow > 1;
    } else {
      return inflow > 0 && outflow / inflow > 1;
    }
  }

  private calculateRatio(link: NetworkLink, mode: LinkMode): number {
    const inflow = link.centralInflow ?? 0;
    const outflow = link.centralOutflow ?? 0;
    
    if (mode === 'inflow') {
      return outflow > 0 ? inflow / outflow : 0;
    } else {
      return inflow > 0 ? outflow / inflow : 0;
    }
  }

  destroy() {
    this.container.remove();
  }
} 