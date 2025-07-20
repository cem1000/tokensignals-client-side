import { useState, useEffect } from 'react';
import { tokenImageService } from '../../../services/tokenImages';

export function useTokenImages(symbols: string[]) {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isResolved, setIsResolved] = useState(true); // Start as resolved

  useEffect(() => {
    if (symbols.length === 0) {
      setIsResolved(true);
      return;
    }

    const fetchImages = async () => {
      setIsLoading(true);
      setIsResolved(false);
      setLoadingProgress(0);
      
      try {
        // Track progress as images load
        const progressCallback = (loaded: number, total: number) => {
          setLoadingProgress((loaded / total) * 100);
        };
        
        const images = await tokenImageService.fetchTokenImages(symbols, progressCallback);
        setImageUrls(images);
        setLoadingProgress(100);
      } catch (error) {
        console.warn('Failed to fetch token images:', error);
        setLoadingProgress(100); // Mark as complete even on error
      } finally {
        setIsLoading(false);
        setIsResolved(true);
      }
    };

    fetchImages();
  }, [symbols.join(',')]);

  const getImageUrl = (symbol: string): string | null => {
    return imageUrls[symbol] || null;
  };

  return { 
    imageUrls, 
    isLoading, 
    isResolved,
    loadingProgress,
    getImageUrl 
  };
} 