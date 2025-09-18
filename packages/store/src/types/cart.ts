export interface CartItem {
  _id: string;
  productName: string;
  price: number;
  quantity: number;
  productImage?: string;
  vendorId: string;
  supplierName?: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}