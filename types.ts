export interface Gift {
  id: string;
  name: string;
  category: string;
  priceEstimate: number;
  imageUrl: string;
  shopeeUrl: string;
  status: 'available' | 'reserved';
  reservedBy?: string;
}

export interface User {
  name: string;
  isAdmin: boolean;
}

export interface CartItem {
  giftId: string;
  timestamp: number;
}