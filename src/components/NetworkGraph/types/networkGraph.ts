export type LinkMode = 'inflow' | 'outflow';

export interface NetworkGraphProps {
  centralToken: string;
  onNodeClick: (token: string) => void;
}

export interface NetworkControlsProps {
  linkMode: LinkMode;
  onModeChange: (mode: LinkMode) => void;
}

export interface NetworkRendererProps {
  data: any;
  linkMode: LinkMode;
  onNodeClick: (token: string) => void;
}

export interface NetworkGraphContainerProps {
  children: React.ReactNode;
  centralToken: string;
}

export interface LinkStyle {
  stroke: string;
  strokeWidth: number;
  opacity: number;
}

export interface NodeStyle {
  radius: number;
  fill: string;
  cursor: string;
}

export interface TooltipData {
  node: any;
  connectedLinks: any[];
} 