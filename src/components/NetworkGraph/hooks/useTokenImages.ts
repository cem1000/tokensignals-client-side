import { useState, useEffect } from 'react';
import { tokenImageService } from '../../../services/tokenImages';

export function useTokenImages(symbols: string[]) {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (symbols.length === 0) return;

    const fetchImages = async () => {
      setIsLoading(true);
      try {
        const images = await tokenImageService.fetchTokenImages(symbols);
        setImageUrls(images);
      } catch (error) {
        console.warn('Failed to fetch token images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [symbols.join(',')]);

  const getImageUrl = (symbol: string): string | null => {
    return imageUrls[symbol] || null;
  };

  return { imageUrls, isLoading, getImageUrl };
} 