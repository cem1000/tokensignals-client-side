import { useEffect, useState, useMemo } from 'react';
import { 
  filterNetworkDataByVolume, 
  filterLinksByMode, 
  filterNodesByLinks, 
  getCentralTokenBuySellStats 
} from '../utils/networkUtils';
import { authService } from '../../../services/auth';

async function fetchNetworkData(token: string, limit: number, relativeTime: number) {
  const now = Math.floor(Date.now() / 1000);
  const after = now - (relativeTime * 60);
  const endpoint = `http://localhost:3000/api/token-pairs/after/${token}/${after}?limit=${limit}`;
  console.log('Fetching:', endpoint); // <-- log endpoint
  return authService.fetchWithAuth(endpoint);
}

export function useNetworkDataSimplified(
  centralToken: string,
  limit: number,
  relativeTime: number,
  linkFilter: 'all' | 'buy' | 'sell'
) {
  const [rawData, setRawData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchNetworkData(centralToken, limit, relativeTime);
        console.log('API response:', res); // <-- log response
        setRawData(res);
        setIsLoading(false);
      } catch (e: any) {
        setError(e.message || 'Error fetching data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [centralToken, limit, relativeTime]);

  const { filteredNodes, filteredLinks, centralBuySell } = useMemo(() => {
    if (!rawData) {
      return { filteredNodes: [], filteredLinks: [], centralBuySell: { buyPct: 0, sellPct: 0 } };
    }

    const modeFilteredLinks = filterLinksByMode(rawData.links, linkFilter);
    const connectedNodes = filterNodesByLinks(rawData.nodes, modeFilteredLinks);
    const buySellStats = getCentralTokenBuySellStats(modeFilteredLinks);

    return {
      filteredNodes: connectedNodes,
      filteredLinks: modeFilteredLinks,
      centralBuySell: buySellStats
    };
  }, [rawData, linkFilter]);

  return {
    filteredNodes,
    filteredLinks,
    centralBuySell,
    isLoading,
    error
  };
} 