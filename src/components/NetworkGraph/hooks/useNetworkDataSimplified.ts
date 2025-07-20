import { useEffect, useState, useMemo } from 'react';
import { 
  filterNetworkDataByVolume, 
  filterLinksByMode, 
  filterNodesByLinks, 
  getCentralTokenBuySellStats 
} from '../utils/networkUtils';
import { authService } from '../../../services/auth';
import { useTokenImages } from './useTokenImages';

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
        console.log('API response type:', typeof res);
        console.log('API response keys:', Object.keys(res || {}));
        console.log('API response nodes length:', res?.nodes?.length);
        console.log('API response links length:', res?.links?.length);
        setRawData(res);
        setIsLoading(false);
      } catch (e: any) {
        setError(e.message || 'Error fetching data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [centralToken, limit, relativeTime]);

  // Extract token symbols for image fetching (only when data is loaded)
  const tokenSymbols = useMemo(() => {
    if (!rawData?.nodes || !rawData.nodes.length) return [];
    return rawData.nodes.map((node: any) => node.symbol || node.id).filter(Boolean);
  }, [rawData]);

  // Fetch token images (only when we have symbols)
  const { getImageUrl, isResolved, loadingProgress } = useTokenImages(tokenSymbols.length > 0 ? tokenSymbols : []);

  const { filteredNodes, filteredLinks, centralBuySell } = useMemo(() => {
    console.log('=== PROCESSING NETWORK DATA ===');
    console.log('hasRawData:', !!rawData);
    console.log('rawDataKeys:', rawData ? Object.keys(rawData) : []);
    console.log('rawDataNodesLength:', rawData?.nodes?.length);
    console.log('rawDataLinksLength:', rawData?.links?.length);
    console.log('linkFilter:', linkFilter);
    console.log('rawDataNodes sample:', rawData?.nodes?.slice(0, 2));
    console.log('rawDataLinks sample:', rawData?.links?.slice(0, 2));

    if (!rawData) {
      return { filteredNodes: [], filteredLinks: [], centralBuySell: { buyPct: 0, sellPct: 0 } };
    }

    const modeFilteredLinks = filterLinksByMode(rawData.links, linkFilter);
    const connectedNodes = filterNodesByLinks(rawData.nodes, modeFilteredLinks);
    const buySellStats = getCentralTokenBuySellStats(modeFilteredLinks);

    console.log('=== FILTERED DATA ===');
    console.log('nodesCount:', connectedNodes.length);
    console.log('linksCount:', modeFilteredLinks.length);
    console.log('filteredNodes sample:', connectedNodes.slice(0, 2));
    console.log('filteredLinks sample:', modeFilteredLinks.slice(0, 2));

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
    error,
    getImageUrl,
    isResolved,
    loadingProgress
  };
} 