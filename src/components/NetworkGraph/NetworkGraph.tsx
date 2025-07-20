import { useRef, useState } from 'react';
import { LoadingSpinner, ErrorMessage } from '../UI';
import { NetworkGraphContainer } from './NetworkGraphContainer';
import { NetworkFilters } from './NetworkFilters';
import { RelativeTimeFilter } from './RelativeTimeFilter';
import { useNetworkTooltip } from './hooks/useNetworkTooltip';
import { useNetworkGraph } from './hooks/useNetworkGraph';
import { useNetworkDataSimplified } from './hooks/useNetworkDataSimplified';
import { LinkModeFilter } from './LinkModeFilter';
import { Breadcrumb } from '../UI/Breadcrumb';
import type { NetworkGraphProps } from './types/networkGraph';

interface NetworkGraphWithBreadcrumbProps extends NetworkGraphProps {
  navigationPath: string[];
  currentToken: string;
  onTokenClick: (token: string) => void;
}

export const NetworkGraph = ({ centralToken, onNodeClick, navigationPath, currentToken, onTokenClick }: NetworkGraphWithBreadcrumbProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [limit, setLimit] = useState<number>(25);
  const [relativeTime, setRelativeTime] = useState<number>(60); // default 1h
  const [linkFilter, setLinkFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const { showTooltip, hideTooltip, destroyTooltip } = useNetworkTooltip();
  const {
    filteredNodes,
    filteredLinks,
    isLoading,
    error,
    getImageUrl
  } = useNetworkDataSimplified(centralToken, limit, relativeTime, linkFilter);

  useNetworkGraph({
    svgRef,
    filteredNodes,
    filteredLinks,
    centralToken,
    onNodeClick,
    showTooltip,
    hideTooltip,
    destroyTooltip,
    getImageUrl
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      {/* Professional header bar: filters left, breadcrumb absolutely centered, right empty for symmetry */}
      <div className="w-full relative flex flex-row items-center bg-gray-900 border-b border-gray-800 rounded-t px-8 py-4 mt-4" style={{minHeight: '64px'}}>
        {/* Filters left, perfectly aligned */}
        <div className="flex flex-row items-center gap-6">
          <NetworkFilters
            limit={limit}
            onLimitChange={setLimit}
          />
          <RelativeTimeFilter
            value={relativeTime}
            onChange={setRelativeTime}
          />
        </div>
        {/* Breadcrumb absolutely centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Breadcrumb path={navigationPath} currentToken={currentToken} onTokenClick={onTokenClick} />
        </div>
        {/* Right empty for symmetry/future controls */}
        <div style={{ width: 120 }} />
      </div>
      {/* LinkModeFilter centered below the header bar */}
      <div className="flex justify-center mt-2">
        <LinkModeFilter value={linkFilter} onChange={setLinkFilter} />
      </div>
      <NetworkGraphContainer centralToken={centralToken}>
        <svg key={`${centralToken}-${relativeTime}`} ref={svgRef} width={1600} height={1000} />
      </NetworkGraphContainer>
    </div>
  );
}; 