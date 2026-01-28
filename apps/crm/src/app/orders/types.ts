export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  _id: string;
  orderId?: string; // Make orderId optional since ClientOrder doesn't have it
  items: OrderItem[];
  customerName?: string; 
  customerEmail?: string;
  vendorId?: string;
  supplierId?: string;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  createdAt: string;
  trackingNumber?: string;
  courier?: string;
  cancellationReason?: string; // Add cancellation reason field
  // For ClientOrder specific fields
  userId?: string; // To identify online orders
}

export interface OrdersTableProps {
  role: string;
  activeTab: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  currentItems: Order[];
  currentPage: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  filteredOrders: Order[];
  isLoadingAll: boolean;
  isErrorAny: boolean;
  handleViewDetails: (order: Order) => void;
  handleUpdateStatus: (orderId: string, status: OrderStatus) => void;
  isUpdatingStatus: boolean;
  getStatusColor: (status: OrderStatus) => string;
  getStatusIcon: (status: OrderStatus) => React.ReactNode;
  getNextStatus: (currentStatus: OrderStatus, order: Order) => OrderStatus | null;
  isOnlineOrder: (order: Order) => boolean;
}

export interface OrdersTableContentProps {
  orders: Order[];
  role: string;
  isLoadingAll: boolean;
  isErrorAny: boolean;
  handleViewDetails: (order: Order) => void;
  handleUpdateStatus: (orderId: string, status: OrderStatus) => void;
  isUpdatingStatus: boolean;
  getStatusColor: (status: OrderStatus) => string;
  getStatusIcon: (status: OrderStatus) => React.ReactNode;
  getNextStatus: (currentStatus: OrderStatus, order: Order) => OrderStatus | null;
  isOnlineOrder: (order: Order) => boolean;
}

export interface OrdersTabsProps {
  role: string;
  activeTab: string;
  setActiveTab: (value: string) => void;
  setCurrentPage: (page: number) => void;
  filteredOrders: Order[];
}

export interface MobileOrdersViewProps {
  orders: Order[];
  handleViewDetails: (order: Order) => void;
  handleUpdateStatus: (orderId: string, status: OrderStatus) => void;
  isUpdatingStatus: boolean;
  getStatusColor: (status: OrderStatus) => string;
  getStatusIcon: (status: OrderStatus) => React.ReactNode;
  getNextStatus: (currentStatus: OrderStatus, order: Order) => OrderStatus | null;
  isOnlineOrder: (order: Order) => boolean;
  role: string;
}