import { useEffect, useState, useMemo } from 'react';
import { 
  filterNetworkDataByVolume, 
  getMinVolumeFromIndex,
  filterLinksByMode, 
  filterNodesByLinks, 
  getCentralTokenBuySellStats 
} from '../utils/networkUtils';

function fetchNetworkData(token: string, window: '24h' | '1h', limit: number) {
  const endpoint = window === '1h'
    ? `/api/1h/token-pairs/${token}?limit=${limit}`
    : `/api/token-pairs/${token}?limit=${limit}`;
  return fetch(endpoint).then(res => res.json());
}

export function useNetworkDataSimplified(
  centralToken: string,
  window: '24h' | '1h',
  limit: number,
  minVolumeIdx: number,
  linkFilter: 'all' | 'buy' | 'sell'
) {
  const [rawData, setRawData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const minVolume = getMinVolumeFromIndex(minVolumeIdx);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchNetworkData(centralToken, window, limit)
      .then(res => {
        setRawData(res);
        setIsLoading(false);
      })
      .catch(e => {
        setError(e.message || 'Error fetching data');
        setIsLoading(false);
      });
  }, [centralToken, window, limit]);

  const { filteredNodes, filteredLinks, centralBuySell } = useMemo(() => {
    if (!rawData) {
      return { filteredNodes: [], filteredLinks: [], centralBuySell: { buyPct: 0, sellPct: 0 } };
    }

    const volumeFilteredData = filterNetworkDataByVolume(rawData, minVolume);
    const modeFilteredLinks = filterLinksByMode(volumeFilteredData.links, linkFilter);
    const connectedNodes = filterNodesByLinks(volumeFilteredData.nodes, modeFilteredLinks);
    const buySellStats = getCentralTokenBuySellStats(modeFilteredLinks);

    return {
      filteredNodes: connectedNodes,
      filteredLinks: modeFilteredLinks,
      centralBuySell: buySellStats
    };
  }, [rawData, minVolume, linkFilter]);

  return {
    filteredNodes,
    filteredLinks,
    centralBuySell,
    window, // Pass window info for scaling
    isLoading,
    error
  };
} 