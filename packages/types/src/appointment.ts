export type AppointmentStatus =
  | 'temp-locked'
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'partially-completed'
  | 'completed without payment'
  | 'cancelled'
  | 'no_show';

export interface ServiceItem {
  service: string;
  serviceName: string;
  staff: string;
  staffName: string;
  startTime: string;
  endTime: string;
  duration: number;
  amount: number;
  _id?: string;
  addOns?: Array<{
    _id: string;
    name: string;
    price: number;
    duration: number;
    [key: string]: any;
  }>;
}

export interface Appointment {
  id?: string;
  _id?: string;
  client: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  service: string;
  serviceName: string;
  services?: ServiceItem[];  // Multiple services
  staff: string;  // This should be a MongoDB ObjectId
  staffName: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  duration: number;
  notes: string;
  status: AppointmentStatus;
  amount: number;
  tax: number;
  totalAmount: number;
  paymentStatus?: string;
  mode?: 'online' | 'offline'; // Booking mode
  createdAt?: string;
  updatedAt?: string;
  serviceItems?: ServiceItem[];
  paymentMethod?: string;
  platformFee?: number;
  serviceTax?: number;
  discountAmount?: number;
  discount?: number;
  taxRate?: number;
  finalAmount?: number;
  isHomeService?: boolean;
  isWeddingService?: boolean;
  homeServiceLocation?: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };
  weddingPackageDetails?: {
    packageId?: string;
    packageName?: string;
    totalAmount?: number;
    totalDuration?: number;
    venueAddress?: string;
    packageServices?: Array<{
      serviceId: string;
      serviceName: string;
      _id?: string;
    }>;
    teamMembers?: string[];
  };
  payment?: {
    paid?: number;
    paymentMode?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    [key: string]: any;
  };
  addOns?: Array<{
    _id: string;
    name: string;
    price: number;
    duration: number;
    [key: string]: any;
  }>;
}