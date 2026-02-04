// Types for Invoice Management

export interface BillingItem {
  itemId: string;
  itemType: 'Service' | 'Product';
  name: string;
  description: string;
  category: {
    categoryId: string;
    categoryName: string;
  };
  categoryId: string;
  categoryName: string;
  price: number;
  quantity: number;
  totalPrice: number;
  duration?: number;
  stock?: number;
  discount?: number;
  discountType?: 'flat' | 'percentage';
  staffMember?: {
    id: string;
    name: string;
  };
  id: string;
}

export interface ClientInfo {
  fullName: string;
  email: string;
  phone: string;
  profilePicture?: string;
  address: string;
}

export interface Billing {
  _id: string;
  vendorId: string;
  invoiceNumber: string;
  clientId: string;
  clientInfo: ClientInfo;
  items: BillingItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  platformFee: number;
  totalAmount: number;
  balance: number;
  paymentMethod: string;
  paymentStatus: string;
  billingType: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceData {
  invoiceNumber: string | number;
  date: string;
  time: string;
  client: any;
  status: string;
  items: any[];
  subtotal: number;
  originalSubtotal?: number;
  discount?: number;
  tax: number;
  platformFee: number;
  total: number;
  balance: number;
  paymentMethod: string | null;
}
