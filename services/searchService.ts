
export interface RealProductData {
  price: number;
  url: string;
  imageUrl: string;
  isAvailable: boolean;
  statusText: string;
  isManualFallback: boolean;
  isSearching: boolean;
}

/**
 * Retorna os dados do link de forma imediata sem tentar fazer scraping,
 * já que a Shopee bloqueia bots de forma agressiva.
 */
export async function scrapeProductUrl(url: string): Promise<RealProductData> {
  // Retorno imediato para não deixar o convidado esperando
  return {
    price: 0,
    url: url,
    imageUrl: '', 
    isAvailable: true,
    statusText: 'Link Direto',
    isManualFallback: true,
    isSearching: false
  };
}
