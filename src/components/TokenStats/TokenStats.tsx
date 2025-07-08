import { LoadingSpinner, ErrorMessage } from '../UI';
import { formatCurrency, formatNumber } from '../../utils/formatters';

interface TokenStatsProps {
  tokenSymbol: string;
}

export const TokenStats = ({ tokenSymbol }: TokenStatsProps) => {
  return (
    <div className="flex items-center justify-center text-gray-400">
      Token stats unavailable
    </div>
  );
}; 