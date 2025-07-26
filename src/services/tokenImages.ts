import { apiService } from './auth';

interface TokenImageData {
  symbol: string;
  name: string;
  imageUrl: string;
  coingeckoId: string;
}

class TokenImageService {
  private cache = new Map<string, string>();

  async fetchTokenImages(symbols: string[], progressCallback?: (loaded: number, total: number) => void): Promise<Record<string, string>> {
    const uncachedSymbols = symbols.filter(symbol => !this.cache.has(symbol));
    
    if (uncachedSymbols.length === 0) {
      if (progressCallback) progressCallback(symbols.length, symbols.length);
      return Object.fromEntries(this.cache);
    }

    try {

      const response = await apiService.fetchData(
        `http://localhost:3000/api/tokens/images/batch?symbols=${uncachedSymbols.join(',')}`
      );
      
      if (response.success && response.data) {
        // Cache the image URLs
        Object.entries(response.data).forEach(([symbol, data]: [string, any]) => {
          if (data.imageUrl) {
            this.cache.set(symbol, data.imageUrl);
          }
        });
      }
      
      // Mark all symbols as processed (either with image or without)
      symbols.forEach((symbol, index) => {
        if (progressCallback) progressCallback(index + 1, symbols.length);
      });
      
    } catch (error) {
      // Mark all as processed even on error
      if (progressCallback) progressCallback(symbols.length, symbols.length);
    }

    return Object.fromEntries(this.cache);
  }

  getImageUrl(symbol: string): string | null {
    return this.cache.get(symbol) || null;
  }
}

export const tokenImageService = new TokenImageService(); 