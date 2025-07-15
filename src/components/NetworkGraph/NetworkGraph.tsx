import { useRef, useState } from 'react';
import { LoadingSpinner, ErrorMessage } from '../UI';
import { NetworkGraphContainer } from './NetworkGraphContainer';
import { NetworkFilters } from './NetworkFilters';
import { NetworkControls } from './NetworkControls';
import { useNetworkTooltip } from './hooks/useNetworkTooltip';
import { useNetworkGraph } from './hooks/useNetworkGraph';
import { useNetworkDataSimplified } from './hooks/useNetworkDataSimplified';
import { LinkModeFilter } from './LinkModeFilter';
import type { NetworkGraphProps } from './types/networkGraph';

export const NetworkGraph = ({ centralToken, onNodeClick }: NetworkGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [window, setWindow] = useState<'24h' | '1h'>('24h');
  const [limit, setLimit] = useState<number>(25);
  const [minVolumeIdx, setMinVolumeIdx] = useState<number>(0);
  const [linkFilter, setLinkFilter] = useState<'all' | 'buy' | 'sell'>('all');
  
  const { showTooltip, hideTooltip, destroyTooltip } = useNetworkTooltip();
  
  const {
    filteredNodes,
    filteredLinks,
    window: dataWindow,
    isLoading,
    error
  } = useNetworkDataSimplified(centralToken, window, limit, minVolumeIdx, linkFilter);

  useNetworkGraph({
    svgRef,
    filteredNodes,
    filteredLinks,
    centralToken,
    window: dataWindow,
    onNodeClick,
    showTooltip,
    hideTooltip,
    destroyTooltip
  });

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
        window={window}
        onWindowChange={setWindow}
      />
      <LinkModeFilter value={linkFilter} onChange={setLinkFilter} />
      <div className="flex">
        <div className="text-left text-blue-400 font-semibold text-lg px-4 py-2">
          {centralToken}
        </div>
      </div>
      <NetworkGraphContainer centralToken={centralToken}>
        <svg key={`${centralToken}-${window}`} ref={svgRef} width={1600} height={1000} />
      </NetworkGraphContainer>
    </div>
  );
}; 