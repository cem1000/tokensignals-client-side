import { useTokenData } from '../../hooks/useTokenData';
import { LoadingSpinner, ErrorMessage } from '../UI';
import { formatCurrency, formatNumber } from '../../utils/formatters';

interface TokenStatsProps {
  tokenSymbol: string;
}

export const TokenStats = ({ tokenSymbol }: TokenStatsProps) => {
  const { data, isLoading, error } = useTokenData(tokenSymbol);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <ErrorMessage message={error.message} />
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="flex items-center justify-center text-gray-400">
        No data available for {tokenSymbol}
      </div>
    );
  }

  const token = data.data;

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-6">
        <div>
          <span className="text-gray-400">Volume:</span>
          <span className="ml-2 font-semibold">{formatCurrency(token.totalVolumeUSD)}</span>
        </div>
        <div>
          <span className="text-gray-400">Swaps:</span>
          <span className="ml-2 font-semibold">{formatNumber(token.totalSwaps)}</span>
        </div>
        <div>
          <span className="text-gray-400">Inflow:</span>
          <span className="ml-2 font-semibold text-green-400">{formatCurrency(token.totalInflowUSD)}</span>
        </div>
        <div>
          <span className="text-gray-400">Outflow:</span>
          <span className="ml-2 font-semibold text-red-400">{formatCurrency(token.totalOutflowUSD)}</span>
        </div>
      </div>
      {token.lastUpdated && (
        <div className="text-xs text-gray-400">
          Updated: {new Date(token.lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}; 